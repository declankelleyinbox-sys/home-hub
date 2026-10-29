import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

/* ------------------------------------------------------------------
   Home Hub API — one function, routed at /api/*
   Every call needs the x-hub-key header (or ?k=) to match HUB_KEY.
   Third-party keys come from env vars first, then from secrets the
   hub saved through POST /api/secrets (stored in Netlify Blobs).
------------------------------------------------------------------- */

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "cache-control": "no-store" } });

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const store = () => getStore({ name: "home-hub", consistency: "strong" });

const SECRET_NAMES = [
  "GOVEE_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "ICAL_URL",
] as const;

async function secret(name: string): Promise<string | undefined> {
  const env = Netlify.env.get(name);
  if (env) return env;
  const v = await store().get(`secret/${name}`);
  return v || undefined;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/* ---------------- OAuth (Google + Spotify) ---------------- */

const OAUTH = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET",
    scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks",
    extra: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" } as Record<string, string>,
    basicAuth: false,
  },
  spotify: {
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    id: "SPOTIFY_CLIENT_ID", secret: "SPOTIFY_CLIENT_SECRET",
    scope: "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative",
    extra: {} as Record<string, string>,
    basicAuth: true,
  },
};
type Provider = keyof typeof OAUTH;
const isProvider = (p: string): p is Provider => p === "google" || p === "spotify";
const redirectUri = (origin: string, p: Provider) => `${origin}/api/${p}/callback`;

async function oauthStart(p: Provider, url: URL) {
  const cfg = OAUTH[p];
  const clientId = await secret(cfg.id);
  if (!clientId) throw new HttpError(409, `${p} client ID is not set`);
  const state = crypto.randomUUID();
  await store().setJSON(`oauth-state/${state}`, { p, exp: Date.now() + 10 * 60_000 });
  const q = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri(url.origin, p),
    response_type: "code", scope: cfg.scope, state, ...cfg.extra,
  });
  return Response.redirect(`${cfg.authUrl}?${q}`, 302);
}

async function tokenRequest(p: Provider, params: Record<string, string>) {
  const cfg = OAUTH[p];
  const id = await secret(cfg.id), sec = await secret(cfg.secret);
  if (!id || !sec) throw new HttpError(409, `${p} client ID/secret are not set`);
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded" };
  const body = new URLSearchParams(params);
  if (cfg.basicAuth) headers.authorization = "Basic " + btoa(`${id}:${sec}`);
  else { body.set("client_id", id); body.set("client_secret", sec); }
  const r = await fetch(cfg.tokenUrl, { method: "POST", headers, body });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpError(502, `${p} token error: ${j.error_description || j.error || r.status}`);
  return j;
}

async function oauthCallback(p: Provider, url: URL) {
  const back = (msg: string) => Response.redirect(`${url.origin}/?${msg}`, 302);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code");
  if (url.searchParams.get("error")) return back(`oauth_error=${encodeURIComponent(url.searchParams.get("error")!)}`);
  const saved: any = await store().get(`oauth-state/${state}`, { type: "json" });
  if (!saved || saved.p !== p || saved.exp < Date.now() || !code) return back("oauth_error=expired");
  await store().delete(`oauth-state/${state}`);
  const t = await tokenRequest(p, { grant_type: "authorization_code", code, redirect_uri: redirectUri(url.origin, p) });
  await store().setJSON(`token/${p}`, {
    access: t.access_token, refresh: t.refresh_token, exp: Date.now() + (t.expires_in || 3600) * 1000,
  });
  return back(`connected=${p}`);
}

async function accessToken(p: Provider): Promise<string> {
  const tok: any = await store().get(`token/${p}`, { type: "json" });
  if (!tok?.refresh) throw new HttpError(409, `${p} is not connected`);
  if (tok.exp > Date.now() + 60_000) return tok.access;
  const t = await tokenRequest(p, { grant_type: "refresh_token", refresh_token: tok.refresh });
  const next = { access: t.access_token, refresh: t.refresh_token || tok.refresh, exp: Date.now() + (t.expires_in || 3600) * 1000 };
  await store().setJSON(`token/${p}`, next);
  return next.access;
}

async function authed(p: Provider, url: string, init: RequestInit = {}) {
  const token = await accessToken(p);
  const r = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers || {}) },
  });
  if (r.status === 204) return null;
  const text = await r.text();
  let j: any = null;
  try { j = text ? JSON.parse(text) : null; } catch { j = { raw: text }; }
  if (!r.ok) {
    const msg = j?.error?.message || j?.error_description || (typeof j?.error === "string" ? j.error : "") || `HTTP ${r.status}`;
    throw new HttpError(r.status === 401 ? 409 : 502, `${p}: ${msg}`);
  }
  return j;
}

/* ---------------- Google Calendar + Tasks ---------------- */

async function googleRoute(parts: string[], req: Request, url: URL) {
  const CAL = "https://www.googleapis.com/calendar/v3";
  const TASKS = "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks";

  if (parts[1] === "events") {
    const timeMin = url.searchParams.get("from") || new Date().toISOString();
    const timeMax = url.searchParams.get("to") || new Date(Date.now() + 7 * 864e5).toISOString();
    const list = await authed("google", `${CAL}/users/me/calendarList?minAccessRole=reader`);
    const cals = (list?.items || []).filter((c: any) => c.selected || c.primary).slice(0, 8);
    const results = await Promise.allSettled(cals.map(async (c: any) => {
      const q = new URLSearchParams({ timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "50" });
      const ev = await authed("google", `${CAL}/calendars/${encodeURIComponent(c.id)}/events?${q}`);
      return (ev?.items || []).filter((e: any) => e.status !== "cancelled").map((e: any) => ({
        id: e.id, title: e.summary || "(No title)", where: e.location || "",
        start: e.start?.dateTime || e.start?.date, end: e.end?.dateTime || e.end?.date,
        allDay: !!e.start?.date, color: c.backgroundColor || null,
      }));
    }));
    const events = results.flatMap(r => (r.status === "fulfilled" ? r.value : []));
    events.sort((a: any, b: any) => String(a.start).localeCompare(String(b.start)));
    return json({ events });
  }

  if (parts[1] === "tasks") {
    const id = parts[2];
    if (req.method === "GET") {
      const t = await authed("google", `${TASKS}?showCompleted=true&showHidden=true&maxResults=100`);
      const tasks = (t?.items || []).filter((x: any) => x.title).map((x: any) => ({
        id: x.id, title: x.title, done: x.status === "completed", due: x.due || null, completed: x.completed || null,
      }));
      return json({ tasks });
    }
    if (req.method === "POST") {
      const { title } = await req.json();
      const t = await authed("google", TASKS, { method: "POST", body: JSON.stringify({ title: String(title).slice(0, 200) }) });
      return json({ task: { id: t.id, title: t.title, done: false } });
    }
    if (req.method === "PATCH" && id) {
      const { done } = await req.json();
      const body = done ? { status: "completed" } : { status: "needsAction", completed: null };
      await authed("google", `${TASKS}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) });
      return json({ ok: true });
    }
    if (req.method === "DELETE" && id) {
      await authed("google", `${TASKS}/${encodeURIComponent(id)}`, { method: "DELETE" });
      return json({ ok: true });
    }
  }
  throw new HttpError(404, "Unknown Google route");
}

/* ---------------- Spotify ---------------- */

async function spotifyRoute(parts: string[], req: Request) {
  const API = "https://api.spotify.com/v1";
  if (parts[1] === "player") {
    const p = await authed("spotify", `${API}/me/player?additional_types=episode`);
    if (!p) return json({ active: false });
    const item = p.item || {};
    const images = item.album?.images || item.images || item.show?.images || [];
    return json({
      active: true, playing: !!p.is_playing, progress: p.progress_ms || 0, duration: item.duration_ms || 0,
      title: item.name || "", artist: (item.artists || []).map((a: any) => a.name).join(", ") || item.show?.name || "",
      album: item.album?.name || "", art: images[0]?.url || null, shuffle: !!p.shuffle_state,
      device: p.device ? { id: p.device.id, name: p.device.name, volume: p.device.volume_percent, type: p.device.type } : null,
    });
  }
  if (parts[1] === "devices") {
    const d = await authed("spotify", `${API}/me/player/devices`);
    return json({ devices: (d?.devices || []).map((x: any) => ({ id: x.id, name: x.name, type: x.type, active: x.is_active })) });
  }
  if (parts[1] === "playlists") {
    const d = await authed("spotify", `${API}/me/playlists?limit=30`);
    return json({ playlists: (d?.items || []).filter(Boolean).map((x: any) => ({ name: x.name, uri: x.uri, art: x.images?.[x.images.length - 1]?.url || x.images?.[0]?.url || null })) });
  }
  if (parts[1] === "cmd" && req.method === "POST") {
    const { cmd, value, device } = await req.json();
    const dq = device ? `device_id=${encodeURIComponent(device)}` : "";
    const go = (method: string, path: string, body?: unknown) =>
      authed("spotify", `${API}${path}`, { method, body: body === undefined ? undefined : JSON.stringify(body) });
    switch (cmd) {
      case "play": await go("PUT", `/me/player/play${dq ? "?" + dq : ""}`, value ? { context_uri: value } : undefined); break;
      case "pause": await go("PUT", "/me/player/pause"); break;
      case "next": await go("POST", "/me/player/next"); break;
      case "previous": await go("POST", "/me/player/previous"); break;
      case "volume": await go("PUT", `/me/player/volume?volume_percent=${Math.max(0, Math.min(100, Math.round(value)))}`); break;
      case "shuffle": await go("PUT", `/me/player/shuffle?state=${value ? "true" : "false"}`); break;
      case "seek": await go("PUT", `/me/player/seek?position_ms=${Math.max(0, Math.round(value))}`); break;
      case "transfer": await go("PUT", "/me/player", { device_ids: [value], play: true }); break;
      default: throw new HttpError(400, "Unknown command");
    }
    return json({ ok: true });
  }
  throw new HttpError(404, "Unknown Spotify route");
}

/* ---------------- Govee ---------------- */

const GOVEE = "https://openapi.api.govee.com/router/api/v1";

async function govee(path: string, payload?: unknown) {
  const key = await secret("GOVEE_API_KEY");
  if (!key) throw new HttpError(409, "Govee API key is not set");
  const r = await fetch(GOVEE + path, {
    method: payload ? "POST" : "GET",
    headers: { "Govee-API-Key": key, "content-type": "application/json" },
    body: payload ? JSON.stringify({ requestId: crypto.randomUUID(), payload }) : undefined,
  });
  const j: any = await r.json().catch(() => ({}));
  if (r.status === 429) throw new HttpError(429, "Govee rate limit — try again in a minute");
  if (!r.ok || (j.code && j.code !== 200)) throw new HttpError(502, `Govee: ${j.message || j.msg || r.status}`);
  return j;
}

function summarizeCaps(capabilities: any[] = []) {
  const caps: any = { power: false, bri: null, rgb: false, temp: null, scenes: false, diy: false, music: null };
  for (const c of capabilities) {
    const t = String(c.type || ""), i = c.instance;
    if (i === "powerSwitch") caps.power = true;
    else if (i === "brightness") caps.bri = [c.parameters?.range?.min ?? 1, c.parameters?.range?.max ?? 100];
    else if (i === "colorRgb") caps.rgb = true;
    else if (i === "colorTemperatureK") caps.temp = [c.parameters?.range?.min ?? 2000, c.parameters?.range?.max ?? 9000];
    else if (i === "lightScene") caps.scenes = true;
    else if (i === "diyScene") caps.diy = true;
    else if (i === "musicMode" && t.includes("music")) {
      const f = (c.parameters?.fields || []).find((x: any) => x.fieldName === "musicMode");
      caps.music = (f?.options || []).map((o: any) => ({ name: o.name, value: o.value }));
    }
  }
  return caps;
}

async function goveeRoute(parts: string[], req: Request) {
  if (parts[1] === "devices") {
    const j = await govee("/user/devices");
    const devices = (j.data || [])
      .filter((d: any) => String(d.type || "").includes("light"))
      .map((d: any) => ({ sku: d.sku, device: d.device, name: d.deviceName || d.sku, caps: summarizeCaps(d.capabilities) }));
    return json({ devices });
  }
  const body = req.method === "POST" ? await req.json() : {};
  const { sku, device } = body;
  if (!sku || !device) throw new HttpError(400, "sku and device are required");

  if (parts[1] === "control") {
    const { type, instance, value } = body;
    await govee("/device/control", { sku, device, capability: { type, instance, value } });
    return json({ ok: true });
  }
  if (parts[1] === "state") {
    const j = await govee("/device/state", { sku, device });
    const st: any = {};
    for (const c of j.payload?.capabilities || []) {
      const v = c.state?.value;
      if (c.instance === "online") st.online = !!v;
      if (c.instance === "powerSwitch") st.on = v === 1;
      if (c.instance === "brightness" && typeof v === "number") st.bri = v;
      if (c.instance === "colorRgb" && typeof v === "number" && v > 0) st.rgb = v;
      if (c.instance === "colorTemperatureK" && typeof v === "number" && v > 0) st.k = v;
    }
    return json(st);
  }
  if (parts[1] === "scenes") {
    const [a, b] = await Promise.allSettled([
      govee("/device/scenes", { sku, device }),
      govee("/device/diy-scenes", { sku, device }),
    ]);
    const opts = (r: PromiseSettledResult<any>) =>
      r.status === "fulfilled" ? (r.value.payload?.capabilities || []).flatMap((c: any) => c.parameters?.options || []) : [];
    return json({
      scenes: opts(a).map((o: any) => ({ name: o.name, value: o.value })),
      diy: opts(b).map((o: any) => ({ name: o.name, value: o.value })),
    });
  }
  throw new HttpError(404, "Unknown Govee route");
}

/* ---------------- Brightspace / any iCal feed ---------------- */

function icsDate(v: string, params: string) {
  // 20261030 or 20261030T235900Z or 20261030T235900 (floating/TZID → local to the tablet)
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h) return { iso: `${y}-${mo}-${d}`, allDay: true };
  if (z) return { iso: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)).toISOString(), allDay: false };
  return { iso: `${y}-${mo}-${d}T${h}:${mi}:${s}`, allDay: false, floating: true, tz: (params.match(/TZID=([^;:]+)/) || [])[1] || null };
}
const unescapeIcs = (s: string) => s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();

async function dueRoute() {
  const feed = await secret("ICAL_URL");
  if (!feed) throw new HttpError(409, "Brightspace calendar URL is not set");
  const r = await fetch(feed.replace(/^webcal:/i, "https:"));
  if (!r.ok) throw new HttpError(502, `Calendar feed returned ${r.status}`);
  const text = (await r.text()).replace(/\r?\n[ \t]/g, "");
  const items: any[] = [];
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const body = block.split("END:VEVENT")[0];
    const ev: any = {};
    for (const line of body.split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const [name, ...params] = line.slice(0, idx).split(";");
      const val = line.slice(idx + 1);
      if (name === "SUMMARY") ev.title = unescapeIcs(val);
      else if (name === "LOCATION") ev.where = unescapeIcs(val);
      else if (name === "DTSTART") ev.start = icsDate(val.trim(), params.join(";"));
      else if (name === "DTEND") ev.end = icsDate(val.trim(), params.join(";"));
      else if (name === "UID") ev.id = val.trim();
    }
    if (ev.title && ev.start) items.push({ id: ev.id, title: ev.title, where: ev.where || "", start: ev.start.iso, allDay: ev.start.allDay, end: ev.end?.iso || null });
  }
  const from = Date.now() - 2 * 864e5, to = Date.now() + 30 * 864e5;
  const inRange = items.filter(i => { const t = Date.parse(i.start); return !isNaN(t) && t >= from && t <= to; });
  inRange.sort((a, b) => String(a.start).localeCompare(String(b.start)));
  return json({ items: inRange.slice(0, 40) });
}

/* ---------------- router ---------------- */

export default async (req: Request, _ctx: Context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  try {
    if (isProvider(parts[0]) && parts[1] === "callback") return await oauthCallback(parts[0], url);

    const hubKey = Netlify.env.get("HUB_KEY");
    if (!hubKey) return json({ error: "HUB_KEY is not set on the server" }, 500);
    const given = req.headers.get("x-hub-key") || url.searchParams.get("k") || "";
    if (!safeEqual(given, hubKey)) return json({ error: "Wrong hub key" }, 401);

    if (isProvider(parts[0]) && parts[1] === "auth") return await oauthStart(parts[0], url);

    switch (parts[0]) {
      case "status": {
        const has = async (n: string) => !!(await secret(n));
        const tok = async (p: Provider) => !!((await store().get(`token/${p}`, { type: "json" })) as any)?.refresh;
        return json({
          ok: true,
          govee: await has("GOVEE_API_KEY"),
          googleApp: (await has("GOOGLE_CLIENT_ID")) && (await has("GOOGLE_CLIENT_SECRET")),
          google: await tok("google"),
          spotifyApp: (await has("SPOTIFY_CLIENT_ID")) && (await has("SPOTIFY_CLIENT_SECRET")),
          spotify: await tok("spotify"),
          ical: await has("ICAL_URL"),
          redirects: { google: redirectUri(url.origin, "google"), spotify: redirectUri(url.origin, "spotify") },
        });
      }
      case "secrets": {
        if (req.method !== "POST") throw new HttpError(405, "POST only");
        const body = await req.json();
        const saved: string[] = [];
        for (const n of SECRET_NAMES) {
          if (typeof body[n] !== "string") continue;
          const v = body[n].trim();
          if (v) await store().set(`secret/${n}`, v); else await store().delete(`secret/${n}`);
          saved.push(n);
        }
        return json({ saved });
      }
      case "disconnect": {
        if (isProvider(parts[1])) await store().delete(`token/${parts[1]}`);
        return json({ ok: true });
      }
      case "govee": return await goveeRoute(parts, req);
      case "google": return await googleRoute(parts, req, url);
      case "spotify": return await spotifyRoute(parts, req);
      case "due": return await dueRoute();
    }
    return json({ error: "Not found" }, 404);
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, e instanceof HttpError ? e.status : 500);
  }
};

export const config: Config = { path: "/api/*" };

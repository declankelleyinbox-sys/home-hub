'use strict';
/* =====================================================================
   HOME HUB — Fire tablet dashboard
   Talks to /api/* (Netlify function) for Govee, Google, Spotify and
   Brightspace. Everything else lives on the tablet (localStorage).
   ===================================================================== */

/* ---------------- icons ---------------- */
const P = {
  moon:'<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  leaf:'<path d="M5 19C5 11 10 5 20 4c-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>',
  movie:'<rect x="3.5" y="9.5" width="17" height="10.5" rx="1.5"/><path d="M3.6 9.4L18.8 5l.7 2.4L4.3 11.8"/><path d="M8.2 8l2 2.4M13 6.6l2 2.4"/>',
  power:'<path d="M12 3v8"/><path d="M6.6 6.6a7.5 7.5 0 1 0 10.8 0"/>',
  home:'<path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
  bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  checkbox:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12.3l2.8 2.8L16.5 9"/>',
  check:'<path d="M5.5 12.5l4.2 4.2L18.5 8"/>',
  minus:'<path d="M6 12h12"/>', plus:'<path d="M12 6v12M6 12h12"/>',
  chev:'<path d="M9.5 6l6 6-6 6"/>', up:'<path d="M6 15l6-6 6 6"/>', down:'<path d="M6 9l6 6 6-6"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  desk:'<path d="M4 20.5h9"/><path d="M8.5 20.5v-1.5l2-6.5 4.5-3.5"/><path d="M13.6 5l6.2 3.6-1.5 2.6-6.2-3.6z"/><circle cx="10.6" cy="12.4" r="1.1"/>',
  bedside:'<path d="M8 3.5h8l3 7H5z"/><path d="M12 10.5v9M8 20.5h8"/>',
  ceiling:'<ellipse cx="12" cy="10" rx="9" ry="3.4"/><path d="M3 10v2.4c0 1.9 4 3.4 9 3.4s9-1.5 9-3.4V10"/>',
  panels:'<rect x="3.5" y="4" width="4.5" height="16" rx="1"/><rect x="9.75" y="4" width="4.5" height="16" rx="1"/><rect x="16" y="4" width="4.5" height="16" rx="1"/>',
  strip:'<rect x="2.5" y="9.5" width="19" height="5" rx="2.5"/><path d="M6.5 12h.01M10.2 12h.01M13.8 12h.01M17.5 12h.01" stroke-width="2.6"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  clock:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2M4.5 4.5l3-2.5M19.5 4.5l-3-2.5"/>',
  pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  play:'<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  pause:'<rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  next:'<path d="M5.5 5.5v13l9-6.5z" fill="currentColor"/><path d="M18 5.5v13" stroke-width="2.2"/>',
  prev:'<path d="M18.5 5.5v13l-9-6.5z" fill="currentColor"/><path d="M6 5.5v13" stroke-width="2.2"/>',
  shuffle:'<path d="M3 7h3.5c2 0 3.2 1 4.3 2.8l2.4 4.4c1.1 1.8 2.3 2.8 4.3 2.8H21M18 14l3 3-3 3M3 17h3.5c1.2 0 2.1-.4 2.9-1.1M13.6 8.1c.8-.7 1.7-1.1 2.9-1.1H21M18 4l3 3-3 3"/>',
  vol:'<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  speaker:'<rect x="6" y="3" width="12" height="18" rx="2.5"/><circle cx="12" cy="14" r="3.2"/><path d="M12 7h.01" stroke-width="2.4"/>',
  trash:'<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
  undo:'<path d="M9 7L4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>',
  eraser:'<path d="M8 20h12"/><path d="M5.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L13 18H8z"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
  school:'<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v5c1.5 1.5 3.4 2 5.5 2s4-.5 5.5-2v-5"/>'
};
const ic = (n, s = 24) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${n === 'check' ? 2.4 : 1.75}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.bulb}</svg>`;
const fillIcons = (root = document) => root.querySelectorAll('[data-i]').forEach(el => {
  el.outerHTML = ic(el.dataset.i, +el.dataset.s || 24, +el.dataset.w || 1.7);
});

/* weather icons */
const SUN = '<circle cx="12" cy="12" r="4.3" fill="#FFCB45" stroke="#F4A51C" stroke-width="1.5"/><path d="M12 2.8V5M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6" stroke="#F4A51C" stroke-width="1.6" stroke-linecap="round"/>';
const CLOUD = '<path d="M7.6 19.5h9.6a4.1 4.1 0 0 0 .5-8.15 5.6 5.6 0 0 0-10.8.2A4 4 0 0 0 7.6 19.5z" fill="#fff" stroke="#3A3946" stroke-width="1.5" stroke-linejoin="round"/>';
const MOON = '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z" fill="#F2F0FA" stroke="#3A3946" stroke-width="1.5" stroke-linejoin="round"/>';
const WX = {
  sun: SUN, moon: MOON,
  partly: `<g transform="translate(-2.5 -3.5) scale(.78)">${SUN}</g><g transform="translate(1.6 1)">${CLOUD}</g>`,
  partlyNight: `<g transform="translate(-1.5 -3) scale(.7)">${MOON}</g><g transform="translate(1.6 1)">${CLOUD}</g>`,
  cloud: `<g transform="translate(0 -1.5)">${CLOUD}</g>`,
  rain: `<g transform="translate(0 -3.5)">${CLOUD}</g><path d="M9 18.5l-1.1 2.7M12.6 18.5l-1.1 2.7M16.2 18.5l-1.1 2.7" stroke="#3B8BFF" stroke-width="1.7" stroke-linecap="round"/>`,
  snow: `<g transform="translate(0 -3.5)">${CLOUD}</g><g fill="#7FB2FF"><circle cx="8.6" cy="20" r="1.1"/><circle cx="12.2" cy="21.4" r="1.1"/><circle cx="15.8" cy="20" r="1.1"/></g>`,
  storm: `<g transform="translate(0 -3.5)">${CLOUD}</g><path d="M13 16.6l-2.4 3.4h3l-2 3.2" fill="none" stroke="#F4A51C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`
};
const wxi = (t, s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="overflow:visible" aria-hidden="true">${WX[t] || WX.cloud}</svg>`;
function wxType(code, day) {
  if (code <= 1) return day ? 'sun' : 'moon';
  if (code === 2) return day ? 'partly' : 'partlyNight';
  if (code === 3 || code === 45 || code === 48) return 'cloud';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  return 'cloud';
}
const WXTEXT = c => c === 0 ? 'Clear' : c === 1 ? 'Mostly clear' : c === 2 ? 'Partly cloudy' : c === 3 ? 'Cloudy' :
  (c === 45 || c === 48) ? 'Foggy' : c <= 57 ? 'Drizzle' : c <= 67 ? 'Rain' : c <= 77 ? 'Snow' : c <= 82 ? 'Showers' : c <= 86 ? 'Snow showers' : 'Thunderstorms';

/* ---------------- utils ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtTime = d => { let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return [h + ':' + pad(d.getMinutes()), ap]; };
const fmtT = d => fmtTime(d).join(' ');
const fmtHM = (h, m) => { const ap = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${pad(m)} ${ap}`; };
const fmtDate = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function daysText(days) {
  if (!days || !days.length) return 'Once';
  const s = [...days].sort().join('');
  if (s === '0123456') return 'Every day';
  if (s === '12345') return 'Weekdays';
  if (s === '06') return 'Weekends';
  return [...days].sort().map(d => DAYN[d]).join(', ');
}
const dayLabel = d => {
  const diff = Math.round((startOfDay(d) - startOfDay()) / 864e5);
  return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

/* colors */
const hexToRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => pad(Math.round(clamp(v, 0, 255)).toString(16))).join('').toUpperCase();
const mix = (hex, to, t) => { const a = hexToRgb(hex), b = hexToRgb(to); return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); };
function hsvToRgb(h, s, v) {
  const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, mx ? d / mx : 0, mx];
}
function kelvinHex(k) {
  const t = k / 100; let r, g, b;
  r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return rgbToHex(r, g, b);
}
const kName = k => k < 2500 ? 'Candle' : k < 3300 ? 'Warm white' : k < 4300 ? 'Neutral' : k < 5600 ? 'Daylight' : 'Cool white';
const RGB_PRESETS = [
  ['Red', '#FF3B30'], ['Orange', '#FF8A00'], ['Amber', '#FFB020'], ['Yellow', '#FFE14D'],
  ['Green', '#34C759'], ['Teal', '#2CD3C0'], ['Sky', '#3DB8FF'], ['Blue', '#3A6BFF'],
  ['Purple', '#8B5CF6'], ['Lavender', '#B39BFF'], ['Pink', '#FF5FA8'], ['Rose', '#FF8FA3']
];
const K_PRESETS = [['Candle', 2200], ['Warm', 2700], ['Soft', 3000], ['Neutral', 4000], ['Daylight', 5000], ['Cool', 6500]];
const LIGHT_ICONS = ['bulb', 'desk', 'bedside', 'ceiling', 'panels', 'strip'];

/* ---------------- state ---------------- */
const KEY = 'homeHub.v2';
const DEFAULT = () => ({
  v: 2,
  settings: { name: 'Declan', idle: 5, screenOff: 10, habitReset: 5, indoor: 72,
    loc: { label: 'Guilderland, NY', lat: 42.704, lon: -73.911 }, hubKey: '' },
  lights: [
    { id: 'desk', name: 'Desk', brand: 'Govee', icon: 'desk', provider: 'local', on: true, bri: 80, mode: 'temp', k: 3000, hex: '#FFD58F' },
    { id: 'bedside', name: 'Bedside', brand: 'WiZ', icon: 'bedside', provider: 'local', on: true, bri: 40, mode: 'rgb', k: 2700, hex: '#FF8FA3' },
    { id: 'ceiling', name: 'Ceiling', brand: 'Wyze', icon: 'ceiling', provider: 'local', on: true, bri: 65, mode: 'temp', k: 5000, hex: '#FFFFFF' },
    { id: 'wall', name: 'Wall panels', brand: 'Cololight', icon: 'panels', provider: 'local', on: true, bri: 50, mode: 'rgb', k: 4000, hex: '#B39BFF' }
  ],
  scenes: [
    { id: 'focus', label: 'Focus', icon: 'sun', rule: { on: true, bri: 100, mode: 'temp', k: 5000 }, states: null },
    { id: 'chill', label: 'Chill', icon: 'leaf', rule: { on: true, bri: 35, mode: 'temp', k: 2700 }, states: null },
    { id: 'movie', label: 'Movie', icon: 'movie', rule: { on: true, bri: 12, mode: 'rgb', hex: '#8B5CF6' }, states: null },
    { id: 'off', label: 'All Off', icon: 'power', rule: { on: false }, states: null }
  ],
  activeScene: 'focus',
  setpoint: 70,
  tasks: [
    { id: 't1', title: 'Submit lab report', done: false },
    { id: 't2', title: 'Read chapter 6', done: false },
    { id: 't3', title: 'Do laundry', done: false }
  ],
  habitDay: '',
  habits: [{ id: 'gym', label: 'Gym', done: false }, { id: 'read', label: 'Read', done: false }, { id: 'water', label: 'Water', done: false }, { id: 'study', label: 'Study', done: false }],
  timer: { dur: 25 * 60000, endAt: null, left: null },
  alarm: { h: 7, m: 0, days: [1, 2, 3, 4, 5], on: false, sunrise: true, sunMin: 15, last: '' },
  schedules: [
    { id: 's1', h: 22, m: 30, days: [0, 1, 2, 3, 4, 5, 6], action: 'scene:chill', on: false, last: '' }
  ],
  notes: [],
  calView: 'schedule'
});
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || S.v !== 2) S = DEFAULT();
{ const d = DEFAULT(); for (const k in d) if (S[k] === undefined) S[k] = d[k]; for (const k in d.settings) if (S.settings[k] === undefined) S.settings[k] = d.settings[k]; }
let saveT;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150); };
const saveNow = () => { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
addEventListener('pagehide', saveNow);

/* ---------------- server ---------------- */
let ST = { ok: false };   // server status
const API = {
  async req(method, path, body) {
    if (!S.settings.hubKey) throw new Error('Add your hub key in Settings');
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch('/api/' + path, {
        method, signal: ctl.signal,
        headers: Object.assign({ 'x-hub-key': S.settings.hubKey }, body ? { 'content-type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || ('Server error ' + r.status));
      return j;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('The server took too long to answer');
      throw e;
    } finally { clearTimeout(to); }
  },
  get(p) { return this.req('GET', p); },
  post(p, b) { return this.req('POST', p, b || {}); },
  patch(p, b) { return this.req('PATCH', p, b || {}); },
  del(p) { return this.req('DELETE', p); }
};
async function checkStatus() {
  try { ST = await API.get('status'); } catch (e) { ST = { ok: false, error: e.message }; }
  if ($('#settings').classList.contains('on')) renderSettings();
  return ST;
}

/* ---------------- Fire app bridge (WiZ / Cololight / backlight) ---------------- */
const NAT = (() => {
  const h = window.HubNative;
  if (!h || !h.version || !h.version()) return null;
  const cbs = {}; let n = 0;
  window.__hubCb = (id, json) => { const f = cbs[id]; delete cbs[id]; if (f) { try { f(JSON.parse(json)); } catch (e) { f({ ok: false, error: 'bad reply' }); } } };
  const call = (fn, args, ms) => new Promise(res => {
    const id = ++n; cbs[id] = res;
    try { h[fn](...args, id); } catch (e) { delete cbs[id]; res({ ok: false, error: e.message }); return; }
    setTimeout(() => { if (cbs[id]) { delete cbs[id]; res({ ok: false, error: 'No answer' }); } }, ms);
  });
  return {
    udp: (host, port, payload, hex, timeout) => call('udp', [host, port, payload, !!hex, timeout || 0], (timeout || 0) + 3000),
    broadcast: (port, payload, hex, wait) => call('broadcast', [port, payload, !!hex, wait], wait + 4000),
    bright: v => { try { h.setBrightness(v); } catch (e) {} },
    settings: () => { try { h.openSystemSettings(); } catch (e) {} },
    reload: () => { try { h.reload(); } catch (e) {} }
  };
})();

/* WiZ: JSON over UDP 38899 */
const WIZ_SCENES = ['Ocean', 'Romance', 'Sunset', 'Party', 'Fireplace', 'Cozy', 'Forest', 'Pastel colors', 'Wake up', 'Bedtime', 'Warm white', 'Daylight',
  'Cool white', 'Night light', 'Focus', 'Relax', 'True colors', 'TV time', 'Plant growth', 'Spring', 'Summer', 'Fall', 'Deep dive', 'Jungle', 'Mojito',
  'Club', 'Christmas', 'Halloween', 'Candlelight', 'Golden white', 'Pulse', 'Steampunk'].map((name, i) => ({ name, value: i + 1 }));
async function wizSend(l, params) {
  if (!NAT) throw new Error('Open the hub in the Home Hub app to control WiZ');
  const r = await NAT.udp(l.ip, 38899, JSON.stringify({ method: 'setPilot', params }), false, 1500);
  if (!r.ok) throw new Error(r.error || 'No answer');
  if (r.timeout) throw new Error('Light didn’t answer — is it powered and on this Wi-Fi?');
}
async function wizState(l) {
  const r = await NAT.udp(l.ip, 38899, '{"method":"getPilot","params":{}}', false, 1500);
  if (!r.ok || !r.data) throw new Error('No answer');
  return JSON.parse(r.data).result || {};
}

/* Cololight: binary over UDP 8900 (protocol from the pycololight project) */
const CL_PREFIX = '535a30300000000000';
const CL_EFFECTS = [['80s Club', '049a0000'], ['Cherry Blossom', '04940800'], ['Cocktail Parade', '05bd0690'], ['Instagrammer', '03bc0190'],
  ['Pensieve', '04c40600'], ['Savasana', '04970400'], ['Sunrise', '01c10a00'], ['The Circus', '04810130'], ['Unicorns', '049a0e00'],
  ['Christmas', '068b0900'], ['Rainbow Flow', '03810690'], ['Music Mode', '07bd0990']].map(([name, value]) => ({ name, value }));
const clCounter = {};
function clCfg(l, type) {
  const c = clCounter[l.id] = clCounter[l.id] === 1 ? 2 : 1;
  const count = '000000000000000000000000000000000' + c + '0000000000000000000';
  return type === 'command' ? `${CL_PREFIX}20${count}4010301c` : type === 'effect' ? `${CL_PREFIX}23${count}4010602ff` : `${CL_PREFIX}1e${count}3020101`;
}
const hx2 = n => pad(Math.round(clamp(n, 0, 255)).toString(16));
async function clSend(l, hex) {
  if (!NAT) throw new Error('Open the hub in the Home Hub app to control Cololight');
  const r = await NAT.udp(l.ip, 8900, hex, true, 0);
  if (!r.ok) throw new Error(r.error || 'Couldn’t send');
}
async function clState(l) {
  const r = await NAT.udp(l.ip, 8900, clCfg(l, 'state'), true, 1500);
  if (!r.ok || !r.data) throw new Error('No answer');
  const b = r.data.match(/../g).map(x => parseInt(x, 16));
  return b[40] === 207 ? { on: true, bri: b[41] } : b[40] === 206 ? { on: false } : {};
}

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200);
}

/* ---------------- navigation ---------------- */
let screen = 'home';
function moveNavInd() {
  const b = document.querySelector('.navb.on'), ind = $('#navInd');
  if (b && ind) ind.style.transform = `translateX(${b.offsetLeft + (b.offsetWidth - 56) / 2}px)`;
}
function go(id) {
  screen = id;
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  $$('.navb').forEach(b => b.classList.toggle('on', b.dataset.go === id));
  moveNavInd();
  if (id === 'lights') { renderLights(); refreshGovee(); }
  if (id !== 'day' && calOpen) setCalOpen(false);
  if (id === 'day') { renderCalendar(); renderTasks(); renderHabits(); loadTasks(); }
  if (id === 'music') { renderMusic(); pollMusic(true); }
  if (id === 'clock') renderClock();
  if (id === 'notes') { renderNotes(); sizeBoard(); }
  if (id === 'settings') { renderSettings(); checkStatus(); }
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

/* ---------------- clock + home ---------------- */
let lastMin = -1;
function tick() {
  const d = new Date();
  if (screen === 'clock' || S.timer.endAt) renderTimer();
  timerCheck();
  if (d.getMinutes() === lastMin) return;
  lastMin = d.getMinutes();
  const [t, ap] = fmtTime(d);
  $('#hTime').textContent = t; $('#hAp').textContent = ap; $('#nT').textContent = t;
  $('#hDate').textContent = fmtDate(d); $('#dDate').textContent = fmtDate(d); $('#nD').textContent = fmtDate(d);
  const h = d.getHours();
  const part = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  $('#hGreet').textContent = S.settings.name ? `${part}, ${S.settings.name}.` : `${part}.`;
  checkDayReset();
  renderCalendar();
  minuteRunner();
}

/* ---------------- weather ---------------- */
let WXD = { temp: 54, code: 2, day: true, hi: 57, lo: 39,
  hourly: [['Now', 2, 1, 54], ['5 PM', 3, 1, 53], ['6 PM', 3, 0, 50], ['7 PM', 3, 0, 47], ['8 PM', 0, 0, 44]],
  daily: [['Fri', 0, 56], ['Sat', 3, 52], ['Sun', 61, 49], ['Mon', 2, 51], ['Tue', 0, 55]] };
function renderWeather() {
  const w = WXD;
  $('#wx').innerHTML = `
    <div class="now-col">
      <div class="lbl">${esc(S.settings.loc.label)}</div>
      <div class="now"><span class="t">${w.temp}°</span>${wxi(wxType(w.code, w.day), 52)}</div>
      <div class="cond">${WXTEXT(w.code)}</div>
      <div class="hl">High ${w.hi}° · Low ${w.lo}°</div>
    </div>
    <div class="vrule" aria-hidden="true"></div>
    <div class="fc">
      <div class="sec"><div class="lbl">Next hours</div>
        <div class="strip">${w.hourly.map(h => `<div><span class="l">${h[0]}</span>${wxi(wxType(h[1], !!h[2]), 28)}<span class="v">${h[3]}°</span></div>`).join('')}</div></div>
      <div class="rule"></div>
      <div class="sec"><div class="lbl">Next 5 days</div>
        <div class="strip">${w.daily.map(h => `<div><span class="l">${h[0]}</span>${wxi(wxType(h[1], true), 28)}<span class="v">${h[2]}°</span></div>`).join('')}</div></div>
    </div>`;
  renderNightInfo();
}
async function loadWeather() {
  const { lat, lon } = S.settings.loc;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;
  try {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    const d = new Date();
    const nowKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
    let i = j.hourly.time.indexOf(nowKey); if (i < 0) i = 0;
    const hourly = [];
    for (let k = 0; k < 5; k++) {
      const idx = i + k; const hh = new Date(j.hourly.time[idx]);
      const [hm, ap] = fmtTime(hh);
      hourly.push([k === 0 ? 'Now' : hm.split(':')[0] + ' ' + ap, j.hourly.weather_code[idx], j.hourly.is_day[idx], Math.round(j.hourly.temperature_2m[idx])]);
    }
    const daily = [];
    for (let k = 1; k <= 5; k++) {
      const dd = new Date(j.daily.time[k] + 'T12:00');
      daily.push([dd.toLocaleDateString('en-US', { weekday: 'short' }), j.daily.weather_code[k], Math.round(j.daily.temperature_2m_max[k])]);
    }
    WXD = { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, day: !!j.current.is_day,
      hi: Math.round(j.daily.temperature_2m_max[0]), lo: Math.round(j.daily.temperature_2m_min[0]), hourly, daily };
    renderWeather();
  } catch (e) { /* keep last forecast */ }
}

/* ---------------- calendar + Brightspace ---------------- */
const SAMPLE_EVENTS = [
  { d: 0, h: 17, m: 0, dur: 90, title: 'Study group', where: 'Library · Room 204' },
  { d: 0, h: 18, m: 30, dur: 60, title: 'Gym' },
  { d: 0, h: 20, m: 0, dur: 60, title: 'Finish lab report' },
  { d: 1, h: 9, m: 0, dur: 75, title: 'Marketing lecture' },
  { d: 2, h: 7, m: 0, dur: 480, title: 'Adirondack day hike' }
];
let EVENTS = null, DUE = null, calErr = '', dueErr = '';
function parseWhen(s, allDay) {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [y, m, d] = s.split('-').map(Number); return allDay === 'due' ? new Date(y, m - 1, d, 23, 59) : new Date(y, m - 1, d); }
  return new Date(s);
}
function sampleEvents() {
  const base = startOfDay();
  return SAMPLE_EVENTS.map(e => {
    const s = new Date(base); s.setDate(s.getDate() + e.d); s.setHours(e.h, e.m);
    return { title: e.title, where: e.where || '', start: s, end: new Date(s.getTime() + e.dur * 60000), allDay: false };
  });
}
const events = () => EVENTS || sampleEvents();
async function loadCalendar() {
  if (!ST.google) { EVENTS = null; renderCalendar(); return; }
  try {
    const from = startOfDay().toISOString(), to = new Date(startOfDay().getTime() + 8 * 864e5).toISOString();
    const j = await API.get(`google/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    EVENTS = j.events.map(e => ({ title: e.title, where: e.where, allDay: e.allDay, start: parseWhen(e.start), end: parseWhen(e.end) || parseWhen(e.start) }));
    calErr = '';
  } catch (e) { calErr = e.message; }
  renderCalendar();
}
async function loadDue() {
  if (!ST.ical) { DUE = null; renderCalendar(); return; }
  try {
    const j = await API.get('due');
    DUE = j.items.map(i => ({ title: i.title, where: i.where, allDay: i.allDay, start: parseWhen(i.start, i.allDay ? 'due' : false) })).filter(i => i.start);
    dueErr = '';
  } catch (e) { dueErr = e.message; }
  renderCalendar();
}
function renderCalendar() {
  const now = new Date();
  const ev = events();
  // home "up next"
  const next = ev.find(e => !e.allDay && e.end > now) || ev.find(e => e.end > now);
  const nextDue = (DUE || []).find(d => d.start > now && d.start - now < 36 * 36e5);
  if (nextDue && (!next || nextDue.start < next.start)) {
    $('#unK').className = 'lbl'; $('#unK').textContent = 'Due soon';
    $('#unT').textContent = nextDue.title;
    $('#unS').textContent = `${dayLabel(nextDue.start)}, ${fmtT(nextDue.start)}`;
  } else if (next && !next.allDay && next.start <= now && next.end > now) {
    $('#unK').className = 'lbl now'; $('#unK').innerHTML = '<span class="live"></span>Happening now';
    $('#unT').textContent = next.title;
    $('#unS').textContent = `Until ${fmtT(next.end)}` + (next.where ? ' · ' + next.where : '');
  } else if (next) {
    $('#unK').className = 'lbl'; $('#unK').textContent = 'Up next';
    $('#unT').textContent = next.title;
    const when = next.allDay ? `${dayLabel(next.start)} · All day` : (startOfDay(next.start).getTime() === startOfDay().getTime() ? fmtT(next.start) : `${dayLabel(next.start)}, ${fmtT(next.start)}`);
    $('#unS').textContent = when + (next.where ? ' · ' + next.where : '');
  } else { $('#unK').className = 'lbl'; $('#unK').textContent = 'Up next'; $('#unT').textContent = 'All clear'; $('#unS').textContent = 'Nothing on the calendar'; }

  // day card
  if (calOpen) { renderCalFull(); return; }
  $('#calNav').innerHTML = `<button type="button" class="pill" data-cal="open" aria-label="Open full calendar">${ic('chev', 22, 2)}</button>`;
  $$('[data-cv]').forEach(b => b.classList.toggle('on', b.dataset.cv === S.calView));
  const body = $('#calBody');
  if (S.calView === 'due') {
    $('#calTitle').textContent = 'Due dates';
    $('#calSub').textContent = ST.ical ? 'Brightspace' : 'Brightspace not linked';
    if (!ST.ical) { body.innerHTML = `<div class="empty">Add your Brightspace calendar link in Settings to see assignment due dates here.</div>`; return; }
    if (dueErr) { body.innerHTML = `<div class="empty">Couldn’t load due dates: ${esc(dueErr)}</div>`; return; }
    const items = (DUE || []).filter(d => d.start > new Date(now.getTime() - 12 * 36e5)).slice(0, 12);
    body.innerHTML = items.length ? items.map(d => {
      const soon = d.start - now < 24 * 36e5;
      return `<div class="up ${soon ? 'soon' : ''}"><span class="dot" style="display:block"></span><div><small>${dayLabel(d.start)}, ${d.allDay ? 'end of day' : fmtT(d.start)}</small><b>${esc(d.title)}</b></div></div>`;
    }).join('') : `<div class="empty">Nothing due in the next few weeks.</div>`;
    return;
  }
  $('#calTitle').textContent = 'Calendar';
  $('#calSub').textContent = EVENTS ? 'Google' : (ST.google ? (calErr ? 'Couldn’t load' : 'Loading…') : 'Sample events');
  const today = ev.filter(e => startOfDay(e.start).getTime() === startOfDay().getTime());
  const later = ev.filter(e => startOfDay(e.start) > startOfDay()).slice(0, 3);
  body.innerHTML = (today.length ? `<div class="tl ${today.length > 1 ? 'line' : ''}">${today.map(e => `
      <div class="ev ${e.end < now ? 'past' : (!e.allDay && e.start <= now ? 'nowev' : '')}"><span class="dot"></span><span class="tm">${e.allDay ? 'All day' : (!e.allDay && e.start <= now && e.end > now) ? 'Now' : fmtT(e.start)}</span>
      <div><b>${esc(e.title)}</b>${e.where ? `<small>${esc(e.where)}</small>` : ''}</div></div>`).join('')}</div>`
    : '<div class="empty">Nothing else today.</div>') +
    `<div class="drule"></div><div class="dk">Upcoming</div>` +
    (later.length ? later.map(e => `<div class="up"><span class="dot" style="display:block"></span>
      <div><small>${dayLabel(e.start)}${e.allDay ? '' : ', ' + fmtT(e.start)}</small><b>${esc(e.title)}</b></div></div>`).join('') : '<div class="empty">Nothing coming up.</div>');
}
/* full calendar view (tap the calendar card) */
let calOpen = false, calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1), calSel = startOfDay();
const MONTHEV = {};
const monthKey = d => d.getFullYear() + '-' + (d.getMonth() + 1);
const gridStart = m => { const f = new Date(m.getFullYear(), m.getMonth(), 1); f.setDate(1 - f.getDay()); return f; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isoDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function monthEvents() { return MONTHEV[monthKey(calMonth)] || events(); }
function eventsOn(d) {
  const day0 = startOfDay(d), day1 = new Date(day0.getTime() + 864e5);
  return monthEvents().filter(e => e.allDay ? (e.start < day1 && (e.end || e.start) > day0) || sameDay(e.start, d) : sameDay(e.start, d))
    .sort((a, b) => (b.allDay - a.allDay) || (a.start - b.start));
}
const dueOn = d => (DUE || []).filter(x => sameDay(x.start, d));
/* class meetings (titles that start with a course code like "BMKT 310" or "BITM330") stay off the month dots */
const isClass = e => /^\s*[A-Z]{3,5}\s?-?\d{3}[A-Z]?\b/.test(e.title || '');
async function loadMonth() {
  if (!ST.google) return;
  const key = monthKey(calMonth); if (MONTHEV[key]) return;
  const from = gridStart(calMonth), to = new Date(from.getTime() + 42 * 864e5);
  try {
    const j = await API.get(`google/events?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`);
    MONTHEV[key] = j.events.map(e => ({ title: e.title, where: e.where, allDay: e.allDay, start: parseWhen(e.start), end: parseWhen(e.end) || parseWhen(e.start) }));
    if (calOpen && monthKey(calMonth) === key) renderCalFull();
  } catch (e) { toast(e.message); }
}
function renderCalFull() {
  $('#calTitle').textContent = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $('#calSub').textContent = EVENTS || MONTHEV[monthKey(calMonth)] ? 'Google Calendar' + (DUE ? ' + Brightspace' : '') : 'Sample events';
  $('#calNav').innerHTML = `<button type="button" class="pill" data-cal="prev" aria-label="Previous month">${ic('chev', 22, 2).replace('<svg', '<svg style="transform:rotate(180deg)"')}</button>
    <button type="button" class="pill" data-cal="today">Today</button>
    <button type="button" class="pill" data-cal="next" aria-label="Next month">${ic('chev', 22, 2)}</button>
    <button type="button" class="pill" data-cal="close" aria-label="Close calendar">${ic('x', 22, 2)}</button>`;
  const start = gridStart(calMonth), today = new Date();
  let cells = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const ev = eventsOn(d).filter(e => !isClass(e)), du = dueOn(d);
    const cls = [d.getMonth() !== calMonth.getMonth() ? 'out' : '', sameDay(d, today) ? 'today' : '', sameDay(d, calSel) ? 'sel' : ''].join(' ');
    cells += `<button type="button" class="mday ${cls}" data-day="${isoDay(d)}" aria-label="${d.toDateString()}${ev.length ? ', ' + ev.length + ' events' : ''}${du.length ? ', ' + du.length + ' due' : ''}">
      <span class="dn">${d.getDate()}</span><span class="dots">${ev.slice(0, 3).map(() => '<i></i>').join('')}${du.length ? '<i class="du"></i>' : ''}</span></button>`;
  }
  const ev = eventsOn(calSel), du = dueOn(calSel);
  const label = calSel.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const items = ev.map(e => `<div class="ag"><span class="tm">${e.allDay ? 'All day' : fmtT(e.start)}</span><div><b>${esc(e.title)}</b>${e.where ? `<small>${esc(e.where)}</small>` : ''}</div></div>`).join('') +
    du.map(d => `<div class="ag"><span class="tm">${d.allDay ? 'End of day' : fmtT(d.start)}</span><div><b><span class="duetag">Due</span>${esc(d.title)}</b></div></div>`).join('');
  $('#calBody').innerHTML = `<div class="cal2">
    <div class="mwrap"><div class="wk">${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(x => `<span>${x}</span>`).join('')}</div><div class="mgrid">${cells}</div></div>
    <div class="agenda"><h3>${sameDay(calSel, today) ? 'Today' : label}</h3>${sameDay(calSel, today) ? `<div class="dk" style="margin-top:-8px">${label}</div>` : ''}
      ${items || '<div class="empty">Nothing scheduled.</div>'}</div></div>`;
}
function setCalOpen(v) {
  calOpen = v;
  $('#calCard').classList.toggle('open', v);
  $('#day .cols').classList.toggle('calopen', v);
  if (v) { calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); calSel = startOfDay(); loadMonth(); }
  renderCalendar();
}
$('#day').addEventListener('click', e => {
  const b = e.target.closest('[data-cv]'); if (b) { S.calView = b.dataset.cv; save(); renderCalendar(); return; }
  const a = e.target.closest('[data-cal]');
  if (a) {
    const k = a.dataset.cal;
    if (k === 'open') setCalOpen(true);
    else if (k === 'close') setCalOpen(false);
    else {
      if (k === 'today') { calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); calSel = startOfDay(); }
      else calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + (k === 'next' ? 1 : -1), 1);
      renderCalFull(); loadMonth();
    }
    return;
  }
  const d = e.target.closest('[data-day]');
  if (d) {
    const [y, m, dd] = d.dataset.day.split('-').map(Number); calSel = new Date(y, m - 1, dd);
    if (calSel.getMonth() !== calMonth.getMonth()) { calMonth = new Date(y, m - 1, 1); loadMonth(); }
    renderCalFull(); return;
  }
  if (!calOpen && e.target.closest('#calBody')) setCalOpen(true);
});

/* slider fill: fraction of the knob's travel (min..max), applied via --pf */
const pfrac = (v, min, max) => Math.max(0, Math.min(1, (v - min) / (max - min))).toFixed(4);
function setFill(el) { el.style.setProperty('--pf', pfrac(+el.value, +el.min || 0, +el.max || 100)); }

/* ---------------- lights ---------------- */
const lightById = id => S.lights.find(l => l.id === id);
const caps = l => l.provider === 'wiz' ? { power: true, bri: [10, 100], rgb: true, temp: [2200, 6500], scenes: true, diy: false, music: null }
  : l.provider === 'cololight' ? { power: true, bri: [1, 100], rgb: true, temp: null, scenes: true, diy: false, music: null }
  : l.caps || { power: true, bri: [1, 100], rgb: true, temp: [2000, 9000], scenes: false, diy: false, music: null };
const LIVE = l => l.provider === 'govee' || l.provider === 'wiz' || l.provider === 'cololight';
function lightHex(l) { return l.mode === 'temp' ? kelvinHex(l.k || 3000) : l.mode === 'scene' ? '#C9BEFF' : (l.hex || '#FFFFFF'); }
function lightLabel(l) {
  if (l.mode === 'scene' && l.scene) return { k: 'Scene', b: l.scene.name, em: '' };
  if (l.mode === 'temp') return { k: 'White', b: kName(l.k), em: `${l.k} K` };
  const p = RGB_PRESETS.find(x => x[1].toUpperCase() === (l.hex || '').toUpperCase());
  return { k: 'Color', b: p ? p[0] : 'Custom', em: p ? '' : (l.hex || '').toUpperCase() };
}
const providerLabel = l => l.online === false && l.provider !== 'local' ? `${l.provider === 'govee' ? 'Govee' : l.provider === 'wiz' ? 'WiZ' : 'Cololight'} · offline` : l.provider === 'govee' ? 'Govee' : l.provider === 'wiz' ? 'WiZ' : l.provider === 'cololight' ? 'Cololight' : `${l.brand || 'Light'} · not linked`;

function cardHTML(l) {
  const hx = lightHex(l), fill = mix(hx, '#FFFFFF', .2), sw = mix(hx, '#FFFFFF', .45), lab = lightLabel(l);
  return `<div class="card lcard ${l.on ? '' : 'off'}" data-id="${l.id}">
    <div class="r1"><button type="button" class="ico" data-open aria-label="${esc(l.name)} details">${ic(l.icon, 48, 1.5)}</button>
      <button type="button" class="nm" data-open><b>${esc(l.name)}</b><span>${esc(providerLabel(l))}</span></button>
      <button type="button" class="tog" aria-pressed="${!!l.on}" aria-label="${esc(l.name)} ${l.on ? 'on' : 'off'}" data-tog><i></i></button></div>
    <div class="r2">${ic('sun', 30, 1.6)}
      <input type="range" min="1" max="100" value="${l.bri}" aria-label="${esc(l.name)} brightness" style="--pf:${pfrac(l.bri, 1, 100)};--fill:${fill}">
      <span class="pct">${l.on ? l.bri + '%' : 'Off'}</span></div>
    <button type="button" class="cbtn" data-open><span class="sw" style="background:${sw}"></span>
      <span class="ct"><small>${lab.k}</small><b>${esc(lab.b)}</b>${lab.em ? `<em>${esc(lab.em)}</em>` : ''}</span>${ic('chev', 26, 1.8)}</button>
  </div>`;
}
function renderLights() {
  const on = S.lights.filter(l => l.on).length;
  $('#lSub').textContent = !S.lights.length ? 'No lights yet — add some in Settings' : on ? `Bedroom · ${on} light${on === 1 ? '' : 's'} on` : 'Bedroom · All lights off';
  const g = $('#lgrid'); g.classList.remove('still'); void g.offsetWidth;
  g.innerHTML = S.lights.map(cardHTML).join('');
  renderNightInfo();
}
function updateCard(l) {
  $('#lgrid').classList.add('still');
  const el = $(`#lgrid [data-id="${l.id}"]`);
  if (el) el.outerHTML = cardHTML(l);
  const on = S.lights.filter(x => x.on).length;
  $('#lSub').textContent = on ? `Bedroom · ${on} light${on === 1 ? '' : 's'} on` : 'Bedroom · All lights off';
}

/* sending to devices: merged + debounced per light */
const pending = {};
const lastLocal = {};
function setLight(l, patch, opts = {}) {
  if (patch.bri != null && patch.on === undefined && !l.on) patch.on = true;
  if ((patch.mode || patch.hex || patch.k || patch.scene) && patch.on === undefined && !l.on) patch.on = true;
  Object.assign(l, patch);
  lastLocal[l.id] = Date.now();
  if (!opts.keepScene) { S.activeScene = null; renderScenes(); }
  save();
  if (!opts.noCard) updateCard(l);
  if (ldId === l.id && !opts.noDetail) syncDetail();
  if (LIVE(l)) queueSend(l, patch, opts.now ? 0 : (l.provider === 'govee' ? 350 : 120));
}
function queueSend(l, patch, delay) {
  const p = pending[l.id] || (pending[l.id] = { patch: {} });
  Object.assign(p.patch, patch);
  if (patch.mode) { delete p.patch.hexDone; }
  clearTimeout(p.t);
  p.t = setTimeout(() => flush(l), delay);
}
async function flush(l) {
  const p = pending[l.id]; if (!p) return;
  delete pending[l.id];
  const patch = p.patch, c = caps(l), cmds = [];
  if (l.provider === 'wiz' || l.provider === 'cololight') {
    try { await (l.provider === 'wiz' ? flushWiz(l, patch) : flushCololight(l, patch)); }
    catch (e) { toast(`${l.name}: ${e.message}`); }
    return;
  }
  const base = { sku: l.sku, device: l.device };
  if (patch.on === false) cmds.push({ type: 'devices.capabilities.on_off', instance: 'powerSwitch', value: 0 });
  else {
    if (patch.on === true) cmds.push({ type: 'devices.capabilities.on_off', instance: 'powerSwitch', value: 1 });
    if (patch.mode === 'scene' && l.scene) {
      const s = l.scene;
      if (s.kind === 'music') cmds.push({ type: 'devices.capabilities.music_setting', instance: 'musicMode', value: { musicMode: s.value, sensitivity: 100 } });
      else cmds.push({ type: 'devices.capabilities.dynamic_scene', instance: s.kind === 'diy' ? 'diyScene' : 'lightScene', value: s.value });
    } else if (patch.mode === 'temp' || (patch.k && l.mode === 'temp')) {
      if (c.temp) cmds.push({ type: 'devices.capabilities.color_setting', instance: 'colorTemperatureK', value: clamp(l.k, c.temp[0], c.temp[1]) });
      else if (c.rgb) { const [r, g, b] = hexToRgb(kelvinHex(l.k)); cmds.push({ type: 'devices.capabilities.color_setting', instance: 'colorRgb', value: (r << 16) + (g << 8) + b }); }
    } else if (patch.mode === 'rgb' || (patch.hex && l.mode === 'rgb')) {
      const [r, g, b] = hexToRgb(l.hex); cmds.push({ type: 'devices.capabilities.color_setting', instance: 'colorRgb', value: (r << 16) + (g << 8) + b });
    }
    if (patch.bri != null && c.bri) cmds.push({ type: 'devices.capabilities.range', instance: 'brightness', value: clamp(Math.round(l.bri), c.bri[0], c.bri[1]) });
  }
  for (const cmd of cmds) {
    try { await API.post('govee/control', Object.assign({}, base, cmd)); if (l.online === false) { l.online = true; updateCard(l); } }
    catch (e) {
      if (/offline/i.test(e.message)) { l.online = false; updateCard(l); toast(`${l.name} is offline — check that it’s plugged in and on Wi-Fi`); }
      else toast(`${l.name}: ${e.message}`);
      break;
    }
  }
}
async function flushWiz(l, patch) {
  if (patch.on === false) return wizSend(l, { state: false });
  const p = { state: true };
  if (l.mode === 'scene' && l.scene) p.sceneId = l.scene.value;
  else if (l.mode === 'temp') p.temp = clamp(l.k, 2200, 6500);
  else { const [r, g, b] = hexToRgb(l.hex); Object.assign(p, { r, g, b }); }
  p.dimming = clamp(Math.round(l.bri), 10, 100);
  return wizSend(l, p);
}
async function flushCololight(l, patch) {
  if (patch.on === false) return clSend(l, clCfg(l, 'command') + 'e1e');
  if (patch.on === true || patch.bri != null) await clSend(l, clCfg(l, 'command') + 'f' + hx2(clamp(l.bri, 1, 100)));
  if (patch.mode === 'scene' && l.scene) await clSend(l, clCfg(l, 'effect') + l.scene.value);
  else if (patch.mode || patch.hex || patch.k) {
    const [r, g, b] = hexToRgb(l.mode === 'temp' ? kelvinHex(l.k) : l.hex);
    await clSend(l, clCfg(l, 'effect') + '00' + hx2(r) + hx2(g) + hx2(b));
  }
}
let goveeRefreshed = 0;
async function refreshGovee(force) {
  if (!force && Date.now() - goveeRefreshed < 90000) return;
  goveeRefreshed = Date.now();
  if (NAT) for (const l of S.lights.filter(x => x.provider === 'wiz' || x.provider === 'cololight')) {
    if (Date.now() - (lastLocal[l.id] || 0) < 15000) continue;
    try {
      if (l.provider === 'wiz') {
        const st = await wizState(l), patch = { on: !!st.state };
        if (st.dimming) patch.bri = st.dimming;
        if (st.sceneId) { const sc = WIZ_SCENES[st.sceneId - 1]; if (sc) { patch.mode = 'scene'; patch.scene = { kind: 'wiz', name: sc.name, value: sc.value }; } }
        else if (st.r != null && (st.r || st.g || st.b)) { patch.mode = 'rgb'; patch.hex = rgbToHex(st.r, st.g, st.b); }
        else if (st.temp) { patch.mode = 'temp'; patch.k = st.temp; }
        Object.assign(l, patch);
      } else Object.assign(l, await clState(l));
      l.online = true;
    } catch (e) { l.online = false; }
    updateCard(l);
  }
  if (!ST.govee) { save(); return; }
  for (const l of S.lights.filter(x => x.provider === 'govee')) {
    if (Date.now() - (lastLocal[l.id] || 0) < 15000) continue;
    try {
      const st = await API.post('govee/state', { sku: l.sku, device: l.device });
      const patch = {};
      if (st.on != null) patch.on = st.on;
      if (st.bri != null) patch.bri = st.bri;
      if (l.mode !== 'scene') {
        if (st.k) { patch.mode = 'temp'; patch.k = st.k; }
        else if (st.rgb) { patch.mode = 'rgb'; patch.hex = rgbToHex(st.rgb >> 16 & 255, st.rgb >> 8 & 255, st.rgb & 255); }
      }
      l.online = st.online !== false;
      Object.assign(l, patch); updateCard(l);
    } catch (e) { /* keep local state */ }
  }
  save();
}

$('#lgrid').addEventListener('click', e => {
  const card = e.target.closest('[data-id]'); if (!card) return;
  const l = lightById(card.dataset.id);
  if (e.target.closest('[data-tog]')) setLight(l, { on: !l.on }, { now: true });
  else if (e.target.closest('[data-open]')) openLight(l);
});
$('#lgrid').addEventListener('input', e => {
  if (e.target.type !== 'range') return;
  const card = e.target.closest('[data-id]'); const l = lightById(card.dataset.id);
  const v = +e.target.value;
  setFill(e.target);
  card.querySelector('.pct').textContent = v + '%';
  if (card.classList.contains('off')) { card.classList.remove('off'); card.querySelector('.tog').setAttribute('aria-pressed', 'true'); }
  setLight(l, { bri: v }, { noCard: true });
});

/* ---------------- light detail sheet ---------------- */
let ldId = null, ldTab = 'color', sceneCache = {};
let wheelImg = null;
function wheelCanvas() {
  if (wheelImg) return wheelImg;
  const N = 600, c = document.createElement('canvas'); c.width = c.height = N;
  const ctx = c.getContext('2d'), img = ctx.createImageData(N, N), d = img.data, R = N / 2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - R + .5, dy = y - R + .5, r = Math.sqrt(dx * dx + dy * dy) / R, i = (y * N + x) * 4;
    if (r > 1) { d[i + 3] = 0; continue; }
    const h = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    const [cr, cg, cb] = hsvToRgb(h, Math.min(1, r), 1);
    d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = r > .995 ? Math.round((1 - r) / .005 * 255) : 255;
  }
  ctx.putImageData(img, 0, 0);
  return (wheelImg = c);
}
function openLight(l) {
  ldId = l.id;
  ldTab = l.mode === 'temp' ? 'white' : l.mode === 'scene' ? 'scenes' : 'color';
  const c = caps(l);
  if (ldTab === 'white' && !c.temp) ldTab = 'color';
  $('#ldIco').innerHTML = ic(l.icon, 44, 1.5);
  $('#ldName').textContent = l.name;
  renderDetail();
  $('#ld').classList.add('on');
}
function closeSheets() { $$('.sheet').forEach(s => s.classList.remove('on')); ldId = null; }
$$('.sheet').forEach(s => s.addEventListener('click', e => {
  if (e.target === s || e.target.closest('[data-close]')) { s.classList.remove('on'); if (s.id === 'ld') ldId = null; }
}));
function renderDetail() {
  const l = lightById(ldId); if (!l) return;
  const c = caps(l);
  const tabs = [];
  if (c.rgb) tabs.push(['color', 'Color']);
  if (c.temp) tabs.push(['white', 'White']);
  tabs.push(['scenes', 'Scenes']);
  if (!tabs.find(t => t[0] === ldTab)) ldTab = tabs[0][0];
  $('#ldTabs').innerHTML = tabs.map(t => `<button type="button" data-tab="${t[0]}" class="${ldTab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('');
  const body = $('#ldBody');
  if (ldTab === 'color') {
    body.innerHTML = `<div class="wheelwrap">
      <div class="wheel" id="wheel"><canvas width="600" height="600"></canvas><div class="mk" id="wmk"></div></div>
      <div><div class="lbl2">Presets</div><div class="presets">${RGB_PRESETS.map(p => `<button type="button" class="pre" data-hex="${p[1]}"><span class="sw" style="background:${p[1]}"></span>${p[0]}</button>`).join('')}</div></div>
    </div>`;
    body.querySelector('canvas').getContext('2d').drawImage(wheelCanvas(), 0, 0);
    bindWheel();
  } else if (ldTab === 'white') {
    const [mn, mx] = c.temp || [2000, 9000];
    body.innerHTML = `<div style="padding:30px 10px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:18px"><span class="lbl2" style="margin:0">Color temperature</span><b style="font-size:40px;font-weight:500" id="kV">${l.k} K</b></div>
      <input type="range" class="kel" id="kR" min="${mn}" max="${mx}" step="50" value="${clamp(l.k || 3000, mn, mx)}" aria-label="Color temperature" style="width:100%;height:60px">
      <div style="display:flex;justify-content:space-between;font-size:17px;color:var(--muted);margin-top:8px"><span>Warm</span><span>Cool</span></div>
      <div class="lbl2" style="margin-top:34px">Presets</div>
      <div class="presets" style="grid-template-columns:repeat(6,minmax(0,1fr))">${K_PRESETS.filter(p => p[1] >= mn && p[1] <= mx).map(p => `<button type="button" class="pre" data-k="${p[1]}"><span class="sw" style="background:${kelvinHex(p[1])}"></span>${p[0]}</button>`).join('')}</div>
    </div>`;
  } else {
    if (l.provider === 'wiz' || l.provider === 'cololight') {
      const list = l.provider === 'wiz' ? WIZ_SCENES : CL_EFFECTS, cur = l.mode === 'scene' && l.scene ? l.scene.name : '';
      body.innerHTML = `<div class="scenelist"><h3>${l.provider === 'wiz' ? 'WiZ scenes' : 'Cololight effects'}</h3><div class="sgrid">${list.map((s, i) =>
        `<button type="button" class="sbtn ${cur === s.name ? 'sel' : ''}" data-scn="${l.provider}:${i}">${esc(s.name)}</button>`).join('')}</div></div>`;
    } else if (l.provider !== 'govee') {
      body.innerHTML = `<div class="note" style="padding:30px 10px">This light isn’t linked yet, so it only changes on screen. Import Govee lights or find WiZ and Cololight lights in Settings, then remove this placeholder.</div>`;
    } else if (!(c.scenes || c.diy || c.music)) {
      body.innerHTML = `<div class="note" style="padding:30px 10px">This light has no scenes in Govee.</div>`;
    } else {
      const sc = sceneCache[l.id];
      if (!sc) {
        body.innerHTML = `<div class="note" style="padding:30px 10px">Loading scenes from Govee…</div>`;
        API.post('govee/scenes', { sku: l.sku, device: l.device })
          .then(j => { sceneCache[l.id] = j; if (ldId === l.id && ldTab === 'scenes') renderDetail(); })
          .catch(err => { if (ldId === l.id) body.innerHTML = `<div class="note" style="padding:30px 10px">Couldn’t load scenes: ${esc(err.message)}</div>`; });
      } else {
        const cur = l.mode === 'scene' && l.scene ? l.scene.name : '';
        const sec = (title, list, kind) => list && list.length ? `<h3>${title}</h3><div class="sgrid">${list.map((s, i) =>
          `<button type="button" class="sbtn ${cur === s.name ? 'sel' : ''}" data-scn="${kind}:${i}">${esc(s.name)}</button>`).join('')}</div>` : '';
        const html = sec('Scenes', sc.scenes, 'scene') + sec('My DIY scenes', sc.diy, 'diy') + sec('Music modes', c.music, 'music');
        body.innerHTML = `<div class="scenelist">${html || '<div class="note">This light has no scenes in Govee.</div>'}</div>`;
      }
    }
  }
  syncDetail();
}
function syncDetail() {
  const l = lightById(ldId); if (!l) return;
  const t = $('#ldTog'); t.setAttribute('aria-pressed', !!l.on);
  const hx = lightHex(l), r = $('#ldBri');
  r.value = l.bri; setFill(r); r.style.setProperty('--fill', mix(hx, '#FFFFFF', .2));
  $('#ldPct').textContent = l.on ? l.bri + '%' : 'Off';
  const mk = $('#wmk');
  if (mk) {
    const [h, s] = rgbToHsv(...hexToRgb(l.mode === 'rgb' ? l.hex : '#FFFFFF'));
    const a = h * Math.PI / 180;
    mk.style.left = (50 + Math.cos(a) * s * 50) + '%'; mk.style.top = (50 + Math.sin(a) * s * 50) + '%';
    mk.style.background = l.mode === 'rgb' ? l.hex : '#fff';
  }
  $$('#ldBody [data-hex]').forEach(b => b.classList.toggle('sel', l.mode === 'rgb' && b.dataset.hex.toUpperCase() === (l.hex || '').toUpperCase()));
  $$('#ldBody [data-k]').forEach(b => b.classList.toggle('sel', l.mode === 'temp' && +b.dataset.k === l.k));
  const kV = $('#kV'); if (kV) kV.textContent = l.k + ' K';
  const kR = $('#kR'); if (kR && document.activeElement !== kR) kR.value = l.k;
}
function bindWheel() {
  const w = $('#wheel'); let down = false;
  const pick = e => {
    const r = w.getBoundingClientRect();
    let x = (e.clientX - r.left) / r.width * 2 - 1, y = (e.clientY - r.top) / r.height * 2 - 1;
    const d = Math.sqrt(x * x + y * y); if (d > 1) { x /= d; y /= d; }
    const h = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360, s = Math.min(1, d);
    const l = lightById(ldId);
    setLight(l, { mode: 'rgb', hex: rgbToHex(...hsvToRgb(h, s, 1)) });
  };
  w.addEventListener('pointerdown', e => { down = true; try { w.setPointerCapture(e.pointerId); } catch (_) {} pick(e); });
  w.addEventListener('pointermove', e => { if (down) pick(e); });
  w.addEventListener('pointerup', () => { down = false; });
  w.addEventListener('pointercancel', () => { down = false; });
}
$('#ld').addEventListener('click', e => {
  const l = lightById(ldId); if (!l) return;
  const tab = e.target.closest('[data-tab]');
  if (tab) { ldTab = tab.dataset.tab; renderDetail(); return; }
  const hx = e.target.closest('[data-hex]'); if (hx) { setLight(l, { mode: 'rgb', hex: hx.dataset.hex }, { now: true }); return; }
  const k = e.target.closest('[data-k]'); if (k) { setLight(l, { mode: 'temp', k: +k.dataset.k }, { now: true }); return; }
  const sc = e.target.closest('[data-scn]');
  if (sc) {
    const [kind, i] = sc.dataset.scn.split(':');
    const list = kind === 'wiz' ? WIZ_SCENES : kind === 'cololight' ? CL_EFFECTS : kind === 'music' ? caps(l).music : sceneCache[l.id][kind === 'diy' ? 'diy' : 'scenes'];
    const s = list[+i];
    setLight(l, { mode: 'scene', scene: { kind, name: s.name, value: s.value } }, { now: true });
    $$('#ldBody .sbtn').forEach(b => b.classList.toggle('sel', b === sc));
  }
});
$('#ldTog').addEventListener('click', () => { const l = lightById(ldId); if (l) setLight(l, { on: !l.on }, { now: true }); });
$('#ldBri').addEventListener('input', e => { const l = lightById(ldId); if (l) setLight(l, { bri: +e.target.value }); });
$('#ld').addEventListener('input', e => {
  if (e.target.id !== 'kR') return;
  const l = lightById(ldId); setLight(l, { mode: 'temp', k: +e.target.value });
});

/* ---------------- room scenes ---------------- */
function renderScenes() {
  $$('[data-scenes]').forEach(box => {
    const btns = box.querySelectorAll('[data-scene]');
    if (btns.length === S.scenes.length && [...btns].every((b, i) => b.dataset.scene === S.scenes[i].id && b.dataset.label === S.scenes[i].label)) {
      btns.forEach(b => { const on = S.activeScene === b.dataset.scene; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      return;   // update in place so the entrance animation doesn't replay
    }
    box.innerHTML = S.scenes.map(s => `<button type="button" class="pill ${S.activeScene === s.id ? 'active' : ''}" data-scene="${s.id}" data-label="${esc(s.label)}" aria-pressed="${S.activeScene === s.id}">${ic(s.icon, 24)}${esc(s.label)}</button>`).join('');
  });
}
function applyScene(id) {
  const sc = S.scenes.find(s => s.id === id); if (!sc) return;
  for (const l of S.lights) {
    const st = (sc.states && sc.states[l.id]) || sc.rule;
    if (!st) continue;
    const patch = { on: !!st.on };
    if (st.on) {
      if (st.bri != null) patch.bri = st.bri;
      if (st.mode === 'scene' && st.scene) { patch.mode = 'scene'; patch.scene = st.scene; }
      else if (st.mode === 'temp') { if (caps(l).temp) { patch.mode = 'temp'; patch.k = st.k; } else { patch.mode = 'rgb'; patch.hex = kelvinHex(st.k); } }
      else if (st.mode === 'rgb') { patch.mode = 'rgb'; patch.hex = st.hex; }
    }
    setLight(l, patch, { keepScene: true, noCard: true, now: true });
  }
  S.activeScene = id; save(); renderScenes(); S.lights.forEach(updateCard);
}
function snapshotLights() {
  const o = {};
  for (const l of S.lights) o[l.id] = { on: l.on, bri: l.bri, mode: l.mode, k: l.k, hex: l.hex, scene: l.scene || null };
  return o;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-scene]'); if (b) applyScene(b.dataset.scene); });

/* ---------------- tasks (Google Tasks or local) ---------------- */
let GTASKS = null, taskErr = '';
async function loadTasks() {
  if (!ST.google) { GTASKS = null; renderTasks(); return; }
  try {
    const j = await API.get('google/tasks');
    const today = startOfDay(new Date(Date.now() - S.settings.habitReset * 36e5));
    GTASKS = j.tasks.filter(t => !t.done || (t.completed && new Date(t.completed) >= today));
    GTASKS.sort((a, b) => (a.done - b.done));
    taskErr = '';
  } catch (e) { taskErr = e.message; }
  renderTasks();
}
const taskList = () => GTASKS || S.tasks;
function renderTasks() {
  const list = taskList();
  const left = list.filter(t => !t.done).length;
  $('#tLeft').textContent = (list.length ? (left ? `${left} remaining` : 'All done') : 'No tasks');
  $('#tList').innerHTML = taskErr && GTASKS === null ? `<div class="empty">${esc(taskErr)}</div>` : list.map(t => `<button type="button" class="row ${t.done ? 'done' : ''}" data-t="${esc(t.id)}" aria-pressed="${t.done}">
    <span class="chk">${ic('check', 24, 2.4)}</span><span class="rt">${esc(t.title)}</span></button>`).join('');
}
$('#tList').addEventListener('click', async e => {
  const b = e.target.closest('[data-t]'); if (!b) return;
  const t = taskList().find(x => String(x.id) === b.dataset.t); if (!t) return;
  t.done = !t.done; renderTasks(); justTicked('#tList', 'data-t', t.id, t.done);
  if (GTASKS) { try { await API.patch('google/tasks/' + encodeURIComponent(t.id), { done: t.done }); } catch (err) { t.done = !t.done; renderTasks(); toast(err.message); } }
  else save();
});
$('#addTask').addEventListener('submit', async e => {
  e.preventDefault(); const v = $('#tIn').value.trim(); if (!v) return;
  $('#tIn').value = ''; $('#tIn').blur();
  if (GTASKS) {
    const temp = { id: 'tmp' + uid(), title: v, done: false }; GTASKS.unshift(temp); renderTasks();
    try { const j = await API.post('google/tasks', { title: v }); temp.id = j.task.id; } catch (err) { GTASKS = GTASKS.filter(x => x !== temp); renderTasks(); toast(err.message); }
  } else { S.tasks.push({ id: 't' + uid(), title: v, done: false }); save(); renderTasks(); }
});

function justTicked(list, attr, id, done) {
  if (!done) return;
  const el = document.querySelector(`${list} [${attr}="${CSS.escape(String(id))}"]`); if (el) el.classList.add('just');
}
/* ---------------- habits ---------------- */
function dayKey() { return new Date(Date.now() - S.settings.habitReset * 36e5).toDateString(); }
function checkDayReset() {
  const k = dayKey();
  if (S.habitDay !== k) {
    S.habitDay = k; S.habits.forEach(h => h.done = false);
    S.tasks = S.tasks.filter(t => !t.done);
    save(); renderHabits(); renderTasks(); if (ST.google) loadTasks();
  }
}
function renderHabits() {
  const n = S.habits.filter(h => h.done).length;
  $('#hReset').textContent = `Resets at ${fmtHM(S.settings.habitReset, 0).replace(':00', '')}`;
  $('#hFoot').textContent = `${n} of ${S.habits.length} complete`;
  $('#hList').innerHTML = S.habits.length ? S.habits.map(h => `<button type="button" class="row ${h.done ? 'done' : ''}" data-h="${h.id}" aria-pressed="${h.done}" style="font-size:22px">
    <span class="chk">${ic('check', 24, 2.4)}</span><span class="rt" style="text-decoration:none;color:inherit">${esc(h.label)}</span></button>`).join('')
    : '<div class="empty">Add habits in Settings.</div>';
}
$('#hList').addEventListener('click', e => {
  const b = e.target.closest('[data-h]'); if (!b) return;
  const h = S.habits.find(x => x.id === b.dataset.h); h.done = !h.done; save(); renderHabits(); justTicked('#hList', 'data-h', h.id, h.done);
});

/* ---------------- climate (placeholder until Quext/AC is reachable) ---------------- */
function renderClimate() {
  const room = S.settings.indoor, set = S.setpoint;
  $('#inT').textContent = room + '°'; $('#spV').textContent = set + '°';
  const st = $('#clStat'), cooling = room > set;
  st.className = 'cl-status' + (cooling ? ' cooling' : '');
  st.innerHTML = `<span class="dot"></span>${cooling ? 'Cooling' : room === set ? 'At set temperature' : 'Idle'}`;
}
$$('[data-sp]').forEach(b => b.addEventListener('click', () => {
  S.setpoint = clamp(S.setpoint + +b.dataset.sp, 60, 85); save(); renderClimate();
}));

/* ---------------- music (Spotify) ---------------- */
let MP = null, mDevices = [], mPlaylists = null, mErr = '', mPolledAt = 0, volT;
const msFmt = ms => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
async function pollMusic(full) {
  if (!ST.spotify) { renderMusic(); return; }
  try {
    MP = await API.get('spotify/player'); MP.at = Date.now(); mErr = '';
    if (full || !mDevices.length) { const d = await API.get('spotify/devices'); mDevices = d.devices; }
    if (mPlaylists === null) { try { mPlaylists = (await API.get('spotify/playlists')).playlists; } catch (e) { mPlaylists = []; } }
  } catch (e) { mErr = e.message; }
  mPolledAt = Date.now();
  if (screen === 'music') renderMusic();
}
async function mcmd(cmd, value, device) {
  try { await API.post('spotify/cmd', { cmd, value, device }); } catch (e) { toast(e.message); }
  setTimeout(() => pollMusic(cmd === 'transfer'), 450);
}
function renderMusic() {
  const pl = $('#player'), side = $('#mside');
  if (!ST.spotify) {
    $('#mSub').textContent = 'Spotify';
    pl.innerHTML = `<div class="connect"><div class="art">${ic('music', 80, 1.3)}</div><b>Connect Spotify</b>
      <p class="note" style="margin:0">See what’s playing and control it from here. Spotify needs a Premium account for playback control.</p>
      <button type="button" class="pill sm pri" data-go2="settings">Open Settings</button></div>`;
    side.innerHTML = `<h3>Devices</h3><div class="empty">Shows up after Spotify is connected.</div>`;
    return;
  }
  const p = MP;
  $('#mSub').textContent = p && p.device ? `Playing on ${p.device.name}` : 'Spotify';
  if (mErr && !p) { pl.innerHTML = `<div class="connect"><b>Spotify isn’t answering</b><p class="note" style="margin:0">${esc(mErr)}</p></div>`; }
  else if (!p || !p.active) {
    pl.innerHTML = `<div class="connect"><div class="art">${ic('music', 80, 1.3)}</div><b>Nothing playing</b>
      <p class="note" style="margin:0">Open Spotify on your phone, computer or speaker, or pick a device and playlist on the right.</p></div>`;
  } else {
    const prog = Math.min(p.duration, p.progress + (p.playing ? Date.now() - p.at : 0));
    pl.innerHTML = `<div class="ptop">
        ${p.art ? `<img class="art" src="${esc(p.art)}" alt="">` : `<div class="art">${ic('music', 80, 1.3)}</div>`}
        <div style="min-width:0;flex:1"><div class="ptitle">${esc(p.title)}</div><div class="partist">${esc(p.artist)}</div>
        <div class="pdev">${ic('speaker', 20, 1.6)}${esc(p.device ? p.device.name : '')}</div></div></div>
      <div class="prog"><div class="bar"><i id="mBar" style="width:${p.duration ? prog / p.duration * 100 : 0}%"></i></div>
        <div class="ptimes"><span id="mCur">${msFmt(prog)}</span><span>${msFmt(p.duration)}</span></div></div>
      <div class="pctl">
        <button type="button" class="pill round mid ${p.shuffle ? 'lit' : ''}" data-m="shuffle" aria-label="Shuffle" aria-pressed="${p.shuffle}">${ic('shuffle', 30, 1.8)}</button>
        <button type="button" class="pill round mid" data-m="previous" aria-label="Previous">${ic('prev', 30, 1.8)}</button>
        <button type="button" class="pill round big pri" data-m="${p.playing ? 'pause' : 'play'}" aria-label="${p.playing ? 'Pause' : 'Play'}">${ic(p.playing ? 'pause' : 'play', 40, 1.8)}</button>
        <button type="button" class="pill round mid" data-m="next" aria-label="Next">${ic('next', 30, 1.8)}</button>
        <span style="width:72px"></span>
      </div>
      ${p.device && p.device.volume != null ? `<div class="pvol">${ic('vol', 30, 1.7)}<input type="range" id="mVol" min="0" max="100" value="${p.device.volume}" aria-label="Volume" style="--pf:${pfrac(p.device.volume, 0, 100)};--fill:#9FD3F7"><span class="pct">${p.device.volume}%</span></div>` : ''}`;
  }
  side.innerHTML = `<h3>Play on</h3><div class="devs">${mDevices.length ? mDevices.map(d => `<button type="button" class="pill xs ${d.active ? 'active' : ''}" data-dev="${esc(d.id)}">${ic('speaker', 18, 1.7)}${esc(d.name)}</button>`).join('') : '<div class="empty" style="padding:0">No devices — open Spotify somewhere first.</div>'}</div>
    <h3>Playlists</h3><div class="plist">${mPlaylists && mPlaylists.length ? mPlaylists.map(x => `<button type="button" class="pl" data-uri="${esc(x.uri)}">${x.art ? `<img src="${esc(x.art)}" alt="">` : '<span class="ph"></span>'}<span>${esc(x.name)}</span>${ic('play', 22, 1.6)}</button>`).join('') : '<div class="empty">No playlists available.</div>'}</div>`;
}
function musicTick() {
  if (screen !== 'music' || !MP || !MP.active || !MP.playing) return;
  const prog = Math.min(MP.duration, MP.progress + Date.now() - MP.at);
  const bar = $('#mBar'), cur = $('#mCur');
  if (bar) bar.style.width = (MP.duration ? prog / MP.duration * 100 : 0) + '%';
  if (cur) cur.textContent = msFmt(prog);
}
$('#music').addEventListener('click', e => {
  const m = e.target.closest('[data-m]');
  if (m) {
    const c = m.dataset.m;
    if (MP) { if (c === 'play') MP.playing = true; if (c === 'pause') { MP.progress += Date.now() - MP.at; MP.at = Date.now(); MP.playing = false; } if (c === 'shuffle') MP.shuffle = !MP.shuffle; renderMusic(); }
    mcmd(c, c === 'shuffle' ? MP && MP.shuffle : undefined); return;
  }
  const d = e.target.closest('[data-dev]'); if (d) { mcmd('transfer', d.dataset.dev); return; }
  const u = e.target.closest('[data-uri]'); if (u) { const dev = (mDevices.find(x => x.active) || mDevices[0] || {}).id; mcmd('play', u.dataset.uri, dev); return; }
  const g = e.target.closest('[data-go2]'); if (g) go(g.dataset.go2);
});
$('#music').addEventListener('input', e => {
  if (e.target.id !== 'mVol') return;
  const v = +e.target.value; setFill(e.target); e.target.nextElementSibling.textContent = v + '%';
  if (MP && MP.device) MP.device.volume = v;
  clearTimeout(volT); volT = setTimeout(() => mcmd('volume', v), 400);
});

/* ---------------- sound ---------------- */
let AC = null;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function chime() {
  const a = audio(); if (!a) return;
  const t = a.currentTime;
  [880, 1108.73, 1318.51, 1760].forEach((f, i) => {
    const o = a.createOscillator(), g = a.createGain(), st = t + i * .16;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(.28, st + .02); g.gain.exponentialRampToValueAtTime(.001, st + 1.3);
    o.connect(g); g.connect(a.destination); o.start(st); o.stop(st + 1.4);
  });
}
addEventListener('pointerdown', () => audio(), { once: true, passive: true });

/* ---------------- ring overlay ---------------- */
let ringLoop = null, ringStop = null;
function showRing(kind, time, buttons) {
  exitNight(true);
  $('#ringK').textContent = kind; $('#ringT').textContent = time;
  $('#ringB').innerHTML = buttons.map((b, i) => `<button type="button" class="pill ${b.pri ? 'pri' : ''}" data-rb="${i}">${b.label}</button>`).join('');
  $('#ringB').onclick = e => { const b = e.target.closest('[data-rb]'); if (b) { hideRing(); buttons[+b.dataset.rb].fn(); } };
  $('#ring').classList.add('on');
  chime(); clearInterval(ringLoop); ringLoop = setInterval(chime, 2600);
  clearTimeout(ringStop); ringStop = setTimeout(hideRing, 5 * 60000);
  if (window.fully) { try { window.fully.turnScreenOn(); } catch (e) {} }
}
function hideRing() { $('#ring').classList.remove('on'); clearInterval(ringLoop); clearTimeout(ringStop); lastAct = Date.now(); }

/* ---------------- timer ---------------- */
const tRemain = () => S.timer.endAt ? Math.max(0, S.timer.endAt - Date.now()) : (S.timer.left != null ? S.timer.left : S.timer.dur);
const mmss = ms => { const s = Math.ceil(ms / 1000); const h = Math.floor(s / 3600); return h ? `${h}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}` : `${Math.floor(s / 60)}:${pad(s % 60)}`; };
function timerCheck() {
  if (S.timer.endAt && Date.now() >= S.timer.endAt) {
    S.timer.endAt = null; S.timer.left = null; save();
    showRing('Timer done', mmss(S.timer.dur), [{ label: 'Stop', pri: true, fn: () => {} }, { label: '+5 min', fn: () => { S.timer.endAt = Date.now() + 5 * 60000; save(); renderTimer(); } }]);
    renderTimer();
  }
}
function renderTimer() {
  const el = $('#timerCard'); if (!el) return;
  const rem = tRemain(), running = !!S.timer.endAt, total = S.timer.endAt || S.timer.left != null ? S.timer.dur : S.timer.dur;
  const C = 2 * Math.PI * 100, frac = total ? rem / total : 0;
  if (!el.dataset.built) {
    el.dataset.built = '1';
    el.innerHTML = `<div class="hrow"><h2>Timer</h2></div>
      <div class="ring"><svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r="100" fill="none" stroke="#E7E5EF" stroke-width="12"/>
        <circle id="tArc" cx="110" cy="110" r="100" fill="none" stroke="url(#tg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}"/>
        <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9FD3F7"/><stop offset="1" stop-color="#3B9EEA"/></linearGradient></defs></svg>
        <div class="rt2" id="tTxt"></div></div>
      <div class="chips">${[5, 10, 15, 25, 45, 60].map(m => `<button type="button" class="pill" data-tp="${m}">${m} min</button>`).join('')}</div>
      <div class="btnrow"><button type="button" class="pill pri" id="tGo"></button><button type="button" class="pill" id="tRs">Reset</button></div>`;
  }
  $('#tTxt').textContent = mmss(rem);
  $('#tArc').setAttribute('stroke-dashoffset', String(C * (1 - frac)));
  $('#tGo').textContent = running ? 'Pause' : (S.timer.left != null ? 'Resume' : 'Start');
  $$('[data-tp]').forEach(b => b.classList.toggle('active', !running && S.timer.left == null && +b.dataset.tp * 60000 === S.timer.dur));
}
$('#timerCard').addEventListener('click', e => {
  const tp = e.target.closest('[data-tp]');
  if (tp) { S.timer = { dur: +tp.dataset.tp * 60000, endAt: null, left: null }; save(); renderTimer(); return; }
  if (e.target.closest('#tGo')) {
    if (S.timer.endAt) { S.timer.left = Math.max(0, S.timer.endAt - Date.now()); S.timer.endAt = null; }
    else { S.timer.endAt = Date.now() + (S.timer.left != null ? S.timer.left : S.timer.dur); S.timer.left = null; }
    save(); renderTimer(); return;
  }
  if (e.target.closest('#tRs')) { S.timer.endAt = null; S.timer.left = null; save(); renderTimer(); }
});

/* ---------------- alarm ---------------- */
function nextAlarm() {
  const a = S.alarm; if (!a.on) return null;
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(a.h, a.m, 0, 0);
    if (d <= now) continue;
    if (!a.days.length || a.days.includes(d.getDay())) return d;
  }
  return null;
}
function stepperHTML(id, val) {
  return `<div class="stp"><button type="button" class="pill ibtn" data-st="${id}:1" aria-label="Increase">${ic('up', 26, 2)}</button><b>${val}</b><button type="button" class="pill ibtn" data-st="${id}:-1" aria-label="Decrease">${ic('down', 26, 2)}</button></div>`;
}
function renderAlarm() {
  const a = S.alarm, n = nextAlarm();
  $('#alarmCard').innerHTML = `<div class="hrow"><h2>Alarm</h2><button type="button" class="tog s" id="aOn" aria-pressed="${a.on}" aria-label="Alarm on"><i></i></button></div>
    <div class="atime">${stepperHTML('ah', a.h % 12 || 12)}<span class="colon">:</span>${stepperHTML('am', pad(a.m))}
      <button type="button" class="pill sm" id="aAp" style="margin-left:6px;width:76px;padding:0">${a.h >= 12 ? 'PM' : 'AM'}</button></div>
    <div class="days">${DAYS.map((d, i) => `<button type="button" data-ad="${i}" class="${a.days.includes(i) ? 'on' : ''}" aria-pressed="${a.days.includes(i)}">${d}</button>`).join('')}</div>
    <div class="optrow"><span>Sunrise lights<small>Fade lights up ${a.sunMin} min before</small></span><button type="button" class="tog s" id="aSun" aria-pressed="${a.sunrise}" aria-label="Sunrise lights"><i></i></button></div>
    <div class="optrow" style="color:var(--muted);font-size:17px">${n ? `Next: ${dayLabel(n)}, ${fmtT(n)}` : (a.on ? 'Pick at least one day, or it rings once' : 'Alarm is off')}</div>`;
}
$('#alarmCard').addEventListener('click', e => {
  const a = S.alarm;
  const st = e.target.closest('[data-st]');
  if (st) {
    const [id, dir] = st.dataset.st.split(':'); const d = +dir;
    if (id === 'ah') { const pm = a.h >= 12; let h12 = (a.h % 12) + d; h12 = (h12 + 12) % 12; a.h = h12 + (pm ? 12 : 0); }
    if (id === 'am') a.m = (a.m + d * 5 + 60) % 60;
  }
  if (e.target.closest('#aAp')) a.h = (a.h + 12) % 24;
  if (e.target.closest('#aOn')) a.on = !a.on;
  if (e.target.closest('#aSun')) a.sunrise = !a.sunrise;
  const dd = e.target.closest('[data-ad]'); if (dd) { const i = +dd.dataset.ad; a.days = a.days.includes(i) ? a.days.filter(x => x !== i) : [...a.days, i]; }
  if (st || dd || e.target.closest('#aAp,#aOn,#aSun')) { a.last = ''; save(); renderAlarm(); }
});

/* ---------------- light schedules ---------------- */
function actionLabel(act) {
  if (act === 'on') return 'All lights on';
  if (act === 'off') return 'All lights off';
  if (act.startsWith('scene:')) { const s = S.scenes.find(x => x.id === act.slice(6)); return s ? `${s.label} scene` : 'Scene'; }
  return act;
}
function renderSchedules() {
  $('#schedCard').innerHTML = `<div class="hrow"><h2>Light schedules</h2><button type="button" class="pill xs" id="sAdd">${ic('plus', 20, 2)}Add</button></div>
    <div class="list">${S.schedules.length ? S.schedules.slice().sort((x, y) => x.h * 60 + x.m - (y.h * 60 + y.m)).map(s => `<div class="srow" data-sid="${s.id}">
      <button type="button" class="st" data-sedit style="border:0;background:none;text-align:left;padding:0"><b>${fmtHM(s.h, s.m)}</b><small>${esc(actionLabel(s.action))} · ${daysText(s.days)}</small></button>
      <button type="button" class="tog s" data-son aria-pressed="${s.on}" aria-label="Schedule on"><i></i></button></div>`).join('')
      : '<div class="empty">No schedules yet. Add one to dim the lights at bedtime or turn them on in the morning.</div>'}</div>`;
}
let schEdit = null;
function openSched(s) {
  schEdit = s ? JSON.parse(JSON.stringify(s)) : { id: 's' + uid(), h: 22, m: 0, days: [0, 1, 2, 3, 4, 5, 6], action: 'scene:chill', on: true, last: '', isNew: true };
  $('#schT').textContent = schEdit.isNew ? 'New schedule' : 'Edit schedule';
  renderSchedEditor(); $('#sched').classList.add('on');
}
function renderSchedEditor() {
  const s = schEdit;
  const acts = [...S.scenes.filter(x => x.id !== 'off').map(x => ['scene:' + x.id, x.label]), ['on', 'All on'], ['off', 'All off']];
  $('#schBody').innerHTML = `<div class="atime" style="justify-content:flex-start">${stepperHTML('sh', s.h % 12 || 12)}<span class="colon">:</span>${stepperHTML('sm', pad(s.m))}
      <button type="button" class="pill sm" id="sAp" style="margin-left:6px;width:76px;padding:0">${s.h >= 12 ? 'PM' : 'AM'}</button></div>
    <div class="lbl2">Days</div>
    <div class="days">${DAYS.map((d, i) => `<button type="button" data-sd="${i}" class="${s.days.includes(i) ? 'on' : ''}">${d}</button>`).join('')}</div>
    <div class="lbl2">Do this</div>
    <div class="acts">${acts.map(a => `<button type="button" class="pill ${s.action === a[0] ? 'active' : ''}" data-sa="${a[0]}">${esc(a[1])}</button>`).join('')}</div>
    <div class="btnrow">${s.isNew ? '' : '<button type="button" class="pill" id="sDel">Delete</button>'}<button type="button" class="pill pri" id="sSave">Save</button></div>`;
}
$('#sched').addEventListener('click', e => {
  const s = schEdit; if (!s) return;
  const st = e.target.closest('[data-st]');
  if (st) {
    const [id, dir] = st.dataset.st.split(':'); const d = +dir;
    if (id === 'sh') { const pm = s.h >= 12; let h12 = ((s.h % 12) + d + 12) % 12; s.h = h12 + (pm ? 12 : 0); }
    if (id === 'sm') s.m = (s.m + d * 5 + 60) % 60;
    renderSchedEditor(); return;
  }
  if (e.target.closest('#sAp')) { s.h = (s.h + 12) % 24; renderSchedEditor(); return; }
  const sd = e.target.closest('[data-sd]'); if (sd) { const i = +sd.dataset.sd; s.days = s.days.includes(i) ? s.days.filter(x => x !== i) : [...s.days, i]; renderSchedEditor(); return; }
  const sa = e.target.closest('[data-sa]'); if (sa) { s.action = sa.dataset.sa; renderSchedEditor(); return; }
  if (e.target.closest('#sSave')) {
    const isNew = s.isNew; delete s.isNew; s.last = '';
    if (isNew) S.schedules.push(s); else S.schedules = S.schedules.map(x => x.id === s.id ? s : x);
    save(); $('#sched').classList.remove('on'); renderSchedules(); return;
  }
  if (e.target.closest('#sDel')) { S.schedules = S.schedules.filter(x => x.id !== s.id); save(); $('#sched').classList.remove('on'); renderSchedules(); }
});
$('#schedCard').addEventListener('click', e => {
  if (e.target.closest('#sAdd')) { openSched(null); return; }
  const row = e.target.closest('[data-sid]'); if (!row) return;
  const s = S.schedules.find(x => x.id === row.dataset.sid);
  if (e.target.closest('[data-son]')) { s.on = !s.on; s.last = ''; save(); renderSchedules(); return; }
  if (e.target.closest('[data-sedit]')) openSched(s);
});
function runAction(act) {
  if (act === 'off') applyScene('off');
  else if (act === 'on') { S.lights.forEach(l => setLight(l, { on: true }, { now: true, noCard: true })); renderLights(); }
  else if (act.startsWith('scene:')) applyScene(act.slice(6));
}
function renderClock() { renderTimer(); renderAlarm(); renderSchedules(); }

/* runs once a minute: alarm, sunrise, schedules */
let snoozeUntil = 0;
function minuteRunner() {
  const now = new Date(), key = now.toDateString() + ' ' + now.getHours() + ':' + now.getMinutes();
  const dow = now.getDay(), hm = now.getHours() * 60 + now.getMinutes();
  // schedules
  for (const s of S.schedules) {
    if (!s.on || s.last === key) continue;
    if (s.h * 60 + s.m !== hm) continue;
    if (s.days.length && !s.days.includes(dow)) continue;
    s.last = key; save(); runAction(s.action); toast(`Schedule: ${actionLabel(s.action)}`);
  }
  // alarm + sunrise
  const a = S.alarm;
  if (a.on && (!a.days.length || a.days.includes(dow))) {
    const at = a.h * 60 + a.m, diff = at - hm;
    if (a.sunrise && diff > 0 && diff <= a.sunMin) {
      const p = 1 - diff / a.sunMin;
      for (const l of S.lights) {
        const k = Math.round(2200 + 1800 * p), patch = { on: true, bri: Math.max(1, Math.round(100 * p)) };
        if (caps(l).temp) { patch.mode = 'temp'; patch.k = k; } else { patch.mode = 'rgb'; patch.hex = kelvinHex(k); }
        setLight(l, patch, { now: true, noCard: true });
      }
      if (screen === 'lights') renderLights();
    }
    if (diff === 0 && a.last !== key) {
      a.last = key; if (!a.days.length) a.on = false; save();
      fireAlarm();
    }
  }
  if (snoozeUntil && Date.now() >= snoozeUntil) { snoozeUntil = 0; fireAlarm(); }
  if (screen === 'clock') renderAlarm();
}
function fireAlarm() {
  showRing('Alarm', fmtT(new Date()), [
    { label: 'Snooze 9 min', fn: () => { snoozeUntil = Date.now() + 9 * 60000; toast('Snoozed for 9 minutes'); } },
    { label: 'I’m up', pri: true, fn: () => {} }
  ]);
}

/* ---------------- notes: whiteboard + quick notes ---------------- */
const INKS = ['#16151D', '#8B5CF6', '#FF6B5A', '#3DB8FF', '#2FBF71'];
const NOTE_BG = ['#FFF4C9', '#ECE7FF', '#DDF5EA', '#FFE3D6', '#DCEEFF'];
let pen = { ink: INKS[0], size: 'sm', erase: false }, undoStack = [], boardReady = false, clearArm = 0;
function renderNotes() {
  $('#tools').innerHTML = INKS.map(c => `<button type="button" class="ink ${!pen.erase && pen.ink === c ? 'on' : ''}" data-ink="${c}" style="background:${c}" aria-label="Pen color"></button>`).join('') +
    `<button type="button" class="pill tbtn" data-tool="size">${pen.size === 'sm' ? 'Thin' : 'Thick'}</button>
     <button type="button" class="pill tbtn ${pen.erase ? 'on' : ''}" data-tool="erase" aria-pressed="${pen.erase}">${ic('eraser', 22, 1.7)}Eraser</button>
     <span class="gap"></span>
     <button type="button" class="pill tbtn" data-tool="undo" aria-label="Undo">${ic('undo', 22, 1.8)}</button>
     <button type="button" class="pill tbtn" data-tool="clear">${ic('trash', 22, 1.7)}${clearArm > Date.now() ? 'Tap to confirm' : 'Clear'}</button>`;
  $('#nList').innerHTML = S.notes.length ? S.notes.map((n, i) => `<div class="nt" style="background:${NOTE_BG[i % NOTE_BG.length]}"><span>${esc(n.text)}</span><button type="button" class="x" data-nd="${n.id}" aria-label="Delete note">${ic('x', 20, 2)}</button></div>`).join('')
    : '<div class="empty">Nothing yet. Notes stay on this tablet.</div>';
}
function sizeBoard() {
  const cv = $('#wb'), box = $('#cbox');
  const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
  if (cv.width === w * 2 && cv.height === h * 2) return;
  cv.width = w * 2; cv.height = h * 2;
  const data = (() => { try { return localStorage.getItem(KEY + '.board'); } catch (e) { return null; } })();
  if (data) { const img = new Image(); img.onload = () => cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); img.src = data; }
  boardReady = true;
}
let boardSaveT;
function saveBoard() { clearTimeout(boardSaveT); boardSaveT = setTimeout(() => { try { localStorage.setItem(KEY + '.board', $('#wb').toDataURL('image/png')); } catch (e) { toast('Whiteboard is too big to save'); } }, 700); }
(function bindBoard() {
  const cv = $('#wb'); let drawing = false, last = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
  cv.addEventListener('pointerdown', e => {
    if (!boardReady) sizeBoard();
    const ctx = cv.getContext('2d');
    try { undoStack.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (undoStack.length > 12) undoStack.shift(); } catch (_) {}
    drawing = true; last = pt(e); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    ctx.beginPath(); ctx.arc(last[0], last[1], (pen.erase ? 40 : pen.size === 'sm' ? 6 : 16) / 2, 0, Math.PI * 2);
    ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over'; ctx.fillStyle = pen.ink; ctx.fill();
  });
  cv.addEventListener('pointermove', e => {
    if (!drawing) return;
    const ctx = cv.getContext('2d'), p = pt(e);
    ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = pen.ink; ctx.lineWidth = pen.erase ? 40 : pen.size === 'sm' ? 6 : 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p;
  });
  const end = () => { if (drawing) { drawing = false; saveBoard(); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
})();
$('#tools').addEventListener('click', e => {
  const ink = e.target.closest('[data-ink]'); if (ink) { pen.ink = ink.dataset.ink; pen.erase = false; renderNotes(); return; }
  const t = e.target.closest('[data-tool]'); if (!t) return;
  const cv = $('#wb'), ctx = cv.getContext('2d');
  if (t.dataset.tool === 'size') pen.size = pen.size === 'sm' ? 'lg' : 'sm';
  if (t.dataset.tool === 'erase') pen.erase = !pen.erase;
  if (t.dataset.tool === 'undo') { const img = undoStack.pop(); if (img) { ctx.putImageData(img, 0, 0); saveBoard(); } }
  if (t.dataset.tool === 'clear') {
    if (clearArm > Date.now()) { ctx.clearRect(0, 0, cv.width, cv.height); undoStack = []; clearArm = 0; saveBoard(); }
    else { clearArm = Date.now() + 3000; setTimeout(renderNotes, 3100); }
  }
  renderNotes();
});
$('#addNote').addEventListener('submit', e => {
  e.preventDefault(); const v = $('#nIn').value.trim(); if (!v) return;
  S.notes.unshift({ id: 'n' + uid(), text: v }); $('#nIn').value = ''; $('#nIn').blur(); save(); renderNotes();
});
$('#nList').addEventListener('click', e => { const d = e.target.closest('[data-nd]'); if (d) { S.notes = S.notes.filter(n => n.id !== d.dataset.nd); save(); renderNotes(); } });

/* ---------------- settings ---------------- */
function tag(ok, yes, no) { return `<span class="tag ${ok ? 'ok' : 'warn'}">${ok ? yes : no}</span>`; }
function renderSettings() {
  const st = ST, s = S.settings;
  $('#setBody').innerHTML = `
  <div class="card scard">
    <h2>Hub connection</h2>
    <p>The hub key protects your lights, calendar and music. Enter it once on each device that opens this page.</p>
    <div class="mrow"><input class="inp" id="hubKey" type="password" autocomplete="off" placeholder="Hub key" value="${esc(s.hubKey)}"><button type="button" class="pill sm pri" id="hubSave">Save</button></div>
    <div class="chiprow">${s.hubKey ? tag(st.ok, 'Server connected', 'Server: ' + esc(st.error || 'not reached')) : tag(false, '', 'Enter your hub key')}
      ${tag(st.govee, 'Govee ready', 'Govee key missing')} ${tag(st.google, 'Google connected', 'Google not connected')}
      ${tag(st.spotify, 'Spotify connected', 'Spotify not connected')} ${tag(st.ical, 'Brightspace linked', 'Brightspace not linked')}</div>
    <div class="chiprow">
      <button type="button" class="pill xs" data-oauth="google" ${st.googleApp ? '' : 'disabled'}>${st.google ? 'Reconnect' : 'Connect'} Google</button>
      <button type="button" class="pill xs" data-oauth="spotify" ${st.spotifyApp ? '' : 'disabled'}>${st.spotify ? 'Reconnect' : 'Connect'} Spotify</button>
      ${st.google ? '<button type="button" class="pill xs" data-disc="google">Disconnect Google</button>' : ''}
      ${st.spotify ? '<button type="button" class="pill xs" data-disc="spotify">Disconnect Spotify</button>' : ''}
      <button type="button" class="pill xs" id="reload">${ic('refresh', 18, 1.8)}Refresh data</button>
    </div>
  </div>

  <div class="card scard">
    <h2>API keys</h2>
    <p>Saved on your server, never on this tablet. Leave a field blank to keep what’s already saved.</p>
    <div class="fl"><label for="k_gv">Govee API key</label><input class="inp" id="k_gv" data-sec="GOVEE_API_KEY" type="password" autocomplete="off" placeholder="${st.govee ? 'Saved ✓' : 'From the Govee Home app'}"></div>
    <div class="f2"><div class="fl"><label>Google client ID</label><input class="inp" data-sec="GOOGLE_CLIENT_ID" type="password" autocomplete="off" placeholder="${st.googleApp ? 'Saved ✓' : ''}"></div>
      <div class="fl"><label>Google client secret</label><input class="inp" data-sec="GOOGLE_CLIENT_SECRET" type="password" autocomplete="off" placeholder="${st.googleApp ? 'Saved ✓' : ''}"></div></div>
    <div class="f2"><div class="fl"><label>Spotify client ID</label><input class="inp" data-sec="SPOTIFY_CLIENT_ID" type="password" autocomplete="off" placeholder="${st.spotifyApp ? 'Saved ✓' : ''}"></div>
      <div class="fl"><label>Spotify client secret</label><input class="inp" data-sec="SPOTIFY_CLIENT_SECRET" type="password" autocomplete="off" placeholder="${st.spotifyApp ? 'Saved ✓' : ''}"></div></div>
    <div class="fl"><label>Brightspace calendar link (Calendar → Subscribe)</label><input class="inp" data-sec="ICAL_URL" type="password" autocomplete="off" placeholder="${st.ical ? 'Saved ✓' : 'https://…/feed.ics'}"></div>
    <div class="mrow"><button type="button" class="pill sm pri" id="secSave">Save keys</button></div>
    ${st.redirects ? `<p>Redirect URLs to paste into Google Cloud and the Spotify dashboard:</p><code class="cp">${esc(st.redirects.google)}</code><code class="cp">${esc(st.redirects.spotify)}</code>` : ''}
  </div>

  <div class="card scard wide">
    <h2>This tablet</h2>
    ${NAT ? `<p>The Home Hub app talks to WiZ and Cololight lights directly over your Wi-Fi. Find WiZ bulbs automatically, or add any light by its IP address (it’s shown in the light’s own app or your router).</p>
    <div class="mrow"><button type="button" class="pill sm pri" id="findWiz">Find WiZ lights</button>
      <input class="inp" id="lanIp" placeholder="IP address, e.g. 192.168.1.40" inputmode="decimal" style="max-width:320px">
      <button type="button" class="pill sm" data-addlan="wiz">Add as WiZ</button><button type="button" class="pill sm" data-addlan="cololight">Add as Cololight</button></div>
    <div class="chiprow"><button type="button" class="pill xs" id="sysSet">Open Fire settings</button><button type="button" class="pill xs" id="appReload">${ic('refresh', 18, 1.8)}Reload hub</button></div>`
    : `<p>WiZ and Cololight lights only answer on your home Wi-Fi, so they’re controlled by the Home Hub app on the Fire. Open this page in the app to add them. Everything else works here too.</p>`}
  </div>

  <div class="card scard wide">
    <h2>Lights</h2>
    <p>Tap an icon to change it. Govee, WiZ and Cololight lights are live. Placeholder lights (marked “not linked”) only change on screen, so remove them once the real ones are added.</p>
    ${S.lights.map(l => `<div class="mrow" data-lid="${l.id}">
      <button type="button" class="ib" data-licon aria-label="Change icon">${ic(l.icon, 28, 1.6)}</button>
      <input class="inp" data-lname value="${esc(l.name)}" aria-label="Light name" maxlength="24">
      ${l.provider === 'govee' ? `<span class="meta">Govee<br>${esc(l.sku || '')}</span>` : (l.provider === 'wiz' || l.provider === 'cololight') ? `<span class="meta">${l.provider === 'wiz' ? 'WiZ' : 'Cololight'}<br>${esc(l.ip || '')}</span>` : `<input class="inp" data-lbrand value="${esc(l.brand || '')}" aria-label="Brand" placeholder="Brand" style="max-width:180px">`}
      <button type="button" class="ib" data-lup aria-label="Move up">${ic('up', 22, 1.8)}</button>
      <button type="button" class="ib" data-ldel aria-label="Remove light">${ic('trash', 22, 1.7)}</button></div>`).join('')}
    <div class="chiprow"><button type="button" class="pill sm pri" id="impGovee" ${st.govee ? '' : 'disabled'}>Import Govee lights</button><button type="button" class="pill sm" id="addLight">${ic('plus', 20, 2)}Add a light</button></div>
  </div>

  <div class="card scard">
    <h2>Room scenes</h2>
    <p>Set your lights the way you like, then tap “Save current” to store them in a scene.</p>
    ${S.scenes.map(sc => `<div class="mrow" data-scid="${sc.id}"><span class="ib" style="pointer-events:none">${ic(sc.icon, 24, 1.6)}</span>
      <input class="inp" data-scname value="${esc(sc.label)}" maxlength="14" aria-label="Scene name">
      ${sc.id === 'off' ? '' : `<button type="button" class="pill xs" data-sccap>Save current</button>${sc.states ? '<button type="button" class="pill xs" data-screset>Reset</button>' : ''}`}</div>`).join('')}
  </div>

  <div class="card scard">
    <h2>Habits</h2>
    ${S.habits.map(h => `<div class="mrow" data-hid="${h.id}"><input class="inp" data-hname value="${esc(h.label)}" maxlength="24" aria-label="Habit"><button type="button" class="ib" data-hdel aria-label="Remove habit">${ic('trash', 22, 1.7)}</button></div>`).join('')}
    <form class="mrow" id="habAdd" autocomplete="off"><input class="inp" id="habIn" placeholder="New habit" maxlength="24"><button type="submit" class="pill sm">Add</button></form>
  </div>

  <div class="card scard wide">
    <h2>Display & location</h2>
    <div class="f3">
      <div class="fl"><label>Your name</label><input class="inp" data-set="name" value="${esc(s.name)}" maxlength="24"></div>
      <div class="fl"><label>Night clock after (minutes idle)</label><input class="inp" data-set="idle" type="number" min="1" max="120" value="${s.idle}"></div>
      <div class="fl"><label>Screen off after night clock (min, Fully Kiosk)</label><input class="inp" data-set="screenOff" type="number" min="0" max="240" value="${s.screenOff}"></div>
      <div class="fl"><label>Weather location name</label><input class="inp" data-set="loc.label" value="${esc(s.loc.label)}"></div>
      <div class="fl"><label>Latitude</label><input class="inp" data-set="loc.lat" type="number" step="0.001" value="${s.loc.lat}"></div>
      <div class="fl"><label>Longitude</label><input class="inp" data-set="loc.lon" type="number" step="0.001" value="${s.loc.lon}"></div>
      <div class="fl"><label>Daily reset hour (0–23)</label><input class="inp" data-set="habitReset" type="number" min="0" max="23" value="${s.habitReset}"></div>
      <div class="fl"><label>Indoor temp shown (until AC is linked)</label><input class="inp" data-set="indoor" type="number" min="40" max="99" value="${s.indoor}"></div>
      <div class="fl"><label>&nbsp;</label><button type="button" class="pill sm" id="resetAll">Reset this tablet</button></div>
    </div>
  </div>`;
}
const setBody = $('#setBody');
setBody.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.set) {
    const path = t.dataset.set.split('.'); let o = S.settings;
    while (path.length > 1) o = o[path.shift()];
    o[path[0]] = t.type === 'number' ? (t.value === '' ? o[path[0]] : +t.value) : t.value;
    save(); tickForce(); renderWeather(); renderClimate(); renderHabits();
    if (t.dataset.set.startsWith('loc')) loadWeather();
  }
  const lr = t.closest('[data-lid]');
  if (lr) { const l = lightById(lr.dataset.lid); if (t.matches('[data-lname]')) l.name = t.value.trim() || l.name; if (t.matches('[data-lbrand]')) l.brand = t.value.trim(); save(); renderLights(); }
  const sr = t.closest('[data-scid]');
  if (sr && t.matches('[data-scname]')) { const sc = S.scenes.find(x => x.id === sr.dataset.scid); sc.label = t.value.trim() || sc.label; save(); renderScenes(); }
  const hr = t.closest('[data-hid]');
  if (hr && t.matches('[data-hname]')) { const h = S.habits.find(x => x.id === hr.dataset.hid); h.label = t.value.trim() || h.label; save(); renderHabits(); }
});
let resetArm = 0;
setBody.addEventListener('click', async e => {
  const t = e.target;
  if (t.closest('#hubSave')) { S.settings.hubKey = $('#hubKey').value.trim(); saveNow(); await checkStatus(); afterConnect(); toast(ST.ok ? 'Connected to your hub' : (ST.error || 'Couldn’t reach the server')); return; }
  if (t.closest('#secSave')) {
    const body = {}; $$('[data-sec]').forEach(i => { if (i.value.trim()) body[i.dataset.sec] = i.value.trim(); });
    if (!Object.keys(body).length) { toast('Type a key first'); return; }
    try { await API.post('secrets', body); toast('Keys saved'); await checkStatus(); afterConnect(); } catch (err) { toast(err.message); }
    return;
  }
  const oa = t.closest('[data-oauth]'); if (oa && NAT && oa.dataset.oauth === 'google') { toast('Google blocks sign-in inside apps. Connect from your computer’s browser — the tablet picks it up automatically.'); return; }
  if (oa) { saveNow(); location.href = `/api/${oa.dataset.oauth}/auth?k=${encodeURIComponent(S.settings.hubKey)}`; return; }
  const dc = t.closest('[data-disc]'); if (dc) { try { await API.post('disconnect/' + dc.dataset.disc); await checkStatus(); afterConnect(); } catch (err) { toast(err.message); } return; }
  if (t.closest('#reload')) { goveeRefreshed = 0; await checkStatus(); afterConnect(); toast('Refreshing'); return; }
  if (t.closest('#impGovee')) {
    try {
      const j = await API.get('govee/devices'); let n = 0;
      for (const d of j.devices) {
        if (S.lights.find(l => l.device === d.device)) { const l = S.lights.find(x => x.device === d.device); l.caps = d.caps; continue; }
        S.lights.push({ id: 'g' + uid(), name: d.name, brand: 'Govee', provider: 'govee', sku: d.sku, device: d.device, caps: d.caps,
          icon: /strip|led|bar|rope/i.test(d.name) ? 'strip' : /lamp|desk/i.test(d.name) ? 'desk' : /panel|hex|glide/i.test(d.name) ? 'panels' : 'bulb',
          on: true, bri: 100, mode: d.caps.temp ? 'temp' : 'rgb', k: 3000, hex: '#FFD58F' });
        n++;
      }
      save(); renderSettings(); renderLights(); goveeRefreshed = 0; refreshGovee(true);
      toast(n ? `Added ${n} Govee light${n === 1 ? '' : 's'}` : (j.devices.length ? 'Your Govee lights are already here' : 'No Govee lights found on that account'));
    } catch (err) { toast(err.message); }
    return;
  }
  if (t.closest('#findWiz')) {
    toast('Looking for WiZ lights…');
    const r = await NAT.broadcast(38899, JSON.stringify({ method: 'registration', params: { phoneMac: 'AAAAAAAAAAAA', register: false, phoneIp: '1.2.3.4', id: '1' } }), false, 2500);
    if (!r.ok) { toast(r.error || 'Search failed'); return; }
    let n = 0;
    for (const f of r.found || []) {
      let mac = ''; try { mac = (JSON.parse(f.data).result || {}).mac || ''; } catch (_) {}
      if (S.lights.find(l => l.provider === 'wiz' && (l.ip === f.ip || (mac && l.mac === mac)))) { const l = S.lights.find(x => x.provider === 'wiz' && mac && x.mac === mac); if (l) l.ip = f.ip; continue; }
      S.lights.push({ id: 'w' + uid(), name: 'WiZ ' + (mac ? mac.slice(-4).toUpperCase() : f.ip.split('.').pop()), brand: 'WiZ', provider: 'wiz', ip: f.ip, mac,
        icon: 'bulb', on: true, bri: 80, mode: 'temp', k: 3000, hex: '#FFD58F' });
      n++;
    }
    save(); renderSettings(); renderLights(); goveeRefreshed = 0; refreshGovee(true);
    toast(n ? `Found ${n} WiZ light${n === 1 ? '' : 's'} — rename them below` : (r.found && r.found.length ? 'Your WiZ lights are already here' : 'No WiZ lights answered. Are they on this Wi-Fi?'));
    return;
  }
  const al = t.closest('[data-addlan]');
  if (al) {
    const ip = ($('#lanIp').value || '').trim();
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) { toast('Type the light’s IP address first'); return; }
    const kind = al.dataset.addlan;
    S.lights.push({ id: (kind === 'wiz' ? 'w' : 'c') + uid(), name: kind === 'wiz' ? 'WiZ light' : 'Cololight', brand: kind === 'wiz' ? 'WiZ' : 'Cololight', provider: kind, ip,
      icon: kind === 'wiz' ? 'bulb' : 'panels', on: true, bri: 80, mode: kind === 'wiz' ? 'temp' : 'rgb', k: 3000, hex: '#B39BFF' });
    save(); renderSettings(); renderLights(); goveeRefreshed = 0; refreshGovee(true); toast('Light added — rename it below'); return;
  }
  if (t.closest('#sysSet')) { NAT && NAT.settings(); return; }
  if (t.closest('#appReload')) { NAT && NAT.reload(); return; }
  if (t.closest('#addLight')) { S.lights.push({ id: 'l' + uid(), name: 'New light', brand: '', icon: 'bulb', provider: 'local', on: true, bri: 60, mode: 'temp', k: 3000, hex: '#FFD58F' }); save(); renderSettings(); renderLights(); return; }
  const lr = t.closest('[data-lid]');
  if (lr) {
    const i = S.lights.findIndex(l => l.id === lr.dataset.lid), l = S.lights[i];
    if (t.closest('[data-licon]')) { l.icon = LIGHT_ICONS[(LIGHT_ICONS.indexOf(l.icon) + 1) % LIGHT_ICONS.length]; }
    else if (t.closest('[data-lup]') && i > 0) { S.lights.splice(i, 1); S.lights.splice(i - 1, 0, l); }
    else if (t.closest('[data-ldel]')) { S.lights.splice(i, 1); }
    else return;
    save(); renderSettings(); renderLights(); return;
  }
  const sr = t.closest('[data-scid]');
  if (sr) {
    const sc = S.scenes.find(x => x.id === sr.dataset.scid);
    if (t.closest('[data-sccap]')) { sc.states = snapshotLights(); toast(`Saved current lights to ${sc.label}`); }
    else if (t.closest('[data-screset]')) { sc.states = null; toast(`${sc.label} reset`); }
    else return;
    save(); renderSettings(); return;
  }
  const hr = t.closest('[data-hid]');
  if (hr && t.closest('[data-hdel]')) { S.habits = S.habits.filter(h => h.id !== hr.dataset.hid); save(); renderSettings(); renderHabits(); return; }
  if (t.closest('#resetAll')) {
    if (resetArm > Date.now()) { const key = S.settings.hubKey; S = DEFAULT(); S.settings.hubKey = key; saveNow(); try { localStorage.removeItem(KEY + '.board'); } catch (_) {} location.reload(); }
    else { resetArm = Date.now() + 4000; toast('Tap “Reset this tablet” again to erase everything here'); }
  }
});
setBody.addEventListener('submit', e => {
  if (e.target.id !== 'habAdd') return;
  e.preventDefault(); const v = $('#habIn').value.trim(); if (!v) return;
  S.habits.push({ id: 'h' + uid(), label: v, done: false }); save(); renderSettings(); renderHabits();
});
function tickForce() { lastMin = -1; tick(); }
function afterConnect() { loadCalendar(); loadDue(); loadTasks(); refreshGovee(true); if (screen === 'music' || ST.spotify) pollMusic(true); renderMusic(); }

/* ---------------- night mode ---------------- */
let lastAct = Date.now(), nightAt = 0, screenOff = false;
function renderNightInfo() {
  const on = S.lights.some(l => l.on);
  $('#nN').textContent = `${WXD.temp}° · ${WXTEXT(WXD.code)} · Lights ${on ? 'on' : 'off'}`;
}
function enterNight() {
  if ($('#night').classList.contains('on') || $('#ring').classList.contains('on')) return;
  nightAt = Date.now(); screenOff = false;
  renderNightInfo(); $('#night').classList.add('on'); closeSheets();
  if (NAT) NAT.bright(0.02);
  if (document.activeElement) document.activeElement.blur();
}
function exitNight(keepScreen) { $('#night').classList.remove('on'); lastAct = Date.now(); if (NAT) NAT.bright(-1); if (!keepScreen) go('home'); }
['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true, capture: true }));
$('#night').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); exitNight(); });
$('#night').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
setInterval(() => {
  const isNight = $('#night').classList.contains('on');
  const typing = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if (!isNight && !typing && Date.now() - lastAct > S.settings.idle * 6e4) enterNight();
  if (isNight && !screenOff && window.fully && S.settings.screenOff > 0 && Date.now() - nightAt > S.settings.screenOff * 6e4) {
    try { window.fully.turnScreenOff(true); } catch (e) {} screenOff = true;
  }
}, 5000);
$('#gn').addEventListener('click', () => { applyScene('off'); enterNight(); });

/* ---------------- fit 1280×800 to any screen ---------------- */
function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 800); $('#stage').style.transform = `scale(${s})`; }
addEventListener('resize', fit);

/* ---------------- boot ---------------- */
fillIcons();
fit();
document.addEventListener('touchstart', () => {}, { passive: true });
requestAnimationFrame(moveNavInd); setTimeout(moveNavInd, 400); addEventListener('resize', moveNavInd);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveNavInd);
renderScenes(); renderLights(); renderTasks(); renderHabits(); renderClimate(); renderWeather(); renderCalendar();
tick();
setInterval(tick, 1000);
setInterval(musicTick, 1000);
loadWeather(); setInterval(loadWeather, 15 * 6e4);
(async () => {
  const q = new URLSearchParams(location.search);
  if (q.get('connected') || q.get('oauth_error')) {
    history.replaceState(null, '', location.pathname);
    go('settings');
    toast(q.get('connected') ? `${q.get('connected') === 'google' ? 'Google' : 'Spotify'} connected` : `Sign-in didn’t finish (${q.get('oauth_error')})`);
  }
  if (S.settings.hubKey) { await checkStatus(); afterConnect(); }
  else if (NAT) refreshGovee(true);
})();
setInterval(() => { if (ST.google) loadCalendar(); }, 5 * 6e4);
setInterval(() => { if (ST.google) loadTasks(); }, 2 * 6e4);
setInterval(() => { if (ST.ical) loadDue(); }, 30 * 6e4);
setInterval(() => { if (screen === 'music' && ST.spotify) pollMusic(Date.now() - mPolledAt > 30000 && false); }, 4000);
setInterval(() => { if (screen === 'lights') refreshGovee(); }, 30000);

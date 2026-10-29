package com.declan.homehub;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.DhcpInfo;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Home Hub for the Fire tablet.
 * - Shows the hub full screen and keeps the screen on.
 * - Can replace the Fire home screen and starts on boot.
 * - Gives the hub page a small "HubNative" bridge so it can talk to lights
 *   on the home Wi-Fi (WiZ, Cololight) and dim the backlight at night.
 */
public class MainActivity extends Activity {

    static final String HUB_URL = "https://declan-home-hub.netlify.app/";
    static final String HUB_HOST = "declan-home-hub.netlify.app";

    private WebView web;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService pool = Executors.newFixedThreadPool(4);
    private WifiManager.MulticastLock multicastLock;
    private volatile String currentHost = "";
    private boolean showingOffline = false;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#F2F1F6"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " HomeHubApp/1");

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                Uri u = Uri.parse(url);
                currentHost = u.getHost() == null ? "" : u.getHost();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith(HUB_URL)) showingOffline = false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (Build.VERSION.SDK_INT >= 23 && request.isForMainFrame()) showOffline();
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (Build.VERSION.SDK_INT < 23) showOffline();
            }
        });

        web.addJavascriptInterface(new Bridge(), "HubNative");

        WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
        if (wm != null) {
            multicastLock = wm.createMulticastLock("homehub");
            multicastLock.setReferenceCounted(false);
            multicastLock.acquire();
        }

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(HUB_URL);
    }

    /** Simple screen shown while the Wi-Fi or the site is down; retries on its own. */
    private void showOffline() {
        if (showingOffline) return;
        showingOffline = true;
        String html = "<html><body style=\"margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;"
                + "background:#F2F1F6;font-family:sans-serif;color:#16151D\">"
                + "<div style=\"font-size:40px;font-weight:600\">Can’t reach the hub</div>"
                + "<div style=\"font-size:22px;color:#686676;margin-top:12px\">Check the Wi-Fi. Trying again every 15 seconds…</div>"
                + "</body></html>";
        web.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
        ui.postDelayed(retry, 15000);
    }

    private final Runnable retry = new Runnable() {
        @Override public void run() {
            if (showingOffline) { showingOffline = false; web.loadUrl(HUB_URL); }
        }
    };

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onBackPressed() {
        // Kiosk: back only navigates inside the hub (e.g. returning from a sign-in page).
        if (web.canGoBack()) web.goBack();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Pressing Home while already in the hub: just make sure the hub is showing.
        String url = web.getUrl();
        if (url == null || !url.startsWith(HUB_URL)) web.loadUrl(HUB_URL);
    }

    @Override
    protected void onDestroy() {
        if (multicastLock != null && multicastLock.isHeld()) multicastLock.release();
        pool.shutdownNow();
        super.onDestroy();
    }

    /* ---------------- helpers ---------------- */

    private void callback(final int id, final String json) {
        ui.post(new Runnable() {
            @Override public void run() {
                web.evaluateJavascript("window.__hubCb&&window.__hubCb(" + id + "," + JSONObject.quote(json) + ")", null);
            }
        });
    }

    private static byte[] hexToBytes(String hex) {
        hex = hex.replaceAll("[^0-9a-fA-F]", "");
        byte[] out = new byte[hex.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    private static String bytesToHex(byte[] b, int len) {
        StringBuilder sb = new StringBuilder(len * 2);
        for (int i = 0; i < len; i++) sb.append(String.format("%02x", b[i] & 0xff));
        return sb.toString();
    }

    private InetAddress broadcastAddress() {
        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            DhcpInfo d = wm == null ? null : wm.getDhcpInfo();
            if (d == null || d.ipAddress == 0) return InetAddress.getByName("255.255.255.255");
            int b = (d.ipAddress & d.netmask) | ~d.netmask;
            byte[] q = new byte[4];
            for (int k = 0; k < 4; k++) q[k] = (byte) ((b >> (k * 8)) & 0xFF);
            return InetAddress.getByAddress(q);
        } catch (Exception e) {
            try { return InetAddress.getByName("255.255.255.255"); } catch (Exception e2) { return null; }
        }
    }

    /* ---------------- bridge used by the hub page ---------------- */

    private class Bridge {
        /** Only the hub site may use the bridge — never a sign-in page or anything else. */
        private boolean allowed() { return HUB_HOST.equals(currentHost); }

        @JavascriptInterface
        public String version() { return allowed() ? "1" : ""; }

        /** Send one UDP packet and (optionally) wait for one reply. */
        @JavascriptInterface
        public void udp(final String host, final int port, final String payload, final boolean hex, final int timeoutMs, final int id) {
            if (!allowed()) return;
            pool.execute(new Runnable() {
                @Override public void run() {
                    JSONObject r = new JSONObject();
                    DatagramSocket sock = null;
                    try {
                        sock = new DatagramSocket();
                        sock.setSoTimeout(Math.max(1, timeoutMs));
                        byte[] data = hex ? hexToBytes(payload) : payload.getBytes(StandardCharsets.UTF_8);
                        sock.send(new DatagramPacket(data, data.length, InetAddress.getByName(host), port));
                        if (timeoutMs > 0) {
                            byte[] buf = new byte[4096];
                            DatagramPacket p = new DatagramPacket(buf, buf.length);
                            try {
                                sock.receive(p);
                                r.put("data", hex ? bytesToHex(buf, p.getLength()) : new String(buf, 0, p.getLength(), StandardCharsets.UTF_8));
                            } catch (SocketTimeoutException te) {
                                r.put("timeout", true);
                            }
                        }
                        r.put("ok", true);
                    } catch (Exception e) {
                        try { r.put("ok", false); r.put("error", String.valueOf(e.getMessage())); } catch (Exception ignored) { }
                    } finally {
                        if (sock != null) sock.close();
                    }
                    callback(id, r.toString());
                }
            });
        }

        /** Broadcast a UDP packet on the Wi-Fi and collect every reply for waitMs. */
        @JavascriptInterface
        public void broadcast(final int port, final String payload, final boolean hex, final int waitMs, final int id) {
            if (!allowed()) return;
            pool.execute(new Runnable() {
                @Override public void run() {
                    JSONObject r = new JSONObject();
                    JSONArray found = new JSONArray();
                    DatagramSocket sock = null;
                    try {
                        sock = new DatagramSocket();
                        sock.setBroadcast(true);
                        sock.setSoTimeout(250);
                        byte[] data = hex ? hexToBytes(payload) : payload.getBytes(StandardCharsets.UTF_8);
                        InetAddress[] targets = { broadcastAddress(), InetAddress.getByName("255.255.255.255") };
                        for (int round = 0; round < 3; round++) {
                            for (InetAddress t : targets) if (t != null) sock.send(new DatagramPacket(data, data.length, t, port));
                        }
                        Set<String> seen = new HashSet<>();
                        long end = System.currentTimeMillis() + Math.max(500, waitMs);
                        byte[] buf = new byte[4096];
                        while (System.currentTimeMillis() < end) {
                            DatagramPacket p = new DatagramPacket(buf, buf.length);
                            try { sock.receive(p); } catch (SocketTimeoutException te) { continue; }
                            String ip = p.getAddress().getHostAddress();
                            if (!seen.add(ip)) continue;
                            JSONObject o = new JSONObject();
                            o.put("ip", ip);
                            o.put("data", hex ? bytesToHex(buf, p.getLength()) : new String(buf, 0, p.getLength(), StandardCharsets.UTF_8));
                            found.put(o);
                        }
                        r.put("ok", true);
                        r.put("found", found);
                    } catch (Exception e) {
                        try { r.put("ok", false); r.put("error", String.valueOf(e.getMessage())); } catch (Exception ignored) { }
                    } finally {
                        if (sock != null) sock.close();
                    }
                    callback(id, r.toString());
                }
            });
        }

        /** 0.0–1.0 sets the backlight for this app; any negative value goes back to the system setting. */
        @JavascriptInterface
        public void setBrightness(final float v) {
            if (!allowed()) return;
            ui.post(new Runnable() {
                @Override public void run() {
                    WindowManager.LayoutParams lp = getWindow().getAttributes();
                    lp.screenBrightness = v < 0 ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE : Math.max(0.01f, Math.min(1f, v));
                    getWindow().setAttributes(lp);
                }
            });
        }

        /** Escape hatch out of the kiosk: opens the Fire's own Settings app. */
        @JavascriptInterface
        public void openSystemSettings() {
            if (!allowed()) return;
            ui.post(new Runnable() {
                @Override public void run() {
                    try { startActivity(new Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); } catch (Exception ignored) { }
                }
            });
        }

        @JavascriptInterface
        public void reload() {
            if (!allowed()) return;
            ui.post(new Runnable() { @Override public void run() { web.loadUrl(HUB_URL); } });
        }
    }
}

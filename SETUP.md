# Home Hub: setup

Your Netlify site already exists: **declan-home-hub** (https://declan-home-hub.netlify.app). These steps put the code on it and connect your accounts.

## 1. Deploy (on your PC, about 5 min)
You need Node.js installed (nodejs.org). Then, in this folder:

```
npm install
npx netlify-cli login
npx netlify-cli link --id 21b6aff8-db58-4193-847e-c3d86c0168fe
npx netlify-cli env:set HUB_KEY YOUR_HUB_KEY --scope functions
npx netlify-cli deploy --prod
```
Use the hub key Claude gave you in place of YOUR_HUB_KEY. Every time the code changes later, only the last command needs to run again.

## 2. Open it and enter the hub key
Go to https://declan-home-hub.netlify.app, then Settings. Paste the hub key and tap Save. "Server connected" should turn green.
Do this once on the Fire and once on your PC. The PC is easier for pasting API keys.

## 3. Govee
1. In the Govee Home app, go to Profile, then the gear icon, then **Apply for API Key**. The key arrives by email.
2. In the hub, go to Settings, then API keys, then Govee API key, then Save keys.
3. Tap **Import Govee lights**, then delete the placeholder Govee light.

## 4. Google Calendar + Tasks
1. Go to console.cloud.google.com and create a project (for example "Home Hub").
2. Under APIs & Services, then Library, enable **Google Calendar API** and **Google Tasks API**.
3. Under OAuth consent screen, choose External, use your Gmail, and add yourself as a test user. Then press **Publish app**. If you skip publishing, Google signs you out every 7 days. You'll see an "unverified app" warning when you sign in; that's normal for your own app, so click Advanced, then Continue.
4. Under Credentials, choose Create credentials, then OAuth client ID, then **Web application**. For the Authorized redirect URI, paste:
   `https://declan-home-hub.netlify.app/api/google/callback`
5. Paste the client ID and secret into the hub (Settings, then API keys), save, then tap **Connect Google**.

## 5. Spotify (needs Spotify Premium)
1. Go to developer.spotify.com/dashboard and create an app. Check "Web API". For the Redirect URI, paste:
   `https://declan-home-hub.netlify.app/api/spotify/callback`
2. Paste the client ID and secret into the hub, save, then tap **Connect Spotify**.

## 6. UAlbany due dates (Brightspace)
In Brightspace, open Calendar, then Subscribe. Copy the feed link and paste it into "Brightspace calendar link".

## 7. Build the Fire app (one time, on your PC)
The app shows the hub full screen, keeps the screen on, starts on boot, and controls WiZ and Cololight lights over your Wi-Fi.
1. Install **Android Studio** (developer.android.com/studio). It's free.
2. Choose Open, then select the **android** folder from this project. Wait for the first sync. It downloads its own tools, which takes about 10 minutes the first time.
3. Go to **Build, then Build App Bundle(s) / APK(s), then Build APK(s)**. When it finishes, click **locate** and you'll find `app-debug.apk`.
   (Another option: push this folder to GitHub. The included workflow builds the APK under the Actions tab.)

## 8. Install it on the Fire
1. Get the APK onto the Fire. You can email it to yourself, use Google Drive, or use a USB cable.
2. On the Fire, open it from the Files app. If asked, allow installs from that app (unknown sources).
3. Open **Home Hub**, then go to Settings and paste your hub key.
4. Connect Google from your **computer's** browser, because Google blocks sign-in inside apps. Once it's connected on the server, the tablet picks it up automatically.
5. On the Fire, go to Settings, then This tablet, then **Find WiZ lights**. For Cololight, type its IP address (from the Cololight app or your router) and tap Add as Cololight. Then delete the old placeholder lights.

## 9. Make the hub the only thing on the Fire (optional, undoable)
This needs a USB cable and ADB on your PC (search "Android SDK Platform-Tools").
1. On the Fire, go to Settings, then Device Options, then About Fire Tablet. Tap **Serial Number** 7 times. Then go to Device Options, then Developer Options, and turn on **USB debugging**.
2. Plug in the Fire and run:
   ```
   adb devices
   adb shell pm disable-user --user 0 com.amazon.firelauncher
   ```
3. Press Home and choose **Home Hub, then Always**. Now the Fire boots straight into the hub, and Home always comes back to it.
4. Turn off the Fire's lock screen (Settings, then Security & Privacy) so it never asks for a PIN.
- **Getting out:** in the hub, go to Settings, then This tablet, then **Open Fire settings**.
- **Undo completely:** `adb shell pm enable com.amazon.firelauncher`
- **If it doesn't take:** some newer Fire OS versions block this step. The hub still opens on boot and stays full screen; only the Home button goes to Amazon's screen instead.

## What's still placeholder
- **Wyze lights:** they work on screen only for now, because Wyze has no official local or developer control for bulbs.
- **WiZ and Cololight:** they only work from inside the Fire app, not from a regular browser.
- **AC:** the setpoint changes on screen only. Quext has no public API.

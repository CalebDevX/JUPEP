---
name: EAS APK Build
description: How to trigger an Android APK build using EAS CLI from within Replit's main agent environment.
---

# EAS APK Build

## Key facts
- EAS CLI is a **Nix system binary** — NOT in `jupeb-mobile/node_modules/.bin/eas` (that path does not exist)
- Locate with: `which eas` → `/nix/store/spvnxml8f61qy1jrnlfz9p1yhjyh0f4j-eas-cli-14.7.1/bin/eas`
- Always use the full Nix path in commands; the Nix hash may change on channel updates so run `which eas` if unsure
- Set `"version": ">= 14.7.1"` in eas.json cli block
- jupeb-mobile is NOT in pnpm-workspace.yaml — its deps are never installed in Replit; DO NOT try `npm install` (times out)
- **`app.config.js`** wraps `app.json` and conditionally skips plugins that can't be resolved locally — fixes "Failed to resolve plugin for expo-router" without needing node_modules installed
- Project: `achek/jupeb-mobile`, projectId `88c415e3-b466-44f9-9018-50a1230331a8` (new, updated June 2026; old was `098db203-360d-4059-af9a-2769bebd0e64`)
- Package name: `com.jupeb.prep`
- `eas.json` at `artifacts/jupeb-mobile/eas.json` — `preview` profile = APK, `production` = AAB

## Build command (main agent)
```bash
cd artifacts/jupeb-mobile && EAS_NO_VCS=1 EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview --non-interactive --no-wait
```

**Why `EAS_NO_VCS=1`:** Skips git archive — Replit blocks git in the main agent.
**Why `EAS_SKIP_AUTO_FINGERPRINT=1`:** Skips fingerprint detection which can hang.
**Why `--no-wait`:** Don't block the terminal waiting for the build; check status separately.

## Critical install rules (hard-won)

1. **NEVER commit a `package-lock.json`** — `npm ci` with any generated lockfile hangs or fails on EAS cloud. Without a lock file, EAS runs `npm install` which works.
2. **`npm_config_legacy_peer_deps=true` in eas.json env** — this is the correct form for npm config env vars. `NPM_FLAGS` alone is insufficient.
3. **`.npmrc` must have `legacy-peer-deps=true`** — belt-and-suspenders alongside the env var.
4. **`.nvmrc` with `20`** — forces EAS to use Node 20; without it older Node may be picked.
5. **No `"node"` field in eas.json build profiles** — this is invalid EAS config and breaks the "Read app config" phase silently with "UNKNOWN_ERROR".

**Why:** The jupeb-mobile project has peer dependency conflicts (React 19 + older Expo peer expectations). `npm ci` always fails because the lockfile format and peer constraints can't reconcile without `--legacy-peer-deps`. Running `npm install` with the flag set via npmrc + env var is the only path that works.

## Android Kotlin version (REQUIRED)
- **`android/build.gradle` must pin `kotlinVersion = "2.1.20"`** in `buildscript { ext { ... } }` and reference it in the classpath: `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")`
- Without the explicit version, Gradle resolves Kotlin to 2.0.21 which Expo SDK 56 rejects with: "Kotlin 2.0.21 is not supported by Expo modules. The minimum supported Kotlin version is 2.1.20."
- **`runtimeVersion` in `app.config.js` must be a hardcoded string** like `"1.0.0"` — bare workflow does NOT support `{ policy: 'appVersion' }`.

## Google Sign-In (Android)
- Uses `expo-auth-session/providers/google` with `androidClientId`
- **Do NOT set an explicit `redirectUri`** — expo-auth-session auto-generates the correct reverse-DNS redirect URI from the androidClientId
- **Do NOT add `jupeb://` custom schemes** to Google Cloud Console Web clients — Google rejects non-HTTPS URIs there
- Android OAuth client verification is done via **package name + SHA-1**, not redirect URIs; no Cloud Console redirect URI registration needed
- SHA-1 of release keystore (keystore/jupeb-release.keystore, alias jupeb-release): `2E:8C:8E:77:34:BF:8D:0A:EA:6B:5F:1A:78:75:12:50:E9:FA:5E:EB`

## Checking build status
```bash
cd artifacts/jupeb-mobile && EAS_NO_VCS=1 eas build:list --platform android --limit 1 --non-interactive
# For JSON details including error message:
cd artifacts/jupeb-mobile && EAS_NO_VCS=1 eas build:list --platform android --limit 1 --non-interactive --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d[0], indent=2))"
```

## EXPO_TOKEN
- Stored as Replit secret `EXPO_TOKEN`
- Token belongs to account `achek-team`
- If token expires: expo.dev → Settings → Access Tokens → Create new → update Replit secret

## Tunnel mode
- ngrok tunnel (`expo start --tunnel`) blocked on Replit cloud: "Cannot use ngrok with a robot user"
- Use `--web --port 8000` for dev preview; native testing requires the APK

## Build times
- Queue + build: ~15–25 minutes on EAS cloud servers
- APK download link appears in build details once status = `finished`

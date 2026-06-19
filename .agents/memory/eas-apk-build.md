---
name: EAS APK Build
description: How to trigger an Android APK build using EAS CLI from within Replit's main agent environment.
---

# EAS APK Build

## Key facts
- EAS CLI installed as devDependency in `artifacts/jupeb-mobile/node_modules/.bin/eas`
- Project: `achek-team/jupeb-mobile`, projectId `098db203-360d-4059-af9a-2769bebd0e64`
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

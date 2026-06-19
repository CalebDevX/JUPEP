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
cd artifacts/jupeb-mobile && EXPO_TOKEN=$EXPO_TOKEN EAS_NO_VCS=1 ./node_modules/.bin/eas build --platform android --profile preview --non-interactive
```

**Why `EAS_NO_VCS=1`:** The EAS CLI normally runs `git archive` to compress the upload. Replit's main agent blocks destructive git operations, so this flag skips git and uses all files directly.

## Checking build status
```bash
cd artifacts/jupeb-mobile && EXPO_TOKEN=$EXPO_TOKEN EAS_NO_VCS=1 ./node_modules/.bin/eas build:view <BUILD_ID>
```

## EXPO_TOKEN
- Stored as Replit secret `EXPO_TOKEN`
- Token belongs to account `achek-team`
- If token expires: expo.dev → Settings → Access Tokens → Create new → update Replit secret

## Build times
- Queue + build: ~10–20 minutes on EAS cloud servers
- APK download link appears in build details once status = `finished`

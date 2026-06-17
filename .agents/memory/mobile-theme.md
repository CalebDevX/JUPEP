---
name: Mobile Theme System
description: Color palette, useTheme hook, and design conventions for the Expo mobile app
---

## Color Palette
- **Light**: background `#ffffff`, primary `#f97316` (orange), invertedBg `#0f172a` (for streak card)
- **Dark**: background `#09090b`, primary `#fb923c`, invertedBg `#f97316`
- No blue/purple anywhere — orange is the brand accent

## Key tokens
- `invertedBg` / `invertedFg` — used on the streak card (dark bg in light mode, orange bg in dark)
- `heroBg` — now `#0f172a` (near-black) in light, used for Notes/Course header banners
- `primaryDim` — `rgba(249,115,22,0.10)` — used for badge backgrounds, icon bg

## Theme pattern
```ts
const C = useTheme();
const S = useMemo(() => makeStyles(C), [C]);
```
- `makeStyles(C)` receives `AppColors` and returns a `StyleSheet`
- `@react-native-async-storage/async-storage` must be installed (was missing, caused Metro 500)

**Why:** User explicitly rejected dark blue/purple — switched to orange accent + pure white light / near-black dark.

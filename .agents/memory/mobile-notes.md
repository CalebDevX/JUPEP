---
name: Mobile Notes Tab & Reading Progress
description: Textbook notes feature and chapter reading tracker in the mobile app
---

## Data flow
- `GET /api/textbook/courses` → list of courses with chapters summary
- `GET /api/textbook/courses/:courseId/chapters/:chapterId` → full chapter content
- Textbook data sourced from `artifacts/crs003-textbook/src/data/`

## Reading progress tracker
- When a chapter is opened: `AsyncStorage.setItem('jupeb_chapter_read_${chapterId}', timestamp)`
- Course screen: loads all keys via `AsyncStorage.multiGet`, shows progress bar + checkmarks
- Dashboard: counts all `jupeb_chapter_read_*` keys via `AsyncStorage.getAllKeys()` → shows "X chapters read" stat in streak card

## Routes
- `/(tabs)/notes` — subject group list
- `/notes/[courseId]` — chapter list with reading progress bar
- `/notes/chapter/[chapterId]?courseId=...` — full reading view, marks as read on load

**Why:** Reading progress uses AsyncStorage (device-local) not DB — no auth required, instant, works offline.

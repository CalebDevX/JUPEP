---
name: Google GenAI SDK v1.x text property
description: Breaking change in @google/genai ≥1.x — .text is a getter property, not a method
---

In `@google/genai` v1.x (tested at v1.52.0), the `GenerateContentResponse` object exposes text as a **getter property**, not a callable method.

**Rule:** Use `response.text` and `chunk.text` — never `response.text()` or `chunk.text()`.

**Why:** The SDK changed `.text()` from a method to a getter between major versions. Calling it as a function throws `"chunk.text is not a function"` / `"response.text is not a function"`.

**How to apply:** Applies to all routes in ai.ts that call `generateContent` or `generateContentStream`. Affects: chat (streaming chunks), generate-notes, explain-question, learn-from-source, quiz-from-note.

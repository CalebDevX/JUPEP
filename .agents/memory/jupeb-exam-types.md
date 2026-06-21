---
name: JUPEB Exam Type Architecture
description: How paper codes and exam types relate in UNILAG SFS JUPEB; how mobile quiz groups are structured
---

## UNILAG SFS JUPEB Exam Structure

Papers 001 and 002 are tested TOGETHER in both the 1st In-Course and 1st Semester exams.
Papers 003 and 004 are tested TOGETHER in both the 2nd In-Course and 2nd Semester exams.

| Exam              | Papers tested        |
|-------------------|----------------------|
| 1st In-Course     | 001 + 002 (together) |
| 1st Semester      | 001 + 002 (together) |
| 2nd In-Course     | 003 + 004 (together) |
| Mock Exam         | 001 + 002 + 003 + 004|
| JUPEB Final       | 001 + 002 + 003 + 004|

The paper number alone does NOT tell you which exam a question appeared in — 001 and 002 are shared by both the 1st In-Course and 1st Semester exams. The only way to know which exam a question appeared in is the `exam_type` DB field.

## Two DB fields on every question

- `paper` ("001"|"002"|"003"|"004") — which syllabus book/unit the content comes from
- `exam_type` ("first_incourse"|"first_semester"|"second_incourse"|"mock"|"final_jupeb") — which actual exam this question appeared in

## Mobile quiz grouping

Groups are keyed as `${subjectId}-${examType}-${questionType}-${year}` (exam_type-based, NOT paper-based).

- `getQuizGroups` returns `exam_type as examType`; quiz.tsx filters on `g.examType ?? g.paper`
- Subject filter uses LIKE matching so "CRS" matches "CRS001"
- SQLite quiz_groups table has `exam_type TEXT` column (nullable, auto-migrated via ALTER TABLE in saveQuizGroup)

## Fallback for legacy questions (no exam_type in DB)

When `exam_type` is null, PAPER_TO_EXAM_TYPE in sync.ts guesses:
- 001 → first_incourse (best guess only; both 001+002 appear in incourse AND semester)
- 002 → first_incourse (same — paper alone cannot distinguish the two exams)
- 003 → second_incourse
- 004 → second_incourse

**Why:** Without exam_type set on a question, it's impossible to know if it was 1st In-Course or 1st Semester (both use papers 001+002). Fallback groups legacy data under incourse to avoid lost questions; a re-upload with proper exam_type fixes it.

**How to apply:** Always ensure questions uploaded to the DB have exam_type set. Never try to infer 1st In-Course vs 1st Semester purely from paper number.

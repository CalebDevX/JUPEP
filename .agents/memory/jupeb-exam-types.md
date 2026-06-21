---
name: JUPEB Exam Type Architecture
description: How paper codes and exam types relate; how mobile quiz groups are structured
---

## Paper codes vs Exam Types

Questions have TWO separate fields:
- `paper` ("001"|"002"|"003"|"004") — which syllabus unit/book the content comes from
- `exam_type` ("first_incourse"|"first_semester"|"second_incourse"|"mock"|"final_jupeb") — which actual exam this question appeared in

## Exam type → paper mapping (EXAM_TYPE_PAPERS in lib/db)
- first_incourse → papers 001 + 002 (first portion of those syllabus units)
- first_semester → papers 001 + 002 (remaining portion not covered in incourse)
- second_incourse → papers 003 + 004
- mock → all papers 001+002+003+004
- final_jupeb → all papers 001+002+003+004

## Why 1st Incourse and 1st Semester both use 001+002
They test DIFFERENT TOPICS within the same papers. 1st Incourse covers the first half of the 001+002 syllabus; 1st Semester covers the remaining half. The exam_type field distinguishes them.

## Mobile quiz group structure
Groups are keyed as `${subjectId}-${examType}-${questionType}-${year}` (NOT paper-based).
- Legacy questions without exam_type fall back to PAPER_TO_EXAM_TYPE mapping: 001→first_incourse, 002→first_semester, 003→second_incourse, 004→second_incourse
- SQLite quiz_groups table has `exam_type TEXT` column (nullable, migrated via ALTER TABLE)
- `getQuizGroups` uses LIKE matching for subject codes so "CRS" matches "CRS001"

**Why:** Grouping by paper alone merges 1st Incourse and 1st Semester (both paper 001+002) into the same filter, defeating the purpose of separate practice modes.

**How to apply:** When creating quiz groups in sync.ts, always use the exam_type field. When filtering in quiz.tsx, match on `g.examType ?? g.paper` against the EXAM_TYPES codes (which are now exam_type strings, not paper codes).

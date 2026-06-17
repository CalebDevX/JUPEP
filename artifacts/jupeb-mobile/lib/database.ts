import * as SQLite from 'expo-sqlite';

const PAPER_LABELS: Record<string, string> = {
  '001': '1st In-Course',
  '002': '1st Semester',
  '003': '2nd In-Course',
  '004': '2nd Semester',
  mock: 'Full Mock',
};

export interface DBSubject {
  id: number;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
}

export interface DBQuizGroup {
  id: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  paper: string;
  paperLabel: string;
  questionType: string;
  year: number | null;
  questionCount: number;
  syncedAt: string;
}

export interface DBQuestion {
  id: number;
  groupId: string;
  subjectId: number;
  questionText: string;
  options: string;
  correctOption: string;
  explanation: string | null;
  marks: number;
}

export interface DBQuizAttempt {
  id: string;
  groupId: string;
  score: number;
  total: number;
  answers: string;
  completedAt: string;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('jupeb.db');
    await initializeDB(dbInstance);
  }
  return dbInstance;
}

async function initializeDB(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS quiz_groups (
      id TEXT PRIMARY KEY,
      subject_id INTEGER NOT NULL,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      paper TEXT NOT NULL,
      paper_label TEXT NOT NULL,
      question_type TEXT NOT NULL,
      year INTEGER,
      question_count INTEGER NOT NULL DEFAULT 0,
      synced_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY,
      group_id TEXT NOT NULL,
      subject_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      marks INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      answers TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_log (
      key TEXT PRIMARY KEY,
      synced_at TEXT NOT NULL
    );
  `);
}

export async function saveSubjects(subjects: any[]): Promise<void> {
  const db = await getDB();
  for (const s of subjects) {
    await db.runAsync(
      'INSERT OR REPLACE INTO subjects (id, code, name, description, color) VALUES (?, ?, ?, ?, ?)',
      [s.id, s.code ?? '', s.name ?? '', s.description ?? null, s.color ?? null]
    );
  }
}

export async function saveQuestionsForGroup(
  questions: any[],
  groupId: string,
  subjectId: number
): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM questions WHERE group_id = ?', [groupId]);
  for (const q of questions) {
    const opts = typeof q.options === 'string' ? q.options : JSON.stringify(q.options ?? {});
    await db.runAsync(
      'INSERT OR REPLACE INTO questions (id, group_id, subject_id, question_text, options, correct_option, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [q.id, groupId, subjectId, q.questionText ?? '', opts, q.correctOption ?? '', q.explanation ?? null, q.marks ?? 1]
    );
  }
}

export async function saveQuizGroup(group: {
  id: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  paper: string;
  questionType: string;
  year: number | null;
  questionCount: number;
}): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT OR REPLACE INTO quiz_groups (id, subject_id, subject_code, subject_name, paper, paper_label, question_type, year, question_count, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      group.id, group.subjectId, group.subjectCode, group.subjectName,
      group.paper, PAPER_LABELS[group.paper] ?? group.paper,
      group.questionType, group.year, group.questionCount, new Date().toISOString(),
    ]
  );
}

export async function getQuizGroups(subjectCode?: string): Promise<DBQuizGroup[]> {
  const db = await getDB();
  if (subjectCode && subjectCode !== 'ALL') {
    return db.getAllAsync<DBQuizGroup>(
      `SELECT id, subject_id as subjectId, subject_code as subjectCode,
       subject_name as subjectName, paper, paper_label as paperLabel,
       question_type as questionType, year, question_count as questionCount,
       synced_at as syncedAt FROM quiz_groups
       WHERE subject_code = ? ORDER BY year DESC, paper ASC`,
      [subjectCode]
    );
  }
  return db.getAllAsync<DBQuizGroup>(
    `SELECT id, subject_id as subjectId, subject_code as subjectCode,
     subject_name as subjectName, paper, paper_label as paperLabel,
     question_type as questionType, year, question_count as questionCount,
     synced_at as syncedAt FROM quiz_groups
     ORDER BY subject_code ASC, year DESC, paper ASC`
  );
}

export async function getQuestionsForGroup(groupId: string): Promise<DBQuestion[]> {
  const db = await getDB();
  return db.getAllAsync<DBQuestion>(
    `SELECT id, group_id as groupId, subject_id as subjectId,
     question_text as questionText, options, correct_option as correctOption,
     explanation, marks FROM questions WHERE group_id = ? ORDER BY id`,
    [groupId]
  );
}

export async function saveAttempt(attempt: {
  groupId: string;
  score: number;
  total: number;
  answers: Record<number, string>;
}): Promise<string> {
  const db = await getDB();
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  await db.runAsync(
    'INSERT INTO quiz_attempts (id, group_id, score, total, answers, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, attempt.groupId, attempt.score, attempt.total, JSON.stringify(attempt.answers), new Date().toISOString()]
  );
  return id;
}

export async function getBestAttempt(groupId: string): Promise<{ score: number; total: number } | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ score: number; total: number }>(
    'SELECT score, total FROM quiz_attempts WHERE group_id = ? ORDER BY score DESC LIMIT 1',
    [groupId]
  );
  return row ?? null;
}

export async function setSyncLog(key: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('INSERT OR REPLACE INTO sync_log (key, synced_at) VALUES (?, ?)', [key, new Date().toISOString()]);
}

export async function getSyncLog(key: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ synced_at: string }>('SELECT synced_at FROM sync_log WHERE key = ?', [key]);
  return row?.synced_at ?? null;
}

export async function clearSyncLog(key: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM sync_log WHERE key = ?', [key]);
}

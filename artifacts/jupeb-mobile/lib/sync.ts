import { getApiUrl } from './query-client';
import {
  saveSubjects,
  saveQuestionsForGroup,
  saveQuizGroup,
  setSyncLog,
  getSyncLog,
  clearSyncLog,
} from './database';

const SYNC_STALE_MS = 12 * 60 * 60 * 1000; // 12 hours

async function fetchJSON<T>(path: string): Promise<T> {
  const url = new URL(path, getApiUrl());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

interface ApiSubject {
  id: number;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
}

interface ApiQuestion {
  id: number;
  subjectId: number;
  subjectName: string;
  paper: string;
  year: number;
  questionType: string;
  questionText: string;
  options: any;
  correctOption: string;
  explanation: string | null;
  marks: number;
}

export async function isStale(): Promise<boolean> {
  const lastSync = await getSyncLog('quiz_sync');
  if (!lastSync) return true;
  return Date.now() - new Date(lastSync).getTime() > SYNC_STALE_MS;
}

export async function syncQuizData(
  enrolledCodes: string[],
  onProgress?: (msg: string) => void
): Promise<{ synced: number; error: string | null }> {
  try {
    const stale = await isStale();
    if (!stale) return { synced: 0, error: null };

    onProgress?.('Connecting to server...');
    const allSubjects = await fetchJSON<ApiSubject[]>('/subjects');
    await saveSubjects(allSubjects);

    const upper = enrolledCodes.map(c => c.toUpperCase());
    let targetSubjects = allSubjects.filter(s => upper.includes(s.code.toUpperCase()));
    if (targetSubjects.length === 0) targetSubjects = allSubjects.slice(0, 3);

    let totalSynced = 0;

    for (const subject of targetSubjects) {
      onProgress?.(`Syncing ${subject.name}...`);
      let offset = 0;
      const pageSize = 100;
      const allQuestions: ApiQuestion[] = [];

      // Paginate to get all questions
      while (true) {
        const page = await fetchJSON<ApiQuestion[]>(
          `/questions?subjectId=${subject.id}&limit=${pageSize}&offset=${offset}`
        );
        allQuestions.push(...page);
        if (page.length < pageSize) break;
        offset += pageSize;
      }

      if (allQuestions.length === 0) continue;

      // Group by paper + questionType + year
      const groups = new Map<string, ApiQuestion[]>();
      for (const q of allQuestions) {
        const key = `${subject.id}-${q.paper}-${q.questionType}-${q.year}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(q);
      }

      for (const [groupId, qs] of groups.entries()) {
        const first = qs[0];
        await saveQuizGroup({
          id: groupId,
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          paper: first.paper,
          questionType: first.questionType,
          year: first.year ?? null,
          questionCount: qs.length,
        });
        await saveQuestionsForGroup(qs, groupId, subject.id);
        totalSynced += qs.length;
      }
    }

    await setSyncLog('quiz_sync');
    onProgress?.(`Done — ${totalSynced} questions saved`);
    return { synced: totalSynced, error: null };
  } catch (err: any) {
    return { synced: 0, error: err.message ?? 'Sync failed' };
  }
}

export async function forceSync(
  enrolledCodes: string[],
  onProgress?: (msg: string) => void
): Promise<{ synced: number; error: string | null }> {
  await clearSyncLog('quiz_sync');
  return syncQuizData(enrolledCodes, onProgress);
}

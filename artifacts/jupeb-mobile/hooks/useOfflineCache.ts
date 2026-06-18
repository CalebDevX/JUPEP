/**
 * Shared utilities for the offline chapter download system.
 * Keys used:
 *   jupeb_chapter_cache_{chapterId}        – full chapter JSON
 *   jupeb_chapter_downloaded_{chapterId}   – "1" if explicitly downloaded (vs just read)
 *   jupeb_courses_cache                    – courses list JSON
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBase } from '@/lib/query-client';

export const CHAPTER_CACHE_KEY   = (id: string) => `jupeb_chapter_cache_${id}`;
export const CHAPTER_DLOADED_KEY = (id: string) => `jupeb_chapter_downloaded_${id}`;
export const COURSES_CACHE_KEY   = 'jupeb_courses_cache';

/** Returns true if the chapter body has been cached locally. */
export async function isChapterCached(chapterId: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(CHAPTER_CACHE_KEY(chapterId));
  return v !== null;
}

/** Returns a set of chapter IDs that are currently cached. */
export async function getCachedChapterIds(chapterIds: string[]): Promise<Set<string>> {
  const keys  = chapterIds.map(CHAPTER_CACHE_KEY);
  const pairs = await AsyncStorage.multiGet(keys);
  const result = new Set<string>();
  pairs.forEach(([key, val]) => {
    if (val !== null) result.add(key.replace('jupeb_chapter_cache_', ''));
  });
  return result;
}

/** Fetches and caches a single chapter. Returns the chapter data. */
export async function downloadChapter(
  courseId: string,
  chapterId: string
): Promise<object> {
  const base = getApiBase();
  const res  = await fetch(`${base}/textbook/courses/${courseId}/chapters/${chapterId}`);
  if (!res.ok) throw new Error(`Server ${res.status}`);
  const data = await res.json();
  await AsyncStorage.setItem(CHAPTER_CACHE_KEY(chapterId), JSON.stringify(data));
  await AsyncStorage.setItem(CHAPTER_DLOADED_KEY(chapterId), '1');
  return data;
}

/** Removes cached data for a chapter. */
export async function evictChapter(chapterId: string): Promise<void> {
  await AsyncStorage.multiRemove([CHAPTER_CACHE_KEY(chapterId), CHAPTER_DLOADED_KEY(chapterId)]);
}

/** Hook: manages bulk downloading of all chapters for a course. */
export function useBulkDownload(
  courseId: string,
  chapters: { id: string }[]
) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress]       = useState(0); // 0-100
  const [cached, setCached]           = useState<Set<string>>(new Set());
  const [error, setError]             = useState<string | null>(null);

  const refreshCached = useCallback(async () => {
    if (chapters.length === 0) return;
    const ids = chapters.map(c => c.id);
    const set = await getCachedChapterIds(ids);
    setCached(set);
  }, [chapters]);

  useEffect(() => { refreshCached(); }, [refreshCached]);

  const allCached = chapters.length > 0 && cached.size >= chapters.length;

  const downloadAll = useCallback(async () => {
    if (downloading || chapters.length === 0) return;
    setDownloading(true);
    setError(null);
    setProgress(0);
    let done = 0;
    for (const ch of chapters) {
      try {
        if (!cached.has(ch.id)) {
          await downloadChapter(courseId, ch.id);
          setCached(prev => new Set([...prev, ch.id]));
        }
      } catch (e: any) {
        setError(`Failed to download chapter. Check your connection.`);
        // don't abort — continue with remaining chapters
      }
      done++;
      setProgress(Math.round((done / chapters.length) * 100));
    }
    setDownloading(false);
    await refreshCached();
  }, [courseId, chapters, cached, downloading, refreshCached]);

  const clearAll = useCallback(async () => {
    await Promise.all(chapters.map(ch => evictChapter(ch.id)));
    setCached(new Set());
    setProgress(0);
  }, [chapters]);

  return { downloading, progress, cached, allCached, downloadAll, clearAll, error };
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useBulkDownload, COURSES_CACHE_KEY } from '@/hooks/useOfflineCache';
import { getApiBase } from '@/lib/query-client';
import type { AppColors } from '@/constants/colors';

type Chapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  sectionCount: number;
  keyTermCount: number;
};

type CourseDetail = {
  id: string;
  code: string;
  title: string;
  semester: string;
  units: number;
  description: string;
  objectives: string[];
  chapters: Chapter[];
};

const ACCENT_MAP: Record<string, string> = {
  CRS: '#d97706',
  GOV: '#0284c7',
  LIT: '#16a34a',
};

function getAccent(code: string): string {
  const prefix = code.split(' ')[0];
  return ACCENT_MAP[prefix] ?? '#1e40af';
}

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [showObjectives, setShowObjectives] = useState(false);
  const { isOnline } = useNetworkStatus();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());

  const {
    downloading, progress, cached, allCached, downloadAll, clearAll, error: dlError,
  } = useBulkDownload(courseId ?? '', course?.chapters ?? []);

  useEffect(() => {
    async function load() {
      try {
        // Try network first, then courses cache
        let found: CourseDetail | undefined;
        if (isOnline) {
          const base = getApiBase();
          const res = await fetch(`${base}/textbook/courses`);
          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const all: CourseDetail[] = await res.json();
          found = all.find(c => c.id === courseId);
          // Refresh courses cache
          if (all.length) {
            AsyncStorage.setItem(COURSES_CACHE_KEY, JSON.stringify({ data: all, cachedAt: Date.now() })).catch(() => {});
          }
        } else {
          throw new Error('offline');
        }
        if (!found) throw new Error('Course not found');
        setCourse(found);
        const keys = found.chapters.map(ch => `jupeb_chapter_read_${ch.id}`);
        const vals = await AsyncStorage.multiGet(keys);
        const readSet = new Set<string>();
        vals.forEach(([key, val]) => { if (val) readSet.add(key.replace('jupeb_chapter_read_', '')); });
        setReadChapters(readSet);
      } catch {
        // Fallback: courses cache
        try {
          const raw = await AsyncStorage.getItem(COURSES_CACHE_KEY);
          if (raw) {
            const { data } = JSON.parse(raw);
            const found = (data as CourseDetail[]).find(c => c.id === courseId);
            if (found) {
              setCourse(found);
              const keys = found.chapters.map(ch => `jupeb_chapter_read_${ch.id}`);
              const vals = await AsyncStorage.multiGet(keys);
              const readSet = new Set<string>();
              vals.forEach(([key, val]) => { if (val) readSet.add(key.replace('jupeb_chapter_read_', '')); });
              setReadChapters(readSet);
            } else {
              setError('Course not found in cache. Connect to the internet and try again.');
            }
          } else {
            setError('No internet connection and no cached data. Connect once to load notes.');
          }
        } catch (e: any) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, isOnline]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={44} color={C.mutedForeground} />
        <Text style={styles.errorText}>{error ?? 'Course not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = getAccent(course.code);
  const cachedCount = cached.size;
  const totalChapters = course.chapters.length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={[styles.headerDecor, { backgroundColor: `${accent}20` }]} />
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backLabel}>Notes</Text>
        </TouchableOpacity>
        <Text style={[styles.courseCode, { color: `${accent}cc` }]}>{course.code}</Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="school-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaChipText}>{course.semester}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="list-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaChipText}>{totalChapters} chapters</Text>
          </View>
          {cachedCount > 0 && (
            <View style={[styles.metaChip, { backgroundColor: 'rgba(249,115,22,0.25)' }]}>
              <Ionicons name="download-done-outline" size={12} color="#f97316" />
              <Text style={[styles.metaChipText, { color: '#f97316' }]}>
                {cachedCount}/{totalChapters} saved
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Offline banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#ef4444" />
            <Text style={styles.offlineBannerText}>
              You're offline — {cachedCount > 0
                ? `${cachedCount} of ${totalChapters} chapters available to read.`
                : 'no chapters cached yet. Connect to download.'}
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>{course.description}</Text>
        </View>

        {/* Objectives toggle */}
        <TouchableOpacity style={styles.objectivesHeader} onPress={() => setShowObjectives(v => !v)} activeOpacity={0.8}>
          <Text style={styles.objectivesTitle}>Course Objectives</Text>
          <Ionicons name={showObjectives ? 'chevron-up' : 'chevron-down'} size={18} color={C.mutedForeground} />
        </TouchableOpacity>
        {showObjectives && (
          <View style={styles.objectivesList}>
            {course.objectives.map((obj, i) => (
              <View key={i} style={styles.objectiveRow}>
                <View style={[styles.objectiveDot, { backgroundColor: accent }]} />
                <Text style={styles.objectiveText}>{obj}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reading progress */}
        {readChapters.size > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Reading progress</Text>
              <Text style={[styles.progressPct, { color: accent }]}>
                {Math.round((readChapters.size / totalChapters) * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${(readChapters.size / totalChapters) * 100}%`,
                backgroundColor: accent,
              }]} />
            </View>
            <Text style={styles.progressSub}>{readChapters.size} of {totalChapters} chapters read</Text>
          </View>
        )}

        {/* ── Offline Download card ──────────────────────────────────────── */}
        <View style={styles.downloadCard}>
          <View style={styles.downloadCardTop}>
            <View style={styles.downloadCardLeft}>
              <Ionicons
                name={allCached ? 'checkmark-circle' : 'download-outline'}
                size={20}
                color={allCached ? '#16a34a' : C.primary}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.downloadTitle}>
                  {allCached ? 'All chapters saved offline' : 'Save for offline reading'}
                </Text>
                <Text style={styles.downloadSub}>
                  {allCached
                    ? `${totalChapters} chapters · tap to clear`
                    : cachedCount > 0
                    ? `${cachedCount} of ${totalChapters} chapters cached`
                    : 'Read without internet after downloading'}
                </Text>
              </View>
            </View>
            {allCached ? (
              <TouchableOpacity onPress={clearAll} style={styles.clearBtn} activeOpacity={0.75}>
                <Ionicons name="trash-outline" size={15} color={C.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={downloadAll}
                disabled={downloading || !isOnline}
                style={[styles.dlBtn, (downloading || !isOnline) && styles.dlBtnDisabled]}
                activeOpacity={0.8}
              >
                {downloading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.dlBtnText}>{isOnline ? 'Download all' : 'Offline'}</Text>}
              </TouchableOpacity>
            )}
          </View>

          {/* Progress bar */}
          {downloading && (
            <View style={styles.dlProgressWrap}>
              <View style={styles.dlProgressTrack}>
                <View style={[styles.dlProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.dlProgressLabel}>{progress}%</Text>
            </View>
          )}

          {/* Cached progress bar when partial */}
          {!downloading && cachedCount > 0 && !allCached && (
            <View style={styles.dlProgressWrap}>
              <View style={styles.dlProgressTrack}>
                <View style={[styles.dlProgressFill, {
                  width: `${Math.round((cachedCount / totalChapters) * 100)}%`,
                  backgroundColor: '#d97706',
                }]} />
              </View>
              <Text style={styles.dlProgressLabel}>{cachedCount}/{totalChapters}</Text>
            </View>
          )}

          {dlError && (
            <Text style={styles.dlError}>{dlError}</Text>
          )}
        </View>

        {/* Chapters */}
        <Text style={styles.chaptersLabel}>Chapters ({totalChapters})</Text>
        {course.chapters.map((ch) => {
          const isRead    = readChapters.has(ch.id);
          const isCached  = cached.has(ch.id);
          const isOfflineOnly = !isOnline && !isCached;
          return (
            <TouchableOpacity
              key={ch.id}
              style={[styles.chapterCard, isOfflineOnly && styles.chapterCardDimmed]}
              onPress={() => {
                if (isOfflineOnly) return;
                router.push(`/notes/chapter/${ch.id}?courseId=${course.id}` as any);
              }}
              activeOpacity={isOfflineOnly ? 1 : 0.75}
            >
              <View style={[styles.chapterNumBox, { backgroundColor: isRead ? `${accent}22` : `${accent}12` }]}>
                {isRead
                  ? <Ionicons name="checkmark" size={16} color={accent} />
                  : <Text style={[styles.chapterNum, { color: accent }]}>{ch.number}</Text>
                }
              </View>
              <View style={styles.chapterBody}>
                <Text style={styles.chapterTitle}>{ch.title}</Text>
                <Text style={styles.chapterSummary} numberOfLines={2}>{ch.summary}</Text>
                <View style={styles.chapterStats}>
                  <View style={styles.chapterStat}>
                    <Ionicons name="document-text-outline" size={11} color={C.mutedForeground} />
                    <Text style={styles.chapterStatText}>{ch.sectionCount} sections</Text>
                  </View>
                  <View style={styles.chapterStat}>
                    <Ionicons name="key-outline" size={11} color={C.mutedForeground} />
                    <Text style={styles.chapterStatText}>{ch.keyTermCount} key terms</Text>
                  </View>
                  {isRead && !isCached && (
                    <Text style={[styles.chapterStatText, { color: accent, marginLeft: 'auto' }]}>✓ Read</Text>
                  )}
                </View>
              </View>
              {/* Right side: cached / offline-locked indicator */}
              {isOfflineOnly ? (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed-outline" size={13} color={C.mutedForeground} />
                </View>
              ) : isCached ? (
                <View style={styles.cachedBadge}>
                  <Ionicons name="download-done-outline" size={13} color={C.primary} />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={C.mutedForeground} />
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    errorText: { fontSize: 15, color: C.destructive, fontFamily: 'Inter_500Medium', marginBottom: 16, textAlign: 'center' },
    backBtn: { padding: 12 },
    backBtnText: { fontSize: 14, color: C.primary, fontFamily: 'Inter_600SemiBold' },

    header: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20, paddingBottom: 20, overflow: 'hidden',
    },
    headerDecor: {
      position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -80, right: -40,
    },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    backLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)' },
    courseCode: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1, marginBottom: 4 },
    courseTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3, lineHeight: 28, marginBottom: 14 },
    courseMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    metaChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14,
      paddingHorizontal: 10, paddingVertical: 5,
    },
    metaChipText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.75)' },

    offlineBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#dc262615', borderRadius: C.radius,
      borderWidth: 1, borderColor: '#dc262625',
      padding: 12, marginBottom: 12,
    },
    offlineBannerText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', color: '#ef4444', lineHeight: 17 },

    scroll: { padding: 16 },

    descCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12,
    },
    descText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 20 },

    objectivesHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 2,
    },
    objectivesTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground },
    objectivesList: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, borderTopWidth: 0,
      borderTopLeftRadius: 0, borderTopRightRadius: 0,
      padding: 14, marginBottom: 12,
    },
    objectiveRow: { flexDirection: 'row', marginBottom: 10 },
    objectiveDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, marginRight: 10, flexShrink: 0 },
    objectiveText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 19 },

    progressCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14,
    },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.foreground },
    progressPct: { fontSize: 13, fontFamily: 'Inter_700Bold' },
    progressTrack: { height: 6, borderRadius: 4, backgroundColor: C.border, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 4 },
    progressSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground },

    // Download card
    downloadCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14,
    },
    downloadCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    downloadCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    downloadTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: C.foreground },
    downloadSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 2 },
    dlBtn: {
      backgroundColor: C.primary, borderRadius: 8,
      paddingHorizontal: 14, paddingVertical: 8, minWidth: 100, alignItems: 'center',
    },
    dlBtnDisabled: { backgroundColor: C.muted },
    dlBtnText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#fff' },
    clearBtn: {
      width: 34, height: 34, borderRadius: 8,
      backgroundColor: C.muted, borderWidth: 1, borderColor: C.border,
      alignItems: 'center', justifyContent: 'center',
    },
    dlProgressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
    dlProgressTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.border, overflow: 'hidden' },
    dlProgressFill: { height: '100%', borderRadius: 3, backgroundColor: C.primary },
    dlProgressLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground, width: 36, textAlign: 'right' },
    dlError: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.destructive, marginTop: 8 },

    chaptersLabel: {
      fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground,
      letterSpacing: 1, textTransform: 'uppercase', marginTop: 4, marginBottom: 10,
    },
    chapterCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 8,
    },
    chapterCardDimmed: { opacity: 0.45 },
    chapterNumBox: {
      width: 40, height: 40, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    chapterNum: { fontSize: 16, fontFamily: 'Inter_700Bold' },
    chapterBody: { flex: 1, marginLeft: 12, marginRight: 8 },
    chapterTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 4, lineHeight: 19 },
    chapterSummary: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 17, marginBottom: 8 },
    chapterStats: { flexDirection: 'row', gap: 14 },
    chapterStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    chapterStatText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    cachedBadge: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: `${C.primary}15`,
      alignItems: 'center', justifyContent: 'center',
    },
    lockBadge: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: C.muted,
      alignItems: 'center', justifyContent: 'center',
    },
  });
}

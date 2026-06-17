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

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/textbook/courses`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const all: CourseDetail[] = await res.json();
        const found = all.find(c => c.id === courseId);
        if (!found) throw new Error('Course not found');
        setCourse(found);
        // Load read state for all chapters in this course
        const keys = found.chapters.map(ch => `jupeb_chapter_read_${ch.id}`);
        const vals = await AsyncStorage.multiGet(keys);
        const readSet = new Set<string>();
        vals.forEach(([key, val]) => {
          if (val) readSet.add(key.replace('jupeb_chapter_read_', ''));
        });
        setReadChapters(readSet);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

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
        <Text style={styles.errorText}>{error ?? 'Course not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = getAccent(course.code);

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
            <Text style={styles.metaChipText}>{course.chapters.length} chapters</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="bookmark-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaChipText}>{course.units} units</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
                {Math.round((readChapters.size / course.chapters.length) * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${(readChapters.size / course.chapters.length) * 100}%`,
                backgroundColor: accent,
              }]} />
            </View>
            <Text style={styles.progressSub}>
              {readChapters.size} of {course.chapters.length} chapters read
            </Text>
          </View>
        )}

        {/* Chapters */}
        <Text style={styles.chaptersLabel}>Chapters ({course.chapters.length})</Text>
        {course.chapters.map((ch) => {
          const isRead = readChapters.has(ch.id);
          return (
            <TouchableOpacity
              key={ch.id}
              style={[styles.chapterCard, isRead && { opacity: 0.8 }]}
              onPress={() => router.push(`/notes/chapter/${ch.id}?courseId=${course.id}` as any)}
              activeOpacity={0.75}
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
                  {isRead && (
                    <Text style={[styles.chapterStatText, { color: accent, marginLeft: 'auto' }]}>✓ Read</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.mutedForeground} />
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
    errorText: { fontSize: 15, color: C.destructive, fontFamily: 'Inter_500Medium', marginBottom: 16 },
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

    chaptersLabel: {
      fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground,
      letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 10,
    },
    chapterCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 8,
    },
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
  });
}

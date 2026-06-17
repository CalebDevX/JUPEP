import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { getApiBase } from '@/lib/query-client';
import type { AppColors } from '@/constants/colors';

type CourseItem = {
  id: string;
  code: string;
  title: string;
  semester: string;
  units: number;
  description: string;
  chapters: { id: string; number: number; title: string; sectionCount: number }[];
};

const SUBJECT_GROUPS = [
  { key: 'CRS', label: 'Christian Religious Studies', icon: 'book' as const, accent: '#d97706' },
  { key: 'GOV', label: 'Government', icon: 'business' as const, accent: '#0284c7' },
  { key: 'LIT', label: 'Literature in English', icon: 'library' as const, accent: '#16a34a' },
];

const SEMESTER_LABELS: Record<string, string> = {
  'First Semester': 'Sem 1',
  'First Semester Exam': 'Sem 1',
  'Second Semester': 'Sem 2',
  'Second Semester Exam': 'Sem 2',
  'Third Semester': 'Sem 3',
  'Third Semester Exam': 'Sem 3',
  'Fourth Semester': 'Sem 4',
  'Fourth Semester Exam': 'Sem 4',
};

function semesterLabel(s: string): string {
  return SEMESTER_LABELS[s] ?? s;
}

export default function NotesScreen() {
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/textbook/courses`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setCourses(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    return SUBJECT_GROUPS.map(g => ({
      ...g,
      items: courses.filter(c => c.code.startsWith(g.key)).sort((a, b) => a.code.localeCompare(b.code)),
    }));
  }, [courses]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Study Notes</Text>
        <Text style={styles.headerSub}>Textbook content for CRS, GOV & LIT</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading notes…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={44} color={C.mutedForeground} />
          <Text style={styles.errorTitle}>Could not load notes</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.primary} />}
        >
          {grouped.map(group => (
            <View key={group.key} style={styles.group}>
              {/* Group header */}
              <View style={styles.groupHeader}>
                <View style={[styles.groupIconBox, { backgroundColor: `${group.accent}18` }]}>
                  <Ionicons name={group.icon} size={18} color={group.accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.groupCode}>{group.key}</Text>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                </View>
                <Text style={[styles.groupCount, { color: group.accent }]}>
                  {group.items.length} papers
                </Text>
              </View>

              {/* Course cards */}
              {group.items.length === 0 ? (
                <View style={styles.emptyGroup}>
                  <Text style={styles.emptyGroupText}>No papers available yet</Text>
                </View>
              ) : (
                <View style={styles.cardsRow}>
                  {group.items.map(course => (
                    <TouchableOpacity
                      key={course.id}
                      style={[styles.courseCard, { borderLeftColor: group.accent, borderLeftWidth: 3 }]}
                      onPress={() => router.push(`/notes/${course.id}` as any)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.courseCardTop}>
                        <View>
                          <Text style={[styles.courseCode, { color: group.accent }]}>{course.code}</Text>
                          <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                        </View>
                        <View style={[styles.semBadge, { backgroundColor: `${group.accent}15` }]}>
                          <Text style={[styles.semText, { color: group.accent }]}>
                            {semesterLabel(course.semester)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
                      <View style={styles.courseFooter}>
                        <View style={styles.courseStatItem}>
                          <Ionicons name="list-outline" size={12} color={C.mutedForeground} />
                          <Text style={styles.courseStatText}>{course.chapters.length} chapters</Text>
                        </View>
                        <View style={styles.courseStatItem}>
                          <Ionicons name="school-outline" size={12} color={C.mutedForeground} />
                          <Text style={styles.courseStatText}>{course.units ?? 3} units</Text>
                        </View>
                        <View style={styles.courseArrow}>
                          <Text style={[styles.courseArrowText, { color: group.accent }]}>Read →</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },

    header: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20, paddingBottom: 20,
      overflow: 'hidden',
    },
    headerDecor: {
      position: 'absolute', width: 180, height: 180, borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
    },
    headerTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.4 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 4 },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 14, fontSize: 14, color: C.mutedForeground, fontFamily: 'Inter_400Regular' },
    errorTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: C.foreground, marginTop: 14, marginBottom: 6 },
    errorSub: { fontSize: 13, color: C.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 20 },
    retryBtn: {
      backgroundColor: C.primary, borderRadius: C.radius,
      paddingHorizontal: 24, paddingVertical: 11,
    },
    retryText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },

    scroll: { paddingHorizontal: 16, paddingTop: 16 },

    group: { marginBottom: 24 },
    groupHeader: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border,
      padding: 14, marginBottom: 10,
    },
    groupIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    groupCode: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground, letterSpacing: 1 },
    groupLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground, marginTop: 1 },
    groupCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

    emptyGroup: { padding: 16, alignItems: 'center' },
    emptyGroupText: { fontSize: 13, color: C.mutedForeground, fontFamily: 'Inter_400Regular' },

    cardsRow: { gap: 10 },
    courseCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14,
    },
    courseCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    courseCode: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.5, marginBottom: 3 },
    courseTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground, maxWidth: 210, lineHeight: 20 },
    semBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    semText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
    courseDesc: { fontSize: 12, color: C.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 17, marginBottom: 12 },
    courseFooter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    courseStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    courseStatText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    courseArrow: { marginLeft: 'auto' },
    courseArrowText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  });
}

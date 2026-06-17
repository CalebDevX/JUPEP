import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';

interface QuizSet {
  id: string;
  subject: string;
  year: number;
  totalQuestions: number;
  type: string;
}

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return [];
}

async function fetchQuizSets(subject?: string): Promise<QuizSet[]> {
  const url = new URL('/api/quiz/sets', getApiUrl());
  if (subject) url.searchParams.set('subject', subject);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load quiz sets');
  return res.json();
}

export default function QuizScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const subjectList = getSubjectList(profile?.subjects);
  const [selected, setSelected] = useState<string>('ALL');

  const { data: quizSets, isLoading, isError, refetch } = useQuery({
    queryKey: ['/quiz/sets', selected],
    queryFn: () => fetchQuizSets(selected === 'ALL' ? undefined : selected),
    retry: 1,
  });

  async function handleSelect(code: string) {
    await Haptics.selectionAsync();
    setSelected(code);
  }

  const filterList = ['ALL', ...subjectList];

  return (
    <View style={styles.root}>
      <View style={[styles.headerBar, { paddingTop: topPad + 16 }]}>
        <Text style={styles.pageTitle}>Past Questions</Text>
        <Text style={styles.pageSubtitle}>Practice with real exam questions</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filterList.map((code) => (
          <TouchableOpacity
            key={code}
            style={[styles.filterChip, selected === code && styles.filterChipActive]}
            onPress={() => handleSelect(code)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selected === code && styles.filterChipTextActive]}>
              {code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        )}

        {isError && (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>Could not load quiz sets</Text>
            <Text style={styles.emptyDesc}>Check your connection or try again</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.7}>
              <Ionicons name="refresh" size={16} color={Colors.primary} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (!quizSets || quizSets.length === 0) && (
          <View style={styles.centered}>
            <Ionicons name="help-circle-outline" size={48} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No quiz sets yet</Text>
            <Text style={styles.emptyDesc}>
              Past questions will appear here once synced from the server.
            </Text>
            <View style={styles.offlineBadge}>
              <Ionicons name="sync-outline" size={14} color={Colors.info} />
              <Text style={styles.offlineBadgeText}>Syncs automatically when connected</Text>
            </View>
          </View>
        )}

        {!isLoading && quizSets && quizSets.map((set) => (
          <QuizSetCard key={set.id} set={set} />
        ))}
      </ScrollView>
    </View>
  );
}

function QuizSetCard({ set }: { set: QuizSet }) {
  async function handleStart() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <View style={styles.quizCard}>
      <View style={styles.quizCardLeft}>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{set.year}</Text>
        </View>
        <View style={styles.quizInfo}>
          <Text style={styles.quizSubject}>{set.subject}</Text>
          <Text style={styles.quizType}>{set.type}</Text>
          <View style={styles.questionCountRow}>
            <Ionicons name="list-outline" size={12} color={Colors.mutedForeground} />
            <Text style={styles.questionCount}>{set.totalQuestions} questions</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.7}>
        <Ionicons name="play" size={16} color={Colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerBar: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.muted, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  filterChipTextActive: { color: Colors.primary },
  scroll: { padding: 20, gap: 12, paddingBottom: 32 },
  centered: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.primary, borderRadius: Colors.radius,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 8,
  },
  retryText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  offlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.infoDim, borderRadius: Colors.radiusSm,
    paddingHorizontal: 12, paddingVertical: 7, marginTop: 8,
  },
  offlineBadgeText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.info },
  quizCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Colors.radiusLg, padding: 16,
  },
  quizCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  yearBadge: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: `${Colors.primary}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  yearText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.primary },
  quizInfo: { flex: 1 },
  quizSubject: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  quizType: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 1 },
  questionCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  questionCount: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  startBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
});

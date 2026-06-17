import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { getQuizGroups, getBestAttempt, type DBQuizGroup } from '@/lib/database';
import { syncQuizData, forceSync } from '@/lib/sync';

const TYPE_LABEL: Record<string, string> = {
  objective: 'Objective',
  theory: 'Theory',
  mixed: 'Mixed',
};

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return [];
}

export default function QuizScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const subjectList = getSubjectList(profile?.subjects);
  const [selected, setSelected] = useState('ALL');
  const [groups, setGroups] = useState<DBQuizGroup[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, { score: number; total: number } | null>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [syncError, setSyncError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async (filter = selected) => {
    const data = await getQuizGroups(filter);
    setGroups(data);
    // Load best scores for each group
    const scores: Record<string, { score: number; total: number } | null> = {};
    await Promise.all(data.map(async (g) => {
      scores[g.id] = await getBestAttempt(g.id);
    }));
    setBestScores(scores);
  }, [selected]);

  const doSync = useCallback(async (force = false) => {
    setSyncing(true);
    setSyncError('');
    setSyncMsg('');
    const fn = force ? forceSync : syncQuizData;
    const result = await fn(subjectList, (msg) => setSyncMsg(msg));
    setSyncing(false);
    setSyncMsg('');
    if (result.error) {
      setSyncError(result.error);
    } else {
      await loadGroups(selected);
    }
  }, [subjectList, loadGroups, selected]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await doSync(false);
      await loadGroups(selected);
      setLoading(false);
    })();
  }, []);

  async function handleFilter(code: string) {
    await Haptics.selectionAsync();
    setSelected(code);
    await loadGroups(code);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await doSync(true);
    await loadGroups(selected);
    setRefreshing(false);
  }

  async function handleStart(group: DBQuizGroup) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/quiz/${group.id}`);
  }

  const filters = ['ALL', ...subjectList];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.pageTitle}>Past Questions</Text>
          <Text style={styles.pageSubtitle}>
            {groups.length > 0 ? `${groups.length} quiz sets available offline` : 'Practice with real exam questions'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBtn, syncing && styles.syncBtnActive]}
          onPress={() => doSync(true)}
          disabled={syncing}
          activeOpacity={0.7}
        >
          {syncing
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Ionicons name="sync-outline" size={20} color={Colors.primary} />
          }
        </TouchableOpacity>
      </View>

      {syncing && syncMsg ? (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color={Colors.info} />
          <Text style={styles.syncBannerText}>{syncMsg}</Text>
        </View>
      ) : null}

      {syncError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="wifi-outline" size={14} color={Colors.warning} />
          <Text style={styles.errorBannerText}>Offline — showing cached questions</Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((code) => (
          <TouchableOpacity
            key={code}
            style={[styles.chip, selected === code && styles.chipActive]}
            onPress={() => handleFilter(code)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selected === code && styles.chipTextActive]}>{code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-download-outline" size={52} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No questions downloaded</Text>
            <Text style={styles.emptyDesc}>
              Pull down to refresh or tap the sync button to download past questions for your subjects.
            </Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => doSync(true)} activeOpacity={0.7}>
              <Ionicons name="sync" size={16} color={Colors.primaryForeground} />
              <Text style={styles.downloadBtnText}>Download Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groups.map((group) => (
            <QuizGroupCard
              key={group.id}
              group={group}
              best={bestScores[group.id]}
              onStart={() => handleStart(group)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function QuizGroupCard({
  group, best, onStart,
}: {
  group: DBQuizGroup;
  best: { score: number; total: number } | null | undefined;
  onStart: () => void;
}) {
  const pct = best ? Math.round((best.score / best.total) * 100) : null;
  const grade = pct !== null
    ? pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 45 ? 'D' : 'F'
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onStart} activeOpacity={0.75}>
      <View style={styles.cardTop}>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{group.year ?? '—'}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.cardMetaRow}>
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillText}>{group.subjectCode}</Text>
            </View>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{TYPE_LABEL[group.questionType] ?? group.questionType}</Text>
            </View>
          </View>
          <Text style={styles.paperLabel}>{group.paperLabel}</Text>
          <View style={styles.qCountRow}>
            <Ionicons name="list-outline" size={12} color={Colors.mutedForeground} />
            <Text style={styles.qCount}>{group.questionCount} questions</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          {grade !== null ? (
            <View style={[styles.gradeBadge, { backgroundColor: gradeColor(grade) + '20' }]}>
              <Text style={[styles.gradeText, { color: gradeColor(grade) }]}>{grade}</Text>
            </View>
          ) : null}
          <View style={styles.playBtn}>
            <Ionicons name="play" size={16} color={Colors.primaryForeground} />
          </View>
        </View>
      </View>

      {pct !== null && (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: gradeColor(grade!) }]} />
          </View>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return Colors.success;
  if (grade === 'C' || grade === 'D') return Colors.warning;
  return Colors.destructive;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
  syncBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDim,
    borderWidth: 1, borderColor: `${Colors.primary}40`, alignItems: 'center', justifyContent: 'center',
  },
  syncBtnActive: { opacity: 0.7 },
  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.infoDim,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  syncBannerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.info, flex: 1 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.warningDim,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  errorBannerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.warning },
  filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.muted, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  chipTextActive: { color: Colors.primary },
  scroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingBottom: 32 },
  centered: { alignItems: 'center', paddingTop: 60, gap: 14 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Colors.radius, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4,
  },
  downloadBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primaryForeground },
  card: {
    backgroundColor: Colors.card, borderRadius: Colors.radiusLg,
    borderWidth: 1, borderColor: Colors.border, padding: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  yearBadge: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: Colors.primaryDim, borderWidth: 1, borderColor: `${Colors.primary}30`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  yearText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.primary },
  cardMeta: { flex: 1, gap: 4 },
  cardMetaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  subjectPill: {
    backgroundColor: Colors.muted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  subjectPillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  typePill: {
    backgroundColor: Colors.infoDim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  typePillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.info },
  paperLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  qCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qCount: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  cardRight: { alignItems: 'center', gap: 8, flexShrink: 0 },
  gradeBadge: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  playBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  progressBar: { flex: 1, height: 4, backgroundColor: Colors.muted, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressPct: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, width: 32, textAlign: 'right' },
});

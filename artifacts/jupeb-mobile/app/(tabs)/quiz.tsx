import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, RefreshControl, SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { getQuizGroups, getBestAttempt, type DBQuizGroup } from '@/lib/database';
import { syncQuizData, forceSync } from '@/lib/sync';

// ─── Exam type config ─────────────────────────────────────────────────────────
const EXAM_TYPES = [
  { code: 'ALL',   label: 'All',            icon: 'apps' as const,           color: Colors.primary },
  { code: '001',   label: '1st In-Course',  icon: 'document-text' as const,  color: '#0891b2' },
  { code: '002',   label: '1st Semester',   icon: 'school' as const,         color: '#7c3aed' },
  { code: '003',   label: '2nd In-Course',  icon: 'document-text' as const,  color: '#059669' },
  { code: 'mock',  label: 'Mock Exam',      icon: 'timer' as const,          color: '#d97706' },
  { code: 'jupeb', label: 'JUPEB',          icon: 'trophy' as const,         color: '#dc2626' },
] as const;

type ExamCode = typeof EXAM_TYPES[number]['code'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function academicYear(year: number | null): string {
  if (!year) return 'Unknown Year';
  return `${year}/${year + 1}`;
}

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return [];
}

function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return Colors.success;
  if (grade === 'C' || grade === 'D') return Colors.warning;
  return Colors.destructive;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PracticeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const subjectList = getSubjectList(profile?.subjects);

  const [examType, setExamType] = useState<ExamCode>('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [groups, setGroups] = useState<DBQuizGroup[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, { score: number; total: number } | null>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [syncError, setSyncError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    const data = await getQuizGroups(subjectFilter === 'ALL' ? undefined : subjectFilter);
    setGroups(data);
    const scores: Record<string, { score: number; total: number } | null> = {};
    await Promise.all(data.map(async (g) => { scores[g.id] = await getBestAttempt(g.id); }));
    setBestScores(scores);
  }, [subjectFilter]);

  const doSync = useCallback(async (force = false) => {
    setSyncing(true);
    setSyncError('');
    const fn = force ? forceSync : syncQuizData;
    const result = await fn(subjectList, (msg) => setSyncMsg(msg));
    setSyncing(false);
    setSyncMsg('');
    if (result.error) setSyncError(result.error);
    else await loadGroups();
  }, [subjectList, loadGroups]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await doSync(false);
      await loadGroups();
      setLoading(false);
    })();
  }, []);

  useEffect(() => { loadGroups(); }, [subjectFilter]);

  async function handleRefresh() {
    setRefreshing(true);
    await doSync(true);
    setRefreshing(false);
  }

  // Filter by exam type
  const filtered = examType === 'ALL'
    ? groups
    : groups.filter(g => g.paper === examType);

  // Group by academic year, sorted newest first
  const yearMap = new Map<string, DBQuizGroup[]>();
  for (const g of filtered) {
    const yr = academicYear(g.year);
    if (!yearMap.has(yr)) yearMap.set(yr, []);
    yearMap.get(yr)!.push(g);
  }
  const sections = Array.from(yearMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([title, data]) => ({ title, data }));

  const examTypeCounts = EXAM_TYPES.map(et => ({
    ...et,
    count: et.code === 'ALL'
      ? groups.length
      : groups.filter(g => g.paper === et.code).length,
  }));

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.pageTitle}>Practice</Text>
          <Text style={styles.pageSubtitle}>Past exam questions by type & year</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBtn, syncing && styles.syncBtnActive]}
          onPress={() => doSync(true)}
          disabled={syncing}
          activeOpacity={0.7}
        >
          {syncing
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Ionicons name="sync-outline" size={20} color={Colors.primary} />}
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

      {/* Exam type pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.examTypeRow}
      >
        {examTypeCounts.map((et) => (
          <TouchableOpacity
            key={et.code}
            style={[
              styles.examTypeChip,
              examType === et.code && { backgroundColor: et.color + '20', borderColor: et.color },
            ]}
            onPress={async () => {
              await Haptics.selectionAsync();
              setExamType(et.code as ExamCode);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={et.icon}
              size={14}
              color={examType === et.code ? et.color : Colors.mutedForeground}
            />
            <Text style={[
              styles.examTypeChipText,
              examType === et.code && { color: et.color },
            ]}>
              {et.label}
            </Text>
            {et.count > 0 && (
              <View style={[styles.countBadge, { backgroundColor: examType === et.code ? et.color : Colors.muted }]}>
                <Text style={[styles.countBadgeText, { color: examType === et.code ? '#fff' : Colors.mutedForeground }]}>
                  {et.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subject filter */}
      {subjectList.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectRow}
        >
          {['ALL', ...subjectList].map((code) => (
            <TouchableOpacity
              key={code}
              style={[styles.subjectChip, subjectFilter === code && styles.subjectChipActive]}
              onPress={async () => {
                await Haptics.selectionAsync();
                setSubjectFilter(code);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.subjectChipText, subjectFilter === code && styles.subjectChipTextActive]}>
                {code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      ) : sections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
        >
          <Ionicons name="cloud-download-outline" size={52} color={Colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No questions yet</Text>
          <Text style={styles.emptyDesc}>
            Pull down to sync questions, or tap the sync button. Questions are added via the admin panel.
          </Text>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => doSync(true)} activeOpacity={0.7}>
            <Ionicons name="sync" size={16} color={Colors.primaryForeground} />
            <Text style={styles.downloadBtnText}>Sync Now</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>{section.title} Academic Year</Text>
              <Text style={styles.sectionCount}>{section.data.length} sets</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <PracticeCard
              group={item}
              best={bestScores[item.id]}
              onStart={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/quiz/${item.id}`);
              }}
            />
          )}
        />
      )}
    </View>
  );
}

// ─── Card component ───────────────────────────────────────────────────────────
function PracticeCard({
  group, best, onStart,
}: {
  group: DBQuizGroup;
  best: { score: number; total: number } | null | undefined;
  onStart: () => void;
}) {
  const et = EXAM_TYPES.find(e => e.code === group.paper);
  const typeColor = et?.color ?? Colors.primary;
  const pct = best ? Math.round((best.score / best.total) * 100) : null;
  const grade = pct !== null
    ? pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 45 ? 'D' : 'F'
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onStart} activeOpacity={0.75}>
      <View style={[styles.cardAccent, { backgroundColor: typeColor }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          {/* Left info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardBadgeRow}>
              <View style={[styles.badge, { backgroundColor: typeColor + '20', borderColor: typeColor + '40' }]}>
                <Text style={[styles.badgeText, { color: typeColor }]}>
                  {et?.label ?? group.paperLabel}
                </Text>
              </View>
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectBadgeText}>{group.subjectCode}</Text>
              </View>
            </View>
            <Text style={styles.cardSubjectName} numberOfLines={1}>{group.subjectName}</Text>
            <View style={styles.cardMeta}>
              <Ionicons name="list-outline" size={12} color={Colors.mutedForeground} />
              <Text style={styles.cardMetaText}>{group.questionCount} questions</Text>
              <Text style={styles.cardMetaDot}>·</Text>
              <Ionicons name="document-outline" size={12} color={Colors.mutedForeground} />
              <Text style={styles.cardMetaText}>
                {group.questionType.charAt(0).toUpperCase() + group.questionType.slice(1)}
              </Text>
            </View>
          </View>

          {/* Right: grade + start */}
          <View style={styles.cardRight}>
            {grade !== null && (
              <View style={[styles.gradeBadge, { backgroundColor: gradeColor(grade) + '20' }]}>
                <Text style={[styles.gradeText, { color: gradeColor(grade) }]}>{grade}</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: typeColor }]} onPress={onStart} activeOpacity={0.8}>
              <Ionicons name="play" size={14} color="#fff" />
            </TouchableOpacity>
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
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
  syncBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDim,
    borderWidth: 1, borderColor: `${Colors.primary}40`, alignItems: 'center', justifyContent: 'center',
  },
  syncBtnActive: { opacity: 0.7 },
  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.infoDim, paddingHorizontal: 16, paddingVertical: 8,
  },
  syncBannerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.info, flex: 1 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warningDim, paddingHorizontal: 16, paddingVertical: 8,
  },
  errorBannerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.warning },

  // Exam type chips
  examTypeRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  examTypeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: Colors.muted, borderColor: Colors.border,
  },
  examTypeChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground },
  countBadge: {
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center',
  },
  countBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },

  // Subject chips
  subjectRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  subjectChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.muted, borderWidth: 1, borderColor: Colors.border,
  },
  subjectChipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  subjectChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground },
  subjectChipTextActive: { color: Colors.primary },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 20, paddingBottom: 10,
  },
  sectionDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
  },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.foreground, flex: 1 },
  sectionCount: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },

  // Card
  card: {
    flexDirection: 'row', backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 10, overflow: 'hidden',
  },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardInfo: { flex: 1, gap: 6 },
  cardBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  subjectBadge: {
    backgroundColor: Colors.muted, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  subjectBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  cardSubjectName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardMetaText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  cardMetaDot: { fontSize: 12, color: Colors.mutedForeground },
  cardRight: { alignItems: 'center', gap: 8, flexShrink: 0 },
  gradeBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  startBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  progressBar: { flex: 1, height: 3, backgroundColor: Colors.muted, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressPct: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, width: 32, textAlign: 'right' },

  // Empty / loading
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Colors.radius,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 4,
  },
  downloadBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primaryForeground },
});

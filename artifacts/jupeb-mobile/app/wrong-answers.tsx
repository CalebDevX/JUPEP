import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useActivation } from '@/hooks/useActivation';
import ActivationGate from '@/components/ActivationGate';
import { LockedCard, ErrorCard } from '@/components/ErrorCard';
import { getApiUrl } from '@/lib/query-client';
import type { AppColors } from '@/constants/colors';

interface WrongAnswer {
  id: number;
  questionId: number;
  subjectId: number;
  paper: string;
  selectedOption: string;
  attemptedAt: string;
  revisedAt: string | null;
  questionText: string;
  options: string;
  correctOption: string;
  explanation: string | null;
  subjectName: string;
}

interface Stats {
  total: number;
  pending: number;
  revised: number;
  bySubject: Record<string, { name: string; pending: number; revised: number }>;
}

function parseOptions(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed)) {
      const keys = ['A', 'B', 'C', 'D'];
      const out: Record<string, string> = {};
      parsed.forEach((v: string, i: number) => { if (keys[i]) out[keys[i]] = v; });
      return out;
    }
  } catch { /* ignore */ }
  return {};
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function WrongAnswersScreen() {
  const insets = useSafeAreaInsets();
  const C = useTheme();
  const { profile } = useAuth();
  const { isActivated, gateVisible, showGate, hideGate } = useActivation();
  const S = makeStyles(C);

  const [items, setItems] = useState<WrongAnswer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('ALL');
  const [revising, setRevising] = useState<Set<number>>(new Set());

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const load = useCallback(async (silent = false) => {
    if (!profile?.phone) return;
    if (!silent) setLoading(true);
    const base = getApiUrl();
    try {
      const [waRes, statsRes] = await Promise.all([
        fetch(`${base}/student/wrong-answers?phone=${encodeURIComponent(profile.phone)}&limit=30&offset=0`),
        fetch(`${base}/student/wrong-answers/stats?phone=${encodeURIComponent(profile.phone)}`),
      ]);
      if (waRes.ok) {
        const data = await waRes.json();
        // Handle both old (array) and new (paginated) response shapes
        if (Array.isArray(data)) {
          setItems(data);
          setHasMore(false);
          setOffset(data.length);
        } else {
          setItems(data.items ?? []);
          setHasMore(data.hasMore ?? false);
          setOffset(data.items?.length ?? 0);
        }
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      if (!silent) setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.phone]);

  const loadMore = useCallback(async () => {
    if (!profile?.phone || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const base = getApiUrl();
    try {
      const res = await fetch(`${base}/student/wrong-answers?phone=${encodeURIComponent(profile.phone)}&limit=30&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        const newItems: WrongAnswer[] = Array.isArray(data) ? data : (data.items ?? []);
        setItems(prev => [...prev, ...newItems]);
        setHasMore(data.hasMore ?? false);
        setOffset(prev => prev + newItems.length);
      }
    } catch { /* silent */ }
    finally { setLoadingMore(false); }
  }, [profile?.phone, loadingMore, hasMore, offset]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const markRevised = async (questionId: number) => {
    if (!profile?.phone) return;
    setMarkingId(questionId);
    setRevising(prev => new Set(prev).add(questionId));
    try {
      const base = getApiUrl();
      const res = await fetch(`${base}/student/wrong-answers/${questionId}/mark-revised`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: profile.phone }),
      });
      if (res.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setItems(prev => prev.filter(w => w.questionId !== questionId));
        setStats(prev => prev ? {
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          revised: prev.revised + 1,
        } : prev);
        setExpandedId(null);
      } else {
        setRevising(prev => { const s = new Set(prev); s.delete(questionId); return s; });
        Alert.alert('Error', 'Failed to mark as revised.');
      }
    } catch {
      setRevising(prev => { const s = new Set(prev); s.delete(questionId); return s; });
      Alert.alert('Error', 'Network error. Try again.');
    } finally {
      setMarkingId(null);
    }
  };

  const subjects = stats
    ? Object.entries(stats.bySubject)
        .filter(([, v]) => v.pending > 0)
        .map(([id, v]) => ({ id, name: v.name, count: v.pending }))
    : [];

  const filtered = activeSubject === 'ALL'
    ? items
    : items.filter(w => String(w.subjectId) === activeSubject);

  if (!isActivated) {
    return (
      <View style={[S.container, { paddingTop: topPad }]}>
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Wrong Answers</Text>
          <View style={{ width: 36 }} />
        </View>
        <LockedCard
          featureName="Wrong Answers"
          description="Activate your account to track the questions you got wrong and revise your weak spots."
          onUnlock={showGate}
        />
        <ActivationGate visible={gateVisible} onClose={hideGate} featureName="Wrong Answers" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[S.container, { paddingTop: topPad }]}>
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Wrong Answers</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={S.centered}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[S.emptyText, { marginTop: 12 }]}>Loading your mistakes...</Text>
        </View>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[S.container, { paddingTop: topPad }]}>
        <View style={S.header}>
          <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Wrong Answers</Text>
          <View style={{ width: 36 }} />
        </View>
        <ErrorCard
          title="Couldn't load wrong answers"
          message="Check your internet connection and try again."
          icon="wifi-outline"
          onRetry={() => { setLoadError(false); load(); }}
        />
      </View>
    );
  }

  return (
    <View style={[S.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Wrong Answers</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[S.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* Stats row */}
        {stats && (
          <View style={S.statsRow}>
            <View style={[S.statCard, { borderColor: '#ef444430' }]}>
              <Text style={[S.statNum, { color: '#ef4444' }]}>{stats.pending}</Text>
              <Text style={S.statLbl}>To Review</Text>
            </View>
            <View style={[S.statCard, { borderColor: '#10b98130' }]}>
              <Text style={[S.statNum, { color: '#10b981' }]}>{stats.revised}</Text>
              <Text style={S.statLbl}>Revised</Text>
            </View>
            <View style={[S.statCard, { borderColor: `${C.primary}30` }]}>
              <Text style={[S.statNum, { color: C.primary }]}>{stats.total}</Text>
              <Text style={S.statLbl}>All Time</Text>
            </View>
          </View>
        )}

        {/* Progress bar */}
        {stats && stats.total > 0 && (
          <View style={S.progressWrap}>
            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${(stats.revised / stats.total) * 100}%` }]} />
            </View>
            <Text style={S.progressText}>
              {Math.round((stats.revised / stats.total) * 100)}% cleared
            </Text>
          </View>
        )}

        {/* Subject filter chips */}
        {subjects.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.chipRow}
          >
            <TouchableOpacity
              style={[S.chip, activeSubject === 'ALL' && S.chipActive]}
              onPress={() => setActiveSubject('ALL')}
            >
              <Text style={[S.chipText, activeSubject === 'ALL' && S.chipTextActive]}>
                All ({stats?.pending ?? 0})
              </Text>
            </TouchableOpacity>
            {subjects.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[S.chip, activeSubject === s.id && S.chipActive]}
                onPress={() => setActiveSubject(s.id)}
              >
                <Text style={[S.chipText, activeSubject === s.id && S.chipTextActive]}>
                  {s.name} ({s.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={S.emptyState}>
            <View style={S.emptyIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            </View>
            <Text style={S.emptyTitle}>
              {stats?.pending === 0 ? 'All caught up!' : 'No errors in this subject'}
            </Text>
            <Text style={S.emptyText}>
              {stats?.pending === 0
                ? 'You\'ve reviewed all your wrong answers. Keep practising to stay sharp.'
                : 'Switch to another subject to see pending reviews.'}
            </Text>
            {stats?.pending === 0 && (
              <TouchableOpacity
                style={S.practiceBtn}
                onPress={() => router.push('/(tabs)/quiz')}
              >
                <Text style={S.practiceBtnText}>Practice More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Question cards */}
        {filtered.map((item) => {
          const opts = parseOptions(item.options);
          const isExpanded = expandedId === item.questionId;
          const isMarking = markingId === item.questionId;

          return (
            <TouchableOpacity
              key={item.id}
              style={S.card}
              onPress={async () => {
                await Haptics.selectionAsync();
                setExpandedId(isExpanded ? null : item.questionId);
              }}
              activeOpacity={0.88}
            >
              {/* Card header */}
              <View style={S.cardHeader}>
                <View style={S.cardMeta}>
                  <View style={S.subjectBadge}>
                    <Text style={S.subjectBadgeText}>{item.subjectName}</Text>
                  </View>
                  <Text style={S.cardTime}>{timeAgo(item.attemptedAt)}</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={C.mutedForeground}
                />
              </View>

              {/* Question text */}
              <Text style={S.questionText} numberOfLines={isExpanded ? undefined : 2}>
                {item.questionText}
              </Text>

              {/* Your answer (collapsed) */}
              {!isExpanded && (
                <View style={S.wrongChip}>
                  <Ionicons name="close-circle" size={13} color="#ef4444" />
                  <Text style={S.wrongChipText}>Your answer: {item.selectedOption}</Text>
                </View>
              )}

              {/* Expanded answer review */}
              {isExpanded && (
                <View style={S.expandedSection}>
                  {/* Options */}
                  <View style={S.optionsWrap}>
                    {Object.entries(opts).map(([key, val]) => {
                      const isCorrect = key === item.correctOption;
                      const isWrong = key === item.selectedOption && key !== item.correctOption;
                      return (
                        <View
                          key={key}
                          style={[
                            S.optionRow,
                            isCorrect && S.optionCorrect,
                            isWrong && S.optionWrong,
                          ]}
                        >
                          <View style={[
                            S.optionKey,
                            isCorrect && S.optionKeyCorrect,
                            isWrong && S.optionKeyWrong,
                          ]}>
                            <Text style={[
                              S.optionKeyText,
                              (isCorrect || isWrong) && { color: '#fff' },
                            ]}>{key}</Text>
                          </View>
                          <Text style={[
                            S.optionVal,
                            isCorrect && { color: '#10b981', fontFamily: 'Inter_600SemiBold' },
                            isWrong && { color: '#ef4444', fontFamily: 'Inter_600SemiBold' },
                          ]} numberOfLines={3}>{val}</Text>
                          {isCorrect && <Ionicons name="checkmark-circle" size={16} color="#10b981" style={{ marginLeft: 4 }} />}
                          {isWrong && <Ionicons name="close-circle" size={16} color="#ef4444" style={{ marginLeft: 4 }} />}
                        </View>
                      );
                    })}
                  </View>

                  {/* Explanation */}
                  {item.explanation && (
                    <View style={S.explanationBox}>
                      <View style={S.explanationHeader}>
                        <Ionicons name="bulb" size={14} color="#f59e0b" />
                        <Text style={S.explanationLabel}>Explanation</Text>
                      </View>
                      <Text style={S.explanationText}>{item.explanation}</Text>
                    </View>
                  )}

                  {/* Mark revised button */}
                  <TouchableOpacity
                    style={[S.revisedBtn, isMarking && S.revisedBtnLoading]}
                    onPress={() => markRevised(item.questionId)}
                    disabled={isMarking}
                    activeOpacity={0.8}
                  >
                    {isMarking ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={16} color="#fff" />
                        <Text style={S.revisedBtnText}>I've Got This — Mark Revised</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Load More button */}
        {hasMore && (
          <TouchableOpacity
            style={S.loadMoreBtn}
            onPress={loadMore}
            disabled={loadingMore}
          >
            {loadingMore
              ? <ActivityIndicator size="small" color={C.primary} />
              : <Text style={[S.loadMoreText, { color: C.primary }]}>Load more questions</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.background,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: 'Fraunces_700Bold',
      fontSize: 18,
      color: C.foreground,
    },
    scroll: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      alignItems: 'center',
    },
    statNum: {
      fontFamily: 'Inter_700Bold',
      fontSize: 22,
    },
    statLbl: {
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      color: C.mutedForeground,
      marginTop: 2,
    },
    progressWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    progressTrack: {
      flex: 1,
      height: 6,
      backgroundColor: C.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      backgroundColor: '#10b981',
      borderRadius: 3,
    },
    progressText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: '#10b981',
      minWidth: 60,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 12,
      paddingRight: 16,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
    },
    chipActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    chipText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 13,
      color: C.mutedForeground,
    },
    chipTextActive: {
      color: '#fff',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#10b98115',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontFamily: 'Fraunces_700Bold',
      fontSize: 20,
      color: C.foreground,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: C.mutedForeground,
      textAlign: 'center',
      lineHeight: 20,
    },
    practiceBtn: {
      marginTop: 20,
      paddingHorizontal: 28,
      paddingVertical: 12,
      backgroundColor: C.primary,
      borderRadius: 24,
    },
    practiceBtnText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 14,
      color: '#fff',
    },
    card: {
      backgroundColor: C.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      padding: 14,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    subjectBadge: {
      backgroundColor: `${C.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    subjectBadgeText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      color: C.primary,
    },
    cardTime: {
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      color: C.mutedForeground,
    },
    questionText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: C.foreground,
      lineHeight: 20,
      marginBottom: 8,
    },
    wrongChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#ef444412',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    wrongChipText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: '#ef4444',
    },
    expandedSection: {
      marginTop: 4,
    },
    optionsWrap: {
      gap: 6,
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
      backgroundColor: C.background,
      borderWidth: 1,
      borderColor: C.border,
      gap: 10,
    },
    optionCorrect: {
      backgroundColor: '#10b98110',
      borderColor: '#10b98140',
    },
    optionWrong: {
      backgroundColor: '#ef444410',
      borderColor: '#ef444440',
    },
    optionKey: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    optionKeyCorrect: {
      backgroundColor: '#10b981',
    },
    optionKeyWrong: {
      backgroundColor: '#ef4444',
    },
    optionKeyText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      color: C.mutedForeground,
    },
    optionVal: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: C.foreground,
      lineHeight: 18,
    },
    explanationBox: {
      backgroundColor: '#f59e0b10',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#f59e0b30',
    },
    explanationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    explanationLabel: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: '#f59e0b',
    },
    explanationText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: C.foreground,
      lineHeight: 19,
    },
    revisedBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#10b981',
      borderRadius: 12,
      paddingVertical: 12,
    },
    revisedBtnLoading: {
      opacity: 0.7,
    },
    revisedBtnText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 14,
      color: '#fff',
    },
    loadMoreBtn: {
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center' as const,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 24,
    },
    loadMoreText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
  });
}

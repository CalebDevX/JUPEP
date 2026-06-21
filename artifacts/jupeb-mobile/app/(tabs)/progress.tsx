import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { getApiBase } from '@/lib/query-client';
import { ErrorCard } from '@/components/ErrorCard';
import type { AppColors } from '@/constants/colors';

type SubjectProgress = {
  subjectId: number;
  subjectName: string;
  averageScore: number;
  quizzesTaken: number;
  questionsAnswered: number;
};

type PaperProgress = {
  paper: string;
  paperLabel: string;
  averageScore: number;
  quizzesTaken: number;
};

type ProgressData = {
  totalQuizzes: number;
  averageScore: number;
  subjectProgress: SubjectProgress[];
  paperProgress: PaperProgress[];
  streakDays: number;
  totalQuestionsAnswered: number;
};

type RecentActivity = {
  id: number;
  subjectId: number;
  subjectName: string;
  paper: string;
  score: number;
  percentage: number;
  completedAt: string;
};

function gradeFromPct(pct: number) {
  if (pct >= 70) return { grade: 'A', color: '#10b981' };
  if (pct >= 60) return { grade: 'B', color: '#3b82f6' };
  if (pct >= 50) return { grade: 'C', color: '#f59e0b' };
  if (pct >= 45) return { grade: 'D', color: '#f97316' };
  if (pct >= 40) return { grade: 'E', color: '#94a3b8' };
  return { grade: 'F', color: '#ef4444' };
}

function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color, width: 42, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </Text>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  const C = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: C.foreground, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { profile } = useAuth();

  const [data, setData] = useState<ProgressData | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchProgress = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(false); }
    try {
      const base = getApiBase();
      const phone = profile?.phone;
      const [progressRes, activityRes] = await Promise.all([
        fetch(`${base}/progress${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
        fetch(`${base}/dashboard/recent-activity${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
      ]);
      if (!progressRes.ok && !activityRes.ok) throw new Error('Failed');
      if (progressRes.ok) setData(await progressRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.phone]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const overallGrade = useMemo(() => gradeFromPct(data?.averageScore ?? 0), [data]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: topPad }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ marginTop: 12, color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>Loading progress…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <Text style={styles.headerTitle}>My Progress</Text>
          <Text style={styles.headerSub}>Score analytics & trends</Text>
        </View>
        <ErrorCard
          title="Couldn't load progress"
          message="Check your internet connection and try again. Your quiz data is safely saved."
          icon="wifi-outline"
          onRetry={() => fetchProgress()}
        />
      </View>
    );
  }

  const hasData = (data?.totalQuizzes ?? 0) > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <Text style={styles.headerSub}>
          {hasData ? `${data!.totalQuizzes} quiz${data!.totalQuizzes === 1 ? '' : 'zes'} completed` : 'Start practising to see stats'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProgress(true)} tintColor={C.primary} />}
      >
        {/* Overview stats */}
        {hasData && data ? (
          <>
            {/* Grade ring */}
            <View style={styles.gradeCard}>
              <View style={[styles.gradeCircle, { borderColor: overallGrade.color }]}>
                <Text style={{ fontSize: 36, fontFamily: 'Inter_700Bold', color: overallGrade.color }}>{overallGrade.grade}</Text>
                <Text style={{ fontSize: 11, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>avg grade</Text>
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <View>
                  <Text style={{ fontSize: 13, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>Overall average</Text>
                  <Text style={{ fontSize: 28, fontFamily: 'Inter_700Bold', color: C.foreground }}>{data.averageScore}%</Text>
                </View>
                <ScoreBar pct={data.averageScore} color={overallGrade.color} />
                <Text style={{ fontSize: 11, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                  {data.totalQuestionsAnswered} questions answered
                </Text>
              </View>
            </View>

            {/* Stat cards */}
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
              <StatCard icon="🧪" value={String(data.totalQuizzes)} label="Quizzes done" color={C.primary} />
              <StatCard icon="📊" value={`${data.averageScore}%`} label="Avg score" color={overallGrade.color} />
              <StatCard icon="💬" value={String(data.totalQuestionsAnswered)} label="Questions" color="#7c3aed" />
            </View>

            {/* Subject breakdown */}
            {data.subjectProgress.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>By Subject</Text>
                {data.subjectProgress.map(sp => {
                  const g = gradeFromPct(sp.averageScore);
                  return (
                    <View key={sp.subjectId} style={styles.subjectRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground, flex: 1 }} numberOfLines={1}>
                          {sp.subjectName}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Text style={{ fontSize: 12, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                            {sp.quizzesTaken} quiz{sp.quizzesTaken !== 1 ? 'zes' : ''}
                          </Text>
                          <View style={{ backgroundColor: `${g.color}18`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 12, color: g.color, fontFamily: 'Inter_700Bold' }}>{g.grade}</Text>
                          </View>
                        </View>
                      </View>
                      <ScoreBar pct={sp.averageScore} color={g.color} />
                      <Text style={{ fontSize: 11, color: C.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 4 }}>
                        {sp.questionsAnswered} questions answered
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Paper breakdown */}
            {data.paperProgress.some(p => p.quizzesTaken > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>By Paper</Text>
                <View style={{ gap: 10 }}>
                  {data.paperProgress.filter(p => p.quizzesTaken > 0).map(pp => {
                    const g = gradeFromPct(pp.averageScore);
                    return (
                      <View key={pp.paper} style={[styles.subjectRow, { gap: 6 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground }}>{pp.paperLabel}</Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Text style={{ fontSize: 12, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                              {pp.quizzesTaken} quiz{pp.quizzesTaken !== 1 ? 'zes' : ''}
                            </Text>
                            <View style={{ backgroundColor: `${g.color}18`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                              <Text style={{ fontSize: 12, color: g.color, fontFamily: 'Inter_700Bold' }}>{g.grade}</Text>
                            </View>
                          </View>
                        </View>
                        <ScoreBar pct={pp.averageScore} color={g.color} />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Recent activity */}
            {activity.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {activity.slice(0, 8).map((a, i) => {
                  const g = gradeFromPct(a.percentage ?? 0);
                  const date = new Date(a.completedAt);
                  return (
                    <View key={i} style={[styles.activityRow, i < Math.min(activity.length, 8) - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.foreground }}>{a.subjectName}</Text>
                        <Text style={{ fontSize: 11, color: C.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                          Paper {a.paper} · {date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ backgroundColor: `${g.color}18`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: g.color }}>{g.grade}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                          {(a.percentage ?? 0).toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64 }}>📊</Text>
            <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: C.foreground, marginTop: 16 }}>
              No quiz data yet
            </Text>
            <Text style={{ fontSize: 14, color: C.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
              Complete some practice quizzes to start tracking your progress and performance.
            </Text>
            <TouchableOpacity
              style={{ marginTop: 24, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: C.primary, borderRadius: 14 }}
              onPress={() => router.push('/(tabs)/quiz')}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' }}>Start Practising</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.background },
    header: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20, paddingBottom: 20,
    },
    headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
    headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    gradeCard: {
      flexDirection: 'row', gap: 16, alignItems: 'center',
      margin: 16, padding: 20,
      backgroundColor: C.card, borderRadius: 20,
      borderWidth: 1, borderColor: C.border,
    },
    gradeCircle: {
      width: 80, height: 80, borderRadius: 40,
      borderWidth: 3,
      alignItems: 'center', justifyContent: 'center',
    },
    section: {
      marginHorizontal: 16, marginBottom: 20,
      backgroundColor: C.card, borderRadius: 20,
      borderWidth: 1, borderColor: C.border,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 14,
    },
    subjectRow: {
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    activityRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12,
    },
    emptyState: {
      alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32,
    },
  });
}

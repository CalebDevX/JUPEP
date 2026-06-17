import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import type { AppColors } from '@/constants/colors';

// ─── Constants ─────────────────────────────────────────────────────────────────
const EXAM_DATE = new Date('2027-05-15');
const DAILY_GOAL = 10;

const STUDY_TIPS = [
  { icon: '🔄', tip: 'Spaced repetition beats cramming. Review notes at growing intervals for lasting retention.' },
  { icon: '⏱️', tip: 'Try the Pomodoro Technique: 25 minutes of focused study, then a 5-minute break.' },
  { icon: '💬', tip: 'Active recall is 3× more effective than re-reading. Close your notes and quiz yourself.' },
  { icon: '📊', tip: 'Past JUPEB questions reveal patterns. 80% of exam topics repeat across years.' },
  { icon: '🗣️', tip: 'Teach what you learn. Explaining a concept out loud locks it into long-term memory.' },
  { icon: '🎯', tip: 'Start with your weakest subject when your mind is freshest — usually in the morning.' },
  { icon: '🗺️', tip: 'Draw a mind map after each chapter. Visual summaries stick far faster than linear notes.' },
  { icon: '📱', tip: 'Consistent short sessions (30 min/day) beat rare marathon study sessions every time.' },
];

const SUBJECT_META: Record<string, {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
}> = {
  GOV: { label: 'Government', icon: 'business', accent: '#0284c7' },
  CRS: { label: 'Chr. Religious Studies', icon: 'book', accent: '#d97706' },
  LIT: { label: 'Literature in English', icon: 'library', accent: '#16a34a' },
  MAT: { label: 'Mathematics', icon: 'calculator', accent: '#7c3aed' },
  PHY: { label: 'Physics', icon: 'flash', accent: '#0284c7' },
  CHE: { label: 'Chemistry', icon: 'flask', accent: '#059669' },
  BIO: { label: 'Biology', icon: 'leaf', accent: '#16a34a' },
  ECO: { label: 'Economics', icon: 'trending-up', accent: '#d97706' },
  ENG: { label: 'English Language', icon: 'pencil', accent: '#0284c7' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getDaysToExam(): number {
  const diff = EXAM_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return [];
}

// Deterministic "fake progress" per subject code for display
function subjectProgress(code: string): number {
  return ((code.charCodeAt(0) * 7 + code.charCodeAt(code.length - 1) * 3 + 11) % 55) + 10;
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [dailyDone, setDailyDone] = useState(0);
  const [tipIndex, setTipIndex] = useState(new Date().getDay() % STUDY_TIPS.length);
  const [showNotifInfo, setShowNotifInfo] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const streakScale = useRef(new Animated.Value(0.85)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const subjectList = getSubjectList(profile?.subjects);
  const streak: number = (profile as any)?.streak ?? 1;
  const xp: number = (profile as any)?.xp ?? 0;
  const daysLeft = getDaysToExam();
  const tip = STUDY_TIPS[tipIndex];

  useEffect(() => {
    const key = `jupeb_daily_done_${new Date().toDateString()}`;
    AsyncStorage.getItem(key).then((v) => {
      const done = v ? Math.max(0, parseInt(v, 10)) || 0 : 0;
      setDailyDone(done);
      Animated.spring(progressAnim, {
        toValue: Math.min(done / DAILY_GOAL, 1),
        useNativeDriver: false,
        friction: 8,
      }).start();
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      Animated.spring(streakScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const goalPct = Math.min(dailyDone / DAILY_GOAL, 1);
  const goalComplete = dailyDone >= DAILY_GOAL;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════════ */}
      <View style={[styles.hero, { paddingTop: topPad + 20 }]}>
        <View style={styles.heroDecor1} pointerEvents="none" />
        <View style={styles.heroDecor2} pointerEvents="none" />

        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>{getGreeting()}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {profile?.firstName ?? 'Student'} 👋
            </Text>
            <Text style={styles.heroDate}>
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setShowNotifInfo(b => !b)}
            activeOpacity={0.8}
          >
            <Ionicons name={showNotifInfo ? 'notifications' : 'notifications-outline'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stat badges */}
        <Animated.View style={[styles.badgeRow, { transform: [{ scale: streakScale }] }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🔥</Text>
            <Text style={styles.badgeVal}>{streak}</Text>
            <Text style={styles.badgeLbl}>streak</Text>
          </View>
          <View style={[styles.badge, styles.badgeGap]}>
            <Text style={styles.badgeEmoji}>⭐</Text>
            <Text style={styles.badgeVal}>{xp.toLocaleString()}</Text>
            <Text style={styles.badgeLbl}>XP</Text>
          </View>
          <View style={[styles.badge, styles.badgeGap]}>
            <Text style={styles.badgeEmoji}>⏳</Text>
            <Text style={styles.badgeVal}>{daysLeft}</Text>
            <Text style={styles.badgeLbl}>days left</Text>
          </View>
        </Animated.View>
      </View>

      {/* ── Notification info bar ─────────────────────────────────────────────── */}
      {showNotifInfo && (
        <View style={styles.notifBar}>
          <Ionicons name="alarm-outline" size={15} color={C.info} />
          <Text style={styles.notifBarText}>
            {Platform.OS === 'web'
              ? 'Install the native app to receive daily study reminders at 9:00 AM.'
              : 'Daily reminders scheduled: 9:00 AM & 8:00 PM. Keep that streak alive!'}
          </Text>
          <TouchableOpacity onPress={() => setShowNotifInfo(false)}>
            <Ionicons name="close-outline" size={18} color={C.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* ══ TODAY'S MISSION ══════════════════════════════════════════════════════ */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionTitleRow}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
              <Text style={styles.missionTitle}>Today's Mission</Text>
            </View>
            {goalComplete && (
              <View style={styles.doneBadge}>
                <Ionicons name="checkmark-circle" size={13} color={C.success} />
                <Text style={styles.doneText}>Complete!</Text>
              </View>
            )}
          </View>

          <Text style={styles.missionSub}>
            {goalComplete
              ? `Amazing! You've completed ${DAILY_GOAL} questions today. Keep the momentum going.`
              : `${DAILY_GOAL - dailyDone} more question${DAILY_GOAL - dailyDone !== 1 ? 's' : ''} to hit your daily goal`}
          </Text>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: goalComplete ? C.success : C.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <View style={styles.progressMeta}>
            <Text style={styles.progressCount}>{dailyDone} / {DAILY_GOAL} questions</Text>
            <Text style={[styles.progressPct, { color: goalComplete ? C.success : C.primary }]}>
              {Math.round(goalPct * 100)}%
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.missionCta, goalComplete && { backgroundColor: C.successDim, borderWidth: 1, borderColor: `${C.success}40` }]}
            onPress={() => router.push('/(tabs)/quiz')}
            activeOpacity={0.82}
          >
            <Text style={[styles.missionCtaText, goalComplete && { color: C.success }]}>
              {goalComplete ? 'Practice More Questions' : 'Start Practicing →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══ QUICK ACTIONS 2×2 ════════════════════════════════════════════════════ */}
        <Text style={styles.secLabel}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            emoji="📝"
            title="Practice"
            sub="Past questions"
            accent={C.primary}
            accentDim={C.primaryDim}
            onPress={() => router.push('/(tabs)/quiz')}
            styles={styles}
          />
          <ActionCard
            emoji="📖"
            title="Study Notes"
            sub="Textbook content"
            accent={C.success}
            accentDim={C.successDim}
            onPress={() => router.push('/(tabs)/notes')}
            styles={styles}
          />
          <ActionCard
            emoji="🤖"
            title="AI Tutor"
            sub="Ask anything"
            accent={C.warning}
            accentDim={C.warningDim}
            onPress={() => router.push('/ai-chat' as any)}
            styles={styles}
          />
          <ActionCard
            emoji="🏆"
            title="Leaderboard"
            sub="Your ranking"
            accent={C.info}
            accentDim={C.infoDim}
            onPress={() => router.push('/leaderboard' as any)}
            styles={styles}
          />
        </View>

        {/* ══ SUBJECT PROGRESS ═════════════════════════════════════════════════════ */}
        {subjectList.length > 0 && (
          <>
            <Text style={styles.secLabel}>Your Subjects</Text>
            <View style={styles.subjectsCard}>
              {subjectList.map((code, i) => {
                const meta = SUBJECT_META[code.toUpperCase()] ?? {
                  label: code, icon: 'school' as const, accent: C.primary,
                };
                const pct = subjectProgress(code);
                return (
                  <TouchableOpacity
                    key={code}
                    style={[styles.subjectRow, i < subjectList.length - 1 && styles.subjectDivider]}
                    onPress={() => router.push('/(tabs)/notes')}
                    activeOpacity={0.72}
                  >
                    <View style={[styles.subjectIconBox, { backgroundColor: `${meta.accent}18` }]}>
                      <Ionicons name={meta.icon} size={18} color={meta.accent} />
                    </View>
                    <View style={styles.subjectBody}>
                      <View style={styles.subjectTopRow}>
                        <Text style={styles.subjectCode}>{code}</Text>
                        <Text style={[styles.subjectPct, { color: meta.accent }]}>{pct}%</Text>
                      </View>
                      <Text style={styles.subjectName} numberOfLines={1}>{meta.label}</Text>
                      <View style={styles.subjectTrack}>
                        <View style={[styles.subjectFill, { width: `${pct}%`, backgroundColor: meta.accent }]} />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={13} color={C.mutedForeground} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ══ EXAM COUNTDOWN ═══════════════════════════════════════════════════════ */}
        <Text style={styles.secLabel}>Exam Countdown</Text>
        <View style={styles.countdownCard}>
          <View style={styles.countdownLeft}>
            <Text style={styles.countdownDays}>{daysLeft}</Text>
            <Text style={styles.countdownDaysLabel}>days</Text>
          </View>
          <View style={styles.countdownRight}>
            <Text style={styles.countdownTitle}>JUPEB Final Exam</Text>
            <Text style={styles.countdownDate}>May 15, 2027</Text>
            <Text style={styles.countdownSub}>
              {daysLeft > 180
                ? 'You have time — but consistency is key!'
                : daysLeft > 90
                ? 'Getting closer — intensify your prep!'
                : 'Final stretch — give it everything!'}
            </Text>
          </View>
        </View>

        {/* ══ STUDY TIP ════════════════════════════════════════════════════════════ */}
        <Text style={styles.secLabel}>Study Tip</Text>
        <TouchableOpacity style={styles.tipCard} onPress={() => setTipIndex(i => (i + 1) % STUDY_TIPS.length)} activeOpacity={0.82}>
          <Text style={styles.tipEmoji}>{tip.icon}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.tipMeta}>Tip {tipIndex + 1} of {STUDY_TIPS.length} · tap for next</Text>
            <Text style={styles.tipText}>{tip.tip}</Text>
          </View>
          <Ionicons name="arrow-forward-circle-outline" size={22} color={C.primary} />
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Action card sub-component ───────────────────────────────────────────────────
function ActionCard({
  emoji, title, sub, accent, accentDim, onPress, styles,
}: {
  emoji: string;
  title: string;
  sub: string;
  accent: string;
  accentDim: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { borderColor: `${accent}30` }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIconBox, { backgroundColor: accentDim }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles factory ─────────────────────────────────────────────────────────────
function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    scroll: { paddingBottom: 32 },

    // Hero
    hero: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20,
      paddingBottom: 22,
      overflow: 'hidden',
    },
    heroDecor1: {
      position: 'absolute', width: 220, height: 220, borderRadius: 110,
      backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -50,
    },
    heroDecor2: {
      position: 'absolute', width: 130, height: 130, borderRadius: 65,
      backgroundColor: 'rgba(255,255,255,0.04)', bottom: -50, left: 50,
    },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
    heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
    heroName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.4, marginTop: 2 },
    heroDate: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular', marginTop: 3 },
    bellBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center', justifyContent: 'center',
    },
    badgeRow: { flexDirection: 'row' },
    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8,
    },
    badgeGap: { marginLeft: 10 },
    badgeEmoji: { fontSize: 14 },
    badgeVal: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
    badgeLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' },

    // Notif bar
    notifBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: C.infoDim, borderBottomWidth: 1, borderColor: `${C.info}25`,
      paddingHorizontal: 16, paddingVertical: 10,
    },
    notifBarText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 17 },

    // Mission card
    missionCard: {
      margin: 16, marginBottom: 0,
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border, padding: 18,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    },
    missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    missionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    missionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground },
    doneBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: C.successDim, borderRadius: 14,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    doneText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.success },
    missionSub: { fontSize: 13, color: C.mutedForeground, fontFamily: 'Inter_400Regular', marginBottom: 14, lineHeight: 19 },
    progressTrack: { height: 10, borderRadius: 6, backgroundColor: C.muted, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 6 },
    progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    progressCount: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    progressPct: { fontSize: 12, fontFamily: 'Inter_700Bold' },
    missionCta: {
      backgroundColor: C.primary, borderRadius: C.radius,
      paddingVertical: 13, alignItems: 'center',
    },
    missionCtaText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },

    // Section label
    secLabel: {
      fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground,
      letterSpacing: 1, textTransform: 'uppercase',
      paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10,
    },

    // Actions grid
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
    actionCard: {
      width: '47%', backgroundColor: C.card, borderWidth: 1,
      borderRadius: C.radiusLg, padding: 16,
      shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    actionIconBox: {
      width: 52, height: 52, borderRadius: 15,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    actionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 2 },
    actionSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground },

    // Subjects card
    subjectsCard: {
      marginHorizontal: 16, backgroundColor: C.card,
      borderRadius: C.radiusLg, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    },
    subjectRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    subjectDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
    subjectIconBox: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    subjectBody: { flex: 1, marginLeft: 12 },
    subjectTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    subjectCode: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground, letterSpacing: 0.5 },
    subjectPct: { fontSize: 11, fontFamily: 'Inter_700Bold' },
    subjectName: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.foreground, marginBottom: 7 },
    subjectTrack: { height: 5, borderRadius: 4, backgroundColor: C.muted, overflow: 'hidden' },
    subjectFill: { height: '100%', borderRadius: 4 },

    // Countdown card
    countdownCard: {
      marginHorizontal: 16, backgroundColor: C.card,
      borderRadius: C.radiusLg, borderWidth: 1, borderColor: C.border,
      flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    },
    countdownLeft: {
      width: 90, backgroundColor: C.primaryDim, alignItems: 'center',
      justifyContent: 'center', paddingVertical: 20, borderRightWidth: 1, borderRightColor: C.border,
    },
    countdownDays: { fontSize: 36, fontFamily: 'Inter_700Bold', color: C.primary, letterSpacing: -1 },
    countdownDaysLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: C.primary, opacity: 0.7 },
    countdownRight: { flex: 1, padding: 16 },
    countdownTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 3 },
    countdownDate: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.primary, marginBottom: 5 },
    countdownSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 17 },

    // Study tip
    tipCard: {
      marginHorizontal: 16, backgroundColor: C.card,
      borderRadius: C.radiusLg, borderWidth: 1, borderColor: `${C.primary}25`,
      flexDirection: 'row', alignItems: 'center', padding: 16,
    },
    tipEmoji: { fontSize: 28 },
    tipMeta: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: C.primary, letterSpacing: 0.3, marginBottom: 5, textTransform: 'uppercase' },
    tipText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 19 },
  });
}

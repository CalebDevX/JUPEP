import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Platform, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import type { AppColors } from '@/constants/colors';

const EXAM_DATE = new Date('2027-05-15');
const DAILY_GOAL = 10;

const STUDY_TIPS = [
  { icon: '🔄', text: 'Spaced repetition beats cramming. Review at growing intervals.' },
  { icon: '⏱️', text: '25 minutes of focused study + 5 minute break = Pomodoro magic.' },
  { icon: '💬', text: 'Active recall (quizzing yourself) is 3× better than re-reading.' },
  { icon: '📊', text: '80% of JUPEB exam topics repeat from past questions.' },
  { icon: '🗣️', text: 'Explain concepts out loud to lock them into long-term memory.' },
  { icon: '🎯', text: 'Tackle your weakest subject first when your mind is freshest.' },
  { icon: '🗺️', text: 'Draw a mind map after each chapter — visual memory sticks.' },
  { icon: '📱', text: '30 consistent minutes daily beats rare 4-hour marathon sessions.' },
];

const SUBJECT_ACCENT: Record<string, string> = {
  GOV: '#3b82f6', CRS: '#f59e0b', LIT: '#10b981',
  MAT: '#8b5cf6', PHY: '#06b6d4', CHE: '#ec4899',
  BIO: '#10b981', ECO: '#f97316', ENG: '#06b6d4',
};

function getDaysToExam() {
  return Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86400000));
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function parseSubjects(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects;
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') { try { return JSON.parse(subjects); } catch { return [subjects]; } }
  return [];
}

const { width: SW } = Dimensions.get('window');

export default function HomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);

  const [dailyDone, setDailyDone] = useState(0);
  const [tipIndex, setTipIndex] = useState(new Date().getDay() % STUDY_TIPS.length);
  const [readCount, setReadCount] = useState(0);

  const fadeA = useRef(new Animated.Value(0)).current;
  const slideA = useRef(new Animated.Value(30)).current;
  const barA = useRef(new Animated.Value(0)).current;

  const subjects = parseSubjects(profile?.subjects);
  const streak: number = (profile as any)?.streak ?? 1;
  const xp: number = (profile as any)?.xp ?? 0;
  const daysLeft = getDaysToExam();
  const tip = STUDY_TIPS[tipIndex];

  useEffect(() => {
    const key = `jupeb_daily_done_${new Date().toDateString()}`;
    AsyncStorage.getItem(key).then((v) => {
      const done = Math.max(0, parseInt(v ?? '0', 10) || 0);
      setDailyDone(done);
      Animated.spring(barA, { toValue: Math.min(done / DAILY_GOAL, 1), useNativeDriver: false, friction: 8 }).start();
    });

    // Count read chapters
    AsyncStorage.getAllKeys().then(keys => {
      const readKeys = (keys as string[]).filter(k => k.startsWith('jupeb_chapter_read_'));
      setReadCount(readKeys.length);
    }).catch(() => {});

    Animated.parallel([
      Animated.timing(fadeA, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(slideA, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const goalPct = Math.min(dailyDone / DAILY_GOAL, 1);
  const goalDone = dailyDone >= DAILY_GOAL;

  return (
    <ScrollView style={S.root} contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <View style={[S.topBar, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={S.greeting}>{getGreeting()},</Text>
          <Text style={S.name}>{profile?.firstName ?? 'Student'} 👋</Text>
        </View>
        <TouchableOpacity style={S.notifBtn} onPress={() => {}} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={C.foreground} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeA, transform: [{ translateY: slideA }] }}>

        {/* ── Streak card (inverted) ──────────────────────────────────────── */}
        <TouchableOpacity style={S.streakCard} activeOpacity={0.92}>
          <View style={S.streakLeft}>
            <Text style={S.streakFire}>🔥</Text>
            <Text style={S.streakNumber}>{streak}</Text>
            <Text style={S.streakLabel}>day{streak !== 1 ? 's' : ''}</Text>
          </View>
          <View style={S.streakDivider} />
          <View style={S.streakRight}>
            <Text style={S.streakRightTitle}>Current streak</Text>
            <Text style={S.streakRightSub}>
              {streak === 0
                ? 'Start studying today!'
                : streak < 3
                ? 'Keep it going — day 3 unlocks a bonus!'
                : streak < 7
                ? "You're building momentum. Don't stop!"
                : "Incredible! You're on fire 🔥"}
            </Text>
            <View style={S.streakStats}>
              <View style={S.streakStat}>
                <Text style={S.streakStatVal}>{xp.toLocaleString()}</Text>
                <Text style={S.streakStatLbl}>XP</Text>
              </View>
              <View style={S.streakStat}>
                <Text style={S.streakStatVal}>{daysLeft}</Text>
                <Text style={S.streakStatLbl}>days left</Text>
              </View>
              {readCount > 0 && (
                <View style={S.streakStat}>
                  <Text style={S.streakStatVal}>{readCount}</Text>
                  <Text style={S.streakStatLbl}>chapters read</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Daily mission ──────────────────────────────────────────────── */}
        <View style={S.section}>
          <View style={S.sectionRow}>
            <Text style={S.sectionTitle}>Today's Mission</Text>
            {goalDone && <Text style={S.donePill}>✓ Done</Text>}
          </View>
          <View style={S.missionCard}>
            <View style={S.missionTop}>
              <Text style={S.missionCount}>{dailyDone}<Text style={S.missionTotal}>/{DAILY_GOAL}</Text></Text>
              <Text style={S.missionLabel}>questions{'\n'}answered</Text>
            </View>
            <View style={S.missionBarTrack}>
              <Animated.View style={[S.missionBarFill, {
                backgroundColor: goalDone ? C.success : C.primary,
                width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <TouchableOpacity
              style={[S.missionBtn, goalDone && { backgroundColor: C.successDim }]}
              onPress={() => router.push('/(tabs)/quiz')}
              activeOpacity={0.82}
            >
              <Ionicons
                name={goalDone ? 'checkmark-circle' : 'play'}
                size={16}
                color={goalDone ? C.success : C.primaryForeground}
              />
              <Text style={[S.missionBtnText, goalDone && { color: C.success }]}>
                {goalDone ? 'Practice more' : 'Practice now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick action strip ─────────────────────────────────────────── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Quick Access</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.pillRow}>
            {[
              { icon: 'help-circle' as const, label: 'Practice', onPress: () => router.push('/(tabs)/quiz'), color: C.primary },
              { icon: 'book' as const, label: 'Notes', onPress: () => router.push('/(tabs)/notes'), color: C.success },
              { icon: 'chatbubble-ellipses' as const, label: 'AI Tutor', onPress: () => router.push('/ai-chat' as any), color: C.warning },
              { icon: 'trophy' as const, label: 'Rankings', onPress: () => router.push('/leaderboard' as any), color: C.info },
            ].map(a => (
              <TouchableOpacity key={a.label} style={[S.pill, { borderColor: `${a.color}35` }]} onPress={a.onPress} activeOpacity={0.75}>
                <View style={[S.pillIcon, { backgroundColor: `${a.color}15` }]}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text style={S.pillLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Subjects ──────────────────────────────────────────────────── */}
        {subjects.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionRow}>
              <Text style={S.sectionTitle}>Subjects</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/notes')} activeOpacity={0.7}>
                <Text style={S.seeAll}>See notes →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.subjectRow}>
              {subjects.map(code => {
                const accent = SUBJECT_ACCENT[code.toUpperCase()] ?? C.primary;
                const pct = ((code.charCodeAt(0) * 7 + code.charCodeAt(code.length - 1) * 3 + 11) % 55) + 10;
                return (
                  <TouchableOpacity
                    key={code}
                    style={S.subjectCard}
                    onPress={() => router.push('/(tabs)/notes')}
                    activeOpacity={0.75}
                  >
                    <View style={[S.subjectDot, { backgroundColor: accent }]} />
                    <Text style={[S.subjectCode, { color: accent }]}>{code}</Text>
                    <Text style={S.subjectPct}>{pct}%</Text>
                    <View style={S.subjectTrack}>
                      <View style={[S.subjectFill, { width: `${pct}%`, backgroundColor: accent }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── 2 feature cards ───────────────────────────────────────────── */}
        <View style={S.section}>
          <View style={S.featureRow}>
            <TouchableOpacity
              style={[S.featureCard, { borderColor: `${C.primary}30` }]}
              onPress={() => router.push('/(tabs)/notes')}
              activeOpacity={0.8}
            >
              <Text style={S.featureEmoji}>📖</Text>
              <Text style={S.featureTitle}>Study Notes</Text>
              <Text style={S.featureSub}>CRS · GOV · LIT{'\n'}textbook content</Text>
              <View style={[S.featureArrow, { backgroundColor: `${C.primary}12` }]}>
                <Ionicons name="arrow-forward" size={14} color={C.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.featureCard, { borderColor: `${C.success}30` }]}
              onPress={() => router.push('/ai-chat' as any)}
              activeOpacity={0.8}
            >
              <Text style={S.featureEmoji}>🤖</Text>
              <Text style={S.featureTitle}>AI Tutor</Text>
              <Text style={S.featureSub}>Ask questions,{'\n'}get explanations</Text>
              <View style={[S.featureArrow, { backgroundColor: `${C.success}12` }]}>
                <Ionicons name="arrow-forward" size={14} color={C.success} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Study tip ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={S.tipCard}
          onPress={() => setTipIndex(i => (i + 1) % STUDY_TIPS.length)}
          activeOpacity={0.85}
        >
          <Text style={S.tipEmoji}>{tip.icon}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.tipLabel}>Study tip · tap for next</Text>
            <Text style={S.tipText}>{tip.text}</Text>
          </View>
        </TouchableOpacity>

        {/* ── Exam countdown strip ──────────────────────────────────────── */}
        <View style={S.countdownStrip}>
          <Text style={S.countdownNum}>{daysLeft}</Text>
          <Text style={S.countdownText}>days until JUPEB Final Exam — May 15, 2027</Text>
        </View>

        <View style={{ height: 110 }} />
      </Animated.View>
    </ScrollView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },

    // Top bar
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    name: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5, marginTop: 1 },
    notifBtn: {
      width: 42, height: 42, borderRadius: 21,
      borderWidth: 1.5, borderColor: C.border,
      alignItems: 'center', justifyContent: 'center',
    },

    // Streak (inverted card)
    streakCard: {
      backgroundColor: C.invertedBg,
      borderRadius: C.radiusLg,
      flexDirection: 'row', alignItems: 'center',
      padding: 20, marginBottom: 24,
    },
    streakLeft: { alignItems: 'center', paddingRight: 20 },
    streakFire: { fontSize: 26, marginBottom: 4 },
    streakNumber: { fontSize: 36, fontFamily: 'Inter_700Bold', color: C.invertedFg, letterSpacing: -1 },
    streakLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    streakDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 20 },
    streakRight: { flex: 1 },
    streakRightTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: C.invertedFg, marginBottom: 4 },
    streakRightSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)', lineHeight: 17, marginBottom: 12 },
    streakStats: { flexDirection: 'row', gap: 16 },
    streakStat: {},
    streakStatVal: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.invertedFg },
    streakStatLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)' },

    // Section
    section: { marginBottom: 24 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.2 },
    seeAll: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.primary },
    donePill: {
      fontSize: 11, fontFamily: 'Inter_700Bold', color: C.success,
      backgroundColor: C.successDim, borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 4,
    },

    // Mission card
    missionCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 16,
    },
    missionTop: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
    missionCount: { fontSize: 40, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -1 },
    missionTotal: { fontSize: 18, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    missionLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 18 },
    missionBarTrack: { height: 6, borderRadius: 4, backgroundColor: C.muted, overflow: 'hidden', marginBottom: 14 },
    missionBarFill: { height: '100%', borderRadius: 4 },
    missionBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: C.primary, borderRadius: C.radiusSm, paddingVertical: 12,
    },
    missionBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.primaryForeground },

    // Pill strip
    pillRow: { gap: 10, paddingRight: 4 },
    pill: {
      alignItems: 'center', borderWidth: 1.5,
      borderRadius: C.radius, paddingHorizontal: 14, paddingVertical: 12, gap: 8,
      backgroundColor: C.card, minWidth: 80,
    },
    pillIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    pillLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.foreground },

    // Subject cards (horizontal)
    subjectRow: { gap: 10, paddingRight: 4 },
    subjectCard: {
      width: 100, backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 12,
    },
    subjectDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
    subjectCode: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 4 },
    subjectPct: { fontSize: 11, fontFamily: 'Inter_500Medium', color: C.mutedForeground, marginBottom: 6 },
    subjectTrack: { height: 3, borderRadius: 2, backgroundColor: C.border, overflow: 'hidden' },
    subjectFill: { height: '100%', borderRadius: 2 },

    // Feature 2-card row
    featureRow: { flexDirection: 'row', gap: 12 },
    featureCard: {
      flex: 1, backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1.5, padding: 16, gap: 4,
    },
    featureEmoji: { fontSize: 26, marginBottom: 6 },
    featureTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground },
    featureSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 18, marginBottom: 12 },
    featureArrow: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

    // Study tip
    tipCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12,
    },
    tipEmoji: { fontSize: 26 },
    tipLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.primary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
    tipText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 19 },

    // Countdown strip
    countdownStrip: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: C.muted, borderRadius: C.radius, padding: 14,
    },
    countdownNum: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.primary },
    countdownText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 18 },
  });
}

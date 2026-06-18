import React, {
  useEffect, useRef, useState, useMemo, useCallback,
} from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Platform, Animated, TextInput, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useActivation } from '@/hooks/useActivation';
import ActivationGate from '@/components/ActivationGate';
import { router } from 'expo-router';
import type { AppColors } from '@/constants/colors';

const EXAM_DATE = new Date('2027-05-15');
const DAILY_GOAL = 10;
const POMODORO_SECS = 25 * 60;

const STUDY_TIPS = [
  { icon: '🔄', text: 'Spaced repetition beats cramming. Review at growing intervals.' },
  { icon: '⏱️', text: '25 minutes focused + 5 minute break = Pomodoro magic.' },
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

const MOTIVATIONS = [
  'Your hard work today is your success tomorrow.',
  'Every question you practice is a step closer to your dream university.',
  'Champions are made in the hours when no one is watching.',
  'Small consistent effort creates extraordinary results.',
  'You are one study session away from a breakthrough.',
];

function getDaysToExam() {
  return Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86400000));
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function parseSubjects(s: any): string[] {
  if (Array.isArray(s)) return s;
  if (s && typeof s === 'object') return Object.keys(s);
  if (typeof s === 'string') { try { return JSON.parse(s); } catch { return [s]; } }
  return [];
}
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function fmtTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Focus Mode DND guide ──────────────────────────────────────────────────────
async function openDndSettings() {
  if (Platform.OS === 'android') {
    try {
      await Linking.openURL('android.settings.ZEN_MODE_SETTINGS');
      return;
    } catch {}
  }
  if (Platform.OS === 'ios') {
    try {
      await Linking.openURL('App-Prefs:root=DO_NOT_DISTURB');
      return;
    } catch {}
  }
  Alert.alert(
    'Enable Do Not Disturb',
    Platform.OS === 'android'
      ? 'Go to: Settings → Sounds → Do Not Disturb → Turn On'
      : 'Go to: Settings → Focus → Do Not Disturb → Turn On\n\nOr swipe down Control Centre and tap the moon icon.',
    [
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
      { text: 'Got it', style: 'cancel' },
    ]
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);
  const { isOnline } = useNetworkStatus();
  const { isActivated, gateVisible, showGate, hideGate } = useActivation();

  // State
  const [dailyDone, setDailyDone]     = useState(0);
  const [tipIndex, setTipIndex]       = useState(new Date().getDay() % STUDY_TIPS.length);
  const [readCount, setReadCount]     = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const [focusSecs, setFocusSecs]     = useState(POMODORO_SECS);
  const [dictQuery, setDictQuery]     = useState('');

  // Animations
  const fadeA  = useRef(new Animated.Value(0)).current;
  const slideA = useRef(new Animated.Value(24)).current;
  const barA   = useRef(new Animated.Value(0)).current;
  const focusPulse = useRef(new Animated.Value(1)).current;
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const subjects  = parseSubjects(profile?.subjects);
  const streak: number = (profile as any)?.streak ?? 1;
  const xp: number    = (profile as any)?.xp ?? 0;
  const daysLeft      = getDaysToExam();
  const tip           = STUDY_TIPS[tipIndex];
  const motivation    = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length];
  const daysUrgency   = daysLeft < 30 ? C.destructive : daysLeft < 90 ? C.warning : C.success;

  useEffect(() => {
    const key = `jupeb_daily_done_${new Date().toDateString()}`;
    AsyncStorage.getItem(key).then(v => {
      const done = Math.max(0, parseInt(v ?? '0', 10) || 0);
      setDailyDone(done);
      Animated.spring(barA, { toValue: Math.min(done / DAILY_GOAL, 1), useNativeDriver: false, friction: 8 }).start();
    });
    AsyncStorage.getAllKeys().then(keys => {
      setReadCount((keys as string[]).filter(k => k.startsWith('jupeb_chapter_read_')).length);
    }).catch(() => {});
    Animated.parallel([
      Animated.timing(fadeA, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideA, { toValue: 0, friction: 9, tension: 55, useNativeDriver: true }),
    ]).start();
  }, []);

  // Pomodoro timer
  const startFocus = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFocusActive(true);
    setFocusSecs(POMODORO_SECS);
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(focusPulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(focusPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    await openDndSettings();
  }, []);

  const stopFocus = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFocusActive(false);
    setFocusSecs(POMODORO_SECS);
    focusPulse.stopAnimation();
    focusPulse.setValue(1);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (focusActive) {
      timerRef.current = setInterval(() => {
        setFocusSecs(s => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            setFocusActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉 Session Complete!', 'Great work! You completed 25 minutes of focused study. Take a 5-minute break.');
            return POMODORO_SECS;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [focusActive]);

  const goalPct  = Math.min(dailyDone / DAILY_GOAL, 1);
  const goalDone = dailyDone >= DAILY_GOAL;

  return (
    <>
    <ScrollView style={S.root} contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <View style={[S.hero, { paddingTop: topPad + 20 }]}>
        <View style={S.heroDecor1} /><View style={S.heroDecor2} />

        <View style={S.heroTop}>
          <View>
            <Text style={S.greeting}>{getGreeting()}</Text>
            <Text style={S.name}>{profile?.firstName ?? 'Student'} 👋</Text>
          </View>
          <View style={S.heroRight}>
            <View style={S.xpBadge}>
              <Ionicons name="flash" size={12} color="#f97316" />
              <Text style={S.xpText}>{xp.toLocaleString()} XP</Text>
            </View>
            <View style={S.avatarCircle}>
              <Text style={S.avatarText}>{getInitials(profile?.fullName ?? 'Student')}</Text>
            </View>
          </View>
        </View>

        {/* Motivation */}
        <Text style={S.motivation}>"{motivation}"</Text>

        {/* Stats row */}
        <View style={S.heroStats}>
          <View style={S.heroStat}>
            <Text style={S.heroStatVal}>🔥 {streak}</Text>
            <Text style={S.heroStatLbl}>day streak</Text>
          </View>
          <View style={S.heroStatDiv} />
          <View style={S.heroStat}>
            <Text style={S.heroStatVal}>{readCount}</Text>
            <Text style={S.heroStatLbl}>chapters read</Text>
          </View>
          <View style={S.heroStatDiv} />
          <View style={S.heroStat}>
            <Text style={[S.heroStatVal, { color: daysUrgency }]}>{daysLeft}d</Text>
            <Text style={S.heroStatLbl}>to JUPEB</Text>
          </View>
        </View>
      </View>

      {/* ── Offline banner ──────────────────────────────────────────────── */}
      {!isOnline && (
        <View style={S.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#ef4444" />
          <Text style={S.offlineBannerText}>You're offline — Quiz & downloaded notes still work.</Text>
        </View>
      )}

      <Animated.View style={{ opacity: fadeA, transform: [{ translateY: slideA }] }}>

        {/* ── FOCUS MODE CARD ─────────────────────────────────────────────── */}
        <Animated.View style={[S.focusCard, focusActive && S.focusCardActive, { transform: [{ scale: focusPulse }] }]}>
          <View style={S.focusLeft}>
            <View style={[S.focusIconBox, focusActive && S.focusIconBoxActive]}>
              <Ionicons name={focusActive ? 'timer' : 'moon-outline'} size={22} color={focusActive ? '#fff' : C.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[S.focusTitle, focusActive && S.focusTitleActive]}>
                {focusActive ? `Focus — ${fmtTime(focusSecs)}` : 'Study Focus Mode'}
              </Text>
              <Text style={[S.focusSub, focusActive && S.focusSubActive]}>
                {focusActive
                  ? `${Math.round((1 - focusSecs / POMODORO_SECS) * 100)}% complete · tap to stop`
                  : 'Block distractions · 25 min Pomodoro'}
              </Text>
              {focusActive && (
                <View style={S.focusProgressTrack}>
                  <View style={[S.focusProgressFill, { width: `${(1 - focusSecs / POMODORO_SECS) * 100}%` }]} />
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={focusActive ? stopFocus : startFocus}
            style={[S.focusBtn, focusActive && S.focusBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[S.focusBtnText, focusActive && S.focusBtnTextActive]}>
              {focusActive ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* DND tip shown when focus is active */}
        {focusActive && (
          <TouchableOpacity style={S.dndTip} onPress={openDndSettings} activeOpacity={0.8}>
            <Ionicons name="notifications-off-outline" size={14} color={C.primary} />
            <Text style={S.dndTipText}>Tap to open Do Not Disturb settings and silence other apps</Text>
            <Ionicons name="chevron-forward" size={13} color={C.primary} />
          </TouchableOpacity>
        )}

        {/* ── QUICK DICTIONARY SEARCH ────────────────────────────────────── */}
        <View style={S.dictSearchCard}>
          <Ionicons name="search" size={16} color={C.mutedForeground} style={S.dictSearchIcon} />
          <TextInput
            style={S.dictSearchInput}
            placeholder="Look up any word or term…"
            placeholderTextColor={C.mutedForeground}
            value={dictQuery}
            onChangeText={setDictQuery}
            onSubmitEditing={() => {
              if (dictQuery.trim()) {
                router.push({ pathname: '/dictionary', params: { q: dictQuery.trim() } } as any);
                setDictQuery('');
              }
            }}
            returnKeyType="search"
          />
          {dictQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                router.push({ pathname: '/dictionary', params: { q: dictQuery.trim() } } as any);
                setDictQuery('');
              }}
              style={S.dictGoBtn}
            >
              <Text style={S.dictGoBtnText}>Look up →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TODAY'S MISSION ─────────────────────────────────────────────── */}
        <View style={S.section}>
          <View style={S.sectionRow}>
            <Text style={S.sectionTitle}>Today's Mission</Text>
            {goalDone && <View style={S.donePill}><Text style={S.donePillText}>✓ Done</Text></View>}
          </View>
          <View style={S.missionCard}>
            <View style={S.missionTop}>
              <View>
                <Text style={S.missionBigNum}>
                  {dailyDone}<Text style={S.missionBigDen}>/{DAILY_GOAL}</Text>
                </Text>
                <Text style={S.missionLabel}>questions answered today</Text>
              </View>
              <TouchableOpacity
                style={[S.missionPlayBtn, goalDone && { backgroundColor: `${C.success}15` }]}
                onPress={() => router.push('/(tabs)/quiz')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={goalDone ? 'checkmark-circle' : 'play-circle'}
                  size={42}
                  color={goalDone ? C.success : C.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={S.missionBarTrack}>
              <Animated.View style={[S.missionBarFill, {
                backgroundColor: goalDone ? C.success : C.primary,
                width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={S.missionSubText}>
              {goalDone ? '🎉 Daily goal complete! Keep going for bonus XP.' : `${DAILY_GOAL - dailyDone} more to hit your daily goal`}
            </Text>
          </View>
        </View>

        {/* ── QUICK ACTIONS GRID ─────────────────────────────────────────── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Quick Access</Text>
          <View style={S.actionGrid}>
            {[
              { icon: 'help-circle' as const, label: 'Practice Quiz',  sub: 'Past questions',  color: '#f97316', route: '/(tabs)/quiz',   locked: false },
              { icon: 'book' as const,         label: 'Study Notes',   sub: 'CRS · GOV · LIT', color: '#10b981', route: '/(tabs)/notes',  locked: false },
              { icon: 'chatbubble-ellipses' as const, label: 'AI Tutor', sub: 'Ask anything',  color: '#8b5cf6', route: '/ai-chat',        locked: true  },
              { icon: 'library' as const,      label: 'Dictionary',    sub: 'Word meanings',   color: '#0ea5e9', route: '/dictionary',     locked: false },
            ].map(a => (
              <TouchableOpacity
                key={a.label}
                style={[S.actionCard, { borderColor: `${a.color}25` }]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  if (a.locked && !isActivated) {
                    showGate();
                  } else {
                    router.push(a.route as any);
                  }
                }}
                activeOpacity={0.78}
              >
                <View style={[S.actionIconBox, { backgroundColor: `${a.color}15` }]}>
                  <Ionicons name={a.icon} size={24} color={a.color} />
                  {a.locked && !isActivated && (
                    <View style={S.lockBadge}>
                      <Ionicons name="lock-closed" size={9} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={S.actionLabel}>{a.label}</Text>
                <Text style={S.actionSub}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── SUBJECTS ────────────────────────────────────────────────────── */}
        {subjects.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionRow}>
              <Text style={S.sectionTitle}>Your Subjects</Text>
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

        {/* ── STUDY TIP ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={S.tipCard}
          onPress={async () => { await Haptics.selectionAsync(); setTipIndex(i => (i + 1) % STUDY_TIPS.length); }}
          activeOpacity={0.85}
        >
          <View style={S.tipEmojiBubble}><Text style={{ fontSize: 22 }}>{tip.icon}</Text></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.tipLabel}>Study tip · tap for next</Text>
            <Text style={S.tipText}>{tip.text}</Text>
          </View>
          <Ionicons name="refresh-outline" size={16} color={C.mutedForeground} />
        </TouchableOpacity>

        {/* ── EXAM COUNTDOWN ───────────────────────────────────────────────── */}
        <View style={[S.countdownCard, { borderColor: `${daysUrgency}30` }]}>
          <View style={[S.countdownLeft, { backgroundColor: `${daysUrgency}12` }]}>
            <Text style={[S.countdownNum, { color: daysUrgency }]}>{daysLeft}</Text>
            <Text style={[S.countdownLbl, { color: daysUrgency }]}>days</Text>
          </View>
          <View style={S.countdownRight}>
            <Text style={S.countdownTitle}>JUPEB Final Exam</Text>
            <Text style={S.countdownDate}>May 15, 2027</Text>
            <Text style={S.countdownMotiv}>
              {daysLeft < 30
                ? '🚨 Final stretch — study every day!'
                : daysLeft < 90
                ? '⚡ Build your momentum now.'
                : '📅 You have time — use it wisely.'}
            </Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </Animated.View>
    </ScrollView>

    <ActivationGate
      visible={gateVisible}
      onClose={hideGate}
      featureName="AI Tutor"
    />
    </>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.background },
    scroll: { paddingBottom: 32 },

    // ── Hero
    hero: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20, paddingBottom: 24,
      overflow: 'hidden',
    },
    heroDecor1: {
      position: 'absolute', width: 220, height: 220, borderRadius: 110,
      backgroundColor: 'rgba(249,115,22,0.08)', top: -80, right: -60,
    },
    heroDecor2: {
      position: 'absolute', width: 120, height: 120, borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 30,
    },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.2 },
    name: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5, marginTop: 2 },
    heroRight: { alignItems: 'flex-end', gap: 8 },
    xpBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: 'rgba(249,115,22,0.2)', borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
    },
    xpText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#f97316' },
    avatarCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(249,115,22,0.25)',
      borderWidth: 2, borderColor: 'rgba(249,115,22,0.4)',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#f97316' },
    motivation: {
      fontSize: 13, fontFamily: 'Inter_400Regular', fontStyle: 'italic',
      color: 'rgba(255,255,255,0.45)', lineHeight: 19, marginBottom: 18,
    },
    heroStats: { flexDirection: 'row', alignItems: 'center' },
    heroStat:  { flex: 1, alignItems: 'center' },
    heroStatDiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },
    heroStatVal: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff', marginBottom: 2 },
    heroStatLbl: { fontSize: 10, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 },

    // ── Offline
    offlineBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#dc262612', borderRadius: 0,
      paddingHorizontal: 16, paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: '#dc262618',
    },
    offlineBannerText: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', color: '#ef4444' },

    // ── Focus Mode
    focusCard: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1.5, borderColor: `${C.primary}30`,
      marginHorizontal: 20, marginTop: 20, padding: 16,
    },
    focusCardActive: {
      backgroundColor: C.heroBg, borderColor: C.primary,
    },
    focusLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    focusIconBox: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: `${C.primary}15`, alignItems: 'center', justifyContent: 'center',
    },
    focusIconBoxActive: { backgroundColor: 'rgba(249,115,22,0.3)' },
    focusTitle:       { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 2 },
    focusTitleActive: { color: '#fff' },
    focusSub:         { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    focusSubActive:   { color: 'rgba(255,255,255,0.6)' },
    focusProgressTrack: {
      height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)',
      overflow: 'hidden', marginTop: 8, width: 140,
    },
    focusProgressFill: { height: '100%', borderRadius: 2, backgroundColor: '#f97316' },
    focusBtn: {
      backgroundColor: `${C.primary}15`, borderRadius: 10,
      borderWidth: 1.5, borderColor: `${C.primary}30`,
      paddingHorizontal: 16, paddingVertical: 8,
    },
    focusBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
    focusBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: C.primary },
    focusBtnTextActive: { color: '#fff' },

    dndTip: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: `${C.primary}08`, borderRadius: 10,
      marginHorizontal: 20, marginTop: 8,
      paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: `${C.primary}18`,
    },
    dndTipText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: C.primary, lineHeight: 17 },

    // ── Dictionary search
    dictSearchCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border,
      marginHorizontal: 20, marginTop: 16,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    dictSearchIcon: { marginRight: 10 },
    dictSearchInput: {
      flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: C.foreground,
    },
    dictGoBtn: {
      backgroundColor: C.primary, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8,
    },
    dictGoBtnText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#fff' },

    // ── Section
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.3 },
    seeAll: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.primary },
    donePill: { backgroundColor: `${C.success}18`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    donePillText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: C.success },

    // ── Mission
    missionCard: {
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border, padding: 18,
    },
    missionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    missionBigNum: { fontSize: 36, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -1 },
    missionBigDen: { fontSize: 18, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    missionLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 2 },
    missionPlayBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    missionBarTrack: { height: 8, borderRadius: 4, backgroundColor: C.border, overflow: 'hidden', marginBottom: 10 },
    missionBarFill:  { height: '100%', borderRadius: 4 },
    missionSubText:  { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground },

    // ── Action grid
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: {
      width: '47.5%', backgroundColor: C.card,
      borderRadius: C.radiusLg, borderWidth: 1,
      padding: 16,
    },
    actionIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 3 },
    actionSub:   { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    lockBadge: {
      position: 'absolute', top: -4, right: -4,
      width: 18, height: 18, borderRadius: 9,
      backgroundColor: '#64748b',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: C.background,
    },

    // ── Subjects
    subjectRow: { gap: 10 },
    subjectCard: {
      width: 110, backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14,
    },
    subjectDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
    subjectCode: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 6 },
    subjectPct:  { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginBottom: 6 },
    subjectTrack: { height: 4, borderRadius: 2, backgroundColor: C.border, overflow: 'hidden' },
    subjectFill:  { height: '100%', borderRadius: 2 },

    // ── Study tip
    tipCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border,
      marginHorizontal: 20, marginTop: 24, padding: 16,
    },
    tipEmojiBubble: {
      width: 46, height: 46, borderRadius: 12,
      backgroundColor: `${C.primary}10`,
      alignItems: 'center', justifyContent: 'center',
    },
    tipLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
    tipText:  { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 19 },

    // ── Countdown
    countdownCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, marginHorizontal: 20, marginTop: 20, overflow: 'hidden',
    },
    countdownLeft: { padding: 18, alignItems: 'center', minWidth: 80 },
    countdownNum:  { fontSize: 30, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
    countdownLbl:  { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
    countdownRight: { flex: 1, padding: 16 },
    countdownTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 2 },
    countdownDate:  { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginBottom: 8 },
    countdownMotiv: { fontSize: 12, fontFamily: 'Inter_500Medium', color: C.foreground },
  });
}

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Animated, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useActivation } from '@/hooks/useActivation';
import ActivationGate from '@/components/ActivationGate';
import { ErrorCard, LockedCard } from '@/components/ErrorCard';
import { getApiBase } from '@/lib/query-client';
import type { AppColors } from '@/constants/colors';

type Flashcard = {
  id: string;
  front: string;
  back: string;
  subject: string;
  source: 'keyterm' | 'vocab';
};

type MasteryState = 'new' | 'learning' | 'mastered';

const SUBJECT_CONFIG: Record<string, { color: string; label: string }> = {
  CRS: { color: '#d97706', label: 'CRS' },
  GOV: { color: '#0284c7', label: 'Gov' },
  LIT: { color: '#16a34a', label: 'Lit' },
  GENERAL: { color: '#7c3aed', label: 'General' },
};

const MASTERY_COLORS: Record<MasteryState, string> = {
  new: '#94a3b8',
  learning: '#f59e0b',
  mastered: '#10b981',
};

const CACHE_KEY = 'jupeb_flashcards_v2';
const MASTERY_KEY = 'jupeb_flashcard_mastery_v1';

function FlipCard({
  card, accent, mastery, onMastery,
}: {
  card: Flashcard;
  accent: string;
  mastery: MasteryState;
  onMastery: (m: MasteryState) => void;
}) {
  const C = useTheme();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const front = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const back  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const flip = () => {
    Haptics.selectionAsync();
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      tension: 60, friction: 10, useNativeDriver: true,
    }).start();
    setFlipped(v => !v);
  };

  const subConf = SUBJECT_CONFIG[card.subject] ?? SUBJECT_CONFIG.GENERAL;

  return (
    <View style={{ alignItems: 'center', marginBottom: 8 }}>
      <TouchableOpacity onPress={flip} activeOpacity={0.92} style={{ width: '100%' }}>
        {/* Front */}
        <Animated.View style={{
          backfaceVisibility: 'hidden',
          transform: [{ rotateY: front }],
          position: flipped ? 'absolute' : 'relative',
          width: '100%',
          backgroundColor: C.card,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: `${accent}30`,
          padding: 28,
          minHeight: 200,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <View style={{
            position: 'absolute', top: 14, left: 16,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <View style={{ backgroundColor: `${subConf.color}18`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, color: subConf.color, fontFamily: 'Inter_700Bold' }}>{subConf.label}</Text>
            </View>
            <View style={{ backgroundColor: `${MASTERY_COLORS[mastery]}20`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, color: MASTERY_COLORS[mastery], fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' }}>{mastery}</Text>
            </View>
          </View>
          <Text style={{ position: 'absolute', top: 14, right: 16, fontSize: 10, color: C.mutedForeground, fontFamily: 'Inter_400Regular' }}>
            tap to flip
          </Text>
          <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: C.foreground, textAlign: 'center', lineHeight: 26 }}>
            {card.front}
          </Text>
          <Text style={{ marginTop: 10, fontSize: 12, color: accent, fontFamily: 'Inter_500Medium' }}>
            Term
          </Text>
        </Animated.View>

        {/* Back */}
        <Animated.View style={{
          backfaceVisibility: 'hidden',
          transform: [{ rotateY: back }],
          position: flipped ? 'relative' : 'absolute',
          width: '100%',
          backgroundColor: `${accent}0d`,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: `${accent}40`,
          padding: 28,
          minHeight: 200,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 4,
        }}>
          <Text style={{ position: 'absolute', top: 14, right: 16, fontSize: 10, color: accent, fontFamily: 'Inter_400Regular' }}>
            tap to flip back
          </Text>
          <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: C.foreground, textAlign: 'center', lineHeight: 24 }}>
            {card.back}
          </Text>
          <Text style={{ marginTop: 12, fontSize: 12, color: accent, fontFamily: 'Inter_500Medium' }}>
            Definition
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Mastery buttons (show on back) */}
      {flipped && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' }}>
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); onMastery('learning'); setFlipped(false); Animated.timing(flipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(); }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            activeOpacity={0.8}
          >
            <Ionicons name="reload-outline" size={14} color="#d97706" />
            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#d97706' }}>Study More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onMastery('mastered'); setFlipped(false); Animated.timing(flipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(); }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#d1fae5', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
            <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#10b981' }}>Got It!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function FlashcardsScreen() {
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { isActivated, gateVisible, showGate, hideGate } = useActivation();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [mastery, setMastery] = useState<Record<string, MasteryState>>({});
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showMastered, setShowMastered] = useState(true);

  const loadMastery = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(MASTERY_KEY);
      if (raw) setMastery(JSON.parse(raw));
    } catch {}
  }, []);

  const saveMastery = useCallback(async (updated: Record<string, MasteryState>) => {
    try { await AsyncStorage.setItem(MASTERY_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  const setCardMastery = useCallback((id: string, m: MasteryState) => {
    setMastery(prev => {
      const updated = { ...prev, [id]: m };
      saveMastery(updated);
      return updated;
    });
  }, [saveMastery]);

  const fetchCards = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setFetchError(false); }
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/textbook/flashcards`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data: Flashcard[] = await res.json();
      setCards(data);
      setFetchError(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
    } catch {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setCards(JSON.parse(cached));
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMastery();
    fetchCards();
  }, [fetchCards, loadMastery]);

  const subjects = useMemo(() => {
    const s = new Set(cards.map(c => c.subject));
    return ['ALL', ...Array.from(s)];
  }, [cards]);

  const filtered = useMemo(() => {
    let list = activeFilter === 'ALL' ? cards : cards.filter(c => c.subject === activeFilter);
    if (!showMastered) list = list.filter(c => mastery[c.id] !== 'mastered');
    return list;
  }, [cards, activeFilter, showMastered, mastery]);

  const stats = useMemo(() => {
    const total = cards.length;
    const masteredCount = cards.filter(c => mastery[c.id] === 'mastered').length;
    const learningCount = cards.filter(c => mastery[c.id] === 'learning').length;
    const newCount = total - masteredCount - learningCount;
    return { total, masteredCount, learningCount, newCount };
  }, [cards, mastery]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ marginTop: 12, color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>Loading flashcards…</Text>
      </View>
    );
  }

  if (!isActivated) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSub}>Key terms & definitions</Text>
        </View>
        <LockedCard
          featureName="Flashcards"
          description="Activate your account to access all flashcards, track mastery, and study key terms for CRS, GOV and LIT."
          onUnlock={showGate}
        />
        <ActivationGate visible={gateVisible} onClose={hideGate} featureName="Flashcards" />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSub}>Key terms & definitions</Text>
        </View>
        <ErrorCard
          title="Couldn't load flashcards"
          message="No internet connection and no cached cards found. Connect once to download your flashcards."
          icon="cloud-offline-outline"
          onRetry={() => fetchCards()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={styles.headerTitle}>Flashcards</Text>
            <Text style={styles.headerSub}>{stats.total} cards · {stats.masteredCount} mastered</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMastered(v => !v)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 12, paddingVertical: 7,
              backgroundColor: showMastered ? 'rgba(255,255,255,0.15)' : 'rgba(16,185,129,0.25)',
              borderRadius: 10,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name={showMastered ? 'eye-outline' : 'eye-off-outline'} size={14} color="#fff" />
            <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'Inter_600SemiBold' }}>
              {showMastered ? 'All' : 'Unmastered'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 14 }}>
          {stats.masteredCount > 0 && (
            <View style={{ flex: stats.masteredCount, height: 6, backgroundColor: '#10b981', borderRadius: 3 }} />
          )}
          {stats.learningCount > 0 && (
            <View style={{ flex: stats.learningCount, height: 6, backgroundColor: '#f59e0b', borderRadius: 3 }} />
          )}
          {stats.newCount > 0 && (
            <View style={{ flex: stats.newCount, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }} />
          )}
        </View>

        {/* Subject filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {subjects.map(sub => {
            const conf = SUBJECT_CONFIG[sub];
            const active = activeFilter === sub;
            return (
              <TouchableOpacity
                key={sub}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(sub); }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: active ? (conf?.color ?? '#f97316') : 'rgba(255,255,255,0.1)',
                  borderWidth: 1, borderColor: active ? 'transparent' : 'rgba(255,255,255,0.15)',
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                  {sub === 'ALL' ? 'All Subjects' : (SUBJECT_CONFIG[sub]?.label ?? sub)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'New', value: stats.newCount, color: '#94a3b8' },
          { label: 'Learning', value: stats.learningCount, color: '#f59e0b' },
          { label: 'Mastered', value: stats.masteredCount, color: '#10b981' },
        ].map(s => (
          <View key={s.label} style={styles.statPill}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color, marginBottom: 2 }} />
            <Text style={{ fontSize: 18, fontFamily: 'Inter_700Bold', color: C.foreground }}>{s.value}</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Cards */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 4 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchCards(true)} tintColor={C.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, marginTop: 12 }}>
              {showMastered ? 'No cards yet' : 'All cards mastered!'}
            </Text>
            <Text style={{ fontSize: 13, color: C.mutedForeground, fontFamily: 'Inter_400Regular', marginTop: 6, textAlign: 'center' }}>
              {showMastered ? 'Pull to refresh to load flashcards.' : 'Toggle "All" to review mastered cards.'}
            </Text>
          </View>
        ) : (
          filtered.map(card => (
            <FlipCard
              key={card.id}
              card={card}
              accent={SUBJECT_CONFIG[card.subject]?.color ?? C.primary}
              mastery={mastery[card.id] ?? 'new'}
              onMastery={m => setCardMastery(card.id, m)}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      backgroundColor: C.heroBg,
      paddingHorizontal: 20, paddingBottom: 20,
    },
    headerTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
    headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    statsRow: {
      flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
      gap: 12, backgroundColor: C.card,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    statPill: {
      flex: 1, alignItems: 'center', paddingVertical: 8,
      backgroundColor: C.background, borderRadius: 12,
      borderWidth: 1, borderColor: C.border,
    },
    emptyState: {
      alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24,
    },
  });
}

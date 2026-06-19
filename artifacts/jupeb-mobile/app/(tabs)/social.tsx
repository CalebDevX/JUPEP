import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getApiBase } from '@/lib/query-client';
import type { AppColors } from '@/constants/colors';

// ── Types ──────────────────────────────────────────────────────────────────────
type LeaderboardEntry = {
  rank: number;
  full_name: string;
  xp: number;
  streak: number;
  target_university?: string;
};

type Community = {
  id: string;
  name: string;
  description: string;
  subject: string;
  memberCount: number;
  whatsappLink?: string;
};

// ── Medal colours ──────────────────────────────────────────────────────────────
function medalColor(rank: number) {
  if (rank === 1) return '#f59e0b';
  if (rank === 2) return '#9ca3af';
  if (rank === 3) return '#d97706';
  return null;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ── Leaderboard panel ─────────────────────────────────────────────────────────
function LeaderboardPanel({ C, S }: { C: AppColors; S: ReturnType<typeof makeStyles> }) {
  const { isOnline } = useNetworkStatus();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/leaderboard`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: LeaderboardEntry[] = await res.json();
      setEntries(data);
    } catch (e: any) {
      setError(isOnline ? e.message : "You're offline. Connect to view the leaderboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={S.centered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        <Ionicons name="trophy-outline" size={44} color={C.mutedForeground} />
        <Text style={S.emptyTitle}>Leaderboard unavailable</Text>
        <Text style={S.emptyText}>{error}</Text>
        <TouchableOpacity onPress={() => load()} style={[S.actionBtn, { backgroundColor: C.primary }]}>
          <Text style={[S.actionBtnText, { color: '#fff' }]}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (entries.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={S.centered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        <Ionicons name="trophy-outline" size={44} color={C.mutedForeground} />
        <Text style={S.emptyTitle}>No scores yet</Text>
        <Text style={S.emptyText}>Complete some practice quizzes to appear on the leaderboard!</Text>
      </ScrollView>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {/* Podium */}
      <View style={S.podium}>
        {/* 2nd place */}
        {top3[1] && (
          <View style={[S.podiumSlot, { marginTop: 24 }]}>
            <View style={[S.podiumAvatar, { borderColor: '#9ca3af' }]}>
              <Text style={S.podiumAvatarText}>{getInitials(top3[1].full_name)}</Text>
            </View>
            <Text style={S.podiumName} numberOfLines={1}>{top3[1].full_name.split(' ')[0]}</Text>
            <Text style={S.podiumXp}>{top3[1].xp} XP</Text>
            <View style={[S.podiumBase, { backgroundColor: '#9ca3af', height: 56 }]}>
              <Text style={S.podiumRank}>2</Text>
            </View>
          </View>
        )}
        {/* 1st place */}
        {top3[0] && (
          <View style={[S.podiumSlot, { marginTop: 0 }]}>
            <Ionicons name="trophy" size={24} color="#f59e0b" style={{ marginBottom: 4 }} />
            <View style={[S.podiumAvatar, { borderColor: '#f59e0b', width: 64, height: 64, borderRadius: 32 }]}>
              <Text style={[S.podiumAvatarText, { fontSize: 22 }]}>{getInitials(top3[0].full_name)}</Text>
            </View>
            <Text style={S.podiumName} numberOfLines={1}>{top3[0].full_name.split(' ')[0]}</Text>
            <Text style={[S.podiumXp, { fontFamily: 'Inter_700Bold' }]}>{top3[0].xp} XP</Text>
            <View style={[S.podiumBase, { backgroundColor: '#f59e0b', height: 76 }]}>
              <Text style={S.podiumRank}>1</Text>
            </View>
          </View>
        )}
        {/* 3rd place */}
        {top3[2] && (
          <View style={[S.podiumSlot, { marginTop: 40 }]}>
            <View style={[S.podiumAvatar, { borderColor: '#d97706' }]}>
              <Text style={S.podiumAvatarText}>{getInitials(top3[2].full_name)}</Text>
            </View>
            <Text style={S.podiumName} numberOfLines={1}>{top3[2].full_name.split(' ')[0]}</Text>
            <Text style={S.podiumXp}>{top3[2].xp} XP</Text>
            <View style={[S.podiumBase, { backgroundColor: '#d97706', height: 44 }]}>
              <Text style={S.podiumRank}>3</Text>
            </View>
          </View>
        )}
      </View>

      {/* Rest of leaderboard */}
      {rest.map((entry) => {
        const medal = medalColor(entry.rank);
        return (
          <View key={`${entry.rank}-${entry.full_name}`} style={S.leaderRow}>
            <Text style={[S.leaderRank, medal ? { color: medal } : {}]}>#{entry.rank}</Text>
            <View style={S.leaderAvatar}>
              <Text style={S.leaderAvatarText}>{getInitials(entry.full_name)}</Text>
            </View>
            <View style={S.leaderInfo}>
              <Text style={S.leaderName} numberOfLines={1}>{entry.full_name}</Text>
              {entry.streak > 0 && (
                <View style={S.leaderStats}>
                  <View style={S.statChip}>
                    <Text style={S.statChipText}>🔥 {entry.streak}d streak</Text>
                  </View>
                </View>
              )}
            </View>
            <Text style={[S.leaderXp, { color: C.primary }]}>{entry.xp} XP</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Community panel ───────────────────────────────────────────────────────────
function CommunityPanel({ C, S }: { C: AppColors; S: ReturnType<typeof makeStyles> }) {
  const { isOnline } = useNetworkStatus();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [joining, setJoining] = useState<string | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/communities`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: Community[] = await res.json();
      setCommunities(data);
    } catch (e: any) {
      setError(isOnline ? e.message : "You're offline. Connect to view communities.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  async function handleJoin(communityId: string) {
    if (!joinName.trim() || !joinPhone.trim()) {
      setJoinError('Please fill in both fields.');
      return;
    }
    setJoinError('');
    try {
      const res = await fetch(`${getApiBase()}/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: joinName.trim(), whatsapp: joinPhone.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || `Error ${res.status}`);
      }
      const data = await res.json() as any;
      setJoinSuccess(data.whatsappLink ? 'Joined! Opening WhatsApp…' : 'Joined successfully!');
      setJoining(null);
      setJoinName(''); setJoinPhone('');
      if (data.whatsappLink) {
        const { Linking } = await import('react-native');
        Linking.openURL(data.whatsappLink).catch(() => {});
      }
      load(true);
      setTimeout(() => setJoinSuccess(''), 4000);
    } catch (e: any) {
      setJoinError(e.message || 'Something went wrong.');
    }
  }

  if (loading) {
    return (
      <View style={S.centered}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={S.centered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        <Ionicons name="people-outline" size={44} color={C.mutedForeground} />
        <Text style={S.emptyTitle}>Communities unavailable</Text>
        <Text style={S.emptyText}>{error}</Text>
        <TouchableOpacity onPress={() => load()} style={[S.actionBtn, { backgroundColor: C.primary }]}>
          <Text style={[S.actionBtnText, { color: '#fff' }]}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {joinSuccess ? (
        <View style={[S.toast, { backgroundColor: C.successDim, borderColor: `${C.success}40` }]}>
          <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
          <Text style={[S.toastText, { color: C.success }]}>{joinSuccess}</Text>
        </View>
      ) : null}

      {/* Search */}
      <View style={[S.searchBox, { backgroundColor: C.card, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={16} color={C.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search communities…"
          placeholderTextColor={C.mutedForeground}
          style={[S.searchInput, { color: C.foreground }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={C.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.map(community => {
        const isJoining = joining === community.id;
        return (
          <View key={community.id} style={[S.communityCard, { backgroundColor: C.card, borderColor: C.border }]}>
            {/* Header */}
            <View style={S.commHeader}>
              <View style={[S.commIcon, { backgroundColor: C.primaryDim }]}>
                <Ionicons name="people" size={20} color={C.primary} />
              </View>
              <View style={S.commInfo}>
                <Text style={[S.commName, { color: C.foreground }]}>{community.name}</Text>
                <Text style={[S.commSubject, { color: C.mutedForeground }]}>{community.subject}</Text>
              </View>
              <View style={[S.memberBadge, { backgroundColor: C.muted }]}>
                <Text style={[S.memberCount, { color: C.mutedForeground }]}>{community.memberCount}</Text>
                <Text style={[S.memberLabel, { color: C.mutedForeground }]}>members</Text>
              </View>
            </View>

            <Text style={[S.commDesc, { color: C.mutedForeground }]}>{community.description}</Text>

            {/* Join form */}
            {isJoining ? (
              <View style={[S.joinForm, { backgroundColor: C.muted, borderColor: C.border }]}>
                <Text style={[S.joinFormTitle, { color: C.foreground }]}>Join {community.name}</Text>
                <TextInput
                  value={joinName}
                  onChangeText={setJoinName}
                  placeholder="Your full name"
                  placeholderTextColor={C.mutedForeground}
                  style={[S.joinInput, { backgroundColor: C.card, borderColor: C.border, color: C.foreground }]}
                />
                <TextInput
                  value={joinPhone}
                  onChangeText={setJoinPhone}
                  placeholder="WhatsApp number (e.g. 08012345678)"
                  placeholderTextColor={C.mutedForeground}
                  keyboardType="phone-pad"
                  style={[S.joinInput, { backgroundColor: C.card, borderColor: C.border, color: C.foreground }]}
                />
                {joinError ? (
                  <Text style={[S.joinError, { color: C.destructive }]}>{joinError}</Text>
                ) : null}
                <View style={S.joinActions}>
                  <TouchableOpacity
                    onPress={() => { setJoining(null); setJoinName(''); setJoinPhone(''); setJoinError(''); }}
                    style={[S.actionBtn, { backgroundColor: C.muted, borderWidth: 1, borderColor: C.border }]}
                  >
                    <Text style={[S.actionBtnText, { color: C.mutedForeground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleJoin(community.id)}
                    style={[S.actionBtn, { backgroundColor: C.primary, flex: 1 }]}
                  >
                    <Ionicons name="logo-whatsapp" size={14} color="#fff" />
                    <Text style={[S.actionBtnText, { color: '#fff' }]}>Join via WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setJoining(community.id); setJoinName(''); setJoinPhone(''); setJoinError(''); }}
                style={[S.joinBtn, { backgroundColor: C.primaryDim, borderColor: `${C.primary}30` }]}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={15} color={C.primary} />
                <Text style={[S.joinBtnText, { color: C.primary }]}>Join Community</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {filtered.length === 0 && (
        <View style={S.centered}>
          <Text style={[S.emptyTitle, { color: C.mutedForeground }]}>No communities found</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
type Tab = 'leaderboard' | 'community';

export default function SocialScreen() {
  const C = useTheme();
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const S = useMemo(() => makeStyles(C), [C]);
  const [tab, setTab] = useState<Tab>('leaderboard');

  return (
    <View style={[S.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[S.header, { paddingTop: topPad + 16, backgroundColor: C.heroBg }]}>
        <Text style={[S.headerTitle, { color: C.heroText }]}>Social</Text>
        <Text style={[S.headerSub, { color: `${C.heroText}99` }]}>Compete and connect with other students</Text>

        {/* Segmented control */}
        <View style={[S.segmented, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <TouchableOpacity
            style={[S.segBtn, tab === 'leaderboard' && S.segBtnActive]}
            onPress={() => setTab('leaderboard')}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy-outline" size={14} color={tab === 'leaderboard' ? C.primary : 'rgba(255,255,255,0.65)'} />
            <Text style={[S.segLabel, tab === 'leaderboard' ? { color: C.primary } : { color: 'rgba(255,255,255,0.65)' }]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.segBtn, tab === 'community' && S.segBtnActive]}
            onPress={() => setTab('community')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={14} color={tab === 'community' ? C.primary : 'rgba(255,255,255,0.65)'} />
            <Text style={[S.segLabel, tab === 'community' ? { color: C.primary } : { color: 'rgba(255,255,255,0.65)' }]}>
              Communities
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {tab === 'leaderboard'
        ? <LeaderboardPanel C={C} S={S} />
        : <CommunityPanel C={C} S={S} />
      }
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
    headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 14 },

    segmented: {
      flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3,
    },
    segBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 8, borderRadius: 10,
    },
    segBtnActive: { backgroundColor: C.card },
    segLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, minHeight: 300 },
    emptyTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: C.foreground, textAlign: 'center' },
    emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', lineHeight: 20 },

    // Podium
    podium: {
      flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
      gap: 8, marginBottom: 20, paddingTop: 8,
    },
    podiumSlot: { alignItems: 'center', flex: 1 },
    podiumAvatar: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: C.primaryDim, borderWidth: 2, borderColor: C.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 6,
    },
    podiumAvatarText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: C.primary },
    podiumName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: C.foreground, marginBottom: 2, textAlign: 'center' },
    podiumXp: { fontSize: 11, fontFamily: 'Inter_500Medium', color: C.mutedForeground, marginBottom: 6 },
    podiumBase: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
    podiumRank: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },

    // Leaderboard rows
    leaderRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border,
      padding: 12, marginBottom: 8,
    },
    leaderRank: { fontSize: 13, fontFamily: 'Inter_700Bold', color: C.mutedForeground, width: 32, textAlign: 'center' },
    leaderAvatar: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.primaryDim, alignItems: 'center', justifyContent: 'center',
    },
    leaderAvatarText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.primary },
    leaderInfo: { flex: 1 },
    leaderName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground, marginBottom: 4 },
    leaderStats: { flexDirection: 'row', gap: 6 },
    statChip: {
      backgroundColor: C.muted, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    },
    statChipText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    leaderXp: { fontSize: 14, fontFamily: 'Inter_700Bold' },

    // Community
    searchBox: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderWidth: 1, borderRadius: C.radius,
      paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
    },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },

    communityCard: {
      borderRadius: C.radiusLg, borderWidth: 1, padding: 14, marginBottom: 12,
    },
    commHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    commIcon: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    commInfo: { flex: 1 },
    commName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
    commSubject: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
    memberBadge: { alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    memberCount: { fontSize: 16, fontFamily: 'Inter_700Bold' },
    memberLabel: { fontSize: 9, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
    commDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 12 },

    joinBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderWidth: 1, borderRadius: C.radius, paddingVertical: 10,
    },
    joinBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold' },

    joinForm: { borderRadius: C.radius, borderWidth: 1, padding: 14, gap: 8 },
    joinFormTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 4 },
    joinInput: {
      borderWidth: 1, borderRadius: C.radiusSm,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 14, fontFamily: 'Inter_400Regular',
    },
    joinError: { fontSize: 12, fontFamily: 'Inter_500Medium' },
    joinActions: { flexDirection: 'row', gap: 8, marginTop: 4 },

    actionBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: C.radiusSm, paddingHorizontal: 16, paddingVertical: 10,
    },
    actionBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold' },

    toast: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderWidth: 1, borderRadius: C.radius, padding: 12, marginBottom: 12,
    },
    toastText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  });
}

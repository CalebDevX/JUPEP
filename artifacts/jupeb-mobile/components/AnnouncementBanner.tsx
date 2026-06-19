import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBase } from '@/lib/query-client';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/colors';

type Announcement = {
  id: number;
  title: string;
  content: string;
  type: string;
  emoji: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'jupeb_seen_announcements';

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  urgent:  { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C' },
};

export default function AnnouncementBanner() {
  const [current, setCurrent] = useState<Announcement | null>(null);
  const slideY = useRef(new Animated.Value(-120)).current;
  const insets = useSafeAreaInsets();
  const C = useTheme();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/announcements`);
      if (!res.ok) return;
      const data: Announcement[] = await res.json();
      if (!data.length) return;

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const seen: number[] = raw ? JSON.parse(raw) : [];

      const unseen = data.find(a => !seen.includes(a.id));
      if (unseen) {
        setCurrent(unseen);
        Animated.spring(slideY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }).start();
      }
    } catch {
      // silently ignore network errors
    }
  }

  async function dismiss() {
    if (!current) return;
    Animated.timing(slideY, {
      toValue: -160,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setCurrent(null));

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const seen: number[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, current.id]));
    } catch { /* ignore */ }
  }

  if (!current) return null;

  const colors = TYPE_COLORS[current.type] ?? TYPE_COLORS.info;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY: slideY }], paddingTop: insets.top + 4 },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.banner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {current.title}
          </Text>
          <Text style={styles.content} numberOfLines={3}>
            {current.content}
          </Text>
          <Text style={styles.author}>— {current.authorName}</Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    lineHeight: 18,
  },
  content: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
    lineHeight: 17,
  },
  author: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },
});

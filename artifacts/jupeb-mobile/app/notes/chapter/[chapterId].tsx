import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Modal, Pressable,
  NativeSyntheticEvent, NativeScrollEvent, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useThemeContext, FONT_SIZES } from '@/context/ThemeContext';
import { getApiBase } from '@/lib/query-client';
import { lookupWord, type VocabEntry } from '@/lib/vocabulary';
import type { AppColors } from '@/constants/colors';

type Section     = { heading: string; content: string };
type KeyTerm     = { term: string; definition: string };
type ChapterDetail = {
  id: string;
  number: number;
  title: string;
  sections: Section[];
  summary: string;
  keyTerms: KeyTerm[];
  practiceQuestions: string[];
};

const ACCENT_MAP: Record<string, string> = {
  crs: '#d97706', gov: '#0284c7', lit: '#16a34a',
};
function getAccentFromChapterId(id: string): string {
  return ACCENT_MAP[id.slice(0, 3).toLowerCase()] ?? '#1e40af';
}

// ── Vocab-aware text renderer ──────────────────────────────────────────────────
function VocabText({
  text, baseStyle, highlightColor, onWordPress,
}: {
  text: string;
  baseStyle: any;
  highlightColor: string;
  onWordPress: (entry: VocabEntry) => void;
}) {
  const mdParts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);
  const children: React.ReactNode[] = [];
  mdParts.forEach((part, pi) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push(
        <Text key={`md-b-${pi}`} style={{ fontFamily: 'Inter_700Bold' }}>{part.slice(2, -2)}</Text>
      );
      return;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      children.push(
        <Text key={`md-i-${pi}`} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>
      );
      return;
    }
    const tokens = part.split(/(\s+)/);
    tokens.forEach((token, ti) => {
      const entry = lookupWord(token);
      if (entry) {
        children.push(
          <Text
            key={`v-${pi}-${ti}`}
            style={{ color: highlightColor, fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline', textDecorationStyle: 'dotted' } as any}
            onPress={() => onWordPress(entry)}
          >
            {token}
          </Text>
        );
      } else {
        children.push(<Text key={`p-${pi}-${ti}`}>{token}</Text>);
      }
    });
  });
  return <Text style={baseStyle}>{children}</Text>;
}

// ── Content renderer ───────────────────────────────────────────────────────────
function renderContent(
  text: string,
  styles: ReturnType<typeof makeStyles>,
  C: AppColors,
  accent: string,
  onWordPress: (entry: VocabEntry) => void
) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => {
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean);

    // Subheading: ### or ## prefix
    if (/^#{1,3}\s/.test(lines[0])) {
      return (
        <Text
          key={i}
          style={[styles.contentText, {
            fontFamily: 'Inter_700Bold',
            color: accent,
            marginBottom: 8,
            marginTop: 4,
            borderBottomWidth: 1,
            borderBottomColor: `${accent}25`,
            paddingBottom: 4,
          }]}
        >
          {lines[0].replace(/^#+\s/, '')}
        </Text>
      );
    }

    // Quote / callout block: > prefix
    if (lines[0].startsWith('> ') || lines[0].startsWith('>')) {
      return (
        <View
          key={i}
          style={{
            borderLeftWidth: 3, borderLeftColor: accent,
            borderRadius: 6, backgroundColor: `${accent}0d`,
            paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14,
          }}
        >
          {lines.map((line, j) => (
            <VocabText
              key={j}
              text={line.replace(/^>\s?/, '')}
              baseStyle={[styles.contentText, { fontStyle: 'italic', color: C.foreground, marginBottom: 2 }]}
              highlightColor={accent}
              onWordPress={onWordPress}
            />
          ))}
        </View>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(lines[0])) {
      return (
        <View key={i} style={{ marginBottom: 12 }}>
          {lines.map((line, j) => {
            const m = line.match(/^(\d+)\.\s(.+)/);
            if (m) {
              return (
                <View key={j} style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={[styles.contentText, { color: accent, width: 22, flexShrink: 0 }]}>{m[1]}.</Text>
                  <VocabText text={m[2]} baseStyle={[styles.contentText, { flex: 1 }]} highlightColor={accent} onWordPress={onWordPress} />
                </View>
              );
            }
            return <VocabText key={j} text={line} baseStyle={[styles.contentText, { marginBottom: 4 }]} highlightColor={accent} onWordPress={onWordPress} />;
          })}
        </View>
      );
    }

    // Bullet list
    if (/^[-•]\s/.test(lines[0])) {
      return (
        <View key={i} style={{ marginBottom: 12 }}>
          {lines.map((line, j) => {
            const m = line.match(/^[-•]\s(.+)/);
            if (m) {
              return (
                <View key={j} style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={[styles.contentText, { color: accent, width: 16, flexShrink: 0 }]}>•</Text>
                  <VocabText text={m[1]} baseStyle={[styles.contentText, { flex: 1 }]} highlightColor={accent} onWordPress={onWordPress} />
                </View>
              );
            }
            return <VocabText key={j} text={line} baseStyle={[styles.contentText, { marginBottom: 4 }]} highlightColor={accent} onWordPress={onWordPress} />;
          })}
        </View>
      );
    }

    return (
      <VocabText key={i} text={p} baseStyle={[styles.contentText, { marginBottom: 14 }]} highlightColor={accent} onWordPress={onWordPress} />
    );
  });
}

// ── Vocab Definition Modal ─────────────────────────────────────────────────────
function VocabModal({
  entry, accent, onClose, onFullDictionary,
}: {
  entry: VocabEntry | null;
  accent: string;
  onClose: () => void;
  onFullDictionary: (term: string) => void;
}) {
  const C = useTheme();
  const S = useMemo(() => makeStyles(C, 15), [C]);
  if (!entry) return null;

  const subjectLabel: Record<string, string> = {
    GOV: 'Government', CRS: 'CRS', LIT: 'Literature', GENERAL: 'Academic',
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={S.modalOverlay} onPress={onClose}>
        <Pressable style={S.modalSheet} onPress={e => e.stopPropagation()}>
          <View style={S.modalHandle} />
          <View style={S.modalHeader}>
            <View style={{ flex: 1 }}>
              <View style={S.modalWordRow}>
                <Text style={[S.modalWord, { color: accent }]}>{entry.term}</Text>
                {entry.subject && (
                  <View style={[S.subjectTag, { backgroundColor: `${accent}18` }]}>
                    <Text style={[S.subjectTagText, { color: accent }]}>
                      {subjectLabel[entry.subject] ?? entry.subject}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={S.modalPos}>{entry.pos}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={S.modalCloseBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={C.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={S.offlineBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
            <Text style={S.offlineBadgeText}>Saved on device · works offline</Text>
          </View>
          <Text style={S.modalDefinition}>{entry.definition}</Text>
          {entry.example && (
            <View style={[S.modalExample, { borderLeftColor: accent }]}>
              <Text style={S.modalExampleLabel}>Example</Text>
              <Text style={S.modalExampleText}>"{entry.example}"</Text>
            </View>
          )}
          <TouchableOpacity
            style={[S.modalDictBtn, { borderColor: `${accent}35`, backgroundColor: `${accent}08` }]}
            onPress={() => { onClose(); onFullDictionary(entry.term); }}
            activeOpacity={0.8}
          >
            <Ionicons name="library-outline" size={15} color={accent} />
            <Text style={[S.modalDictBtnText, { color: accent }]}>Open full definition in Dictionary</Text>
            <Ionicons name="chevron-forward" size={13} color={accent} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Font size picker sheet ─────────────────────────────────────────────────────
function FontSizePicker({
  visible, onClose, C,
}: { visible: boolean; onClose: () => void; C: AppColors }) {
  const { fontSize, setFontSize } = useThemeContext();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 16 }}>Text Size</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {FONT_SIZES.map(opt => {
                const active = fontSize === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => { Haptics.selectionAsync(); setFontSize(opt.value); }}
                    style={{
                      flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: active ? C.primary : C.border,
                      backgroundColor: active ? `${C.primary}12` : C.muted,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: opt.value, fontFamily: 'Inter_700Bold', color: active ? C.primary : C.foreground }}>A</Text>
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: active ? C.primary : C.mutedForeground, marginTop: 6 }}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', marginTop: 14 }}>
              Saved automatically · applies to all chapters
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Table of Contents sheet ────────────────────────────────────────────────────
function TocSheet({
  visible, sections, accent, onClose, onSelect,
}: {
  visible: boolean;
  sections: Section[];
  accent: string;
  onClose: () => void;
  onSelect: (i: number) => void;
}) {
  const C = useTheme();
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={{
            backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 20, paddingBottom: 44,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ color: C.foreground, fontSize: 17, fontFamily: 'Inter_700Bold', marginBottom: 4 }}>
              Contents
            </Text>
            <Text style={{ color: C.mutedForeground, fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 16 }}>
              {sections.length} sections · tap to jump
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {sections.map((sec, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingVertical: 13,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: C.border,
                  }}
                  onPress={() => { Haptics.selectionAsync(); onSelect(i); onClose(); }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: `${accent}18`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: accent, fontSize: 11, fontFamily: 'Inter_700Bold' }}>
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, color: C.foreground, fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 }}>
                    {sec.heading}
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={14} color={C.mutedForeground} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ChapterScreen() {
  const { chapterId, courseId } = useLocalSearchParams<{ chapterId: string; courseId: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const { fontSize } = useThemeContext();
  const styles = useMemo(() => makeStyles(C, fontSize), [C, fontSize]);

  const [chapter, setChapter]               = useState<ChapterDetail | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms]   = useState<Set<number>>(new Set());
  const [showQuestions, setShowQuestions]   = useState(false);
  const [fromCache, setFromCache]           = useState(false);
  const [vocabEntry, setVocabEntry]         = useState<VocabEntry | null>(null);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showTOC, setShowTOC]               = useState(false);
  const [ttsLoading, setTtsLoading]         = useState(false);
  const [ttsSound, setTtsSound]             = useState<any>(null);
  const [ttsPlaying, setTtsPlaying]         = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [scrolledDown, setScrolledDown]     = useState(false);
  const [completed, setCompleted]           = useState(false);

  const scrollRef        = useRef<ScrollView>(null);
  const contentHeight    = useRef(0);
  const viewHeight       = useRef(0);
  const hasCompletedRef  = useRef(false);
  const sectionYRef      = useRef<number[]>([]);
  const fabAnim          = useRef(new Animated.Value(0)).current;

  const accent = getAccentFromChapterId(chapterId ?? '');

  // ── YarnGPT / TTS listen ───────────────────────────────────────────────────
  const handleListen = useCallback(async () => {
    if (!chapter) return;
    Haptics.selectionAsync();

    if (ttsPlaying && ttsSound) {
      await ttsSound.stopAsync();
      setTtsPlaying(false);
      return;
    }

    setTtsLoading(true);
    try {
      const text = chapter.sections.map(s => `${s.heading}. ${s.content}`).join(' ').slice(0, 900);
      const base = getApiBase();
      const res = await fetch(`${base}/ai/yarngpt-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS unavailable');
      const { audio, mimeType } = await res.json();
      const { Sound } = await import('expo-av').then(m => ({ Sound: m.Audio.Sound }));
      const { sound } = await Sound.createAsync(
        { uri: `data:${mimeType};base64,${audio}` },
        { shouldPlay: true }
      );
      setTtsSound(sound);
      setTtsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) { setTtsPlaying(false); setTtsSound(null); }
      });
    } catch (e) {
      console.warn('TTS error', e);
    } finally {
      setTtsLoading(false);
    }
  }, [chapter, ttsPlaying, ttsSound]);

  // ── Reading time estimate ──────────────────────────────────────────────────
  const readingTime = useMemo(() => {
    if (!chapter) return 0;
    const words = chapter.sections.reduce(
      (n, s) => n + (s.heading + ' ' + s.content).split(/\s+/).length, 0
    ) + (chapter.summary || '').split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }, [chapter]);

  // ── FAB animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: scrolledDown ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [scrolledDown]);

  useEffect(() => {
    async function load() {
      const CACHE_KEY = `jupeb_chapter_cache_${chapterId}`;
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/textbook/courses/${courseId}/chapters/${chapterId}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setChapter(data);
        setFromCache(false);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
        if (chapterId) {
          await AsyncStorage.setItem(`jupeb_chapter_read_${chapterId}`, Date.now().toString());
          AsyncStorage.setItem('jupeb_last_chapter', JSON.stringify({
            chapterId, courseId, title: data.title, number: data.number, timestamp: Date.now(),
          })).catch(() => {});
        }
      } catch {
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            setChapter(JSON.parse(cached));
            setFromCache(true);
            if (chapterId) {
              await AsyncStorage.setItem(`jupeb_chapter_read_${chapterId}`, Date.now().toString());
            }
          } else {
            setError('No internet and no cached version. Connect to load this chapter.');
          }
        } catch (e: any) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, chapterId]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY    = e.nativeEvent.contentOffset.y;
    const scrollable = contentHeight.current - viewHeight.current;
    setScrolledDown(offsetY > 280);
    if (scrollable > 0) {
      const pct = Math.min(100, Math.round((offsetY / scrollable) * 100));
      setReadingProgress(pct);
      if (pct >= 90 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const y = sectionYRef.current[index];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }
  }, []);

  const handleWordPress = useCallback(async (entry: VocabEntry) => {
    await Haptics.selectionAsync();
    setVocabEntry(entry);
  }, []);

  const handleFullDictionary = useCallback((term: string) => {
    router.push({ pathname: '/dictionary', params: { q: term } } as any);
  }, []);

  function toggleTerm(i: number) {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading chapter…</Text>
      </View>
    );
  }

  if (error || !chapter) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color={C.mutedForeground} />
        <Text style={styles.errorText}>{error ?? 'Chapter not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Modals */}
      <VocabModal
        entry={vocabEntry}
        accent={accent}
        onClose={() => setVocabEntry(null)}
        onFullDictionary={handleFullDictionary}
      />
      <FontSizePicker visible={showFontPicker} onClose={() => setShowFontPicker(false)} C={C} />
      <TocSheet
        visible={showTOC}
        sections={chapter.sections}
        accent={accent}
        onClose={() => setShowTOC(false)}
        onSelect={scrollToSection}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerDecor} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {/* Listen (TTS) button */}
            <TouchableOpacity
              style={[styles.headerIconBtn, ttsPlaying && { backgroundColor: 'rgba(249,115,22,0.35)' }]}
              onPress={handleListen}
              disabled={ttsLoading}
              activeOpacity={0.75}
            >
              {ttsLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name={ttsPlaying ? 'stop-outline' : 'headset-outline'} size={17} color="#fff" />
              }
            </TouchableOpacity>
            {/* TOC button */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => { Haptics.selectionAsync(); setShowTOC(true); }}
              activeOpacity={0.75}
            >
              <Ionicons name="list-outline" size={17} color="#fff" />
            </TouchableOpacity>
            {/* Font size button */}
            <TouchableOpacity
              style={styles.fontBtn}
              onPress={() => { Haptics.selectionAsync(); setShowFontPicker(true); }}
              activeOpacity={0.75}
            >
              <Text style={styles.fontBtnText}>A</Text>
              <Ionicons name="chevron-down" size={10} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chapterNumBadge}>
          <Text style={[styles.chapterNumText, { color: accent }]}>Chapter {chapter.number}</Text>
        </View>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>

        <View style={styles.chapterMeta}>
          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.45)" />
          <Text style={styles.chapterMetaText}>~{readingTime} min read</Text>
          <Text style={styles.chapterMetaDot}>·</Text>
          <Text style={styles.chapterMetaText}>{chapter.sections.length} sections</Text>
          <Text style={styles.chapterMetaDot}>·</Text>
          <Text style={styles.chapterMetaText}>{chapter.keyTerms.length} key terms</Text>
          <Text style={styles.chapterMetaDot}>·</Text>
          <Text style={[styles.vocabHintText, { color: accent }]}>tap coloured words</Text>
        </View>

        {fromCache && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={12} color="#f97316" />
            <Text style={styles.offlineBannerText}>Offline — showing saved version</Text>
          </View>
        )}
      </View>

      {/* ── Reading progress bar ─────────────────────────────────────────────── */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${readingProgress}%`, backgroundColor: accent }]} />
        {readingProgress > 0 && (
          <Text style={[styles.progressLabel, { color: accent }]}>{readingProgress}%</Text>
        )}
      </View>

      {/* ── Scroll content ───────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: (bottom || 0) + 80 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={(_, h) => { contentHeight.current = h; }}
        onLayout={e => { viewHeight.current = e.nativeEvent.layout.height; }}
      >
        {/* ── SECTIONS ──────────────────────────────────────────────────────── */}
        {chapter.sections.map((sec, i) => (
          <View
            key={i}
            style={styles.section}
            onLayout={e => { sectionYRef.current[i] = e.nativeEvent.layout.y; }}
          >
            <View style={[styles.sectionAccentBar, { backgroundColor: accent }]} />
            <View style={styles.sectionContent}>
              {/* Section number badge + heading */}
              <View style={styles.sectionHeadingRow}>
                <View style={[styles.sectionNumBadge, { backgroundColor: `${accent}18` }]}>
                  <Text style={[styles.sectionNumText, { color: accent }]}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={[styles.sectionHeading, { flex: 1 }]}>{sec.heading}</Text>
              </View>
              {renderContent(sec.content, styles, C, accent, handleWordPress)}
            </View>
          </View>
        ))}

        {/* ── SUMMARY ───────────────────────────────────────────────────────── */}
        <View style={[styles.summaryCard, { borderColor: `${accent}30` }]}>
          <View style={styles.summaryHeader}>
            <Text style={{ fontSize: 18 }}>📋</Text>
            <Text style={styles.summaryTitle}>Chapter Summary</Text>
          </View>
          <VocabText
            text={chapter.summary}
            baseStyle={styles.summaryText}
            highlightColor={accent}
            onWordPress={handleWordPress}
          />
        </View>

        {/* ── KEY TERMS ─────────────────────────────────────────────────────── */}
        {chapter.keyTerms.length > 0 && (
          <View style={styles.keyTermsCard}>
            <Text style={styles.keyTermsTitle}>🔑 Key Terms ({chapter.keyTerms.length})</Text>
            {chapter.keyTerms.map((kt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.termRow, i < chapter.keyTerms.length - 1 && styles.termDivider]}
                onPress={() => toggleTerm(i)}
                activeOpacity={0.8}
              >
                <View style={styles.termHeader}>
                  <Text style={[styles.termName, { color: accent }]}>{kt.term}</Text>
                  <Ionicons name={expandedTerms.has(i) ? 'chevron-up' : 'chevron-down'} size={14} color={C.mutedForeground} />
                </View>
                {expandedTerms.has(i) && (
                  <Text style={styles.termDef}>{kt.definition}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── PRACTICE QUESTIONS ────────────────────────────────────────────── */}
        {chapter.practiceQuestions && chapter.practiceQuestions.length > 0 && (
          <View style={styles.questionsCard}>
            <TouchableOpacity
              style={styles.questionsHeader}
              onPress={() => setShowQuestions(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.questionsTitle}>📝 Practice Questions ({chapter.practiceQuestions.length})</Text>
              <Ionicons name={showQuestions ? 'chevron-up' : 'chevron-down'} size={16} color={C.mutedForeground} />
            </TouchableOpacity>
            {showQuestions && (
              <View style={styles.questionsList}>
                {chapter.practiceQuestions.map((q, i) => (
                  <View key={i} style={styles.questionRow}>
                    <Text style={[styles.questionNum, { color: accent }]}>{i + 1}.</Text>
                    <Text style={styles.questionText}>{q}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── COMPLETION CARD ───────────────────────────────────────────────── */}
        <View style={[styles.completionCard, {
          borderColor: completed ? `${accent}45` : C.border,
          backgroundColor: completed ? `${accent}0a` : C.card,
        }]}>
          <Text style={styles.completionEmoji}>{completed ? '🎉' : '📖'}</Text>
          <Text style={[styles.completionTitle, { color: C.foreground }]}>
            {completed ? 'Chapter Complete!' : 'Keep Going!'}
          </Text>
          <Text style={[styles.completionSub, { color: C.mutedForeground }]}>
            {completed
              ? `All ${chapter.sections.length} sections read · ${chapter.keyTerms.length} key terms explored`
              : `${readingProgress}% complete · ${chapter.sections.length} sections in this chapter`}
          </Text>

          <TouchableOpacity
            style={[styles.quizCTABtn, { backgroundColor: accent }]}
            onPress={() => router.push('/(tabs)/quiz' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="flash-outline" size={16} color="#fff" />
            <Text style={styles.quizCTAText}>Quiz Yourself on This Topic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pastQBtn, { borderColor: `${accent}30` }]}
            onPress={() => router.push('/past-questions' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="library-outline" size={15} color={accent} />
            <Text style={[styles.pastQBtnText, { color: accent }]}>Browse Past Questions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Scroll-to-top FAB ────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.fab,
          { backgroundColor: accent },
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          },
        ]}
        pointerEvents={scrolledDown ? 'auto' : 'none'}
      >
        <TouchableOpacity
          onPress={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            Haptics.selectionAsync();
          }}
          activeOpacity={0.85}
          style={styles.fabInner}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(C: AppColors, fontSize: number) {
  const lineH = Math.round(fontSize * 1.65);
  return StyleSheet.create({
    root:        { flex: 1, backgroundColor: C.background },
    centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 14, fontSize: 14, color: C.mutedForeground, fontFamily: 'Inter_400Regular' },
    errorText:   { fontSize: 15, color: C.destructive, fontFamily: 'Inter_500Medium', marginTop: 14, marginBottom: 16 },
    retryBtn:    { padding: 12 },
    retryText:   { fontSize: 14, color: C.primary, fontFamily: 'Inter_600SemiBold' },

    offlineBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      marginTop: 8, paddingHorizontal: 10, paddingVertical: 5,
      backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: 8,
      alignSelf: 'flex-start',
    },
    offlineBannerText: { fontSize: 11, color: '#f97316', fontFamily: 'Inter_600SemiBold' },

    header: {
      backgroundColor: C.heroBg, paddingHorizontal: 20, paddingBottom: 18, overflow: 'hidden',
    },
    headerDecor: {
      position: 'absolute', width: 200, height: 200, borderRadius: 100,
      backgroundColor: 'rgba(255,255,255,0.04)', top: -80, right: -50,
    },
    headerDecor2: {
      position: 'absolute', width: 120, height: 120, borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.03)', bottom: -40, left: 20,
    },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)' },

    headerIconBtn: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    fontBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      paddingHorizontal: 12, paddingVertical: 6,
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    },
    fontBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },

    chapterNumBadge: { marginBottom: 6 },
    chapterNumText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
    chapterTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3, lineHeight: 26, marginBottom: 10 },
    chapterMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
    chapterMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter_500Medium' },
    chapterMetaDot: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
    vocabHintText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

    // Progress bar
    progressBarTrack: {
      height: 3, backgroundColor: C.border, flexDirection: 'row', alignItems: 'center',
    },
    progressBarFill: { height: 3, borderRadius: 2 },
    progressLabel: {
      position: 'absolute', right: 8,
      fontSize: 9, fontFamily: 'Inter_700Bold', lineHeight: 11,
    },

    scroll: { padding: 16 },

    section: {
      flexDirection: 'row', marginBottom: 16,
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    },
    sectionAccentBar: { width: 4, flexShrink: 0 },
    sectionContent: { flex: 1, padding: 14 },
    sectionHeadingRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12,
    },
    sectionNumBadge: {
      minWidth: 30, height: 22, borderRadius: 6,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 6, marginTop: 2, flexShrink: 0,
    },
    sectionNumText: {
      fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5,
    },
    sectionHeading: {
      fontSize: Math.round(fontSize * 1.1), fontFamily: 'Inter_700Bold', color: C.foreground,
      lineHeight: Math.round(fontSize * 1.5),
    },
    contentText: { fontSize, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: lineH },

    summaryCard: {
      backgroundColor: C.muted, borderRadius: C.radius,
      borderWidth: 1, padding: 14, marginBottom: 12,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    summaryTitle: { fontSize: Math.round(fontSize * 1.1), fontFamily: 'Inter_700Bold', color: C.foreground },
    summaryText: { fontSize, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: lineH },

    keyTermsCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12,
    },
    keyTermsTitle: { fontSize: Math.round(fontSize * 1.1), fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 12 },
    termRow: { paddingVertical: 10 },
    termDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
    termHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    termName: { fontSize, fontFamily: 'Inter_700Bold', flex: 1, paddingRight: 8 },
    termDef: { fontSize: Math.round(fontSize * 0.87), fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 6, lineHeight: Math.round(fontSize * 1.4) },

    questionsCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12,
    },
    questionsHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14,
    },
    questionsTitle: { fontSize: Math.round(fontSize * 1.1), fontFamily: 'Inter_700Bold', color: C.foreground },
    questionsList: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
    questionRow: { flexDirection: 'row', paddingTop: 12 },
    questionNum: { fontSize, fontFamily: 'Inter_700Bold', width: 22, flexShrink: 0 },
    questionText: { flex: 1, fontSize, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: lineH },

    // Completion card
    completionCard: {
      borderRadius: 16, borderWidth: 1.5,
      padding: 24, marginBottom: 12, alignItems: 'center', gap: 8,
    },
    completionEmoji: { fontSize: 42 },
    completionTitle: { fontSize: Math.round(fontSize * 1.2), fontFamily: 'Inter_700Bold', textAlign: 'center' },
    completionSub: { fontSize: Math.round(fontSize * 0.87), fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
    quizCTABtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 22, paddingVertical: 13,
      borderRadius: 12, width: '100%', justifyContent: 'center',
    },
    quizCTAText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
    pastQBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 22, paddingVertical: 11,
      borderRadius: 12, borderWidth: 1, width: '100%', justifyContent: 'center',
    },
    pastQBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

    // Scroll-to-top FAB
    fab: {
      position: 'absolute', right: 18, bottom: 32,
      width: 46, height: 46, borderRadius: 23,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
    },
    fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 23 },

    // Vocab modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 20, paddingBottom: 32,
      shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
    },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 18 },
    modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    modalWordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
    modalWord: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
    subjectTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    subjectTagText: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
    modalPos: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, fontStyle: 'italic' },
    modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.muted, alignItems: 'center', justifyContent: 'center' },
    offlineBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: '#f0fdf4', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 5,
      alignSelf: 'flex-start', marginBottom: 14,
      borderWidth: 1, borderColor: '#bbf7d0',
    },
    offlineBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#16a34a' },
    modalDefinition: { fontSize: 15, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 24, marginBottom: 14 },
    modalExample: { backgroundColor: C.muted, borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3 },
    modalExampleLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    modalExampleText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, fontStyle: 'italic', lineHeight: 19 },
    modalDictBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    },
    modalDictBtnText: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  });
}

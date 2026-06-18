import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { getApiBase } from '@/lib/query-client';
import { lookupWord, type VocabEntry } from '@/lib/vocabulary';
import type { AppColors } from '@/constants/colors';

type Section = { heading: string; content: string };
type KeyTerm = { term: string; definition: string };
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

// ── Vocab-aware text renderer ─────────────────────────────────────────────────
// Renders plain text with JUPEB vocab words highlighted and tappable.
function VocabText({
  text,
  baseStyle,
  highlightColor,
  onWordPress,
}: {
  text: string;
  baseStyle: any;
  highlightColor: string;
  onWordPress: (entry: VocabEntry) => void;
}) {
  // Split by markdown bold/italic first
  const mdParts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);

  const children: React.ReactNode[] = [];
  mdParts.forEach((part, pi) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push(
        <Text key={`md-b-${pi}`} style={{ fontFamily: 'Inter_700Bold' }}>
          {part.slice(2, -2)}
        </Text>
      );
      return;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      children.push(
        <Text key={`md-i-${pi}`} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </Text>
      );
      return;
    }
    // Plain text — check word-by-word for vocab hits
    const tokens = part.split(/(\s+)/);
    tokens.forEach((token, ti) => {
      const entry = lookupWord(token);
      if (entry) {
        children.push(
          <Text
            key={`v-${pi}-${ti}`}
            style={{
              color: highlightColor,
              fontFamily: 'Inter_600SemiBold',
              textDecorationLine: 'underline',
              textDecorationStyle: 'dotted',
            } as any}
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

// ── Content renderer ──────────────────────────────────────────────────────────
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

    // Numbered list
    if (/^\d+\.\s/.test(lines[0])) {
      return (
        <View key={i} style={{ marginBottom: 12 }}>
          {lines.map((line, j) => {
            const m = line.match(/^(\d+)\.\s(.+)/);
            if (m) {
              return (
                <View key={j} style={{ flexDirection: 'row', marginBottom: 5 }}>
                  <Text style={[styles.contentText, { color: C.primary, width: 22, flexShrink: 0 }]}>{m[1]}.</Text>
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
                  <Text style={[styles.contentText, { color: C.primary, width: 16, flexShrink: 0 }]}>•</Text>
                  <VocabText text={m[1]} baseStyle={[styles.contentText, { flex: 1 }]} highlightColor={accent} onWordPress={onWordPress} />
                </View>
              );
            }
            return <VocabText key={j} text={line} baseStyle={[styles.contentText, { marginBottom: 4 }]} highlightColor={accent} onWordPress={onWordPress} />;
          })}
        </View>
      );
    }

    // Regular paragraph
    return <VocabText key={i} text={p} baseStyle={[styles.contentText, { marginBottom: 14 }]} highlightColor={accent} onWordPress={onWordPress} />;
  });
}

// ── Vocab Definition Modal ────────────────────────────────────────────────────
function VocabModal({
  entry,
  accent,
  onClose,
  onFullDictionary,
}: {
  entry: VocabEntry | null;
  accent: string;
  onClose: () => void;
  onFullDictionary: (term: string) => void;
}) {
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);
  if (!entry) return null;

  const subjectLabel: Record<string, string> = {
    GOV: 'Government', CRS: 'CRS', LIT: 'Literature', GENERAL: 'Academic',
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={S.modalOverlay} onPress={onClose}>
        <Pressable style={S.modalSheet} onPress={e => e.stopPropagation()}>
          {/* Handle */}
          <View style={S.modalHandle} />

          {/* Header */}
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

          {/* Offline badge */}
          <View style={S.offlineBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
            <Text style={S.offlineBadgeText}>Saved on device · works offline</Text>
          </View>

          {/* Definition */}
          <Text style={S.modalDefinition}>{entry.definition}</Text>

          {/* Example */}
          {entry.example && (
            <View style={[S.modalExample, { borderLeftColor: accent }]}>
              <Text style={S.modalExampleLabel}>Example</Text>
              <Text style={S.modalExampleText}>"{entry.example}"</Text>
            </View>
          )}

          {/* Full dictionary link */}
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChapterScreen() {
  const { chapterId, courseId } = useLocalSearchParams<{ chapterId: string; courseId: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [chapter, setChapter]           = useState<ChapterDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set());
  const [showQuestions, setShowQuestions] = useState(false);
  const [fromCache, setFromCache]       = useState(false);
  const [vocabEntry, setVocabEntry]     = useState<VocabEntry | null>(null);

  const accent = getAccentFromChapterId(chapterId ?? '');

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
      {/* Vocab popup modal */}
      <VocabModal
        entry={vocabEntry}
        accent={accent}
        onClose={() => setVocabEntry(null)}
        onFullDictionary={handleFullDictionary}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerDecor} />
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.chapterNumBadge}>
          <Text style={[styles.chapterNumText, { color: accent }]}>Chapter {chapter.number}</Text>
        </View>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <View style={styles.chapterMeta}>
          <Text style={styles.chapterMetaText}>{chapter.sections.length} sections</Text>
          <Text style={styles.chapterMetaDot}>·</Text>
          <Text style={styles.chapterMetaText}>{chapter.keyTerms.length} key terms</Text>
          <Text style={styles.chapterMetaDot}>·</Text>
          <View style={styles.vocabHint}>
            <Text style={[styles.vocabHintText, { color: accent }]}>tap coloured words for meaning</Text>
          </View>
        </View>
        {fromCache && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={12} color="#f97316" />
            <Text style={styles.offlineBannerText}>Offline — showing saved version</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: (bottom || 0) + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTIONS ─────────────────────────────────────────────────────── */}
        {chapter.sections.map((sec, i) => (
          <View key={i} style={styles.section}>
            <View style={[styles.sectionAccentBar, { backgroundColor: accent }]} />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionHeading}>{sec.heading}</Text>
              {renderContent(sec.content, styles, C, accent, handleWordPress)}
            </View>
          </View>
        ))}

        {/* ── SUMMARY ──────────────────────────────────────────────────────── */}
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

        {/* ── KEY TERMS ────────────────────────────────────────────────────── */}
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
                  <Ionicons
                    name={expandedTerms.has(i) ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={C.mutedForeground}
                  />
                </View>
                {expandedTerms.has(i) && (
                  <Text style={styles.termDef}>{kt.definition}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── PRACTICE QUESTIONS ───────────────────────────────────────────── */}
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
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
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
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    backLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)' },
    chapterNumBadge: { marginBottom: 6 },
    chapterNumText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
    chapterTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3, lineHeight: 26, marginBottom: 10 },
    chapterMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    chapterMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter_500Medium' },
    chapterMetaDot: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
    vocabHint: {},
    vocabHintText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

    scroll: { padding: 16 },

    section: {
      flexDirection: 'row', marginBottom: 16,
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    },
    sectionAccentBar: { width: 4, flexShrink: 0 },
    sectionContent: { flex: 1, padding: 14 },
    sectionHeading: {
      fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground,
      marginBottom: 12, lineHeight: 21,
    },
    contentText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 21 },

    summaryCard: {
      backgroundColor: C.muted, borderRadius: C.radius,
      borderWidth: 1, padding: 14, marginBottom: 12,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    summaryTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground },
    summaryText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 21 },

    keyTermsCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12,
    },
    keyTermsTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 12 },
    termRow: { paddingVertical: 10 },
    termDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
    termHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    termName: { fontSize: 13, fontFamily: 'Inter_700Bold', flex: 1, paddingRight: 8 },
    termDef: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 6, lineHeight: 18 },

    questionsCard: {
      backgroundColor: C.card, borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12,
    },
    questionsHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14,
    },
    questionsTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground },
    questionsList: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
    questionRow: { flexDirection: 'row', paddingTop: 12 },
    questionNum: { fontSize: 13, fontFamily: 'Inter_700Bold', width: 22, flexShrink: 0 },
    questionText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 19 },

    // ── Vocab modal ──────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: C.card,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: 20, paddingBottom: 32,
      shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
    },
    modalHandle: {
      width: 36, height: 4, borderRadius: 2,
      backgroundColor: C.border, alignSelf: 'center', marginBottom: 18,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    modalWordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
    modalWord: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
    subjectTag: {
      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    },
    subjectTagText: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
    modalPos: { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, fontStyle: 'italic' },
    modalCloseBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: C.muted, alignItems: 'center', justifyContent: 'center',
    },
    offlineBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: '#f0fdf4', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 5,
      alignSelf: 'flex-start', marginBottom: 14,
      borderWidth: 1, borderColor: '#bbf7d0',
    },
    offlineBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#16a34a' },
    modalDefinition: {
      fontSize: 15, fontFamily: 'Inter_400Regular', color: C.foreground,
      lineHeight: 24, marginBottom: 14,
    },
    modalExample: {
      backgroundColor: C.muted, borderRadius: 10,
      padding: 12, marginBottom: 16,
      borderLeftWidth: 3,
    },
    modalExampleLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    modalExampleText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, fontStyle: 'italic', lineHeight: 19 },
    modalDictBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 12, borderWidth: 1,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    modalDictBtnText: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  });
}

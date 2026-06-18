import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { getApiBase } from '@/lib/query-client';
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
  crs: '#d97706',
  gov: '#0284c7',
  lit: '#16a34a',
};

function getAccentFromChapterId(id: string): string {
  const prefix = id.slice(0, 3).toLowerCase();
  return ACCENT_MAP[prefix] ?? '#1e40af';
}

// ─── Simple inline markdown renderer ─────────────────────────────────────────
function InlineText({ text, baseStyle }: { text: string; baseStyle: any }) {
  const parts = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontFamily: 'Inter_700Bold' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <Text key={i} style={{ fontStyle: 'italic' }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

function renderContent(text: string, styles: ReturnType<typeof makeStyles>, C: AppColors) {
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
                  <InlineText text={m[2]} baseStyle={[styles.contentText, { flex: 1 }]} />
                </View>
              );
            }
            return <InlineText key={j} text={line} baseStyle={[styles.contentText, { marginBottom: 4 }]} />;
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
                  <InlineText text={m[1]} baseStyle={[styles.contentText, { flex: 1 }]} />
                </View>
              );
            }
            return <InlineText key={j} text={line} baseStyle={[styles.contentText, { marginBottom: 4 }]} />;
          })}
        </View>
      );
    }

    // Regular paragraph
    return <InlineText key={i} text={p} baseStyle={[styles.contentText, { marginBottom: 14 }]} />;
  });
}

export default function ChapterScreen() {
  const { chapterId, courseId } = useLocalSearchParams<{ chapterId: string; courseId: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set());
  const [showQuestions, setShowQuestions] = useState(false);

  const accent = getAccentFromChapterId(chapterId ?? '');

  const [fromCache, setFromCache] = useState(false);

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
        // Persist to cache for offline use
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
        // Mark chapter as read
        if (chapterId) {
          await AsyncStorage.setItem(`jupeb_chapter_read_${chapterId}`, Date.now().toString());
        }
      } catch (e: any) {
        // Network failed — try offline cache
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) {
            setChapter(JSON.parse(cached));
            setFromCache(true);
            if (chapterId) {
              await AsyncStorage.setItem(`jupeb_chapter_read_${chapterId}`, Date.now().toString());
            }
          } else {
            setError(e.message);
          }
        } catch {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, chapterId]);

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
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
        </View>
        {fromCache && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={12} color="#f97316" />
            <Text style={styles.offlineBannerText}>Offline — showing cached version</Text>
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
              {renderContent(sec.content, styles, C)}
            </View>
          </View>
        ))}

        {/* ── SUMMARY ──────────────────────────────────────────────────────── */}
        <View style={[styles.summaryCard, { borderColor: `${accent}30` }]}>
          <View style={styles.summaryHeader}>
            <Text style={{ fontSize: 18 }}>📋</Text>
            <Text style={styles.summaryTitle}>Chapter Summary</Text>
          </View>
          <Text style={styles.summaryText}>{chapter.summary}</Text>
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
    root: { flex: 1, backgroundColor: C.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 14, fontSize: 14, color: C.mutedForeground, fontFamily: 'Inter_400Regular' },
    errorText: { fontSize: 15, color: C.destructive, fontFamily: 'Inter_500Medium', marginTop: 14, marginBottom: 16 },
    retryBtn: { padding: 12 },
    retryText: { fontSize: 14, color: C.primary, fontFamily: 'Inter_600SemiBold' },
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
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    backLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.7)' },
    chapterNumBadge: { marginBottom: 6 },
    chapterNumText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
    chapterTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3, lineHeight: 26, marginBottom: 10 },
    chapterMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    chapterMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter_500Medium' },
    chapterMetaDot: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },

    scroll: { padding: 16 },

    // Sections
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
    contentText: {
      fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground,
      lineHeight: 21,
    },

    // Summary
    summaryCard: {
      backgroundColor: C.muted, borderRadius: C.radius,
      borderWidth: 1, padding: 14, marginBottom: 12,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    summaryTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.foreground },
    summaryText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 21 },

    // Key terms
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

    // Practice questions
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
  });
}

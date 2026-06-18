import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { lookupWord, type VocabEntry } from '@/lib/vocabulary';
import type { AppColors } from '@/constants/colors';

const RECENT_KEY  = 'jupeb_dict_recent';
const MAX_RECENT  = 8;
const DEBOUNCE_MS = 600;

// ── API types ─────────────────────────────────────────────────────────────────
type DictDefinition = { definition: string; example?: string; synonyms?: string[] };
type DictMeaning    = { partOfSpeech: string; definitions: DictDefinition[] };
type DictEntry      = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: DictMeaning[];
};
type WikiSummary    = { title: string; extract: string; thumbnail?: { source: string } };

async function fetchDictionary(word: string): Promise<DictEntry[]> {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`
  );
  if (!res.ok) throw new Error('not_found');
  return res.json();
}

async function fetchWikipedia(word: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word.trim())}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data: WikiSummary & { type: string } = await res.json();
    if (data.type === 'disambiguation') return null;
    return data;
  } catch {
    return null;
  }
}

// ── POS colour ────────────────────────────────────────────────────────────────
const POS_COLORS: Record<string, string> = {
  noun: '#0284c7', verb: '#7c3aed', adjective: '#d97706',
  adverb: '#059669', preposition: '#dc2626', conjunction: '#0891b2',
  pronoun: '#6366f1', interjection: '#f43f5e',
};
function posColor(pos: string): string {
  return POS_COLORS[pos.toLowerCase()] ?? '#6b7280';
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DictionaryScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);

  const [query, setQuery]           = useState(params.q ?? '');
  const [loading, setLoading]       = useState(false);
  const [entries, setEntries]       = useState<DictEntry[] | null>(null);
  const [wiki, setWiki]             = useState<WikiSummary | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [recent, setRecent]         = useState<string[]>([]);
  const [localEntry, setLocalEntry] = useState<VocabEntry | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<TextInput>(null);

  // Load recent searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then(v => { if (v) setRecent(JSON.parse(v)); })
      .catch(() => {});
    if (params.q) lookup(params.q);
  }, []);

  const saveRecent = useCallback(async (word: string) => {
    const next = [word, ...recent.filter(r => r.toLowerCase() !== word.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }, [recent]);

  const lookup = useCallback(async (word: string) => {
    if (!word.trim()) { setEntries(null); setWiki(null); setError(null); setLocalEntry(null); return; }
    setLoading(true); setError(null); setEntries(null); setWiki(null);

    // ① Check offline JUPEB vocabulary first — works without internet
    const offlineHit = lookupWord(word);
    setLocalEntry(offlineHit ?? null);

    try {
      const [dictResult, wikiResult] = await Promise.allSettled([
        fetchDictionary(word),
        fetchWikipedia(word),
      ]);
      if (dictResult.status === 'fulfilled') {
        setEntries(dictResult.value);
        saveRecent(word.trim());
      } else if (!offlineHit) {
        setError('not_found');
      } else {
        // offline vocab is enough — just save recent
        saveRecent(word.trim());
      }
      if (wikiResult.status === 'fulfilled') setWiki(wikiResult.value);
    } catch {
      if (!offlineHit) setError('failed');
    } finally {
      setLoading(false);
    }
  }, [saveRecent]);

  // Debounced search as user types
  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length >= 3) {
      debounceRef.current = setTimeout(() => lookup(text.trim()), DEBOUNCE_MS);
    } else {
      setEntries(null); setWiki(null); setError(null);
    }
  };

  const handleSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    lookup(query);
  };

  const clearSearch = () => {
    setQuery(''); setEntries(null); setWiki(null); setError(null);
    inputRef.current?.focus();
  };

  const phonetic = entries?.[0]?.phonetic
    ?? entries?.[0]?.phonetics?.find(p => p.text)?.text
    ?? null;

  return (
    <View style={S.root}>
      {/* Header */}
      <View style={[S.header, { paddingTop: topPad + 12 }]}>
        <View style={S.headerDecor} />
        <View style={S.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={S.headerTitle}>Dictionary</Text>
            <Text style={S.headerSub}>Definitions · Examples · Wikipedia</Text>
          </View>
          <Ionicons name="library-outline" size={22} color="rgba(255,255,255,0.5)" />
        </View>

        {/* Search bar */}
        <View style={S.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={inputRef}
            style={S.searchInput}
            value={query}
            onChangeText={handleChange}
            onSubmitEditing={handleSubmit}
            placeholder="Search any word or term…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            returnKeyType="search"
            autoFocus={!params.q}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={S.clearBtn}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <View style={S.centered}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={S.loadingText}>Looking up "{query}"…</Text>
          </View>
        )}

        {/* ── Error / not found ─────────────────────────────────────────── */}
        {!loading && error && (
          <View style={S.notFoundCard}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🔍</Text>
            <Text style={S.notFoundTitle}>
              {error === 'not_found' ? `No definition found for "${query}"` : 'Could not connect. Check your internet.'}
            </Text>
            <Text style={S.notFoundSub}>
              {error === 'not_found'
                ? 'Try checking the spelling, or search for a simpler form of the word.'
                : 'The dictionary requires an internet connection.'}
            </Text>
          </View>
        )}

        {/* ── JUPEB Offline Vocab Card ──────────────────────────────────── */}
        {!loading && localEntry && (
          <View style={S.jupebCard}>
            <View style={S.jupebCardHeader}>
              <View style={S.jupebIconBox}>
                <Ionicons name="school" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={S.jupebCardLabel}>JUPEB Dictionary</Text>
                <Text style={S.jupebCardSub}>Saved on device · available offline</Text>
              </View>
              <View style={[S.posBadge, { backgroundColor: `${posColor(localEntry.pos)}15` }]}>
                <Text style={[S.posText, { color: posColor(localEntry.pos) }]}>{localEntry.pos}</Text>
              </View>
            </View>
            <Text style={S.jupebDefinition}>{localEntry.definition}</Text>
            {localEntry.example && (
              <View style={[S.exampleBox, { borderLeftColor: '#16a34a' }]}>
                <Text style={S.exampleText}>"{localEntry.example}"</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Results ───────────────────────────────────────────────────── */}
        {!loading && entries && entries.length > 0 && (() => {
          const entry = entries[0];
          return (
            <>
              {/* Word header */}
              <View style={S.wordHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={S.wordText}>{entry.word}</Text>
                  {phonetic && <Text style={S.phoneticText}>{phonetic}</Text>}
                </View>
                <View style={[S.wordBadge, { backgroundColor: `${C.primary}15` }]}>
                  <Ionicons name="volume-medium-outline" size={16} color={C.primary} />
                  <Text style={[S.wordBadgeText, { color: C.primary }]}>
                    {entry.meanings.length} meaning{entry.meanings.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {/* Meanings */}
              {entry.meanings.map((m, mi) => (
                <View key={mi} style={S.meaningCard}>
                  <View style={[S.posBadge, { backgroundColor: `${posColor(m.partOfSpeech)}15` }]}>
                    <Text style={[S.posText, { color: posColor(m.partOfSpeech) }]}>{m.partOfSpeech}</Text>
                  </View>
                  {m.definitions.slice(0, 3).map((d, di) => (
                    <View key={di} style={[S.defRow, di > 0 && S.defBorder]}>
                      <View style={[S.defNum, { backgroundColor: `${posColor(m.partOfSpeech)}15` }]}>
                        <Text style={[S.defNumText, { color: posColor(m.partOfSpeech) }]}>{di + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={S.defText}>{d.definition}</Text>
                        {d.example && (
                          <View style={S.exampleBox}>
                            <Text style={S.exampleText}>"{d.example}"</Text>
                          </View>
                        )}
                        {d.synonyms && d.synonyms.length > 0 && (
                          <View style={S.synonymRow}>
                            <Text style={S.synonymLabel}>Also: </Text>
                            {d.synonyms.slice(0, 4).map((s, si) => (
                              <TouchableOpacity key={si} onPress={() => { setQuery(s); lookup(s); }} activeOpacity={0.7}>
                                <Text style={S.synonymChip}>{s}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

              {/* Wikipedia summary */}
              {wiki && (
                <View style={S.wikiCard}>
                  <View style={S.wikiHeader}>
                    <View style={S.wikiIconBox}>
                      <Text style={{ fontSize: 16 }}>📖</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={S.wikiTitle}>Wikipedia</Text>
                      <Text style={S.wikiWordTitle}>{wiki.title}</Text>
                    </View>
                  </View>
                  <Text style={S.wikiExtract} numberOfLines={6}>{wiki.extract}</Text>
                </View>
              )}
            </>
          );
        })()}

        {/* ── Empty state + recent searches ─────────────────────────────── */}
        {!loading && !entries && !error && (
          <>
            <View style={S.emptyHero}>
              <Text style={{ fontSize: 52, marginBottom: 16 }}>📚</Text>
              <Text style={S.emptyTitle}>Look up any word</Text>
              <Text style={S.emptySub}>
                Type a word above to instantly see its definition, examples, and Wikipedia summary. Great for academic terms in your JUPEB subjects.
              </Text>
            </View>

            {recent.length > 0 && (
              <View style={S.recentSection}>
                <View style={S.recentHeader}>
                  <Text style={S.recentTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={async () => {
                    setRecent([]);
                    await AsyncStorage.removeItem(RECENT_KEY);
                  }}>
                    <Text style={S.recentClear}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={S.recentChips}>
                  {recent.map((r, i) => (
                    <TouchableOpacity
                      key={i}
                      style={S.recentChip}
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setQuery(r);
                        lookup(r);
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="time-outline" size={12} color={C.mutedForeground} />
                      <Text style={S.recentChipText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quick look-up suggestions */}
            <View style={S.suggestSection}>
              <Text style={S.recentTitle}>Try these JUPEB terms</Text>
              <View style={S.recentChips}>
                {['sovereignty', 'constitution', 'covenant', 'allegory', 'federalism', 'amendment', 'monarchy', 'parable'].map((w, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[S.recentChip, { backgroundColor: `${C.primary}10`, borderColor: `${C.primary}25` }]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setQuery(w);
                      lookup(w);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[S.recentChipText, { color: C.primary }]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.background },

    header: {
      backgroundColor: C.heroBg, paddingHorizontal: 20,
      paddingBottom: 18, overflow: 'hidden',
    },
    headerDecor: {
      position: 'absolute', width: 200, height: 200, borderRadius: 100,
      backgroundColor: 'rgba(249,115,22,0.07)', top: -80, right: -50,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3 },
    headerSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 1 },

    searchBar: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 14, paddingVertical: 11, gap: 10,
    },
    searchInput: {
      flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#fff',
    },
    clearBtn: { padding: 2 },

    scroll: { padding: 16 },
    centered: { alignItems: 'center', paddingTop: 60 },
    loadingText: { marginTop: 16, fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground },

    notFoundCard: {
      alignItems: 'center', backgroundColor: C.card,
      borderRadius: C.radiusLg, borderWidth: 1, borderColor: C.border,
      padding: 28, marginTop: 20,
    },
    notFoundTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground, textAlign: 'center', marginBottom: 8 },
    notFoundSub:   { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', lineHeight: 19 },

    // ── JUPEB offline vocab card
    jupebCard: {
      backgroundColor: '#f0fdf4', borderRadius: C.radiusLg,
      borderWidth: 1.5, borderColor: '#bbf7d0',
      padding: 16, marginBottom: 12,
    },
    jupebCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    jupebIconBox: {
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center',
    },
    jupebCardLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#15803d' },
    jupebCardSub:   { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#16a34a', marginTop: 1 },
    jupebDefinition: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#14532d', lineHeight: 22 },

    // ── Word result
    wordHeader: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border,
      padding: 18, marginBottom: 12,
    },
    wordText:     { fontSize: 28, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5, marginBottom: 4 },
    phoneticText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: C.primary, fontStyle: 'italic' },
    wordBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    },
    wordBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

    meaningCard: {
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12,
    },
    posBadge: {
      alignSelf: 'flex-start', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14,
    },
    posText: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

    defRow:    { flexDirection: 'row', gap: 12, paddingVertical: 10 },
    defBorder: { borderTopWidth: 1, borderTopColor: C.border },
    defNum: {
      width: 24, height: 24, borderRadius: 6,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    defNumText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
    defText:    { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 21 },

    exampleBox: {
      backgroundColor: C.muted, borderRadius: 8,
      padding: 10, marginTop: 8,
      borderLeftWidth: 3, borderLeftColor: C.primary,
    },
    exampleText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, fontStyle: 'italic', lineHeight: 19 },

    synonymRow:  { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8, gap: 6 },
    synonymLabel:{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground },
    synonymChip: {
      fontSize: 11, fontFamily: 'Inter_500Medium', color: C.primary,
      backgroundColor: `${C.primary}10`, borderRadius: 6,
      paddingHorizontal: 8, paddingVertical: 3,
    },

    // ── Wikipedia
    wikiCard: {
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12,
    },
    wikiHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    wikiIconBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    },
    wikiTitle:     { fontSize: 10, fontFamily: 'Inter_700Bold', color: C.mutedForeground, letterSpacing: 1, textTransform: 'uppercase' },
    wikiWordTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginTop: 2 },
    wikiExtract:   { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.foreground, lineHeight: 21 },

    // ── Empty / recent
    emptyHero: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 10, letterSpacing: -0.3 },
    emptySub:   { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', lineHeight: 21 },

    recentSection: { marginBottom: 24 },
    suggestSection:{ marginBottom: 16 },
    recentHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    recentTitle:   { fontSize: 14, fontFamily: 'Inter_700Bold', color: C.foreground, marginBottom: 10 },
    recentClear:   { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.destructive },
    recentChips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recentChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: C.card, borderRadius: 10,
      borderWidth: 1, borderColor: C.border,
      paddingHorizontal: 12, paddingVertical: 7,
    },
    recentChipText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.foreground },
  });
}

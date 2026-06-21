import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList,
  ActivityIndicator, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { getApiBase } from '@/lib/query-client';
import { ErrorCard } from '@/components/ErrorCard';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAPER_LABELS: Record<string, string> = {
  '001': '1st In-Course',
  '002': '1st Semester',
  '003': '2nd In-Course',
  '004': '2nd Semester',
  'mock': 'Mock Exam',
  'jupeb': 'JUPEB Final',
};

const PAPER_COLORS: Record<string, string> = {
  '001': '#0891b2',
  '002': '#7c3aed',
  '003': '#059669',
  '004': '#d97706',
  'mock': '#d97706',
  'jupeb': '#dc2626',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface PastPaper {
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  paper: string;
  examType: string | null;
  year: number;
  count: number;
  objectiveCount: number;
  theoryCount: number;
}

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: Record<string, string> | null;
  correctOption: string | null;
  explanation: string | null;
  markingGuide: string | null;
  marks: number;
}

// ─── Question card ─────────────────────────────────────────────────────────
function QuestionCard({ q, index, C }: { q: Question; index: number; C: any }) {
  const [revealed, setRevealed] = useState(false);

  const optionLetters = q.options ? Object.keys(q.options).sort() : [];

  return (
    <View style={[qStyles.card, { backgroundColor: C.card, borderColor: C.border }]}>
      <View style={qStyles.qHeader}>
        <View style={qStyles.numBadge}>
          <Text style={qStyles.numText}>{index + 1}</Text>
        </View>
        <View style={[qStyles.typeBadge, { backgroundColor: q.questionType === 'theory' ? 'rgba(220,38,38,0.12)' : 'rgba(8,145,178,0.12)' }]}>
          <Text style={[qStyles.typeText, { color: q.questionType === 'theory' ? '#dc2626' : '#0891b2' }]}>
            {q.questionType === 'theory' ? 'Theory' : 'MCQ'}
          </Text>
        </View>
        {q.marks > 1 && (
          <View style={qStyles.marksBadge}>
            <Text style={qStyles.marksText}>{q.marks} marks</Text>
          </View>
        )}
      </View>

      <Text style={[qStyles.qText, { color: C.foreground }]}>{q.questionText}</Text>

      {/* MCQ options */}
      {q.questionType === 'objective' && optionLetters.length > 0 && (
        <View style={qStyles.optionsWrap}>
          {optionLetters.map(letter => {
            const isCorrect = revealed && letter === q.correctOption;
            const isWrong = revealed && letter !== q.correctOption;
            return (
              <View
                key={letter}
                style={[
                  qStyles.option,
                  { borderColor: isCorrect ? '#16a34a' : isWrong ? C.border : C.border,
                    backgroundColor: isCorrect ? 'rgba(22,163,74,0.12)' : 'transparent' },
                ]}
              >
                <View style={[qStyles.optionLetter, { backgroundColor: isCorrect ? '#16a34a' : C.muted }]}>
                  <Text style={[qStyles.optionLetterText, { color: isCorrect ? '#fff' : C.mutedForeground }]}>{letter}</Text>
                </View>
                <Text style={[qStyles.optionText, { color: isCorrect ? '#16a34a' : C.foreground }]}>
                  {(q.options as any)[letter]}
                </Text>
                {isCorrect && <Ionicons name="checkmark-circle" size={16} color="#16a34a" />}
              </View>
            );
          })}
        </View>
      )}

      {/* Reveal / hide answer */}
      <TouchableOpacity
        style={[qStyles.revealBtn, { borderColor: C.border }]}
        onPress={() => setRevealed(v => !v)}
        activeOpacity={0.7}
      >
        <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={14} color={C.mutedForeground} />
        <Text style={[qStyles.revealText, { color: C.mutedForeground }]}>
          {revealed ? 'Hide Answer' : 'Show Answer'}
        </Text>
      </TouchableOpacity>

      {revealed && (
        <View style={[qStyles.answerWrap, { backgroundColor: 'rgba(22,163,74,0.08)', borderColor: 'rgba(22,163,74,0.2)' }]}>
          {q.questionType === 'theory' && q.markingGuide && (
            <>
              <Text style={qStyles.answerLabel}>Marking Guide</Text>
              <Text style={[qStyles.answerText, { color: C.foreground }]}>{q.markingGuide}</Text>
            </>
          )}
          {q.questionType === 'objective' && q.correctOption && (
            <>
              <Text style={qStyles.answerLabel}>Correct Answer: {q.correctOption}</Text>
            </>
          )}
          {q.explanation && (
            <>
              <Text style={[qStyles.answerLabel, { marginTop: 8 }]}>Explanation</Text>
              <Text style={[qStyles.answerText, { color: C.foreground }]}>{q.explanation}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const qStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  numBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#8b5cf6', fontSize: 11, fontWeight: '700' },
  typeBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  typeText: { fontSize: 10, fontWeight: '600' },
  marksBadge: { borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 7, paddingVertical: 2 },
  marksText: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  qText: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
  optionsWrap: { gap: 6, marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 8, padding: 8 },
  optionLetter: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 11, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  revealBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  revealText: { fontSize: 12 },
  answerWrap: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 10 },
  answerLabel: { color: '#16a34a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  answerText: { fontSize: 13, lineHeight: 20 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PastQuestionsScreen() {
  const C = useTheme();
  const { top } = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : top;

  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<PastPaper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadQError, setLoadQError] = useState(false);
  const [search, setSearch] = useState('');

  const loadPapers = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetch(`${getApiBase()}/questions/past-papers`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setPapers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, []);

  // ── Load past papers list ──────────────────────────────────────────────────
  useEffect(() => { loadPapers(); }, [loadPapers]);

  // ── Load questions when a paper is selected ────────────────────────────────
  useEffect(() => {
    if (!selected) { setQuestions([]); return; }
    setLoadingQ(true);
    setLoadQError(false);
    const params = new URLSearchParams({
      subjectId: String(selected.subjectId),
      year: String(selected.year),
      limit: '200',
    });
    if (selected.examType) params.set('examType', selected.examType);
    else params.set('paper', selected.paper);
    fetch(`${getApiBase()}/questions?${params}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setQuestions(Array.isArray(data) ? data : []); setLoadingQ(false); })
      .catch(() => { setLoadQError(true); setLoadingQ(false); });
  }, [selected]);

  // ── Group papers by subject ────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const filtered = search.trim()
      ? papers.filter(p =>
          p.subjectName.toLowerCase().includes(search.toLowerCase()) ||
          (PAPER_LABELS[p.paper] || p.paper).toLowerCase().includes(search.toLowerCase())
        )
      : papers;

    const map = new Map<number, { subject: PastPaper; papers: PastPaper[] }>();
    for (const p of filtered) {
      if (!map.has(p.subjectId)) map.set(p.subjectId, { subject: p, papers: [] });
      map.get(p.subjectId)!.papers.push(p);
    }
    return [...map.values()];
  }, [papers, search]);

  const paperLabel = (p: PastPaper) => PAPER_LABELS[p.examType || p.paper] || p.paper;
  const paperColor = (p: PastPaper) => PAPER_COLORS[p.examType || p.paper] || '#8b5cf6';

  // ── Render: questions view ─────────────────────────────────────────────────
  if (selected) {
    return (
      <View style={[styles.root, { backgroundColor: C.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: C.foreground }]} numberOfLines={1}>
              {selected.subjectName}
            </Text>
            <Text style={[styles.headerSub, { color: C.mutedForeground }]}>
              {paperLabel(selected)} · {selected.year}/{selected.year + 1} · {selected.count} questions
            </Text>
          </View>
        </View>

        {loadingQ ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#8b5cf6" size="large" />
            <Text style={[styles.loadingText, { color: C.mutedForeground }]}>Loading questions…</Text>
          </View>
        ) : loadQError ? (
          <ErrorCard
            title="Couldn't load questions"
            message="Check your internet connection and try again."
            icon="wifi-outline"
            onRetry={() => setSelected({ ...selected! })}
          />
        ) : (
          <FlatList
            data={questions}
            keyExtractor={q => String(q.id)}
            contentContainerStyle={styles.qList}
            renderItem={({ item, index }) => <QuestionCard q={item} index={index} C={C} />}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="document-outline" size={36} color={C.mutedForeground} />
                <Text style={[styles.emptyText, { color: C.mutedForeground }]}>No questions found</Text>
              </View>
            }
          />
        )}
      </View>
    );
  }

  // ── Render: papers list view ───────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: C.foreground }]}>Past Questions</Text>
          <Text style={[styles.headerSub, { color: C.mutedForeground }]}>Browse previous exam papers</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: C.card, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={16} color={C.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: C.foreground }]}
          placeholder="Search subject or paper type…"
          placeholderTextColor={C.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={16} color={C.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#8b5cf6" size="large" />
        </View>
      ) : loadError ? (
        <ErrorCard
          title="Couldn't load past papers"
          message="Check your internet connection and try again."
          icon="wifi-outline"
          onRetry={loadPapers}
        />
      ) : grouped.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="library-outline" size={40} color={C.mutedForeground} />
          <Text style={[styles.emptyText, { color: C.mutedForeground }]}>
            {search ? 'No results found' : 'No past questions uploaded yet'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {grouped.map(({ subject, papers: subPapers }) => (
            <View key={subject.subjectId} style={styles.subjectGroup}>
              {/* Subject header */}
              <View style={styles.subjectHeader}>
                <View style={[styles.subjectDot, { backgroundColor: subject.subjectColor || '#8b5cf6' }]} />
                <Text style={[styles.subjectName, { color: C.foreground }]}>{subject.subjectName}</Text>
                <Text style={[styles.subjectCode, { color: C.mutedForeground }]}>{subject.subjectCode}</Text>
              </View>

              {/* Paper cards */}
              {subPapers.map(p => (
                <TouchableOpacity
                  key={`${p.subjectId}-${p.paper}-${p.year}`}
                  style={[styles.paperCard, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={() => setSelected(p)}
                  activeOpacity={0.78}
                >
                  <View style={[styles.paperColorBar, { backgroundColor: paperColor(p) }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.paperRow}>
                      <Text style={[styles.paperLabel, { color: C.foreground }]}>{paperLabel(p)}</Text>
                      <Text style={[styles.paperYear, { color: C.mutedForeground }]}>{p.year}/{p.year + 1}</Text>
                    </View>
                    <View style={styles.paperMeta}>
                      {p.objectiveCount > 0 && (
                        <View style={styles.metaTag}>
                          <Text style={styles.metaTagText}>{p.objectiveCount} MCQ</Text>
                        </View>
                      )}
                      {p.theoryCount > 0 && (
                        <View style={[styles.metaTag, { backgroundColor: 'rgba(220,38,38,0.1)' }]}>
                          <Text style={[styles.metaTagText, { color: '#dc2626' }]}>{p.theoryCount} Theory</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  loadingText: { fontSize: 13 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  list: { paddingHorizontal: 14, paddingBottom: 40 },
  subjectGroup: { marginBottom: 20 },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  subjectName: { fontSize: 14, fontWeight: '700', flex: 1 },
  subjectCode: { fontSize: 11, fontWeight: '500' },
  paperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  paperColorBar: { width: 4, alignSelf: 'stretch' },
  paperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  paperLabel: { fontSize: 14, fontWeight: '600' },
  paperYear: { fontSize: 12 },
  paperMeta: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 4 },
  metaTag: { backgroundColor: 'rgba(8,145,178,0.1)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  metaTagText: { color: '#0891b2', fontSize: 10, fontWeight: '600' },
  qList: { padding: 14, paddingBottom: 40 },
});

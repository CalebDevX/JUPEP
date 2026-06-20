import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { getQuestionsForGroup, saveAttempt, type DBQuestion } from '@/lib/database';

type Phase = 'loading' | 'question' | 'result';
type Options = Record<string, string>;

function parseOptions(raw: string): Options {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Options;
    if (Array.isArray(parsed)) {
      const keys = ['A', 'B', 'C', 'D'];
      const out: Options = {};
      parsed.forEach((v: string, i: number) => { if (keys[i]) out[keys[i]] = v; });
      return out;
    }
  } catch { /* fall through */ }
  return {};
}

function getGrade(pct: number): string {
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 45) return 'D';
  if (pct >= 40) return 'E';
  return 'F';
}

function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return Colors.success;
  if (grade === 'C' || grade === 'D') return Colors.warning;
  return Colors.destructive;
}

export default function QuizSessionScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 9,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 40, useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => {
    if (!groupId) return;
    getQuestionsForGroup(groupId).then((qs) => {
      // Shuffle for variety
      const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, 40);
      setQuestions(shuffled);
      setPhase(shuffled.length > 0 ? 'question' : 'result');
    });
  }, [groupId]);

  const current = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const finalScore = Object.entries(answers).filter(
    ([id, ans]) => questions.find(q => q.id === Number(id))?.correctOption === ans
  ).length;

  function handleSelect(option: string) {
    if (submitted) return;
    setSelected(option);
    Haptics.selectionAsync();
  }

  async function handleSubmit() {
    if (!selected || !current) return;
    setSubmitted(true);
    const correct = current.correctOption === selected;
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
    }
    setAnswers(prev => ({ ...prev, [current.id]: selected }));
  }

  function handleNext() {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    if (isLast) {
      const total = questions.length;
      const sc = Object.entries({ ...answers, [current!.id]: selected! }).filter(
        ([id, ans]) => questions.find(q => q.id === Number(id))?.correctOption === ans
      ).length;
      setScore(sc);
      setAnswers(prev => ({ ...prev, [current!.id]: selected! }));
      setPhase('result');
      saveAttempt({ groupId: groupId!, score: sc, total, answers: { ...answers, [current!.id]: selected! } });
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  function handleDone() {
    router.back();
  }

  if (phase === 'loading') {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (phase === 'result') {
    const total = questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade = getGrade(pct);
    const color = gradeColor(grade);

    if (showReview) {
      return (
        <View style={styles.root}>
          <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
            <TouchableOpacity onPress={() => setShowReview(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Review Answers</Text>
            <View style={{ width: 36 }} />
          </View>
          <ScrollView contentContainerStyle={[styles.reviewScroll, { paddingBottom: bottomPad + 24 }]}>
            {questions.map((q, i) => {
              const opts = parseOptions(q.options);
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctOption;
              return (
                <View key={q.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewIdx}>Q{i + 1}</Text>
                    <View style={[styles.reviewResult, { backgroundColor: isCorrect ? Colors.successDim : Colors.destructiveDim }]}>
                      <Ionicons
                        name={isCorrect ? 'checkmark' : 'close'}
                        size={14}
                        color={isCorrect ? Colors.success : Colors.destructive}
                      />
                    </View>
                  </View>
                  <Text style={styles.reviewQuestion}>{q.questionText}</Text>
                  <View style={styles.reviewOptions}>
                    {Object.entries(opts).map(([key, val]) => {
                      const isUser = key === userAns;
                      const isRight = key === q.correctOption;
                      let bg = Colors.muted;
                      let border = Colors.border;
                      let textColor = Colors.secondaryForeground;
                      if (isRight) { bg = Colors.successDim; border = Colors.success; textColor = Colors.success; }
                      else if (isUser && !isRight) { bg = Colors.destructiveDim; border = Colors.destructive; textColor = Colors.destructive; }
                      return (
                        <View key={key} style={[styles.reviewOption, { backgroundColor: bg, borderColor: border }]}>
                          <Text style={[styles.reviewOptionKey, { color: textColor }]}>{key}</Text>
                          <Text style={[styles.reviewOptionVal, { color: textColor }]} numberOfLines={3}>{val}</Text>
                        </View>
                      );
                    })}
                  </View>
                  {q.explanation ? (
                    <View style={styles.explanationBox}>
                      <Ionicons name="bulb-outline" size={14} color={Colors.warning} />
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHero}>
            <View style={[styles.scoreCircleOuter, { borderColor: color }]}>
              <View style={[styles.scoreCircleInner, { backgroundColor: `${color}15` }]}>
                <Text style={[styles.scoreGrade, { color }]}>{grade}</Text>
                <Text style={[styles.scorePct, { color }]}>{pct}%</Text>
              </View>
            </View>
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            <Text style={styles.resultSubtitle}>
              {pct >= 70 ? 'Excellent work!' : pct >= 50 ? 'Good effort, keep going!' : 'Keep practising, you\'ll get there!'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatBox icon="checkmark-circle" label="Correct" value={score} color={Colors.success} />
            <StatBox icon="close-circle" label="Wrong" value={total - score} color={Colors.destructive} />
            <StatBox icon="list" label="Total" value={total} color={Colors.primary} />
          </View>

          <TouchableOpacity style={styles.reviewBtn} onPress={() => setShowReview(true)} activeOpacity={0.7}>
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
            <Text style={styles.reviewBtnText}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.7}>
            <Text style={styles.doneBtnText}>Back to Quizzes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (!current) return null;

  const opts = parseOptions(current.options);
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
      </View>

      <View style={styles.quizNav}>
        <TouchableOpacity onPress={handleDone} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={styles.questionCounter}>
          {currentIdx + 1} <Text style={styles.questionCounterOf}>/ {questions.length}</Text>
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.questionText}>{current.questionText}</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <View style={styles.options}>
              {Object.entries(opts).map(([key, val]) => {
                let bgColor = Colors.card;
                let borderColor = Colors.border;
                let keyColor = Colors.mutedForeground;
                let textColor = Colors.foreground;

                if (submitted) {
                  if (key === current.correctOption) {
                    bgColor = Colors.successDim;
                    borderColor = Colors.success;
                    keyColor = Colors.success;
                    textColor = Colors.success;
                  } else if (key === selected && key !== current.correctOption) {
                    bgColor = Colors.destructiveDim;
                    borderColor = Colors.destructive;
                    keyColor = Colors.destructive;
                    textColor = Colors.destructive;
                  }
                } else if (key === selected) {
                  bgColor = Colors.primaryDim;
                  borderColor = Colors.primary;
                  keyColor = Colors.primary;
                  textColor = Colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => handleSelect(key)}
                    disabled={submitted}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionKey, { borderColor, backgroundColor: `${keyColor}20` }]}>
                      <Text style={[styles.optionKeyText, { color: keyColor }]}>{key}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{val}</Text>
                    {submitted && key === current.correctOption && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    )}
                    {submitted && key === selected && key !== current.correctOption && (
                      <Ionicons name="close-circle" size={20} color={Colors.destructive} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {submitted && current.explanation ? (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Ionicons name="bulb" size={16} color={Colors.warning} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationBody}>{current.explanation}</Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12 }]}>
        {!submitted ? (
          <TouchableOpacity
            style={[styles.actionBtn, !selected && styles.actionBtnDisabled]}
            onPress={handleSubmit}
            disabled={!selected}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>{isLast ? 'See Results' : 'Next Question'}</Text>
            <Ionicons name={isLast ? 'trophy' : 'arrow-forward'} size={18} color={Colors.primaryForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function StatBox({ icon, label, value, color }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.statBox, { borderColor: `${color}30` }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  progressBarBg: { height: 3, backgroundColor: Colors.muted, width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  quizNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  navTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  questionCounter: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.foreground },
  questionCounterOf: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  questionScroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  questionText: {
    fontSize: 17, fontFamily: 'Inter_500Medium', color: Colors.foreground,
    lineHeight: 26, marginBottom: 24,
  },
  options: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderRadius: Colors.radiusLg, padding: 14,
  },
  optionKey: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optionKeyText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  optionText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  explanationCard: {
    marginTop: 20, backgroundColor: Colors.warningDim, borderWidth: 1,
    borderColor: `${Colors.warning}40`, borderRadius: Colors.radiusLg, padding: 16,
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  explanationTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.warning },
  explanationBody: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.foreground, lineHeight: 20 },
  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Colors.radius, height: 52,
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.primaryForeground },
  // Result screen
  resultScroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32, alignItems: 'center' },
  resultHero: { alignItems: 'center', marginBottom: 36 },
  scoreCircleOuter: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  scoreCircleInner: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  scoreGrade: { fontSize: 40, fontFamily: 'Inter_700Bold' },
  scorePct: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: -4 },
  resultTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.foreground, marginBottom: 6 },
  resultSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderRadius: Colors.radiusLg,
    padding: 16, alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryDim,
    borderRadius: Colors.radius, height: 50, marginBottom: 12,
  },
  reviewBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  doneBtn: {
    width: '100%', backgroundColor: Colors.secondary, borderRadius: Colors.radius, height: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.secondaryForeground },
  // Review screen
  reviewScroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  reviewCard: {
    backgroundColor: Colors.card, borderRadius: Colors.radiusLg, borderWidth: 1,
    borderColor: Colors.border, padding: 16, gap: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewIdx: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground },
  reviewResult: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reviewQuestion: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.foreground, lineHeight: 20 },
  reviewOptions: { gap: 6 },
  reviewOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: Colors.radiusSm, paddingHorizontal: 10, paddingVertical: 8,
  },
  reviewOptionKey: { fontSize: 12, fontFamily: 'Inter_700Bold', width: 16 },
  reviewOptionVal: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },
  explanationBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.warningDim, borderRadius: Colors.radiusSm, padding: 10,
  },
  explanationText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.foreground, lineHeight: 17 },
});

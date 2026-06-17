import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

const SUBJECT_META: Record<string, {
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  topics: number;
}> = {
  GOV: { label: 'Government', description: 'Political systems, governance & civic education', icon: 'business', color: Colors.info, topics: 24 },
  CRS: { label: 'Chr. Religious Studies', description: 'Biblical teachings, church history & doctrine', icon: 'book', color: Colors.warning, topics: 20 },
  LIT: { label: 'Literature in English', description: 'Poetry, prose, drama & literary analysis', icon: 'library', color: Colors.success, topics: 22 },
  MAT: { label: 'Mathematics', description: 'Algebra, calculus, statistics & more', icon: 'calculator', color: Colors.primary, topics: 30 },
  PHY: { label: 'Physics', description: 'Mechanics, waves, electricity & modern physics', icon: 'flash', color: Colors.info, topics: 28 },
  CHE: { label: 'Chemistry', description: 'Organic, inorganic & physical chemistry', icon: 'flask', color: '#a78bfa', topics: 26 },
  BIO: { label: 'Biology', description: 'Cell biology, genetics, ecology & evolution', icon: 'leaf', color: Colors.success, topics: 27 },
  ECO: { label: 'Economics', description: 'Micro, macro, international & development econ', icon: 'trending-up', color: Colors.warning, topics: 22 },
  ACC: { label: 'Accounting', description: 'Financial reporting, cost & management accounting', icon: 'cash', color: Colors.primary, topics: 20 },
  ENG: { label: 'Use of English', description: 'Grammar, comprehension & effective communication', icon: 'pencil', color: Colors.info, topics: 18 },
};

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return ['GOV', 'CRS', 'LIT'];
}

export default function SubjectsScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const subjectList = getSubjectList(profile?.subjects);

  async function handleStudy(code: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.root}>
      <View style={[styles.headerBar, { paddingTop: topPad + 16 }]}>
        <Text style={styles.pageTitle}>Subjects</Text>
        <Text style={styles.pageSubtitle}>{subjectList.length} subjects enrolled</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {subjectList.map((code) => {
          const meta = SUBJECT_META[code.toUpperCase()] ?? {
            label: code,
            description: 'Study materials for this subject',
            icon: 'school' as const,
            color: Colors.primary,
            topics: 0,
          };
          return (
            <View key={code} style={styles.subjectCard}>
              <View style={[styles.iconBox, { backgroundColor: `${meta.color}20` }]}>
                <Ionicons name={meta.icon} size={26} color={meta.color} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.subjectCode}>{code}</Text>
                <Text style={styles.subjectLabel}>{meta.label}</Text>
                <Text style={styles.subjectDesc} numberOfLines={2}>{meta.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.topicsBadge}>
                    <Ionicons name="layers-outline" size={12} color={Colors.mutedForeground} />
                    <Text style={styles.topicsText}>{meta.topics} topics</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.studyBtn, { borderColor: meta.color }]}
                    onPress={() => handleStudy(code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.studyBtnText, { color: meta.color }]}>Study</Text>
                    <Ionicons name="arrow-forward" size={14} color={meta.color} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {subjectList.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No subjects found</Text>
            <Text style={styles.emptyDesc}>Your enrolled subjects will appear here once your profile is set up.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerBar: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
  scroll: { padding: 20, gap: 14, paddingBottom: 32 },
  subjectCard: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Colors.radiusLg,
    borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 14,
  },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1 },
  subjectCode: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, letterSpacing: 0.5, marginBottom: 2 },
  subjectLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 4 },
  subjectDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topicsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topicsText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground },
  studyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: Colors.radiusSm, paddingHorizontal: 12, paddingVertical: 6,
  },
  studyBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
});

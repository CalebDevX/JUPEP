import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

const SUBJECT_META: Record<string, { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  GOV: { label: 'Government', icon: 'business', color: Colors.info },
  CRS: { label: 'Chr. Religious Studies', icon: 'book', color: Colors.warning },
  LIT: { label: 'Literature', icon: 'library', color: Colors.success },
  MAT: { label: 'Mathematics', icon: 'calculator', color: Colors.primary },
  PHY: { label: 'Physics', icon: 'flash', color: Colors.info },
  CHE: { label: 'Chemistry', icon: 'flask', color: Colors.success },
  BIO: { label: 'Biology', icon: 'leaf', color: Colors.success },
  ECO: { label: 'Economics', icon: 'trending-up', color: Colors.warning },
  ACC: { label: 'Accounting', icon: 'cash', color: Colors.primary },
  ENG: { label: 'English', icon: 'pencil', color: Colors.info },
};

function getSubjectMeta(code: string) {
  return SUBJECT_META[code.toUpperCase()] ?? {
    label: code,
    icon: 'school' as const,
    color: Colors.primary,
  };
}

function getSubjectList(subjects: any): string[] {
  if (Array.isArray(subjects)) return subjects as string[];
  if (subjects && typeof subjects === 'object') return Object.keys(subjects);
  if (typeof subjects === 'string') {
    try { return JSON.parse(subjects); } catch { return [subjects]; }
  }
  return [];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const subjectList = getSubjectList(profile?.subjects);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{profile?.firstName ?? 'Student'}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      {profile?.paymentStatus === 'active' || profile?.paymentStatus === 'paid' ? null : (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.warningText}>Subscription inactive — some features may be limited</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <StatCard icon="star" label="XP Points" value="0" color={Colors.primary} />
        <StatCard icon="flame" label="Day Streak" value="1" color={Colors.warning} />
        <StatCard icon="book" label="Subjects" value={String(subjectList.length)} color={Colors.info} />
      </View>

      <Text style={styles.sectionTitle}>Your Subjects</Text>
      {subjectList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={32} color={Colors.mutedForeground} />
          <Text style={styles.emptyText}>No subjects found in your profile</Text>
        </View>
      ) : (
        <View style={styles.subjectGrid}>
          {subjectList.map((code) => {
            const meta = getSubjectMeta(code);
            return (
              <TouchableOpacity
                key={code}
                style={styles.subjectCard}
                onPress={() => router.push('/(tabs)/subjects')}
                activeOpacity={0.7}
              >
                <View style={[styles.subjectIcon, { backgroundColor: `${meta.color}20` }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <Text style={styles.subjectCode}>{code}</Text>
                <Text style={styles.subjectLabel} numberOfLines={2}>{meta.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/quiz')} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primaryDim }]}>
            <Ionicons name="help-circle" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Start Quiz</Text>
          <Text style={styles.actionSub}>Past questions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/subjects')} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.infoDim }]}>
            <Ionicons name="library" size={24} color={Colors.info} />
          </View>
          <Text style={styles.actionLabel}>Study Notes</Text>
          <Text style={styles.actionSub}>Textbook content</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground },
  name: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.3 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warningDim, borderWidth: 1, borderColor: `${Colors.warning}40`,
    borderRadius: Colors.radius, padding: 12, marginBottom: 20,
  },
  warningText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.warning, flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: Colors.card, borderWidth: 1,
    borderRadius: Colors.radius, padding: 14, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.foreground },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.mutedForeground, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, marginBottom: 14 },
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: Colors.radius, borderWidth: 1,
    borderColor: Colors.border, padding: 32, alignItems: 'center', gap: 10, marginBottom: 24,
  },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  subjectCard: {
    width: '47%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Colors.radiusLg, padding: 16,
  },
  subjectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  subjectCode: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, marginBottom: 2 },
  subjectLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.foreground, lineHeight: 19 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Colors.radiusLg, padding: 18,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.foreground },
  actionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2 },
});

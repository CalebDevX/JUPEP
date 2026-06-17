import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatExpiry(date: string | null | undefined): string {
  if (!date) return 'No expiry info';
  const d = new Date(date);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusColor(status?: string): string {
  if (status === 'active' || status === 'paid') return Colors.success;
  if (status === 'expired') return Colors.destructive;
  return Colors.mutedForeground;
}

function getStatusLabel(status?: string): string {
  if (status === 'active' || status === 'paid') return 'Active';
  if (status === 'expired') return 'Expired';
  return 'Inactive';
}

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const statusColor = getStatusColor(profile?.paymentStatus);

  async function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          },
        },
      ]
    );
  }

  if (!profile) return null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getInitials(profile.fullName)}</Text>
        </View>
        <Text style={styles.profileName}>{profile.fullName}</Text>
        <Text style={styles.profilePhone}>{profile.phone}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}40` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(profile.paymentStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <InfoRow icon="person-outline" label="Full Name" value={profile.fullName} />
        <InfoRow icon="call-outline" label="Phone" value={profile.phone} />
        {profile.email && <InfoRow icon="mail-outline" label="Email" value={profile.email} />}
        {profile.accessCode && <InfoRow icon="key-outline" label="Access Code" value={profile.accessCode} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Goals</Text>
        {profile.targetUniversity && (
          <InfoRow icon="school-outline" label="Target University" value={profile.targetUniversity} />
        )}
        <InfoRow icon="trophy-outline" label="Target Grade" value={profile.targetGrade || 'Not set'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <InfoRow
          icon="card-outline"
          label="Status"
          value={getStatusLabel(profile.paymentStatus)}
          valueColor={statusColor}
        />
        {profile.expiresAt && (
          <InfoRow icon="calendar-outline" label="Expires" value={formatExpiry(profile.expiresAt)} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={styles.menuRowLeft}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.mutedForeground} />
            <Text style={styles.menuLabel}>Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
          <View style={styles.menuRowLeft}>
            <Ionicons name="help-circle-outline" size={18} color={Colors.mutedForeground} />
            <Text style={styles.menuLabel}>Help &amp; Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={18} color={Colors.destructive} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>JUPEB Prep v1.0.0</Text>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={16} color={Colors.mutedForeground} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.4, marginBottom: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryDim,
    borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarInitials: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.primary },
  profileName: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.foreground, letterSpacing: -0.3 },
  profilePhone: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, marginTop: 2, marginBottom: 10 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  section: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Colors.radiusLg, marginBottom: 16, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.mutedForeground, letterSpacing: 0.6,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.secondaryForeground },
  infoValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.foreground, maxWidth: '55%', textAlign: 'right' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.foreground },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.destructiveDim, borderWidth: 1, borderColor: `${Colors.destructive}40`,
    borderRadius: Colors.radius, paddingVertical: 14, marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.destructive },
  version: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.mutedForeground, textAlign: 'center' },
});

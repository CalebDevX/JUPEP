import { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/colors';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatExpiry(date: string | null | undefined) {
  if (!date) return 'No expiry info';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

type RowProps = { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; valueColor?: string; C: AppColors; S: any };
function InfoRow({ icon, label, value, valueColor, C, S }: RowProps) {
  return (
    <View style={S.infoRow}>
      <View style={S.infoLeft}>
        <Ionicons name={icon} size={15} color={C.mutedForeground} />
        <Text style={S.infoLabel}>{label}</Text>
      </View>
      <Text style={[S.infoValue, valueColor ? { color: valueColor } : {}]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const botPad = Platform.OS === 'web' ? 0 : insets.bottom;
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);

  const statusColor = profile?.paymentStatus === 'active' || profile?.paymentStatus === 'paid'
    ? C.success : profile?.paymentStatus === 'expired' ? C.destructive : C.mutedForeground;
  const statusLabel = profile?.paymentStatus === 'active' || profile?.paymentStatus === 'paid'
    ? 'Active' : profile?.paymentStatus === 'expired' ? 'Expired' : 'Inactive';

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await logout();
      }},
    ]);
  }

  if (!profile) return null;

  return (
    <ScrollView
      style={S.root}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: botPad + 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={S.pageTitle}>Profile</Text>

      {/* Avatar */}
      <View style={S.avatarWrap}>
        <View style={S.avatar}>
          <Text style={S.avatarText}>{getInitials(profile.fullName)}</Text>
        </View>
        <Text style={S.profileName}>{profile.fullName}</Text>
        <Text style={S.profilePhone}>{profile.phone}</Text>
        <View style={[S.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}35` }]}>
          <View style={[S.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[S.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Sections */}
      {[
        {
          title: 'Account',
          rows: [
            { icon: 'person-outline' as const, label: 'Full Name', value: profile.fullName },
            { icon: 'call-outline' as const, label: 'Phone', value: profile.phone },
            ...(profile.email ? [{ icon: 'mail-outline' as const, label: 'Email', value: profile.email }] : []),
            ...(profile.accessCode ? [{ icon: 'key-outline' as const, label: 'Access Code', value: profile.accessCode }] : []),
          ],
        },
        {
          title: 'Academic Goals',
          rows: [
            ...(profile.targetUniversity ? [{ icon: 'school-outline' as const, label: 'Target University', value: profile.targetUniversity }] : []),
            { icon: 'trophy-outline' as const, label: 'Target Grade', value: profile.targetGrade || 'Not set' },
          ],
        },
        {
          title: 'Subscription',
          rows: [
            { icon: 'card-outline' as const, label: 'Status', value: statusLabel, valueColor: statusColor },
            ...(profile.expiresAt ? [{ icon: 'calendar-outline' as const, label: 'Expires', value: formatExpiry(profile.expiresAt) }] : []),
          ],
        },
      ].map(section => (
        <View key={section.title} style={S.card}>
          <Text style={S.cardTitle}>{section.title}</Text>
          {section.rows.map((row, i) => (
            <InfoRow key={i} {...row} C={C} S={S} />
          ))}
        </View>
      ))}

      <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={C.destructive} />
        <Text style={S.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={S.version}>JUPEB Prep v1.0.0</Text>
    </ScrollView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5, marginBottom: 24 },

    avatarWrap: { alignItems: 'center', marginBottom: 28 },
    avatar: {
      width: 76, height: 76, borderRadius: 38,
      backgroundColor: `${C.primary}18`, borderWidth: 2, borderColor: `${C.primary}35`,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    avatarText: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.primary },
    profileName: { fontSize: 20, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.3 },
    profilePhone: { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 2, marginBottom: 10 },
    statusBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

    card: {
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1, borderColor: C.border, marginBottom: 12, overflow: 'hidden',
    },
    cardTitle: {
      fontSize: 11, fontFamily: 'Inter_700Bold', color: C.mutedForeground,
      letterSpacing: 1, textTransform: 'uppercase',
      paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
    },
    infoRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 13,
      borderTopWidth: 1, borderTopColor: C.border,
    },
    infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    infoValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.foreground, maxWidth: '55%', textAlign: 'right' },

    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: C.destructiveDim, borderWidth: 1, borderColor: `${C.destructive}30`,
      borderRadius: C.radius, paddingVertical: 14, marginBottom: 20, marginTop: 8,
    },
    logoutText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.destructive },
    version: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center' },
  });
}

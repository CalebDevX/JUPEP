import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { setPin, removePin } from '@/src/utils/api';
import type { AppColors } from '@/constants/colors';

const PROFILE_KEY = 'jupeb_profile_v1';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatExpiry(date: string | null | undefined) {
  if (!date) return 'No expiry info';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  valueColor?: string;
  actionLabel?: string;
  actionColor?: string;
  onPress?: () => void;
  C: AppColors;
  S: any;
};
function InfoRow({ icon, label, value, valueColor, actionLabel, actionColor, onPress, C, S }: RowProps) {
  const inner = (
    <View style={S.infoRow}>
      <View style={S.infoLeft}>
        <Ionicons name={icon} size={15} color={C.mutedForeground} />
        <Text style={S.infoLabel}>{label}</Text>
      </View>
      {actionLabel ? (
        <Text style={[S.infoAction, actionColor ? { color: actionColor } : {}]}>{actionLabel}</Text>
      ) : (
        <Text style={[S.infoValue, valueColor ? { color: valueColor } : {}]} numberOfLines={1}>{value ?? ''}</Text>
      )}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>;
  }
  return inner;
}

// ── 6-dot PIN dots display ────────────────────────────────────────────────────
function PinDots({ value, accent }: { value: string; accent: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 16, height: 16, borderRadius: 8,
            backgroundColor: i < value.length ? accent : 'transparent',
            borderWidth: 2,
            borderColor: i < value.length ? accent : '#d1d5db',
          }}
        />
      ))}
    </View>
  );
}

// ── PIN step types ────────────────────────────────────────────────────────────
type PinModalMode = 'set' | 'change' | 'remove';
type PinStep = 'current' | 'new' | 'confirm';

function PinModal({
  visible,
  mode,
  onClose,
  onSuccess,
  phone,
  sessionToken,
  C,
}: {
  visible: boolean;
  mode: PinModalMode;
  onClose: () => void;
  onSuccess: (hadPin: boolean) => void;
  phone: string;
  sessionToken: string;
  C: AppColors;
}) {
  const [step, setStep]         = useState<PinStep>(mode === 'set' ? 'new' : 'current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin]     = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef<TextInput>(null);

  const accent = C.primary;

  const reset = useCallback(() => {
    setStep(mode === 'set' ? 'new' : 'current');
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setError(''); setLoading(false);
  }, [mode]);

  const handleClose = () => { reset(); onClose(); };

  const activePin = step === 'current' ? currentPin
    : step === 'new' ? newPin : confirmPin;
  const setActivePin = step === 'current' ? setCurrentPin
    : step === 'new' ? setNewPin : setConfirmPin;

  const stepTitle = mode === 'remove'
    ? 'Enter your current PIN to remove it'
    : step === 'current' ? 'Enter your current PIN'
    : step === 'new'     ? (mode === 'set' ? 'Choose a 6-digit PIN' : 'Choose a new PIN')
    :                      'Confirm your new PIN';

  const handleChange = async (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setActivePin(digits);
    setError('');
    if (digits.length < 6) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === 'remove') {
      await submit(digits, '', '');
      return;
    }
    if (step === 'current') { setStep('new'); setNewPin(''); setTimeout(() => inputRef.current?.focus(), 50); return; }
    if (step === 'new')     { setStep('confirm'); setConfirmPin(''); setTimeout(() => inputRef.current?.focus(), 50); return; }
    // confirm step
    if (digits !== newPin) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("PINs don't match. Try again.");
      setConfirmPin('');
      return;
    }
    await submit(mode === 'change' ? currentPin : '', digits, digits);
  };

  const submit = async (cur: string, np: string, _conf: string) => {
    setLoading(true); setError('');
    try {
      if (mode === 'remove') {
        await removePin(phone, sessionToken, cur || currentPin);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        reset(); onSuccess(true);
      } else {
        await setPin(phone, sessionToken, np, mode === 'change' ? cur : undefined);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        reset(); onSuccess(false);
      }
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || 'Something went wrong.');
      if (mode === 'remove' || step === 'current') { setCurrentPin(''); }
      else { setConfirmPin(''); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{
              backgroundColor: C.card,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: 24, paddingBottom: 40,
            }}>
              {/* Handle bar */}
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 }} />

              {/* Icon */}
              <View style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: `${accent}15`, borderWidth: 1, borderColor: `${accent}25`,
                alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12,
              }}>
                <Ionicons
                  name={mode === 'remove' ? 'lock-open-outline' : 'lock-closed-outline'}
                  size={22} color={accent}
                />
              </View>

              <Text style={{ fontSize: 17, fontFamily: 'Inter_700Bold', color: C.foreground, textAlign: 'center', marginBottom: 4 }}>
                {mode === 'set' ? 'Set PIN' : mode === 'change' ? 'Change PIN' : 'Remove PIN'}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center', marginBottom: 4 }}>
                {stepTitle}
              </Text>

              {/* Progress dots for multi-step */}
              {mode !== 'remove' && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                  {(mode === 'change' ? ['current','new','confirm'] as PinStep[] : ['new','confirm'] as PinStep[]).map((s) => (
                    <View key={s} style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: s === step ? accent : C.border,
                    }} />
                  ))}
                </View>
              )}

              {/* PIN dots */}
              <PinDots value={activePin} accent={accent} />

              {/* Hidden input that captures keystrokes */}
              <TextInput
                ref={inputRef}
                value={activePin}
                onChangeText={handleChange}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                editable={!loading}
              />

              {/* Error */}
              {error ? (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 7,
                  backgroundColor: `${C.destructive}12`, borderRadius: 10,
                  borderWidth: 1, borderColor: `${C.destructive}25`,
                  padding: 12, marginBottom: 14,
                }}>
                  <Ionicons name="alert-circle-outline" size={15} color={C.destructive} />
                  <Text style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', color: C.destructive }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Loading */}
              {loading && (
                <View style={{ alignItems: 'center', marginBottom: 14 }}>
                  <ActivityIndicator color={accent} />
                </View>
              )}

              {/* Hint */}
              <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center' }}>
                {loading ? 'Saving…' : `Tap the number pad and enter ${6 - activePin.length} more digit${6 - activePin.length === 1 ? '' : 's'}`}
              </Text>

              <TouchableOpacity onPress={handleClose} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main profile screen ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const botPad = Platform.OS === 'web' ? 0 : insets.bottom;
  const C = useTheme();
  const S = useMemo(() => makeStyles(C), [C]);

  const [pinModal, setPinModal]   = useState<PinModalMode | null>(null);
  const [hasPin, setHasPin]       = useState<boolean>(profile?.hasPin ?? false);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

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

  async function handlePinSuccess(wasRemoving: boolean) {
    const newHasPin = !wasRemoving;
    setHasPin(newHasPin);
    setPinModal(null);
    setPinSuccess(
      wasRemoving ? 'PIN removed successfully.'
      : hasPin   ? 'PIN changed successfully.'
      :             'PIN set successfully. You\'ll need it next time you log in.'
    );
    // Update stored profile
    try {
      const raw = await SecureStore.getItemAsync(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        p.hasPin = newHasPin;
        await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(p));
      }
    } catch {}
    setTimeout(() => setPinSuccess(null), 4000);
  }

  if (!profile) return null;

  const phone = profile.phone;
  const sessionToken = profile.sessionToken ?? '';

  return (
    <ScrollView
      style={S.root}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: botPad + 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={S.pageTitle}>Profile</Text>

      {/* PIN success toast */}
      {pinSuccess && (
        <View style={S.successToast}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#16a34a" />
          <Text style={S.successToastText}>{pinSuccess}</Text>
        </View>
      )}

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

      {/* Account info */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Account</Text>
        <InfoRow icon="person-outline" label="Full Name" value={profile.fullName} C={C} S={S} />
        <InfoRow icon="call-outline" label="Phone" value={profile.phone} C={C} S={S} />
        {profile.email && <InfoRow icon="mail-outline" label="Email" value={profile.email} C={C} S={S} />}
        {profile.accessCode && <InfoRow icon="key-outline" label="Access Code" value={profile.accessCode} C={C} S={S} />}
      </View>

      {/* Security — PIN */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Security</Text>
        <InfoRow
          icon="lock-closed-outline"
          label="Login PIN"
          actionLabel={hasPin ? 'Change PIN →' : 'Set PIN →'}
          actionColor={C.primary}
          onPress={() => { Haptics.selectionAsync(); setPinModal(hasPin ? 'change' : 'set'); }}
          C={C} S={S}
        />
        {hasPin && (
          <InfoRow
            icon="lock-open-outline"
            label="Remove PIN"
            actionLabel="Remove →"
            actionColor={C.destructive}
            onPress={() => { Haptics.selectionAsync(); setPinModal('remove'); }}
            C={C} S={S}
          />
        )}
        <View style={S.pinHint}>
          <Ionicons name="information-circle-outline" size={13} color={C.mutedForeground} />
          <Text style={S.pinHintText}>
            {hasPin
              ? 'A 6-digit PIN is required each time you sign in.'
              : 'Set a PIN for extra security when signing in.'}
          </Text>
        </View>
      </View>

      {/* Academic Goals */}
      {(profile.targetUniversity || profile.targetGrade) && (
        <View style={S.card}>
          <Text style={S.cardTitle}>Academic Goals</Text>
          {profile.targetUniversity && (
            <InfoRow icon="school-outline" label="Target University" value={profile.targetUniversity} C={C} S={S} />
          )}
          <InfoRow icon="trophy-outline" label="Target Grade" value={profile.targetGrade || 'Not set'} C={C} S={S} />
        </View>
      )}

      {/* Subscription */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Subscription</Text>
        <InfoRow icon="card-outline" label="Status" value={statusLabel} valueColor={statusColor} C={C} S={S} />
        {profile.expiresAt && (
          <InfoRow icon="calendar-outline" label="Expires" value={formatExpiry(profile.expiresAt)} C={C} S={S} />
        )}
      </View>

      <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={C.destructive} />
        <Text style={S.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={S.version}>JUPEB Prep v1.0.0</Text>

      {/* PIN Modal */}
      {pinModal && (
        <PinModal
          visible
          mode={pinModal}
          onClose={() => setPinModal(null)}
          onSuccess={handlePinSuccess}
          phone={phone}
          sessionToken={sessionToken}
          C={C}
        />
      )}
    </ScrollView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    pageTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5, marginBottom: 16 },

    successToast: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#dcfce7', borderRadius: 10,
      borderWidth: 1, borderColor: '#bbf7d0',
      padding: 12, marginBottom: 16,
    },
    successToastText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', color: '#15803d' },

    avatarWrap: { alignItems: 'center', marginBottom: 24 },
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
    infoAction: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.primary },

    pinHint: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 7,
      paddingHorizontal: 16, paddingVertical: 11,
      borderTopWidth: 1, borderTopColor: C.border,
      backgroundColor: C.muted,
    },
    pinHintText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 17 },

    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: C.destructiveDim, borderWidth: 1, borderColor: `${C.destructive}30`,
      borderRadius: C.radius, paddingVertical: 14, marginBottom: 20, marginTop: 8,
    },
    logoutText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: C.destructive },
    version: { fontSize: 11, fontFamily: 'Inter_400Regular', color: C.mutedForeground, textAlign: 'center' },
  });
}

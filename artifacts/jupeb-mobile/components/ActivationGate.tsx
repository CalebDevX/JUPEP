import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Platform, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { initiatePayment, verifyPayment, getPaymentConfig } from '@/src/utils/api';
import type { AppColors } from '@/constants/colors';

const PENDING_REF_KEY = 'jupeb_pending_payment_ref';

type Tab = 'code' | 'pay';

interface Props {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function ActivationGate({ visible, onClose, featureName }: Props) {
  const { profile, activateCode, refreshProfile } = useAuth();
  const C      = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [tab, setTab]         = useState<Tab>('code');
  const [code, setCode]       = useState('');
  const [codeLoading, setCodeLoading]   = useState(false);
  const [codeError, setCodeError]       = useState('');

  const [payConfig, setPayConfig]         = useState<{ price: number; configured: boolean; sessionEnd: string } | null>(null);
  const [payLoading, setPayLoading]       = useState(false);
  const [payError, setPayError]           = useState('');
  const [pendingRef, setPendingRef]       = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      getPaymentConfig().then(cfg => setPayConfig(cfg)).catch(() => {});
      AsyncStorage.getItem(PENDING_REF_KEY).then(ref => { if (ref) setPendingRef(ref); }).catch(() => {});
    }
  }, [visible]);

  const handleActivateCode = useCallback(async () => {
    if (!code.trim()) { setCodeError('Please enter your access code.'); return; }
    setCodeError('');
    setCodeLoading(true);
    try {
      await activateCode(code.trim().toUpperCase());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (err: any) {
      setCodeError(err.message || 'Invalid access code. Please check and try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCodeLoading(false);
    }
  }, [code, activateCode, onClose]);

  const handlePayNow = useCallback(async () => {
    if (!profile) return;
    setPayError('');
    setPayLoading(true);
    try {
      const { authorizationUrl, reference } = await initiatePayment(profile.phone, profile.email || undefined);
      await AsyncStorage.setItem(PENDING_REF_KEY, reference);
      setPendingRef(reference);
      await Linking.openURL(authorizationUrl);
    } catch (err: any) {
      setPayError(err.message || 'Could not start payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
  }, [profile]);

  const handleVerifyPayment = useCallback(async () => {
    if (!pendingRef) return;
    setVerifyLoading(true);
    setPayError('');
    try {
      const result = await verifyPayment(pendingRef);
      if (result.success) {
        await refreshProfile({ paymentStatus: 'paid', sessionActive: true, isActivated: true, expiresAt: result.expiresAt || null });
        await AsyncStorage.removeItem(PENDING_REF_KEY);
        setPendingRef('');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
      }
    } catch (err: any) {
      setPayError(err.message || 'Payment not confirmed yet. If you just paid, please wait a moment and try again.');
    } finally {
      setVerifyLoading(false);
    }
  }, [pendingRef, refreshProfile, onClose]);

  const priceNaira = payConfig ? (payConfig.price / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 }) : '…';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.lockBox}>
            <Ionicons name="lock-closed" size={22} color="#f97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Activate Your Account</Text>
            <Text style={styles.headerSub}>
              {featureName
                ? `${featureName} requires activation.`
                : 'Get full access to notes, AI tutor & more.'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={C.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'code' && styles.tabActive]}
            onPress={() => setTab('code')}
            activeOpacity={0.8}
          >
            <Ionicons name="key-outline" size={15} color={tab === 'code' ? '#f97316' : C.mutedForeground} />
            <Text style={[styles.tabText, tab === 'code' && styles.tabTextActive]}>Access Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'pay' && styles.tabActive]}
            onPress={() => setTab('pay')}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={15} color={tab === 'pay' ? '#f97316' : C.mutedForeground} />
            <Text style={[styles.tabText, tab === 'pay' && styles.tabTextActive]}>Pay Now</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── CODE TAB ── */}
          {tab === 'code' && (
            <View style={styles.tabContent}>
              <Text style={styles.bodyTitle}>Enter your access code</Text>
              <Text style={styles.bodySub}>
                Got a code from your school or teacher? Enter it below to unlock full access.
              </Text>

              <View style={[styles.inputRow, codeError ? { borderColor: '#ef4444' } : {}]}>
                <Ionicons name="key-outline" size={18} color={C.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. JUPEB-ABC123"
                  placeholderTextColor={C.mutedForeground}
                  autoCapitalize="characters"
                  value={code}
                  onChangeText={t => { setCode(t); setCodeError(''); }}
                  editable={!codeLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleActivateCode}
                />
              </View>

              {!!codeError && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{codeError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, codeLoading && { opacity: 0.65 }]}
                onPress={handleActivateCode}
                disabled={codeLoading}
                activeOpacity={0.85}
              >
                {codeLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Activate</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* ── PAY TAB ── */}
          {tab === 'pay' && (
            <View style={styles.tabContent}>
              <Text style={styles.bodyTitle}>Get full access</Text>
              <Text style={styles.bodySub}>
                One-time payment for the entire JUPEB session.
              </Text>

              {/* Price card */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₦</Text>
                  <Text style={styles.priceAmount}>{priceNaira}</Text>
                </View>
                <Text style={styles.priceSub}>One-time · Full session access</Text>

                <View style={styles.featureList}>
                  {[
                    'All study notes (CRS, GOV, LIT)',
                    'AI Tutor — ask any question',
                    'Full quiz bank',
                    'Offline reading',
                  ].map(f => (
                    <View key={f} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {!!payError && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{payError}</Text>
                </View>
              )}

              {!payConfig?.configured && (
                <View style={styles.warningRow}>
                  <Ionicons name="information-circle-outline" size={16} color="#d97706" />
                  <Text style={styles.warningText}>Online payment is not set up yet. Please use an access code or contact your administrator.</Text>
                </View>
              )}

              {/* Pay button */}
              <TouchableOpacity
                style={[styles.btn, (!payConfig?.configured || payLoading) && { opacity: 0.6 }]}
                onPress={handlePayNow}
                disabled={!payConfig?.configured || payLoading}
                activeOpacity={0.85}
              >
                {payLoading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                      <Text style={styles.btnText}>Pay with Paystack</Text>
                    </>
                }
              </TouchableOpacity>

              {/* Verify pending payment */}
              {!!pendingRef && (
                <TouchableOpacity
                  style={[styles.verifyBtn, verifyLoading && { opacity: 0.65 }]}
                  onPress={handleVerifyPayment}
                  disabled={verifyLoading}
                  activeOpacity={0.85}
                >
                  {verifyLoading
                    ? <ActivityIndicator color="#f97316" size="small" />
                    : <>
                        <Ionicons name="refresh-outline" size={16} color="#f97316" />
                        <Text style={styles.verifyBtnText}>I've paid — verify my payment</Text>
                      </>
                  }
                </TouchableOpacity>
              )}

              <Text style={styles.secureNote}>
                Secured by Paystack · Your payment info is never stored on this app
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: C.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: '90%',
      shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.18, shadowRadius: 16, elevation: 20,
    },
    handle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: C.border,
      alignSelf: 'center', marginTop: 12, marginBottom: 8,
    },

    header: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    lockBox: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
      alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.foreground },
    headerSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 1 },
    closeBtn:    { padding: 4 },

    tabs: {
      flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border,
      paddingHorizontal: 20, gap: 4,
    },
    tab: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 13,
      borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabActive:     { borderBottomColor: '#f97316' },
    tabText:       { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground },
    tabTextActive: { color: '#f97316' },

    body:       { paddingHorizontal: 20, paddingTop: 20 },
    tabContent: { gap: 14 },

    bodyTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: C.foreground },
    bodySub:   { fontSize: 13, fontFamily: 'Inter_400Regular', color: C.mutedForeground, lineHeight: 19 },

    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: C.border,
      borderRadius: C.radius, paddingHorizontal: 14, height: 52,
      backgroundColor: C.card,
    },
    input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: C.foreground },

    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    errorText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444' },

    warningRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      backgroundColor: '#fffbeb', borderRadius: 10, borderWidth: 1, borderColor: '#fde68a',
      padding: 12,
    },
    warningText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#92400e', lineHeight: 17 },

    btn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f97316', borderRadius: C.radius,
      height: 52, gap: 8,
    },
    btnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },

    verifyBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, borderRadius: C.radius, borderWidth: 1.5, borderColor: '#f97316',
      height: 46, backgroundColor: '#fff7ed',
    },
    verifyBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f97316' },

    secureNote: {
      fontSize: 11, fontFamily: 'Inter_400Regular',
      color: C.mutedForeground, textAlign: 'center', marginTop: -4,
    },

    // Price card
    priceCard: {
      backgroundColor: C.card, borderRadius: C.radiusLg,
      borderWidth: 1.5, borderColor: '#fed7aa',
      padding: 18, gap: 8,
    },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
    currency:    { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#f97316', marginBottom: 4 },
    priceAmount: { fontSize: 36, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -1 },
    priceSub:    { fontSize: 12, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    featureList: { gap: 8, marginTop: 6 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.foreground },
  });
}

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/colors';

type Step = 'phone' | 'pin';

export default function LoginScreen() {
  const [step, setStep]         = useState<Step>('phone');
  const [phone, setPhone]       = useState('');
  const [pin, setPin]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [shake]                 = useState(new Animated.Value(0));
  const pinInputRef             = useRef<TextInput>(null);
  const { loginPhone, loginPin } = useAuth();
  const insets                  = useSafeAreaInsets();
  const C                       = useTheme();
  const styles                  = useMemo(() => makeStyles(C), [C]);

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const botPad = Platform.OS === 'web' ? 0 : insets.bottom;

  useEffect(() => {
    if (step === 'pin') {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [step]);

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,   duration: 40, useNativeDriver: true }),
    ]).start();
  }

  async function handlePhoneSubmit() {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const needsPin = await loginPhone(cleaned);
      if (needsPin) {
        setStep('pin');
      }
      // If no PIN, loginPhone already completed login → app nav handled by AuthContext
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', err.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePinChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setPin(digits);
    if (digits.length === 6) {
      await submitPin(digits);
    }
  }

  async function submitPin(digits: string) {
    try {
      setLoading(true);
      await loginPin(phone.replace(/\s/g, ''), digits);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setPin('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      Alert.alert('Wrong PIN', err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 48, paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand mark */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>J</Text>
          </View>
          <Text style={styles.appName}>JUPEB Prep</Text>
          <Text style={styles.tagline}>Study smarter. Pass better.</Text>
        </View>

        {/* ── STEP: PHONE ── */}
        {step === 'phone' && (
          <View style={styles.form}>
            <Text style={styles.formLabel}>Phone number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={18} color={C.mutedForeground} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="08012345678"
                placeholderTextColor={C.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                returnKeyType="done"
                onSubmitEditing={handlePhoneSubmit}
                editable={!loading}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.6 }]}
              onPress={handlePhoneSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={C.primaryForeground} />
              ) : (
                <>
                  <Text style={styles.btnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.primaryForeground} />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>For registered JUPEB students only</Text>
          </View>
        )}

        {/* ── STEP: PIN ── */}
        {step === 'pin' && (
          <View style={styles.form}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('phone'); setPin(''); }}>
              <Ionicons name="arrow-back" size={16} color={C.mutedForeground} />
              <Text style={styles.backText}>Change number</Text>
            </TouchableOpacity>

            <Text style={styles.pinHeading}>Enter your PIN</Text>
            <Text style={styles.pinSubtext}>6-digit PIN for {phone}</Text>

            {/* 6 dot indicators */}
            <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < pin.length
                      ? { backgroundColor: C.primary, borderColor: C.primary }
                      : { backgroundColor: 'transparent', borderColor: C.border },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Hidden input that captures keystrokes */}
            <TextInput
              ref={pinInputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={6}
              value={pin}
              onChangeText={handlePinChange}
              editable={!loading}
              caretHidden
              secureTextEntry
            />

            {/* Tap anywhere label */}
            <TouchableOpacity onPress={() => pinInputRef.current?.focus()} style={styles.tapHint}>
              {loading
                ? <ActivityIndicator color={C.primary} size="small" />
                : <Text style={styles.tapHintText}>Tap here to open keyboard</Text>
              }
            </TouchableOpacity>

            <Text style={styles.note}>Set up your PIN from the Profile tab after login</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    scroll: { flexGrow: 1, paddingHorizontal: 28, justifyContent: 'center', minHeight: '100%' },

    brand: { alignItems: 'center', marginBottom: 52 },
    logoBox: {
      width: 64, height: 64, borderRadius: 18,
      backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    logoLetter: { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#ffffff' },
    appName: { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5 },
    tagline: { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 4 },

    form: { gap: 12 },
    formLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground, marginBottom: 2 },
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: C.border,
      borderRadius: C.radius, paddingHorizontal: 14,
      height: 54, backgroundColor: C.card,
    },
    input: {
      flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular',
      color: C.foreground, height: '100%',
    },
    btn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.primary, borderRadius: C.radius,
      height: 54, gap: 8, marginTop: 4,
    },
    btnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.primaryForeground },
    note: {
      fontSize: 12, fontFamily: 'Inter_400Regular',
      color: C.mutedForeground, textAlign: 'center', marginTop: 8,
    },

    // PIN step
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    backText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    pinHeading: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.3 },
    pinSubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 2 },
    dotsRow: {
      flexDirection: 'row', justifyContent: 'center', gap: 14,
      marginTop: 28, marginBottom: 24,
    },
    dot: {
      width: 18, height: 18, borderRadius: 9,
      borderWidth: 2,
    },
    hiddenInput: {
      position: 'absolute', opacity: 0, height: 0, width: 0,
    },
    tapHint: {
      alignItems: 'center', paddingVertical: 14,
      borderWidth: 1.5, borderColor: C.border, borderRadius: C.radius,
      borderStyle: 'dashed', backgroundColor: C.card,
    },
    tapHintText: {
      fontSize: 13, fontFamily: 'Inter_500Medium', color: C.mutedForeground,
    },
  });
}

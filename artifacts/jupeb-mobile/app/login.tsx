import { useState, useMemo, useRef, useCallback } from 'react';
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

type Mode = 'login' | 'register';
type LoginStep = 'creds' | 'pin';

const SUBJECTS = [
  { key: 'CRS001', label: 'Christian Religious Studies', short: 'CRS' },
  { key: 'GOV001', label: 'Government',                  short: 'GOV' },
  { key: 'LIT001', label: 'Literature in English',       short: 'LIT' },
  { key: 'MTH001', label: 'Mathematics',                 short: 'MTH' },
  { key: 'BIO001', label: 'Biology',                     short: 'BIO' },
  { key: 'CHM001', label: 'Chemistry',                   short: 'CHM' },
  { key: 'PHY001', label: 'Physics',                     short: 'PHY' },
  { key: 'ECO001', label: 'Economics',                   short: 'ECO' },
  { key: 'ACC001', label: 'Accounting',                  short: 'ACC' },
];

export default function LoginScreen() {
  const [mode, setMode]           = useState<Mode>('login');
  const [step, setStep]           = useState<LoginStep>('creds');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName]   = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode]   = useState(false);
  const [subjects, setSubjects]   = useState<string[]>([]);
  const [pin, setPin]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [shake]                   = useState(new Animated.Value(0));
  const pinInputRef               = useRef<TextInput>(null);

  const { loginWithPass, loginPhone, loginPin, register } = useAuth();
  const insets = useSafeAreaInsets();
  const C      = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const botPad = Platform.OS === 'web' ? 0 : insets.bottom;

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,   duration: 40, useNativeDriver: true }),
    ]).start();
  }

  function toggleSubject(key: string) {
    setSubjects(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  }

  async function handleLogin() {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (password.trim()) {
        // Try password login first
        try {
          await loginWithPass(cleanPhone, password.trim());
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        } catch (err: any) {
          if (err.message?.includes('Incorrect password') || err.message?.includes('No account')) {
            triggerShake();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Login failed', err.message);
            return;
          }
          // Fall through to PIN path
        }
      }

      // No password entered OR password login hit a non-credential error — try phone/PIN path
      const needsPin = await loginPhone(cleanPhone);
      if (needsPin) {
        setStep('pin');
        setTimeout(() => pinInputRef.current?.focus(), 100);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      if (err.requiresPassword === true || err.message === 'PASSWORD_REQUIRED') {
        Alert.alert('Password required', 'This account is protected. Please enter your password above.');
      } else {
        triggerShake();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Login failed', err.message || 'Could not sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePinChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setPin(digits);
    if (digits.length === 6) await submitPin(digits);
  }

  async function submitPin(digits: string) {
    try {
      setLoading(true);
      await loginPin(phone.replace(/\s/g, ''), digits);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setPin('');
      triggerShake();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Wrong PIN', err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password.trim() !== confirmPass.trim()) {
      triggerShake();
      Alert.alert('Passwords don\'t match', 'Please make sure both password fields are the same.');
      return;
    }
    if (subjects.length === 0) {
      Alert.alert('Select subjects', 'Please choose at least one subject.');
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await register(
        fullName.trim(),
        cleanPhone,
        password.trim(),
        subjects,
        accessCode.trim() || undefined,
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      triggerShake();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setStep('creds');
    setPin('');
    setPassword('');
    setConfirmPass('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 40, paddingBottom: botPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>J</Text>
          </View>
          <Text style={styles.appName}>JUPEB Prep</Text>
          <Text style={styles.tagline}>Study smarter. Pass better.</Text>
        </View>

        {/* Mode tabs */}
        {step === 'creds' && (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => switchMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => switchMode('register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PIN step (legacy) ── */}
        {step === 'pin' && (
          <Animated.View style={[styles.form, { transform: [{ translateX: shake }] }]}>
            <TouchableOpacity style={styles.backLink} onPress={() => { setStep('creds'); setPin(''); }}>
              <Ionicons name="arrow-back" size={16} color={C.mutedForeground} />
              <Text style={styles.backLinkText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Enter your PIN</Text>
            <Text style={styles.sectionSub}>6-digit PIN for {phone}</Text>
            <View style={styles.dotsRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={[
                  styles.dot,
                  i < pin.length
                    ? { backgroundColor: C.primary, borderColor: C.primary }
                    : { backgroundColor: 'transparent', borderColor: C.border },
                ]} />
              ))}
            </View>
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
            <TouchableOpacity onPress={() => pinInputRef.current?.focus()} style={styles.tapHint}>
              {loading
                ? <ActivityIndicator color={C.primary} size="small" />
                : <Text style={styles.tapHintText}>Tap here to open keyboard</Text>
              }
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── LOGIN form ── */}
        {step === 'creds' && mode === 'login' && (
          <Animated.View style={[styles.form, { transform: [{ translateX: shake }] }]}>
            <Field label="Phone number" icon="call-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="08012345678"
                placeholderTextColor={C.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
                autoFocus
              />
            </Field>

            <Field label="Password" icon="lock-closed-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="Your password"
                placeholderTextColor={C.mutedForeground}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.mutedForeground} />
              </TouchableOpacity>
            </Field>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.btnText}>Sign In</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
              }
            </TouchableOpacity>

            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchLink} onPress={() => switchMode('register')}>Register here</Text>
            </Text>
          </Animated.View>
        )}

        {/* ── REGISTER form ── */}
        {step === 'creds' && mode === 'register' && (
          <Animated.View style={[styles.form, { transform: [{ translateX: shake }] }]}>
            <Field label="Full name" icon="person-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Adaeze Okonkwo"
                placeholderTextColor={C.mutedForeground}
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
                autoCapitalize="words"
                autoFocus
              />
            </Field>

            <Field label="Phone number" icon="call-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="08012345678"
                placeholderTextColor={C.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
            </Field>

            <Field label="Password" icon="lock-closed-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="Min. 6 characters"
                placeholderTextColor={C.mutedForeground}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.mutedForeground} />
              </TouchableOpacity>
            </Field>

            <Field label="Confirm password" icon="checkmark-circle-outline">
              <TextInput
                style={styles.fieldInput}
                placeholder="Repeat password"
                placeholderTextColor={C.mutedForeground}
                secureTextEntry={!showConfirm}
                value={confirmPass}
                onChangeText={setConfirmPass}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.mutedForeground} />
              </TouchableOpacity>
            </Field>

            {/* Subjects */}
            <View style={styles.subjectSection}>
              <Text style={styles.subjectLabel}>Subjects <Text style={styles.subjectRequired}>*</Text></Text>
              <View style={styles.subjectGrid}>
                {SUBJECTS.map(s => {
                  const sel = subjects.includes(s.key);
                  return (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.chip, sel && styles.chipSelected]}
                      onPress={() => toggleSubject(s.key)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{s.short}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Optional access code */}
            <TouchableOpacity
              style={styles.codeToggle}
              onPress={() => setShowCode(v => !v)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showCode ? 'chevron-up' : 'chevron-down'}
                size={14} color={C.primary}
              />
              <Text style={styles.codeToggleText}>
                {showCode ? 'Hide access code' : 'I have an access code (optional)'}
              </Text>
            </TouchableOpacity>

            {showCode && (
              <Field label="Access code" icon="key-outline">
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. JUPEB-ABC123"
                  placeholderTextColor={C.mutedForeground}
                  autoCapitalize="characters"
                  value={accessCode}
                  onChangeText={setAccessCode}
                  editable={!loading}
                />
              </Field>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.65 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Text style={styles.btnText}>Create Account</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
              }
            </TouchableOpacity>

            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink} onPress={() => switchMode('login')}>Sign in</Text>
            </Text>

            <Text style={styles.termsNote}>
              By registering, you agree to use this app for personal study only.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, icon, children,
}: { label: string; icon: string; children: React.ReactNode }) {
  const C = useTheme();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldRow}>
        <Ionicons name={icon as any} size={18} color={C.mutedForeground} style={{ marginRight: 10 }} />
        {children}
      </View>
    </View>
  );
}

function makeStyles(C: AppColors) {
  return StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.background },
    scroll: { flexGrow: 1, paddingHorizontal: 26, justifyContent: 'center', minHeight: '100%' },

    brand: { alignItems: 'center', marginBottom: 36 },
    logoBox: {
      width: 68, height: 68, borderRadius: 20,
      backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    },
    logoLetter: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
    appName:   { fontSize: 26, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.5 },
    tagline:   { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground, marginTop: 4 },

    // Tabs
    tabs: {
      flexDirection: 'row', borderRadius: C.radius,
      borderWidth: 1, borderColor: C.border,
      marginBottom: 28, overflow: 'hidden',
    },
    tab:          { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: C.card },
    tabActive:    { backgroundColor: C.primary },
    tabText:      { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground },
    tabTextActive:{ color: '#fff' },

    form: { gap: 14 },

    // Field
    fieldGroup: { gap: 6 },
    fieldLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground, letterSpacing: 0.3 },
    fieldRow: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: C.border,
      borderRadius: C.radius, paddingHorizontal: 14,
      height: 52, backgroundColor: C.card,
    },
    fieldInput: {
      flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular',
      color: C.foreground, height: '100%',
    },
    eyeBtn: { padding: 4 },

    btn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.primary, borderRadius: C.radius,
      height: 54, gap: 8, marginTop: 6,
    },
    btnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },

    switchText: {
      fontSize: 13, fontFamily: 'Inter_400Regular',
      color: C.mutedForeground, textAlign: 'center', marginTop: 4,
    },
    switchLink: { color: C.primary, fontFamily: 'Inter_600SemiBold' },
    termsNote: {
      fontSize: 11, fontFamily: 'Inter_400Regular',
      color: C.mutedForeground, textAlign: 'center',
      lineHeight: 16, marginTop: -4,
    },

    // Subjects
    subjectSection: { gap: 8 },
    subjectLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground, letterSpacing: 0.3 },
    subjectRequired: { color: C.primary },
    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
      backgroundColor: C.card,
    },
    chipSelected:  { backgroundColor: C.primary, borderColor: C.primary },
    chipText:      { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: C.mutedForeground },
    chipTextSelected: { color: '#fff' },

    // Access code toggle
    codeToggle: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 4,
    },
    codeToggleText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.primary },

    // PIN (legacy)
    backLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backLinkText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
    sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.foreground, letterSpacing: -0.3 },
    sectionSub:   { fontSize: 14, fontFamily: 'Inter_400Regular', color: C.mutedForeground },
    dotsRow: {
      flexDirection: 'row', justifyContent: 'center', gap: 14,
      marginTop: 28, marginBottom: 24,
    },
    dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
    hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
    tapHint: {
      alignItems: 'center', paddingVertical: 14,
      borderWidth: 1.5, borderColor: C.border, borderRadius: C.radius,
      borderStyle: 'dashed', backgroundColor: C.card,
    },
    tapHintText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: C.mutedForeground },
  });
}

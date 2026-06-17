import { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const C = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);

  async function handleLogin() {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(cleaned);
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', err.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const botPad = Platform.OS === 'web' ? 0 : insets.bottom;

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

        {/* Form */}
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
              onSubmitEditing={handleLogin}
              editable={!loading}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
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
  });
}

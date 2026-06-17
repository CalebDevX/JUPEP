import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topInset, paddingBottom: bottomInset + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>J</Text>
          </View>
          <Text style={styles.appName}>JUPEB Prep</Text>
          <Text style={styles.appTagline}>Study smarter. Pass better.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Enter your phone number to continue</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color={Colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="08012345678"
              placeholderTextColor={Colors.mutedForeground}
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
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.primaryForeground} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            For registered JUPEB students only. Access requires a valid subscription.
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.mutedForeground} />
          <Text style={styles.footerText}>Secured &amp; device-locked</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.foreground,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.mutedForeground,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: Colors.radius,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.foreground,
    height: '100%',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Colors.radius,
    height: 52,
    gap: 8,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primaryForeground,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.mutedForeground,
  },
});

import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Platform } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { queryClient, getApiBase } from '@/lib/query-client';
import { registerPushToken } from '@/src/utils/api';

SplashScreen.preventAutoHideAsync();

// ── Build a personalized notification message ──────────────────────────────────
function buildPersonalizedMessage(rankData: {
  rank: number | null;
  xp: number;
  streak: number;
  full_name: string;
  xpToNext: number;
  nextRank: number | null;
}): { title: string; body: string } {
  const firstName = (rankData.full_name || '').split(' ')[0] || 'Hey';
  const { rank, xpToNext, streak } = rankData;

  if (!rank || rank > 100) {
    return {
      title: '📚 Daily Challenge!',
      body: 'Complete a quiz today to earn XP and appear on the leaderboard 🚀',
    };
  }
  if (rank === 1) {
    return {
      title: `👑 You're #1, ${firstName}!`,
      body: `Keep your ${streak}-day streak alive. Don't let anyone catch up today 🔥`,
    };
  }
  if (rank <= 3) {
    return {
      title: `🏆 You're #${rank}, ${firstName}!`,
      body: `Only ${xpToNext} XP from #${rank - 1}. One quiz session could get you there! 🔥`,
    };
  }
  if (rank <= 10) {
    return {
      title: `🔥 #${rank - 1} is just ${xpToNext} XP away!`,
      body: `${firstName}, practice today and climb the top-10 leaderboard. You've got this!`,
    };
  }
  if (rank <= 20) {
    return {
      title: `📈 Top 10 in sight, ${firstName}!`,
      body: `You're ranked #${rank}. Earn ${xpToNext} more XP today to break into the top 10!`,
    };
  }
  return {
    title: `📚 Your daily challenge, ${firstName}!`,
    body: `You're ranked #${rank} — ${xpToNext} XP to rank #${rank - 1}. Practice now and climb! 🚀`,
  };
}

// ── Request permissions + get Expo push token ─────────────────────────────────
async function setupNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: asked } = await Notifications.requestPermissionsAsync();
      if (asked !== 'granted') return null;
    }

    // Schedule generic fallback notifications (overridden below once rank is known)
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Time to study!',
        body: "Your daily JUPEB practice session is waiting. Keep your streak alive 🔥",
      },
      trigger: { hour: 9, minute: 0, repeats: true } as any,
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't break your streak! 🔥",
        body: "You haven't practiced today. Just 10 minutes of JUPEB prep makes a big difference.",
      },
      trigger: { hour: 20, minute: 0, repeats: true } as any,
    });

    try {
      const Constants = await import('expo-constants');
      const projectId =
        Constants.default.expoConfig?.extra?.eas?.projectId ??
        Constants.default.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );
      return tokenData.data;
    } catch {
      return null;
    }
  } catch (e) {
    console.warn('Notification setup failed:', e);
    return null;
  }
}

// ── Reschedule 9 AM notification with personalised message ────────────────────
async function reschedulePersonalizedNotification(phone: string, sessionToken: string) {
  if (Platform.OS === 'web') return;
  try {
    const base = getApiBase();
    const res = await fetch(
      `${base}/student/rank?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(sessionToken)}`
    );
    if (!res.ok) return;
    const rankData = await res.json();

    const Notifications = await import('expo-notifications');
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    // Cancel the existing 9 AM generic notification (keep 8 PM)
    for (const n of scheduled) {
      const trigger = n.trigger as any;
      if (trigger?.hour === 9) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    const { title, body } = buildPersonalizedMessage(rankData);
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { hour: 9, minute: 0, repeats: true } as any,
    });
  } catch {
    // Silently fall back to generic notification
  }
}

// ── Component: manages token registration + personalized scheduling ────────────
function PushTokenRegistrar() {
  const { profile } = useAuth();
  const registeredForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profile || Platform.OS === 'web') return;
    if (registeredForRef.current === profile.phone) return;
    registeredForRef.current = profile.phone;

    setupNotifications().then((pushToken) => {
      if (pushToken && profile.sessionToken) {
        registerPushToken(profile.phone, profile.sessionToken, pushToken);
      }
      // Always attempt personalisation regardless of push token availability
      if (profile.sessionToken) {
        reschedulePersonalizedNotification(profile.phone, profile.sessionToken);
      }
    });
  }, [profile]);

  return null;
}

function ThemedStatusBar() {
  const { mode, colors } = useThemeContext();
  const isDark = mode === 'dark' || (mode === 'auto' && colors.background === '#09090b');
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function AppShell() {
  const { colors } = useThemeContext();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PushTokenRegistrar />
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="quiz/[groupId]" />
              <Stack.Screen name="notes/[courseId]" />
              <Stack.Screen name="notes/chapter/[chapterId]" />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme, Platform } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { queryClient } from '@/lib/query-client';
import { LightColors, DarkColors } from '@/constants/colors';
import { registerPushToken } from '@/src/utils/api';

SplashScreen.preventAutoHideAsync();

async function setupNotifications() {
  if (Platform.OS === 'web') return;
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
    // Cancel stale scheduled notifications and reschedule
    await Notifications.cancelAllScheduledNotificationsAsync();
    // 9am daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Time to study!',
        body: "Your daily JUPEB practice session is waiting. Keep your streak alive 🔥",
      },
      trigger: { hour: 9, minute: 0, repeats: true } as any,
    });
    // 8pm nudge
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't break your streak! 🔥",
        body: "You haven't practiced today. Just 10 minutes of JUPEB prep can make a big difference.",
      },
      trigger: { hour: 20, minute: 0, repeats: true } as any,
    });

    // Return Expo push token for remote notifications
    const Constants = await import('expo-constants');
    const projectId = Constants.default.expoConfig?.extra?.eas?.projectId ?? Constants.default.easConfig?.projectId;
    if (projectId) {
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    }
    return null;
  } catch (e) {
    // Notification setup is optional — never crash the app
    console.warn('Notification setup failed:', e);
    return null;
  }
}

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
    });
  }, [profile]);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? DarkColors : LightColors;

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PushTokenRegistrar />
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
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

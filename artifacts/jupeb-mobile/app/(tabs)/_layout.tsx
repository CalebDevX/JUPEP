import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import AnnouncementBanner from '@/components/AnnouncementBanner';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  const C = useTheme();

  const bottomInset = Platform.OS === 'ios' ? 26 : Platform.OS === 'web' ? 10 : 8;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: C.tabBar,
            borderTopColor: C.tabBarBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 62,
            paddingBottom: bottomInset,
            paddingTop: 8,
          },
          tabBarActiveTintColor: C.primary,
          tabBarInactiveTintColor: C.mutedForeground,
          tabBarLabelStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 10,
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline' as IoniconName} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quiz"
          options={{
            title: 'Practice',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'help-circle' : 'help-circle-outline' as IoniconName} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline' as IoniconName} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline' as IoniconName} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline' as IoniconName} size={22} color={color} />
            ),
          }}
        />
        {/* Hidden from nav bar — accessible via deep link / home quick actions */}
        <Tabs.Screen name="chat" options={{ href: null }} />
        <Tabs.Screen name="subjects" options={{ href: null }} />
      </Tabs>
      <AnnouncementBanner />
    </View>
  );
}

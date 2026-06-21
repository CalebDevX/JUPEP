import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function NotFound() {
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(tabs)');
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      <ActivityIndicator color="#f97316" size="large" />
    </View>
  );
}

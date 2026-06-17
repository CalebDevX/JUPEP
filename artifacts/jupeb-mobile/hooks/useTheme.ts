import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, type AppColors } from '@/constants/colors';

export function useTheme(): AppColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : LightColors;
}

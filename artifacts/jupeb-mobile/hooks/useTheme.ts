import { useThemeContext } from '@/context/ThemeContext';
import type { AppColors } from '@/constants/colors';

export function useTheme(): AppColors {
  return useThemeContext().colors;
}

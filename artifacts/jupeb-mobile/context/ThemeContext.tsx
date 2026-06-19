import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, SepiaColors, type AppColors } from '@/constants/colors';

export type ThemeMode = 'auto' | 'light' | 'dark' | 'sepia';

const THEME_KEY     = 'jupeb_theme_mode';
const AUTO_SYNC_KEY = 'jupeb_auto_sync';
const FONT_SIZE_KEY = 'jupeb_font_size';

export const FONT_SIZES = [
  { label: 'S',  value: 13 },
  { label: 'M',  value: 15 },
  { label: 'L',  value: 17 },
  { label: 'XL', value: 20 },
];
export const DEFAULT_FONT_SIZE = 15;

type ThemeContextType = {
  mode: ThemeMode;
  colors: AppColors;
  setMode: (mode: ThemeMode) => void;
  autoSync: boolean;
  setAutoSync: (v: boolean) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'auto',
  colors: LightColors,
  setMode: () => {},
  autoSync: true,
  setAutoSync: () => {},
  fontSize: DEFAULT_FONT_SIZE,
  setFontSize: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState]         = useState<ThemeMode>('auto');
  const [autoSync, setAutoSyncState] = useState(true);
  const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, AUTO_SYNC_KEY, FONT_SIZE_KEY]).then(pairs => {
      const savedMode = pairs[0][1] as ThemeMode | null;
      const savedSync = pairs[1][1];
      const savedSize = pairs[2][1];
      if (savedMode && ['auto','light','dark','sepia'].includes(savedMode)) setModeState(savedMode);
      if (savedSync !== null) setAutoSyncState(savedSync === 'true');
      if (savedSize) setFontSizeState(parseInt(savedSize) || DEFAULT_FONT_SIZE);
    }).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  }, []);

  const setAutoSync = useCallback((v: boolean) => {
    setAutoSyncState(v);
    AsyncStorage.setItem(AUTO_SYNC_KEY, String(v)).catch(() => {});
  }, []);

  const setFontSize = useCallback((n: number) => {
    setFontSizeState(n);
    AsyncStorage.setItem(FONT_SIZE_KEY, String(n)).catch(() => {});
  }, []);

  const colors: AppColors =
    mode === 'sepia'  ? SepiaColors
    : mode === 'dark' ? DarkColors
    : mode === 'light'? LightColors
    : systemScheme === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode, autoSync, setAutoSync, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}

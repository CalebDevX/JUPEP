import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors, SepiaColors, type AppColors } from '@/constants/colors';

export type ThemeMode = 'auto' | 'light' | 'dark' | 'sepia';

const THEME_KEY = 'jupeb_theme_mode';
const AUTO_SYNC_KEY = 'jupeb_auto_sync';

type ThemeContextType = {
  mode: ThemeMode;
  colors: AppColors;
  setMode: (mode: ThemeMode) => void;
  autoSync: boolean;
  setAutoSync: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'auto',
  colors: LightColors,
  setMode: () => {},
  autoSync: true,
  setAutoSync: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [autoSync, setAutoSyncState] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, AUTO_SYNC_KEY]).then(pairs => {
      const saved = pairs[0][1] as ThemeMode | null;
      const sync = pairs[1][1];
      if (saved && ['auto', 'light', 'dark', 'sepia'].includes(saved)) {
        setModeState(saved);
      }
      if (sync !== null) {
        setAutoSyncState(sync === 'true');
      }
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

  const colors: AppColors =
    mode === 'sepia' ? SepiaColors
    : mode === 'dark' ? DarkColors
    : mode === 'light' ? LightColors
    : systemScheme === 'dark' ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode, autoSync, setAutoSync }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}

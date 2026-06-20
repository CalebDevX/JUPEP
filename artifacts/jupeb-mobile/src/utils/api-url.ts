import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'jupeb_api_url_v1';

function defaultBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return 'https://edu.achek.com.ng';
}

let _baseUrl: string = defaultBase();
let _initialized = false;

export async function initApiUrl(): Promise<void> {
  if (_initialized) return;
  _initialized = true;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      _baseUrl = saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // keep default
  }
}

export function getBaseUrl(): string {
  return _baseUrl;
}

export function getApiUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin + '/api';
  }
  return _baseUrl + '/api';
}

export async function setCustomApiUrl(url: string): Promise<void> {
  const cleaned = url.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEY, cleaned);
  _baseUrl = cleaned;
}

export async function clearCustomApiUrl(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  _baseUrl = defaultBase();
}

export function getCurrentApiUrlDisplay(): string {
  return _baseUrl;
}

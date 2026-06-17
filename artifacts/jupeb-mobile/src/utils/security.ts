import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Detect if the device is rooted/jailbroken. Returns true if insecure.
 */
export async function isDeviceCompromised(): Promise<boolean> {
  // On Android, expo-device provides isDevice and isEmulator, but no direct root check.
  // We'll use a simple heuristic: if the device is an emulator, treat as compromised.
  // Real root detection requires native modules; this is a placeholder for now.
  const isEmulator = await Device.isDevice && (await Device.isEmulator);
  if (isEmulator) return true;
  // Additional checks could be added with expo-random or file system access.
  return false;
}

/**
 * Generate and store a persistent device identifier.
 * The ID is stored in SecureStore and never changes for this installation.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const key = 'device-id';
  let id = await SecureStore.getItemAsync(key);
  if (!id) {
    // Use expo-device's uniqueId as a base.
    const uniqueId = Device.deviceId || `${Platform.OS}-${Date.now()}`;
    id = uniqueId;
    await SecureStore.setItemAsync(key, id);
  }
  return id;
}

/**
 * Store the auth token securely.
 */
export async function storeAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth-token', token);
}

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('auth-token');
}

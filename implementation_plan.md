# Build Secure Expo Mobile Application (iOS & Android)

We are building a highly secure, offline-first mobile application using **Expo (React Native)**. The app will house the massive textbook data we generated (GOV, CRS, LIT) and will securely sync dynamic "Past Questions" from your admin panel for offline use.

Crucially, the app must be **uncrackable** (resistant to MT Manager and reverse engineering) and strictly **locked to a single device** per user to prevent account sharing.

## User Review Required

> [!IMPORTANT]
> **Major Architectural Decisions:**
> 1. **Offline Database:** To support syncing Past Questions from an admin panel and working completely offline, I will implement **Expo SQLite** (or WatermelonDB if complex relations are needed).
> 2. **Single Device Locking:** I will implement a system that generates a unique cryptographic Device ID on first login and stores it in `expo-secure-store`. This ID will be bound to the user's account on your backend. If they try to log in on a second device, the backend will reject it.
> 3. **Anti-Tampering & Security:** To stop hackers using MT Manager or Lucky Patcher, I will implement:
>    - **Root/Jailbreak Detection:** The app will crash or lock if the device is rooted.
>    - **Code Obfuscation:** We will use `javascript-obfuscator` to scramble the source code so hackers cannot easily read or modify it.
>    - **EAS Build Security:** We will configure the Android build to disable cleartext traffic and enforce strict signature verification.

## Open Questions

> [!WARNING]
> Please provide feedback on the following before I proceed with the heavy security configurations:
> 1. **Admin Panel / Backend:** Do you already have the admin panel backend built (e.g., Firebase, Supabase, or a custom Node/PHP server) to handle the single-device locking logic and serve the Past Questions, or do you need me to build that later?
> 2. **Resetting Devices:** If a student loses their phone, they will be permanently locked out. Will you manually reset their device ID from your admin panel when they complain?
> 3. **Are you ready to approve this highly secure architecture?**

## Proposed Changes

### 1. Offline-First Architecture
- **[NEW] Local Database:** Install and configure `expo-sqlite` to store "Past Questions".
- **[NEW] Sync Engine:** Create a background service that fetches new questions from your API when online, saves them to SQLite, and serves them locally when offline.

### 2. Extreme Security Implementation
- **[NEW] `utils/security.ts`**: Implement root detection and emulator detection.
- **[NEW] Device Binding:** Implement logic using `expo-application` and `expo-secure-store` to generate an un-spoofable hardware identifier.
- **[MODIFY] `app.json` / `eas.json`**: Configure Android Manifest to block MT Manager tampering (e.g., `android:extractNativeLibs="false"`, blocking debuggers).

### 3. Build the Premium UI Components
- **[NEW] Authentication Flow:** Secure login screen with device-binding logic.
- **[NEW] `app/index.tsx`**: A beautiful, premium dashboard showing downloaded Textbooks and Past Questions.
- **[NEW] `app/reader/`**: The mobile-optimized reading interface for our massive GOV, CRS, and LIT data.
- **[NEW] `app/quiz/`**: The offline interface for taking Past Questions.

## Verification Plan

### Automated Tests
- Test SQLite offline read/write operations.
- Test root detection logic locally on an Android emulator.

### Manual Verification
- You will test logging in with an account, then attempting to log in on a *second* device to confirm the "Single Device Lock" works.
- We will attempt to open the generated APK in MT Manager to verify the obfuscation and tampering protections hold up.

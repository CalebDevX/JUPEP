import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { getApiBase } from '@/lib/query-client';

export interface UpdateInfo {
  version: string;
  buildNumber: number;
  downloadUrl: string;
  notes: string;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '1.0.0';
    const androidCfg = (Constants.expoConfig as any)?.android;
    const currentBuild: number = androidCfg?.versionCode ? parseInt(String(androidCfg.versionCode)) : 1;

    fetch(`${getApiBase()}/api/app/version`)
      .then(r => r.json())
      .then((data: UpdateInfo) => {
        if (!data?.downloadUrl) return;
        const newerBuild = data.buildNumber > currentBuild;
        const newerVersion = data.version !== currentVersion;
        if (newerBuild || newerVersion) setUpdateInfo(data);
      })
      .catch(() => {});
  }, []);

  return {
    updateInfo: dismissed ? null : updateInfo,
    dismiss: () => setDismissed(true),
  };
}

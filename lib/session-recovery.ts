'use client';

import { getSession } from './auth-utils';

// セッション復元の試行
export function attemptSessionRecovery(): boolean {
  try {
    // セッション情報があるかチェック
    const session = getSession();
    if (!session) {
      return false;
    }

    // 暗号化キーがSessionStorageにない場合、バックアップから復元
    let encryptionKey = sessionStorage.getItem('encryptionKey');
    if (!encryptionKey) {
      const backupKey = localStorage.getItem('backup-encryption-key');
      if (backupKey) {
        sessionStorage.setItem('encryptionKey', backupKey);
        encryptionKey = backupKey;
      }
    }

    return !!encryptionKey;
  } catch (error) {
    console.error('Session recovery failed:', error);
    return false;
  }
}

// セッション復元データのクリア
export function clearSessionRecoveryData(): void {
  localStorage.removeItem('backup-encryption-key');
  localStorage.removeItem('backup-user-salt');
}
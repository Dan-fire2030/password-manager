'use client';

import { toast } from 'sonner';

// WebAuthnサポートのチェック
export function isWebAuthnSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'credentials' in navigator &&
         typeof navigator.credentials.create === 'function' &&
         typeof navigator.credentials.get === 'function';
}

// 生体認証の可用性チェック
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    // PublicKeyCredentialの可用性をチェック
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return isAvailable;
  } catch (error) {
    console.error('生体認証の確認エラー:', error);
    return false;
  }
}

// Base64URLエンコード/デコード
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLength);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// 生体認証の登録
export async function registerBiometric(userId: string, username: string): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    toast.error('このブラウザは生体認証に対応していません');
    return false;
  }

  try {
    // チャレンジを生成（実際の実装ではサーバーから取得）
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // ユーザーIDをArrayBufferに変換
    const userIdBuffer = new TextEncoder().encode(userId);

    // 認証オプション
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: 'パスマネ',
        id: window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    // 生体認証の登録を実行
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('認証情報の作成に失敗しました');
    }

    // 認証情報を保存（LocalStorageに保存）
    const credentialData = {
      credentialId: bufferToBase64url(credential.rawId),
      publicKey: credential.response as AuthenticatorAttestationResponse,
      type: credential.type,
      userId: userId,
      createdAt: new Date().toISOString(),
    };

    // LocalStorageに保存
    const storedCredentials = JSON.parse(localStorage.getItem('biometric-credentials') || '[]');
    storedCredentials.push({
      credentialId: credentialData.credentialId,
      userId: userId,
      createdAt: credentialData.createdAt,
    });
    localStorage.setItem('biometric-credentials', JSON.stringify(storedCredentials));
    
    // チャレンジも保存（検証用）
    sessionStorage.setItem('biometric-challenge', bufferToBase64url(challenge.buffer));

    toast.success('生体認証を登録しました');
    return true;
  } catch (error) {
    console.error('生体認証の登録エラー:', error);
    
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        toast.error('生体認証がキャンセルされました');
      } else if (error.name === 'NotSupportedError') {
        toast.error('この端末は生体認証に対応していません');
      } else {
        toast.error('生体認証の登録に失敗しました');
      }
    } else {
      toast.error('生体認証の登録に失敗しました');
    }
    
    return false;
  }
}

// 生体認証による認証
export async function authenticateWithBiometric(userId?: string): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    toast.error('このブラウザは生体認証に対応していません');
    return false;
  }

  try {
    // 保存された認証情報を取得
    const storedCredentials = JSON.parse(localStorage.getItem('biometric-credentials') || '[]') as Array<{
      userId: string;
      credentialId: string;
      createdAt: string;
    }>;
    
    if (storedCredentials.length === 0) {
      toast.error('生体認証が登録されていません');
      return false;
    }

    // userIdが指定されている場合はフィルタリング
    const userCredentials = userId 
      ? storedCredentials.filter(cred => cred.userId === userId)
      : storedCredentials;

    if (userCredentials.length === 0) {
      toast.error('このユーザーの生体認証が登録されていません');
      return false;
    }

    // チャレンジを生成
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // 認証オプション
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge,
      allowCredentials: userCredentials.map(cred => ({
        id: base64urlToBuffer(cred.credentialId),
        type: 'public-key' as PublicKeyCredentialType,
        transports: ['internal'] as AuthenticatorTransport[],
      })),
      userVerification: 'required',
      timeout: 60000,
    };

    // 生体認証を実行
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('認証に失敗しました');
    }

    // 認証成功
    // const response = credential.response as AuthenticatorAssertionResponse;
    
    // セッションに認証情報を保存
    sessionStorage.setItem('biometric-authenticated', 'true');
    sessionStorage.setItem('biometric-auth-time', new Date().toISOString());
    
    toast.success('生体認証に成功しました');
    return true;
  } catch (error) {
    console.error('生体認証エラー:', error);
    
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        toast.error('生体認証がキャンセルされました');
      } else if (error.name === 'NotSupportedError') {
        toast.error('この端末は生体認証に対応していません');
      } else {
        toast.error('生体認証に失敗しました');
      }
    } else {
      toast.error('生体認証に失敗しました');
    }
    
    return false;
  }
}

// 生体認証の削除
export function removeBiometric(userId: string): boolean {
  try {
    const storedCredentials = JSON.parse(localStorage.getItem('biometric-credentials') || '[]') as Array<{
      userId: string;
      credentialId: string;
      createdAt: string;
    }>;
    const filteredCredentials = storedCredentials.filter(cred => cred.userId !== userId);
    localStorage.setItem('biometric-credentials', JSON.stringify(filteredCredentials));
    
    toast.success('生体認証を削除しました');
    return true;
  } catch (error) {
    console.error('生体認証の削除エラー:', error);
    toast.error('生体認証の削除に失敗しました');
    return false;
  }
}

// 生体認証が登録されているかチェック
export function isBiometricRegistered(userId?: string): boolean {
  try {
    const storedCredentials = JSON.parse(localStorage.getItem('biometric-credentials') || '[]') as Array<{
      userId: string;
      credentialId: string;
      createdAt: string;
    }>;
    
    if (userId) {
      return storedCredentials.some(cred => cred.userId === userId);
    }
    
    return storedCredentials.length > 0;
  } catch (error) {
    console.error('生体認証の確認エラー:', error);
    return false;
  }
}

// 生体認証セッションの検証
export function isBiometricSessionValid(): boolean {
  const authenticated = sessionStorage.getItem('biometric-authenticated');
  const authTime = sessionStorage.getItem('biometric-auth-time');
  
  if (!authenticated || !authTime) {
    return false;
  }
  
  // 30分のセッションタイムアウト
  const authDate = new Date(authTime);
  const now = new Date();
  const diffMinutes = (now.getTime() - authDate.getTime()) / (1000 * 60);
  
  return diffMinutes < 30;
}

// 生体認証セッションのクリア
export function clearBiometricSession(): void {
  sessionStorage.removeItem('biometric-authenticated');
  sessionStorage.removeItem('biometric-auth-time');
  sessionStorage.removeItem('biometric-challenge');
}
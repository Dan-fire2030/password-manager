'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Smartphone, Shield, X, Check } from 'lucide-react';
import {
  isBiometricAvailable,
  registerBiometric,
  authenticateWithBiometric,
  removeBiometric,
  isBiometricRegistered,
} from '@/lib/webauthn';

interface BiometricSetupProps {
  userId: string;
  username: string;
  onClose?: () => void;
}

export function BiometricSetup({ userId, username, onClose }: BiometricSetupProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, [userId]);

  const checkBiometricStatus = async () => {
    const available = await isBiometricAvailable();
    setIsAvailable(available);
    
    const registered = isBiometricRegistered(userId);
    setIsRegistered(registered);
    setShowTestButton(registered);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    const success = await registerBiometric(userId, username);
    if (success) {
      setIsRegistered(true);
      setShowTestButton(true);
    }
    setIsLoading(false);
  };

  const handleTest = async () => {
    setIsLoading(true);
    await authenticateWithBiometric(userId);
    setIsLoading(false);
  };

  const handleRemove = () => {
    if (confirm('生体認証を削除してもよろしいですか？')) {
      removeBiometric(userId);
      setIsRegistered(false);
      setShowTestButton(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            生体認証設定
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Touch ID / Face ID を使用してセキュアにログインできます
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ステータス表示 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {isAvailable ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700">生体認証が利用可能です</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-red-600" />
                <span className="text-red-700">この端末は生体認証に対応していません</span>
              </>
            )}
          </div>
          
          {isRegistered && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">生体認証が登録済みです</span>
            </div>
          )}
        </div>

        {/* 機能説明 */}
        {isAvailable && !isRegistered && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-sm text-blue-900">生体認証の利点</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>パスワード入力不要で素早くアクセス</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Touch ID / Face ID でセキュアな認証</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>端末に保存されるため安全</span>
              </li>
            </ul>
          </div>
        )}

        {/* アクションボタン */}
        {isAvailable && (
          <div className="space-y-2">
            {!isRegistered ? (
              <Button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    登録中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    生体認証を登録
                  </div>
                )}
              </Button>
            ) : (
              <>
                {showTestButton && (
                  <Button
                    onClick={handleTest}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        認証中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4" />
                        生体認証をテスト
                      </div>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={handleRemove}
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading}
                >
                  生体認証を削除
                </Button>
              </>
            )}
          </div>
        )}

        {/* プラットフォーム別の注意事項 */}
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-medium">対応端末:</p>
          <ul className="space-y-0.5">
            <li>• iOS: Touch ID / Face ID 搭載デバイス</li>
            <li>• Android: 指紋認証対応デバイス</li>
            <li>• Windows: Windows Hello 対応PC</li>
            <li>• macOS: Touch ID 搭載Mac</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// 生体認証プロンプトコンポーネント
interface BiometricPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
  userId?: string;
}

export function BiometricPrompt({ onSuccess, onCancel, userId }: BiometricPromptProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    const success = await authenticateWithBiometric(userId);
    
    if (success) {
      onSuccess();
    } else {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-30"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full w-16 h-16 flex items-center justify-center">
              <Fingerprint className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle>生体認証</CardTitle>
          <CardDescription>
            Touch ID / Face ID で認証してください
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full"
          >
            {isAuthenticating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                認証中...
              </div>
            ) : (
              '生体認証を使用'
            )}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
            disabled={isAuthenticating}
          >
            キャンセル
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
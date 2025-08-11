'use client';

const SESSION_DURATION = 60 * 60 * 1000; // 1時間（ミリ秒）
const SESSION_KEY = 'auth-session';
const SESSION_TIMESTAMP_KEY = 'auth-session-timestamp';

// セッション情報を保存
export function saveSession(userId: string, email: string) {
  const timestamp = Date.now();
  const sessionData = {
    userId,
    email,
    timestamp,
    expiresAt: timestamp + SESSION_DURATION,
  };
  
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, timestamp.toString());
  
  // LocalStorageにも保存（ブラウザを閉じても維持）
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem(SESSION_TIMESTAMP_KEY, timestamp.toString());
}

// セッションの有効性をチェック
export function isSessionValid(): boolean {
  try {
    // まずSessionStorageをチェック
    let sessionData = sessionStorage.getItem(SESSION_KEY);
    let timestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    // SessionStorageになければLocalStorageをチェック
    if (!sessionData) {
      sessionData = localStorage.getItem(SESSION_KEY);
      timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
      
      // LocalStorageにあればSessionStorageにコピー
      if (sessionData && timestamp) {
        sessionStorage.setItem(SESSION_KEY, sessionData);
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, timestamp);
      }
    }
    
    if (!sessionData || !timestamp) {
      return false;
    }
    
    const session = JSON.parse(sessionData);
    const currentTime = Date.now();
    
    // セッションの有効期限をチェック（1時間）
    if (currentTime > session.expiresAt) {
      clearSession();
      return false;
    }
    
    // セッションが有効な場合、タイムスタンプを更新（アクティビティベースの延長）
    updateSessionTimestamp();
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// セッションのタイムスタンプを更新（アクティビティがあった場合）
export function updateSessionTimestamp() {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const timestamp = Date.now();
      
      // 最後のアクティビティから5分以上経過していたら更新
      const lastTimestamp = parseInt(sessionStorage.getItem(SESSION_TIMESTAMP_KEY) || '0');
      if (timestamp - lastTimestamp > 5 * 60 * 1000) {
        session.timestamp = timestamp;
        session.expiresAt = timestamp + SESSION_DURATION;
        
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, timestamp.toString());
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(SESSION_TIMESTAMP_KEY, timestamp.toString());
      }
    }
  } catch (error) {
    console.error('Session update error:', error);
  }
}

// セッション情報を取得
export function getSession(): { userId: string; email: string } | null {
  try {
    if (!isSessionValid()) {
      return null;
    }
    
    const sessionData = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return {
        userId: session.userId,
        email: session.email,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

// セッションをクリア
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
  sessionStorage.removeItem('encryptionKey');
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);
}

// セッションの残り時間を取得（ミリ秒）
export function getSessionRemainingTime(): number {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const currentTime = Date.now();
      const remaining = session.expiresAt - currentTime;
      
      return remaining > 0 ? remaining : 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Session remaining time error:', error);
    return 0;
  }
}

// セッションの残り時間を文字列で取得
export function getSessionRemainingTimeString(): string {
  const remaining = getSessionRemainingTime();
  
  if (remaining <= 0) {
    return 'セッション終了';
  }
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `残り${minutes}分${seconds}秒`;
  } else {
    return `残り${seconds}秒`;
  }
}

// セッションタイマーの設定（自動ログアウト用）
export function setupSessionTimer(onExpire: () => void): NodeJS.Timeout | null {
  const remaining = getSessionRemainingTime();
  
  if (remaining > 0) {
    return setTimeout(() => {
      clearSession();
      onExpire();
    }, remaining);
  }
  
  return null;
}
import CryptoJS from 'crypto-js'

// 暗号化キーの生成（PINコードから派生）
export function deriveKeyFromPin(pin: string, salt: string): string {
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 100000,
  }).toString()
}

// データの暗号化
export function encryptData(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString()
}

// データの復号化
export function decryptData(encryptedData: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// ソルトの生成
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128 / 8).toString()
}

// パスワードの生成
export function generatePassword(
  length: number = 16,
  options: {
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  } = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  }
): string {
  let chars = ''
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) chars += '0123456789'
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// パスワード強度チェック
export function checkPasswordStrength(password: string) {
  let score = 0
  const feedback = []

  // 長さチェック
  if (password.length >= 12) {
    score += 2
  } else if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('8文字以上にしてください')
  }

  // 文字種類チェック
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('小文字を含めてください')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('大文字を含めてください')
  
  if (/[0-9]/.test(password)) score += 1
  else feedback.push('数字を含めてください')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('記号を含めてください')

  // 繰り返しパターンチェック
  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('同じ文字の繰り返しを避けてください')

  let strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  let color: string
  let percentage: number

  if (score <= 2) {
    strength = 'very-weak'
    color = 'from-red-500 to-red-600'
    percentage = 20
  } else if (score <= 4) {
    strength = 'weak'
    color = 'from-orange-500 to-orange-600'
    percentage = 40
  } else if (score <= 5) {
    strength = 'medium'
    color = 'from-yellow-500 to-yellow-600'
    percentage = 60
  } else if (score <= 6) {
    strength = 'strong'
    color = 'from-blue-500 to-blue-600'
    percentage = 80
  } else {
    strength = 'very-strong'
    color = 'from-green-500 to-green-600'
    percentage = 100
  }

  return {
    strength,
    score,
    color,
    percentage,
    feedback: feedback.slice(0, 2) // 最大2つのフィードバック
  }
}
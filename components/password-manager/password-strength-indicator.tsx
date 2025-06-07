'use client'

import { checkPasswordStrength } from '@/lib/crypto'

interface PasswordStrengthIndicatorProps {
  password: string
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const { strength, color, percentage, feedback } = checkPasswordStrength(password)

  const strengthLabels = {
    'very-weak': 'とても弱い',
    'weak': '弱い',
    'medium': '普通',
    'strong': '強い',
    'very-strong': 'とても強い',
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">パスワード強度</span>
        <span className={`text-xs font-semibold ${
          strength === 'very-weak' ? 'text-red-600' :
          strength === 'weak' ? 'text-orange-600' :
          strength === 'medium' ? 'text-yellow-600' :
          strength === 'strong' ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {strengthLabels[strength]}
        </span>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((item, index) => (
            <p key={index} className="text-xs text-slate-500">
              • {item}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
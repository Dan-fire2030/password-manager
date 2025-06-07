-- ユーザーとプロファイルの状態を確認
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.salt,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- メール確認を強制的に完了させる（必要な場合）
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
-- プロファイルの重複を確認
SELECT id, email, count(*) 
FROM profiles 
GROUP BY id, email 
HAVING count(*) > 1;

-- 全プロファイルを確認
SELECT * FROM profiles ORDER BY created_at DESC;

-- 重複したプロファイルを削除（最新のものを残す）
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
  FROM profiles
)
DELETE FROM profiles
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- プロファイルが存在しないユーザーのために作成
INSERT INTO profiles (id, email, salt)
SELECT u.id, u.email, encode(gen_random_bytes(16), 'hex')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
-- プロファイルテーブルのRLSポリシーを修正
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 新しいポリシーを作成（サービスロールも許可）
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    auth.role() = 'service_role'
  );

-- トリガーを作成して、ユーザー作成時に自動的にプロファイルを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, salt)
  VALUES (
    new.id,
    new.email,
    encode(gen_random_bytes(16), 'hex')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーがある場合は削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
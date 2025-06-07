-- 1. 既存のRLSポリシーをすべて削除
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. より柔軟なRLSポリシーを作成
-- 閲覧ポリシー
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 更新ポリシー
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 挿入ポリシー（認証直後でも挿入可能にする）
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (true);

-- 3. トリガー関数を更新（エラーハンドリング付き）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, salt)
  VALUES (
    new.id,
    new.email,
    encode(gen_random_bytes(16), 'hex')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- エラーが発生してもユーザー作成は続行
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 既存のトリガーを再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
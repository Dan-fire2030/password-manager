-- ユーザープロファイルテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- パスワードエントリーテーブル
CREATE TABLE password_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- バックアップテーブル
CREATE TABLE backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  encrypted_backup TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own passwords" ON password_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords" ON password_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords" ON password_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords" ON password_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own backups" ON backups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backups" ON backups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups" ON backups
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_password_entries_user_id ON password_entries(user_id);
CREATE INDEX idx_backups_user_id ON backups(user_id);
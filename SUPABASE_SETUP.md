# Supabase設定手順

## 重要：メール確認を無効にする

1. Supabaseダッシュボードにログイン
2. 左側メニューの「Authentication」をクリック
3. 「Providers」タブを選択
4. 「Email」セクションで以下を設定：
   - **Confirm email**: OFF（無効にする）
   - **Secure email change**: OFF（無効にする）
   - **Secure password change**: OFF（無効にする）

5. 「Save」をクリックして保存

これにより、ユーザーはサインアップ後すぐにログインできるようになります。

## エラーが続く場合

もし「Email not confirmed」エラーが続く場合は、以下のSQLを実行してください：

```sql
-- すべてのユーザーのメール確認を強制的に完了させる
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

このSQLは「SQL Editor」から実行できます。
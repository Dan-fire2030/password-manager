# アプリアイコン生成ガイド

## 概要
`app-icon.svg`をベースに、以下のサイズのPNGアイコンを生成してください。

## 必要なアイコンサイズ

### PWAアイコン
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)  
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px) - PWA必須
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px) - PWA必須

### Apple Touch Icon
- `apple-touch-icon.png` (180x180px)

### Favicon
- `favicon-32x32.png` (32x32px)
- `favicon-16x16.png` (16x16px)
- `favicon.ico` (複数サイズ含む)

### ショートカットアイコン
- `search.png` (96x96px) - 検索ショートカット用
- `add.png` (96x96px) - 追加ショートカット用

## 生成方法

### 方法1: オンラインツール
1. [Favicon Generator](https://www.favicon-generator.org/) などのツールを使用
2. `app-icon.svg` をアップロード
3. 必要なサイズを選択して生成
4. 生成されたファイルを `/public/icons/` に配置

### 方法2: ImageMagick (コマンドライン)
```bash
# SVGから各サイズのPNGを生成
convert app-icon.svg -resize 72x72 icon-72x72.png
convert app-icon.svg -resize 96x96 icon-96x96.png
convert app-icon.svg -resize 128x128 icon-128x128.png
convert app-icon.svg -resize 144x144 icon-144x144.png
convert app-icon.svg -resize 152x152 icon-152x152.png
convert app-icon.svg -resize 192x192 icon-192x192.png
convert app-icon.svg -resize 384x384 icon-384x384.png
convert app-icon.svg -resize 512x512 icon-512x512.png
convert app-icon.svg -resize 180x180 apple-touch-icon.png
convert app-icon.svg -resize 32x32 favicon-32x32.png
convert app-icon.svg -resize 16x16 favicon-16x16.png
```

### 方法3: Adobe Illustrator / Figma
1. `app-icon.svg` を開く
2. アートボードを各サイズに設定
3. PNG形式でエクスポート

## デザインガイドライン
- メインカラー: #3b82f6 (青)
- アクセントカラー: #1e40af (濃い青)
- 背景: 白色
- モチーフ: 鍵とセキュリティシンボル
- スタイル: モダン、シンプル、直感的

## 配置完了後
アイコンの生成・配置が完了したら、以下のファイルを更新してください:
- `/app/layout.tsx` - favicon リンクの追加
- `/public/manifest.json` - アイコンパスの確認

## 注意事項
- 全てのアイコンは透明背景ではなく、円形の背景を持つデザインにしてください
- iOS用のアイコンはマスク可能 (maskable) にしてください
- 小さいサイズ（16px, 32px）でも視認性を保つため、細部は簡略化してください
# Stillnest

静かな写真SNS - A quiet photography social network

## 概要

Stillnestは写真に集中できる静かなSNSプラットフォームです。数値的なエンゲージメント（いいね数、フォロワー数など）を隠し、純粋な写真の鑑賞と表現に重きを置いたデザインになっています。

## 主な機能

- 📸 高品質な写真アップロード
- 🎨 カスタマイズ可能なギャラリーレイアウト
- 🔍 写真家の発見機能
- 📱 レスポンシブデザイン
- 🔒 プライバシー重視の設計
- 📴 オフライン対応

## 技術スタック

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel
- **PWA**: Service Workers, Offline Support

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## デプロイ

このプロジェクトはVercelでホストされており、`main`ブランチへのプッシュで自動デプロイされます。

## ライセンス

MIT License
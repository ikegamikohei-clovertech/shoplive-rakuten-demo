# OnAir Console（デモ）

楽天市場の出店店舗がShopliveでライブコマース配信を行うための、楽天専用ダッシュボードのデモ実装です。設計は [design/onair-console-design.html](design/onair-console-design.html)（[公開版](https://claude.ai/code/artifact/12a281c5-609c-4403-a535-3ca5d6ea4bb5)）を参照してください。

Shoplive APIには実際に接続します（`private.shopliveapi.com`）。承認・申請ステータスなど楽天独自のデータはDBを持たず、ブラウザの`localStorage`だけで完結します（詳細は設計書参照）。

## セットアップ

```bash
npm install
npm run seed   # プレースホルダーSellerを用意し .env に SHOPLIVE_PLACEHOLDER_SELLER_ID を追記
npm run dev    # http://localhost:3000
```

`.env` に `SHOPLIVE_ACCESS_KEY` / `SHOPLIVE_JWT_TOKEN` が設定済みであることが前提です。

## デモの流れ

1. `/store/signup` — 店舗アカウントを申請する
2. `/admin/accounts` — 申請を確認して承認する（Shoplive `Create a seller` を呼び出す）
3. `/store/live/new` — 承認された店舗としてライブを新規作成する（`Create a campaign` + `Add products`）
4. `/admin/live-requests` — ライブ申請を確認して承認する（`transferToSeller` で該当店舗へ引き渡し）
5. `/store/live` → 対象ライブの「配信コンソールを開く」— リハーサル/配信の開始・終了、在庫状況、Now表示を操作する
6. `/admin/onair` — 配信中のライブを一覧・プレビューする

## 既知の制約

- **Create a seller がこの検証用アカウントでは500エラーを返す**（ペイロード内容に関わらず再現）。おそらくこのAPIキーのプラン／権限による制限。アプリ側は自動でフォールトレラントに動作し、失敗時は既存のSeller（`Search sellers`で取得）を割り当てて処理を継続します。管理画面の詳細パネルに「（既存Seller割当）」と表示されます。
- ポップアップ（バナー）、キャンペーンの画像・動画系項目（logoImageUrl等）、tagsはShoplive API側に書き込み手段がないため未実装です（設計書の制約セクション参照）。
- 商品構成の並び替えはHTML5ネイティブドラッグ&ドロップで実装し、ドロップの都度 `PUT .../product/order` を呼び出します。
- 統計（視聴数・いいね等）は実際に配信が行われ視聴者がつくまでAPIが404を返すため、その間は「統計データはまだありません」と表示します。
- `npm audit` はNext.js 14系に対する既知の脆弱性を報告します（今回のデモでは影響の薄いミドルウェア/カスタムサーバー関連が中心）。本番運用に転用する場合はNext.js 15/16系への移行を検討してください。
- このコンテナ環境にはヘッドレスブラウザの共有ライブラリ（libnspr4等）がなく、Playwright等でのスクリーンショット確認は行えませんでした。UI動作は各APIルートへのcurl実行と、Next.jsのビルド・型チェックで検証しています。

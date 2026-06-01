# 樞 名駅店 LP + ブランドサイト

静的サイトとして作成しています。ブラウザで `index.html` を開けば表示できます。

## 構成

- `index.html`: LP本文、構造化データ、予約導線
- `styles.css`: レスポンシブデザイン
- `script.js`: モバイルナビ、FAQ、スライダー、席モーダル、遅延読み込み
- `styles.min.css` / `script.min.js`: 公開用に参照している圧縮済みファイル
- `images/optimized/`、`images/FOOD/web/optimized/`: WebP化した公開用画像
- `dist/`: 公開用ファイル一式
- `robots.txt` / `sitemap.xml` / `site.webmanifest` / `_headers`: SEO、PWA表示、静的ホスティング向けヘッダー

## 更新手順

CSS / JS を編集した場合は、公開前に圧縮ファイルを再生成してください。

```bash
npx --yes clean-css-cli -o styles.min.css styles.css
npx --yes terser script.js --compress --mangle --comments false -o script.min.js
```

`dist/` へ反映する場合は、更新後の HTML、CSS、JS、画像、補助ファイルを同期します。

## 調査ソース

- HotPepper: https://www.hotpepper.jp/strJ000107827/
- HotPepper コース: https://www.hotpepper.jp/strJ000107827/course/
- HotPepper 料理: https://www.hotpepper.jp/strJ000107827/food/
- HotPepper ドリンク: https://www.hotpepper.jp/strJ000107827/drink/
- HotPepper 地図・詳細: https://www.hotpepper.jp/strJ000107827/map/
- 公式サイト: https://taste-net.co.jp/kululu-meieki/
- 名古屋市観光情報: https://www.nagoya-info.jp/gourmet/detail/4/
- なごやめし公式サイト: https://nagoya-meshi.jp/nagoyameshi-search/detail/%E6%A8%9E-%E2%80%90%E3%81%8F%E3%82%8B%E3%82%8B%E2%80%90-%E5%90%8D%E9%A7%85%E5%BA%97/
- 名古屋名物サイト: https://nagoya.xtone.jp/archives/kururu_meieki.html

## 追加反映した情報

- 評点、レビュー総評、口コミ件数の見え方
- コース価格帯、個別盛り会席、飲み放題条件
- 単品料理の価格・料理カテゴリ
- 地酒、生ビール、単品飲み放題
- 席種、人数目安、宴会設備
- 支払い、禁煙、英語メニュー、キャンセル規定

営業時間、価格、席数、コース、臨時休業は変更される可能性があるため、公開時には店舗または予約媒体で再確認してください。

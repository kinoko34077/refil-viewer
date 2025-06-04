# 📘 Refil Viewer

Vue + Vite製の「電子リフィル」ビューア。  
PDFのようにページ単位で情報を表示しつつ、Markdown・画像・外部PDFなどを組み合わせた**動的ノート環境**を実現します。

※まだ作りかけでまともに動かないです
今はまだウェブページの下位互換

---

## 🔧 機能概要

- `.refil` ファイル（YAML形式）によりページ構成を定義
- Markdown / 画像 / PDFページの表示に対応
- ChromeのPDFビューア風レイアウト（サイドバー＋ページ表示）
- ページの並び替え・回転・差替えも将来的に対応予定

---

## 📂 使用技術

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [js-yaml](https://github.com/nodeca/js-yaml)

---

## 🚀 開発環境の立ち上げ

```bash
git clone https://github.com/あなたのユーザー名/refil-viewer.git
cd refil-viewer
npm install
npm run dev
````

---

## 🌐 使い方（開発サーバ上）

```bash
http://localhost:5173/?file=/sample.refil&page=001
```

`public/sample.refil` には以下のような内容を定義：

```yaml
title: サンプル電子リフィル
pages:
  - id: 001
    type: markdown
    src: "pages/001.md"

  - id: 002
    type: image
    src: "https://example.com/image.png"
    rotate: 0

  - id: 003
    type: pdf
    src: "https://example.com/sample.pdf"
    page: 1
```

---

## 🗺 今後の実装予定

* PDF.js を使ったPDF内部描画
* サムネイル表示によるページプレビュー
* ページタグ・検索・絞り込みUI
* `.refil → .zip / .epub` エクスポート
* オフライン閲覧（PWA化）

---

## 📄 ライセンス

MIT License


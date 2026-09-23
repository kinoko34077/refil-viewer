# refil-viewer Project Overlay

このファイルは既存 `refil-viewer` に追加したKiNoTch Project Overlayの入口です。Vue/ViteアプリとViewer実装はrootに残します。

## 概要

`refil-viewer` は、ブラウザ上でrefil形式のコンテンツを閲覧・変換するWebアプリです。

- 個別情報・仕様・実装: project/
- 個別プロジェクト定義: project/project.json
- 個別仕様索引: project/docs/INDEX.md
- 現在状態: project/docs/CURRENT_STATE.md
- 共通操作: .kinotch/README_BASE.md

## 所有境界

- Vue UI、Vite構成、Viewer rendering、データ形式、exportはProject側の既存実装を正本とします。
- KiNoTch Baseはrepository構造、診断、verify入口を提供します。
- Web Surfaceは既存Vite実装を `OVERRIDE` として記録します。

## 最短利用方法

```powershell
.\knt.cmd doctor
.\knt.cmd setup
.\knt.cmd verify
```

既存の利用方法はroot READMEとpackage.jsonを参照してください。

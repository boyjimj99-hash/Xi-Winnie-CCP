# Chess Game｜西洋棋

這是一款可以直接上傳到 GitHub Pages 的西洋棋網頁遊戲。

## 遊戲功能

- 雙人同機對戰
- 白方先手
- 點選棋子後顯示可走位置
- 支援基本合法走法
- 支援將軍判定
- 支援將死判定
- 支援和棋無合法步判定
- 支援王車易位
- 兵到最後一排會自動升變為后
- 顯示被吃掉的棋子
- 可重新開始

## 目前限制

- 目前不支援吃過路兵
- 兵升變會自動變成后，尚未提供手動選擇

## 專案結構

```text
chess-game/
├── index.html
├── style.css
├── script.js
├── README.md
└── .nojekyll
```

## 如何遊玩

直接用瀏覽器打開 `index.html` 即可遊玩。

## GitHub Pages 上傳方式

1. 建立新的 GitHub repository。
2. 將本資料夾內的檔案上傳到 repository 根目錄。
3. 確認 `index.html` 在根目錄。
4. 到 Settings。
5. 進入 Pages。
6. Source 選 `Deploy from a branch`。
7. Branch 選 `main`，資料夾選 `/root`。
8. 儲存後等待部署完成。

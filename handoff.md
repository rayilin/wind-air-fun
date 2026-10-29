# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（L3）。

## ⏯️ 目前做到哪
教材與教學網頁已完成並上線 GitHub Pages；只剩 Render 對戰後端需要在後台套用藍圖。

## 🚦 目前狀態
| 項目 | 狀態 |
|------|------|
| 教案 docx | ✅ 完成 |
| 教學簡報 pptx／14 張 JPG | ✅ 完成（含 2 段動畫） |
| 教學網頁 | ✅ 完成並上線（10 區塊，含語音朗讀） |
| 對戰（battle.html／server.js／30 題） | ✅ 完成（本機已驗證啟動） |
| 素材圖庫 | ✅ 170 張＋2 段影片 |
| GitHub Pages | ✅ 已上線（run 40809079074） |
| Render 對戰後端 | ⏳ 藍圖完成（`wind-battle`），待後台套用 |

## 🔗 網址
- 首頁：https://rayilin.github.io/wind-air-fun/
- 對戰頁：https://rayilin.github.io/wind-air-fun/battle.html
- repo：https://github.com/rayilin/wind-air-fun
- 雲端後端：https://wind-battle.onrender.com（尚未建立）

## 📌 重要修正紀錄
- `教學網頁/media`、`slides`、`downloads` 曾誤判為空：那是資料夾本身大小 0，內容其實齊全（170／14／2）。
- `battle-api.js` 目前留空＝教室區網模式；Render 服務建立後再填網址。
- `battle.html` 已有冷啟動喚醒與重試，key 為 `windBattleName`。
- 已修：未接雲端後端時不再白戳 `/api/health`（console 0 error），區網說明改顯示「老師電腦的 IP」。
- 已修技能 `verify_site.js`：第 12 項原本會把註解裡的範例網址誤判成已設定，現在會先去掉註解。

## ➡️ 下一步
1. Render 後台 Blueprint 套用 `render.yaml` → 建立 `wind-battle` → 網址填回 `battle-api.js` 並 push
2. 上課前實機驗收：投影簡報（第 5、11 頁動畫）、平板測驗語音、兩人對戰
3. （選）補學習單與測驗卷 PDF 到 `downloads/`

## ⚠️ 注意事項
- 絕對不要用 LibreOffice 轉中文 PDF（字型子集損壞）
- 驗收：`$env:UNIT_DIR="<風與空氣>"; node <skill>\scripts\verify_site.js`
- 學生資料只用座號；不要把憑證寫進 repo

## 🕐 最後更新
- 時間：2026-10-29 10:56
- 更新者：OpenCode Agent @ Windows
- Git push：✅ 已推（`051f391`）

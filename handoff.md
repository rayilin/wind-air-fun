# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（L3）。

## ⏯️ 目前做到哪
教材與教學網頁都已完成，補上 Pages／Render 上線骨架，準備推送與部署。

## 🚦 目前狀態
| 項目 | 狀態 |
|------|------|
| 教案 docx | ✅ 完成 |
| 教學簡報 pptx／14 張 JPG | ✅ 完成（含 2 段動畫） |
| 教學網頁 | ✅ 完成（10 區塊，含語音朗讀） |
| 對戰（battle.html／server.js／30 題） | ✅ 完成 |
| 素材圖庫 | ✅ 170 張＋2 段影片 |
| GitHub Pages | ⏳ 推送後由 workflow 部署 |
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

## ➡️ 下一步
1. 推送 `rayilin/wind-air-fun`，啟用 Pages（`build_type=workflow`）
2. Render 後台 Blueprint 套用 `render.yaml` → 建立 `wind-battle` → 網址填回 `battle-api.js`
3. 上課前實機驗收：投影簡報、平板測驗語音、兩人對戰

## ⚠️ 注意事項
- 絕對不要用 LibreOffice 轉中文 PDF（字型子集損壞）
- 驗收：`$env:UNIT_DIR="<風與空氣>"; node <skill>\scripts\verify_site.js`
- 學生資料只用座號；不要把憑證寫進 repo

## 🕐 最後更新
- 時間：2026-10-29
- 更新者：OpenCode Agent @ Windows
- Git push：待推

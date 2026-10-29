# 風與空氣（專案藍圖）

> 本檔為跨 Agent 通用的專案藍圖（AGENTS.md 開放標準）。任何 Agent 的每個 session 都應先讀本檔＋`handoff.md`。

## 專案簡介
翰林三上 第 3 單元「風與空氣」的教學專案：教案、14 頁教學簡報（含 2 段動畫）、
互動教學網頁（課程地圖＋互動實驗＋簡報播放器＋10 題測驗＋語音朗讀＋參考影片＋抽籤計時器＋170 張素材圖庫）、
兩人即時配對搶答（30 題），部署到 GitHub Pages（＋ Render 跑對戰後端）。

## 關鍵時程
- 第 1 節（第 11 週）　風在哪裡
- 第 2 節（第 12 週）　空氣躲在哪
- 第 3 節（第 13 週）　把風玩起來
- 每節 40 分鐘，共 3 節（120 分鐘）

## 課綱對接（108 課綱第二階段）
- 學習表現：po-Ⅱ-2、pe-Ⅱ-1、pc-Ⅱ-2、ai-Ⅱ-2
- 學習內容：INa-Ⅱ-3（物質特性）、INb-Ⅱ-2（物質或自然現象改變）
- 核心素養：自-E-A1、A2、A3、B1、B2、C2

## 目標與路線圖
- [x] 階段 0：教案 docx
- [x] 階段 1：教學簡報 pptx（14 頁，含 2 段動畫）
- [x] 階段 2：素材圖庫（170 張＋縮圖＋images.js）
- [x] 階段 3：教學網頁（10 區塊，含語音朗讀與互動實驗）
- [x] 階段 4：對戰（battle.html／server.js／30 題）
- [x] 階段 5：驗收（`verify_site.js` 全過、瀏覽器 0 console error）
- [x] 階段 6：上線 GitHub Pages
- [ ] 階段 7：對戰後端上 Render（`wind-battle`，待後台套用藍圖）
- [ ] 階段 8：（選）旁白動畫 MP4

## 資料夾結構
```
風與空氣/                          ← 獨立 git repo（公開）
├── AGENTS.md                     專案藍圖（本檔）
├── handoff.md                    交接檔
├── .github/workflows/pages.yml   GitHub Pages 部署
├── render.yaml                   Render 藍圖（對戰後端）
├── battle-server.js              Render 啟動入口
├── 教案/                         教案 docx
├── 簡報/                         教學簡報 pptx
├── 影片/                         HyperFrames 影片專案（暫存檔已排除）
└── 教學網頁/
    ├── index.html                主網頁（單檔、file:// 可開）
    ├── battle.html               對戰頁
    ├── server.js                 對戰伺服器（區網／Render 共用）
    ├── questions.json            30 題題庫（部署時排除）
    ├── battle-api.js             雲端後端位址（空字串＝區網模式）
    ├── start-battle.bat          老師一鍵啟動區網對戰
    ├── slides/slideNN.jpg        簡報圖（14 張）
    ├── media/img/ media/thumb/   素材圖庫 170 張＋影片 2 段
    └── downloads/                可下載教材
```

## 重建方式
教材（教案／簡報）以既有檔案為準，本專案沒有 `工具/build_*.py`；重新產生圖庫時比照：
1. 素材來源：`D:\opencode\115上翰林國小3年級題庫\...\素材庫\1_試題\03風與空氣`（170 張）
2. 檔名格式 `03-0X-NNN-名稱.jpg` → `media/img/mNNN.jpg`、`media/thumb/mNNN.jpg`、`media/images.js`
3. 簡報 → JPG（PowerPoint COM）：
   `powershell -File <skill>\scripts\pptx_to_jpg.ps1 -Pptx "簡報\風與空氣_教學簡報.pptx" -OutDir "教學網頁\slides"`
4. 驗收：`node <skill>\scripts\verify_site.js "風與空氣"`（用 `$env:UNIT_DIR` 指定路徑）

- **絕對不要用 LibreOffice 轉中文 PDF**：字型子集損壞。
- **python-pptx 要補 `a:ea` 字型**，否則中文掉字型。

## 同步層級
| 層級 | 平台 | 位置 | 讀取時機 |
|------|------|------|---------|
| L1 | 本地 | `AGENTS.md`＋`handoff.md` | 每個 session |
| L2 | GitHub | `rayilin/wind-air-fun`（公開） | 指定時 |
| L3 | Obsidian | `創作庫/風與空氣/專案工作流程.md` | 有需要時 |

## 已上線網址
- 教學網頁：https://rayilin.github.io/wind-air-fun/
- 對戰頁：https://rayilin.github.io/wind-air-fun/battle.html
- 雲端對戰後端：https://wind-battle.onrender.com（待 Render 建立服務）

## 工作約定
- **開工先讀 `handoff.md`，收工必更新 `handoff.md`**
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文
- 修改前先確認計畫，優先保留原有資料結構
- 不刪使用者既有資料夾、舊版教材、素材原圖

## 安全與隱私（不可違反）
- **不把 API key、密碼、憑證寫進 repo**；一律放 `.env` 並列入 `.gitignore`
- **學生資料只用座號**，不出現姓名、學號、班級以外的個資、照片或聯絡方式
- `questions.json`（對戰答案）**不得**部署到公開網站（Pages 與 Render 都要 404）

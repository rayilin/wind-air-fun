// 風與空氣｜SOIL 教學簡報 × motion-explainer（14 頁，第 5、11 頁嵌入動畫）
// 動畫片段：media/p05.mp4（流動成風）、media/p11.mp4（紙飛機變因），封面＝最後畫面 PNG。
// 用法：cd deck && npm install && node build_deck.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const { makeDeck } = require("./deck_helpers");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pptx.title = "風與空氣：翰林三上自然 第3單元";

// 配色：風與空氣藍色系（墨綠 #35544A + 天藍）。深色頁用影片三色；淺色頁用深一階的天藍當強調。
const D = makeDeck(pptx, {
  theme: { bg: "35544A", fg: "FAF7F0", accent: "5BB8E8" },
  colors: { wind: "2E86AB", windSoft: "E3F0F6" },
  mediaDir: path.join(__dirname, "media"),
});
const { C, H, M, title, lightSlide, darkSlide, video, card } = D;
const W = C.wind;           // 淺色頁強調（天藍）
const WS = C.windSoft;      // 淺色頁底

// ── 小工具：章節色塊卡片 ──
function unit(s, x, y, w, h, head, body, color) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: WS }, line: { color: color, width: 2 } });
  s.addText(head, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.7, fontFace: H, fontSize: 26, bold: true, color: color });
  s.addText(body, { x: x + 0.25, y: y + 0.95, w: w - 0.5, h: h - 1.1, fontFace: M, fontSize: 18, color: C.ink, valign: "top" });
}

// 1 封面（深色）
{
  const s = darkSlide(null);
  s.addText("翰林版・三年級上學期 自然科學", { x: 0.9, y: 1.5, w: 11.5, h: 0.5, fontFace: M, fontSize: 22, color: C.accent });
  s.addText("風與空氣", { x: 0.9, y: 2.15, w: 11.5, h: 1.7, fontFace: H, fontSize: 96, color: C.darkInk, bold: true });
  s.addText("第 3 單元｜3 節課", { x: 0.9, y: 4.0, w: 11.5, h: 0.8, fontFace: H, fontSize: 34, color: C.darkInk });
  s.addText("風是流動的空氣：看不見、卻佔空間、有力量", { x: 0.9, y: 5.3, w: 11.5, h: 0.8, fontFace: H, fontSize: 30, color: C.accent });
  s.addNotes("開場：不先下定義，直接問「風看得見嗎」，從生活經驗出發。");
}

// 2 問題引入（淺色）
{
  const s = lightSlide("問題引入");
  title(s, "風看得見嗎？", { size: 52 });
  s.addText("你怎麼知道「現在有風」？", { x: 0.6, y: 2.2, w: 12.1, h: 0.7, fontFace: M, fontSize: 28, color: C.sub });
  const clues = [["🍃 落葉被吹走", "看得到東西在動"], ["🌬️ 旗子、風鈴在動", "看得到方向與快慢"], ["👂 耳邊有呼呼聲", "聽得到風的聲音"], ["🌡 皮膚涼涼的", "身體感覺得到"]];
  clues.forEach(([a, b], i) => {
    const x = 0.6 + (i % 2) * 6.2, y = 3.2 + Math.floor(i / 2) * 1.7;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.9, h: 1.45, rectRadius: 0.12, fill: { color: WS }, line: { color: W, width: 1.5 } });
    s.addText(a, { x: x + 0.3, y: y + 0.15, w: 5.3, h: 0.6, fontFace: H, fontSize: 24, color: C.ink });
    s.addText(b, { x: x + 0.3, y: y + 0.75, w: 5.3, h: 0.5, fontFace: M, fontSize: 17, color: C.sub });
  });
  s.addNotes("【引起動機】請學生閉上眼睛，用手、用耳朵、用皮膚感覺有沒有風，再分享。");
}

// 3 課程地圖（淺色）
{
  const s = lightSlide("課程地圖");
  title(s, "三節課，一步步認識風與空氣");
  const parts = [
    ["3-1 風在哪裡", "風向與風力：觀察、自製風向計、紀錄"],
    ["3-2 空氣躲在哪", "空氣佔有空間、可被壓縮、流動成風"],
    ["3-3 把風玩起來", "紙飛機、氣球車、生活應用與測驗"],
  ];
  parts.forEach(([a, b], i) => unit(s, 0.6 + i * 4.1, 2.4, 3.9, 2.6, a, b, W));
  s.addText("動手做 → 找規律 → 用出來", { x: 0.6, y: 5.4, w: 12.1, h: 0.7, fontFace: H, fontSize: 26, color: W, align: "center" });
  s.addNotes("三節課的脈絡：先感受、再探究特性、最後應用。");
}

// 4 迷思澄清（淺色）
{
  const s = lightSlide("迷思澄清");
  title(s, "風向：吹來？還是吹往？");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 5.9, h: 2.2, rectRadius: 0.12, fill: { color: "FBEFED" }, line: { color: "B4483C", width: 2 } });
  s.addText("❌ 常見誤解", { x: 0.85, y: 2.45, w: 5.4, h: 0.5, fontFace: H, fontSize: 20, color: "B4483C" });
  s.addText("風向是風「吹往」的方向", { x: 0.85, y: 3.05, w: 5.4, h: 1.2, fontFace: M, fontSize: 24, color: C.ink });
  s.addShape(pptx.ShapeType.roundRect, { x: 6.85, y: 2.3, w: 5.9, h: 2.2, rectRadius: 0.12, fill: { color: WS }, line: { color: W, width: 2 } });
  s.addText("✅ 正確理解", { x: 7.1, y: 2.45, w: 5.4, h: 0.5, fontFace: H, fontSize: 20, color: W });
  s.addText("風向是風「吹來」的方向", { x: 7.1, y: 3.05, w: 5.4, h: 1.2, fontFace: M, fontSize: 24, color: C.ink });
  s.addText("例：旗子飄向南方 → 風從北方來，叫做「北風」。", { x: 0.6, y: 4.9, w: 12.1, h: 0.7, fontFace: M, fontSize: 22, color: C.ink });
  s.addNotes("記法：風向是風「從哪裡來」，跟旗子飄的方向剛好相反。");
}

// 5 🎬 流動成風（動畫）
{
  const s = lightSlide("流程・動畫");
  title(s, "流動成風：流動快慢決定風力");
  video(s, "p05", 0.6, 2.0, 8.0);
  const steps = ["① 無風：紙條不動", "② 微風：紙條輕輕晃", "③ 強風：紙條大幅搖擺"];
  steps.forEach((t, i) => s.addText(t, { x: 9.0, y: 2.2 + i * 1.25, w: 3.9, h: 1.1, fontFace: M, fontSize: 19, color: C.ink, valign: "top" }));
  s.addText("流動越快 → 風力越強", { x: 9.0, y: 6.2, w: 3.9, h: 0.7, fontFace: H, fontSize: 28, color: W, align: "center" });
  s.addNotes("播放動畫（約 18 秒，靜音）。邊播邊問：「紙條為什麼越晃越大？」");
}

// 6 流程（淺色）
{
  const s = lightSlide("流程");
  title(s, "做一個風力風向計");
  const steps = [["1", "紙杯當底座\n插一根圖釘當轉軸"], ["2", "吸管上固定\n紙箭頭"], ["3", "貼上方位卡\n東南西北"], ["4", "到操場觀測\n記錄風向風力"]];
  steps.forEach(([n, t], i) => {
    const x = 0.6 + i * 3.2;
    s.addShape(pptx.ShapeType.ellipse, { x, y: 2.4, w: 1.0, h: 1.0, fill: { color: W } });
    s.addText(n, { x, y: 2.5, w: 1.0, h: 0.8, fontFace: H, fontSize: 36, color: "FFFFFF", align: "center", bold: true });
    s.addText(t, { x: x - 0.5, y: 3.7, w: 2.8, h: 1.6, fontFace: M, fontSize: 16, color: C.ink, align: "center" });
    if (i < 3) s.addText("→", { x: x + 1.15, y: 2.6, w: 0.9, h: 0.6, fontFace: H, fontSize: 30, color: W, align: "center" });
  });
  s.addText("風向＝風吹來的方向；風力分無風、微風、強風。", { x: 0.6, y: 5.6, w: 12.1, h: 0.7, fontFace: M, fontSize: 22, color: C.ink });
  s.addNotes("實作課：先示範，再讓學生分組動手。紀錄至少三個地點。");
}

// 7 過渡（淺色）
{
  const s = lightSlide("過渡");
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WS } });
  s.addText("3-2", { x: 0.6, y: 2.0, w: 3.0, h: 1.6, fontFace: H, fontSize: 110, color: W, bold: true });
  s.addText("空氣躲在哪", { x: 3.8, y: 2.5, w: 8.5, h: 1.2, fontFace: H, fontSize: 56, color: C.ink, bold: true });
  s.addText("空氣看不見，怎麼證明它存在？", { x: 3.8, y: 3.8, w: 8.5, h: 0.7, fontFace: M, fontSize: 24, color: C.sub });
  s.addNotes("轉場：把「看不見的空氣」變成「摸得到、看得到的證據」。");
}

// 8 案例（淺色）
{
  const s = lightSlide("案例");
  title(s, "空氣佔有空間");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 6.0, h: 3.4, rectRadius: 0.15, fill: { color: "FFFFFF" }, line: { color: C.line, width: 1.5 } });
  s.addText("🥛 倒扣杯子，壓入水中", { x: 0.9, y: 2.5, w: 5.4, h: 0.7, fontFace: H, fontSize: 26, color: C.ink });
  s.addText("杯裡貼乾面紙\n杯子倒扣壓進水裡\n→ 面紙還是乾的！", { x: 0.9, y: 3.4, w: 5.4, h: 2.1, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("杯子裡有空氣，佔住空間\n水進不去。傾斜杯子讓\n空氣跑掉，水才會進去。", { x: 6.9, y: 2.5, w: 5.8, h: 2.2, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("→ 看不見的空氣，其實佔有空間", { x: 6.9, y: 5.0, w: 5.8, h: 0.7, fontFace: H, fontSize: 26, color: W });
  s.addNotes("迷思翻轉：學生常以為「看不見＝不存在」，用排水法讓氣泡看得到。");
}

// 9 案例（淺色）
{
  const s = lightSlide("案例");
  title(s, "空氣可被壓縮");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 6.0, h: 3.4, rectRadius: 0.15, fill: { color: "FFFFFF" }, line: { color: C.line, width: 1.5 } });
  s.addText("💉 針筒實驗", { x: 0.9, y: 2.5, w: 5.4, h: 0.7, fontFace: H, fontSize: 26, color: C.ink });
  s.addText("針筒封口，推活塞\n→ 可以推進、會回彈\n（空氣被壓縮）", { x: 0.9, y: 3.4, w: 5.4, h: 2.1, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("換成裝水再推\n→ 推不動（水不易壓縮）\n\n空氣 vs 水，特性不一樣。", { x: 6.9, y: 2.5, w: 5.8, h: 2.6, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("→ 空氣可以被壓縮、會回彈", { x: 6.9, y: 5.0, w: 5.8, h: 0.7, fontFace: H, fontSize: 26, color: W });
  s.addNotes("對比實驗：同一個針筒，先裝空氣、再裝水，比較差異。");
}

// 10 過渡（淺色）
{
  const s = lightSlide("過渡");
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: WS } });
  s.addText("3-3", { x: 0.6, y: 2.0, w: 3.0, h: 1.6, fontFace: H, fontSize: 110, color: W, bold: true });
  s.addText("把風玩起來", { x: 3.8, y: 2.5, w: 8.5, h: 1.2, fontFace: H, fontSize: 56, color: C.ink, bold: true });
  s.addText("流動的空氣有力量，用玩具來證明。", { x: 3.8, y: 3.8, w: 8.5, h: 0.7, fontFace: M, fontSize: 24, color: C.sub });
  s.addNotes("轉場：進入應用，用紙飛機、氣球車把「風力」變成看得見的結果。");
}

// 11 🎬 紙飛機變因（動畫）
{
  const s = lightSlide("流程・動畫");
  title(s, "紙飛機變因實驗");
  video(s, "p11", 0.6, 2.0, 8.0);
  const steps = ["同一張紙、同一個人丟", "只改變機翼角度", "微翹角飛得最遠"];
  steps.forEach((t, i) => s.addText(t, { x: 9.0, y: 2.2 + i * 1.3, w: 3.9, h: 1.1, fontFace: M, fontSize: 19, color: C.ink, valign: "top" }));
  s.addText("控制單一變因", { x: 9.0, y: 6.2, w: 3.9, h: 0.7, fontFace: H, fontSize: 28, color: W, align: "center" });
  s.addNotes("播放動畫（約 18 秒，靜音）。問：「為什麼只改角度？如果每架都不一樣，比得出來嗎？」");
}

// 12 案例（淺色）
{
  const s = lightSlide("案例");
  title(s, "氣球車：空氣噴出來的力量");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 2.3, w: 6.0, h: 3.4, rectRadius: 0.15, fill: { color: "FFFFFF" }, line: { color: C.line, width: 1.5 } });
  s.addText("🎈 寶特瓶車＋氣球", { x: 0.9, y: 2.5, w: 5.4, h: 0.7, fontFace: H, fontSize: 26, color: C.ink });
  s.addText("氣球吹飽，放手\n→ 空氣往後噴\n→ 車子往前衝", { x: 0.9, y: 3.4, w: 5.4, h: 2.1, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("空氣噴出的力量\n推動車子前進\n\n氣球越大顆，噴出的\n空氣越多，跑越遠。", { x: 6.9, y: 2.5, w: 5.8, h: 2.6, fontFace: M, fontSize: 22, color: C.ink });
  s.addText("→ 流動的空氣有力量", { x: 6.9, y: 5.0, w: 5.8, h: 0.7, fontFace: H, fontSize: 26, color: W });
  s.addNotes("反作用力的初步體驗，不深究名詞，重點在「空氣噴出→車前進」的因果。");
}

// 13 分類（淺色）
{
  const s = lightSlide("分類・延伸");
  title(s, "風的生活應用");
  const apps = [["🌬 風力發電", "流動的空氣\n轉動風車發電"], ["🧺 晾衣服", "風加速蒸發\n衣服乾得快"], ["🪁 放風箏", "風往上推\n風箏飛起來"], ["⛵ 帆船", "風吹帆\n推船前進"]];
  apps.forEach(([a, b], i) => {
    const x = 0.6 + (i % 2) * 6.2, y = 2.4 + Math.floor(i / 2) * 2.3;
    unit(s, x, y, 5.9, 2.0, a, b, W);
  });
  s.addNotes("連結生活：這些都是「流動的空氣有力量」的應用。");
}

// 14 總結（深色）
{
  const s = darkSlide("總結");
  s.addText("帶走一句話", { x: 0.9, y: 1.4, w: 11.5, h: 0.6, fontFace: M, fontSize: 24, color: C.accent });
  s.addText("風是流動的空氣：", { x: 0.9, y: 2.1, w: 11.5, h: 1.1, fontFace: H, fontSize: 48, color: C.darkInk });
  s.addText([{ text: "看不見、卻佔空間、有力量", options: { color: C.accent } }], { x: 0.9, y: 3.25, w: 11.8, h: 1.1, fontFace: H, fontSize: 48, color: C.darkInk });
  s.addText("風向＝風吹來的方向　・　流動越快 → 風力越強", { x: 0.9, y: 5.0, w: 11.5, h: 0.8, fontFace: M, fontSize: 26, color: C.darkInk });
  s.addNotes("請學生不看螢幕，把這句話說一次，並舉一個生活中的例子。");
}

pptx.writeFile({ fileName: path.join(__dirname, "風與空氣_SOIL動畫版.pptx") }).then((f) => console.log("wrote", f));

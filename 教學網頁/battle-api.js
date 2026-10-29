/* 對戰後端位址設定
 *
 * 留空字串 = 使用同一個網站的 /api（老師電腦跑 start-battle.bat 的區網模式）。
 * 部署到 Render 之後，把下方網址填上即可切換成雲端對戰：
 *   window.BATTLE_API = 'https://wind-battle.onrender.com';
 *
 * 免費方案閒置 15 分鐘會休眠，第一次連線要等 30～60 秒，
 * 頁面會自動顯示「正在喚醒」並重試。
 *
 * 也可以不改這個檔案，直接在網址加上 ?api=https://xxx.onrender.com
 */
window.BATTLE_API = '';

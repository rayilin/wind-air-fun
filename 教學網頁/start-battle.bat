@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  正在啟動「風與空氣對戰」伺服器...
echo.
node server.js
echo.
echo  伺服器已停止。若視窗一閃就關閉，請確認已安裝 Node.js。
pause

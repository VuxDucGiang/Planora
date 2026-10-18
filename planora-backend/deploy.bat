@echo off
chcp 65001 >nul
echo ==============================================
echo   PLANORA BACKEND - AUTO DEPLOY TO VPS
echo ==============================================

echo [1/3] Đang đóng gói file .jar (Maven Build)...
call .\mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    echo [LỖI] Build Maven thất bại! Vui lòng kiểm tra lại code.
    pause
    exit /b %errorlevel%
)

echo [2/3] Đang tải file JAR lên VPS (160.191.51.35)...
scp target\planora-0.0.1-SNAPSHOT.jar root@160.191.51.35:/root/planora/target/
if %errorlevel% neq 0 (
    echo [LỖI] Không thể upload file lên VPS! Kiểm tra lại mạng hoặc mật khẩu.
    pause
    exit /b %errorlevel%
)

echo [3/3] Đang đóng gói lại Docker và khởi động Backend trên VPS...
ssh root@160.191.51.35 "cd /root/planora && docker rm -f planora-backend && (docker compose up -d --build backend || docker-compose up -d --build backend)"

echo ==============================================
echo   DEPLOY THÀNH CÔNG! Backend đã được cập nhật.
echo   Kiểm tra tại: https://api.planora.id.vn
echo ==============================================
pause

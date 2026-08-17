@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo   Kabar Sayap - Start Script
echo ==========================================

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js tidak ditemukan. Install dulu dari https://nodejs.org/
    pause
    exit /b 1
)

if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] .env.local belum ada, membuat dari .env.example ...
        copy ".env.example" ".env.local" >nul
        echo [PENTING] Isi dulu variabel di .env.local sebelum fitur DB/Auth/Mailer bisa jalan.
    )
)

echo [INFO] Mengecek/menginstall dependency ...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install gagal.
    pause
    exit /b 1
)

echo [INFO] Menjalankan development server ...
call npm run dev

pause

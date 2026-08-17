$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Kabar Sayap - Start Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "[ERROR] Node.js tidak ditemukan. Install dulu dari https://nodejs.org/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Write-Host "[INFO] .env.local belum ada, membuat dari .env.example ..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.local"
        Write-Host "[PENTING] Isi dulu variabel di .env.local sebelum fitur DB/Auth/Mailer bisa jalan." -ForegroundColor Yellow
    }
}

Write-Host "[INFO] Mengecek/menginstall dependency ..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install gagal." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Menjalankan development server ..." -ForegroundColor Cyan
npm run dev

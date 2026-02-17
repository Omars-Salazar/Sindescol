#!/usr/bin/env pwsh

Write-Host "Building SINDESCOL..." -ForegroundColor Cyan

# 1. Compilar frontend
Write-Host "1. Building frontend..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }
cd ..

# 2. Compilar backend a EXE
Write-Host "2. Building backend executable..." -ForegroundColor Yellow
if (-not (Test-Path "resources")) {
  New-Item -ItemType Directory -Path "resources" -Force | Out-Null
}

cd backend
npm run build:exe
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

# Mover el EXE a resources
if (Test-Path "server.exe") {
  Move-Item -Path "server.exe" -Destination "../resources/backend.exe" -Force
  Write-Host "Backend executable created: resources/backend.exe" -ForegroundColor Green
}
cd ..

# 3. Compilar con Electron Builder
Write-Host "3. Building Electron app..." -ForegroundColor Yellow
npx electron-builder

Write-Host "Build complete!" -ForegroundColor Green

# ╔════════════════════════════════════════════════════════════════╗
# ║        🧪 SINDESCOL - Testing & Development Suite             ║
# ║                    (PowerShell para Windows)                   ║
# ╚════════════════════════════════════════════════════════════════╝

param(
    [string]$Command = "help",
    [string]$Type = ""
)

function Show-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        🧪 SINDESCOL - Testing & Development Suite             ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Test-All {
    Show-Header
    Write-Host "Ejecutando tests en Backend y Frontend..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "📋 Backend Tests:" -ForegroundColor Blue
    Push-Location backend
    npm test
    $BackendStatus = $LASTEXITCODE
    Pop-Location
    
    Write-Host ""
    Write-Host "📋 Frontend Tests:" -ForegroundColor Blue
    Push-Location frontend
    npm test
    $FrontendStatus = $LASTEXITCODE
    Pop-Location
    
    if ($BackendStatus -eq 0 -and $FrontendStatus -eq 0) {
        Write-Host "✅ Todos los tests pasaron!" -ForegroundColor Green
    } else {
        Write-Host "❌ Algunos tests fallaron" -ForegroundColor Red
    }
}

function Test-Backend {
    Show-Header
    Write-Host "📋 Backend Tests:" -ForegroundColor Blue
    Push-Location backend
    npm test
    Pop-Location
}

function Test-Frontend {
    Show-Header
    Write-Host "📋 Frontend Tests:" -ForegroundColor Blue
    Push-Location frontend
    npm test
    Pop-Location
}

function Test-Watch {
    Show-Header
    if ($Type -eq "backend") {
        Write-Host "👀 Backend Tests (Watch Mode):" -ForegroundColor Blue
        Push-Location backend
        npm run test:watch
        Pop-Location
    } elseif ($Type -eq "frontend") {
        Write-Host "👀 Frontend Tests (Watch Mode):" -ForegroundColor Blue
        Push-Location frontend
        npm run test:watch
        Pop-Location
    } else {
        Write-Host "Error: Especifica 'backend' o 'frontend'" -ForegroundColor Red
        Write-Host "Uso: .\run.ps1 test:watch backend" -ForegroundColor Yellow
    }
}

function Coverage-All {
    Show-Header
    Write-Host "📊 Generando reportes de cobertura..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Backend Coverage:" -ForegroundColor Blue
    Push-Location backend
    npm run test:coverage
    Pop-Location
    
    Write-Host ""
    Write-Host "Frontend Coverage:" -ForegroundColor Blue
    Push-Location frontend
    npm run test:coverage
    Pop-Location
    
    Write-Host ""
    Write-Host "✅ Reportes listos!" -ForegroundColor Green
    Write-Host "  Backend:  backend\coverage\lcov-report\index.html" -ForegroundColor Green
    Write-Host "  Frontend: frontend\coverage\lcov-report\index.html" -ForegroundColor Green
}

function Coverage-Backend {
    Show-Header
    Write-Host "📊 Backend Coverage:" -ForegroundColor Blue
    Push-Location backend
    npm run test:coverage
    Pop-Location
}

function Coverage-Frontend {
    Show-Header
    Write-Host "📊 Frontend Coverage:" -ForegroundColor Blue
    Push-Location frontend
    npm run test:coverage
    Pop-Location
}

function Start-Dev {
    Show-Header
    Write-Host "Iniciando ambiente de desarrollo..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "▶️  Backend en puerto 3000" -ForegroundColor Green
    Write-Host "▶️  Frontend en puerto 5173" -ForegroundColor Green
    Write-Host ""
    
    # Ejecutar backend en proceso separado
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal
    
    # Ejecutar frontend en proceso separado
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
    
    Write-Host "✅ Ambiente iniciado!" -ForegroundColor Green
    Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
}

function Install-Dependencies {
    Show-Header
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "📦 Backend dependencies:" -ForegroundColor Blue
    Push-Location backend
    npm install
    Pop-Location
    
    Write-Host ""
    Write-Host "📦 Frontend dependencies:" -ForegroundColor Blue
    Push-Location frontend
    npm install
    Pop-Location
    
    Write-Host ""
    Write-Host "✅ Dependencias instaladas!" -ForegroundColor Green
}

function Build-Desktop {
    Show-Header
    Write-Host "🔨 Construyendo instalador desktop para Windows..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1️⃣  Compilando frontend..." -ForegroundColor Blue
    Push-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error compilando frontend" -ForegroundColor Red
        Pop-Location
        return
    }
    Pop-Location
    
    Write-Host ""
    Write-Host "2️⃣  Construyendo instalador (.exe)..." -ForegroundColor Blue
    npm run dist
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Instalador creado exitosamente!" -ForegroundColor Green
        Write-Host "   Ubicación: dist/*.exe" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al crear instalador" -ForegroundColor Red
    }
}

function Build-Portable {
    Show-Header
    Write-Host "🔨 Construyendo ejecutable portátil..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1️⃣  Compilando frontend..." -ForegroundColor Blue
    Push-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error compilando frontend" -ForegroundColor Red
        Pop-Location
        return
    }
    Pop-Location
    
    Write-Host ""
    Write-Host "2️⃣  Construyendo ejecutable portátil..." -ForegroundColor Blue
    npm run dist:portable
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Ejecutable portátil creado!" -ForegroundColor Green
        Write-Host "   Ubicación: dist/*-portable.exe" -ForegroundColor Green
        Write-Host "   (No requiere instalación)" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al crear ejecutable" -ForegroundColor Red
    }
}

function Start-Electron {
    Show-Header
    Write-Host "🚀 Iniciando SINDESCOL en modo Electron..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1️⃣  Iniciando backend en puerto 4000..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal
    
    Write-Host "2️⃣  Iniciando Vite frontend en puerto 5173..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
    
    Write-Host "3️⃣  Iniciando Electron..." -ForegroundColor Blue
    Write-Host ""
    Write-Host "⏳ Esperando a que backend y frontend estén listos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Pasar NODE_ENV en PowerShell
    $env:NODE_ENV = "development"
    npm start
    
    Write-Host ""
    Write-Host "✅ SINDESCOL iniciado!" -ForegroundColor Green
    Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Green
    Write-Host "   Electron: Abierto en ventana" -ForegroundColor Green
}

function Show-Help {
    Show-Header
    Write-Host "Comandos disponibles:" -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "  === TESTING ===" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 test:all              " -ForegroundColor Green -NoNewline
    Write-Host "- Ejecutar todos los tests"
    
    Write-Host "  .\run.ps1 test:backend          " -ForegroundColor Green -NoNewline
    Write-Host "- Tests del backend solo"
    
    Write-Host "  .\run.ps1 test:frontend         " -ForegroundColor Green -NoNewline
    Write-Host "- Tests del frontend solo"
    
    Write-Host "  .\run.ps1 test:watch backend    " -ForegroundColor Green -NoNewline
    Write-Host "- Modo watch backend"
    
    Write-Host "  .\run.ps1 test:watch frontend   " -ForegroundColor Green -NoNewline
    Write-Host "- Modo watch frontend"
    
    Write-Host ""
    Write-Host "  === COBERTURA ===" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 coverage:all          " -ForegroundColor Green -NoNewline
    Write-Host "- Generar todos los reportes"
    
    Write-Host "  .\run.ps1 coverage:backend      " -ForegroundColor Green -NoNewline
    Write-Host "- Coverage del backend"
    
    Write-Host "  .\run.ps1 coverage:frontend     " -ForegroundColor Green -NoNewline
    Write-Host "- Coverage del frontend"
    
    Write-Host ""
    Write-Host "  === DESARROLLO ===" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 dev                   " -ForegroundColor Green -NoNewline
    Write-Host "- Iniciar dev servers (Backend + Frontend)"
    
    Write-Host "  .\run.ps1 install               " -ForegroundColor Green -NoNewline
    Write-Host "- Instalar dependencias"
    
    Write-Host ""
    Write-Host "  === DESKTOP / EMPAQUETADO ===" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 build:desktop         " -ForegroundColor Green -NoNewline
    Write-Host "- Crear instalador .exe (NSIS)"
    
    Write-Host "  .\run.ps1 build:portable        " -ForegroundColor Green -NoNewline
    Write-Host "- Crear ejecutable sin instalar"
    
    Write-Host "  .\run.ps1 start:electron        " -ForegroundColor Green -NoNewline
    Write-Host "- Ejecutar en modo Electron (dev)"
    
    Write-Host ""
    Write-Host "  .\run.ps1 help                  " -ForegroundColor Green -NoNewline
    Write-Host "- Mostrar esta ayuda"
    
    Write-Host ""
    Write-Host "📚 Para más info, lee: INSTALADOR_DISTRIBUCION.md" -ForegroundColor Cyan
    Write-Host ""
}

# Procesar comando
switch ($Command) {
    "test:all" { Test-All }
    "test:backend" { Test-Backend }
    "test:frontend" { Test-Frontend }
    "test:watch" { Test-Watch }
    "coverage:all" { Coverage-All }
    "coverage:backend" { Coverage-Backend }
    "coverage:frontend" { Coverage-Frontend }
    "dev" { Start-Dev }
    "install" { Install-Dependencies }
    "build:desktop" { Build-Desktop }
    "build:portable" { Build-Portable }
    "start:electron" { Start-Electron }
    "help" { Show-Help }
    default {
        Write-Host "❌ Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Write-Host "Usa: .\run.ps1 help" -ForegroundColor Yellow
    }
}

#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🧪 SINDESCOL - Testing & Development Suite             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

case "$1" in
  "test:all")
    echo -e "${YELLOW}Ejecutando tests en Backend y Frontend...${NC}"
    echo ""
    
    echo -e "${BLUE}📋 Backend Tests:${NC}"
    cd backend && npm test
    BACKEND_STATUS=$?
    cd ..
    
    echo ""
    echo -e "${BLUE}📋 Frontend Tests:${NC}"
    cd frontend && npm test
    FRONTEND_STATUS=$?
    cd ..
    
    if [ $BACKEND_STATUS -eq 0 ] && [ $FRONTEND_STATUS -eq 0 ]; then
      echo -e "${GREEN}✅ Todos los tests pasaron!${NC}"
      exit 0
    else
      echo -e "${RED}❌ Algunos tests fallaron${NC}"
      exit 1
    fi
    ;;
    
  "test:backend")
    echo -e "${BLUE}📋 Backend Tests:${NC}"
    cd backend && npm test
    ;;
    
  "test:frontend")
    echo -e "${BLUE}📋 Frontend Tests:${NC}"
    cd frontend && npm test
    ;;
    
  "test:watch")
    echo -e "${YELLOW}Eligiendo tests para modo watch...${NC}"
    if [ "$2" == "backend" ]; then
      cd backend && npm run test:watch
    elif [ "$2" == "frontend" ]; then
      cd frontend && npm run test:watch
    else
      echo "Uso: npm run test:watch [backend|frontend]"
    fi
    ;;
    
  "coverage:all")
    echo -e "${BLUE}📊 Generando reportes de cobertura...${NC}"
    
    echo ""
    echo -e "${BLUE}Backend Coverage:${NC}"
    cd backend && npm run test:coverage
    cd ..
    
    echo ""
    echo -e "${BLUE}Frontend Coverage:${NC}"
    cd frontend && npm run test:coverage
    cd ..
    
    echo -e "${GREEN}✅ Reportes listos!${NC}"
    echo -e "  Backend:  backend/coverage/lcov-report/index.html"
    echo -e "  Frontend: frontend/coverage/lcov-report/index.html"
    ;;
    
  "coverage:backend")
    echo -e "${BLUE}📊 Backend Coverage:${NC}"
    cd backend && npm run test:coverage
    ;;
    
  "coverage:frontend")
    echo -e "${BLUE}📊 Frontend Coverage:${NC}"
    cd frontend && npm run test:coverage
    ;;
    
  "dev")
    echo -e "${YELLOW}Iniciando ambiente de desarrollo...${NC}"
    echo ""
    
    # Ejecutar backend en background
    echo -e "${GREEN}▶️  Backend en puerto 3000${NC}"
    cd backend && npm run dev &
    BACKEND_PID=$!
    
    # Ejecutar frontend en background
    echo -e "${GREEN}▶️  Frontend en puerto 5173${NC}"
    cd ../frontend && npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}✅ Ambiente iniciado!${NC}"
    echo -e "   Backend: http://localhost:3000"
    echo -e "   Frontend: http://localhost:5173"
    echo ""
    echo "Presiona Ctrl+C para detener..."
    
    # Esperar a que terminen
    wait
    ;;
    
  "install")
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    
    echo -e "${BLUE}📦 Backend dependencies:${NC}"
    cd backend && npm install
    
    echo ""
    echo -e "${BLUE}📦 Frontend dependencies:${NC}"
    cd ../frontend && npm install
    
    echo ""
    echo -e "${GREEN}✅ Dependencias instaladas!${NC}"
    ;;
    
  "help"|"--help"|"-h"|"")
    echo -e "${BLUE}Comandos disponibles:${NC}"
    echo ""
    echo -e "  ${GREEN}npm run test:all${NC}           - Ejecutar todos los tests"
    echo -e "  ${GREEN}npm run test:backend${NC}       - Tests del backend solo"
    echo -e "  ${GREEN}npm run test:frontend${NC}      - Tests del frontend solo"
    echo -e "  ${GREEN}npm run test:watch [type]${NC}   - Modo watch (backend|frontend)"
    echo ""
    echo -e "  ${GREEN}npm run coverage:all${NC}       - Generar todos los reportes"
    echo -e "  ${GREEN}npm run coverage:backend${NC}   - Coverage del backend"
    echo -e "  ${GREEN}npm run coverage:frontend${NC}  - Coverage del frontend"
    echo ""
    echo -e "  ${GREEN}npm run dev${NC}                - Iniciar dev servers"
    echo -e "  ${GREEN}npm run install${NC}            - Instalar dependencias"
    echo ""
    echo -e "  ${GREEN}npm run help${NC}               - Mostrar esta ayuda"
    echo ""
    ;;
    
  *)
    echo -e "${RED}❌ Comando no reconocido: $1${NC}"
    echo ""
    echo "Usa: npm run help"
    exit 1
    ;;
esac

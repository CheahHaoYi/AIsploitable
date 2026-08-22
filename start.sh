#!/usr/bin/env bash
# ==============================================================================
# AIsploitable — All-in-One Startup Script
# Starts FastAPI Backend (Port 8000) & Next.js Frontend (Port 3000)
# ==============================================================================

set -e

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}  🛡️  Starting AIsploitable Mission Control  🛡️ ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Check Python and Node
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[!] Error: python3 is not installed or not in PATH.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[!] Error: npm is not installed or not in PATH.${NC}"
    exit 1
fi

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}[*] Shutting down AIsploitable services...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}[✓] All services stopped cleanly.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo -e "${GREEN}[1/2] Starting FastAPI Backend (Port 8000)...${NC}"
python3 -m backend.main &
BACKEND_PID=$!

# Brief wait for backend startup
sleep 2

# 2. Start Frontend
echo -e "${GREEN}[2/2] Starting Next.js Frontend (Port 3000)...${NC}"
npm --prefix frontend run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}  ✓ AIsploitable is LIVE!${NC}"
echo -e "${GREEN}  - Web UI (Mission Control):  http://localhost:3000${NC}"
echo -e "${GREEN}  - Backend API & OpenAPI Doc: http://localhost:8000/docs${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "${YELLOW}Press [CTRL+C] to stop all services.${NC}\n"

# Keep script running and wait for background jobs
wait

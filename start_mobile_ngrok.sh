#!/bin/bash

# Script to start the mobile app with ngrok tunnels for remote access
# This allows you to test the mobile UI on your phone from anywhere

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mobile App + Ngrok Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}Error: ngrok is not installed!${NC}"
    echo -e "${YELLOW}Please install ngrok:${NC}"
    echo -e "  1. Visit: https://ngrok.com/download"
    echo -e "  2. Or use: brew install ngrok (on macOS)"
    echo ""
    exit 1
fi

# Check if backend and frontend directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Create a temporary directory for logs
LOGDIR=$(mktemp -d)
echo -e "${GREEN}Logs directory: ${LOGDIR}${NC}"
echo ""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    rm -rf "$LOGDIR"
    echo -e "${GREEN}Cleanup complete${NC}"
    exit
}

trap cleanup EXIT INT TERM

# Start backend server
echo -e "${BLUE}[1/5]${NC} Starting backend server..."
cd backend
poetry run uvicorn main:app --host 0.0.0.0 --port 8787 > "$LOGDIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start. Check logs at: ${LOGDIR}/backend.log${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend started on port 8787${NC}"
echo ""

# Start ngrok for backend WebSocket
echo -e "${BLUE}[2/5]${NC} Starting ngrok tunnel for backend..."
ngrok http 8787 --log=stdout > "$LOGDIR/ngrok-backend.log" 2>&1 &
NGROK_BACKEND_PID=$!

# Wait for ngrok to start and get the URL
echo -e "${YELLOW}Waiting for ngrok backend tunnel...${NC}"
sleep 3

# Get the ngrok backend URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}Failed to get ngrok backend URL${NC}"
    exit 1
fi

# Convert https to wss for WebSocket
WS_URL="${BACKEND_URL/https/wss}/ws"
echo -e "${GREEN}✓ Backend WebSocket URL: ${WS_URL}${NC}"
echo ""

# Create .env.local for frontend with WebSocket URL
echo -e "${BLUE}[3/5]${NC} Configuring frontend with WebSocket URL..."
echo "NEXT_PUBLIC_WS_URL=${WS_URL}" > frontend/.env.local
echo -e "${GREEN}✓ Frontend configured${NC}"
echo ""

# Start frontend
echo -e "${BLUE}[4/5]${NC} Starting frontend..."
cd frontend
npm run dev > "$LOGDIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
sleep 5

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start. Check logs at: ${LOGDIR}/frontend.log${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend started on port 3000${NC}"
echo ""

# Start ngrok for frontend
echo -e "${BLUE}[5/5]${NC} Starting ngrok tunnel for frontend..."
ngrok http 3000 --log=stdout > "$LOGDIR/ngrok-frontend.log" 2>&1 &
NGROK_FRONTEND_PID=$!

# Wait for ngrok to start
echo -e "${YELLOW}Waiting for ngrok frontend tunnel...${NC}"
sleep 3

# Get the ngrok frontend URL (need to use different API port for second ngrok instance)
# Actually, both ngrok instances share the same API on 4040
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | tail -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}Failed to get ngrok frontend URL${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend accessible at: ${FRONTEND_URL}${NC}"
echo ""

# Display final information
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 All services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📱 Mobile Phone URL:${NC}"
echo -e "   ${GREEN}${FRONTEND_URL}/phone${NC}"
echo ""
echo -e "${BLUE}💻 Desktop URL:${NC}"
echo -e "   ${GREEN}${FRONTEND_URL}${NC}"
echo ""
echo -e "${BLUE}🔌 Backend WebSocket:${NC}"
echo -e "   ${GREEN}${WS_URL}${NC}"
echo ""
echo -e "${BLUE}📊 Ngrok Dashboard:${NC}"
echo -e "   http://localhost:4040"
echo ""
echo -e "${YELLOW}Scan this QR code to open on your phone:${NC}"
echo ""

# Generate QR code if qrencode is available
if command -v qrencode &> /dev/null; then
    qrencode -t ANSIUTF8 "${FRONTEND_URL}/phone"
else
    echo -e "${YELLOW}(Install 'qrencode' for QR code: brew install qrencode)${NC}"
fi

echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait


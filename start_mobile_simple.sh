#!/bin/bash

# Simple script to start both backend and frontend for mobile testing
# For ngrok setup, see instructions below

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mobile App Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if WS_URL is provided as environment variable
if [ -n "$WS_URL" ]; then
    echo -e "${GREEN}Using WebSocket URL: ${WS_URL}${NC}"
    echo "NEXT_PUBLIC_WS_URL=${WS_URL}" > frontend/.env.local
fi

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}Cleanup complete${NC}"
    exit
}

trap cleanup EXIT INT TERM

# Start backend server
echo -e "${BLUE}[1/2]${NC} Starting backend server on port 8787..."
cd backend
poetry run uvicorn main:app --host 0.0.0.0 --port 8787 &
BACKEND_PID=$!
cd ..

sleep 3

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend started${NC}"
echo ""

# Start frontend
echo -e "${BLUE}[2/2]${NC} Starting frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 4

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend started${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Services are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Local URLs:${NC}"
echo -e "  📱 Mobile: http://localhost:3000/phone"
echo -e "  💻 Desktop: http://localhost:3000"
echo -e "  🔌 WebSocket: ws://localhost:8787/ws"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  To access from your phone (different network):${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Option 1: Use Cloudflare Tunnel (Free, Unlimited)${NC}"
echo -e "  1. Install: brew install cloudflared"
echo -e "  2. In another terminal, run:"
echo -e "     ${GREEN}cloudflared tunnel --url http://localhost:3000${NC}"
echo -e "  3. Copy the https://xxx.trycloudflare.com URL to your phone"
echo ""
echo -e "${BLUE}Option 2: Use ngrok (Requires account)${NC}"
echo -e "  1. Install: brew install ngrok"
echo -e "  2. Sign up at https://ngrok.com and get your authtoken"
echo -e "  3. Run: ngrok config add-authtoken YOUR_TOKEN"
echo -e "  4. In two separate terminals, run:"
echo -e "     Terminal 1: ${GREEN}ngrok http 8787${NC}"
echo -e "     Terminal 2: ${GREEN}ngrok http 3000${NC}"
echo -e "  5. Copy the backend wss:// URL (convert https to wss)"
echo -e "  6. Restart this script with:"
echo -e "     ${GREEN}WS_URL=wss://YOUR-BACKEND.ngrok.io/ws ./start_mobile_simple.sh${NC}"
echo -e "  7. Then use the frontend https:// URL on your phone"
echo ""
echo -e "${BLUE}Option 3: Use localtunnel (Free, Simple)${NC}"
echo -e "  1. Install: npm install -g localtunnel"
echo -e "  2. In another terminal:"
echo -e "     ${GREEN}lt --port 3000 --subdomain myapp${NC}"
echo -e "  3. Copy the URL to your phone"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait


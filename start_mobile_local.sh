#!/bin/bash

# Simple script for local network testing (RECOMMENDED)
# This works better than Cloudflare for WebSocket connections

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mobile App (Local Network)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}Could not detect local IP address${NC}"
    echo "Please find your IP manually and use: http://YOUR_IP:3000/phone"
    exit 1
fi

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}Starting backend on port 8787...${NC}"
cd backend
poetry run uvicorn main:app --host 0.0.0.0 --port 8787 &
BACKEND_PID=$!
cd ..
sleep 3

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"
echo ""

echo -e "${BLUE}Starting frontend on port 3000...${NC}"
cd frontend  
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 5

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 Ready to test!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Your local IP: ${GREEN}${LOCAL_IP}${NC}"
echo ""
echo -e "${BLUE}📱 Open on your iPhone:${NC}"
echo -e "   ${GREEN}http://${LOCAL_IP}:3000/phone${NC}"
echo ""
echo -e "${BLUE}💻 Desktop version:${NC}"
echo -e "   ${GREEN}http://${LOCAL_IP}:3000${NC}"
echo ""
echo -e "${YELLOW}Note: Your phone must be on the same WiFi network${NC}"
echo ""

if command -v qrencode &> /dev/null; then
    echo -e "${YELLOW}Scan this QR code on your phone:${NC}"
    qrencode -t ANSIUTF8 "http://${LOCAL_IP}:3000/phone" 2>/dev/null
    echo ""
fi

echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo ""

# Keep running
wait


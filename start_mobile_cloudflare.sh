#!/bin/bash

# Ultra-simple script using Cloudflare Tunnel (free, no signup needed!)
# This is the EASIEST way to test on your phone

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mobile App + Cloudflare Tunnel${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}cloudflared not found. Installing...${NC}"
    if command -v brew &> /dev/null; then
        brew install cloudflared
    else
        echo "Please install cloudflared from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    rm -f frontend/.env.local
    exit
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}Starting backend...${NC}"
cd backend
poetry run uvicorn main:app --host 0.0.0.0 --port 8787 &
BACKEND_PID=$!
cd ..
sleep 3
echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"
echo ""

echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 5
echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
echo ""

echo -e "${BLUE}Starting Cloudflare Tunnel...${NC}"
echo ""

# Start cloudflared and capture output
cloudflared tunnel --url http://localhost:3000 2>&1 | while IFS= read -r line; do
    # Check if this line contains the tunnel URL
    if [[ $line == *"trycloudflare.com"* ]]; then
        URL=$(echo "$line" | grep -o 'https://[^ ]*' | head -1)
        if [ ! -z "$URL" ]; then
            echo ""
            echo -e "${GREEN}========================================${NC}"
            echo -e "${GREEN}  🎉 Ready to test!${NC}"
            echo -e "${GREEN}========================================${NC}"
            echo ""
            echo -e "${BLUE}📱 Open this on your iPhone:${NC}"
            echo -e "   ${GREEN}${URL}/phone${NC}"
            echo ""
            echo -e "${BLUE}💻 Desktop version:${NC}"
            echo -e "   ${GREEN}${URL}${NC}"
            echo ""
            if command -v qrencode &> /dev/null; then
                echo -e "${YELLOW}Scan this QR code:${NC}"
                qrencode -t ANSIUTF8 "${URL}/phone" 2>/dev/null || echo "(QR code generation failed)"
                echo ""
            fi
            echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
            echo ""
        fi
    fi
    # Show the line if it's not a verbose log line
    if [[ ! $line == *"INF"* ]] && [[ ! $line == *"http://localhost"* ]]; then
        echo "$line"
    fi
done


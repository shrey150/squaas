# Mobile Testing Setup

This guide explains how to test the mobile phone HUD (`/phone`) on your actual iPhone, even when it's not on the same network as your development machine.

## Quick Start (Recommended) ⚡

**Use Cloudflare Tunnel - It's free and requires no signup!**

```bash
./start_mobile_cloudflare.sh
```

This will:
1. Start the backend server
2. Start the frontend 
3. Create a public URL via Cloudflare Tunnel
4. Display a URL (and QR code) you can open on your phone

Just open the displayed URL on your iPhone and navigate to `/phone`!

## Alternative Methods

### Method 1: Simple Local Network (Same WiFi)

If your phone is on the same WiFi network:

```bash
# Find your local IP address
ipconfig getifaddr en0  # Usually your WiFi IP

# Start servers
cd backend && poetry run uvicorn main:app --host 0.0.0.0 --port 8787 &
cd frontend && npm run dev &

# Open on phone: http://YOUR_IP:3000/phone
```

### Method 2: Cloudflare Tunnel (Manual)

```bash
# 1. Install cloudflared
brew install cloudflared

# 2. Start your servers
./start_mobile_simple.sh

# 3. In another terminal, create tunnel
cloudflared tunnel --url http://localhost:3000

# 4. Copy the https://xxx.trycloudflare.com URL to your phone
```

### Method 3: ngrok (Requires Account)

If you need both frontend and backend tunneled separately:

```bash
# 1. Install and setup ngrok
brew install ngrok
ngrok config add-authtoken YOUR_TOKEN  # Get token from ngrok.com

# 2. Start backend
cd backend && poetry run uvicorn main:app --host 0.0.0.0 --port 8787

# 3. In another terminal, tunnel backend
ngrok http 8787
# Copy the URL and convert https://xxx.ngrok.io to wss://xxx.ngrok.io/ws

# 4. In another terminal, start frontend with backend URL
WS_URL=wss://YOUR-BACKEND.ngrok.io/ws ./start_mobile_simple.sh

# 5. In another terminal, tunnel frontend  
ngrok http 3000
# Copy the frontend URL to your phone
```

### Method 4: Full Automated ngrok (Paid Plan Only)

If you have an ngrok paid plan that allows multiple tunnels:

```bash
./start_mobile_ngrok.sh
```

## Scripts Overview

- **`start_mobile_cloudflare.sh`** ⭐ **RECOMMENDED** - Uses free Cloudflare Tunnel
- **`start_mobile_simple.sh`** - Starts servers locally with instructions
- **`start_mobile_ngrok.sh`** - Full ngrok automation (requires paid plan)

## Testing the Mobile UI

Once connected, you should see:
- 📍 Interactive map showing your location
- 🎯 Current objective at the top
- 👾 Boss health bar (when in boss encounter)
- 💬 Game messages (overlays)
- 🔴/🟢 Connection status indicator

## Troubleshooting

**Can't connect to WebSocket:**
- Check that backend is running on port 8787
- Verify the WebSocket URL in browser console
- Make sure firewall allows connections

**Cloudflare tunnel not working:**
- Update cloudflared: `brew upgrade cloudflared`
- Check if port 3000 is already in use

**ngrok not working:**
- Verify you're logged in: `ngrok config check`
- Free tier only allows 1 tunnel at a time
- Use cloudflare tunnel instead for free multi-tunnel support

## Mobile-Specific Features

The `/phone` route provides:
- Optimized layout for iPhone screens
- Smaller map (280x280px vs 320x320px desktop)
- Compact UI elements
- Touch-friendly interface
- Battery-efficient dark background

## Development Tips

To test locally without tunneling:
1. Connect phone to same WiFi as your computer
2. Find your computer's local IP: `ipconfig getifaddr en0`
3. Visit `http://YOUR_IP:3000/phone` on your phone

For environment variables:
- Create `frontend/.env.local` with `NEXT_PUBLIC_WS_URL=wss://your-backend-url/ws`
- Restart the frontend after changing env vars


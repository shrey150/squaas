# Mobile Testing Guide

## 🎯 TLDR: Use Local Network

**For the best experience with full GPS + WebSocket functionality:**

```bash
./start_mobile_local.sh
```

Then open `http://YOUR_IP:3000/phone` on your iPhone (on same WiFi).

---

## Why Not Cloudflare Tunnel?

The Cloudflare tunnel script (`./start_mobile_cloudflare.sh`) **has a WebSocket limitation**:

### The Problem:
1. ✅ Cloudflare tunnels the **frontend** (port 3000)
2. ❌ Backend WebSocket (port 8787) is **not tunneled**
3. ❌ Browser security blocks `ws://localhost:8787` from HTTPS pages
4. 💥 Result: "Connecting..." infinitely - no real-time updates

### What You'll See:
- ✅ Page loads fine
- ✅ UI displays correctly
- ✅ GPS tracking works
- ❌ WebSocket shows "Disconnected" (red dot)
- ❌ No map updates from backend
- ❌ No POIs
- ❌ No real-time game state

---

## 📱 Recommended: Local Network Testing

### Setup (One Command):

```bash
./start_mobile_local.sh
```

### What It Does:
1. Starts backend on port 8787
2. Starts frontend on port 3000
3. **Shows full logs** for both (great for debugging!)
4. Displays your local IP
5. Generates QR code to scan

### Output Example:
```
🎉 Ready to test!

Your local IP: 192.168.1.100

📱 Open on your iPhone:
   http://192.168.1.100:3000/phone

[QR CODE HERE]

Note: Your phone must be on the same WiFi network
```

### Requirements:
- ✅ Phone on **same WiFi** as your computer
- ✅ Router allows local network traffic (most do)
- ✅ No special setup needed

### What Works:
- ✅ Full WebSocket connection
- ✅ Real-time GPS tracking
- ✅ Map updates
- ✅ POIs
- ✅ Panic button
- ✅ All game state synced
- ✅ Full logs visible for debugging

---

## 🔍 Debugging with Full Logs

Both new scripts show **full, unfiltered logs**:

### Updated Cloudflare Script:
```bash
./start_mobile_cloudflare.sh
```

Now shows:
- Backend startup logs
- Frontend compilation logs
- Uvicorn requests
- Next.js build output
- WebSocket connection attempts (you'll see them fail)
- All errors in realtime

### Local Network Script:
```bash
./start_mobile_local.sh
```

Shows:
- Backend logs (uvicorn)
- Frontend logs (Next.js)
- GPS location updates
- WebSocket connections
- API requests
- All errors

### How to Debug:

1. **Backend issues** - Look for:
   ```
   ERROR:    [uvicorn] ...
   INFO:     127.0.0.1:XXXXX - "POST /api/location HTTP/1.1" 200 OK
   ```

2. **Frontend issues** - Look for:
   ```
   ⚠ Fast Refresh had to perform a full reload
   ✓ Compiled /phone in XXXms
   ```

3. **WebSocket issues** - Look for:
   ```
   Client connected. Total clients: 1
   Client disconnected. Total clients: 0
   ```

4. **GPS updates** - Look for:
   ```
   Location updated: 37.7749, -122.4194 - 5 POIs nearby
   ```

---

## 🌍 Testing Outside Your Network (Future)

If you need to test from a different network, these options could work but require setup:

### Option 1: Two Cloudflare Tunnels (Complex)
- Tunnel frontend on port 3000
- Tunnel backend on port 8787  
- Set `NEXT_PUBLIC_WS_URL` to backend tunnel URL
- Restart frontend with env var

### Option 2: VPN
- Use Tailscale or similar
- Access your dev machine remotely
- Use local IP over VPN

### Option 3: Deploy to Server
- Deploy both frontend + backend
- Use proper domain
- WebSockets work natively

---

## 📊 Comparison

| Feature | Local Network | Cloudflare Tunnel |
|---------|--------------|-------------------|
| WebSocket | ✅ Works | ❌ Doesn't work |
| GPS Tracking | ✅ Works | ✅ Works |
| Full Logs | ✅ Yes | ✅ Yes (updated) |
| Same WiFi Required | ✅ Yes | ❌ No |
| Setup Complexity | ⭐ Easy | ⭐⭐ Medium |
| Real-time Updates | ✅ Yes | ❌ No |
| Recommended | ✅ **YES** | ❌ No |

---

## 🚀 Quick Commands

```bash
# Recommended: Local network with full logs
./start_mobile_local.sh

# Alternative: Cloudflare (UI only, no WebSocket)
./start_mobile_cloudflare.sh

# Old simple script (minimal output)
./start_mobile_simple.sh
```

---

## ❓ FAQ

**Q: Why can't I see logs?**
A: Use the new scripts! Old one hid logs with `> /dev/null`.

**Q: Why does it say "Connecting..." forever?**
A: You're using Cloudflare tunnel which doesn't support WebSockets. Use local network instead.

**Q: My phone can't connect to local IP**
A: Check:
1. Phone on same WiFi?
2. IP address correct? (`ipconfig getifaddr en0`)
3. Firewall blocking? (unlikely on Mac)
4. Try http://localhost:3000/phone on your computer first

**Q: GPS not working**
A: Grant location permission when prompted. Wait 30-60 seconds for GPS lock outdoors.

**Q: Compass not rotating map**
A: Grant motion/orientation permission on iOS. May need to refresh page.

---

## 🎯 Bottom Line

**Use this:**
```bash
./start_mobile_local.sh
```

Then open the displayed URL on your iPhone! 📱✨


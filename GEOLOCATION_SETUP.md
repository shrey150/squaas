# Mobile Geolocation + Compass Setup

## ✅ Implementation Complete!

The mobile phone UI now has real-time GPS tracking with compass heading and GTA V-style rotating minimap.

## Features Implemented

### 📍 GPS Tracking
- **Continuous tracking** using `navigator.geolocation.watchPosition()`
- **1-second updates** sent to backend `/api/location` endpoint
- **High accuracy mode** enabled for best GPS results
- **Automatic fallback** to WebSocket position if GPS unavailable

### 🧭 Compass/Heading
- **Device orientation** tracking using `DeviceOrientationEvent`
- **iOS support** with automatic permission request
- **Smooth interpolation** (lerp) between heading changes for fluid rotation
- **GPS fallback** uses GPS course/bearing if compass unavailable

### 🗺️ GTA V-Style Rotating Map
- **Player stays centered** pointing "up" on the map
- **Map rotates underneath** based on compass heading
- **Smooth transitions** using maplibre's `easeTo()` (100ms duration)
- **Real-time position** updates as you move

### 📊 GPS Status Indicator
- **Green dot** = GPS + Compass active and tracking
- **Yellow dot** = Acquiring GPS signal
- **Red dot** = Permission denied or error
- **Hover tooltip** shows detailed status and errors
- **Top-left corner** position

## Testing Instructions

### 1. Start the Mobile App

```bash
# Option 1: Local testing (same WiFi)
./start_mobile_simple.sh

# Option 2: Remote testing (recommended)
./start_mobile_cloudflare.sh
```

### 2. Open on Your iPhone

Navigate to the displayed URL + `/phone`:
- Local: `http://YOUR_IP:3000/phone`
- Cloudflare: `https://xxx.trycloudflare.com/phone`

### 3. Grant Permissions

When the page loads, you'll be prompted for:

**Location Permission:**
- Browser will automatically request
- Tap "Allow" for GPS tracking

**Motion & Orientation Permission (iOS only):**
- iOS 13+ requires explicit permission for compass
- The app will request this automatically
- Tap "Allow" to enable compass heading

### 4. What to Expect

✅ **GPS Status Indicator** appears in top-left:
- Yellow dot while acquiring signal (may take 5-30 seconds)
- Green dot when active
- Hover/tap to see status details

✅ **Map Updates:**
- Your position updates every second
- Map center follows you in real-time
- Map rotates as you change direction (GTA V style)

✅ **Backend Updates:**
- Position sent to `/api/location` every second
- Desktop viewers see your real position on their map
- Nearby POIs update automatically

✅ **Panic Button:**
- Still works with GPS tracking
- Triggers danger mode for all clients

## Troubleshooting

### GPS Not Working

**Issue:** Yellow dot stays, never turns green
**Fix:**
1. Check if location is enabled in iPhone Settings
2. Make sure you're outdoors or near a window (GPS needs sky view)
3. Wait 30-60 seconds for initial GPS lock
4. Check browser console for errors

**Issue:** Red dot - Permission denied
**Fix:**
1. Go to iPhone Settings → Safari → Location
2. Select "Allow" or "Ask"
3. Refresh the page
4. Grant permission when prompted

### Compass Not Working

**Issue:** Map doesn't rotate when I turn
**Fix:**
1. On iOS, check if you granted motion permission
2. Try refreshing and accepting the permission prompt
3. Compass may not work on some Android browsers (will use GPS heading instead)
4. Make sure you're moving - compass needs movement to detect direction

**Issue:** Map rotation is jittery
**Fix:**
- This is normal with compass sensors
- The app uses smooth interpolation (lerp) to reduce jitter
- GPS heading (when moving) is more stable than compass

### Backend Not Updating

**Issue:** GPS works but backend doesn't update
**Fix:**
1. Check browser console for network errors
2. Verify backend is running on port 8787
3. For ngrok/cloudflare, check CORS is enabled (already set to `allow_origins=["*"]`)
4. Check `NEXT_PUBLIC_WS_URL` environment variable

## Technical Details

### Files Created/Modified

**New Files:**
- `frontend/hooks/useGeolocation.ts` - GPS + compass hook
- `frontend/components/GpsStatus.tsx` - Status indicator

**Modified Files:**
- `frontend/components/MobileMap.tsx` - Added GPS position override
- `frontend/app/phone/page.tsx` - Integrated geolocation
- `backend/main.py` - CORS updated for mobile access

### How It Works

```
iPhone GPS → navigator.geolocation.watchPosition()
iPhone Compass → DeviceOrientationEvent
         ↓
useGeolocation hook (smooth interpolation)
         ↓
Every 1 second:
  - POST to /api/location (backend)
  - Update MobileMap position + bearing
         ↓
Backend updates game_state.player
         ↓
WebSocket broadcasts to all clients
         ↓
Everyone sees your real position!
```

### Update Frequency

- **GPS polling:** Continuous (watchPosition)
- **Backend updates:** 1 second (1000ms)
- **Map animation:** 100ms smooth transition
- **Heading lerp factor:** 0.3 (30% smoothing)

### Battery Impact

The app uses:
- High accuracy GPS (uses more battery but better accuracy)
- Continuous position watching
- Device orientation events

**Tips to reduce battery usage:**
- Close the mobile app when not in use
- Reduce update frequency (edit `UPDATE_INTERVAL` in useGeolocation.ts)
- Use low power mode on iPhone

## iOS Permissions

### Location Services

Automatically requested by browser. User sees:
> "[Your site] would like to access your location"

### Motion & Orientation

On iOS 13+, requires explicit permission. User sees:
> "Motion & Orientation Access"
> "[Your site] needs access to your device's motion and orientation"

The app handles this automatically using `DeviceOrientationEvent.requestPermission()`.

## Next Steps

Now that geolocation is working, you can:

1. **Test while walking** - See the map update in real-time
2. **Test compass rotation** - Spin around and watch the map rotate
3. **Use panic button** - Trigger danger mode with real GPS position
4. **Connect desktop viewer** - Watch your position update on the big screen
5. **Add POIs** - Backend will show nearby points of interest based on real location

## Known Limitations

- **Indoor GPS** - May not work well indoors or in urban canyons
- **Compass accuracy** - Phone compass can be affected by magnetic interference
- **iOS Safari only** - Some browsers don't support device orientation
- **Initial lock time** - GPS can take 30-60 seconds for first fix
- **Movement required** - GPS heading only works when moving (use compass instead)

Enjoy your real-time mobile tracking! 🎮📍


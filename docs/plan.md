# SideQuest Overlay MVP Implementation

## Architecture Overview

Build a modular system with:

- **Backend**: Node.js WebSocket server broadcasting game state
- **Frontend**: HTML5 overlay with MapLibre GL mini-map for OBS Browser Source
- **Data Flow**: Mock GPS simulation → Backend state → WebSocket → Overlay rendering

## Implementation Steps

### 1. Project Structure Setup

Create the following directory structure:

```
sidequest-overlay/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── mock-gps.js
├── frontend/
│   ├── index.html
│   ├── overlay.js
│   ├── styles.css
│   └── package.json
└── README.md
```

### 2. Backend Implementation (Node.js + WebSocket)

**File: `backend/package.json`**

- Dependencies: `ws` for WebSocket server, `express` for HTTP endpoints

**File: `backend/server.js`**

- Initialize Express server and WebSocket server on port 8787
- Maintain global state object:
  ```js
  { player: {lat, lon, heading}, pois: [], objective: "", message: {text, visible, timeoutMs} }
  ```

- Implement `/update` POST endpoint to receive external updates
- Broadcast state to all WebSocket clients every 100ms
- Handle client connections/disconnections

**File: `backend/mock-gps.js`**

- Simulate GPS movement along a simple path (e.g., circular or linear route)
- Update player position at ~5 Hz with realistic lat/lon increments
- Include 2-3 sample POIs with labels
- Auto-update heading based on movement direction

### 3. Frontend Overlay Implementation

**File: `frontend/package.json`**

- Dependencies: `maplibre-gl` for map rendering

**File: `frontend/index.html`**

- Transparent body with three main elements:
  - `<div id="objective">` (top center)
  - `<div class="minimap-wrapper">` containing `<div id="map">`
  - `<div id="message">` (full-screen centered)
- Include MapLibre GL CSS and JS module imports

**File: `frontend/styles.css`**

- Set `body { background: transparent; margin: 0; }`
- Position objective bar at top center
- Position mini-map at bottom-left with fixed dimensions (e.g., 300x300px)
- Style message overlay with fade-in/out transitions
- Ensure all elements have proper z-indexing

**File: `frontend/overlay.js`**

- Initialize WebSocket connection to `ws://localhost:8787`
- Initialize MapLibre GL map in the `#map` container:
  - Use a simple/minimal style (e.g., OSM or basic style)
  - Set `interactive: false` for OBS compatibility
  - Configure transparent background
- On WebSocket message:
  - Parse JSON state
  - Update map center to `[player.lon, player.lat]`
  - Update map bearing to `player.heading`
  - Render POI markers on map
  - Update objective text in DOM
  - Show/hide message with CSS transitions
- Implement auto-reconnect logic (basic retry every 2 seconds)

### 4. Integration & Testing

**Testing checklist:**

- Start backend server and verify WebSocket endpoint
- Verify mock GPS data updates in console
- Open frontend in browser, confirm WebSocket connection
- Verify map renders with moving player position
- Test objective and message updates
- Add frontend as OBS Browser Source at `http://localhost:5173`
- Confirm transparency and performance in OBS

### 5. Documentation

**File: `README.md`**

- Installation instructions for both backend and frontend
- How to run the development servers
- How to configure OBS Browser Source
- WebSocket message format specification
- Future enhancement notes (real GPS, de-risking features)

## Key Technical Decisions

- **MapLibre GL JS**: Open-source, WebGL-based map rendering
- **WebSocket**: Low-latency state synchronization (~100ms broadcast rate)
- **Mock GPS**: Hardcoded simulation loop for MVP testing
- **Port 8787**: Backend WebSocket/HTTP server
- **Port 5173**: Frontend dev server (Vite recommended)
- **State Schema**: JSON format as specified in design doc
- **OBS Integration**: Browser Source pointing to frontend dev server

## Success Criteria

- Backend broadcasts mock GPS updates via WebSocket
- Frontend displays real-time map with player position
- Objective bar and messages render with proper styling
- Overlay works transparently in OBS Browser Source
- Sub-200ms latency from state update to visual render
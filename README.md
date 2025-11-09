# SideQuest Overlay

A real-time GPS overlay system for OBS streaming with a Skyrim/Elder Scrolls inspired UI. Built with FastAPI (backend) and Next.js (frontend), featuring WebSocket-based state synchronization and MapLibre GL for map rendering.

![SideQuest Overlay Demo](docs/demo-screenshot.png)

## Features

- 🗺️ **Real-time Map Display**: MapLibre GL powered mini-map centered on San Francisco with POI markers for real landmarks
- 🎮 **Skyrim-Inspired UI**: Fantasy RPG aesthetic with ornate borders, parchment textures, and medieval fonts
- 🤖 **AI-Powered Narrative**: OpenAI GPT-4o-mini transforms camera descriptions into dynamic RPG objectives and events
- ⚔️ **Boss Fight Detection**: AI detects confrontations and triggers boss health bars with danger styling
- 📍 **Static POI Database**: 30+ real San Francisco locations (Golden Gate Bridge, coffee shops, landmarks)
- 📱 **External GPS Input**: HTTP endpoints for phone GPS and camera data
- ⚡ **Low Latency**: WebSocket broadcasting at 100ms intervals for smooth updates
- 🎥 **OBS Compatible**: Transparent overlay perfect for streaming
- 🔄 **Auto-Reconnect**: WebSocket automatically reconnects if connection is lost

## Architecture

```
External Server (Your Phone/Camera App)
    ↓ POST /api/location (GPS data)
    ↓ POST /api/camera (AI descriptions every 10s)
    ↓
┌──────────────────────────────────────────────┐
│        FastAPI Backend (Port 8787)           │
│  ┌────────────────────────────────────────┐  │
│  │ • Receive GPS → Update player position │  │
│  │ • Filter POIs within 1.5km radius      │  │
│  │ • Process camera description w/ OpenAI │  │
│  │ • Generate objectives, detect danger   │  │
│  │ • Trigger boss fights if aggressive    │  │
│  └────────────────────────────────────────┘  │
│              ↓ WebSocket (100ms)             │
└──────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│      Next.js Frontend (Port 3000)            │
│  • Map centered on SF showing nearby POIs    │
│  • Objective bar (red when danger detected)  │
│  • Boss health bar (appears during fights)   │
│  • Message overlay with RPG notifications    │
└──────────────────────────────────────────────┘
                       ↓
               OBS Browser Source
```

## Installation

### Prerequisites

- Python 3.10+ (Python 3.14 supported)
- Node.js 18+ and npm
- OpenAI API key (for camera description processing)
- Git

### Backend Setup

1. **Install Poetry** (if you don't have it):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Install dependencies with Poetry:
```bash
poetry install
```

4. Create `.env` file with your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here
```

**Note:** Poetry automatically manages the virtual environment - no need to manually create or activate it!

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Overlay

### Start the Backend Server

**Option 1: Using the run script**
```bash
cd backend
./run_server.sh
```

**Option 2: Using Poetry directly**
```bash
cd backend
poetry run uvicorn main:app --reload --port 8787
```

**Option 3: Using Poetry shell**
```bash
cd backend
poetry shell
uvicorn main:app --reload --port 8787
```

The backend will start on `http://localhost:8787`. You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8787
```

### Start the Frontend Dev Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`. Open your browser to verify the overlay is working.

## OBS Integration

### Adding the Overlay to OBS

1. Open OBS Studio
2. In your scene, click the **+** button under Sources
3. Select **Browser**
4. Configure the Browser Source:
   - **URL**: `http://localhost:3000`
   - **Width**: 1920
   - **Height**: 1080
   - **FPS**: 30-60
   - ✅ Check **Shutdown source when not visible**
   - ✅ Check **Refresh browser when scene becomes active** (optional)

5. Click **OK**

### Transparency Setup

The overlay should automatically be transparent in OBS. If you see a white background:
- Ensure the Browser Source has "Shutdown source when not visible" checked
- Restart the Browser Source
- Check that your OBS version supports CSS transparency

### Tips for Best Results

- **Positioning**: The map is positioned at bottom-left, objective bar at top-center
- **Scaling**: Use OBS's transform tools (right-click source → Transform) to adjust size
- **Performance**: If you experience lag, lower the browser source FPS to 30
- **Development**: Keep both servers running while streaming

## API Endpoints

### POST /api/location
Update player GPS position from your phone:

```bash
curl -X POST http://localhost:8787/api/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 37.8080, "lon": -122.4177, "heading": 180}'
```

Response: `{"status": "location_updated", "nearby_pois": 7}`

### POST /api/camera
Process camera AI description (triggers OpenAI processing):

```bash
curl -X POST http://localhost:8787/api/camera \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A person in a white shirt stands in a dimly lit room...",
    "timestamp": 1234567890
  }'
```

Response includes AI-generated objective, danger level, and boss fight status.

**Example camera descriptions:**
- `"Person holding a can"` → Objective: _"Investigate the mysterious merchant's elixir"_
- `"Coffee bar closed sign"` → Objective: _"Unlock the sealed tavern entrance"_
- `"Person yelling aggressively, moving towards camera"` → **BOSS FIGHT TRIGGERED** 🔴

### POST /api/objective
Manually set objective:

```bash
curl -X POST http://localhost:8787/api/objective \
  -H "Content-Type: application/json" \
  -d '{"text": "Defeat the Dragon"}'
```

### POST /api/message
Send a temporary message notification:

```bash
curl -X POST http://localhost:8787/api/message \
  -H "Content-Type: application/json" \
  -d '{"text": "Achievement Unlocked!", "timeoutMs": 3000}'
```

### GET /api/state
Get current game state:

```bash
curl http://localhost:8787/api/state
```

## WebSocket State Schema

The backend broadcasts game state in the following JSON format:

```json
{
  "player": {
    "lat": 37.8080,
    "lon": -122.4177,
    "heading": 180.0
  },
  "pois": [
    {
      "lat": 37.808,
      "lon": -122.4177,
      "label": "Alcatraz Island"
    },
    {
      "lat": 37.8024,
      "lon": -122.4058,
      "label": "Coit Tower"
    }
  ],
  "objective": "Explore the ancient fortress ruins",
  "message": {
    "text": "Quest Updated!",
    "visible": true,
    "timeoutMs": 3000
  },
  "danger_level": "high",
  "boss_fight_active": true,
  "boss_name": "The Enraged Guardian",
  "environment": "fortress interior"
}
```

### Updating State Externally

You can update the game state via HTTP POST:

```bash
curl -X POST http://localhost:8787/update \
  -H "Content-Type: application/json" \
  -d '{
    "player": {"lat": 37.7750, "lon": -122.4195, "heading": 90.0},
    "pois": [],
    "objective": "New Objective",
    "message": {"text": "Achievement Unlocked!", "visible": true, "timeoutMs": 3000}
  }'
```

## Customization

### UI Styling

The Skyrim-inspired UI can be customized in:
- `frontend/styles/fantasy-ui.module.css` - UI component styles
- `frontend/app/globals.css` - Color palette and global styles

Color Variables:
```css
--parchment: #E8DCC4  /* Aged parchment */
--dark-brown: #2B1810 /* Dark text */
--gold: #C9A961       /* Gold accents */
--bronze: #8B6F47     /* Bronze borders */
```

### Fonts

Currently using Google Fonts:
- **Cinzel**: Headers and objective text
- **Spectral**: Body text and messages

Change fonts in `frontend/app/layout.tsx`.

### Map Style

The map uses OpenStreetMap tiles with a darkened fantasy theme. To customize:

Edit `frontend/components/MapOverlay.tsx`, line ~30:
```typescript
style: {
  // Modify map style here
  sources: { /* ... */ },
  layers: [ /* ... */ ]
}
```

### Mock GPS Path

The backend simulates GPS movement in a circular path. To customize:

Edit `backend/mock_gps.py`:
```python
center_lat = 37.7749  # Starting latitude
center_lon = -122.4194  # Starting longitude
radius = 0.002  # Circle radius in degrees
```

## Development

### Project Structure

```
squaas/
├── backend/
│   ├── main.py           # FastAPI server & WebSocket
│   ├── models.py         # Pydantic data models
│   ├── mock_gps.py       # GPS simulation
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with fonts
│   │   ├── page.tsx      # Main overlay page
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   ├── MapOverlay.tsx      # MapLibre GL map
│   │   ├── ObjectiveBar.tsx    # Top objective display
│   │   └── MessageOverlay.tsx  # Center message popup
│   ├── hooks/
│   │   └── useWebSocket.ts     # WebSocket connection hook
│   ├── styles/
│   │   └── fantasy-ui.module.css  # Skyrim-style UI
│   └── types/
│       └── game-state.ts       # TypeScript interfaces
└── docs/
    └── plan.md           # Original implementation plan
```

### Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- Uvicorn - ASGI server
- WebSockets - Real-time communication
- Pydantic - Data validation

**Frontend:**
- Next.js 15 - React framework with App Router
- MapLibre GL JS - Open-source map rendering
- TypeScript - Type safety
- Tailwind CSS - Utility-first styling

## Troubleshooting

### "Disconnected" showing in overlay

**Problem**: Red "Disconnected" indicator appears  
**Solution**: 
- Ensure backend is running on port 8787
- Check browser console for WebSocket errors
- Verify CORS settings in `backend/main.py`

### Map not rendering

**Problem**: Black square instead of map  
**Solution**:
- Check browser console for MapLibre GL errors
- Ensure you have internet connection (for OSM tiles)
- Verify `maplibre-gl` is installed: `npm list maplibre-gl`

### OBS shows white background

**Problem**: Overlay isn't transparent in OBS  
**Solution**:
- Verify Browser Source settings
- Check that `background: transparent` is in `globals.css`
- Try refreshing the browser source

### Poetry installation issues

**Problem**: Poetry command not found  
**Solution**:
- Install Poetry: `curl -sSL https://install.python-poetry.org | python3 -`
- Add to PATH (usually done automatically)
- Restart terminal

**Problem**: Poetry install fails  
**Solution**:
- Use Python 3.10-3.14
- Try: `poetry env use python3.14` (or your Python version)
- Clear cache: `poetry cache clear . --all`

### WebSocket connection refused

**Problem**: Frontend can't connect to backend  
**Solution**:
- Confirm backend is running: `curl http://localhost:8787/`
- Check firewall settings
- Verify port 8787 isn't already in use

## Future Enhancements

Planned features for future versions:

- 🌐 **Real GPS Integration**: Connect to actual GPS devices
- 🎯 **Quest System**: Full quest tracking with multiple objectives
- 💬 **Custom Notifications**: More message types with animations
- 🎨 **Theme Switcher**: Dark Souls, Elden Ring, and other RPG themes
- 📊 **Stats Display**: Health, stamina, inventory overlay
- 🗺️ **Multiple Map Styles**: Fantasy, sci-fi, modern themes
- 🔧 **Web Config Panel**: Browser-based configuration interface
- 📱 **Mobile Companion**: Control overlay from phone

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT License - feel free to use this for your streams!

## Credits

- Map tiles: © OpenStreetMap contributors
- Map rendering: MapLibre GL JS
- Fonts: Google Fonts (Cinzel, Spectral)
- Inspiration: The Elder Scrolls V: Skyrim

---

**Happy Streaming!** 🎮✨


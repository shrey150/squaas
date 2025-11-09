# SideQuest Overlay - System Architecture

## 🎯 Smart Single-Pass Architecture

### Design Philosophy
**One OpenAI call does everything** - The bot is the brain, backend is just state management.

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    bot_realtime.py                          │
│                                                             │
│  1. Screenshot (every 3s)                                   │
│  2. ONE OpenAI GPT-4o call with vision                     │
│     ↓                                                       │
│     Returns structured JSON:                                │
│     {                                                       │
│       "description": "ultra-detailed 3-5 sentences",       │
│       "objective": "RPG-style objective",                  │
│       "danger_level": "none|low|high",                     │
│       "boss_fight_active": true/false,                     │
│       "boss_name": "The Angry Stranger",                   │
│       "show_popup": true/false,    ← SMART DECISION        │
│       "popup_message": "text"                              │
│     }                                                       │
│  3. Intelligently call backend endpoints:                   │
│     • POST /api/objective (if changed)                     │
│     • POST /api/message (only if show_popup=true)          │
│     • POST /api/danger (always, for UI styling)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8787)                    │
│                                                             │
│  • Receives processed game state                           │
│  • NO additional OpenAI calls (bot did that!)              │
│  • Updates internal state                                  │
│  • Broadcasts via WebSocket (100ms)                        │
│  • Manages POI database (static SF locations)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)                      │
│                                                             │
│  • Receives state via WebSocket                            │
│  • Renders Skyrim-style UI:                                │
│    - Map (centered on SF)                                  │
│    - Objective bar (changes color with danger)             │
│    - Boss health bar (appears on boss_fight_active)        │
│    - Message popups (fade in/out properly)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                       OBS Browser Source
```

## 💰 Cost Savings

### Old Architecture (Wasteful):
```
bot → GPT-4o ($0.01275) → description → backend → GPT-4o AGAIN ($0.01275) → game state
Total: $0.0255 per frame × 1200 frames/hour = $30.60/hour
```

### New Architecture (Efficient):
```
bot → GPT-4o ONCE ($0.01275) → complete game state → backend (no AI)
Total: $0.01275 per frame × 1200 frames/hour = $15.30/hour
```

**Savings: 50% reduction in OpenAI costs!** 💰

## 🎮 Intelligent Popup System

### The Problem
Don't want popups for every frame - that's annoying!

### The Solution
GPT decides what deserves a popup:

**Show Popup (show_popup=true):**
- ✅ Boss fight started
- ✅ Dramatic scene change
- ✅ Quest milestone
- ✅ Significant event
- ✅ Achievement unlocked
- ✅ Danger level changed dramatically

**No Popup (show_popup=false):**
- ⊘ Normal ongoing activity
- ⊘ Minor movements
- ⊘ Same scene continuing
- ⊘ Nothing notable happened

### Example Decisions

**Frame 1:** Person sitting at desk
```json
{
  "objective": "Continue research at the ancient desk",
  "show_popup": false  ← Nothing special
}
```

**Frame 5:** Same person, still sitting
```json
{
  "objective": "Continue research at the ancient desk",
  "show_popup": false  ← No change, no popup
}
```

**Frame 10:** Person suddenly stands and starts arguing
```json
{
  "objective": "Navigate the escalating conflict",
  "show_popup": true,  ← Significant change!
  "popup_message": "Tension Rising!"
}
```

**Frame 12:** Person charging at camera
```json
{
  "objective": "SURVIVE THE ENCOUNTER",
  "show_popup": true,
  "popup_message": "⚔️ BOSS ENCOUNTER: The Enraged Scholar",
  "boss_fight_active": true,
  "danger_level": "high"
}
```

## 🔄 State Tracking

Bot maintains state across frames:
- `last_objective` - Only update if changed (avoid redundant API calls)
- `last_boss_state` - Detect boss fight start/end transitions
- `context_window` - Remember last 5 frames (15 seconds)

## 📡 Backend Endpoints Used

### From bot_realtime.py:
- **POST /api/objective** - Update objective (only if changed)
- **POST /api/message** - Send popup (only if show_popup=true)
- **POST /api/danger** - Update danger/boss state (every frame)
- **POST /api/camera** - Optional logging (commented out by default)

### From external GPS source:
- **POST /api/location** - Phone GPS updates

### For debugging:
- **GET /api/state** - Check current state

## 🧠 Context Window Strategy

**5-frame rolling buffer (15 seconds at 3s intervals):**

```python
context_window = [
    {
        'timestamp': '10:00:15',
        'description': 'Person at desk...',
        'objective': 'Research ancient texts',
        'danger_level': 'none',
        'frame': 1
    },
    # ... up to 5 most recent frames
]
```

**Enables smart tracking:**
- "Person who was sitting is now standing"
- "Same individual from 9s ago, now showing aggression"
- "Mood shifted from calm to tense"
- "Two new people entered since frame 3"

## ⚡ Performance

| Metric | Value |
|--------|-------|
| OpenAI calls per frame | **1** (down from 2) |
| Total latency | ~2-3s (one API call) |
| Backend processing | <10ms (no AI) |
| WebSocket broadcast | 100ms intervals |
| Overlay render | <50ms |
| **Total: Screenshot → Overlay** | **~2-3 seconds** |

## 🎨 UI State Updates

The overlay updates based on backend state:

**Danger Level:**
- `none` → Normal brown/gold colors
- `low` → Yellow borders on objective/map
- `high` → Red pulsing borders, urgent styling

**Boss Fight:**
- `boss_fight_active=true` → Health bar appears at top
- Boss name displayed
- Red vignette effects

**Messages:**
- Only shown when `show_popup=true`
- Fade in (0.5s) → Display (3s) → Fade out (0.5s)
- Then completely hidden

## 🔧 Configuration

**Bot Settings (`bot_realtime.py`):**
```bash
--interval 3.0        # Frame rate (default: 3s = 0.33 FPS)
--context-size 5      # Memory (default: 5 frames = 15s)
--model gpt-4o        # OpenAI model
--api-url URL         # SideQuest backend URL
```

**Cost Control:**
- 3s interval = $15/hour
- 5s interval = $9/hour
- 10s interval = $5/hour

## 🚀 Why This Architecture is Better

1. **💰 50% cheaper** - One OpenAI call instead of two
2. **⚡ Faster** - No double processing latency
3. **🎯 Smarter** - Bot decides what's popup-worthy, not every frame
4. **🔧 Cleaner** - All AI logic in one place (Python)
5. **🎮 Better UX** - Selective popups, not spam
6. **📊 Full control** - Bot has complete context and makes intelligent decisions

## 📝 Summary

**Bot is the brain:** Makes all AI decisions in ONE call
**Backend is the messenger:** Just updates state and broadcasts
**Frontend is the display:** Shows the beautiful Skyrim UI

This is the optimal architecture for cost, performance, and user experience! ✨


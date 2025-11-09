# Vision Bot Documentation

Two bots for different use cases:

## 🤖 bot.py (Original - iMessage)
**Use case:** Send descriptions to someone via iMessage

- **Interval:** 10 seconds
- **Output:** iMessage to recipient
- **Detail level:** Concise one-liner
- **Cost:** ~$4.50/hour

```bash
export OPENAI_API_KEY="sk-..."
export IMESSAGE_RECIPIENT="+15551234567"
python3 bot.py
```

---

## 🎮 bot_realtime.py (New - SideQuest Integration)
**Use case:** Feed the SideQuest overlay with real-time descriptions

### Features
- ✅ **Ultra-detailed descriptions** (3-5 sentences minimum)
- ✅ **Rolling context window** (remembers last 5 frames)
- ✅ **Direct SideQuest integration** (sends to `/api/camera`)
- ✅ **Better danger detection** (tracks escalation over time)
- ✅ **Boss fight triggers** (detects aggressive behavior)

### Configuration

**Interval:** 3 seconds (0.33 FPS) - recommended balance
- Fast enough to catch events
- Detailed enough for rich descriptions
- ~$15/hour cost

**Context Window:** 5 frames (15 seconds of memory)
- GPT remembers recent observations
- Can detect: "person getting closer", "mood shifting"
- Better boss fight detection

### Usage

```bash
# Basic usage (recommended settings) - Local backend
export OPENAI_API_KEY="sk-..."
cd backend
python3 bot_realtime.py

# Use production backend (deployed on Render)
python3 bot_realtime.py --prod

# Custom interval (faster/slower)
python3 bot_realtime.py --interval 2.0  # 0.5 FPS - faster ($23/hr)
python3 bot_realtime.py --interval 5.0  # 0.2 FPS - slower ($9/hr)

# Custom context window (more/less memory)
python3 bot_realtime.py --context-size 10  # Remember 30 seconds
python3 bot_realtime.py --context-size 3   # Remember 9 seconds

# Test mode (single frame)
python3 bot_realtime.py --once

# Different backend URL (custom)
python3 bot_realtime.py --api-url http://192.168.1.100:8787

# Production with custom settings
python3 bot_realtime.py --prod --interval 2.0 --context-size 10
```

### What the Ultra-Detailed Prompt Captures

The bot extracts maximum information from each frame:

**🧑 People & Characters:**
- Count, positions, locations
- Clothing details (colors, style)
- Actions, postures, gestures
- Facial expressions, body language
- Movement (toward/away, speed)
- Aggressive behavior detection

**📦 Objects & Items:**
- Specific item names (not just "items")
- Locations and arrangements
- Visible text on objects/signs
- Notable or unusual items

**🏠 Environment:**
- Indoor/outdoor, space type
- Lighting conditions
- Background elements
- Spatial layout
- Weather (if outdoor)

**⚡ Actions & Dynamics:**
- Current activities
- Movement and motion
- Interactions (people/objects)
- Position changes

**🔄 Changes from Previous:**
- What's different from last frame
- New people entering/leaving
- Mood shifts, tension changes
- Objects moved or added
- Proximity changes (approaching)

**🎭 Mood & Atmosphere:**
- Overall vibe (calm/tense/chaotic)
- Danger assessment
- Social dynamics
- Energy level

**⚠️ Danger Detection:**
- Aggressive behavior
- Fast approach toward camera
- Hostile intent indicators
- Escalating situations

### Example Output

**Frame 1 (Normal):**
```
A dimly lit room with wooden flooring and scattered furniture. Three people 
are visible: one person in a white t-shirt sits at a laptop near the window, 
another stands by a whiteboard gesturing while talking, and a third person 
in dark clothing walks toward the kitchen area. Several coffee cups sit on 
a marble table in the foreground. The atmosphere is casual and collaborative, 
with warm lighting from overhead lamps. No concerning behavior detected.
```

**Frame 2 (15s later - Tension):**
```
Same room, now with five people. Two additional people have entered and are 
standing near the entrance with crossed arms. The person who was at the laptop 
is now standing, facing the newcomers with tense body language. Voices appear 
raised based on gestures. The previously casual atmosphere has shifted to 
confrontational. One person is pointing accusingly while another has moved 
closer to the camera with an aggressive stance. TENSION DETECTED.
```

**Frame 3 (18s later - BOSS FIGHT):**
```
IMMEDIATE CONCERN: A person in a dark hoodie is charging directly toward the 
camera with clenched fists and an angry, contorted facial expression. Their 
face is red and they're shouting with hostile body language. Other people in 
the background are reacting with alarm, some backing away. The room is in chaos. 
This person has closed the distance rapidly from the previous frame and appears 
to be attacking. AGGRESSIVE CONFRONTATION IN PROGRESS.
```

### Integration with SideQuest

The bot sends descriptions to SideQuest's `/api/camera` endpoint, which:

1. **Processes with OpenAI** to transform to RPG narrative
2. **Detects danger levels** (none/low/high)
3. **Triggers boss fights** on aggressive behavior
4. **Updates objectives** based on scene context
5. **Shows on overlay** in real-time

### Cost Management

| Interval | FPS | Cost/Hour | When to Use |
|----------|-----|-----------|-------------|
| 10s | 0.1 | $5 | Testing, low budget |
| 5s | 0.2 | $9 | Good balance |
| **3s** | **0.33** | **$15** | **Recommended** |
| 2s | 0.5 | $23 | High responsiveness |
| 1s | 1.0 | $46 | Max detail (expensive) |

### Tips

1. **Start with 3s interval** - Best balance of detail and cost
2. **Keep context window at 5** - Good memory without overwhelming
3. **Watch the terminal** - See descriptions in real-time
4. **Check SideQuest overlay** - See how descriptions become RPG narrative
5. **Adjust based on needs:**
   - High-action → 2s interval
   - Calm walking → 5s interval
   - Testing → Use `--once` flag

### Troubleshooting

**"SideQuest backend not responding"**
```bash
cd backend
poetry run uvicorn main:app --reload --port 8787
```

**"OPENAI_API_KEY not set"**
```bash
export OPENAI_API_KEY="sk-..."
# Or add to .env file
```

**Descriptions not detailed enough**
- The bot is optimized for maximum detail
- GPT-4o sometimes gives shorter responses
- Try adding `--model gpt-4o` explicitly

**Cost too high**
```bash
# Slower interval = lower cost
python3 bot_realtime.py --interval 5.0  # $9/hr instead of $15/hr
```

### Development

Test single frame:
```bash
python3 bot_realtime.py --once
```

Compare with original bot:
```bash
# Terminal 1: Old bot (sends to iMessage)
export IMESSAGE_RECIPIENT="+15551234567"
python3 bot.py

# Terminal 2: New bot (sends to SideQuest)
python3 bot_realtime.py
```

---

## 🎯 Which Bot to Use?

| Use Case | Bot | Why |
|----------|-----|-----|
| Send updates to friend | `bot.py` | iMessage integration |
| Feed SideQuest overlay | `bot_realtime.py` | Direct API integration |
| Testing vision | Either | Both work |
| Max detail needed | `bot_realtime.py` | Ultra-detailed prompts |
| Want boss fights | `bot_realtime.py` | Context window + danger detection |
| Budget conscious | `bot.py` | Slower = cheaper |

**For SideQuest streaming: Use `bot_realtime.py`** ✨


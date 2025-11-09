#!/usr/bin/env python3
"""
bot_realtime.py - Enhanced Real-time Vision Bot for SideQuest Overlay

Takes screenshots every 3 seconds (0.33 FPS) and generates HIGHLY DETAILED descriptions
with rolling context window for better event tracking and boss fight detection.

Sends descriptions directly to SideQuest backend (/api/camera endpoint).

Requirements:
  - macOS with screencapture
  - Environment: OPENAI_API_KEY must be set
  - Python deps: openai, requests, python-dotenv
  - SideQuest backend running on http://localhost:8787

Usage:
  export OPENAI_API_KEY="sk-..."
  python3 bot_realtime.py --interval 3.0 --context-size 5
"""
import argparse
import base64
import os
import subprocess
import sys
import tempfile
import time
import requests
from typing import List, Dict, Optional
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Configuration
SIDEQUEST_API = "http://localhost:8787"
SIDEQUEST_API_PROD = "https://squaas.onrender.com"
DEFAULT_INTERVAL = 3.0  # 0.33 FPS - good balance of detail and cost
DEFAULT_CONTEXT_SIZE = 5  # Remember last 15 seconds
DEFAULT_MODEL = "gpt-4o"
MAX_TOKENS = 800  # Allow for detailed descriptions + structured output


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"Environment variable {name} is required.", file=sys.stderr)
        sys.exit(1)
    return value


def take_screenshot_png_bytes() -> bytes:
    """
    Uses the native macOS `screencapture` tool to grab a full-screen PNG.
    Reuses the proven method from bot.py.
    """
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        result = subprocess.run(
            ["screencapture", "-x", tmp_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"screencapture failed: {result.stderr.strip()}")
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


def load_openai_client():
    """Lazy import and instantiate OpenAI client"""
    try:
        from openai import OpenAI
    except Exception as exc:
        print(
            "The 'openai' package is required. Install with:\n"
            "  pip install --upgrade openai\n"
            f"Import error: {exc}",
            file=sys.stderr,
        )
        sys.exit(1)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)
    return OpenAI(api_key=api_key)


def build_context_prompt(context_window: List[Dict[str, str]]) -> str:
    """
    Build a context prompt from recent frame descriptions.
    Helps GPT track changes, movements, and escalations over time.
    """
    if not context_window:
        return ""
    
    context_lines = []
    for i, entry in enumerate(reversed(context_window)):
        seconds_ago = (i + 1) * 3  # Assuming 3-second intervals
        timestamp = entry.get('timestamp', 'unknown')
        desc = entry.get('description', '')
        context_lines.append(f"[{seconds_ago}s ago - {timestamp}]: {desc}")
    
    return "\n".join(context_lines)


def generate_complete_game_state(
    client,
    image_png_bytes: bytes,
    context_window: List[Dict[str, str]],
    model: str = "gpt-4o",
    max_tokens: int = 800,
    temperature: float = 0.3,
) -> Dict:
    """
    ONE SMART OpenAI CALL that generates EVERYTHING:
    - Ultra-detailed description
    - RPG-style objective
    - Danger assessment
    - Boss fight detection
    - Popup decision (only if warranted)
    
    Returns structured JSON with all game state.
    This saves money (1 call vs 2) and gives us full control.
    """
    b64_image = base64.b64encode(image_png_bytes).decode("utf-8")
    
    # Build context from previous frames
    context_text = build_context_prompt(context_window)
    context_section = f"\n\nPREVIOUS OBSERVATIONS:\n{context_text}\n" if context_text else ""
    
    # One comprehensive prompt that does everything
    prompt = f"""You are the AI brain for a real-world RPG overlay system. Analyze this first-person view from smart glasses and generate ALL the game state in ONE response.{context_section}

ANALYZE THE CURRENT FRAME AND OUTPUT JSON:

1. **DETAILED DESCRIPTION** (description): 
   - EXTREMELY detailed visual description (3-5 sentences)
   - People: count, positions, clothing, actions, expressions, body language
   - Objects: specific items (laptop, coffee cup, drone), locations
   - Environment: setting, lighting, layout, atmosphere
   - Actions: movements, interactions, changes from previous frames
   - Be specific: "person in white t-shirt near window" not just "a person"

2. **RPG OBJECTIVE** (objective):
   - Transform the scene into a Skyrim/Dark Souls style objective
   - Examples: "Navigate the crowded guild hall" | "Investigate the sealed tavern" | "Explore the ancient archives"
   - Keep it immersive and fantasy-themed
   - Make it match what's actually happening

3. **DANGER ASSESSMENT** (danger_level):
   - "none": Normal, calm, safe situation
   - "low": Tense, suspicious, argumentative but not threatening
   - "high": Aggressive behavior, hostile approach, immediate danger
   
4. **BOSS FIGHT DETECTION** (boss_fight_active):
   - true: Someone is behaving aggressively/threateningly, moving toward camera with hostile intent
   - false: No immediate threat
   - Look for: angry expressions, charging, raised fists, yelling, attacking

5. **BOSS NAME** (boss_name):
   - If boss_fight_active=true, create a Dark Souls style boss name
   - Examples: "The Enraged Stranger" | "The Aggressive Assailant" | "The Hostile Wanderer"
   - null if no boss fight

6. **POPUP DECISION** (show_popup):
   - true: Something significant happened that deserves a notification
   - Examples: boss fight started, dramatic change, achievement, quest update
   - false: Normal ongoing activity, nothing notable
   - BE SELECTIVE - don't popup for every minor thing

7. **POPUP MESSAGE** (popup_message):
   - If show_popup=true, write a brief Skyrim-style message
   - Examples: "DANGER APPROACHING!" | "Quest Updated" | "Enemy Defeated" | "Discovery Made"
   - Keep it short and impactful
   - Empty string if show_popup=false

**RESPOND WITH VALID JSON ONLY:**
{{
  "description": "detailed 3-5 sentence description...",
  "objective": "RPG-style objective",
  "danger_level": "none" | "low" | "high",
  "boss_fight_active": true | false,
  "boss_name": "Boss Name" or null,
  "show_popup": true | false,
  "popup_message": "message text" or ""
}}

Be smart about popup decisions. Only show them for significant events, not every frame."""

    try:
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64_image}"
                            },
                        },
                    ],
                }
            ],
        )
        
        content = resp.choices[0].message.content or "{}"
        game_state = json.loads(content)
        
        # Validate required fields
        required_fields = ["description", "objective", "danger_level", "boss_fight_active"]
        for field in required_fields:
            if field not in game_state:
                game_state[field] = "" if field in ["description", "objective"] else ("none" if field == "danger_level" else False)
        
        return game_state
        
    except Exception as exc:
        raise RuntimeError(f"OpenAI request failed: {exc}")


def update_sidequest_objective(objective: str, api_url: str = SIDEQUEST_API) -> bool:
    """Update the objective on SideQuest overlay"""
    try:
        response = requests.post(
            f"{api_url}/api/objective",
            json={"text": objective},
            timeout=2
        )
        return response.status_code == 200
    except Exception as e:
        print(f"  ✗ Failed to update objective: {e}")
        return False


def send_sidequest_popup(message: str, timeout_ms: int = 3000, api_url: str = SIDEQUEST_API) -> bool:
    """Send a popup message to SideQuest overlay"""
    try:
        response = requests.post(
            f"{api_url}/api/message",
            json={"text": message, "timeoutMs": timeout_ms},
            timeout=2
        )
        return response.status_code == 200
    except Exception as e:
        print(f"  ✗ Failed to send popup: {e}")
        return False


def update_sidequest_danger(danger_level: str, boss_fight: bool, boss_name: Optional[str], api_url: str = SIDEQUEST_API) -> bool:
    """Update danger level and boss fight state on backend"""
    try:
        response = requests.post(
            f"{api_url}/api/danger",
            json={
                "danger_level": danger_level,
                "boss_fight_active": boss_fight,
                "boss_name": boss_name
            },
            timeout=2
        )
        return response.status_code == 200
    except Exception as e:
        print(f"  ✗ Failed to update danger: {e}")
        return False


def log_description_to_backend(description: str, api_url: str = SIDEQUEST_API) -> bool:
    """
    Optional: Log the raw description to backend for debugging/analysis.
    The backend won't process it with OpenAI, just stores it.
    """
    try:
        requests.post(
            f"{api_url}/api/camera",
            json={"description": description},
            timeout=2
        )
        return True
    except:
        return False


def check_backend_health(api_url: str = SIDEQUEST_API) -> bool:
    """Check if SideQuest backend is running"""
    try:
        response = requests.get(f"{api_url}/", timeout=2)
        return response.status_code == 200
    except:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Real-time vision bot with ultra-detailed descriptions for SideQuest overlay")
    parser.add_argument(
        "--interval",
        type=float,
        default=DEFAULT_INTERVAL,
        help=f"Seconds between screenshots (default: {DEFAULT_INTERVAL}s = 0.33 FPS)",
    )
    parser.add_argument(
        "--context-size",
        type=int,
        default=DEFAULT_CONTEXT_SIZE,
        help=f"Number of previous frames to remember (default: {DEFAULT_CONTEXT_SIZE})",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"OpenAI vision model (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default=None,
        help=f"SideQuest backend API URL (default: {SIDEQUEST_API})",
    )
    parser.add_argument(
        "--prod",
        action="store_true",
        help=f"Use production backend at {SIDEQUEST_API_PROD}",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single cycle and exit (useful for testing)",
    )
    args = parser.parse_args()
    
    # Set API URL based on --prod flag or --api-url argument
    if args.prod:
        args.api_url = SIDEQUEST_API_PROD
    elif args.api_url is None:
        args.api_url = SIDEQUEST_API

    # Verify requirements
    require_env("OPENAI_API_KEY")
    
    # Check if backend is running
    if not check_backend_health(args.api_url):
        print(f"⚠️  WARNING: SideQuest backend not responding at {args.api_url}")
        print("   Make sure to start it: cd backend && poetry run uvicorn main:app --reload --port 8787")
        response = input("   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    else:
        print(f"✓ SideQuest backend is running at {args.api_url}")

    client = load_openai_client()
    context_window: List[Dict[str, str]] = []

    # Calculate costs
    images_per_hour = 3600 / args.interval
    cost_per_hour = images_per_hour * 0.01275  # $0.01275 per image with GPT-4o
    
    print("\n" + "="*70)
    print("🎮 SideQuest Real-time Vision Bot")
    print("="*70)
    print(f"Interval: {args.interval}s ({1/args.interval:.2f} FPS)")
    print(f"Context window: {args.context_size} frames ({args.context_size * args.interval:.0f}s)")
    print(f"Model: {args.model}")
    print(f"Est. cost: ${cost_per_hour:.2f}/hour")
    print(f"Backend: {args.api_url}")
    print("="*70)
    print("\nGenerating ultra-detailed descriptions...")
    print("Press Ctrl+C to stop\n")
    
    frame_count = 0
    last_objective = ""
    last_boss_state = False
    
    try:
        while True:
            frame_count += 1
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            try:
                # 1. Capture screenshot
                print(f"[{timestamp}] Frame {frame_count}: Capturing...")
                img = take_screenshot_png_bytes()
                
                # 2. ONE SMART OpenAI CALL - Get everything at once
                print(f"[{timestamp}] Frame {frame_count}: Processing with AI (context: {len(context_window)} frames)...")
                game_state = generate_complete_game_state(
                    client, 
                    img, 
                    context_window,
                    model=args.model
                )
                
                # 3. Display what we got
                print(f"\n📸 Description: {game_state.get('description', 'N/A')}")
                print(f"🎯 Objective: {game_state.get('objective', 'N/A')}")
                print(f"⚠️  Danger: {game_state.get('danger_level', 'none')}")
                
                if game_state.get('boss_fight_active'):
                    print(f"🔴 BOSS FIGHT: {game_state.get('boss_name', 'Unknown Enemy')}")
                
                if game_state.get('show_popup'):
                    print(f"💬 Popup: {game_state.get('popup_message', '')}")
                
                # 4. Intelligently update SideQuest backend
                print(f"\n🔄 Updating SideQuest...")
                
                # Always update danger state
                update_sidequest_danger(
                    game_state.get('danger_level', 'none'),
                    game_state.get('boss_fight_active', False),
                    game_state.get('boss_name'),
                    args.api_url
                )
                
                # Update objective if it changed
                current_objective = game_state.get('objective', '')
                if current_objective and current_objective != last_objective:
                    if update_sidequest_objective(current_objective, args.api_url):
                        print(f"  ✓ Objective: {current_objective}")
                        last_objective = current_objective
                
                # Send popup ONLY if AI decided it's warranted
                if game_state.get('show_popup') and game_state.get('popup_message'):
                    if send_sidequest_popup(game_state['popup_message'], 3000, args.api_url):
                        print(f"  ✓ Popup: {game_state['popup_message']}")
                else:
                    print(f"  ⊘ No popup (nothing significant)")
                
                # Handle boss fight state transitions
                current_boss_state = game_state.get('boss_fight_active', False)
                if current_boss_state and not last_boss_state:
                    # Boss fight just started!
                    boss_message = f"⚔️ BOSS ENCOUNTER: {game_state.get('boss_name', 'Unknown Enemy')}"
                    send_sidequest_popup(boss_message, 5000, args.api_url)
                    print(f"  🔴 BOSS FIGHT STARTED!")
                elif not current_boss_state and last_boss_state:
                    # Boss fight ended
                    send_sidequest_popup("Victory! Enemy Defeated!", 3000, args.api_url)
                    print(f"  ✅ Boss fight ended")
                
                last_boss_state = current_boss_state
                
                # Optional: Log raw description to backend (for debugging)
                # log_description_to_backend(game_state.get('description', ''), args.api_url)
                
                # 5. Update context window (rolling buffer)
                context_window.append({
                    'timestamp': timestamp,
                    'description': game_state.get('description', ''),
                    'objective': game_state.get('objective', ''),
                    'danger_level': game_state.get('danger_level', 'none'),
                    'frame': frame_count
                })
                
                if len(context_window) > args.context_size:
                    context_window.pop(0)
                
                print(f"[{timestamp}] Frame {frame_count}: Complete\n")
                
            except Exception as exc:
                print(f"[{timestamp}] [error] {exc}", file=sys.stderr)
            
            if args.once:
                break
            
            time.sleep(args.interval)
            
    except KeyboardInterrupt:
        print("\n\n" + "="*70)
        print(f"✓ Stopped after {frame_count} frames")
        print("="*70)


if __name__ == "__main__":
    main()


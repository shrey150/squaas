"""AI-powered processing of camera descriptions using OpenAI"""
from openai import AsyncOpenAI
from typing import List, Dict, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AIGameUpdate(BaseModel):
    """Structured output from AI processing"""
    objective: str
    message_text: str
    message_visible: bool
    danger_level: str  # "none", "low", "high"
    boss_fight_active: bool
    boss_name: Optional[str] = None
    environment_summary: str


# Keep a rolling context window of recent descriptions
description_history: List[str] = []
MAX_HISTORY = 5


async def process_camera_description(description: str) -> AIGameUpdate:
    """
    Process a camera description using OpenAI to generate game state updates.
    
    Detects confrontations, generates Skyrim-style narratives, and determines
    danger levels based on the scene description.
    """
    global description_history
    
    # Add to history
    description_history.append(description)
    if len(description_history) > MAX_HISTORY:
        description_history.pop(0)
    
    # Build context from recent descriptions
    context = "\n".join([f"[{i}] {desc}" for i, desc in enumerate(description_history)])
    
    system_prompt = """You are a game master for a real-world RPG overlay in the style of Skyrim and Dark Souls.
You receive descriptions of what a person's camera sees in real life, and you transform mundane reality into fantasy RPG elements.

Your job:
1. Generate engaging objectives that sound like Skyrim quests based on what's happening
2. Detect if someone is being aggressive, hostile, angry, or approaching threateningly
3. If confrontation detected, trigger a boss fight with a dramatic boss name
4. Transform ordinary objects/places into fantasy equivalents (coffee shop = tavern, office = guild hall)
5. Create brief messages for notable events
6. Rate danger level: "none" (normal), "low" (suspicious/tense), "high" (confrontation/aggressive)

BE CREATIVE with the fantasy transformations but ACCURATE with danger detection.

Examples:
- "Person holding a can" → "Mysterious merchant offers an elixir" (none)
- "Coffee bar closed" → "The tavern door is sealed" (none)
- "Person moving quickly towards camera, looking angry" → BOSS FIGHT: "The Enraged Stranger" (high)
- "Group of people arguing loudly" → "Hostile guild members gather" (low)
- "Someone yelling aggressively" → BOSS FIGHT (high)

Respond ONLY with valid JSON matching this schema:
{
  "objective": "Short Skyrim-style objective",
  "message_text": "Brief event message or empty string",
  "message_visible": true/false,
  "danger_level": "none" | "low" | "high",
  "boss_fight_active": true/false,
  "boss_name": "Boss Name" or null,
  "environment_summary": "Brief 2-3 word description"
}"""

    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Recent camera observations:\n{context}\n\nLatest observation: {description}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=300
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return AIGameUpdate(
            objective=result.get("objective", "Explore the unknown realm"),
            message_text=result.get("message_text", ""),
            message_visible=result.get("message_visible", False),
            danger_level=result.get("danger_level", "none"),
            boss_fight_active=result.get("boss_fight_active", False),
            boss_name=result.get("boss_name"),
            environment_summary=result.get("environment_summary", "mysterious area")
        )
    
    except Exception as e:
        print(f"Error processing with OpenAI: {e}")
        # Fallback response
        return AIGameUpdate(
            objective="Continue your journey",
            message_text="",
            message_visible=False,
            danger_level="none",
            boss_fight_active=False,
            boss_name=None,
            environment_summary="unknown"
        )


def reset_context():
    """Clear the description history"""
    global description_history
    description_history = []


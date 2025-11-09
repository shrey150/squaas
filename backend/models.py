from pydantic import BaseModel
from typing import List, Optional


class Player(BaseModel):
    lat: float
    lon: float
    heading: float


class POI(BaseModel):
    lat: float
    lon: float
    label: str


class Message(BaseModel):
    text: str
    visible: bool
    timeoutMs: int


class GameState(BaseModel):
    player: Player
    pois: List[POI]
    objective: str
    message: Message
    danger_level: str = "none"  # "none", "low", "high"
    boss_fight_active: bool = False
    boss_name: Optional[str] = None
    environment: str = ""


# Request models for API endpoints
class LocationUpdate(BaseModel):
    lat: float
    lon: float
    heading: Optional[float] = None


class CameraDescription(BaseModel):
    description: str
    timestamp: Optional[int] = None


class ObjectiveUpdate(BaseModel):
    text: str


class MessageUpdate(BaseModel):
    text: str
    timeoutMs: int = 3000


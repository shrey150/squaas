from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
from typing import List
from models import (
    GameState, Player, POI, Message,
    LocationUpdate, CameraDescription, ObjectiveUpdate, MessageUpdate, DangerUpdate
)
from pois_database import get_nearby_pois
from ai_processor import process_camera_description
import os


# Global state - initialize with San Francisco center
game_state = GameState(
    player=Player(lat=37.7749, lon=-122.4194, heading=0.0),
    pois=get_nearby_pois(37.7749, -122.4194),  # Get nearby SF POIs
    objective="Begin your adventure in San Francisco",
    message=Message(text="", visible=False, timeoutMs=0),
    danger_level="none",
    boss_fight_active=False,
    boss_name=None,
    environment=""
)

# Connected WebSocket clients
connected_clients: List[WebSocket] = []


async def broadcast_state():
    """Background task to broadcast game state to all connected clients every 100ms"""
    while True:
        if connected_clients:
            state_json = game_state.model_dump_json()
            disconnected = []
            for client in connected_clients:
                try:
                    await client.send_text(state_json)
                except Exception:
                    disconnected.append(client)
            
            # Remove disconnected clients
            for client in disconnected:
                if client in connected_clients:
                    connected_clients.remove(client)
        
        await asyncio.sleep(0.1)  # 100ms = 10 Hz broadcast rate


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Start background tasks
    broadcast_task = asyncio.create_task(broadcast_state())
    
    yield
    
    # Cleanup
    broadcast_task.cancel()


app = FastAPI(lifespan=lifespan)

# CORS middleware for Next.js frontend
# Allow all origins for mobile testing with ngrok/cloudflare
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for mobile testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "SideQuest Overlay Backend Running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time state broadcasting"""
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")
    
    try:
        # Keep connection alive and listen for any client messages
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(connected_clients)}")


@app.post("/update")
async def update_state(state: GameState):
    """HTTP endpoint to update game state externally (full state)"""
    global game_state
    game_state = state
    return {"status": "updated"}


@app.post("/api/location")
async def update_location(location: LocationUpdate):
    """Update player location from phone GPS"""
    global game_state
    
    # Update player position
    game_state.player.lat = location.lat
    game_state.player.lon = location.lon
    if location.heading is not None:
        game_state.player.heading = location.heading
    
    # Update POIs based on new location
    game_state.pois = get_nearby_pois(location.lat, location.lon)
    
    print(f"Location updated: {location.lat}, {location.lon} - {len(game_state.pois)} POIs nearby")
    
    return {
        "status": "location_updated",
        "nearby_pois": len(game_state.pois)
    }


@app.post("/api/camera")
async def process_camera(camera: CameraDescription):
    """Process camera description with AI to update game narrative"""
    global game_state
    
    print(f"Processing camera: {camera.description[:50]}...")
    
    # Process with OpenAI
    ai_update = await process_camera_description(camera.description)
    
    # Update game state with AI results
    game_state.objective = ai_update.objective
    game_state.danger_level = ai_update.danger_level
    game_state.boss_fight_active = ai_update.boss_fight_active
    game_state.boss_name = ai_update.boss_name
    game_state.environment = ai_update.environment_summary
    
    # Update message if AI generated one
    if ai_update.message_visible and ai_update.message_text:
        game_state.message = Message(
            text=ai_update.message_text,
            visible=True,
            timeoutMs=3000
        )
    
    print(f"AI Update - Objective: {ai_update.objective}, Danger: {ai_update.danger_level}, Boss: {ai_update.boss_fight_active}")
    
    return {
        "status": "processed",
        "objective": ai_update.objective,
        "danger_level": ai_update.danger_level,
        "boss_fight": ai_update.boss_fight_active
    }


@app.post("/api/objective")
async def set_objective(update: ObjectiveUpdate):
    """Manually set objective"""
    global game_state
    game_state.objective = update.text
    return {"status": "objective_updated"}


@app.post("/api/message")
async def send_message(update: MessageUpdate):
    """Manually send a message"""
    global game_state
    game_state.message = Message(
        text=update.text,
        visible=True,
        timeoutMs=update.timeoutMs
    )
    return {"status": "message_sent"}


@app.post("/api/danger")
async def update_danger(update: DangerUpdate):
    """Update danger level and boss fight state (called from bot_realtime.py)"""
    global game_state
    game_state.danger_level = update.danger_level
    game_state.boss_fight_active = update.boss_fight_active
    game_state.boss_name = update.boss_name
    return {"status": "danger_updated"}


@app.get("/api/state")
async def get_state():
    """Get current game state"""
    return game_state


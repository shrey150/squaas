import asyncio
import math
import time
from models import GameState, Message


async def simulate_gps(game_state: GameState):
    """
    Simulate GPS movement in a circular path around San Francisco.
    Updates player position at ~5 Hz with realistic lat/lon increments.
    """
    # Starting point: San Francisco
    center_lat = 37.7749
    center_lon = -122.4194
    radius = 0.002  # ~200 meters in degrees
    
    angle = 0.0
    angular_speed = 0.02  # radians per update (~11 degrees)
    
    objectives = [
        "Find the Ancient Treasure",
        "Defeat the Dragon",
        "Explore the Ruins",
        "Return to the Quest Giver"
    ]
    objective_index = 0
    last_objective_change = time.time()
    
    messages = [
        "Quest Started!",
        "Enemy Spotted",
        "Treasure Found!",
        "Level Up!"
    ]
    message_index = 0
    last_message_time = time.time()
    message_interval = 15  # Show message every 15 seconds
    
    while True:
        # Update position in circular path
        angle += angular_speed
        if angle >= 2 * math.pi:
            angle -= 2 * math.pi
        
        new_lat = center_lat + radius * math.cos(angle)
        new_lon = center_lon + radius * math.sin(angle)
        
        # Calculate heading (direction of movement)
        # Heading in degrees from north (0-360)
        heading = (math.degrees(angle) + 90) % 360
        
        # Update player state
        game_state.player.lat = new_lat
        game_state.player.lon = new_lon
        game_state.player.heading = heading
        
        # Change objective every 20 seconds
        current_time = time.time()
        if current_time - last_objective_change > 20:
            objective_index = (objective_index + 1) % len(objectives)
            game_state.objective = objectives[objective_index]
            last_objective_change = current_time
        
        # Show messages periodically
        if current_time - last_message_time > message_interval:
            game_state.message.text = messages[message_index]
            game_state.message.visible = True
            game_state.message.timeoutMs = 3000
            message_index = (message_index + 1) % len(messages)
            last_message_time = current_time
        
        # Clear message after it should have disappeared
        if game_state.message.visible and current_time - last_message_time > 3.5:
            game_state.message.visible = False
            game_state.message.text = ""
        
        # Update rate: 200ms = 5 Hz
        await asyncio.sleep(0.2)


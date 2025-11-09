#!/usr/bin/env python3
"""
Live Demo Script for SideQuest Overlay
This script simulates a realistic journey through San Francisco with various encounters.
Watch the frontend at http://localhost:3000 to see the overlay update in real-time!
"""
import requests
import time
import random
import math

BASE_URL = "http://localhost:8787"

# San Francisco location data
SF_LOCATIONS = [
    {"lat": 37.7749, "lon": -122.4194, "name": "City Hall Area", "heading": 90},
    {"lat": 37.8080, "lon": -122.4177, "name": "Near Alcatraz Ferry", "heading": 180},
    {"lat": 37.8024, "lon": -122.4058, "name": "Coit Tower", "heading": 270},
    {"lat": 37.8030, "lon": -122.4187, "name": "Lombard Street", "heading": 225},
    {"lat": 37.7955, "lon": -122.4058, "name": "Pier 39", "heading": 315},
    {"lat": 37.7879, "lon": -122.4074, "name": "Ferry Building", "heading": 45},
]

# Camera scene descriptions for different scenarios
NORMAL_SCENES = [
    "A person in a white shirt stands in a dimly lit room with a messy floor, holding a phone, while a couch and plants are visible in the background.",
    "A hand holds a playing card in the foreground, while another person walks away in a room with wooden flooring and a table cluttered with objects.",
    "A cozy indoor space with several people seated on couches, a large round lamp hanging from the ceiling, and various objects like boxes scattered around.",
    "A person holds a can labeled 'RUMM' in a dimly lit room with a laptop on a desk, another person in a white shirt nearby, and shelves in the background.",
    "The image shows a dimly lit room with wooden flooring, tables, and chairs, some cluttered with objects; people are seated at tables.",
    "A marble table is filled with various food containers and drinks; a hand with a smartwatch is visible, while a smartphone is placed nearby.",
]

TENSE_SCENES = [
    "A group of people stands around a table with intense expressions, some gesturing emphatically in a modern, well-lit room.",
    "Two people face each other with tense body language in a hallway, one blocking the other's path with arms crossed.",
    "A crowded room where several people are arguing loudly, voices raised, with one person pointing accusingly at another.",
    "Someone quickly approaching through a doorway with a stern expression, while others in the room turn to look with concern.",
]

BOSS_FIGHT_SCENES = [
    "A person yelling aggressively and moving quickly towards the camera with raised fists and an angry, contorted facial expression.",
    "Someone charging directly at the camera with hostile body language, shouting threats, face red with rage.",
    "An aggressive individual lunging forward with clenched fists, eyes wide with fury, moving rapidly towards the camera in a threatening manner.",
]

CALM_SCENES = [
    "A hand points to a sign reading 'COFFEE BAR CLOSED' on a black countertop with coffee machines and a grinder in the background.",
    "The image shows a drone on a wooden table, with a person's hand pointing at equipment. The background features a modern room with furniture.",
    "A group of people in a dimly lit room, some standing and others seated, with large windows and a ceiling with exposed beams visible.",
]


def update_location(lat, lon, heading):
    """Send GPS location update"""
    try:
        response = requests.post(f"{BASE_URL}/api/location", json={
            "lat": lat,
            "lon": lon,
            "heading": heading
        }, timeout=2)
        data = response.json()
        return data
    except Exception as e:
        print(f"❌ Location update failed: {e}")
        return None


def send_camera_description(description):
    """Send camera AI description"""
    try:
        response = requests.post(f"{BASE_URL}/api/camera", json={
            "description": description
        }, timeout=10)
        data = response.json()
        return data
    except Exception as e:
        print(f"❌ Camera processing failed: {e}")
        return None


def send_message(text, timeout_ms=3000):
    """Send a notification message"""
    try:
        response = requests.post(f"{BASE_URL}/api/message", json={
            "text": text,
            "timeoutMs": timeout_ms
        }, timeout=2)
        return response.json()
    except Exception as e:
        print(f"❌ Message send failed: {e}")
        return None


def interpolate_location(start, end, progress):
    """Interpolate between two locations"""
    lat = start["lat"] + (end["lat"] - start["lat"]) * progress
    lon = start["lon"] + (end["lon"] - start["lon"]) * progress
    heading = start["heading"]
    return lat, lon, heading


def print_banner(text):
    """Print a fancy banner"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")


def demo_sequence():
    """Run the full demo sequence"""
    print_banner("🎮 SIDEQUEST OVERLAY LIVE DEMO 🎮")
    print("Watch the overlay at: http://localhost:3000")
    print("Press Ctrl+C to stop\n")
    time.sleep(2)
    
    # Phase 1: Intro and exploration
    print_banner("PHASE 1: Beginning the Adventure")
    
    send_message("Adventure Begins!", 4000)
    time.sleep(2)
    
    location = SF_LOCATIONS[0]
    print(f"📍 Traveling to: {location['name']}")
    update_location(location["lat"], location["lon"], location["heading"])
    time.sleep(2)
    
    print("📸 Camera: Normal scene")
    scene = random.choice(NORMAL_SCENES)
    result = send_camera_description(scene)
    if result:
        print(f"   ➜ Objective: {result.get('objective', 'N/A')}")
        print(f"   ➜ Danger: {result.get('danger_level', 'N/A')}")
    time.sleep(5)
    
    # Phase 2: Movement through SF
    print_banner("PHASE 2: Exploring San Francisco")
    
    for i in range(1, 4):
        location = SF_LOCATIONS[i]
        print(f"📍 Moving to: {location['name']}")
        
        # Smooth movement with 3 steps
        prev_location = SF_LOCATIONS[i-1]
        for step in range(3):
            progress = (step + 1) / 3
            lat, lon, heading = interpolate_location(prev_location, location, progress)
            update_location(lat, lon, heading)
            time.sleep(1)
        
        # Send a scene
        scene = random.choice(NORMAL_SCENES + CALM_SCENES)
        print("📸 Camera: Exploring the area")
        result = send_camera_description(scene)
        if result:
            print(f"   ➜ Objective: {result.get('objective', 'N/A')}")
        time.sleep(4)
    
    # Phase 3: Tension builds
    print_banner("PHASE 3: Something Feels Wrong...")
    
    send_message("You sense danger nearby...", 3000)
    time.sleep(2)
    
    location = SF_LOCATIONS[4]
    print(f"📍 Arriving at: {location['name']}")
    update_location(location["lat"], location["lon"], location["heading"])
    time.sleep(2)
    
    print("📸 Camera: Tense situation detected")
    scene = random.choice(TENSE_SCENES)
    result = send_camera_description(scene)
    if result:
        print(f"   ➜ Objective: {result.get('objective', 'N/A')}")
        print(f"   ➜ Danger: {result.get('danger_level', 'N/A')} ⚠️")
    time.sleep(6)
    
    # Phase 4: BOSS FIGHT!
    print_banner("PHASE 4: ⚔️ BOSS ENCOUNTER! ⚔️")
    
    send_message("DANGER APPROACHING!", 3000)
    time.sleep(2)
    
    print("📸 Camera: AGGRESSIVE CONFRONTATION!")
    scene = random.choice(BOSS_FIGHT_SCENES)
    result = send_camera_description(scene)
    if result:
        print(f"   ➜ Objective: {result.get('objective', 'N/A')}")
        print(f"   ➜ Danger: {result.get('danger_level', 'N/A')} 🔴")
        print(f"   ➜ Boss Fight: {result.get('boss_fight', False)}")
        if result.get('boss_fight'):
            print(f"   ➜ 💀 BOSS SPAWNED! 💀")
    
    time.sleep(8)
    
    # Phase 5: Resolution
    print_banner("PHASE 5: Victory!")
    
    send_message("Enemy Defeated!", 4000)
    time.sleep(2)
    
    location = SF_LOCATIONS[5]
    print(f"📍 Returning to: {location['name']}")
    update_location(location["lat"], location["lon"], location["heading"])
    time.sleep(2)
    
    print("📸 Camera: Peace restored")
    scene = random.choice(CALM_SCENES)
    result = send_camera_description(scene)
    if result:
        print(f"   ➜ Objective: {result.get('objective', 'N/A')}")
        print(f"   ➜ Danger: {result.get('danger_level', 'N/A')} ✅")
    time.sleep(5)
    
    # Finale
    print_banner("🎉 QUEST COMPLETE! 🎉")
    send_message("Achievement Unlocked: First Quest!", 5000)
    time.sleep(3)
    
    print("\n✅ Demo complete!")
    print("The overlay will continue showing the last state.")
    print("Run this script again to see another adventure!\n")


def continuous_demo():
    """Run demo in a continuous loop"""
    try:
        demo_sequence()
    except KeyboardInterrupt:
        print("\n\n👋 Demo stopped by user")
    except Exception as e:
        print(f"\n❌ Error during demo: {e}")


if __name__ == "__main__":
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/", timeout=2)
        if response.status_code == 200:
            print("✅ Backend is running!")
        else:
            print("⚠️  Backend responded but with unexpected status")
    except:
        print("❌ ERROR: Backend is not running!")
        print("   Start it with: cd backend && ./run_server.sh")
        exit(1)
    
    # Check if OpenAI key is set
    print("⚠️  Note: This demo requires OpenAI API key in backend/.env")
    print("   If not set, camera descriptions won't process correctly.\n")
    
    time.sleep(2)
    continuous_demo()


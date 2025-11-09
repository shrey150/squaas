#!/usr/bin/env python3
"""
Test script to demonstrate API usage
Run this to simulate camera and GPS updates
"""
import requests
import time

BASE_URL = "http://localhost:8787"

def test_location_update():
    """Test GPS location update"""
    response = requests.post(f"{BASE_URL}/api/location", json={
        "lat": 37.7749,
        "lon": -122.4194,
        "heading": 90.0
    })
    print(f"Location Update: {response.json()}")

def test_camera_description(description):
    """Test camera description processing"""
    response = requests.post(f"{BASE_URL}/api/camera", json={
        "description": description
    })
    print(f"Camera Processed: {response.json()}")

def test_manual_message():
    """Test manual message"""
    response = requests.post(f"{BASE_URL}/api/message", json={
        "text": "Achievement Unlocked!",
        "timeoutMs": 3000
    })
    print(f"Message Sent: {response.json()}")

def get_current_state():
    """Get current game state"""
    response = requests.get(f"{BASE_URL}/api/state")
    print(f"Current State: {response.json()}")

if __name__ == "__main__":
    print("Testing SideQuest Overlay API")
    print("=" * 50)
    
    # Test location
    print("\n1. Testing location update...")
    test_location_update()
    time.sleep(1)
    
    # Test normal scene
    print("\n2. Testing normal camera description...")
    test_camera_description(
        "A person in a white shirt stands in a dimly lit room with a messy floor, "
        "holding a phone, while a couch and plants are visible in the background."
    )
    time.sleep(2)
    
    # Test potential danger scene
    print("\n3. Testing tense camera description...")
    test_camera_description(
        "A group of people arguing loudly in a dimly lit room, some standing with "
        "raised voices and tense body language."
    )
    time.sleep(2)
    
    # Test boss fight trigger
    print("\n4. Testing confrontation camera description...")
    test_camera_description(
        "A person moving quickly towards the camera with an angry expression, "
        "yelling aggressively with clenched fists."
    )
    time.sleep(2)
    
    # Test message
    print("\n5. Testing manual message...")
    test_manual_message()
    time.sleep(1)
    
    # Get final state
    print("\n6. Getting final state...")
    get_current_state()
    
    print("\n" + "=" * 50)
    print("Test complete! Check the frontend to see the updates.")


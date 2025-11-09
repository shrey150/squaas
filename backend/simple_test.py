#!/usr/bin/env python3
"""
Simple Test Script - Quick API Testing
No OpenAI required, just tests the endpoints with simple data.
"""
import requests
import time

BASE_URL = "http://localhost:8787"

print("🧪 Simple API Test (No OpenAI needed)\n")

# Test 1: Location Update
print("1️⃣  Testing location update...")
response = requests.post(f"{BASE_URL}/api/location", json={
    "lat": 37.8080,
    "lon": -122.4177,
    "heading": 180
})
print(f"   Response: {response.json()}")
time.sleep(2)

# Test 2: Manual Objective
print("\n2️⃣  Setting custom objective...")
response = requests.post(f"{BASE_URL}/api/objective", json={
    "text": "Test the Ancient Overlay System"
})
print(f"   Response: {response.json()}")
time.sleep(2)

# Test 3: Send Message
print("\n3️⃣  Sending notification message...")
response = requests.post(f"{BASE_URL}/api/message", json={
    "text": "System Test Complete!",
    "timeoutMs": 4000
})
print(f"   Response: {response.json()}")
time.sleep(2)

# Test 4: Move to different location
print("\n4️⃣  Moving to Golden Gate Bridge area...")
response = requests.post(f"{BASE_URL}/api/location", json={
    "lat": 37.8199,
    "lon": -122.4783,
    "heading": 270
})
print(f"   Response: {response.json()}")
time.sleep(2)

# Test 5: Another message
print("\n5️⃣  Sending achievement message...")
response = requests.post(f"{BASE_URL}/api/message", json={
    "text": "Achievement: Discovered Golden Gate!",
    "timeoutMs": 5000
})
print(f"   Response: {response.json()}")
time.sleep(2)

# Test 6: Get Current State
print("\n6️⃣  Getting current game state...")
response = requests.get(f"{BASE_URL}/api/state")
state = response.json()
print(f"   Player: {state['player']['lat']:.4f}, {state['player']['lon']:.4f}")
print(f"   Nearby POIs: {len(state['pois'])}")
print(f"   Objective: {state['objective']}")

print("\n✅ All tests complete! Check the overlay at http://localhost:3000")


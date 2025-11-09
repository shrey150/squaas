#!/usr/bin/env python3
"""
Test message fade in/out with 3 second timeout
"""
import requests
import time

BASE_URL = "http://localhost:8787"

print("🧪 Testing Message Fade In/Out")
print("=" * 50)

messages = [
    "Achievement Unlocked!",
    "Quest Complete!",
    "Enemy Defeated!",
    "Level Up!",
]

try:
    for i, msg in enumerate(messages, 1):
        print(f"\n{i}. Sending: '{msg}'")
        print("   Should appear for 3 seconds then fade out...")
        
        response = requests.post(f"{BASE_URL}/api/message", json={
            "text": msg,
            "timeoutMs": 3000
        })
        
        print(f"   Response: {response.json()}")
        
        # Wait for message to fade out (3s display + 0.5s fade animation)
        time.sleep(4)
        print("   ✅ Message should have faded out by now")
    
    print("\n" + "=" * 50)
    print("✅ Test complete!")
    print("All messages should have appeared and disappeared properly.")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("Make sure the backend is running: cd backend && make run")


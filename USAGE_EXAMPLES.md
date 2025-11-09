# Usage Examples for SideQuest Overlay

This document shows how to integrate your external server (phone/camera app) with the SideQuest backend.

## Quick Start Test

Run the test script to see the system in action:

```bash
cd backend
python3 test_api.py
```

This will simulate:
1. GPS location update
2. Normal camera scene
3. Tense scene (low danger)
4. Aggressive confrontation (boss fight trigger)
5. Manual message notification

## Integration from Your External Server

### Sending GPS Updates from Phone

Your mobile app should send GPS updates every few seconds:

```python
import requests
import time

def send_gps_update(lat, lon, heading=None):
    url = "http://localhost:8787/api/location"
    data = {
        "lat": lat,
        "lon": lon,
        "heading": heading  # Optional, compass direction in degrees
    }
    response = requests.post(url, json=data)
    return response.json()

# Example: Send updates every 2 seconds
while True:
    # Get GPS from your phone's sensors
    current_lat = get_phone_gps_lat()
    current_lon = get_phone_gps_lon()
    current_heading = get_phone_compass()
    
    result = send_gps_update(current_lat, current_lon, current_heading)
    print(f"Updated location: {result['nearby_pois']} POIs nearby")
    
    time.sleep(2)
```

### Sending Camera Descriptions

Your camera processing app should send AI-generated descriptions every 10 seconds:

```python
import requests
import time

def send_camera_description(description):
    url = "http://localhost:8787/api/camera"
    data = {
        "description": description,
        "timestamp": int(time.time())
    }
    response = requests.post(url, json=data)
    return response.json()

# Example: Camera descriptions every 10 seconds
while True:
    # Get AI description from your camera/vision model
    description = get_camera_ai_description()
    
    result = send_camera_description(description)
    print(f"AI processed: {result['objective']}")
    print(f"Danger level: {result['danger_level']}")
    
    if result['boss_fight']:
        print("🔥 BOSS FIGHT TRIGGERED!")
    
    time.sleep(10)
```

## Example Camera Descriptions & Expected Outputs

### Normal Scenes (danger_level: "none")

**Input:**
```
"A person in a white shirt stands in a dimly lit room with a messy floor, 
holding a phone, while a couch and plants are visible in the background."
```

**Output:**
- Objective: _"Explore the abandoned chamber"_
- Danger: none
- Boss Fight: false

---

**Input:**
```
"A hand holds a King of Spades playing card in the foreground, with a dimly 
lit office scene behind, featuring people at desks and various office equipment."
```

**Output:**
- Objective: _"Investigate the mysterious card of fate"_
- Danger: none
- Boss Fight: false

### Tense Scenes (danger_level: "low")

**Input:**
```
"A group of people arguing loudly in a dimly lit room, some standing with 
raised voices and tense body language."
```

**Output:**
- Objective: _"Navigate the hostile guild gathering"_
- Danger: low (objective bar turns yellow)
- Boss Fight: false

### Confrontation Scenes (danger_level: "high", boss_fight: true)

**Input:**
```
"A person moving quickly towards the camera with an angry expression, 
yelling aggressively with clenched fists."
```

**Output:**
- Objective: _"SURVIVE THE ENCOUNTER"_
- Danger: high (red borders, pulsing effects)
- Boss Fight: true
- Boss Name: _"The Enraged Stranger"_

---

**Input:**
```
"Someone charging at the camera aggressively, shouting threats, with hostile 
body language and raised fists."
```

**Output:**
- Objective: _"Defend yourself against the attacker"_
- Danger: high
- Boss Fight: true
- Boss Name: _"The Aggressive Assailant"_

## Real-World Integration Example

Here's a complete example of a server that integrates both GPS and camera:

```python
import requests
import time
import threading

BASE_URL = "http://localhost:8787"

class SideQuestIntegration:
    def __init__(self):
        self.running = True
    
    def gps_loop(self):
        """Send GPS updates every 2 seconds"""
        while self.running:
            try:
                # Get from your phone's GPS sensor
                lat, lon, heading = self.get_phone_gps()
                
                requests.post(f"{BASE_URL}/api/location", json={
                    "lat": lat,
                    "lon": lon,
                    "heading": heading
                })
                
                time.sleep(2)
            except Exception as e:
                print(f"GPS error: {e}")
                time.sleep(5)
    
    def camera_loop(self):
        """Send camera descriptions every 10 seconds"""
        while self.running:
            try:
                # Get from your camera AI model
                description = self.get_camera_description()
                
                response = requests.post(f"{BASE_URL}/api/camera", json={
                    "description": description
                })
                
                result = response.json()
                print(f"[CAMERA] {result['objective']}")
                
                if result['boss_fight']:
                    self.send_alert("BOSS FIGHT!")
                
                time.sleep(10)
            except Exception as e:
                print(f"Camera error: {e}")
                time.sleep(10)
    
    def get_phone_gps(self):
        """Replace with your actual GPS sensor reading"""
        # Example: reading from a GPS device or API
        return 37.7749, -122.4194, 90.0
    
    def get_camera_description(self):
        """Replace with your actual camera AI model"""
        # Example: reading from OpenAI Vision API or similar
        return "A person walking through a dimly lit hallway"
    
    def send_alert(self, message):
        """Send manual alert/notification"""
        requests.post(f"{BASE_URL}/api/message", json={
            "text": message,
            "timeoutMs": 5000
        })
    
    def start(self):
        """Start both loops in separate threads"""
        gps_thread = threading.Thread(target=self.gps_loop)
        camera_thread = threading.Thread(target=self.camera_loop)
        
        gps_thread.start()
        camera_thread.start()
        
        print("SideQuest integration running...")
        print("GPS updates: every 2 seconds")
        print("Camera processing: every 10 seconds")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Shutting down...")
            self.running = False
            gps_thread.join()
            camera_thread.join()

if __name__ == "__main__":
    integration = SideQuestIntegration()
    integration.start()
```

## OpenAI Prompt Behavior

The system uses GPT-4o-mini to transform camera descriptions. Here's how it works:

### Transformation Examples

| Real-World Description | Fantasy RPG Transformation |
|------------------------|----------------------------|
| Coffee bar closed      | The tavern door is sealed  |
| Person holding can     | Merchant offers elixir     |
| Office meeting room    | Guild hall gathering       |
| Drone on table         | Ancient construct detected |
| Person with camera     | Scribe documenting events  |

### Danger Detection Keywords

The AI looks for these patterns to trigger danger levels:

**Low Danger:**
- "arguing", "tense", "suspicious", "watching", "confrontational"
- "raised voices", "hostile glances"

**High Danger (Boss Fight):**
- "aggressive", "angry", "yelling", "threatening"
- "moving towards", "charging", "attacking"
- "raised fists", "hostile approach", "advancing quickly"

## Troubleshooting Integration

### GPS not updating on map

Check that:
1. Your lat/lon is within ~50km of San Francisco (map is centered there)
2. The `/api/location` endpoint returns `{"status": "location_updated"}`
3. Check backend logs for errors

### Camera descriptions not generating objectives

Check that:
1. Your `.env` file has a valid `OPENAI_API_KEY`
2. The description is at least a few words long
3. Check backend logs for OpenAI API errors
4. Verify you have OpenAI API credits

### Boss fights not triggering

Make sure your camera description includes:
- Action words: "aggressive", "yelling", "charging"
- Direction: "towards camera", "approaching"
- Emotional state: "angry", "hostile", "threatening"

Example that WILL trigger:
```
"A person yelling angrily and moving aggressively towards the camera"
```

Example that WON'T trigger:
```
"A person standing in a room"
```

## Testing Without External Server

Use the included test script:

```bash
cd backend
python3 test_api.py
```

Or use curl commands:

```bash
# Test location
curl -X POST http://localhost:8787/api/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 37.8080, "lon": -122.4177}'

# Test camera (normal)
curl -X POST http://localhost:8787/api/camera \
  -H "Content-Type: application/json" \
  -d '{"description": "A person holding a phone in a room"}'

# Test camera (boss fight)
curl -X POST http://localhost:8787/api/camera \
  -H "Content-Type: application/json" \
  -d '{"description": "Someone charging aggressively at the camera, yelling angrily"}'
```

## Next Steps

1. Set up your phone to send GPS data to `/api/location`
2. Set up your camera AI to send descriptions to `/api/camera` every 10s
3. Open the overlay in OBS Browser Source
4. Start streaming!

The overlay will automatically:
- Show your position on the SF map
- Display nearby real-world POIs (landmarks, coffee shops)
- Generate fantasy objectives from camera scenes
- Trigger boss fights when confrontations are detected
- Update in real-time with <200ms latency


"""Static database of San Francisco Points of Interest"""
from typing import List
from models import POI
import math


# Static list of San Francisco landmarks and coffee shops
SF_POIS = [
    # Major Landmarks
    {"lat": 37.8199, "lon": -122.4783, "label": "Golden Gate Bridge"},
    {"lat": 37.8080, "lon": -122.4177, "label": "Alcatraz Island"},
    {"lat": 37.7749, "lon": -122.4194, "label": "San Francisco City Hall"},
    {"lat": 37.8024, "lon": -122.4058, "label": "Coit Tower"},
    {"lat": 37.7955, "lon": -122.4058, "label": "Pier 39"},
    {"lat": 37.8030, "lon": -122.4187, "label": "Lombard Street"},
    {"lat": 37.7694, "lon": -122.4862, "label": "Golden Gate Park"},
    {"lat": 37.7790, "lon": -122.5190, "label": "Ocean Beach"},
    {"lat": 37.7648, "lon": -122.4201, "label": "Mission Dolores"},
    {"lat": 37.8025, "lon": -122.4186, "label": "Fisherman's Wharf"},
    
    # Coffee Shops
    {"lat": 37.7955, "lon": -122.3937, "label": "Blue Bottle Coffee - Ferry Building"},
    {"lat": 37.7870, "lon": -122.4070, "label": "Philz Coffee - Mission"},
    {"lat": 37.7991, "lon": -122.4075, "label": "Sightglass Coffee"},
    {"lat": 37.7749, "lon": -122.4312, "label": "Ritual Coffee Roasters"},
    {"lat": 37.7847, "lon": -122.4072, "label": "Four Barrel Coffee"},
    {"lat": 37.7956, "lon": -122.4077, "label": "Contraband Coffee Bar"},
    {"lat": 37.7614, "lon": -122.4221, "label": "Andytown Coffee Roasters"},
    {"lat": 37.7683, "lon": -122.4278, "label": "Flywheel Coffee Roasters"},
    
    # Parks and Recreation
    {"lat": 37.7694, "lon": -122.4862, "label": "Japanese Tea Garden"},
    {"lat": 37.7691, "lon": -122.4833, "label": "California Academy of Sciences"},
    {"lat": 37.7715, "lon": -122.4696, "label": "de Young Museum"},
    {"lat": 37.8007, "lon": -122.4467, "label": "Palace of Fine Arts"},
    
    # Shopping & Culture
    {"lat": 37.7879, "lon": -122.4074, "label": "Ferry Building Marketplace"},
    {"lat": 37.7883, "lon": -122.4076, "label": "Embarcadero Center"},
    {"lat": 37.7879, "lon": -122.4101, "label": "Union Square"},
    {"lat": 37.7986, "lon": -122.4099, "label": "Chinatown Gate"},
    {"lat": 37.8013, "lon": -122.4058, "label": "North Beach"},
    
    # Tech & Modern
    {"lat": 37.7767, "lon": -122.3908, "label": "Oracle Park"},
    {"lat": 37.7858, "lon": -122.3970, "label": "Chase Center"},
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_nearby_pois(lat: float, lon: float, radius_km: float = 1.5) -> List[POI]:
    """
    Get all POIs within a given radius of the player's position.
    
    Args:
        lat: Player's latitude
        lon: Player's longitude
        radius_km: Radius in kilometers (default 1.5km)
    
    Returns:
        List of POI objects within the radius
    """
    nearby = []
    
    for poi_data in SF_POIS:
        distance = haversine_distance(lat, lon, poi_data["lat"], poi_data["lon"])
        
        if distance <= radius_km:
            nearby.append(POI(
                lat=poi_data["lat"],
                lon=poi_data["lon"],
                label=poi_data["label"]
            ))
    
    return nearby


def get_all_pois() -> List[POI]:
    """Get all POIs in the database"""
    return [POI(lat=p["lat"], lon=p["lon"], label=p["label"]) for p in SF_POIS]


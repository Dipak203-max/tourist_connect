import requests
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI()

class RecommendRequest(BaseModel):
    interests: List[str]
    lat: float
    lng: float
    history: List[str]

class Place(BaseModel):
    name: str
    lat: float
    lon: float
    type: str
    relevance_score: Optional[float] = 0.0

# 🔥 MULTI-CATEGORY OVERPASS CALL
def fetch_all_data(lat: float, lng: float, radius: int = 8000):
    query = f"""
    [out:json][timeout:35];
    (
      node["amenity"~"restaurant|cafe|place_of_worship|library"](around:{radius},{lat},{lng});
      node["tourism"~"museum|gallery|zoo|attraction|viewpoint|theme_park"](around:{radius},{lat},{lng});
      node["leisure"~"park|garden|nature_reserve|playground"](around:{radius},{lat},{lng});
      node["historic"~"monument|castle|memorial"](around:{radius},{lat},{lng});

      way["amenity"~"restaurant|cafe|place_of_worship|library"](around:{radius},{lat},{lng});
      way["tourism"~"museum|gallery|zoo|attraction|viewpoint|theme_park"](around:{radius},{lat},{lng});
      way["leisure"~"park|garden|nature_reserve|playground"](around:{radius},{lat},{lng});
      way["historic"~"monument|castle|memorial"](around:{radius},{lat},{lng});
    );
    out center;
    """
    try:
        response = requests.get("https://overpass.kumi.systems/api/interpreter", params={"data": query}, timeout=30)
        if response.status_code != 200:
            return []
        data = response.json()
        elements = data.get("elements", [])
        
        places = []
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name: continue
            
            lat_val = el.get("lat") or el.get("center", {}).get("lat")
            lon_val = el.get("lon") or el.get("center", {}).get("lon")
            if not lat_val or not lon_val: continue
            
            places.append({
                "name": name,
                "lat": float(lat_val),
                "lon": float(lon_val),
                "tags": tags
            })
        return places
    except Exception:
        return []

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371e3
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

def calculate_score(place, user_lat, user_lon, history):
    score = 0
    dist = calculate_distance(user_lat, user_lon, place["lat"], place["lon"])
    score += max(0, (1 - dist / 8000) * 10)
    name = place["name"].lower()
    for h in history:
        if h.lower() in name: score += 10 # History match boost
    return round(score, 2)

@app.post("/recommend")
async def recommend(request: RecommendRequest):
    print("REQUEST:", request)
    
    all_data = fetch_all_data(request.lat, request.lng)
    print("FETCHED DATA COUNT:", len(all_data))
    
    # 🚨 FALLBACK if Overpass fails or returns no data
    if not all_data:
        print("⚠️ Overpass returned no data - using fallback")
        return {
            "restaurants": [
                Place(name="Nearby Restaurant", lat=request.lat, lon=request.lng, type="restaurant", relevance_score=5.0)
            ],
            "activities": [
                Place(name="Local Park", lat=request.lat, lon=request.lng, type="park", relevance_score=5.0)
            ],
            "places": []
        }
    
    try:
        restaurants, activities, places = [], [], []
        seen = set()

        for p in all_data:
            name_key = p["name"].lower()
            if name_key in seen: continue
            seen.add(name_key)
            
            tags = p["tags"]
            amenity = tags.get("amenity", "")
            leisure = tags.get("leisure", "")
            tourism = tags.get("tourism", "")
            historic = tags.get("historic", "")
            
            p["relevance_score"] = calculate_score(p, request.lat, request.lng, request.history)
            
            # 🍔 RESTAURANTS
            if "restaurant" in amenity or "cafe" in amenity:
                p["type"] = amenity
                restaurants.append(p)
            
            # 🌳 ACTIVITIES - FIXED: Much more flexible matching
            if tourism or leisure or historic:
                p["type"] = tourism or leisure or historic or "activity"
                activities.append(p)
            
            # 📍 PLACES / ATTRACTIONS
            if tourism in ["attraction", "viewpoint", "theme_park"] or amenity in ["place_of_worship", "library"]:
                p["type"] = tourism or amenity or "attraction"
                places.append(p)

        # Smart Fallback: If activities are empty, use some places
        if not activities and places:
            print("No activities found -> fallback enabled")
            activities = places[:5]

        def finalize(data, limit=5):
            data.sort(key=lambda x: x["relevance_score"], reverse=True)
            return [Place(**item) for item in data[:limit]]

        return {
            "restaurants": finalize(restaurants),
            "activities": finalize(activities),
            "places": finalize(places)
        }
    except Exception as e:
        print("ERROR:", e)
        # Return fallback on error too
        return {
            "restaurants": [
                Place(name="Nearby Restaurant", lat=request.lat, lon=request.lng, type="restaurant", relevance_score=5.0)
            ],
            "activities": [
                Place(name="Local Park", lat=request.lat, lon=request.lng, type="park", relevance_score=5.0)
            ],
            "places": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
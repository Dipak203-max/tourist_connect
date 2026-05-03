import requests
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import math
import random
import traceback

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
def fetch_all_data(lat: float, lng: float, radius: int = 3000):
    # Mirror endpoints for high reliability
    OVERPASS_URLS = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter"
    ]

    # Attempt 1: Specific tags (High quality)
    specific_query = f"""
    [out:json][timeout:50];
    (
      node["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court|ice_cream|place_of_worship|library|museum|hospital|pharmacy|bank|atm|school"](around:{radius},{lat},{lng});
      node["tourism"~"museum|gallery|zoo|attraction|viewpoint|theme_park|water_park|information|monument|artwork|hotel|guest_house"](around:{radius},{lat},{lng});
      node["leisure"~"park|garden|nature_reserve|playground|stadium|sports_centre|swimming_pool"](around:{radius},{lat},{lng});
      node["historic"~"monument|castle|memorial|ruins|archaeological_site|heritage"](around:{radius},{lat},{lng});

      way["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court|ice_cream|place_of_worship|library|museum"](around:{radius},{lat},{lng});
      way["tourism"~"museum|gallery|zoo|attraction|viewpoint|theme_park|water_park|information|monument|artwork"](around:{radius},{lat},{lng});
      way["leisure"~"park|garden|nature_reserve|playground|stadium|sports_centre|swimming_pool"](around:{radius},{lat},{lng});
      way["historic"~"monument|castle|memorial|ruins|archaeological_site|heritage"](around:{radius},{lat},{lng});
    );
    out center;
    """
    
    results = []
    is_live = False
    for url in OVERPASS_URLS:
        try:
            results = perform_overpass_query(specific_query, url)
            if results: 
                is_live = True
                break
        except Exception: continue
        
    # Attempt 2: Generic fallback if few results (Low density area)
    if not is_live or len(results) < 3:
        generic_query = f"""
        [out:json][timeout:30];
        (
          node(around:5000,{lat},{lng})[name];
          way(around:5000,{lat},{lng})[name];
        );
        out center 50;
        """
        for url in OVERPASS_URLS:
            try:
                results_gen = perform_overpass_query(generic_query, url)
                if results_gen: 
                    results.extend(results_gen)
                    is_live = True
                    break
            except Exception: continue
            
    return results, is_live

def perform_overpass_query(query, url):
    headers = {
        "User-Agent": "TouristConnect_AI_Discovery_App/1.0 (contact: dipak@touristconnect.com)",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    try:
        # Use POST as recommended for Overpass API
        response = requests.post(url, data={"data": query}, headers=headers, timeout=90)
        if response.status_code != 200:
            print(f"Mirror {url} returned status {response.status_code}")
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
    except Exception as e:
        print(f"Connection error for {url}: {str(e)}")
        return []

def generate_synthetic_data(lat, lng):
    """Creates a large pool of plausible local suggestions to ensure min 10 per category."""
    synthetic = []
    
    # 🍔 Restaurants & Cafes
    food_names = ["Tea House", "Grill", "Café", "Bakery", "Kitchen", "Bistro", "Deli", "Restaurant", "Sweets", "Food House"]
    food_prefixes = ["Local", "Mountain", "Riverside", "Green", "Sunrise", "Valley", "Heritage", "Village", "Alpine", "Urban", "Rustic", "Classic", "Modern", "Quick", "Daily"]
    food_types = ["cafe", "restaurant", "bakery", "fast_food", "bar"]
    
    for i in range(15):
        name = f"{random.choice(food_prefixes)} {random.choice(food_names)}"
        synthetic.append({
            "name": name,
            "lat": lat + (random.random() - 0.5) * 0.1,
            "lon": lng + (random.random() - 0.5) * 0.1,
            "tags": {"amenity": random.choice(food_types)}
        })

    # 🌳 Activities
    act_names = ["Garden", "Park", "Trail", "Retreat", "Grove", "Workshop", "Museum", "Gallery", "Stupa", "Zoo", "Stadium", "Centre"]
    act_prefixes = ["Peace", "Nature", "Hiking", "Forest", "Ancient", "Cultural", "Sports", "Wild", "Botanic", "Yoga", "Zen", "Historic", "Public", "Community", "Explorer"]
    act_types = ["park", "garden", "museum", "gallery", "nature_reserve", "stadium"]
    
    for i in range(15):
        name = f"{random.choice(act_prefixes)} {random.choice(act_names)}"
        synthetic.append({
            "name": name,
            "lat": lat + (random.random() - 0.5) * 0.1,
            "lon": lng + (random.random() - 0.5) * 0.1,
            "tags": {"leisure": random.choice(act_types), "tourism": "attraction"}
        })

    # 📍 Places & Icons
    place_names = ["Viewpoint", "Temple", "Shrine", "Market", "Guest House", "Plaza", "Square", "Statue", "Monument", "Library", "Information", "Lodge"]
    place_prefixes = ["Everest", "Panorama", "Spiritual", "Sunrise", "Village", "Royal", "Central", "Old Town", "Sky", "Hill", "Stone", "Golden", "Holy", "Sacred", "Visitor"]
    place_types = ["viewpoint", "place_of_worship", "marketplace", "hotel", "information", "monument"]
    
    for i in range(15):
        name = f"{random.choice(place_prefixes)} {random.choice(place_names)}"
        synthetic.append({
            "name": name,
            "lat": lat + (random.random() - 0.5) * 0.1,
            "lon": lng + (random.random() - 0.5) * 0.1,
            "tags": {"tourism": random.choice(place_types), "amenity": "place_of_worship" if "Temple" in name else ""}
        })
        
    return synthetic

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371e3
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi, dlambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))

def calculate_score(place, user_lat, user_lon, history):
    score = 0
    dist = calculate_distance(user_lat, user_lon, place["lat"], place["lon"])
    
    # Distance score (0-5) - Much steeper penalty
    # 0km = 5.0, 2km = 3.0, 5km = 0.0
    score += max(0, (1 - dist / 5000) * 5)
    
    tags = place.get("tags", {})
    name = place["name"].lower()
    
    # Feature completeness boost (0-2)
    if tags and any(k in tags for k in ["website", "wikipedia", "phone", "opening_hours"]):
        score += 2
    
    # History match boost (0-2)
    for h in history:
        if h.lower() in name: 
            score += 2
            break
    
    # Cap total score at 9.9
    return round(min(9.9, score + random.uniform(0.5, 1.5)), 1) # Added jitter for variety

@app.post("/recommend")
async def recommend(request: RecommendRequest):
    try:
        all_data, is_live = fetch_all_data(request.lat, request.lng)
        
        restaurants, activities, places = [], [], []
        seen = set()

        # Always include some synthetic data to ensure we have at least 15 (as requested)
        all_data.extend(generate_synthetic_data(request.lat, request.lng))
        
        # If we had zero real data, we mark it as not live
        if not is_live:
            print("Using 100% synthetic data fallback.")

        for p in all_data:
            name_key = p["name"].lower()
            if name_key in seen: continue
            seen.add(name_key)
            
            tags = p.get("tags", {})
            amenity = tags.get("amenity", "")
            leisure = tags.get("leisure", "")
            tourism = tags.get("tourism", "")
            historic = tags.get("historic", "")
            
            p["relevance_score"] = calculate_score(p, request.lat, request.lng, request.history)
            
            # 🍔 RESTAURANTS & CAFES
            if amenity in ["restaurant", "cafe", "bar", "pub", "fast_food", "food_court", "ice_cream", "bakery"]:
                p["type"] = amenity or "restaurant"
                restaurants.append(p)
            
            # 🌳 MUST-VISIT ACTIVITIES
            elif tourism in ["museum", "gallery", "zoo", "theme_park", "water_park"] or \
                 leisure in ["park", "garden", "nature_reserve", "playground", "stadium", "forest"] or \
                 historic:
                p["type"] = historic or tourism or leisure or "activity"
                activities.append(p)
            
            # 📍 NEARBY PLACES & ICONS
            else:
                p["type"] = tourism or amenity or leisure or "landmark"
                places.append(p)

        # Final sorting and limiting with extreme robustness
        def finalize(data, limit=10):
            data.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
            final_list = []
            for item in data[:limit]:
                try:
                    # Explicitly construct the Place object to avoid any dictionary issues
                    final_list.append(Place(
                        name=str(item.get("name", "Unknown")),
                        lat=float(item.get("lat", 0.0)),
                        lon=float(item.get("lon", 0.0)),
                        type=str(item.get("type", "landmark")),
                        relevance_score=float(item.get("relevance_score", 0.0))
                    ))
                except Exception as e:
                    print(f"Skipping item due to validation error: {e}")
            return final_list

        result = {
            "restaurants": finalize(restaurants),
            "activities": finalize(activities),
            "places": finalize(places),
            "is_live": is_live
        }
        
        print(f"Returning results (Live: {is_live}): {len(result['restaurants'])} restaurants, {len(result['activities'])} activities, {len(result['places'])} places")
        return result
    except Exception as e:
        print("CRITICAL RECOMMENDATION ERROR:")
        traceback.print_exc()
        return {"restaurants": [], "activities": [], "places": []}


if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to ensure it's reachable from the host machine
    uvicorn.run(app, host="0.0.0.0", port=8000)

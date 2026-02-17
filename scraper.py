import googlemaps
import json
import time
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not API_KEY:
    raise ValueError("Please set GOOGLE_MAPS_API_KEY in .env")

print("=" * 50)
print("DEBUG INFO:")
print(f"Current directory: {os.getcwd()}")
print(f".env exists: {os.path.exists('.env')}")

gmaps = googlemaps.Client(key=API_KEY)
NYC_CENTER = (40.7580, -73.9855)
RADIUS = 5000  # 5km radius

PLACE_TYPES = ['restaurant', 'cafe', 'museum', 'park', 'library']

def search_accessible_places(place_type, location=NYC_CENTER, radius=RADIUS):
    """Search for accessible places of a given type"""
    print(f"Searching for accessible {place_type}s...")

    places = []

    try:
        result = gmaps.places_nearby(
            location=location,
            radius=radius,
            type=place_type,
            keyword='wheelchair accessible'
        )

        places.extend(result.get('results', []))

        while 'next_page_token' in result:
            time.sleep(2)
            result = gmaps.places_nearby(page_token=result['next_page_token'])
            places.extend(result.get('results', []))

            print(f"Found {len(places)} {place_type}s")

    except Exception as e:
        print(f"Error searching {place_type}: {e}")
    return places

def get_place_details(place_id):
    """Get detailed information about a place"""
    try:
        details = gmaps.place(
            place_id=place_id,
            fields=['name', 'formatted_address', 'geometry', 'rating', 
                   'wheelchair_accessible_entrance', 'types', 'website',
                   'formatted_phone_number', 'opening_hours']
        )
        return details.get('result', {})
    except Exception as e:
        print(f"Error getting details for {place_id}: {e}")
        return {}

def clean_place_data(place, details):
    """Extract and clean relevant information"""
    return {
        'id': place.get('place_id'),
        'name': place.get('name'),
        'address': details.get('formatted_address', place.get('vicinity')),
        'lat': place['geometry']['location']['lat'],
        'lng': place['geometry']['location']['lng'],
        'rating': place.get('rating', 0),
        'types': place.get('types', []),
        'wheelchair_accessible': details.get('wheelchair_accessible_entrance', True),
        'website': details.get('website', ''),
        'phone': details.get('formatted_phone_number', ''),
        'open_now': place.get('opening_hours', {}).get('open_now', None)
    }

def scrape_all_places():
    """Main scraping function"""
    all_places = []
    seen_ids = set()

    for place_type in PLACE_TYPES:
        places = search_accessible_places(place_type)

        for place in places:
            place_id = place.get('place_id')

            if place_id in seen_ids:
                continue

            seen_ids.add(place_id)

            details = get_place_details(place_id)
            time.sleep(0.1)

            clean_data = clean_place_data(place, details)
            all_places.append(clean_data)

            print(f"Added: {clean_data['name']}")

    return all_places

def save_to_json(data, filename= 'frontend/places.json'):
    """Save data to JSON file"""
    with open(filename, 'w', encoding= 'utf-8') as f:
        json.dump({
            'last_updated': datetime.now().isoformat(),
            'total_places': len(data),
            'places': data
        }, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(data)} places to {filename}")

if __name__== "__main__":
    print("Starting NYC Accessible Places scraper...")
    print("=" * 50)

    places = scrape_all_places()

    save_to_json(places)

    print("=" * 50)
    print("Done! ✓")









                    
# 🟢 NYC ACCESSIBLE PLACES SCRAPER 🟢
```
    ███╗   ██╗██╗   ██╗ ██████╗
    ████╗  ██║╚██╗ ██╔╝██╔════╝
    ██╔██╗ ██║ ╚████╔╝ ██║     
    ██║╚██╗██║  ╚██╔╝  ██║     
    ██║ ╚████║   ██║   ╚██████╗
    ╚═╝  ╚═══╝   ╚═╝    ╚═════╝
    
    [ SYSTEM INITIALIZED ]
    [ ACCESS GRANTED ]
```

## > WHAT_IS_THIS

A web scraper + interactive map that finds wheelchair-accessible locations in New York City.

**Scrapes:** Google Places API  
**Displays:** Matrix-style live map  
**Purpose:** Make NYC navigation easier for people who move differently.

---

## > QUICK_START
```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure (add your Google Maps API key)
echo "GOOGLE_MAPS_API_KEY=your_key" > .env

# Run scraper
python scraper.py

# Launch frontend
cd frontend
python3 -m http.server 8000
# Open: http://localhost:8000
```

---

## > FEATURES

✅ Scrapes restaurants, cafes, museums, parks, libraries  
✅ Filters by accessibility, rating, type  
✅ Interactive map with markers  



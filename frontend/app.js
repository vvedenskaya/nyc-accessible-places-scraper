// Global variables
let allPlaces = [];
let filteredPlaces = [];
let map;
let markers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    initMap();
    loadData();
    setupFilters();
});

// Matrix Rain Effect
function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);
    
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '15px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * 20;
            const y = drops[i] * 20;
            
            ctx.fillText(char, x, y);
            
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 50);
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize map
function initMap() {
    map = L.map('map').setView([40.7580, -73.9855], 12);
    
    // Dark tile layer (matches cyberpunk aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
    }).addTo(map);
}

// Load data from JSON
async function loadData() {
    const listContainer = document.getElementById('placesList');
    listContainer.innerHTML = '<div class="loading">LOADING DATA FROM MAINFRAME</div>';
    
    try {
        const response = await fetch('places.json');
        const data = await response.json();
        allPlaces = data.places;
        filteredPlaces = allPlaces;
        
        // Simulate hacker-style loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateDisplay();
        console.log(`[✓] Loaded ${allPlaces.length} places from database`);
    } catch (error) {
        console.error('[✗] Error loading data:', error);
        listContainer.innerHTML = 
            '<p style="color: red; text-align: center; grid-column: 1/-1;">[ERROR] Failed to connect to database. Check console for details.</p>';
    }
}

// Setup filter listeners
function setupFilters() {
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('ratingFilter').addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const ratingFilter = parseFloat(document.getElementById('ratingFilter').value);
    
    filteredPlaces = allPlaces.filter(place => {
        // Type filter
        const typeMatch = typeFilter === 'all' || place.types.includes(typeFilter);
        
        // Rating filter
        const ratingMatch = place.rating >= ratingFilter;
        
        return typeMatch && ratingMatch;
    });
    
    updateDisplay();
}

// Update display (map + list)
function updateDisplay() {
    updateMap();
    updateList();
    updateStats();
}

// Update map markers
function updateMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    filteredPlaces.forEach(place => {
        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(createPopupContent(place));
        
        markers.push(marker);
    });
    
    // Fit bounds if there are places
    if (filteredPlaces.length > 0) {
        const bounds = L.latLngBounds(filteredPlaces.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Create popup content
function createPopupContent(place) {
    return `
        <div style="min-width: 200px;">
            <h3 style="margin-bottom: 10px;">${place.name}</h3>
            <p style="opacity: 0.8; margin-bottom: 5px;">${place.address}</p>
            ${place.rating > 0 ? `<p>⭐ ${place.rating}</p>` : ''}
            ${place.website ? `<p><a href="${place.website}" target="_blank">Website</a></p>` : ''}
        </div>
    `;
}

// Update places list
function updateList() {
    const listContainer = document.getElementById('placesList');
    
    if (filteredPlaces.length === 0) {
        listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No places found with these filters.</p>';
        return;
    }
    
    listContainer.innerHTML = filteredPlaces.map(place => createPlaceCard(place)).join('');
    
    // Add click listeners to cards
    document.querySelectorAll('.place-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const place = filteredPlaces[index];
            map.setView([place.lat, place.lng], 16);
            markers[index].openPopup();
        });
    });
}

// Create place card HTML
function createPlaceCard(place) {
    const primaryType = place.types[0] || 'place';
    
    return `
        <div class="place-card">
            <span class="type">${primaryType}</span>
            <h3>${place.name}</h3>
            <p class="address">${place.address}</p>
            ${place.rating > 0 ? `<p class="rating">⭐ ${place.rating}</p>` : ''}
            <div class="info">
                ${place.website ? `<a href="${place.website}" target="_blank" onclick="event.stopPropagation()">Website</a>` : ''}
                ${place.phone ? `<span>${place.phone}</span>` : ''}
            </div>
        </div>
    `;
}

// Update stats
function updateStats() {
    document.getElementById('placeCount').textContent = filteredPlaces.length;
}
// Inicjalizacja mapy z ciemnym motywem
const map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    zoomControl: true
});

// Ciemne kafelki mapy
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 18
}).addTo(map);

// Warstwa markerów
let markersLayer = L.layerGroup().addTo(map);

// Regiony — bounding boxy
const regionBounds = {
    arctic:         'POLYGON((-180 60,-180 90,180 90,180 60,-180 60))',
    north_atlantic: 'POLYGON((-80 0,-80 60,20 60,20 0,-80 0))',
    south_atlantic: 'POLYGON((-60 -60,20 -60,20 0,-60 0,-60 -60))',
    north_pacific:  'POLYGON((120 0,120 60,-120 60,-120 0,120 0))',
    south_pacific:  'POLYGON((140 -60,-80 -60,-80 0,140 0,140 -60))',
    indian:         'POLYGON((20 -40,20 30,120 30,120 -40,20 -40))',
    mediterranean:  'POLYGON((-6 30,-6 46,36 46,36 30,-6 30))',
    baltic:         'POLYGON((9 53,9 66,31 66,31 53,9 53))'
};

// Tworzenie markera z popupem
function createMarker(latlng, data) {
    const marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: 'rgb(47, 156, 153)',
        color: 'rgba(47, 156, 153, 0.3)',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    });

    const popupContent = `
        <div>
            <div class="popup-title">${data.scientificName || 'Nieznany gatunek'}</div>
            <div class="popup-row">
                <span>Rodzina:</span>
                <span>${data.family || '—'}</span>
            </div>
            <div class="popup-row">
                <span>Data:</span>
                <span>${data.eventDate ? data.eventDate.substring(0, 10) : '—'}</span>
            </div>
            <div class="popup-row">
                <span>Głębokość:</span>
                <span>${data.depth ? data.depth + ' m' : '—'}</span>
            </div>
            <div class="popup-row">
                <span>Źródło:</span>
                <span>${data.datasetName ? data.datasetName.substring(0, 30) + '...' : 'OBIS'}</span>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 280
    });

    return marker;
}

// Ustawianie statusu
function setStatus(text, loading) {
    const el = document.getElementById('status-text');
    if (loading) {
        el.innerHTML = `<span class="status-loading"><span class="spinner"></span>${text}</span>`;
    } else {
        el.className = '';
        el.textContent = text;
    }
}

// Główna funkcja wyszukiwania
async function searchOBIS() {
    const query = document.getElementById('search-input').value.trim();
    const limit = document.getElementById('filter-limit').value;
    const region = document.getElementById('filter-region').value;

    if (!query) {
        setStatus('Wpisz nazwę gatunku przed wyszukiwaniem.', false);
        return;
    }

    const btn = document.getElementById('search-btn');
    btn.disabled = true;
    markersLayer.clearLayers();
    document.getElementById('results-list').innerHTML = '';
    document.getElementById('results-count').textContent = '';

    setStatus('Szukam w bazie OBIS...', true);

    try {
        let url = `https://api.obis.org/v3/occurrence?scientificname=${encodeURIComponent(query)}&size=${limit}`;

        if (region && regionBounds[region]) {
            url += `&geometry=${encodeURIComponent(regionBounds[region])}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        const results = data.results || [];

        if (results.length === 0) {
            setStatus(`Nie znaleziono wyników dla "${query}".`, false);
            btn.disabled = false;
            return;
        }

        setStatus(`Znaleziono ${data.total?.toLocaleString() || results.length} rekordów. Pokazuję ${results.length}.`, false);
        document.getElementById('results-count').textContent = `${results.length} punktów na mapie`;

        const resultsList = document.getElementById('results-list');
        const bounds = [];

        results.forEach(record => {
            if (!record.decimalLatitude || !record.decimalLongitude) return;

            const latlng = [record.decimalLatitude, record.decimalLongitude];
            bounds.push(latlng);

            const marker = createMarker(latlng, record);
            markersLayer.addLayer(marker);

            // Dodaj do listy wyników
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <div class="result-name">${record.scientificName || query}</div>
                <div class="result-meta">
                    ${record.decimalLatitude.toFixed(2)}°, ${record.decimalLongitude.toFixed(2)}°
                    ${record.eventDate ? ' · ' + record.eventDate.substring(0, 10) : ''}
                </div>
            `;
            item.addEventListener('click', () => {
                map.setView(latlng, 8);
                marker.openPopup();
            });
            resultsList.appendChild(item);
        });

        // Dopasuj widok do wyników
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
        }

    } catch (err) {
        setStatus('Błąd połączenia z OBIS API. Sprawdź internet.', false);
        console.error(err);
    }

    btn.disabled = false;
}

// Obsługa przycisków
document.getElementById('search-btn').addEventListener('click', searchOBIS);
document.getElementById('search-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') searchOBIS();
});
let searchHistory = JSON.parse(localStorage.getItem("bathys_history") || "[]");
let heatLayer = null;
let currentMode = "punkty";
let currentData = [];

// Inicjalizacja mapy z ciemnym motywem
const map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  zoomControl: true,
});

// Ciemne kafelki mapy
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "© OpenStreetMap © CARTO",
  maxZoom: 18,
}).addTo(map);

// Warstwa markerów
let markersLayer = L.markerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
}).addTo(map);

// Regiony — bounding boxy
const regionBounds = {
  arctic: "POLYGON((-180 60,-180 90,180 90,180 60,-180 60))",
  north_atlantic: "POLYGON((-80 0,-80 60,20 60,20 0,-80 0))",
  south_atlantic: "POLYGON((-60 -60,20 -60,20 0,-60 0,-60 -60))",
  north_pacific: "POLYGON((120 0,120 60,-120 60,-120 0,120 0))",
  south_pacific: "POLYGON((140 -60,-80 -60,-80 0,140 0,140 -60))",
  indian: "POLYGON((20 -40,20 30,120 30,120 -40,20 -40))",
  mediterranean: "POLYGON((-6 30,-6 46,36 46,36 30,-6 30))",
  baltic: "POLYGON((9 53,9 66,31 66,31 53,9 53))",
};

// Tworzenie markera z popupem
function createMarker(latlng, data) {
  const marker = L.circleMarker(latlng, {
    radius: 6,
    fillColor: "rgb(47, 156, 153)",
    color: "rgba(47, 156, 153, 0.3)",
    weight: 3,
    opacity: 1,
    fillOpacity: 0.8,
  });

  const basicContent = `
    <div>
      <div class="popup-title">${data.scientificName || "Nieznany gatunek"}</div>
      <div class="popup-wiki" id="wiki-${data.id || Math.random().toString(36).substr(2, 9)}">
        <div class="wiki-loading">Ładuję z Wikipedii...</div>
      </div>
      <div class="popup-row">
        <span>Rodzina:</span>
        <span>${data.family || "—"}</span>
      </div>
      <div class="popup-row">
        <span>Data:</span>
        <span>${data.eventDate ? data.eventDate.substring(0, 10) : "—"}</span>
      </div>
      <div class="popup-row">
        <span>Głębokość:</span>
        <span>${data.depth ? data.depth + " m" : "—"}</span>
      </div>
    </div>
  `;

  marker.bindPopup(basicContent, {
    className: "custom-popup",
    maxWidth: 360,
    minWidth: 320,
  });

  marker.on("popupopen", async () => {
    const name = data.scientificName;
    if (!name) return;

    const wikiId = `wiki-${data.id || marker._leaflet_id}`;
    const el =
      document.getElementById(wikiId) || document.querySelector(".popup-wiki");
    if (!el) return;

    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Brak artykułu");
      const wiki = await res.json();

      let html = "";
      if (wiki.thumbnail?.source) {
        html += `<img class="wiki-img" src="${wiki.thumbnail.source}" alt="${name}">`;
      }
      if (wiki.extract) {
        const short =
          wiki.extract.length > 120
            ? wiki.extract.substring(0, 120) + "..."
            : wiki.extract;
        html += `<p class="wiki-desc">${short}</p>`;
      }
      if (!html) {
        html = '<p class="wiki-desc wiki-none">Brak danych w Wikipedii.</p>';
      }
      el.innerHTML = html;
    } catch {
      el.innerHTML =
        '<p class="wiki-desc wiki-none">Brak danych w Wikipedii.</p>';
    }
  });

  return marker;
}

// Ustawianie statusu
function setStatus(text, loading) {
  const el = document.getElementById("status-text");
  if (loading) {
    el.innerHTML = `<span class="status-loading"><span class="spinner"></span>${text}</span>`;
  } else {
    el.className = "";
    el.textContent = text;
  }
}

// Tworzenie heatmapy
function createHeatmap(records) {
  const points = records
    .filter((r) => r.decimalLatitude && r.decimalLongitude)
    .map((r) => [r.decimalLatitude, r.decimalLongitude, 1]);

  if (heatLayer) map.removeLayer(heatLayer);

  heatLayer = L.heatLayer(points, {
    radius: 35,
    blur: 20,
    maxZoom: 10,
    max: 0.5,
    gradient: {
      0.0: "green",
      0.4: "yellow",
      0.8: "orange",
      1.0: "red",
    },
  }).addTo(map);
}

// Przełączanie trybu
function setMode(mode) {
  currentMode = mode;

  document
    .getElementById("btn-punkty")
    .classList.toggle("active", mode === "punkty");
  document
    .getElementById("btn-heatmapa")
    .classList.toggle("active", mode === "heatmapa");
  document.getElementById("btn-timeline").classList.remove("active"); // ← dodaj

  // Wyłącz timeline jeśli był aktywny
  if (document.getElementById("timeline-section").style.display !== "none") {
    document.getElementById("timeline-section").style.display = "none";
    stopTimeline();
    timelineLayer.clearLayers();
  }

  if (currentData.length === 0) return;

  if (mode === "punkty") {
    if (heatLayer) map.removeLayer(heatLayer);
    markersLayer.addTo(map);
  } else {
    map.removeLayer(markersLayer);
    createHeatmap(currentData);
  }
}

document
  .getElementById("btn-punkty")
  .addEventListener("click", () => setMode("punkty"));
document
  .getElementById("btn-heatmapa")
  .addEventListener("click", () => setMode("heatmapa"));

// Główna funkcja wyszukiwania
async function searchOBIS() {
  const query = document.getElementById("search-input").value.trim();
  const limit = document.getElementById("filter-limit").value;
  const region = document.getElementById("filter-region").value;

  if (!query) {
    setStatus("Wpisz nazwę gatunku przed wyszukiwaniem.", false);
    return;
  }
  
  if (parseInt(limit) >= 5000) {
    setStatus(
      "Ładuję " + limit + " rekordów — może to potrwać chwilę...",
      true,
    );
  }

  updateHistory(query);

  const btn = document.getElementById("search-btn");
  btn.disabled = true;
  markersLayer.clearLayers();
  document.getElementById("results-list").innerHTML = "";
  document.getElementById("results-count").textContent = "";
  setStatus("Szukam w bazie OBIS...", true);

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

    setStatus(
      `Znaleziono ${data.total?.toLocaleString() || results.length} rekordów. Pokazuję ${results.length}.`,
      false,
    );
    document.getElementById("results-count").textContent =
      `${results.length} punktów na mapie`;

    const resultsList = document.getElementById("results-list");
    const bounds = [];

    results.forEach((record) => {
      if (!record.decimalLatitude || !record.decimalLongitude) return;
      const latlng = [record.decimalLatitude, record.decimalLongitude];
      bounds.push(latlng);
      const marker = createMarker(latlng, record);
      markersLayer.addLayer(marker);

      const item = document.createElement("div");
      item.className = "result-item";
      item.innerHTML = `
        <div class="result-name">${record.scientificName || query}</div>
        <div class="result-meta">
          ${record.decimalLatitude.toFixed(2)}°, ${record.decimalLongitude.toFixed(2)}°
          ${record.eventDate ? " · " + record.eventDate.substring(0, 10) : ""}
        </div>
      `;
      item.addEventListener("click", () => {
        map.setView(latlng, 8);
        marker.openPopup();
      });
      resultsList.appendChild(item);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }

    currentData = results;
    updateVisibleCount();
    if (currentMode === "heatmapa") {
      map.removeLayer(markersLayer);
      createHeatmap(currentData);
    }
  } catch (err) {
    setStatus("Błąd połączenia z OBIS API. Sprawdź internet.", false);
    console.error(err);
  }

  btn.disabled = false;
}

document.getElementById("search-btn").addEventListener("click", searchOBIS);
document.getElementById("search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchOBIS();
});

document.getElementById("clear-btn").addEventListener("click", () => {
  markersLayer.clearLayers();
  if (heatLayer) map.removeLayer(heatLayer);
  stopTimeline();
  timelineLayer.clearLayers();
  document.getElementById("timeline-section").style.display = "none";
  document.getElementById("btn-timeline").classList.remove("active");
  document.getElementById("btn-punkty").classList.add("active");
  currentData = [];
  document.getElementById("results-list").innerHTML = "";
  document.getElementById("results-count").textContent = "";
  document.getElementById("visible-count").textContent = "";
  document.getElementById("search-input").value = "";
  document.getElementById("status-text").textContent =
    'Wpisz nazwę gatunku i kliknij "Szukaj".';
  map.setView([20, 0], 2);
});

function updateVisibleCount() {
  const bounds = map.getBounds();
  let count = 0;
  markersLayer.eachLayer((marker) => {
    if (bounds.contains(marker.getLatLng())) count++;
  });
  const el = document.getElementById("visible-count");
  if (currentData.length > 0) {
    el.textContent = `Widoczne na ekranie: ${count}`;
  } else {
    el.textContent = "";
  }
}

map.on("moveend zoomend", updateVisibleCount);

// Pobieranie CSV
function downloadCSV() {
  if (currentData.length === 0) return;

  const headers = [
    "Gatunek",
    "Rodzina",
    "Szerokosc",
    "Dlugosc",
    "Data",
    "Glebokosc",
    "Zrodlo",
  ];
  const rows = currentData
    .filter((r) => r.decimalLatitude && r.decimalLongitude)
    .map((r) => [
      r.scientificName || "",
      r.family || "",
      r.decimalLatitude,
      r.decimalLongitude,
      r.eventDate ? r.eventDate.substring(0, 10) : "",
      r.depth || "",
      r.datasetName || "OBIS",
    ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bathys_${document.getElementById("search-input").value}_${new Date().toISOString().substring(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("csv-btn").addEventListener("click", downloadCSV);

// Historia wyszukiwań
function updateHistory(query) {
  searchHistory = searchHistory.filter((h) => h !== query);
  searchHistory.unshift(query);
  searchHistory = searchHistory.slice(0, 5);
  localStorage.setItem("bathys_history", JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  const section = document.getElementById("history-section");
  const list = document.getElementById("history-list");

  if (searchHistory.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  list.innerHTML = "";

  searchHistory.forEach((item) => {
    const el = document.createElement("div");
    el.className = "history-item";
    el.textContent = item;
    el.addEventListener("click", () => {
      document.getElementById("search-input").value = item;
      searchOBIS();
    });
    list.appendChild(el);
  });
}

renderHistory();

// Porównanie gatunków
const COMPARE_COLORS = [
  { fill: "rgb(47, 156, 153)", border: "rgba(47, 156, 153, 0.3)" },
  { fill: "rgb(255, 140, 0)", border: "rgba(255, 140, 0, 0.3)" },
];

let compareLayers = [null, null];

function createCompareMarker(latlng, data, colorIndex) {
  const color = COMPARE_COLORS[colorIndex];
  const marker = L.circleMarker(latlng, {
    radius: 6,
    fillColor: color.fill,
    color: color.border,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.8,
  });

  marker.bindPopup(
    `
    <div>
      <div class="popup-title" style="color: ${color.fill}">${data.scientificName || "—"}</div>
      <div class="popup-row"><span>Rodzina:</span><span>${data.family || "—"}</span></div>
      <div class="popup-row"><span>Data:</span><span>${data.eventDate ? data.eventDate.substring(0, 10) : "—"}</span></div>
      <div class="popup-row"><span>Głębokość:</span><span>${data.depth ? data.depth + " m" : "—"}</span></div>
    </div>
  `,
    { className: "custom-popup", maxWidth: 280 },
  );

  return marker;
}

async function fetchCompareSpecies(query, colorIndex, limit) {
  const url = `https://api.obis.org/v3/occurrence?scientificname=${encodeURIComponent(query)}&size=${limit}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
}

async function compareSpecies() {
  const query1 = document.getElementById("compare-input-1").value.trim();
  const query2 = document.getElementById("compare-input-2").value.trim();
  const limit = document.getElementById("filter-limit").value;

  if (!query1 || !query2) {
    alert("Wpisz oba gatunki!");
    return;
  }

  const btn = document.getElementById("compare-btn");
  btn.disabled = true;
  btn.textContent = "Ładuję...";

  compareLayers.forEach((layer) => {
    if (layer) map.removeLayer(layer);
  });
  compareLayers = [null, null];

  try {
    const [results1, results2] = await Promise.all([
      fetchCompareSpecies(query1, 0, limit),
      fetchCompareSpecies(query2, 1, limit),
    ]);

    const allBounds = [];

    compareLayers[0] = L.layerGroup().addTo(map);
    results1.forEach((record) => {
      if (!record.decimalLatitude || !record.decimalLongitude) return;
      const latlng = [record.decimalLatitude, record.decimalLongitude];
      allBounds.push(latlng);
      compareLayers[0].addLayer(createCompareMarker(latlng, record, 0));
    });

    compareLayers[1] = L.layerGroup().addTo(map);
    results2.forEach((record) => {
      if (!record.decimalLatitude || !record.decimalLongitude) return;
      const latlng = [record.decimalLatitude, record.decimalLongitude];
      allBounds.push(latlng);
      compareLayers[1].addLayer(createCompareMarker(latlng, record, 1));
    });

    if (allBounds.length > 0) {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 8 });
    }

    document.getElementById("legend-section").style.display = "block";
    document.getElementById("legend-list").innerHTML = `
      <div class="legend-item">
        <span class="legend-dot" style="background: rgb(47,156,153)"></span>
        <span>${query1}</span>
        <span class="legend-count">${results1.length} pkt</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: rgb(255,140,0)"></span>
        <span>${query2}</span>
        <span class="legend-count">${results2.length} pkt</span>
      </div>
    `;
  } catch (err) {
    console.error(err);
    alert("Błąd pobierania danych.");
  }

  btn.disabled = false;
  btn.textContent = "Porównaj na mapie";
}

document
  .getElementById("compare-btn")
  .addEventListener("click", compareSpecies);

document.getElementById("compare-clear-btn").addEventListener("click", () => {
  compareLayers.forEach((layer) => {
    if (layer) map.removeLayer(layer);
  });
  compareLayers = [null, null];
  document.getElementById("compare-input-1").value = "";
  document.getElementById("compare-input-2").value = "";
  document.getElementById("legend-section").style.display = "none";
});

// ===== ANIMACJA CZASOWA =====
let timelineInterval = null;
let timelineLayer = L.layerGroup().addTo(map);

function getYearRange(data) {
  const years = data
    .map((r) => (r.eventDate ? parseInt(r.eventDate.substring(0, 4)) : null))
    .filter((y) => y && y > 1800 && y <= new Date().getFullYear());
  if (years.length === 0) return { min: 1900, max: 2025 };
  return { min: Math.min(...years), max: Math.max(...years) };
}

function showTimelineYear(year) {
  document.getElementById("timeline-year-label").textContent = year;
  document.getElementById("timeline-slider").value = year;

  timelineLayer.clearLayers();

  const filtered = currentData.filter((r) => {
    if (!r.eventDate) return false;
    return parseInt(r.eventDate.substring(0, 4)) === year;
  });

  filtered.forEach((record) => {
    if (!record.decimalLatitude || !record.decimalLongitude) return;
    const latlng = [record.decimalLatitude, record.decimalLongitude];
    const marker = L.circleMarker(latlng, {
      radius: 7,
      fillColor: "rgb(232, 197, 71)",
      color: "rgba(232, 197, 71, 0.3)",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    });
    marker.bindPopup(
      `
      <div>
        <div class="popup-title">${record.scientificName || "—"}</div>
        <div class="popup-row"><span>Rok:</span><span>${year}</span></div>
        <div class="popup-row"><span>Głębokość:</span><span>${record.depth ? record.depth + " m" : "—"}</span></div>
      </div>
    `,
      { className: "custom-popup", maxWidth: 280 },
    );
    timelineLayer.addLayer(marker);
  });

  document.getElementById("timeline-count").textContent =
    `${filtered.length} obserwacji w ${year} roku`;
}

function stopTimeline() {
  if (timelineInterval) {
    clearInterval(timelineInterval);
    timelineInterval = null;
  }
}

function initTimeline() {
  if (currentData.length === 0) return;
  const { min, max } = getYearRange(currentData);
  const slider = document.getElementById("timeline-slider");
  slider.min = min;
  slider.max = max;
  slider.value = max;
  document.getElementById("timeline-min").textContent = min;
  document.getElementById("timeline-max").textContent = max;
  showTimelineYear(max);
}

function enableTimeline() {
  document.getElementById("btn-punkty").classList.remove("active");
  document.getElementById("btn-heatmapa").classList.remove("active");
  document.getElementById("btn-timeline").classList.add("active");
  if (heatLayer) map.removeLayer(heatLayer);
  map.removeLayer(markersLayer);
  document.getElementById("timeline-section").style.display = "block";
  timelineLayer.addTo(map);
  initTimeline();
}

function disableTimeline() {
  document.getElementById("timeline-section").style.display = "none";
  stopTimeline();
  timelineLayer.clearLayers();
  map.removeLayer(timelineLayer);
  setMode("punkty");
  document.getElementById("btn-punkty").classList.add("active");
  document.getElementById("btn-timeline").classList.remove("active");
}

document.getElementById("btn-timeline").addEventListener("click", () => {
  const isActive = document
    .getElementById("btn-timeline")
    .classList.contains("active");
  if (isActive) {
    disableTimeline();
  } else {
    if (currentData.length === 0) {
      setStatus("Najpierw wyszukaj gatunek!", false);
      return;
    }
    enableTimeline();
  }
});

// Suwak
document.getElementById("timeline-slider").addEventListener("input", (e) => {
  stopTimeline();
  showTimelineYear(parseInt(e.target.value));
});

// Play
document.getElementById("timeline-play").addEventListener("click", () => {
  stopTimeline();
  const slider = document.getElementById("timeline-slider");
  let year = parseInt(slider.min);
  slider.value = year;
  showTimelineYear(year);

  timelineInterval = setInterval(() => {
    year++;
    if (year > parseInt(slider.max)) {
      stopTimeline();
      return;
    }
    showTimelineYear(year);
  }, 800);
});

// Stop
document
  .getElementById("timeline-stop")
  .addEventListener("click", stopTimeline);

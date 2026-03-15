// Kolory Bathysa
const COLORS = {
    ocean: 'rgb(8, 53, 150)',
    teal: 'rgb(47, 156, 153)',
    tealAlpha: 'rgba(47, 156, 153, 0.15)',
    palette: [
        'rgba(47, 156, 153, 0.8)',
        'rgba(8, 53, 150, 0.8)',
        'rgba(10, 34, 64, 0.8)',
        'rgba(100, 180, 180, 0.8)',
        'rgba(40, 100, 200, 0.8)',
        'rgba(20, 80, 120, 0.8)',
        'rgba(80, 200, 180, 0.8)',
        'rgba(60, 130, 160, 0.8)',
        'rgba(30, 60, 100, 0.8)',
        'rgba(120, 210, 200, 0.8)',
    ]
};

// Globalne instancje wykresów
let chartLine = null;
let chartPie = null;
let chartBar = null;
let chartDepth = null;

// Domyślne opcje Chart.js
Chart.defaults.font.family = "'Josefin Sans', sans-serif";
Chart.defaults.color = 'rgb(75, 75, 75)';

// --- POMOCNICZE ---

function setStatus(text, loading) {
    const el = document.getElementById('status-text');
    if (loading) {
        el.innerHTML = `<span class="status-loading"><span class="spinner"></span>${text}</span>`;
    } else {
        el.textContent = text;
    }
}

function showEmpty(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function destroyChart(chart) {
    if (chart) chart.destroy();
    return null;
}

// --- PRZETWARZANIE DANYCH ---

function processData(records, yearRange) {
    const minYear = new Date().getFullYear() - yearRange;

    // Filtrowanie po roku
    const filtered = records.filter(r => {
        if (!r.eventDate) return true;
        const year = parseInt(r.eventDate.substring(0, 4));
        return year >= minYear;
    });

    // Obserwacje rocznie
    const byYear = {};
    filtered.forEach(r => {
        if (!r.eventDate) return;
        const year = r.eventDate.substring(0, 4);
        byYear[year] = (byYear[year] || 0) + 1;
    });

    // Top 10 gatunków
    const bySpecies = {};
    filtered.forEach(r => {
        const name = r.scientificName || 'Nieznany';
        bySpecies[name] = (bySpecies[name] || 0) + 1;
    });
    const top10 = Object.entries(bySpecies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Podział taksonomiczny (klasy)
    const byClass = {};
    filtered.forEach(r => {
        const cls = r.class || r.order || r.phylum || 'Inne';
        byClass[cls] = (byClass[cls] || 0) + 1;
    });
    const top6Classes = Object.entries(byClass)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    // Rozkład głębokości
    const depthBins = {
        '0–50 m (epipelagial)': 0,
        '50–200 m': 0,
        '200–1000 m (mezopelagial)': 0,
        '1000–4000 m (batypelagial)': 0,
        '4000+ m (abysal/hadal)': 0,
    };
    filtered.forEach(r => {
        const d = r.depth;
        if (!d) return;
        if (d <= 50)        depthBins['0–50 m (epipelagial)']++;
        else if (d <= 200)  depthBins['50–200 m']++;
        else if (d <= 1000) depthBins['200–1000 m (mezopelagial)']++;
        else if (d <= 4000) depthBins['1000–4000 m (batypelagial)']++;
        else                depthBins['4000+ m (abysal/hadal)']++;
    });

    // Statystyki
    const depths = filtered.map(r => r.depth).filter(Boolean);
    const avgDepth = depths.length
        ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length)
        : null;
    const years = Object.keys(byYear).map(Number);
    const yearSpan = years.length ? Math.max(...years) - Math.min(...years) : 0;

    return { byYear, top10, top6Classes, depthBins, filtered, avgDepth, yearSpan, bySpecies };
}

// --- RYSOWANIE WYKRESÓW ---

function drawLineChart(byYear) {
    const sorted = Object.entries(byYear).sort((a, b) => a[0] - b[0]);
    const labels = sorted.map(e => e[0]);
    const values = sorted.map(e => e[1]);

    showEmpty('empty-line', false);
    chartLine = destroyChart(chartLine);
    chartLine = new Chart(document.getElementById('chart-line'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Obserwacje',
                data: values,
                borderColor: COLORS.teal,
                backgroundColor: COLORS.tealAlpha,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: COLORS.teal,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { maxTicksLimit: 10, font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    beginAtZero: true,
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

function drawPieChart(top6Classes) {
    const labels = top6Classes.map(e => e[0]);
    const values = top6Classes.map(e => e[1]);

    showEmpty('empty-pie', false);
    chartPie = destroyChart(chartPie);
    chartPie = new Chart(document.getElementById('chart-pie'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: COLORS.palette,
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 10 }, padding: 8, boxWidth: 12 }
                }
            }
        }
    });
}

function drawBarChart(top10) {
    const labels = top10.map(e => e[0].length > 20 ? e[0].substring(0, 18) + '…' : e[0]);
    const values = top10.map(e => e[1]);

    showEmpty('empty-bar', false);
    chartBar = destroyChart(chartBar);
    chartBar = new Chart(document.getElementById('chart-bar'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Obserwacje',
                data: values,
                backgroundColor: COLORS.palette,
                borderRadius: 3,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 9, style: 'italic' } }
                }
            }
        }
    });
}

function drawDepthChart(depthBins) {
    const labels = Object.keys(depthBins);
    const values = Object.values(depthBins);

    // Kolory gradientu od jasnego (płytko) do ciemnego (głęboko)
    const depthColors = [
        'rgba(100, 200, 220, 0.85)',
        'rgba(47, 156, 153, 0.85)',
        'rgba(8, 100, 160, 0.85)',
        'rgba(8, 53, 150, 0.85)',
        'rgba(10, 34, 64, 0.85)',
    ];

    showEmpty('empty-depth', false);
    chartDepth = destroyChart(chartDepth);
    chartDepth = new Chart(document.getElementById('chart-depth'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Obserwacje',
                data: values,
                backgroundColor: depthColors,
                borderRadius: 3,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 8 }, maxRotation: 20 }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    beginAtZero: true,
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

function updateStats(data, total) {
    document.getElementById('stat-total').textContent =
        total > 999 ? (total / 1000).toFixed(1) + 'k' : total;
    document.getElementById('stat-species').textContent =
        Object.keys(data.bySpecies).length;
    document.getElementById('stat-depth').textContent =
        data.avgDepth ? data.avgDepth + ' m' : '—';
    document.getElementById('stat-years').textContent =
        data.yearSpan || '—';
}

// --- GŁÓWNA FUNKCJA ---

async function fetchAndDraw() {
    const query = document.getElementById('search-input').value.trim();
    const limit = document.getElementById('filter-limit').value;
    const yearRange = parseInt(document.getElementById('filter-year').value);

    if (!query) {
        setStatus('Wpisz nazwę gatunku przed wyszukiwaniem.', false);
        return;
    }

    const btn = document.getElementById('search-btn');
    btn.disabled = true;
    setStatus('Pobieranie danych z OBIS...', true);

    // Resetuj statystyki
    ['stat-total', 'stat-species', 'stat-depth', 'stat-years'].forEach(id => {
        document.getElementById(id).textContent = '—';
    });

    try {
        const url = `https://api.obis.org/v3/occurrence?scientificname=${encodeURIComponent(query)}&size=${limit}`;
        const response = await fetch(url);
        const json = await response.json();
        const records = json.results || [];

        if (records.length === 0) {
            setStatus(`Nie znaleziono wyników dla "${query}".`, false);
            btn.disabled = false;
            return;
        }

        setStatus(`Wczytano ${records.length} rekordów. Generuję wykresy...`, true);

        const data = processData(records, yearRange);

        // Rysuj wykresy
        if (Object.keys(data.byYear).length > 0) drawLineChart(data.byYear);
        else showEmpty('empty-line', true);

        if (data.top6Classes.length > 0) drawPieChart(data.top6Classes);
        else showEmpty('empty-pie', true);

        if (data.top10.length > 0) drawBarChart(data.top10);
        else showEmpty('empty-bar', true);

        const hasDepth = Object.values(data.depthBins).some(v => v > 0);
        if (hasDepth) drawDepthChart(data.depthBins);
        else showEmpty('empty-depth', true);

        updateStats(data, json.total || records.length);
        setStatus(`Wyświetlam ${records.length} z ${(json.total || records.length).toLocaleString()} rekordów.`, false);

    } catch (err) {
        setStatus('Błąd połączenia z OBIS API. Sprawdź internet.', false);
        console.error(err);
    }

    btn.disabled = false;
}

// Obsługa przycisków
document.getElementById('search-btn').addEventListener('click', fetchAndDraw);
document.getElementById('search-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') fetchAndDraw();
});
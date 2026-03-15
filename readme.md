# Bathys — Marine Data Platform

Interaktywna platforma danych morskich zbudowana z HTML, CSS i JavaScript.
Dane pochodzą z globalnej bazy [OBIS](https://obis.org) — Ocean Biodiversity Information System.

## Demo
[emilsliw.github.io/bathys](https://emilsliw.github.io/bathys)

## Funkcje

### Interaktywna mapa
- Wyszukiwanie gatunków morskich po nazwie łacińskiej
- Dane z API OBIS — ponad 100 milionów rekordów
- Filtry regionu oceanicznego i limitu wyników
- Klasteryzacja markerów — grupowanie punktów przy oddaleniu
- Popup z miniaturką i opisem z Wikipedii po kliknięciu punktu
- Historia ostatnich 5 wyszukiwań (localStorage)
- Licznik punktów widocznych na ekranie
- Eksport wyników do pliku CSV

### Heatmapa
- Wizualizacja zagęszczenia obserwacji
- Gradient kolorów: zielony → żółty → pomarańczowy → czerwony
- Przełącznik punkty/heatmapa

### Porównanie gatunków
- Dwa gatunki jednocześnie na mapie
- Każdy gatunek w innym kolorze (teal i pomarańczowy)
- Legenda z liczbą punktów dla każdego gatunku

### Animacja czasowa
- Suwak lat pokazujący zmiany rozmieszczenia gatunku w czasie
- Przycisk Play automatycznie przewija lata
- Żółte markery dla wybranego roku

### Wizualizacje danych
- Wykres liniowy — obserwacje w czasie
- Wykres kołowy — podział taksonomiczny
- Wykres słupkowy — top 10 gatunków
- Wykres głębokości — rozkład stref oceanicznych

### Strefy oceaniczne
- Interaktywny przekrój oceanu
- 5 stref: epipelagial, mezopelagial, batypelagial, abysalpelagial, hadalpelagial
- Parametry fizyczne każdej strefy (temperatura, ciśnienie, światło, tlen)
- Przykładowe gatunki z nazwami łacińskimi

## Technologie
- HTML5, CSS3, JavaScript (vanilla)
- [Leaflet.js](https://leafletjs.com) — mapy
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) — klasteryzacja
- [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) — heatmapa
- [Chart.js](https://chartjs.org) — wykresy
- [OBIS API](https://api.obis.org) — dane morskie
- [Wikipedia API](https://en.wikipedia.org/api/rest_v1/) — miniaturki gatunków

## Struktura
```
bathys/
├── index.html                  # Landing page
├── style.css                   # Style landing page
├── script.js                   # Skrypty landing page
├── responsive.css              # Responsywność landing page
│
├── wybor.html                  # Strona wyboru
├── wybor.css                   # Style strony wyboru
├── wybor.js                    # Bioluminescencja i skrypty
├── responsive-wybor.css        # Responsywność strony wyboru
│
├── mapa.html                   # Interaktywna mapa
├── mapa.css                    # Style mapy
├── mapa.js                     # Leaflet.js + OBIS API + wszystkie funkcje
├── responsive-mapa.css         # Responsywność mapy
│
├── wizualizacje.html           # Wizualizacje danych
├── wizualizacje.css            # Style wykresów
├── wizualizacje.js             # Chart.js + OBIS API
├── responsive-wizualizacje.css # Responsywność wykresów
│
├── strefy.html                 # Strefy oceaniczne
├── strefy.css                  # Style stref
├── strefy.js                   # Interaktywny przekrój
├── responsive-strefy.css       # Responsywność stref
│
├── transitions.js              # Animacje przejść między stronami
├── 404.html                    # Strona błędu 404
└── icon.png                    # Favicon
```

## Autor
Emil Śliwiński — [portfolio](https://emilsliw.github.io)
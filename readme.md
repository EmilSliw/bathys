## Bathys — Marine Data Platform

Interaktywna platforma danych morskich zbudowana z HTML, CSS i JavaScript.
Dane pochodzą z globalnej bazy [OBIS](https://obis.org) — Ocean Biodiversity Information System.

## Demo
[emilsliw.github.io/bathys](https://emilsliw.github.io/bathys)

## Funkcje
- **Interaktywna mapa** — rozmieszczenie gatunków morskich z API OBIS
- **Wizualizacje danych** — wykresy liniowe, słupkowe, kołowe i głębokości
- **Strefy oceaniczne** — interaktywny przekrój oceanu z opisami

## Technologie
- HTML5, CSS3, JavaScript
- [Leaflet.js](https://leafletjs.com) — mapy
- [Chart.js](https://chartjs.org) — wykresy
- [OBIS API](https://api.obis.org) — dane morskie

## Struktura
```
bathys/
├── index.html                 # Landing page
├── style.css                  # Style landing page
├── script.js                  # Skrypty landing page
├── responsive.css             # Responsywność landing page
│
├── wybor.html                 # Strona wyboru
├── wybor.css                  # Style strony wyboru
├── wybor.js                   # Bioluminescencja i skrypty
├── responsive-wybor.css       # Responsywność strony wyboru
│
├── mapa.html                  # Interaktywna mapa
├── mapa.css                   # Style mapy
├── mapa.js                    # Leaflet.js + OBIS API
├── responsive-mapa.css        # Responsywność mapy
│
├── wizualizacje.html          # Wizualizacje danych
├── wizualizacje.css           # Style wykresów
├── wizualizacje.js            # Chart.js + OBIS API
├── responsive-wizualizacje.css# Responsywność wykresów
│
├── strefy.html                # Strefy oceaniczne
├── strefy.css                 # Style stref
├── strefy.js                  # Interaktywny przekrój
├── responsive-strefy.css      # Responsywność stref
│
├── transitions.js             # Animacje przejść między stronami
├── 404.html                   # Strona błędu 404
└── icon.png                   # Favicon
```

## Autor
Emil Śliwiński — [portfolio](https://emilsliw.github.io)
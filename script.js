// GENEROWANIE LINI W RIGHT LANDING
const container = document.getElementById('linie');

for (let i = 0; i < 19; i++) {
    const linia = document.createElement('div');
    linia.className = 'linia';
    linia.style.top = (i * 5.5) + '%';
    container.appendChild(linia);
}
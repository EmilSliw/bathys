// Bioluminescencja
const main = document.getElementById('select-main');
const ilosc = 40;

for (let i = 0; i < ilosc; i++) {
    const punkt = document.createElement('div');
    punkt.classList.add('bio-punkt');

    // Losowa pozycja
    punkt.style.left = Math.random() * 100 + '%';
    punkt.style.top = Math.random() * 100 + '%';

    // Losowy rozmiar
    const rozmiar = Math.random() * 4 + 2;
    punkt.style.width = rozmiar + 'px';
    punkt.style.height = rozmiar + 'px';

    // Losowe opóźnienie animacji żeby nie pulsowały wszystkie naraz
    punkt.style.animationDelay = Math.random() * 4 + 's';
    punkt.style.animationDuration = (Math.random() * 3 + 2) + 's';

    main.appendChild(punkt);
}
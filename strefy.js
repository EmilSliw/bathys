const STREFY = {
    epipelagial: {
        label: 'Strefa I',
        name: 'Epipelagial',
        depth: '0 – 200 m',
        icon: '☀️',
        color: '#1a6fa8',
        desc: 'Strefa słoneczna, najbardziej nasłoneczniona i bogata w życie warstwa oceanu. Tutaj odbywa się fotosynteza i żyje zdecydowana większość znanych gatunków morskich. Pełna ruchu, kolorów i aktywności biologicznej.',
        params: {
            temp: '10 – 30°C',
            pressure: '1 – 20 atm',
            light: 'Pełne światło',
            oxygen: 'Wysoki'
        },
        species: [
            { emoji: '🐬', name: 'Delphinus delphis', common: 'Delfin zwyczajny' },
            { emoji: '🦈', name: 'Carcharodon carcharias', common: 'Rekin biały' },
            { emoji: '🐟', name: 'Thunnus thynnus', common: 'Tuńczyk błękitnopłetwy' },
            { emoji: '🐠', name: 'Amphiprion ocellaris', common: 'Błazenek' },
            { emoji: '🐢', name: 'Caretta caretta', common: 'Żółw karetta' },
        ]
    },
    mezopelagial: {
        label: 'Strefa II',
        name: 'Mezopelagial',
        depth: '200 – 1 000 m',
        icon: '🌙',
        color: '#0f4d8a',
        desc: 'Strefa zmierzchu, światło słoneczne ledwo tu dociera, tworząc wieczny półmrok. Wiele organizmów wykonuje tu dobowe wędrówki pionowe, w nocy wypływają wyżej żerować, za dnia chowają się w ciemności.',
        params: {
            temp: '4 – 10°C',
            pressure: '20 – 100 atm',
            light: 'Słabe, zanika',
            oxygen: 'Niski (minimum)'
        },
        species: [
            { emoji: '🦑', name: 'Architeuthis dux', common: 'Kałamarnica olbrzymia' },
            { emoji: '🐙', name: 'Vampyroteuthis infernalis', common: 'Wampirnica piekielna' },
            { emoji: '🐡', name: 'Melanocetus johnsonii', common: 'Żabnicowate' },
            { emoji: '🦐', name: 'Sergia lucens', common: 'Krewetka świecąca' },
            { emoji: '🐟', name: 'Myctophum punctatum', common: 'Latarnik' },
        ]
    },
    batypelagial: {
        label: 'Strefa III',
        name: 'Batypelagial',
        depth: '1 000 – 4 000 m',
        icon: '🌑',
        color: '#0a3466',
        desc: 'Strefa północna, całkowita ciemność, ogromne ciśnienie i bliska zera temperatura. Życie tutaj jest ekstremalnie rzadkie i wyspecjalizowane. Wiele zwierząt wytwarza własne światło, bioluminescencja to tu norma, nie wyjątek.',
        params: {
            temp: '2 – 4°C',
            pressure: '100 – 400 atm',
            light: 'Brak (tylko bio)',
            oxygen: 'Umiarkowany'
        },
        species: [
            { emoji: '🪸', name: 'Dumbo octopus', common: 'Ośmiornica Dumbo' },
            { emoji: '🦑', name: 'Histioteuthis heteropsis', common: 'Kałamarnica koktajlowa' },
            { emoji: '🐟', name: 'Anoplogaster cornuta', common: 'Ryba jadowita' },
            { emoji: '🦐', name: 'Acanthephyra purpurea', common: 'Krewetka głębinowa' },
            { emoji: '🪼', name: 'Atolla wyvillei', common: 'Meduza głębinowa' },
        ]
    },
    abysalpelagial: {
        label: 'Strefa IV',
        name: 'Abysalpelagial',
        depth: '4 000 – 6 000 m',
        icon: '⬛',
        color: '#061e42',
        desc: 'Strefa otchłani, płaskie równiny pokryte grubą warstwą mułu, ciśnienie druzgocące, temperatura bliska zeru. Życie żywi się tu "śniegiem morskim", opadającymi szczątkami organicznymi z wyższych stref.',
        params: {
            temp: '2 – 3°C',
            pressure: '400 – 600 atm',
            light: 'Brak absolutny',
            oxygen: 'Umiarkowany'
        },
        species: [
            { emoji: '🦀', name: 'Benthesicymus crenatus', common: 'Krewetka abysalna' },
            { emoji: '⭐', name: 'Brisingida', common: 'Rozgwiazda otchłani' },
            { emoji: '🐟', name: 'Abyssobrotula galatheae', common: 'Ryba abysalna' },
            { emoji: '🦑', name: 'Cirrothauma murrayi', common: 'Ośmiornica galaretowata' },
            { emoji: '🦠', name: 'Foraminifera', common: 'Otwornice (organizmy jednokomórkowe)' },
        ]
    },
    hadalpelagial: {
        label: 'Strefa V',
        name: 'Hadalpelagial',
        depth: '6 000 – 11 000 m',
        icon: '🕳️',
        color: '#030d1f',
        desc: 'Strefa rowów oceanicznych, najgłębsze miejsca na Ziemi, jak Rów Mariański (11 034 m). Przez lata uważana za martwą, okazała się zamieszkana przez wyspecjalizowane organizmy odporne na ekstremalne ciśnienie. Najsłabiej zbadana strefa oceanu.',
        params: {
            temp: '1 – 2°C',
            pressure: '600 – 1100 atm',
            light: 'Brak absolutny',
            oxygen: 'Niski'
        },
        species: [
            { emoji: '🦐', name: 'Hirondellea gigas', common: 'Kiełż rowów głębinowych' },
            { emoji: '🐟', name: 'Pseudoliparis swirei', common: 'Ryba ślimakowata' },
            { emoji: '🦑', name: 'Grimpoteuthis boylei', common: 'Ośmiornica hadalna' },
            { emoji: '🦠', name: 'Xenophyophora', common: 'Ksenofiofory (gigantyczne ameby)' },
            { emoji: '🪱', name: 'Polychaeta', common: 'Wieloszczety hadalne' },
        ]
    }
};

// --- OBSŁUGA KLIKNIĘĆ ---

function selectZone(zoneKey) {
    // Usuń aktywną klasę ze wszystkich
    document.querySelectorAll('.zone-band').forEach(b => b.classList.remove('active'));

    // Dodaj aktywną do klikniętej
    const band = document.querySelector(`.zone-band[data-zone="${zoneKey}"]`);
    if (band) band.classList.add('active');

    const zone = STREFY[zoneKey];
    if (!zone) return;

    // Ukryj domyślny stan
    document.getElementById('info-default').style.display = 'none';

    // Wypełnij dane
    document.getElementById('info-icon').textContent = zone.icon;
    document.getElementById('info-icon').style.background = zone.color + '33';
    document.getElementById('info-label').textContent = zone.label;
    document.getElementById('info-name').textContent = zone.name;
    document.getElementById('info-depth').textContent = 'Głębokość: ' + zone.depth;
    document.getElementById('info-desc').textContent = zone.desc;

    document.getElementById('param-temp').textContent = zone.params.temp;
    document.getElementById('param-pressure').textContent = zone.params.pressure;
    document.getElementById('param-light').textContent = zone.params.light;
    document.getElementById('param-oxygen').textContent = zone.params.oxygen;

    // Gatunki
    const list = document.getElementById('species-list');
    list.innerHTML = '';
    zone.species.forEach(s => {
        const item = document.createElement('div');
        item.className = 'species-item';
        item.innerHTML = `
            <span class="species-emoji">${s.emoji}</span>
            <div class="species-info">
                <span class="species-name">${s.name}</span>
                <span class="species-common">${s.common}</span>
            </div>
        `;
        list.appendChild(item);
    });

    // Pokaż szczegóły
    const details = document.getElementById('info-details');
    details.classList.remove('visible');
    // Trick żeby animacja się powtórzyła
    void details.offsetWidth;
    details.classList.add('visible');
}

// Podpinanie kliknięć
document.querySelectorAll('.zone-band').forEach(band => {
    band.addEventListener('click', () => {
        selectZone(band.dataset.zone);
    });
});
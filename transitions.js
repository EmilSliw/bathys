// Animacja wyjścia przy klikaniu linków
document.addEventListener('click', e => {
    const link = e.target.closest('a');
    
    // Ignoruj linki zewnętrzne, kotwice (#) i nowe zakładki
    if (!link) return;
    if (!link.href) return;
    if (link.href.startsWith('#')) return;
    if (link.target === '_blank') return;
    if (link.hostname !== window.location.hostname) return;

    e.preventDefault();
    const href = link.href;

    // Animacja wyjścia
    document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(-8px)';

    // Przejdź po zakończeniu animacji
    setTimeout(() => {
        window.location.href = href;
    }, 300);
});
(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    window.App.Views.NotFound = function () {
        const { navigate } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';
        container.innerHTML = `<div class="flow-topbar"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span></a></div><main class="not-found-page section-not-found" data-section="not-found"><div class="not-found-mark">${icon('map-pin-off', 42)}</div><p class="eyebrow"><span class="eyebrow-dot"></span> Error 404</p><h1>That page isn’t on the care path.</h1><p>We couldn’t find the address you opened. Return to SmartCare or go back to the previous page.</p><div class="not-found-actions"><button class="btn-primary btn-icon" id="not-found-home">Return home ${icon('house', 16)}</button><button class="text-link btn-icon" id="not-found-back">Go to previous page ${icon('arrow-left', 16)}</button></div></main>${window.App.UI.footer()}`;
        container.querySelector('#not-found-home').onclick = () => navigate('/');
        container.querySelector('#not-found-back').onclick = () => { if (window.history.length > 1) window.history.back(); else navigate('/'); };
        return container;
    };
})();

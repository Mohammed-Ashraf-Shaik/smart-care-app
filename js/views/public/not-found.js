(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    window.App.Views.NotFound = function () {
        const { navigate } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell not-found-shell';
        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span>
                </a>
                <a class="home-btn-link back-link" data-route="/" href="/">${icon('house', 15)} Return home</a>
            </div>
            <main class="not-found-page section-not-found" data-section="not-found" aria-labelledby="nf-title">
                <div class="not-found-mark">${icon('search-x', 38)}</div>
                <p class="eyebrow"><span class="eyebrow-dot"></span> Error 404</p>
                <h1 id="nf-title">That page isn't on the care path.</h1>
                <p>We couldn't find the address you opened. It may have moved, been removed, or never existed. Return home or try a link below.</p>
                <div class="not-found-actions">
                    <button class="btn-primary btn-icon" id="not-found-home">Return home ${icon('house', 15)}</button>
                    <button class="btn-secondary btn-icon" id="not-found-back">${icon('arrow-left', 15)} Go back</button>
                </div>
                <div class="not-found-suggestions">
                    <p class="not-found-suggestions-label">Try one of these instead</p>
                    <div class="not-found-pills">
                        <a class="suggestion-pill" data-route="/" href="/">${icon('home', 13)} Home</a>
                        <a class="suggestion-pill" data-route="/login" href="/login">${icon('log-in', 13)} Patient portal</a>
                        <a class="suggestion-pill" data-route="/login" href="/login?role=doctor">${icon('activity', 13)} Hospital portal</a>
                        <a class="suggestion-pill" data-route="/about" href="/about">${icon('circle-help', 13)} About SmartCare</a>
                    </div>
                </div>
            </main>
            ${window.App.UI.footer()}`;
        container.querySelector('#not-found-home').onclick = () => navigate('/');
        container.querySelector('#not-found-back').onclick = () => { if (window.history.length > 1) window.history.back(); else navigate('/'); };
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

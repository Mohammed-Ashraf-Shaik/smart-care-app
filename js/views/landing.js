(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    window.App.Views.Landing = function () {
        const { setView, setAuthTarget } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'app-shell';
        container.innerHTML = `
            <header class="shell-nav" data-section="site-header">
                <a class="brand-lockup" data-route="/" href="/" aria-label="SmartCare home">
                    <span class="brand-mark">${icon('heart-pulse', 21)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span>
                </a>
                <nav class="nav-links" aria-label="Primary navigation">
                    <a href="#how-it-works">How it works</a>
                    <a href="#for-providers">For providers</a>
                    <a data-route="/donate" href="/donate">Donation</a>
                    <a href="#trust">Why SmartCare</a>
                </nav>
                <div class="nav-actions">
                    ${window.App.UI.topbarControls()}
                    <button class="btn-saffron btn-hero-pop btn-icon" id="nav-login">Sign in into portal ${icon('arrow-right', 16)}</button>
                </div>
            </header>
            <main id="top" class="landing-main section-landing" data-section="landing-page">
                <section class="hero-frame section-hero" data-section="hero" aria-labelledby="hero-title">
                    <div class="hero-copy">
                        <div>
                            <div class="eyebrow"><span class="eyebrow-dot"></span> Digital health access network</div>
                            <h1 id="hero-title">Care that starts <span>before</span> you arrive.</h1>
                            <p>Find the right care nearby, see the queue before you leave home, and reserve your place in a few calm, clear steps.</p>
                            <div class="hero-ctas">
                                <button class="btn-saffron btn-hero-pop btn-icon" id="hero-login" style="font-size:1.05rem;padding:.9rem 1.8rem">Sign in into portal ${icon('arrow-right', 18)}</button>
                            </div>
                            <div class="hero-meta">
                                <span>${icon('shield-check', 15)} Verified care centres</span>
                                <span>${icon('clock-3', 15)} Live queue visibility</span>
                                <span>${icon('accessibility', 15)} Built for everyone</span>
                            </div>
                        </div>
                        <div class="hero-facts" aria-label="SmartCare facts">
                            <div><strong>3 min</strong><span>typical application</span></div>
                            <div><strong>18 min</strong><span>average wait today</span></div>
                            <div><strong>24/7</strong><span>status visibility</span></div>
                        </div>
                    </div>
                    <div class="hero-side" aria-label="Nearby care preview">
                        <div class="care-panel">
                            <div class="care-panel-head">
                                <div><p class="care-panel-title">Care near you</p><p class="care-panel-subtitle">A calmer way to choose where to go.</p></div>
                                <span class="status-eyebrow"><i></i> Live</span>
                            </div>
                            <div class="mini-map" role="img" aria-label="Illustrated map showing your location and nearby hospitals">
                                <span class="mini-route"></span>
                                <span class="mini-pin user"></span>
                                <span class="mini-pin hospital-1"></span>
                                <span class="mini-pin hospital-2"></span>
                                <span class="mini-map-label">2 centres within 5 km</span>
                            </div>
                            <div class="care-panel-foot">
                                <small>Average wait today</small>
                                <strong>18 minutes <span aria-hidden="true">&#8594;</span></strong>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="landing-stat-strip section-stats" data-section="programme-facts" aria-label="SmartCare programme facts">
                    <div><strong>01</strong><span>Use your location or search manually</span></div>
                    <div><strong>02</strong><span>Choose a centre with queue visibility</span></div>
                    <div><strong>03</strong><span>Keep the next step in one place</span></div>
                </section>
                <section id="how-it-works" class="journey-section section-journey" data-section="how-it-works">
                    <div class="section-heading">
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> A clear path to care</div>
                        <h2>Less time searching. More time getting seen.</h2>
                        <p>SmartCare connects your location, care centre, application, and queue status in one calm flow.</p>
                    </div>
                    <div class="journey-grid">
                        <article>
                            <span class="journey-number">01</span>
                            <span class="journey-icon">${icon('locate-fixed', 20)}</span>
                            <h3>Locate</h3>
                            <p>Use device location or search by city, neighbourhood, or PIN code.</p>
                            <a href="#top" class="text-link text-link-dark btn-icon">Find care <span aria-hidden="true">&#8594;</span></a>
                        </article>
                        <article>
                            <span class="journey-number">02</span>
                            <span class="journey-icon">${icon('list-checks', 20)}</span>
                            <h3>Apply</h3>
                            <p>Share only the details your care team needs before you arrive.</p>
                            <a href="#top" class="text-link text-link-dark btn-icon">Start simply <span aria-hidden="true">&#8594;</span></a>
                        </article>
                        <article>
                            <span class="journey-number">03</span>
                            <span class="journey-icon">${icon('activity', 20)}</span>
                            <h3>Follow through</h3>
                            <p>Keep your reservation reference, queue window, and centre details visible.</p>
                            <a href="#for-providers" class="text-link text-link-dark btn-icon">See the portal <span aria-hidden="true">&#8594;</span></a>
                        </article>
                    </div>
                </section>
                <section id="for-providers" class="portal-split section-portals" data-section="portals">
                    <div class="portal-panel portal-patient">
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> For patients</div>
                        <h2>Arrive with a clearer plan.</h2>
                        <p>Search nearby care, compare the queue, and reserve your place without repeating the same details at the front desk.</p>
                        <button id="portal-patient" class="btn-primary btn-icon">Open patient portal ${icon('arrow-right', 16)}</button>
                    </div>
                    <div class="portal-panel portal-provider">
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> For hospitals</div>
                        <h2>Keep the next handoff visible.</h2>
                        <p>Give your team a shared view of arrivals, priority cases, room readiness, and daily performance.</p>
                        <button id="portal-provider" class="btn-secondary btn-icon">Open provider portal ${icon('arrow-right', 16)}</button>
                    </div>
                </section>
                <section id="trust" class="trust-row section-trust" data-section="trust" aria-label="Why SmartCare">
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('shield-check', 17)}</span><div class="trust-copy"><strong>Clear by design</strong><span>Readable states and calm next actions.</span></div></div>
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('map-pin', 17)}</span><div class="trust-copy"><strong>Location aware</strong><span>Use precise device coordinates when you choose.</span></div></div>
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('lock-keyhole', 17)}</span><div class="trust-copy"><strong>Privacy minded</strong><span>Location is requested only for the care search.</span></div></div>
                </section>
            </main>
            ${window.App.UI.footer()}
        `;

        const openLoginPortal = () => { setAuthTarget('patient'); setView('login'); };
        const navLogin = container.querySelector('#nav-login');
        if (navLogin) navLogin.onclick = openLoginPortal;
        const heroLogin = container.querySelector('#hero-login');
        if (heroLogin) heroLogin.onclick = openLoginPortal;
        const portalPatient = container.querySelector('#portal-patient');
        if (portalPatient) portalPatient.onclick = openLoginPortal;
        const portalProvider = container.querySelector('#portal-provider');
        if (portalProvider) portalProvider.onclick = () => { setAuthTarget('doctor'); setView('login'); };

        window.App.UI.bindTopbarControls(container);
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

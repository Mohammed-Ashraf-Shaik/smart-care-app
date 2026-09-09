(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    window.App.Views.Landing = function () {
        const { navigate, setAuthTarget } = window.App.Store;
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
                    <a data-route="/ambulance" href="/ambulance" style="color:#e53e3e;font-weight:700;display:inline-flex;align-items:center;gap:.3rem">${icon('siren', 15)} Ambulance</a>
                    <a data-route="/pharmacy" href="/pharmacy">Pharmacy</a>
                    <a data-route="/verify-rx" href="/verify-rx">Verify Rx</a>
                    <a data-route="/donate" href="/donate">Donation</a>
                    <a href="#for-providers">For hospitals</a>
                </nav>
                <div class="nav-actions">
                    ${window.App.UI.topbarControls()}
                    <button class="btn-ghost" id="nav-login" style="font-weight:800;font-size:.84rem;min-height:2.75rem;padding:.4rem .75rem">Sign in</button>
                    <button class="btn-primary" id="nav-signup" style="font-weight:800;font-size:.84rem;min-height:2.75rem;padding:.4rem .95rem;border-radius:.6rem">Sign up</button>
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
                                <button class="btn-hero-pop btn-icon" id="hero-login">Open patient portal ${icon('arrow-right', 18)}</button>
                                <button class="btn-secondary btn-icon" id="hero-demo">Explore demo roles ${icon('users', 17)}</button>
                            </div>
                            <div class="hero-meta">
                                <span>${icon('shield-check', 15)} Role-specific workspaces</span>
                                <span>${icon('clock-3', 15)} Queue status preview</span>
                                <span>${icon('accessibility', 15)} Mobile-first controls</span>
                            </div>
                        </div>
                        <div class="hero-facts" aria-label="SmartCare facts">
                            <div><strong>4 steps</strong><span>patient booking flow</span></div>
                            <div><strong>3 roles</strong><span>ready for demo</span></div>
                            <div><strong>1 profile</strong><span>portable medical history</span></div>
                        </div>
                    </div>
                    <div class="hero-side" aria-label="Nearby care preview">
                        <div class="care-panel care-panel-redesigned">
                            <div class="care-panel-head">
                                <div>
                                    <span class="care-tag">${icon('map-pin', 12)} Live Care Network</span>
                                    <p class="care-panel-title" style="color:#fff;font-weight:800;font-size:1.05rem;margin:0">Verified Care Centres</p>
                                </div>
                                <span class="status-eyebrow" style="color:#b8daf5"><span class="pulse-dot"></span> Live queue</span>
                            </div>
                            <div class="care-panel-body">
                                <div class="care-hosp-preview active" data-hospital="SmartCare Community Hospital" style="cursor:pointer;border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.14)">
                                    <div class="hosp-preview-icon">${icon('hospital', 18)}</div>
                                    <div class="hosp-preview-info">
                                        <strong>SmartCare Community Hospital</strong>
                                        <small>Gachibowli · 4 ICU Beds · 2.1 km</small>
                                    </div>
                                    <span class="wait-badge green">~12m wait</span>
                                </div>
                                <div class="care-hosp-preview" data-hospital="CityCare Trauma Centre" style="cursor:pointer">
                                    <div class="hosp-preview-icon">${icon('activity', 18)}</div>
                                    <div class="hosp-preview-info">
                                        <strong>CityCare Trauma Centre</strong>
                                        <small>Financial District · 2 ICU Beds · 3.8 km</small>
                                    </div>
                                    <span class="wait-badge yellow">~24m wait</span>
                                </div>
                            </div>
                            <div class="care-panel-foot" style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.12);padding-top:.85rem;margin-top:.35rem">
                                <div class="foot-stats">
                                    <small>Selected Hospital</small>
                                    <strong id="hero-selected-hosp">SmartCare Community Hospital</strong>
                                </div>
                                <a id="hero-book-direct" href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" class="btn-primary btn-icon" style="background:#fff;color:#0a3b69;font-size:.78rem;font-weight:800;padding:.4rem .75rem;border-radius:.5rem">
                                    Book Visit ${icon('arrow-right', 14)}
                                </a>
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
                            <p>Use device location or search by city or neighbourhood.</p>
                            <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" class="text-link text-link-dark btn-icon">Find care <span aria-hidden="true">&#8594;</span></a>
                        </article>
                        <article>
                            <span class="journey-number">02</span>
                            <span class="journey-icon">${icon('list-checks', 20)}</span>
                            <h3>Apply</h3>
                            <p>Share only the details your care team needs before you arrive.</p>
                            <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" class="text-link text-link-dark btn-icon">Start simply <span aria-hidden="true">&#8594;</span></a>
                        </article>
                        <article>
                            <span class="journey-number">03</span>
                            <span class="journey-icon">${icon('activity', 20)}</span>
                            <h3>Follow through</h3>
                            <p>Keep your reservation reference, queue window, and centre details visible.</p>
                            <a data-route="/login?role=patient" href="/login?role=patient" class="text-link text-link-dark btn-icon">See the portal <span aria-hidden="true">&#8594;</span></a>
                        </article>
                    </div>
                </section>
                <section id="for-providers" class="portal-split section-portals" data-section="provider-portals" aria-label="Hospital portals">
                    <article class="portal-panel portal-patient">
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Hospital care team</div>
                        <h2>Move each clinical handoff forward.</h2>
                        <p>Review the assigned queue, call the next patient, scan tickets, and follow visits through consultation.</p>
                        <button class="btn-primary btn-icon" id="open-doctor-portal" type="button">Open doctor sign-in ${icon('arrow-right', 16)}</button>
                    </article>
                    <article class="portal-panel portal-provider">
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Hospital Operations</div>
                        <h2>Keep rooms and walk-ins visible.</h2>
                        <p>Register walk-in patients, assign clinician queues, track room readiness, and monitor centre demand.</p>
                        <button class="btn-secondary btn-icon" id="open-ops-portal" type="button">Open operations sign-in ${icon('arrow-right', 16)}</button>
                    </article>
                </section>
                <section id="trust" class="trust-row section-trust" data-section="trust" aria-label="Why SmartCare">
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('shield-check', 17)}</span><div class="trust-copy"><strong>Clear by design</strong><span>Readable states and calm next actions.</span></div></div>
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('map-pin', 17)}</span><div class="trust-copy"><strong>Location aware</strong><span>Use precise device coordinates when you choose.</span></div></div>
                    <div class="trust-card"><span class="trust-icon" aria-hidden="true">${icon('lock-keyhole', 17)}</span><div class="trust-copy"><strong>Privacy minded</strong><span>Location is requested only for the care search.</span></div></div>
                </section>
            </main>
            ${window.App.UI.footer()}
        `;

        const openLoginPortal = (targetMode = 'signin') => {
            setAuthTarget('patient');
            navigate(`/login?mode=${targetMode}&role=patient`);
        };
        const navLogin = container.querySelector('#nav-login');
        if (navLogin) navLogin.onclick = () => openLoginPortal('signin');
        const navSignUp = container.querySelector('#nav-signup');
        if (navSignUp) navSignUp.onclick = () => openLoginPortal('signup');
        const heroLogin = container.querySelector('#hero-login');
        if (heroLogin) heroLogin.onclick = () => openLoginPortal('signin');
        const heroDemo = container.querySelector('#hero-demo');
        if (heroDemo) heroDemo.onclick = () => openLoginPortal('signin');
        const doctorPortal = container.querySelector('#open-doctor-portal');
        if (doctorPortal) doctorPortal.onclick = () => { setAuthTarget('doctor'); navigate('/login?role=doctor'); };
        const opsPortal = container.querySelector('#open-ops-portal');
        if (opsPortal) opsPortal.onclick = () => { setAuthTarget('staff'); navigate('/login?role=staff'); };

        // Hero care panel hospital selection
        let selectedHospName = 'SmartCare Community Hospital';
        container.querySelectorAll('.care-hosp-preview').forEach(card => {
            card.onclick = () => {
                container.querySelectorAll('.care-hosp-preview').forEach(c => {
                    c.classList.remove('active');
                    c.style.borderColor = 'rgba(255,255,255,0.12)';
                    c.style.background = 'rgba(255,255,255,0.08)';
                });
                card.classList.add('active');
                card.style.borderColor = 'rgba(255,255,255,0.4)';
                card.style.background = 'rgba(255,255,255,0.14)';
                selectedHospName = card.dataset.hospital;
                const label = container.querySelector('#hero-selected-hosp');
                if (label) label.textContent = selectedHospName;
                const directBtn = container.querySelector('#hero-book-direct');
                if (directBtn) {
                    const route = `/dashboard/patient/apply/1?hospital=${encodeURIComponent(selectedHospName)}`;
                    directBtn.setAttribute('href', route);
                    directBtn.dataset.route = route;
                }
                if (window.App.Store.updatePatientData) {
                    window.App.Store.updatePatientData({ hospital: selectedHospName });
                }
                window.App.UI.toast(`Selected ${selectedHospName}. Ready to book.`, 'info');
            };
        });

        window.App.UI.bindTopbarControls(container);
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();


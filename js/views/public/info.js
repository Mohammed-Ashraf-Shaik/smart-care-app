(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Info = function () {
        const { state, logout } = window.App.Store;
        const container = document.createElement('div');
        
        // Determine if we are rendering within a workspace shell or standalone public page
        const isWorkspace = Boolean(state.isLogged && (state.route || '').startsWith('/dashboard/'));
        container.className = isWorkspace ? 'flow-shell workspace-shell' : 'flow-shell';

        const urlTab = new URLSearchParams(window.location.search).get('tab');
        let page = urlTab || state.infoPage || (['terms', 'privacy', 'about'].includes(state.view) ? state.view : 'about');

        const pagesData = {
            about: {
                eyebrow: 'About SmartCare Systems',
                icon: 'heart-pulse',
                title: 'A high-fidelity healthcare queue and Medical Passport prototype.',
                intro: 'SmartCare demonstrates how patients, care providers, and hospital operations teams can coordinate booking, queue handoffs, and browser-local health records in one accessible interface.',
                badges: [
                    { icon: 'clock-3', text: 'Current Queue Snapshot' },
                    { icon: 'map-pin', text: 'Opt-In Location Search' },
                    { icon: 'hard-drive', text: 'Browser-Local Demo Records' },
                    { icon: 'heart-handshake', text: 'Donation Workflow Demo' }
                ],
                keypointTitle: 'Prototype & Demo Architecture',
                keypointText: 'This build is an evaluation prototype. It uses a browser-local service for accounts, queues, rooms, prescriptions, and donation workflows, plus public map services for location search. It is not connected to a clinical system or care network.',
                sections: [
                    { icon: 'stethoscope', heading: 'Care Discovery & Queue Access', text: 'Search public map data and clearly labeled fictional fallback centres, then create a local demo reservation and follow its current queue state.' },
                    { icon: 'layout-dashboard', heading: 'Provider & Hospital Workspace', text: 'Doctors and Hospital Ops can test queue transitions, walk-in intake, local room readiness, Passport handoff, and e-prescription workflows.' },
                    { icon: 'heart-handshake', heading: 'Blood & Organ Donation Workflow', text: 'Explore a same-device demonstration of donation offers, support requests, and non-binding organ interest without contacting hospitals or official registries.' },
                    { icon: 'sparkles', heading: 'Triage-First Ordering', text: 'The demo orders queue entries by their assigned Red, Yellow, or Green priority and then by arrival time; it does not make clinical triage decisions.' }
                ]
            },
            terms: {
                eyebrow: 'Terms and Conditions',
                icon: 'scroll-text',
                title: 'Clear, transparent expectations for the SmartCare prototype.',
                intro: 'These terms outline the scope, responsibilities, and guidelines for using the SmartCare web application and demo environment.',
                badges: [
                    { icon: 'flask-conical', text: 'Evaluation Prototype' },
                    { icon: 'triangle-alert', text: 'Not for Medical Emergencies' },
                    { icon: 'file-text', text: 'Updated September 2026' }
                ],
                keypointTitle: 'Important User Responsibilities',
                keypointText: 'By using the SmartCare prototype, you agree not to enter sensitive medical records, protected health information (PHI), or real credentials.',
                sections: [
                    { icon: 'monitor', heading: 'Non-Emergency Simulation', text: 'SmartCare is a design and workflow prototype. Do not use this demo for life-threatening medical emergencies. Please call your local emergency services (e.g. 108 / 911 / 112) immediately.' },
                    { icon: 'key-round', heading: 'Account & Demo Authentication', text: 'Role-based Patient, Doctor / Provider, and Hospital Ops accounts are provided for evaluation. Use fictional demo credentials and do not submit sensitive personal identifiers.' },
                    { icon: 'map', heading: 'Location & Map Services', text: 'When you choose a device-location or manual search, the query or coordinates are sent to public OpenStreetMap-based services. Selected booking details may then remain in this browser.' },
                    { icon: 'refresh-cw', heading: 'Continuous Improvements', text: 'System features, queue metrics, and simulated inventories may update dynamically as new capabilities are tested and refined.' }
                ]
            },
            privacy: {
                eyebrow: 'Privacy Notice & Data Security',
                icon: 'shield-check',
                title: 'Know what this prototype stores and shares.',
                intro: 'SmartCare is a front-end demonstration, not a production health-record system. Use only fictional information and clear the site’s browser data when you finish evaluating it.',
                badges: [
                    { icon: 'lock', text: 'Local-First Storage' },
                    { icon: 'cookie', text: 'Translation Cookie Only' },
                    { icon: 'trash-2', text: 'Clear Through Browser Settings' }
                ],
                keypointTitle: 'Logging Out Is Not Data Deletion',
                keypointText: 'Signing out removes the active SmartCare session but intentionally keeps local demo profiles, visits, queues, rooms, prescriptions, Passport records, theme, and donation entries. Clear this site’s cookies and storage in your browser to remove them.',
                sections: [
                    { icon: 'database', heading: 'Data Stored in This Demo', text: 'The browser can store fictional profiles, booking drafts and visits, queue entries, room states, prescriptions, Medical Passport fields, donation entries, session details, and interface preferences.' },
                    { icon: 'navigation', heading: 'Location & External Map Services', text: 'Location access starts only when you select it. Manual search text or device coordinates are sent to Nominatim and Overpass/OpenStreetMap-based services to geocode and find nearby places; map assets also load from external providers.' },
                    { icon: 'hard-drive', heading: 'Local Storage Scope', text: 'Patient drafts, visits, and Passport history are account-scoped in this browser. Some shared operational demo data—such as queues, donation posts, and prescriptions—is visible across local demo roles by design.' },
                    { icon: 'languages', heading: 'Language Preference', text: 'The optional translation control may set a Google Translate preference cookie. SmartCare does not include advertising or analytics trackers in this build.' }
                ]
            }
        };

        const dashboardRoute = state.isLogged ? (state.loggedRole === 'patient' ? '/dashboard/patient' : state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin') : '/';

        function workspaceNavHtml() {
            const role = state.loggedRole;
            if (role === 'patient') {
                return `<a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1">${icon('calendar-plus', 16)}<span>Book appointment</span></a><a href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a><a href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a><div class="nav-divider"></div><a href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a><a class="active" href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
            }
            if (role === 'doctor') {
                return `<a href="/dashboard/doctor" data-route="/dashboard/doctor">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><div class="nav-divider"></div><a href="/dashboard/doctor/donations" data-route="/dashboard/doctor/donations">${icon('heart-handshake', 16)}<span>Donations</span></a><a class="active" href="/dashboard/doctor/help" data-route="/dashboard/doctor/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
            }
            return `<a href="/dashboard/admin" data-route="/dashboard/admin">${icon('layout-dashboard', 16)}<span>Operations</span></a><a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><div class="nav-divider"></div><a href="/dashboard/admin/donations" data-route="/dashboard/admin/donations">${icon('heart-handshake', 16)}<span>Donations</span></a><a class="active" href="/dashboard/admin/help" data-route="/dashboard/admin/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        }

        function render() {
            const content = pagesData[page] || pagesData.about;

            const badgesHtml = (content.badges || []).map(b => `
                <span class="info-badge">${icon(b.icon, 14)} ${esc(b.text)}</span>
            `).join('');

            const sectionCardsHtml = content.sections.map(s => `
                <div class="info-card">
                    <div class="info-card-icon">${icon(s.icon, 20)}</div>
                    <div>
                        <h2>${esc(s.heading)}</h2>
                        <p>${esc(s.text)}</p>
                    </div>
                </div>
            `).join('');

            const innerHtml = `
                <div class="info-layout section-info" data-section="${page}">
                    <div class="info-hero">
                        <div class="info-hero-icon">${icon(content.icon, 26)}</div>
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> ${esc(content.eyebrow)}</div>
                        <h1 style="color:var(--teal) !important">${esc(content.title)}</h1>
                        <p class="info-intro">${esc(content.intro)}</p>
                        ${badgesHtml ? `<div class="info-badges">${badgesHtml}</div>` : ''}
                    </div>

                    ${content.keypointTitle ? `
                    <div class="info-keypoints">
                        <strong>${icon('info', 16)} ${esc(content.keypointTitle)}</strong>
                        <p>${esc(content.keypointText)}</p>
                    </div>` : ''}

                    <div class="info-cards">${sectionCardsHtml}</div>
                </div>
            `;

            if (isWorkspace) {
                // In workspace mode: render with .provider-shell grid (2-columns: .workspace-tabs on left, .workspace-content on right)
                container.innerHTML = `
                    <div class="flow-topbar">
                        <a class="brand-lockup" data-route="/" href="/">
                            <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                            <span><span class="brand-name">SmartCare</span><span class="brand-caption">Help &amp; Documentation</span></span>
                        </a>
                        <div class="flow-topbar-actions">
                            ${window.App.UI.topbarControls()}
                            <a class="back-link" data-route="${dashboardRoute}" href="${dashboardRoute}">${icon('arrow-left', 16)} Back to dashboard</a>
                        </div>
                    </div>
                    <main class="provider-shell section-dashboard" data-section="workspace-help">
                        <nav class="workspace-tabs" aria-label="Workspace navigation">
                            ${workspaceNavHtml()}
                        </nav>
                        <div class="workspace-content">
                            ${innerHtml}
                        </div>
                    </main>
                    ${window.App.UI.footer(true)}`;

                const logoutBtn = container.querySelector('#workspace-logout');
                if (logoutBtn) logoutBtn.onclick = logout;
            } else {
                // In standalone public mode (/about, /terms, /privacy): centered single column without workspace sidebar
                container.innerHTML = `
                    <div class="flow-topbar">
                        <a class="brand-lockup" data-route="/" href="/">
                            <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                            <span><span class="brand-name">SmartCare</span><span class="brand-caption">Information</span></span>
                        </a>
                        <div class="flow-topbar-actions">
                            ${window.App.UI.topbarControls()}
                            <a class="back-link" data-route="${dashboardRoute}" href="${dashboardRoute}">${icon('arrow-left', 16)} ${state.isLogged ? 'Back to dashboard' : 'Back to home'}</a>
                        </div>
                    </div>
                    <main>
                        ${innerHtml}
                    </main>
                    ${window.App.UI.footer(state.isLogged)}`;
            }

            window.App.UI.bindTopbarControls(container);
            if (isWorkspace) {
                container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav(state.loggedRole || 'patient', state.route));
                window.App.UI.bindMobileBottomNav(container);
            }

            // Tab link interactions
            container.querySelectorAll('.info-tab-link, [data-page-link]').forEach(btn => {
                btn.onclick = e => {
                    e.preventDefault();
                    const target = btn.dataset.page || btn.dataset.pageLink;
                    if (target) {
                        page = target;
                        if (!isWorkspace) {
                            window.history.pushState({}, '', `/${target}`);
                            state.view = target;
                            state.route = `/${target}`;
                        } else {
                            const url = new URL(window.location.href);
                            url.searchParams.set('tab', target);
                            window.history.replaceState({}, '', url.toString());
                        }
                        render();
                    }
                };
            });

            if (window.lucide) window.lucide.createIcons();
        }

        render();
        return container;
    };
})();

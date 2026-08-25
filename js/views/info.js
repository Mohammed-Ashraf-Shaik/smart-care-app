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
                title: 'Next-generation digital queue access for patients and hospitals.',
                intro: 'SmartCare connects patients with nearby care centres in real time, organizes arrival times, and gives medical teams live queue telemetry to reduce crowding and wait times.',
                badges: [
                    { icon: 'clock-3', text: 'Live Queue Telemetry' },
                    { icon: 'map-pin', text: 'Location-Aware Discovery' },
                    { icon: 'shield-check', text: 'Zero Data Retention' },
                    { icon: 'heart-handshake', text: 'Community Donation Hub' }
                ],
                keypointTitle: 'Prototype & Demo Architecture',
                keypointText: 'SmartCare is a high-fidelity demonstration prototype. Location services, queue metrics, and care provider authentication are integrated with a simulated service layer for evaluation.',
                sections: [
                    { icon: 'stethoscope', heading: 'Care Discovery & Queue Access', text: 'Search nearby clinics and hospitals, compare live queue waiting times, and reserve a consultation slot without waiting in crowded physical lobbies.' },
                    { icon: 'layout-dashboard', heading: 'Provider & Hospital Workspace', text: 'Doctors and hospital triage desks get real-time patient queue metrics, room availability management, and structured handoff workflows.' },
                    { icon: 'heart-handshake', heading: 'Blood & Organ Donation Pool', text: 'An integrated regional network where patients and care centres can post and discover urgent blood supplies and pledged organ donor registries.' },
                    { icon: 'sparkles', heading: 'Triage-First Prioritization', text: 'Patients are automatically organized by clinical urgency (Red / Yellow / Green) and arrival sequence to ensure critical care cases are seen first.' }
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
                    { icon: 'file-text', text: 'Updated August 2026' }
                ],
                keypointTitle: 'Important User Responsibilities',
                keypointText: 'By using the SmartCare prototype, you agree not to enter sensitive medical records, protected health information (PHI), or real credentials.',
                sections: [
                    { icon: 'monitor', heading: 'Non-Emergency Simulation', text: 'SmartCare is a design and workflow prototype. Do not use this demo for life-threatening medical emergencies. Please call your local emergency services (e.g. 108 / 911 / 112) immediately.' },
                    { icon: 'key-round', heading: 'Account & Demo Authentication', text: 'Role-based accounts (Patient, Doctor, Staff) are provided for evaluation. Please use fictional demo credentials and do not submit sensitive personal identifiers.' },
                    { icon: 'map', heading: 'Location & Map Services', text: 'Geocoding and mapping features use public API services. Location queries are used solely in-memory to find nearby simulated hospital coordinates.' },
                    { icon: 'refresh-cw', heading: 'Continuous Improvements', text: 'System features, queue metrics, and simulated inventories may update dynamically as new capabilities are tested and refined.' }
                ]
            },
            privacy: {
                eyebrow: 'Privacy Notice & Data Security',
                icon: 'shield-check',
                title: 'Privacy by design. Minimal data, maximum security.',
                intro: 'SmartCare adheres to strict data minimization principles. We believe health technology prototypes should safeguard user privacy from day one.',
                badges: [
                    { icon: 'lock', text: 'Local-First Storage' },
                    { icon: 'eye-off', text: 'Zero Tracking Cookies' },
                    { icon: 'trash-2', text: 'Instant Session Reset' }
                ],
                keypointTitle: 'Your Data Privacy Rights',
                keypointText: 'You have full control over all data generated during your session. Logging out or clearing your browser storage instantly wipes all demo records from this device.',
                sections: [
                    { icon: 'database', heading: 'Data Handled in Demo', text: 'Only basic temporary inputs required to demonstrate queue reservations (e.g. mock name, age, symptom category, and selected care centre) are stored locally.' },
                    { icon: 'navigation', heading: 'Precise Location Privacy', text: 'Your browser location is requested only when you click "Use current location". It is never tracked in the background or shared with third parties.' },
                    { icon: 'hard-drive', heading: 'Local Storage Isolation', text: 'Your visit history, donor pledges, and draft forms are kept in your browser local storage. You can clear them at any time from your browser settings or by signing out.' },
                    { icon: 'mail', heading: 'Contact & Support Inquiries', text: 'For questions regarding privacy, demo data handling, or technical architecture, reach out to our team at support@smartcare.demo.' }
                ]
            }
        };

        const dashboardRoute = state.isLogged ? (state.loggedRole === 'patient' ? '/dashboard/patient' : state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin') : '/';

        function workspaceNavHtml() {
            const role = state.loggedRole;
            if (role === 'patient') {
                return `<a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a><a href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a><a href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a><div class="nav-divider"></div><a href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a><a class="active" href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
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

            const tabPills = `
                <div class="info-tab-nav" role="tablist" aria-label="Information sections">
                    <button type="button" class="info-tab-link ${page === 'about' ? 'active' : ''}" data-page="about">
                        ${icon('heart-pulse', 15)} About
                    </button>
                    <button type="button" class="info-tab-link ${page === 'terms' ? 'active' : ''}" data-page="terms">
                        ${icon('scroll-text', 15)} Terms
                    </button>
                    <button type="button" class="info-tab-link ${page === 'privacy' ? 'active' : ''}" data-page="privacy">
                        ${icon('shield-check', 15)} Privacy
                    </button>
                </div>
            `;

            const innerHtml = `
                <div class="info-layout section-info" data-section="${page}">
                    ${tabPills}
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

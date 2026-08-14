(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    window.App.Views.Info = function () {
        const { state } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';
        const page = state.infoPage || state.view;
        const content = {
            about: {
                eyebrow: 'About SmartCare',
                icon: 'heart-pulse',
                title: 'A clearer path into care.',
                intro: 'SmartCare is a digital queue access concept for patients and care teams. It helps people choose a nearby centre, share the right context, and arrive with a clearer expectation of the visit.',
                sections: [
                    { icon: 'lightbulb', heading: 'Why it exists', text: 'Waiting is not the same as care. SmartCare gives patients a simple way to see their options and gives teams a shared view of who needs attention next.' },
                    { icon: 'layers', heading: 'What we are building', text: 'The demo combines location-aware care discovery, queue visibility, provider workspaces, and accessible service patterns in one small system.' },
                    { icon: 'flask-conical', heading: 'Demo note', text: 'This workspace is a product prototype. Provider authentication and queue data are connected to the existing service layer for demonstration, not for production clinical use.' },
                ]
            },
            terms: {
                eyebrow: 'Terms and conditions',
                icon: 'scroll-text',
                title: 'Use SmartCare responsibly.',
                intro: 'These terms describe the expectations for this demonstration environment. They are intentionally plain so users know what the product is and is not.',
                sections: [
                    { icon: 'monitor', heading: 'Demo service', text: 'SmartCare is provided as a demonstration. Availability, queue estimates, map results, and charges may be incomplete or simulated. Do not use the demo as a substitute for medical advice or emergency response.' },
                    { icon: 'user-round', heading: 'Accounts', text: 'Provider demo accounts are for evaluation. Do not enter real patient records, passwords, or sensitive personal information.' },
                    { icon: 'map', heading: 'Third-party services', text: 'Map and location features may use public geocoding and map services. Their availability and terms apply when those services are used.' },
                    { icon: 'refresh-cw', heading: 'Changes', text: 'This prototype may change as the product is tested. The footer shows the last updated date for this environment.' },
                ]
            },
            privacy: {
                eyebrow: 'Privacy notice',
                icon: 'shield-check',
                title: 'Keep personal data out of the demo.',
                intro: 'SmartCare is designed with data minimization in mind. The safest data for this demo is fictional data.',
                sections: [
                    { icon: 'database', heading: 'What is used', text: 'The patient flow uses the details required to demonstrate a queue reservation: name, age, location, care centre, and visit reason.' },
                    { icon: 'map-pin', heading: 'Location', text: 'Current location is requested only after you choose the location action. It is used to find nearby centres and is not needed to browse the rest of the site.' },
                    { icon: 'settings-2', heading: 'Your control', text: 'Use fictional information while testing. To ask about demo data or request a reset, contact support@smartcare.demo.' },
                ]
            }
        }[page] || { eyebrow: 'SmartCare', icon: 'info', title: '', intro: '', sections: [] };

        const sectionCards = content.sections.map(s => `
            <div class="info-card">
                <div class="info-card-icon">${icon(s.icon, 18)}</div>
                <div>
                    <h2>${s.heading}</h2>
                    <p>${s.text}</p>
                </div>
            </div>`).join('');

        const dashboardRoute = state.isLogged ? (state.loggedRole === 'patient' ? '/dashboard/patient' : state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin') : '/';
        const workspaceNavHtml = state.isLogged ? (() => {
            const role = state.loggedRole;
            if (role === 'patient') return `<a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a><a href="/dashboard/patient/visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a><a href="/dashboard/patient/profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a><a class="active" href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
            if (role === 'doctor') return `<a href="/dashboard/doctor" data-route="/dashboard/doctor">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><a class="active" href="/dashboard/doctor/help" data-route="/dashboard/doctor/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
            return `<a href="/dashboard/admin" data-route="/dashboard/admin">${icon('layout-dashboard', 16)}<span>Operations</span></a><a href="/dashboard/admin/rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><a class="active" href="/dashboard/admin/help" data-route="/dashboard/admin/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        })() : '';

        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Information</span></span>
                </a>
                <a class="back-link" data-route="${dashboardRoute}" href="${dashboardRoute}">${icon('arrow-left', 16)} ${state.isLogged ? 'Back to dashboard' : 'Back to home'}</a>
            </div>
            <main class="info-layout section-info" data-section="${page}">
                <div class="info-hero">
                    <div class="info-hero-icon">${icon(content.icon, 28)}</div>
                    <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> ${content.eyebrow}</div>
                    <h1>${content.title}</h1>
                    <p class="info-intro">${content.intro}</p>
                </div>
                <div class="info-cards">${sectionCards}</div>
                <nav class="info-nav-links" aria-label="Information pages">
                    <a class="${page === 'about' ? 'active' : ''}" data-route="/about" href="/about">${icon('heart-pulse', 14)} About</a>
                    <a class="${page === 'terms' ? 'active' : ''}" data-route="/terms" href="/terms">${icon('scroll-text', 14)} Terms</a>
                    <a class="${page === 'privacy' ? 'active' : ''}" data-route="/privacy" href="/privacy">${icon('shield-check', 14)} Privacy</a>
                </nav>
            </main>
            ${window.App.UI.footer(state.isLogged)}`;

        if (state.isLogged) {
            container.className = 'flow-shell workspace-shell';
            const workspaceMain = container.querySelector('main');
            const workspaceNav = document.createElement('nav');
            workspaceNav.className = 'workspace-tabs';
            workspaceNav.setAttribute('aria-label', 'Workspace navigation');
            workspaceNav.innerHTML = workspaceNavHtml;
            const workspaceContent = document.createElement('div');
            workspaceContent.className = 'workspace-content';
            Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
            workspaceMain.append(workspaceNav, workspaceContent);
            container.querySelector('#workspace-logout').onclick = window.App.Store.logout;
        }
        return container;
    };
})();

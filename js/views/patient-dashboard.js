(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.PatientDashboard = function () {
        const { state, setView, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';
        const patientName = state.patientData.name || (state.loggedEmail || 'Patient').split('@')[0].replace(/[._-]/g, ' ');
        const latestVisit = state.patientVisits[0];
        const activeTab = state.activeTab || '';
        const isApplyTab = activeTab === 'apply';
        const showOverview = (activeTab === 'overview' || activeTab === '') && !isApplyTab;
        const showVisits = activeTab === 'visits';
        const showProfile = activeTab === 'profile';

        // Build visit rows HTML up front so it can be used in the template
        const visitRows = state.patientVisits.length
            ? state.patientVisits.map(visit => `<div class="patient-visit"><div class="visit-icon">${icon('calendar-check', 16)}</div><div class="visit-body"><strong>${esc(visit.hospital)}</strong><small>${esc(visit.reason || 'General consultation')} &middot; ${esc(visit.date)}</small></div><span class="visit-status">${esc(visit.status || 'Completed')}</span></div>`).join('')
            : `<div class="provider-empty">${icon('clipboard-x', 28)}<p>No visits saved yet.</p></div>`;

        container.innerHTML = `<div class="flow-topbar"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient portal</span></span></a><a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back to home</a></div><main class="provider-shell patient-shell" data-section="patient-dashboard"><header class="provider-header"><div><div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Patient dashboard</div><h1>Good to see you, ${esc(patientName)}.</h1><p>${isApplyTab ? 'Reserve your care visit step-by-step.' : 'Keep your care plans, previous visits, and next appointment in one place.'}</p></div><div class="provider-date">${state.patientVisits.length} saved visits<br><strong>Private demo history</strong></div></header>${isApplyTab ? `<div id="embedded-booking-mount"></div>` : ''}${showOverview ? `<section class="patient-next-action" aria-label="Next patient action"><div><span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next step</span><h2>Need care today?</h2><p>Search nearby centres, compare queues, and reserve a visit when it suits you.</p></div><a class="btn-primary btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" data-tab="apply">Book an appointment ${icon('arrow-right', 16)}</a></section><div class="provider-stats patient-stats" aria-label="Patient summary"><div class="provider-stat"><span>Previous visits</span><strong>${state.patientVisits.length}</strong><small>Stored on this device</small></div><div class="provider-stat"><span>Last visit</span><strong>${latestVisit ? esc(latestVisit.date.replace(' 2026', '')) : '—'}</strong><small>${latestVisit ? esc(latestVisit.hospital) : 'No history yet'}</small></div><div class="provider-stat"><span>Care preference</span><strong>${esc(state.patientData.doctorPref || 'General')}</strong><small>Can change during booking</small></div><div class="provider-stat"><span>Location</span><strong>${esc(state.patientData.city || 'Hyderabad')}</strong><small>Used only for care search</small></div></div>` : ''}${showVisits ? `<section id="tab-visits" data-tab-panel="visits" class="provider-card patient-visits-card"><div class="provider-card-heading"><div><h2>Previous visits</h2><p>A simple record of your recent SmartCare reservations.</p></div><a class="text-link text-link-dark btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" data-tab="apply">Book again ${icon('arrow-up-right', 15)}</a></div><div class="patient-visit-list">${visitRows}</div></section>` : ''}${showProfile ? `<section id="tab-profile" data-tab-panel="profile" class="provider-card patient-profile-card"><div class="provider-card-heading"><div><h2>Your care profile</h2><p>These details help us prefill your next booking.</p></div><a class="btn-secondary btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" data-tab="apply">Update during booking ${icon('arrow-right', 15)}</a></div><div class="summary-row"><span>Preferred care</span><strong>${esc(state.patientData.doctorPref || 'Not set')}</strong></div><div class="summary-row"><span>Search area</span><strong>${esc(state.patientData.city || 'Hyderabad')}</strong></div></section>` : ''}</main>${window.App.UI.footer(true)}`;

        const workspaceMain = container.querySelector('main');
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Patient portal navigation');
        workspaceNav.innerHTML = `<a class="${activeTab === 'overview' || activeTab === '' ? 'active' : ''}" href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a><a class="${isApplyTab ? 'active' : ''}" href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a><a class="${activeTab === 'visits' ? 'active' : ''}" href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a><a class="${activeTab === 'profile' ? 'active' : ''}" href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a><a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);
        if (isApplyTab && window.App.Views.Patient) {
            const mount = workspaceContent.querySelector('#embedded-booking-mount');
            if (mount) mount.appendChild(window.App.Views.Patient(true));
        }
        container.querySelector('#workspace-logout').onclick = logout;
        return container;
    };
})();

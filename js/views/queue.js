(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Queue = function () {
        const { state, updateQueue, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const overviewRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin';
        const overviewLabel = state.loggedRole === 'doctor' ? 'Overview' : 'Operations';
        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : 'priority-green';
        const rows = state.queue.map((patient, index) => `<tr><td><strong>${index + 1}. ${esc(patient.name || 'Patient')}</strong><small>${esc(patient.age || '—')} years · ${esc(patient.gender || 'Not specified')}</small></td><td>${esc(patient.problem || patient.symptoms || 'General consultation')}</td><td><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Green')}</span></td><td>${esc(patient.hospital || state.loggedHospital || 'Care centre')}<small>${esc(patient.city || state.loggedCity || 'Location pending')}</small></td></tr>`).join('');

        container.innerHTML = `<div class="flow-topbar"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient queue</span></span></a><a class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">${icon('arrow-left', 16)} ${overviewLabel}</a></div><main class="provider-shell section-dashboard" data-section="queue-dashboard"><header class="provider-header"><div><div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Shared queue</div><h1>See every patient handoff.</h1><p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p></div><div class="provider-date">Live queue<br><strong>${state.queue.length} waiting now</strong></div></header><div class="provider-stats" aria-label="Patient queue summary"><div class="provider-stat"><span>Waiting now</span><strong>${state.queue.length}</strong><small>Live queue count</small></div><div class="provider-stat"><span>Priority cases</span><strong>${state.queue.filter(patient => patient.triage === 'Red').length}</strong><small>Needs attention first</small></div><div class="provider-stat"><span>Average wait</span><strong>18m</strong><small>Today at this centre</small></div><div class="provider-stat"><span>Queue state</span><strong>${state.queue.length ? 'Open' : 'Clear'}</strong><small>Ready for new visits</small></div></div><section class="provider-card queue-page-card"><div class="provider-card-heading"><div><h2>Patient queue</h2><p>Prioritised by arrival time and triage level. Use this page when the queue itself is the work.</p></div><button id="queue-refresh" class="btn-secondary btn-icon" type="button">${icon('refresh-cw', 16)} Refresh queue</button></div>${state.queue.length ? `<div class="queue-table-wrap"><table class="queue-table"><thead><tr><th>Patient</th><th>Reason for visit</th><th>Priority</th><th>Centre</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="provider-empty">${icon('inbox', 30)}<p>No patients are waiting right now.</p><a class="btn-primary btn-icon" data-route="/apply" href="/apply">Preview patient flow ${icon('arrow-right', 16)}</a></div>`}</section></main>${window.App.UI.footer(true)}`;

        const workspaceMain = container.querySelector('main');
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Care workspace navigation');
        workspaceNav.innerHTML = `<a href="${overviewRoute}" data-route="${overviewRoute}">${icon('layout-dashboard', 16)}<span>${overviewLabel}</span></a><a class="active" href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><a href="/apply" data-route="/apply">${icon('user-round', 16)}<span>Patient flow</span></a><button type="button" id="workspace-logout">${icon('log-out', 16)}<span>Sign out</span></button>`;
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);
        container.querySelector('#workspace-logout').onclick = logout;
        container.querySelector('#queue-refresh').onclick = () => window.App.DB.fetchQueue().then(updateQueue).catch(() => {});
        return container;
    };
})();

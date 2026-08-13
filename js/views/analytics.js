(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
    window.App.Views.Analytics = function () {
        const { state, setView, getQueueMetrics, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const metrics = getQueueMetrics();
        const bars = state.queue.length ? state.queue.map(patient => Math.min(100, 35 + (patient.triage === 'Red' ? 55 : patient.triage === 'Yellow' ? 35 : 15))).slice(0, 8) : [22, 34, 28, 48, 41, 56, 38, 45];
        while (bars.length < 8) bars.push(24 + bars.length * 4);
        const activeTab = state.activeTab || '';
        const overviewRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin';
        const overviewLabel = state.loggedRole === 'doctor' ? 'Overview' : 'Operations';
        container.innerHTML = `<div class="flow-topbar"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Analytics workspace</span></span></a><a id="analytics-back" class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">${icon('arrow-left', 16)} ${overviewLabel}</a></div><main class="provider-shell section-dashboard" data-section="analytics-dashboard"><header class="provider-header"><div><div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Performance analytics</div><h1>See where care slows down.</h1><p>${esc(state.loggedHospital || 'SmartCare network')} · Live operational data</p></div><div class="provider-date">${icon('calendar-days', 14)} Today<br><strong>Refreshes with the queue</strong></div></header><div class="provider-stats"><div class="provider-stat"><span>Waiting now</span><strong>${metrics.waiting}</strong><small>Current active visits</small></div><div class="provider-stat"><span>Average wait</span><strong>${metrics.averageWait}m</strong><small>Based on arrival time</small></div><div class="provider-stat"><span>Priority queue</span><strong>${metrics.priority}</strong><small>Red-priority cases</small></div><div class="provider-stat"><span>Queue value</span><strong>₹${metrics.revenue}</strong><small>Current active visits</small></div></div><div class="provider-grid"><section id="tab-volume" data-tab-panel="volume" class="provider-card" data-section="analytics-volume"><div class="provider-card-heading"><div><h2>Queue activity</h2><p>Use the shape of the queue to plan rooms and staff.</p></div></div><div class="chart-bars" role="img" aria-label="Chart showing queue activity">${bars.map((height, index) => `<div class="chart-column"><div class="chart-bar" style="height:${height}%" title="${height}% activity"></div><small>${8 + index}:00</small></div>`).join('')}</div></section><section id="tab-signals" data-tab-panel="signals" class="provider-card" data-section="analytics-signals"><div class="provider-card-heading"><div><h2>Signals</h2><p>Operational indicators from the live queue.</p></div></div><div class="summary-row"><span>Priority cases</span><strong>${metrics.priority} open</strong></div><div class="summary-row"><span>Most requested</span><strong>${esc(state.queue[0]?.problem || 'General consultation')}</strong></div><div class="summary-row"><span>Queue health</span><strong>${metrics.waiting < 6 ? 'Within target' : 'Needs attention'}</strong></div><a class="btn-secondary btn-wide btn-icon" data-route="${overviewRoute}" href="${overviewRoute}" style="margin-top:1rem">Back to operations ${icon('arrow-right', 16)}</a></section></div></main>${window.App.UI.footer(true)}`;
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Analytics workspace navigation');
        const helpRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/help' : '/dashboard/admin/help';
        workspaceNav.innerHTML = `<a href="${overviewRoute}" data-route="${overviewRoute}">${icon('layout-dashboard', 16)}<span>${overviewLabel}</span></a>${isStaff ? `<a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a>` : ''}<a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a class="active" href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        const workspaceMain = container.querySelector('main');
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);
        container.querySelector('#workspace-logout').onclick = logout;
        container.querySelector('#analytics-back').onclick = event => { event.preventDefault(); setView(state.loggedRole === 'doctor' ? 'doctor' : 'staff'); };
        return container;
    };
})();

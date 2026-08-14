(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
    window.App.Views.Queue = function () {
        const { state, updateQueue, getQueueMetrics, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const overviewRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin';
        const overviewLabel = state.loggedRole === 'doctor' ? 'Overview' : 'Operations';
        const metrics = getQueueMetrics();
        const isStaff = state.loggedRole === 'staff';
        container.innerHTML = `<div class="flow-topbar"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient queue</span></span></a><a class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">${icon('arrow-left', 16)} ${overviewLabel}</a></div><main class="provider-shell section-dashboard" data-section="queue-dashboard"><header class="provider-header"><div><div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Shared queue</div><h1>See every patient handoff.</h1><p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p></div><div class="provider-date">Live queue<br><strong>${metrics.waiting} waiting now</strong></div></header><div class="provider-stats" aria-label="Patient queue summary"><div class="provider-stat"><span>Waiting now</span><strong>${metrics.waiting}</strong><small>Live queue count</small></div><div class="provider-stat"><span>Priority cases</span><strong>${metrics.priority}</strong><small>Needs attention first</small></div><div class="provider-stat"><span>Average wait</span><strong>${metrics.averageWait}m</strong><small>Based on arrival time</small></div><div class="provider-stat"><span>Queue state</span><strong>${metrics.waiting ? 'Open' : 'Clear'}</strong><small>Ready for new visits</small></div></div><section class="provider-card queue-page-card"><div class="provider-card-heading"><div><h2>Patient queue</h2><p>Search by patient, reason, centre, or priority.</p></div><button id="queue-refresh" class="btn-secondary btn-icon" type="button">${icon('refresh-cw', 16)} Refresh queue</button></div><div class="queue-tools"><label class="field queue-search"><span>Search queue</span><input id="queue-search" type="search" placeholder="Name, reason, or centre"></label><label class="field queue-filter"><span>Priority</span><select id="queue-filter"><option value="all">All priorities</option><option value="Red">Red</option><option value="Yellow">Yellow</option><option value="Green">Green</option></select></label></div><div id="queue-table-region"></div></section></main>${window.App.UI.footer(true)}`;
        const workspaceMain = container.querySelector('main');
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Care workspace navigation');
        const helpRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/help' : '/dashboard/admin/help';
        workspaceNav.innerHTML = `<a href="${overviewRoute}" data-route="${overviewRoute}">${icon('layout-dashboard', 16)}<span>${overviewLabel}</span></a>${isStaff ? `<a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a>` : ''}<a class="active" href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);
        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : 'priority-green';
        const renderRows = () => {
            const query = container.querySelector('#queue-search').value.trim().toLowerCase();
            const priority = container.querySelector('#queue-filter').value;
            const filtered = state.queue.filter(patient => { const text = `${patient.name || ''} ${patient.problem || patient.symptoms || ''} ${patient.hospital || ''}`.toLowerCase(); return (!query || text.includes(query)) && (priority === 'all' || patient.triage === priority); });
            const region = container.querySelector('#queue-table-region');
            if (!filtered.length) { region.innerHTML = `<div class="provider-empty">${icon('inbox', 30)}<p>No queue entries match those filters.</p><a class="btn-primary btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Preview patient flow ${icon('arrow-right', 16)}</a></div>`; return; }
            region.innerHTML = `<div class="queue-table-wrap"><table class="queue-table"><thead><tr><th>Patient</th><th>Reason for visit</th><th>Priority</th><th>Centre</th><th>Action</th></tr></thead><tbody>${filtered.map((patient, index) => `<tr><td><strong>${index + 1}. ${esc(patient.name || 'Patient')}</strong><small>${esc(patient.age || '—')} years · ${esc(patient.gender || 'Not specified')}</small></td><td>${esc(patient.problem || patient.symptoms || 'General consultation')}</td><td><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Green')}</span></td><td>${esc(patient.hospital || state.loggedHospital || 'Care centre')}<small>${esc(patient.city || state.loggedCity || 'Location pending')}</small></td><td><button class="text-link queue-action" type="button" data-action="call" data-id="${esc(patient.id)}">Call next</button><button class="text-link queue-action" type="button" data-action="complete" data-id="${esc(patient.id)}">Complete</button></td></tr>`).join('')}</tbody></table></div>`;
            region.querySelectorAll('.queue-action').forEach(button => button.onclick = async () => { const patient = state.queue.find(item => String(item.id) === String(button.dataset.id)); if (!patient) return; if (button.dataset.action === 'call') { window.App.UI.toast(`${patient.name || 'Patient'} is next for consultation.`, 'info'); return; } button.disabled = true; try { await window.App.DB.updatePatient(patient.id, { status: 'completed' }); const fresh = await window.App.DB.fetchQueue(); updateQueue(fresh); renderRows(); window.App.UI.toast('Visit marked complete.', 'success'); } catch { button.disabled = false; window.App.UI.toast('The visit could not be updated. Try again.', 'error'); } });
            if (window.lucide) window.lucide.createIcons();
        };
        container.querySelector('#workspace-logout').onclick = logout;
        container.querySelector('#queue-refresh').onclick = () => window.App.DB.fetchQueue().then(queue => { updateQueue(queue); renderRows(); window.App.UI.toast('Queue refreshed.', 'success'); }).catch(() => window.App.UI.toast('Queue refresh is unavailable.', 'error'));
        container.querySelector('#queue-search').oninput = renderRows;
        container.querySelector('#queue-filter').onchange = renderRows;
        renderRows();
        return container;
    };
})();

(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Queue = function () {
        const { state, updateQueue, getQueueMetrics, sortQueue, transitionPatient, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const overviewRoute = state.loggedRole === 'doctor' ? '/dashboard/hospital' : '/dashboard/admin';
        const overviewLabel = state.loggedRole === 'doctor' ? 'Overview' : 'Operations';
        const metrics = getQueueMetrics();
        const isStaff = state.loggedRole === 'staff';

        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient queue</span></span>
                </a>
                <div class="flow-topbar-actions">
                    ${window.App.UI.topbarControls(true)}
                    <a class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">
                        ${icon('arrow-left', 16)} ${overviewLabel}
                    </a>
                </div>
            </div>
            <main class="provider-shell section-dashboard" data-section="queue-dashboard">
                <header class="provider-header">
                    <div>
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Shared queue</div>
                        <h1>See every patient handoff.</h1>
                        <p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p>
                    </div>
                    <div class="provider-date">Live queue<br><strong>${metrics.waiting} waiting now</strong></div>
                </header>
                <div class="provider-stats" aria-label="Patient queue summary">
                    <div class="provider-stat"><span>Waiting now</span><strong>${metrics.waiting}</strong><small>Live queue count</small></div>
                    <div class="provider-stat"><span>Priority cases</span><strong>${metrics.priority}</strong><small>Needs attention first</small></div>
                    <div class="provider-stat"><span>Average wait</span><strong>${metrics.averageWait}m</strong><small>Based on arrival time</small></div>
                    <div class="provider-stat"><span>Queue state</span><strong>${metrics.waiting ? 'Open' : 'Clear'}</strong><small>Ready for new visits</small></div>
                </div>
                <section class="provider-card queue-page-card">
                    <div class="provider-card-heading">
                        <div>
                            <h2>Patient queue</h2>
                            <p>Search by patient, reason, centre, or priority.</p>
                        </div>
                        <button id="queue-refresh" class="btn-secondary btn-icon" type="button">
                            ${icon('refresh-cw', 16)} Refresh queue
                        </button>
                    </div>
                    <div class="queue-tools">
                        <button id="scan-qr-btn" class="btn-secondary btn-icon" type="button" style="align-self:flex-end">
                            ${icon('qr-code', 16)} Scan QR Ticket
                        </button>
                        <label class="field queue-search">
                            <span>Search queue</span>
                            <input id="queue-search" type="search" placeholder="Name, reason, or centre">
                        </label>
                        <label class="field queue-filter">
                            <span>Priority</span>
                            <select id="queue-filter">
                                <option value="all">All priorities</option>
                                <option value="Red">Red</option>
                                <option value="Yellow">Yellow</option>
                                <option value="Green">Green</option>
                            </select>
                        </label>
                    </div>
                    <div id="queue-table-region"></div>
                </section>
            </main>
            ${window.App.UI.footer(true)}
        `;

        const queueHeaderCount = container.querySelector('.provider-date strong');
        if (queueHeaderCount) queueHeaderCount.textContent = `${metrics.waitingOnly} waiting now`;
        const queueStats = container.querySelectorAll('.provider-stat strong');
        if (queueStats[0]) queueStats[0].textContent = metrics.waitingOnly;

        const workspaceMain = container.querySelector('main');
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Care workspace navigation');
        const helpRoute = state.loggedRole === 'doctor' ? '/dashboard/hospital/help' : '/dashboard/admin/help';
        const donRoute = state.loggedRole === 'doctor' ? '/dashboard/hospital/donations' : '/dashboard/admin/donations';

        workspaceNav.innerHTML = `
            <a href="${overviewRoute}" data-route="${overviewRoute}">${icon('layout-dashboard', 16)}<span>${overviewLabel}</span></a>
            ${isStaff ? `<a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a>` : ''}
            <a class="active" href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a>
            <a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a>
            <div class="nav-divider"></div>
            <a href="${donRoute}" data-route="${donRoute}">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a>
            <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
        `;

        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);

        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : value === 'Green' ? 'priority-green' : 'priority-neutral';
        const statusLabel = value => ({ waiting: 'Waiting', called: 'Called', in_progress: 'In consultation', completed: 'Completed' }[String(value || 'waiting').toLowerCase()] || 'Active');
        const statusClass = value => `queue-status-${String(value || 'waiting').toLowerCase().replace('_', '-')}`;
        const nextAction = patient => ({ waiting: ['called', 'Call next'], called: ['in_progress', 'Start visit'], in_progress: ['completed', 'Complete'] }[String(patient.status || 'waiting').toLowerCase()] || [null, 'Updated']);

        const renderRows = () => {
            const query = container.querySelector('#queue-search').value.trim().toLowerCase();
            const priority = container.querySelector('#queue-filter').value;
            const filtered = sortQueue(state.queue.filter(patient => {
                const text = `${patient.name || ''} ${patient.problem || patient.symptoms || ''} ${patient.hospital || ''}`.toLowerCase();
                return (!query || text.includes(query)) && (priority === 'all' || patient.triage === priority);
            }));

            const region = container.querySelector('#queue-table-region');
            if (!filtered.length) {
                region.innerHTML = `
                    <div class="provider-empty">
                        ${icon('inbox', 30)}
                        <p>No queue entries match those filters.</p>
                        <a class="btn-primary btn-icon" data-route="${overviewRoute}" href="${overviewRoute}">
                            ${isStaff ? 'Register a walk-in' : 'Return to overview'} ${icon('arrow-right', 16)}
                        </a>
                    </div>
                `;
                return;
            }

            region.innerHTML = `
                <div class="queue-table-wrap">
                    <table class="queue-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Reason for visit</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Clinician queue</th>
                                <th>Centre</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map((patient, index) => {
                                const [action, label] = nextAction(patient);
                                return `
                                    <tr>
                                        <td data-label="Patient"><span class="queue-cell-content"><strong>${index + 1}. ${esc(patient.name || 'Patient')}</strong><small>${esc(patient.age || '—')} years · ${esc(patient.gender || 'Not specified')}</small></span></td>
                                        <td data-label="Reason"><span class="queue-cell-content">${esc(patient.problem || patient.symptoms || 'General consultation')}</span></td>
                                        <td data-label="Priority"><span class="queue-cell-content"><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Unassessed')}</span></span></td>
                                        <td data-label="Status"><span class="queue-cell-content"><span class="queue-status ${statusClass(patient.status)}">${statusLabel(patient.status)}</span></span></td>
                                        <td data-label="Clinician"><span class="queue-cell-content">${esc(patient.doctorName || patient.doctor_name || patient.doctorPref || patient.doctor_pref || 'General care')}</span></td>
                                        <td data-label="Centre"><span class="queue-cell-content">${esc(patient.hospital || state.loggedHospital || 'Care centre')}<small>${esc(patient.city || state.loggedCity || 'Location pending')}</small></span></td>
                                        <td data-label="Action"><span class="queue-cell-content">${action ? `<button class="text-link queue-action" type="button" data-action="${action}" data-id="${esc(patient.id)}">${label}</button>` : `<span class="queue-status">${label}</span>`}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            region.querySelectorAll('.queue-action').forEach(button => button.onclick = async () => {
                const patient = state.queue.find(item => String(item.id) === String(button.dataset.id));
                if (!patient) return;
                button.disabled = true;
                const result = await transitionPatient(patient.id, button.dataset.action);
                if (!result.success) {
                    button.disabled = false;
                    window.App.UI.toast(result.error, 'error');
                    return;
                }
                window.App.UI.toast(`${patient.name || 'Patient'} is now ${statusLabel(button.dataset.action)}.`, 'success');
            });

            if (window.lucide) window.lucide.createIcons();
        };

        container.querySelector('#workspace-logout').onclick = logout;
        container.querySelector('#queue-refresh').onclick = () => window.App.DB.fetchQueue().then(queue => {
            updateQueue(queue);
            renderRows();
            window.App.UI.toast('Queue refreshed.', 'success');
        }).catch(() => window.App.UI.toast('Queue refresh is unavailable.', 'error'));

        const scanBtn = container.querySelector('#scan-qr-btn');
        if (scanBtn) {
            scanBtn.onclick = () => {
                window.App.UI.showQRScannerModal(async (code) => {
                    const passport = window.App.Store.getMedicalPassport(code);
                    if (passport) {
                        window.App.UI.showMedicalPassportModal(passport);
                        window.App.UI.toast(`Opened ${passport.profile.name}'s read-only Medical History.`, 'success');
                        return;
                    }
                    const match = state.queue.find(p => String(p.id) === String(code) || String(p.reference || '').toUpperCase() === String(code).toUpperCase());
                    if (match) {
                        const targetStatus = match.status === 'called' ? 'in_progress' : 'called';
                        const res = await transitionPatient(match.id, targetStatus);
                        if (res.success) {
                            window.App.UI.toast(`Checked in ${match.name}. Status: ${statusLabel(targetStatus)}`, 'success');
                        } else {
                            window.App.UI.toast(res.error || `Checked in ${match.name}`, 'info');
                        }
                    } else {
                        window.App.UI.toast(`No active queue entry matches ticket ${code}.`, 'error');
                    }
                    window.App.DB.fetchQueue().then(queue => { updateQueue(queue); renderRows(); }).catch(() => {});
                });
            };
        }

        container.querySelector('#queue-search').oninput = renderRows;
        container.querySelector('#queue-filter').onchange = renderRows;
        renderRows();

        window.App.UI.bindTopbarControls(container);
        if (state.isLogged) {
            window.App.UI.syncMobileBottomNav(state.loggedRole, state.route);
        } else {
            document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
        }
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

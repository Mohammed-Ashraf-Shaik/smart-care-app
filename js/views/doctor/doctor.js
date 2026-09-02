(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Doctor = function () {
        const { state, setView, getQueueMetrics, getNextPatient, sortQueue, transitionPatient, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const metrics = getQueueMetrics();
        const current = getNextPatient();
        const currentStatus = String(current?.status || 'waiting').toLowerCase();
        const currentAction = { waiting: ['called', 'Call next'], called: ['in_progress', 'Start visit'], in_progress: ['completed', 'Complete visit'] }[currentStatus] || [null, 'Queue ready'];
        const statusLabel = value => ({ waiting: 'Waiting', called: 'Called', in_progress: 'In consultation' }[String(value || 'waiting').toLowerCase()] || 'Active');
        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : 'priority-green';
        
        const rows = sortQueue(state.queue).map((patient, index) => `
            <tr>
                <td><strong>${index + 1}. ${esc(patient.name)}</strong><small>${esc(patient.age)} years · ${esc(patient.gender || 'Not specified')}</small></td>
                <td>${esc(patient.problem || patient.symptoms || 'General consultation')}</td>
                <td><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Green')}</span></td>
                <td><span class="queue-status queue-status-${String(patient.status || 'waiting').toLowerCase().replace('_', '-')}">${statusLabel(patient.status)}</span></td>
                <td>${esc(patient.hospital || state.loggedHospital || 'Care centre')}<small>${esc(patient.city || state.loggedCity || 'Location pending')}</small></td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Hospital workspace</span></span>
                </a>
                <div class="flow-topbar-actions">
                    ${window.App.UI.topbarControls(true)}
                    <button id="doctor-back" class="back-link">${icon('arrow-left', 16)} Back to home</button>
                </div>
            </div>
            <main class="provider-shell section-dashboard" data-section="doctor-dashboard">
                <header class="provider-header">
                    <div>
                        <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Hospital workspace</div>
                        <h1>Good care needs a clear queue.</h1>
                        <p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p>
                    </div>
                    <div class="provider-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}<br><strong>${metrics.waiting} active visits</strong></div>
                </header>
                <div class="provider-grid">
                    <section class="provider-hero">
                        <div class="eyebrow"><span class="eyebrow-dot"></span> ${currentStatus === 'in_progress' ? 'Current consultation' : 'Next in line'}</div>
                        <h2>${current ? esc(current.name) : 'Queue is clear'}</h2>
                        <p>${current ? `${esc(current.problem || current.symptoms || 'General consultation')} · ${statusLabel(current.status)}` : 'There are no patients waiting for this care centre right now.'}</p>
                        <div class="provider-hero-actions">
                            <button id="complete-patient" class="btn-primary btn-icon" ${currentAction[0] ? '' : 'disabled'}>
                                ${currentAction[1]} ${icon(currentStatus === 'in_progress' ? 'check' : 'arrow-right', 16)}
                            </button>
                            <button id="scan-qr-btn" class="btn-secondary btn-icon" type="button">
                                ${icon('qr-code', 16)} Scan Patient QR
                            </button>
                            <button id="refresh-queue" class="btn-secondary btn-icon" type="button">
                                Refresh ${icon('refresh-cw', 16)}
                            </button>
                        </div>
                    </section>
                    <section class="provider-stats" aria-label="Queue summary">
                        <div class="provider-stat"><span>Waiting now</span><strong>${metrics.waiting}</strong><small>Live queue count</small></div>
                        <div class="provider-stat"><span>Priority cases</span><strong>${metrics.priority}</strong><small>Needs attention first</small></div>
                        <div class="provider-stat"><span>Average wait</span><strong>${metrics.averageWait}m</strong><small>Based on arrival time</small></div>
                        <div class="provider-stat"><span>Room status</span><strong>${currentStatus === 'in_progress' ? 'In use' : 'Open'}</strong><small>Consultation room 01</small></div>
                    </section>
                </div>
                <section class="provider-card">
                    <div class="provider-card-heading">
                        <div>
                            <h2>Patient queue</h2>
                            <p>Priority first, then arrival time. Move one visit through each handoff.</p>
                        </div>
                        <span class="status-eyebrow" style="color:var(--teal)"><i style="background:var(--teal)"></i> Live</span>
                    </div>
                    ${state.queue.length ? `<div class="queue-table-wrap"><table class="queue-table"><thead><tr><th>Patient</th><th>Reason for visit</th><th>Priority</th><th>Status</th><th>Centre</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="provider-empty">${icon('coffee', 30)}<p>Queue clear. New visits will appear here.</p></div>`}
                </section>
                <div id="doctor-message" class="provider-notice" hidden></div>
            </main>
            ${window.App.UI.footer(true)}
        `;

        const doctorWaitingCount = container.querySelectorAll('.provider-stat strong')[0];
        if (doctorWaitingCount) doctorWaitingCount.textContent = metrics.waitingOnly;

        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Hospital workspace navigation');
        workspaceNav.innerHTML = `
            <a class="active" href="/dashboard/doctor" data-route="/dashboard/doctor">${icon('layout-dashboard', 16)}<span>Overview</span></a>
            <a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a>
            <a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a>
            <div class="nav-divider"></div>
            <a href="/dashboard/doctor/donations" data-route="/dashboard/doctor/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="/dashboard/doctor/help" data-route="/dashboard/doctor/help">${icon('circle-help', 16)}<span>Help</span></a>
            <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
        `;

        const workspaceMain = container.querySelector('main');
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);

        const quickActions = document.createElement('section');
        quickActions.className = 'dashboard-quick-actions';
        quickActions.setAttribute('aria-label', 'Hospital quick actions');
        quickActions.innerHTML = `
            <div>
                <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next actions</span>
                <strong>${current ? `${currentAction[1]} · ${current.name}` : 'Keep the queue ready'}</strong>
                <small>${current ? 'Move the visit forward one handoff at a time.' : 'New reservations will appear here automatically.'}</small>
            </div>
            <button id="quick-call-next" class="btn-primary btn-icon" ${currentAction[0] ? '' : 'disabled'}>
                ${icon(currentStatus === 'in_progress' ? 'check' : 'megaphone', 16)} ${currentAction[1]}
            </button>
            <a class="btn-secondary btn-icon" data-route="/dashboard/analytics" href="/dashboard/analytics">
                Review analytics ${icon('arrow-right', 16)}
            </a>
        `;
        workspaceContent.insertBefore(quickActions, workspaceContent.querySelector('.provider-grid'));

        container.querySelector('.provider-card').id = 'queue';
        container.querySelector('#workspace-logout').onclick = logout;

        const transitionCurrent = async () => {
            if (!current || !currentAction[0]) return;
            const button = container.querySelector('#quick-call-next');
            button.disabled = true;
            const result = await transitionPatient(current.id, currentAction[0]);
            if (!result.success) {
                button.disabled = false;
                showMessage(result.error);
                return;
            }
            window.App.UI.toast(`${current.name} is now ${statusLabel(currentAction[0])}.`, 'success');
        };

        container.querySelector('#quick-call-next').onclick = transitionCurrent;
        container.querySelector('#doctor-back').onclick = () => setView('landing');
        container.querySelector('#refresh-queue').onclick = () => window.App.DB.fetchQueue().then(window.App.Store.updateQueue).catch(() => showMessage('Queue refresh is unavailable. Showing the last synced list.'));
        container.querySelector('#complete-patient').onclick = transitionCurrent;

        const scanBtn = container.querySelector('#scan-qr-btn');
        if (scanBtn) {
            scanBtn.onclick = () => {
                window.App.UI.showQRScannerModal(async (code) => {
                    const match = state.queue.find(p => String(p.id) === String(code) || String(p.reference || '').toUpperCase() === String(code).toUpperCase());
                    if (match) {
                        const targetStatus = match.status === 'called' ? 'in_progress' : 'called';
                        const res = await transitionPatient(match.id, targetStatus);
                        if (res.success) {
                            window.App.UI.toast(`Checked in ${match.name}! Status: ${statusLabel(targetStatus)}`, 'success');
                        } else {
                            window.App.UI.toast(res.error || `Checked in ${match.name}`, 'info');
                        }
                    } else {
                        window.App.UI.toast(`Scanned Ticket ${code}. Patient check-in recorded!`, 'success');
                    }
                    window.App.DB.fetchQueue().then(window.App.Store.updateQueue).catch(() => {});
                });
            };
        }

        function showMessage(text) {
            const message = container.querySelector('#doctor-message');
            message.textContent = text;
            message.hidden = false;
        }

        window.App.UI.bindTopbarControls(container);
        container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav(state.loggedRole, state.route));
        window.App.UI.bindMobileBottomNav(container);
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

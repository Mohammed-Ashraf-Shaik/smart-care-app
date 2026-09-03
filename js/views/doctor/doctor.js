(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    function showPrescriptionEditor(visit) {
        if (!visit) return;
        document.getElementById('prescription-editor-container')?.remove();
        const previousFocus = document.activeElement;
        const existing = window.App.Store.getPrescription(visit.id) || {};
        const medicine = existing.medicines?.[0] || {};
        const providerName = window.App.Store.state.loggedEmail === 'hospital@smartcare.demo'
            ? 'Dr Meera Shah'
            : 'SmartCare care provider';
        const backdrop = document.createElement('div');
        backdrop.id = 'prescription-editor-container';
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="prescription-modal" role="dialog" aria-modal="true" aria-labelledby="prescription-editor-title">
                <div class="prescription-modal-header">
                    <div>
                        <h3 id="prescription-editor-title">${icon('notebook-pen', 18)} Clinical note &amp; demo e-prescription</h3>
                        <small>Saved only in this browser for the SmartCare prototype.</small>
                    </div>
                    <button type="button" class="btn-ghost modal-close-button" data-close-editor aria-label="Close prescription editor">${icon('x', 18)}</button>
                </div>
                <form id="prescription-editor-form">
                    <div class="prescription-modal-body">
                        <div class="modal-section-card">
                            <strong>${esc(visit.name)}</strong>
                            <p>${esc(visit.problem || visit.symptoms || 'General consultation')} · Visit ${esc(visit.reference || visit.id)}</p>
                        </div>
                        <div class="form-grid" style="margin-top:1rem">
                            <label class="field span-2">
                                <span>Clinical assessment <em>*</em></span>
                                <textarea name="assessment" rows="3" required placeholder="Record the assessment made during this consultation">${esc(existing.assessment || '')}</textarea>
                            </label>
                            <label class="field">
                                <span>Medicine name <small>(optional)</small></span>
                                <input name="medicineName" value="${esc(medicine.name || '')}" placeholder="e.g. Paracetamol">
                            </label>
                            <label class="field">
                                <span>Strength</span>
                                <input name="strength" value="${esc(medicine.strength || '')}" placeholder="e.g. 500 mg">
                            </label>
                            <label class="field">
                                <span>Dosage</span>
                                <input name="dosage" value="${esc(medicine.dosage || '')}" placeholder="e.g. One tablet when needed">
                            </label>
                            <label class="field">
                                <span>Duration</span>
                                <input name="duration" value="${esc(medicine.duration || '')}" placeholder="e.g. Up to 3 days">
                            </label>
                            <label class="field span-2">
                                <span>Medicine instructions</span>
                                <input name="instructions" value="${esc(medicine.instructions || '')}" placeholder="Food, timing, or safety guidance">
                            </label>
                            <label class="field span-2">
                                <span>Lab summary or follow-up notes <small>(optional)</small></span>
                                <textarea name="labSummary" rows="2" placeholder="Only include results or advice actually recorded">${esc(existing.labSummary || '')}</textarea>
                            </label>
                        </div>
                        <p class="form-helper" id="prescription-editor-status" role="status">Leave medicine name blank when no medication is prescribed.</p>
                    </div>
                    <div class="prescription-modal-actions">
                        <button type="button" class="btn-secondary" data-close-editor>Cancel</button>
                        <button type="submit" class="btn-primary btn-icon">${icon('save', 16)} Save demo record</button>
                    </div>
                </form>
            </div>`;
        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();

        const close = () => {
            backdrop.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
        };
        backdrop.querySelectorAll('[data-close-editor]').forEach(button => { button.onclick = close; });
        backdrop.onclick = event => { if (event.target === backdrop) close(); };
        backdrop.onkeydown = event => { if (event.key === 'Escape') close(); };
        backdrop.querySelector('textarea[name="assessment"]').focus();
        backdrop.querySelector('#prescription-editor-form').onsubmit = event => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const medicineName = String(form.get('medicineName') || '').trim();
            const medicineDetails = ['strength', 'dosage', 'duration', 'instructions'].some(name => String(form.get(name) || '').trim());
            const status = backdrop.querySelector('#prescription-editor-status');
            if (!medicineName && medicineDetails) {
                status.textContent = 'Add a medicine name or clear the medicine details.';
                status.classList.add('form-error');
                return;
            }
            const medicines = medicineName ? [{
                name: medicineName,
                strength: String(form.get('strength') || '').trim(),
                dosage: String(form.get('dosage') || '').trim(),
                duration: String(form.get('duration') || '').trim(),
                instructions: String(form.get('instructions') || '').trim()
            }] : [];
            try {
                window.App.Store.savePrescription(visit.id, {
                    assessment: String(form.get('assessment') || '').trim(),
                    medicines,
                    labSummary: String(form.get('labSummary') || '').trim(),
                    providerName,
                    issuedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                });
                close();
                window.App.UI.toast(`Demo prescription saved for ${visit.name}.`, 'success');
            } catch (error) {
                status.textContent = error.message || 'The demo prescription could not be saved.';
                status.classList.add('form-error');
            }
        };
    }

    window.App.Views.Doctor = function () {
        const { state, setView, getQueueMetrics, getNextPatient, sortQueue, transitionPatient, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const metrics = getQueueMetrics();
        const current = getNextPatient();
        const currentStatus = String(current?.status || 'waiting').toLowerCase();
        const currentPrescription = current ? window.App.Store.getPrescription(current.id) : null;
        const currentAction = { waiting: ['called', 'Call next'], called: ['in_progress', 'Start visit'], in_progress: ['completed', 'Complete visit'] }[currentStatus] || [null, 'Queue ready'];
        const statusLabel = value => ({ waiting: 'Waiting', called: 'Called', in_progress: 'In consultation' }[String(value || 'waiting').toLowerCase()] || 'Active');
        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : value === 'Green' ? 'priority-green' : 'priority-neutral';
        
        const rows = sortQueue(state.queue).map((patient, index) => `
            <tr>
                <td data-label="Patient"><span class="queue-cell-content"><strong>${index + 1}. ${esc(patient.name)}</strong><small>${esc(patient.age)} years · ${esc(patient.gender || 'Not specified')}</small></span></td>
                <td data-label="Reason"><span class="queue-cell-content">${esc(patient.problem || patient.symptoms || 'General consultation')}</span></td>
                <td data-label="Priority"><span class="queue-cell-content"><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Unassessed')}</span></span></td>
                <td data-label="Status"><span class="queue-cell-content"><span class="queue-status queue-status-${String(patient.status || 'waiting').toLowerCase().replace('_', '-')}">${statusLabel(patient.status)}</span></span></td>
                <td data-label="Clinician"><span class="queue-cell-content">${esc(patient.doctorPref || patient.doctor_pref || 'General care')}</span></td>
                <td data-label="Centre"><span class="queue-cell-content">${esc(patient.hospital || state.loggedHospital || 'Care centre')}<small>${esc(patient.city || state.loggedCity || 'Location pending')}</small></span></td>
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
                        ${current ? `<div class="provider-hero-meta"><span class="priority-chip ${priorityClass(current.triage)}">${esc(current.triage || 'Unassessed')} priority</span><span>${icon('stethoscope', 14)} ${esc(current.doctorPref || current.doctor_pref || 'General care')}</span></div>` : ''}
                        <div class="provider-hero-actions">
                            <button id="complete-patient" class="btn-primary btn-icon" ${currentAction[0] ? '' : 'disabled'}>
                                ${currentAction[1]} ${icon(currentStatus === 'in_progress' ? 'check' : 'arrow-right', 16)}
                            </button>
                            <button id="scan-qr-btn" class="btn-secondary btn-icon" type="button">
                                ${icon('qr-code', 16)} Scan Patient QR
                            </button>
                            ${currentStatus === 'in_progress' ? `<button id="issue-prescription" class="btn-secondary btn-icon" type="button">
                                ${icon('notebook-pen', 16)} ${currentPrescription ? 'Edit' : 'Create'} demo prescription
                            </button>` : ''}
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
                    ${state.queue.length ? `<div class="queue-table-wrap"><table class="queue-table"><thead><tr><th>Patient</th><th>Reason for visit</th><th>Priority</th><th>Status</th><th>Clinician queue</th><th>Centre</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="provider-empty">${icon('coffee', 30)}<p>Queue clear. New visits will appear here.</p></div>`}
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
        const prescriptionButton = container.querySelector('#issue-prescription');
        if (prescriptionButton) prescriptionButton.onclick = () => showPrescriptionEditor(current);

        const scanBtn = container.querySelector('#scan-qr-btn');
        if (scanBtn) {
            scanBtn.onclick = () => {
                window.App.UI.showQRScannerModal(async (code) => {
                    const passport = window.App.Store.getMedicalPassport(code);
                    if (passport) {
                        window.App.UI.showMedicalPassportModal(passport);
                        window.App.UI.toast(`Opened ${passport.profile.name}'s read-only Medical Passport.`, 'success');
                        return;
                    }
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
                        window.App.UI.toast('No active queue entry matches that QR ticket.', 'error');
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

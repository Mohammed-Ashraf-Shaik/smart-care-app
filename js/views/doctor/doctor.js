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
    window.App.UI.showPrescriptionEditor = showPrescriptionEditor;

    window.App.Views.Doctor = function () {
        const { state, setView, getQueueMetrics, getNextPatient, sortQueue, transitionPatient, logout, getCareTeam } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const metrics = getQueueMetrics();
        const current = getNextPatient();
        const currentStatus = String(current?.status || 'waiting').toLowerCase();
        const currentPrescription = current ? window.App.Store.getPrescription(current.id) : null;
        const currentAction = { waiting: ['called', 'Call next'], called: ['in_progress', 'Start visit'], in_progress: ['completed', 'Complete visit'] }[currentStatus] || [null, 'Queue ready'];
        const statusLabel = value => ({ waiting: 'Waiting', called: 'Called', in_progress: 'In consultation' }[String(value || 'waiting').toLowerCase()] || 'Active');
        const priorityClass = value => value === 'Red' ? 'priority-red' : value === 'Yellow' ? 'priority-yellow' : value === 'Green' ? 'priority-green' : 'priority-neutral';
        const careTeam = getCareTeam();
        
        const rows = sortQueue(state.queue).map((patient, index) => `
            <tr>
                <td data-label="Patient"><span class="queue-cell-content"><strong>${index + 1}. ${esc(patient.name)}</strong><small>${esc(patient.age)} years · ${esc(patient.gender || 'Not specified')}</small></span></td>
                <td data-label="Reason"><span class="queue-cell-content">${esc(patient.problem || patient.symptoms || 'General consultation')}</span></td>
                <td data-label="Priority"><span class="queue-cell-content"><span class="priority-chip ${priorityClass(patient.triage)}">${esc(patient.triage || 'Unassessed')}</span></span></td>
                <td data-label="Status"><span class="queue-cell-content"><span class="queue-status queue-status-${String(patient.status || 'waiting').toLowerCase().replace('_', '-')}">${statusLabel(patient.status)}</span></span></td>
                <td data-label="Clinician"><span class="queue-cell-content">${esc(patient.doctorName || patient.doctor_name || patient.doctorPref || patient.doctor_pref || 'General care')}</span></td>
                <td data-label="Actions">
                    <span class="queue-cell-content" style="display:flex;gap:.35rem;flex-wrap:wrap">
                        <button type="button" class="btn-secondary btn-icon btn-row-passport" data-patient-id="${esc(patient.id)}" style="font-size:.72rem;padding:.25rem .55rem" title="View Patient Medical Passport">
                            ${icon('file-text', 13)} Passport
                        </button>
                        <button type="button" class="btn-secondary btn-icon btn-row-rx" data-patient-id="${esc(patient.id)}" style="font-size:.72rem;padding:.25rem .55rem" title="Author Clinical Notes &amp; Rx">
                            ${icon('notebook-pen', 13)} Notes &amp; Rx
                        </button>
                    </span>
                </td>
            </tr>
        `).join('');

        const activeAmbulance = window.App.Store.getActiveAmbulance?.();
        const traumaBanner = (activeAmbulance && activeAmbulance.status === 'dispatched') ? `
            <div class="emergency-trauma-banner" style="background:rgba(229, 62, 62, 0.08);border:2px solid rgba(229, 62, 62, 0.35);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:.75rem">
                    <span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:#e53e3e;color:#fff;font-weight:bold">
                        ${icon('siren', 22)}
                    </span>
                    <div>
                        <strong style="color:#c53030;font-size:1.02rem;display:flex;align-items:center;gap:.4rem">
                            ${icon('siren', 16)} INCOMING EMERGENCY TRAUMA ALERT (${esc(activeAmbulance.typeLabel)})
                        </strong>
                        <p style="margin:.15rem 0 0;font-size:.85rem;color:var(--muted)">Patient: <strong>${esc(activeAmbulance.patientName)}</strong> · Vehicle: <strong>${esc(activeAmbulance.driver.vehicleNo)}</strong> · ETA: <span style="color:#c53030;font-weight:700">~${activeAmbulance.etaMinutes} mins</span></p>
                    </div>
                </div>
                <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                    <span class="badge" style="background:rgba(229,62,62,0.15);color:#9b2c2c;font-weight:600;padding:.4rem .8rem;border-radius:6px">ICU Bed Held</span>
                    <button type="button" class="btn-primary btn-icon" id="ack-trauma-btn" style="font-size:.78rem;padding:.4rem .75rem;background:#c53030;border-color:#c53030">
                        ${icon('check', 14)} Prep Trauma Bay 01
                    </button>
                </div>
            </div>` : '';

        const cancelledQueue = state.cancelledQueue || [];
        const cancelledSection = cancelledQueue.length ? `
            <section class="provider-card" style="border-top:3px solid #cbd5e0;margin-top:1.5rem">
                <div class="provider-card-heading">
                    <div>
                        <h2>Released / Cancelled Slots (${cancelledQueue.length})</h2>
                        <p>Visits released by patients or rescheduled by clinicians. Capacity returned to pool.</p>
                    </div>
                </div>
                <div class="queue-table-wrap">
                    <table class="queue-table">
                        <thead><tr><th>Patient</th><th>Cancelled By</th><th>Reason</th><th>Time</th><th>Status</th></tr></thead>
                        <tbody>
                            ${cancelledQueue.map(item => `
                                <tr style="opacity:.8">
                                    <td data-label="Patient"><strong>${esc(item.name)}</strong><small>${esc(item.department || 'General')}</small></td>
                                    <td data-label="By"><span class="badge" style="background:${item.cancelledBy === 'doctor' ? '#fed7d7' : '#e2e8f0'};color:${item.cancelledBy === 'doctor' ? '#9b2c2c' : '#4a5568'}">${item.cancelledBy === 'doctor' ? 'Clinician' : 'Patient'}</span></td>
                                    <td data-label="Reason">${esc(item.cancellationReason || 'Schedule conflict')}</td>
                                    <td data-label="Time">${item.cancelledAt ? new Date(item.cancelledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</td>
                                    <td data-label="Status"><span class="queue-status" style="background:#edf2f7;color:#718096">Slot Released</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </section>` : '';

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
                ${traumaBanner}
                <header class="provider-header">
                    <div>
                        <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Hospital workspace</div>
                        <h1>Good care needs a clear queue.</h1>
                        <p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p>
                    </div>
                    <div class="provider-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}<br><strong>${metrics.waiting} active ${metrics.waiting === 1 ? 'visit' : 'visits'}</strong></div>
                </header>
                <div class="provider-grid">
                    <section class="provider-hero">
                        <div class="eyebrow"><span class="eyebrow-dot"></span> ${currentStatus === 'in_progress' ? 'Current consultation' : 'Next in line'}</div>
                        <h2>${current ? esc(current.name) : 'Queue is clear'}</h2>
                        <p>${current ? `${esc(current.problem || current.symptoms || 'General consultation')} · ${statusLabel(current.status)}` : 'There are no patients waiting for this care centre right now.'}</p>
                        ${current ? `<div class="provider-hero-meta" style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap">
                            <span class="priority-chip ${priorityClass(current.triage)}">${esc(current.triage || 'Unassessed')} priority</span>
                            <select id="hero-change-triage" style="font-size:.78rem;padding:.2rem .5rem;border-radius:6px;background:var(--surface);border:1px solid var(--line);color:var(--ink);cursor:pointer" title="Quick adjust triage priority">
                                <option value="Green" ${current.triage === 'Green' ? 'selected' : ''}>Green (Standard)</option>
                                <option value="Yellow" ${current.triage === 'Yellow' ? 'selected' : ''}>Yellow (Urgent)</option>
                                <option value="Red" ${current.triage === 'Red' ? 'selected' : ''}>Red (Emergency)</option>
                            </select>
                            <span>${icon('stethoscope', 14)} ${esc(current.doctorName || current.doctor_name || current.doctorPref || current.doctor_pref || 'General care')}</span>
                        </div>` : ''}
                        <div class="provider-hero-actions" style="flex-wrap:wrap;gap:.5rem">
                            <button id="complete-patient" class="btn-primary btn-icon" ${currentAction[0] ? '' : 'disabled'}>
                                ${currentAction[1]} ${icon(currentStatus === 'in_progress' ? 'check' : 'arrow-right', 16)}
                            </button>
                            ${current ? `
                                <button id="btn-view-passport" class="btn-secondary btn-icon" type="button" title="View Patient Medical Passport &amp; History">
                                    ${icon('file-text', 15)} Medical Passport
                                </button>
                                <button id="btn-record-vitals" class="btn-secondary btn-icon" type="button" title="Record Clinical Vitals">
                                    ${icon('activity', 15)} Record Vitals
                                </button>
                                <button id="doctor-cancel-patient" class="btn-secondary btn-icon" type="button" style="border-color:#feb2b2;color:#c53030">
                                    ${icon('ban', 15)} Cancel / Reschedule
                                </button>
                            ` : ''}
                            <button id="scan-qr-btn" class="btn-secondary btn-icon" type="button">
                                ${icon('qr-code', 16)} Scan Patient QR
                            </button>
                            ${currentStatus === 'in_progress' ? `<button id="issue-prescription" class="btn-secondary btn-icon" type="button">
                                ${icon('notebook-pen', 16)} ${currentPrescription ? 'Edit' : 'Write'} E-Prescription
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
                <section class="provider-card care-team-card" aria-labelledby="care-team-heading">
                    <div class="provider-card-heading"><div><h2 id="care-team-heading">Hospital care team</h2><p>Each clinician has a department, room, availability, and live queue count.</p></div><span class="status-eyebrow">${careTeam.length} clinicians</span></div>
                    <div class="care-team-roster">${careTeam.map(member => {
                        const assigned = state.queue.filter(patient => (patient.doctorName || patient.doctor_name || patient.doctorPref || patient.doctor_pref) === member.name).length;
                        return `<article class="clinician-card"><div class="clinician-avatar" aria-hidden="true">${member.name.split(' ').slice(1).map(part => part[0]).join('').slice(0, 2)}</div><div><strong>${esc(member.name)}</strong><span>${esc(member.specialty)}</span><small>${esc(member.room)} | ${esc(member.availability)}</small></div><span class="clinician-queue-count"><strong>${assigned}</strong><small>active</small></span></article>`;
                    }).join('')}</div>
                </section>
                <section class="provider-card">
                    <div class="provider-card-heading">
                        <div>
                            <h2>Patient queue</h2>
                            <p>Priority first, then arrival time. Move one visit through each handoff.</p>
                        </div>
                        <span class="status-eyebrow" style="color:var(--teal)"><i style="background:var(--teal)"></i> Live</span>
                    </div>
                    ${state.queue.length ? `<div class="queue-table-wrap"><table class="queue-table"><thead><tr><th>Patient</th><th>Reason for visit</th><th>Priority</th><th>Status</th><th>Clinician queue</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="provider-empty">${icon('coffee', 30)}<p>Queue clear. New visits will appear here.</p></div>`}
                </section>
                ${cancelledSection}
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
            <a class="active" href="/dashboard/hospital" data-route="/dashboard/hospital">${icon('layout-dashboard', 16)}<span>Overview</span></a>
            <a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a>
            <a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a>
            <div class="nav-divider"></div>
            <a href="/ambulance" data-route="/ambulance" style="color:#e53e3e">${icon('siren', 16)}<span>Ambulance Fleet</span></a>
            <a href="/pharmacy" data-route="/pharmacy">${icon('pill', 16)}<span>Pharmacy Dispenser</span></a>
            <a href="/verify-rx" data-route="/verify-rx">${icon('shield-check', 16)}<span>Verify Rx</span></a>
            <a href="/dashboard/hospital/donations" data-route="/dashboard/hospital/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="/dashboard/hospital/help" data-route="/dashboard/hospital/help">${icon('circle-help', 16)}<span>Help</span></a>
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

        const doctorCancelBtn = container.querySelector('#doctor-cancel-patient');
        if (doctorCancelBtn && current) {
            doctorCancelBtn.onclick = () => {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `
                    <section class="modal-card" role="dialog" aria-modal="true" style="max-width:440px">
                        <div class="modal-heading">
                            <div>
                                <h2 id="doctor-cancel-title">Cancel / Reschedule Visit</h2>
                                <p>Patient: <strong>${esc(current.name)}</strong> (Ref: ${esc(current.id)})</p>
                            </div>
                            <button type="button" class="btn-ghost modal-close-button" data-close-modal>${icon('x', 18)}</button>
                        </div>
                        <form id="doctor-cancel-form" style="display:flex;flex-direction:column;gap:1rem;margin-top:.5rem">
                            <p style="font-size:.88rem;color:var(--muted);margin:0">Cancelling releases this slot and alerts the patient immediately with a free reschedule voucher.</p>
                            <div class="field">
                                <label for="doc-cancel-reason">Clinical Reason for Cancellation</label>
                                <select id="doc-cancel-reason" required style="width:100%;padding:.6rem .8rem;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                                    <option value="Doctor summoned for emergency trauma surgery">Doctor summoned for emergency trauma surgery</option>
                                    <option value="Clinician emergency medical leave">Clinician emergency medical leave</option>
                                    <option value="OT / Diagnostic lab equipment maintenance">OT / Diagnostic lab equipment maintenance</option>
                                    <option value="Patient unreachable / multiple missed calls">Patient unreachable / multiple missed calls</option>
                                    <option value="Patient transferred to specialist ward">Patient transferred to specialist ward</option>
                                </select>
                            </div>
                            <div class="modal-actions" style="margin-top:.5rem;display:flex;gap:.5rem;justify-content:flex-end">
                                <button type="button" class="btn-secondary" data-close-modal>Keep Visit</button>
                                <button type="submit" class="btn-danger btn-icon">${icon('ban', 15)} Confirm Cancellation</button>
                            </div>
                        </form>
                    </section>
                `;
                document.body.appendChild(backdrop);
                const close = () => backdrop.remove();
                backdrop.querySelectorAll('[data-close-modal]').forEach(b => b.onclick = close);
                backdrop.onclick = e => { if (e.target === backdrop) close(); };
                backdrop.querySelector('#doctor-cancel-form').onsubmit = async e => {
                    e.preventDefault();
                    const reason = backdrop.querySelector('#doc-cancel-reason').value;
                    const submitBtn = backdrop.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Cancelling...';
                    const res = await window.App.Store.cancelAppointment(current.id, 'doctor', reason);
                    close();
                    if (res.success) {
                        window.App.UI.toast('Visit cancelled. Slot released and patient notified.', 'info');
                    } else {
                        window.App.UI.toast(res.error || 'Could not cancel visit.', 'error');
                    }
                };
                if (window.lucide) window.lucide.createIcons();
            };
        }

        function openPatientPassport(patient) {
            const ownerEmail = patient.patientEmail || (patient.name === 'Asha Rao' ? 'patient@smartcare.demo' : '');
            const history = window.App.Store.getMedicalHistory(ownerEmail);
            const passportData = {
                passportId: patient.id === 'SC-DEMO-ASHA' || patient.name === 'Asha Rao' ? 'SC-PASSPORT-8924' : `SC-PASSPORT-${patient.id}`,
                profile: {
                    name: patient.name,
                    age: patient.age || '32',
                    gender: patient.gender || 'Female',
                    city: patient.city || 'Hyderabad'
                },
                history: history || {}
            };
            window.App.UI.showMedicalPassportModal(passportData);
        }

        function showVitalsModal(patient) {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            const existingRx = window.App.Store.getPrescription(patient.id) || {};
            const vitals = existingRx.vitals || { bp: '120/80', pulse: '76', spo2: '99', temp: '98.4' };
            backdrop.innerHTML = `
                <section class="modal-card" role="dialog" aria-modal="true" style="max-width:440px">
                    <div class="modal-heading">
                        <div>
                            <h2>${icon('activity', 18)} Record Clinical Vitals</h2>
                            <p>Patient: <strong>${esc(patient.name)}</strong> · ${esc(patient.age)}Y / ${esc(patient.gender || 'F')}</p>
                        </div>
                        <button type="button" class="btn-ghost modal-close-button" data-close-vitals>${icon('x', 18)}</button>
                    </div>
                    <form id="vitals-form" style="display:grid;grid-template-columns:1fr 1fr;gap:.85rem;margin-top:.75rem">
                        <div class="field">
                            <label for="vital-bp" style="font-size:.82rem;font-weight:600">Blood Pressure (mmHg)</label>
                            <input id="vital-bp" type="text" value="${esc(vitals.bp || '120/80')}" placeholder="120/80" required style="width:100%;padding:.5rem .7rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                        </div>
                        <div class="field">
                            <label for="vital-pulse" style="font-size:.82rem;font-weight:600">Pulse / Heart Rate (bpm)</label>
                            <input id="vital-pulse" type="number" value="${esc(vitals.pulse || '76')}" placeholder="76" required style="width:100%;padding:.5rem .7rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                        </div>
                        <div class="field">
                            <label for="vital-spo2" style="font-size:.82rem;font-weight:600">Oxygen SpO2 (%)</label>
                            <input id="vital-spo2" type="number" value="${esc(vitals.spo2 || '99')}" placeholder="99" required style="width:100%;padding:.5rem .7rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                        </div>
                        <div class="field">
                            <label for="vital-temp" style="font-size:.82rem;font-weight:600">Body Temp (°F)</label>
                            <input id="vital-temp" type="text" value="${esc(vitals.temp || '98.4')}" placeholder="98.4" required style="width:100%;padding:.5rem .7rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                        </div>
                        <div class="modal-actions" style="grid-column:1 / -1;display:flex;justify-content:flex-end;gap:.5rem;margin-top:.5rem">
                            <button type="button" class="btn-secondary" data-close-vitals>Cancel</button>
                            <button type="submit" class="btn-primary btn-icon">${icon('check', 15)} Save Vitals</button>
                        </div>
                    </form>
                </section>
            `;
            document.body.appendChild(backdrop);
            if (window.lucide) window.lucide.createIcons();
            const close = () => backdrop.remove();
            backdrop.querySelectorAll('[data-close-vitals]').forEach(b => b.onclick = close);
            backdrop.onclick = e => { if (e.target === backdrop) close(); };
            backdrop.querySelector('#vitals-form').onsubmit = e => {
                e.preventDefault();
                const bp = backdrop.querySelector('#vital-bp').value.trim();
                const pulse = backdrop.querySelector('#vital-pulse').value.trim();
                const spo2 = backdrop.querySelector('#vital-spo2').value.trim();
                const temp = backdrop.querySelector('#vital-temp').value.trim();
                const updatedRx = {
                    ...existingRx,
                    vitals: { bp, pulse, spo2, temp },
                    hospital: patient.hospital || 'SmartCare Community Hospital',
                    patientName: patient.name,
                    doctorName: patient.doctorName || 'Dr Meera Shah'
                };
                window.App.Store.savePrescription(patient.id, updatedRx);
                close();
                window.App.UI.toast(`Vitals saved for ${patient.name} (BP: ${bp}, SpO2: ${spo2}%).`, 'success');
            };
        }

        const ackTraumaBtn = container.querySelector('#ack-trauma-btn');
        if (ackTraumaBtn) {
            ackTraumaBtn.onclick = () => {
                ackTraumaBtn.disabled = true;
                ackTraumaBtn.innerHTML = `${icon('check-check', 14)} Trauma Bay 01 Ready`;
                if (window.lucide) window.lucide.createIcons();
                window.App.UI.toast('Trauma Bay 01 prepped and resuscitation team on immediate standby.', 'success');
            };
        }

        const passportBtn = container.querySelector('#btn-view-passport');
        if (passportBtn && current) {
            passportBtn.onclick = () => openPatientPassport(current);
        }

        const vitalsBtn = container.querySelector('#btn-record-vitals');
        if (vitalsBtn && current) {
            vitalsBtn.onclick = () => showVitalsModal(current);
        }

        const triageSelect = container.querySelector('#hero-change-triage');
        if (triageSelect && current) {
            triageSelect.onchange = async () => {
                const newTriage = triageSelect.value;
                await window.App.DB.updatePatient(current.id, { triage: newTriage });
                const fresh = await window.App.DB.fetchQueue();
                window.App.Store.updateQueue(fresh);
                window.App.UI.toast(`Triage updated to ${newTriage} for ${current.name}.`, 'info');
            };
        }

        container.querySelectorAll('.btn-row-passport').forEach(btn => {
            btn.onclick = () => {
                const pId = btn.dataset.patientId;
                const patient = state.queue.find(p => String(p.id) === String(pId));
                if (patient) openPatientPassport(patient);
            };
        });

        container.querySelectorAll('.btn-row-rx').forEach(btn => {
            btn.onclick = () => {
                const pId = btn.dataset.patientId;
                const patient = state.queue.find(p => String(p.id) === String(pId));
                if (patient) showPrescriptionEditor(patient);
            };
        });

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
        if (state.isLogged) {
            window.App.UI.syncMobileBottomNav(state.loggedRole, state.route);
        } else {
            document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
        }
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

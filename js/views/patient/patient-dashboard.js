(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.PatientDashboard = function () {
        const { state, setView, navigate, logout, recordPatientVisit, sortQueue, updatePatientData, getAppointmentSlots } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';
        const patientData = state.patientData || {};
        const patientName = patientData.name || (state.loggedEmail === 'patient@smartcare.demo' ? 'Asha Rao' : (state.loggedEmail || 'Patient').split('@')[0].replace(/[._-]/g, ' '));
        const latestVisit = state.patientVisits[0];
        const activeTab = state.activeTab || '';
        const isApplyTab = activeTab === 'apply';
        const showOverview = (activeTab === 'overview' || activeTab === '') && !isApplyTab;
        const showVisits = activeTab === 'visits';
        const showProfile = activeTab === 'profile';
        const activeVisit = state.patientVisits.find(visit => !['completed', 'cancelled', 'withdrawn', 'no-show'].includes(String(visit.status || '').toLowerCase()));
        const visitStatusLabel = value => ({ booked: 'Booked', waiting: 'Waiting for the centre', called: 'Please proceed to reception', in_progress: 'In consultation', completed: 'Completed', cancelled: 'Cancelled', withdrawn: 'Withdrawn from queue' }[String(value || 'booked').toLowerCase()] || 'Booked');
        const activeQueue = sortQueue(state.queue);
        const liveQueueEntry = activeVisit ? activeQueue.find(entry => String(entry.id) === String(activeVisit.id)) : null;
        const liveQueueIndex = liveQueueEntry ? activeQueue.findIndex(entry => String(entry.id) === String(liveQueueEntry.id)) : -1;
        const patientsAhead = liveQueueIndex >= 0 ? liveQueueIndex : null;
        const liveStatus = String(liveQueueEntry?.status || activeVisit?.status || 'booked').toLowerCase();
        const queuePosition = !liveQueueEntry ? 'Sync pending' : liveStatus === 'waiting' ? `#${liveQueueIndex + 1}` : liveStatus === 'called' ? 'Called' : liveStatus === 'in_progress' ? 'In room' : 'Updated';
        const queueEstimate = !liveQueueEntry ? 'Check again shortly' : liveStatus === 'waiting' ? `About ${Math.max(5, (patientsAhead * 12) + 10)} min` : liveStatus === 'called' ? 'Proceed now' : liveStatus === 'in_progress' ? 'Visit underway' : 'Status updated';

        // Build visit rows with explicit demo-record availability.
        const visitRows = state.patientVisits.length
            ? state.patientVisits.map(visit => {
                const hasPrescription = Boolean(window.App.Store.getPrescription(visit.id));
                return `
                <div class="patient-visit">
                    <div class="patient-visit-icon">${icon('clipboard-check', 18)}</div>
                    <div>
                        <strong>${esc(visit.hospital || 'SmartCare centre')}</strong>
                        <p>${esc(visit.reason || 'General consultation')} · Ref: ${esc(visit.reference || visit.id || 'SC-DEMO')}</p>
                        <small>${esc(visit.date || 'Recent date')} · Status: <span class="visit-status">${esc(visitStatusLabel(visit.status))}</span></small>
                    </div>
                    <div class="visit-actions">
                        <button type="button" class="btn-secondary btn-icon btn-view-rx" data-visit-id="${esc(visit.id)}" style="font-size:.72rem;min-height:2.2rem;padding:.35rem .75rem">
                            ${icon(hasPrescription ? 'file-text' : 'file-question', 14)} <span>${hasPrescription ? 'View demo record' : 'No record yet'}</span>
                        </button>
                    </div>
                </div>`;
            }).join('')
            : `<div class="provider-empty">${icon('clipboard-x', 28)}<p>No visits saved yet.</p></div>`;

        const recentlyCancelledVisit = state.patientVisits.find(visit => ['cancelled', 'withdrawn'].includes(String(visit.status || '').toLowerCase()) && (visit.cancelledBy === 'doctor' || (Date.now() - new Date(visit.cancelledAt || visit.date || Date.now()).getTime() < 48 * 3600 * 1000)));

        const cancellationBanner = recentlyCancelledVisit ? `
            <section class="patient-appointment-card patient-cancellation-banner ${recentlyCancelledVisit.cancelledBy === 'doctor' ? 'doctor-cancelled' : 'patient-cancelled'}" style="border-left:4px solid ${recentlyCancelledVisit.cancelledBy === 'doctor' ? '#e53e3e' : '#f59e0b'};margin-bottom:1.25rem;background:var(--surface)">
                <div class="appointment-icon" style="color:${recentlyCancelledVisit.cancelledBy === 'doctor' ? '#e53e3e' : '#f59e0b'}">${icon(recentlyCancelledVisit.cancelledBy === 'doctor' ? 'triangle-alert' : 'info', 22)}</div>
                <div class="appointment-copy" style="flex:1">
                    <span class="eyebrow" style="color:${recentlyCancelledVisit.cancelledBy === 'doctor' ? '#e53e3e' : '#f59e0b'}"><span class="eyebrow-dot" style="background:${recentlyCancelledVisit.cancelledBy === 'doctor' ? '#e53e3e' : '#f59e0b'}"></span> ${recentlyCancelledVisit.cancelledBy === 'doctor' ? 'Appointment Cancelled by Hospital' : 'Appointment Cancelled'}</span>
                    <h2 style="font-size:1.15rem;margin:.25rem 0">${recentlyCancelledVisit.cancelledBy === 'doctor' ? `Dr. ${esc(recentlyCancelledVisit.doctorName || 'Clinician')} had an unexpected schedule change` : `You cancelled this appointment`}</h2>
                    <p style="margin:.25rem 0;font-size:.9rem"><strong>Reason:</strong> ${esc(recentlyCancelledVisit.cancellationReason || (recentlyCancelledVisit.cancelledBy === 'doctor' ? 'Doctor summoned for emergency surgery duty' : 'Schedule conflict'))}</p>
                    <small>Centre: ${esc(recentlyCancelledVisit.hospital)} | Ref: <strong>${esc(recentlyCancelledVisit.id)}</strong></small>
                    <div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">
                        <button type="button" class="btn-primary btn-icon btn-reschedule-free" data-visit-id="${esc(recentlyCancelledVisit.id)}" style="font-size:.82rem;padding:.45rem .85rem">
                            ${icon('calendar-clock', 15)} Reschedule free of charge
                        </button>
                        ${recentlyCancelledVisit.refundStatus === 'processed'
                            ? `<span class="badge" style="background:#e6fffa;color:#234e52;border:1px solid #b2f5ea;padding:.45rem .85rem;border-radius:6px;font-size:.82rem;font-weight:600">${icon('check-circle', 14)} Refund Processed (${esc(recentlyCancelledVisit.refundRef || 'REF-OK')})</span>`
                            : `<button type="button" class="btn-secondary btn-icon btn-claim-refund" data-visit-id="${esc(recentlyCancelledVisit.id)}" style="font-size:.82rem;padding:.45rem .85rem">
                                ${icon('receipt', 15)} Claim ₹125 refund
                               </button>`
                        }
                    </div>
                </div>
            </section>` : '';

        const appointmentCard = activeVisit ? `
            <section class="patient-appointment-card" aria-label="Next appointment and live queue status">
                <div class="appointment-icon">${icon('calendar-clock', 22)}</div>
                <div class="appointment-copy">
                    <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next appointment</span>
                    <h2>${esc(activeVisit.hospital || 'SmartCare centre')}</h2>
                    <p>${esc(activeVisit.department || 'General medicine')} | ${esc(activeVisit.doctorName || 'Next available clinician')}</p>
                    <small>${esc(activeVisit.consultationType || 'In-person consultation')} | ${esc(activeVisit.appointmentDate || activeVisit.date || 'Date pending')} at ${esc(activeVisit.appointmentSlot || 'Next available')}</small>
                    <small>Reference: <strong>${esc(activeVisit.id || 'SC-DEMO')}</strong></small>
                    <div class="appointment-telemetry" aria-live="polite">
                        <span><small>Live position</small><strong>${esc(queuePosition)}</strong></span>
                        <span><small>Patients ahead</small><strong>${patientsAhead === null ? '—' : patientsAhead}</strong></span>
                        <span><small>Estimated window</small><strong>${esc(queueEstimate)}</strong></span>
                    </div>
                </div>
                <div class="appointment-actions">
                    <strong>${esc(visitStatusLabel(liveStatus))}</strong>
                    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                        <button type="button" class="btn-secondary btn-icon btn-view-rx" data-visit-id="${esc(activeVisit.id)}" style="font-size:.72rem;min-height:2.2rem;padding:.35rem .65rem">
                            ${icon('file-text', 14)} Clinical slip
                        </button>
                        <button id="manage-appointment" class="btn-secondary btn-icon" type="button">${icon('calendar-cog', 14)} Manage</button>
                    </div>
                </div>
            </section>` : `
            ${cancellationBanner ? '' : `
            <section class="patient-appointment-card patient-appointment-empty" aria-label="Next appointment">
                <div class="appointment-icon">${icon('calendar-plus', 22)}</div>
                <div class="appointment-copy">
                    <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> No upcoming appointment</span>
                    <h2>Keep your care plan moving.</h2>
                    <p>Choose a nearby centre and reserve a visit when you are ready.</p>
                </div>
                <a class="text-link text-link-dark btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Book a visit ${icon('arrow-right', 15)}</a>
            </section>`}`;

        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient portal</span></span>
                </a>
                <div class="flow-topbar-actions">
                    ${window.App.UI.topbarControls(true)}
                    <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back to home</a>
                </div>
            </div>
            <main class="provider-shell patient-shell" data-section="patient-dashboard">
                ${activeVisit ? `
                    <div class="patient-mobile-queue-dock" role="status" aria-live="polite">
                        <div class="mobile-queue-info">
                            <div class="mobile-queue-title"><span class="pulse-dot"></span> <strong>${esc(activeVisit.hospital || 'SmartCare Centre')}</strong> · ${esc(visitStatusLabel(liveStatus))}</div>
                            <div class="mobile-queue-meta">Live Queue: <strong>${esc(queuePosition)}</strong> · Window: ${esc(queueEstimate)}</div>
                        </div>
                        <button type="button" class="btn-secondary btn-icon btn-sm btn-view-rx" data-visit-id="${esc(activeVisit.id)}" style="font-size:.75rem;padding:.35rem .65rem;flex-shrink:0">
                            ${icon('file-text', 13)} Slip
                        </button>
                    </div>
                ` : ''}
                ${!isApplyTab ? `
                <header class="provider-header">
                    <div>
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Patient dashboard</div>
                        <h1>Good to see you, ${esc(patientName)}.</h1>
                        <p>Keep your care plans, previous visits, and prescription records in one place.</p>
                    </div>
                    <div class="provider-date">${state.patientVisits.length} saved records<br><strong>Private demo history</strong></div>
                </header>` : ''}
                ${isApplyTab ? `<div id="embedded-booking-mount"></div>` : ''}
                ${showOverview ? `
                    ${cancellationBanner}
                    ${appointmentCard}
                    <section class="patient-next-action" aria-label="Next patient action">
                        <div>
                            <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next step</span>
                            <h2>Need care today?</h2>
                            <p>Search nearby centres, compare queues, and reserve a visit when it suits you.</p>
                        </div>
                        <a class="btn-primary btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Book an appointment ${icon('arrow-right', 16)}</a>
                    </section>
                    <div class="provider-stats patient-stats" aria-label="Patient summary">
                        <div class="provider-stat">
                            <span>Previous visits</span>
                            <strong>${state.patientVisits.length}</strong>
                            <small>Stored on this device</small>
                        </div>
                        <div class="provider-stat">
                            <span>Last visit</span>
                            <strong>${latestVisit ? esc(latestVisit.date.replace(' 2026', '')) : '—'}</strong>
                            <small>${latestVisit ? esc(latestVisit.hospital) : 'No history yet'}</small>
                        </div>
                        <div class="provider-stat">
                            <span>Care preference</span>
                            <strong>${esc(state.patientData.doctorPref || 'General')}</strong>
                            <small>Can change during booking</small>
                        </div>
                        <div class="provider-stat">
                            <span>Location</span>
                            <strong>${esc(state.patientData.city || 'Hyderabad')}</strong>
                            <small>Used only for care search</small>
                        </div>
                    </div>` : ''}
                ${showVisits ? `
                    <section id="tab-visits" data-tab-panel="visits" class="provider-card patient-visits-card">
                        <div class="provider-card-heading">
                            <div>
                                <h2>Previous visits &amp; clinical records</h2>
                                <p>Review clinician-authored demo notes stored for each visit on this device.</p>
                            </div>
                            <a class="text-link text-link-dark btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Book again ${icon('arrow-up-right', 15)}</a>
                        </div>
                        <div class="patient-visit-list">${visitRows}</div>
                    </section>` : ''}
                ${showProfile ? `
                    <section id="tab-profile" data-tab-panel="profile" class="provider-card patient-profile-card">
                        <div class="provider-card-heading">
                            <div>
                                <h2>Your Patient Profile</h2>
                                <p>Set up your details to speed up hospital check-in and booking.</p>
                            </div>
                            <span class="status-eyebrow" style="color:var(--teal)">${icon('shield-check', 14)} Private &amp; Secure</span>
                        </div>
                        <form id="profile-form" class="form-grid" style="gap:1rem;margin-top:1rem">
                            <div class="field">
                                <label for="pf-name">Full Name <span>*</span></label>
                                <input id="pf-name" type="text" value="${esc(patientData.name || patientName)}" placeholder="e.g. Asha Rao" required>
                            </div>
                            <div class="field">
                                <label for="pf-email">Account Email</label>
                                <input id="pf-email" type="email" value="${esc(state.loggedEmail || 'patient@smartcare.demo')}" disabled style="opacity:.75;background:var(--canvas)">
                            </div>
                            <div class="field">
                                <label for="pf-age">Age <span>*</span></label>
                                <input id="pf-age" type="number" min="0" max="120" value="${esc(patientData.age || '32')}" placeholder="32" required>
                            </div>
                            <div class="field">
                                <label for="pf-gender">Gender</label>
                                <select id="pf-gender">
                                    <option value="Female" ${patientData.gender === 'Female' ? 'selected' : ''}>Female</option>
                                    <option value="Male" ${patientData.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Other" ${patientData.gender === 'Other' ? 'selected' : ''}>Other</option>
                                    <option value="Prefer not to say" ${patientData.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
                                </select>
                            </div>
                            <div class="field">
                                <label for="pf-blood">Blood Group</label>
                                <select id="pf-blood">
                                    <option value="O+" ${patientData.bloodGroup === 'O+' ? 'selected' : ''}>O+ (Universal RBC)</option>
                                    <option value="O-" ${patientData.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                                    <option value="A+" ${patientData.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                                    <option value="A-" ${patientData.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                                    <option value="B+" ${patientData.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                                    <option value="B-" ${patientData.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                                    <option value="AB+" ${patientData.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                                    <option value="AB-" ${patientData.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                                </select>
                            </div>
                            <div class="field">
                                <label for="pf-city">City / Region <span>*</span></label>
                                <input id="pf-city" type="text" value="${esc(patientData.city || 'Hyderabad')}" placeholder="Hyderabad" required>
                            </div>
                            <div class="field full">
                                <label for="pf-address">Address / Area</label>
                                <input id="pf-address" type="text" value="${esc(patientData.area || '')}" placeholder="e.g. Banjara Hills, Road No. 12">
                            </div>
                            <div class="field full">
                                <label for="pf-allergies">Known Drug Allergies</label>
                                <input id="pf-allergies" type="text" value="${esc(patientData.allergies || '')}" placeholder="e.g. Penicillin, Sulfa drugs (Leave blank if none)">
                            </div>
                            <div class="field full" style="display:flex;flex-direction:row;justify-content:space-between;align-items:center;margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--line)">
                                <span class="hint">Saved automatically to your browser profile.</span>
                                <button type="submit" class="btn-primary btn-icon" id="btn-save-profile">
                                    ${icon('save', 16)} Save Profile Changes
                                </button>
                            </div>
                        </form>
                    </section>` : ''}
            </main>
            ${window.App.UI.footer(true)}`;

        const rescheduleFreeBtn = container.querySelector('.btn-reschedule-free');
        if (rescheduleFreeBtn && recentlyCancelledVisit) {
            rescheduleFreeBtn.onclick = () => showAppointmentManager(recentlyCancelledVisit, rescheduleFreeBtn);
        }

        const claimRefundBtn = container.querySelector('.btn-claim-refund');
        if (claimRefundBtn && recentlyCancelledVisit) {
            claimRefundBtn.onclick = async () => {
                claimRefundBtn.disabled = true;
                claimRefundBtn.textContent = 'Processing refund...';
                const res = await window.App.Store.claimRefund(recentlyCancelledVisit.id);
                if (res.success) {
                    window.App.UI.toast(`Full fee refund ₹125 initiated. Reference: ${res.ref}`, 'success');
                    navigate('/dashboard/patient');
                } else {
                    claimRefundBtn.disabled = false;
                    claimRefundBtn.textContent = 'Claim ₹125 refund';
                    window.App.UI.toast(res.error || 'Refund request could not be completed.', 'error');
                }
            };
        }

        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Patient workspace navigation');
        workspaceNav.innerHTML = `
            <a class="${activeTab === 'overview' || activeTab === '' ? 'active' : ''}" href="/dashboard/patient" data-tab="overview">${icon('layout-dashboard', 16)}<span>Overview</span></a>
            <a class="${activeTab === 'apply' ? 'active' : ''}" href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1">${icon('calendar-plus', 16)}<span>Book visit</span></a>
            <a class="${activeTab === 'visits' ? 'active' : ''}" href="/dashboard/patient?tab=visits" data-tab="visits">${icon('clipboard-check', 16)}<span>Previous visits</span></a>
            <a href="/dashboard/patient/history" data-route="/dashboard/patient/history">${icon('file-text', 16)}<span>Medical history</span></a>
            <a class="${activeTab === 'profile' ? 'active' : ''}" href="/dashboard/patient?tab=profile" data-tab="profile">${icon('user-round', 16)}<span>Profile</span></a>
            <div class="nav-divider"></div>
            <a href="/ambulance" data-route="/ambulance" style="color:#e53e3e">${icon('siren', 16)}<span>Ambulance SOS</span></a>
            <a href="/pharmacy" data-route="/pharmacy">${icon('pill', 16)}<span>Pharmacy</span></a>
            <a href="/verify-rx" data-route="/verify-rx">${icon('shield-check', 16)}<span>Verify Rx</span></a>
            <a href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a>
            <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
        `;

        const workspaceMain = container.querySelector('main');
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);

        if (isApplyTab && window.App.Views.Patient) {
            const mount = workspaceContent.querySelector('#embedded-booking-mount');
            if (mount) mount.appendChild(window.App.Views.Patient({ embedded: true, showTopbar: false }));
        }

        container.querySelectorAll('.btn-view-rx').forEach(button => {
            button.onclick = () => {
                const visitId = button.dataset.visitId;
                const visit = state.patientVisits.find(item => String(item.id) === String(visitId)) || activeVisit || latestVisit || {};
                window.App.UI.showPrescriptionModal({
                    ...visit,
                    patientName: patientName,
                    age: state.patientData.age || '32',
                    gender: state.patientData.gender || 'Female'
                });
            };
        });

        const manageButton = container.querySelector('#manage-appointment');
        if (manageButton && activeVisit) manageButton.onclick = () => showAppointmentManager(activeVisit, manageButton);

        container.querySelectorAll('.btn-reschedule-free').forEach(button => {
            button.onclick = () => {
                const visitId = button.dataset.visitId;
                const visit = state.patientVisits.find(item => String(item.id) === String(visitId)) || recentlyCancelledVisit;
                if (visit) {
                    showAppointmentManager(visit, button);
                } else {
                    navigate('/dashboard/patient/apply/1');
                }
            };
        });

        container.querySelectorAll('.btn-claim-refund').forEach(button => {
            button.onclick = async () => {
                const visitId = button.dataset.visitId;
                button.disabled = true;
                button.innerHTML = `${icon('loader', 14)} Processing refund...`;
                if (window.lucide) window.lucide.createIcons();
                const res = await window.App.Store.claimRefund(visitId);
                if (res.success) {
                    window.App.UI.toast(`₹125 refund initiated successfully to original UPI/account. Ref: ${res.ref}`, 'success');
                    navigate('/dashboard/patient');
                } else {
                    button.disabled = false;
                    button.innerHTML = `${icon('receipt', 15)} Claim ₹125 refund`;
                    if (window.lucide) window.lucide.createIcons();
                    window.App.UI.toast(res.error || 'Failed to process refund.', 'error');
                }
            };
        });

        function showAppointmentManager(visit, trigger) {
            const slots = getAppointmentSlots();
            const currentSlotValue = `${visit.appointmentDate || slots[0].date}|${visit.appointmentSlot || slots[0].slot}`;
            const canReschedule = !['called', 'in_progress'].includes(liveStatus);
            const isFutureAppointment = String(visit.appointmentDate || '') >= new Date().toISOString().slice(0, 10);
            const exitLabel = 'Cancel appointment';
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.innerHTML = `<section class="modal-card appointment-manager" role="dialog" aria-modal="true" aria-labelledby="appointment-manager-title">
                <div class="modal-heading">
                    <div>
                        <h2 id="appointment-manager-title">Manage appointment</h2>
                        <p>${esc(visit.hospital || 'SmartCare centre')} | ${esc(visit.doctorName || 'Clinician assignment pending')}</p>
                    </div>
                    <button type="button" class="btn-ghost modal-close-button" data-close-manager aria-label="Close appointment manager">${icon('x', 18)}</button>
                </div>
                <form id="reschedule-form" class="appointment-manager-form">
                    <div class="field">
                        <label for="reschedule-slot">Choose another available slot</label>
                        <select id="reschedule-slot" ${canReschedule ? '' : 'disabled'}>${slots.map(slot => `<option value="${esc(slot.value)}" ${slot.value === currentSlotValue ? 'selected' : ''}>${esc(slot.label)}</option>`).join('')}</select>
                        <span class="hint">${canReschedule ? 'Rescheduling releases your old slot and immediately updates the hospital queue.' : 'This visit cannot be rescheduled after the hospital calls the patient.'}</span>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" data-close-manager>Keep current booking</button>
                        <button type="submit" class="btn-primary btn-icon" ${canReschedule ? '' : 'disabled'}>${icon('calendar-clock', 15)} Save new time</button>
                    </div>
                </form>
                <div class="appointment-danger-zone">
                    <div>
                        <strong>Cancel appointment</strong>
                        <p>This releases your doctor appointment slot back to other patients in need.</p>
                    </div>
                    <button id="begin-withdraw" class="btn-danger" type="button">Cancel appointment</button>
                    <div id="withdraw-confirmation" class="withdraw-confirmation" hidden style="margin-top:.75rem">
                        <p style="font-weight:600;font-size:.9rem;margin-bottom:.35rem">Select reason for cancellation:</p>
                        <select id="patient-cancel-reason" style="width:100%;margin-bottom:.75rem;padding:.5rem .75rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                            <option value="Schedule conflict or travel">Schedule conflict or travel</option>
                            <option value="Emergency resolved / Feeling better">Emergency resolved / Feeling better</option>
                            <option value="Visiting alternate clinic">Visiting alternate clinic</option>
                            <option value="Wait time too long">Wait time too long</option>
                            <option value="Personal circumstances">Personal circumstances</option>
                        </select>
                        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                            <button class="btn-secondary" id="keep-appointment" type="button">Keep appointment</button>
                            <button class="btn-danger" id="confirm-withdraw" type="button">Confirm cancellation</button>
                        </div>
                    </div>
                </div>
                <p id="appointment-manager-status" class="inline-status" role="status" aria-live="polite"></p>
            </section>`;
            document.body.appendChild(backdrop);
            const close = () => { backdrop.remove(); trigger?.focus(); };
            backdrop.querySelectorAll('[data-close-manager]').forEach(button => button.onclick = close);
            backdrop.onclick = event => { if (event.target === backdrop) close(); };
            backdrop.onkeydown = event => { if (event.key === 'Escape') close(); };
            backdrop.querySelector('#reschedule-form').onsubmit = async event => {
                event.preventDefault();
                const submit = event.currentTarget.querySelector('button[type="submit"]');
                const selected = slots.find(slot => slot.value === backdrop.querySelector('#reschedule-slot').value) || slots[0];
                submit.disabled = true;
                submit.textContent = 'Saving...';
                try {
                    await window.App.DB.updatePatient(visit.id, { appointmentDate: selected.date, appointmentSlot: selected.slot, status: 'waiting' });
                    recordPatientVisit({ ...visit, appointmentDate: selected.date, appointmentSlot: selected.slot, status: 'Waiting' });
                    close();
                    window.App.UI.toast('Appointment time updated in the patient and hospital views.', 'success');
                    navigate('/dashboard/patient');
                } catch (error) {
                    submit.disabled = false;
                    submit.textContent = 'Save new time';
                    backdrop.querySelector('#appointment-manager-status').textContent = error.message || 'We could not reschedule this appointment.';
                }
            };
            const confirmation = backdrop.querySelector('#withdraw-confirmation');
            backdrop.querySelector('#begin-withdraw').onclick = () => { confirmation.hidden = false; backdrop.querySelector('#confirm-withdraw').focus(); };
            backdrop.querySelector('#keep-appointment').onclick = () => { confirmation.hidden = true; backdrop.querySelector('#begin-withdraw').focus(); };
            backdrop.querySelector('#confirm-withdraw').onclick = async event => {
                const button = event.currentTarget;
                const reason = backdrop.querySelector('#patient-cancel-reason')?.value || 'Schedule conflict';
                button.disabled = true;
                button.textContent = 'Cancelling...';
                try {
                    await window.App.Store.cancelAppointment(visit.id, 'patient', reason);
                    close();
                    window.App.UI.toast('Appointment cancelled and doctor slot released.', 'success');
                    navigate('/dashboard/patient');
                } catch (error) {
                    button.disabled = false;
                    button.textContent = 'Confirm cancellation';
                    backdrop.querySelector('#appointment-manager-status').textContent = error.message || 'We could not update this appointment.';
                }
            };
            if (window.lucide) window.lucide.createIcons();
            backdrop.querySelector('[data-close-manager]')?.focus();
        }

        const profileForm = container.querySelector('#profile-form');
        if (profileForm) {
            profileForm.onsubmit = e => {
                e.preventDefault();
                const name = container.querySelector('#pf-name')?.value.trim() || 'Patient';
                const age = container.querySelector('#pf-age')?.value || '32';
                const gender = container.querySelector('#pf-gender')?.value || 'Female';
                const bloodGroup = container.querySelector('#pf-blood')?.value || 'O+';
                const city = container.querySelector('#pf-city')?.value.trim() || 'Hyderabad';
                const doctorPref = container.querySelector('#pf-pref')?.value || 'General consultation';

                updatePatientData('name', name);
                updatePatientData('age', age);
                updatePatientData('gender', gender);
                updatePatientData('bloodGroup', bloodGroup);
                updatePatientData('city', city);
                updatePatientData('doctorPref', doctorPref);

                try {
                    const profileKey = `smartcare.patientProfile_${state.loggedEmail || 'default'}`;
                    localStorage.setItem(profileKey, JSON.stringify({ name, age, gender, bloodGroup, city, doctorPref }));
                } catch {}

                window.App.UI.toast('Patient profile updated successfully!', 'success');
                navigate('/dashboard/patient?tab=profile');
            };
        }

        container.querySelector('#workspace-logout').onclick = logout;
        window.App.UI.bindTopbarControls(container);
        if (state.isLogged) {
            window.App.UI.syncMobileBottomNav('patient', state.route);
        } else {
            document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
        }

        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

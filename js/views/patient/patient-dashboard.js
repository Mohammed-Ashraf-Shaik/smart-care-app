(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.PatientDashboard = function () {
        const { state, setView, navigate, logout, recordPatientVisit, sortQueue } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';
        const patientData = state.patientData || {};
        const patientName = patientData.name || (state.loggedEmail || 'Patient').split('@')[0].replace(/[._-]/g, ' ');
        const latestVisit = state.patientVisits[0];
        const activeTab = state.activeTab || '';
        const isApplyTab = activeTab === 'apply';
        const showOverview = (activeTab === 'overview' || activeTab === '') && !isApplyTab;
        const showVisits = activeTab === 'visits';
        const showProfile = activeTab === 'profile';
        const activeVisit = state.patientVisits.find(visit => !['completed', 'cancelled', 'no-show'].includes(String(visit.status || '').toLowerCase()));
        const visitStatusLabel = value => ({ booked: 'Booked', waiting: 'Waiting for the centre', called: 'Please proceed to reception', in_progress: 'In consultation', completed: 'Completed', cancelled: 'Cancelled' }[String(value || 'booked').toLowerCase()] || 'Booked');
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

        const appointmentCard = activeVisit ? `
            <section class="patient-appointment-card" aria-label="Next appointment and live queue status">
                <div class="appointment-icon">${icon('calendar-clock', 22)}</div>
                <div class="appointment-copy">
                    <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next appointment</span>
                    <h2>${esc(activeVisit.hospital || 'SmartCare centre')}</h2>
                    <p>${esc(activeVisit.reason || 'General consultation')} · ${esc(activeVisit.date || 'Date pending')} · ${esc(activeVisit.city || state.patientData.city || 'Hyderabad')}</p>
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
                        <button id="cancel-appointment" class="text-link text-link-dark" type="button">Cancel</button>
                    </div>
                </div>
            </section>` : `
            <section class="patient-appointment-card patient-appointment-empty" aria-label="Next appointment">
                <div class="appointment-icon">${icon('calendar-plus', 22)}</div>
                <div class="appointment-copy">
                    <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> No upcoming appointment</span>
                    <h2>Keep your care plan moving.</h2>
                    <p>Choose a nearby centre and reserve a visit when you are ready.</p>
                </div>
                <a class="text-link text-link-dark btn-icon" data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Book a visit ${icon('arrow-right', 15)}</a>
            </section>`;

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
                <header class="provider-header">
                    <div>
                        <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Patient dashboard</div>
                        <h1>Good to see you, ${esc(patientName)}.</h1>
                        <p>${isApplyTab ? 'Reserve your care visit step-by-step.' : 'Keep your care plans, previous visits, and prescription records in one place.'}</p>
                    </div>
                    <div class="provider-date">${state.patientVisits.length} saved records<br><strong>Private demo history</strong></div>
                </header>
                ${isApplyTab ? `<div id="embedded-booking-mount"></div>` : ''}
                ${showOverview ? `
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
                                <label for="pf-pref">Preferred Care Specialty</label>
                                <select id="pf-pref">
                                    <option value="General consultation" ${patientData.doctorPref === 'General consultation' ? 'selected' : ''}>General consultation / OPD</option>
                                    <option value="Women's health" ${patientData.doctorPref === "Women's health" ? 'selected' : ''}>Women's health / Gynaecology</option>
                                    <option value="Child care" ${patientData.doctorPref === 'Child care' ? 'selected' : ''}>Child care / Paediatrics</option>
                                    <option value="Emergency & Triage" ${patientData.doctorPref === 'Emergency & Triage' ? 'selected' : ''}>Emergency &amp; Acute Triage</option>
                                </select>
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

        const overviewAction = container.querySelector('.patient-next-action');
        if (overviewAction) overviewAction.insertAdjacentHTML('beforebegin', appointmentCard);

        const workspaceMain = container.querySelector('main');
        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Patient portal navigation');
        workspaceNav.innerHTML = `
            <a class="${activeTab === 'overview' || activeTab === '' ? 'active' : ''}" href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a>
            <a class="${isApplyTab ? 'active' : ''}" href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1">${icon('calendar-plus', 16)}<span>Book appointment</span></a>
            <a href="/dashboard/patient/history" data-route="/dashboard/patient/history">${icon('file-text', 16)}<span>Medical Passport</span></a>
            <a class="${activeTab === 'visits' ? 'active' : ''}" href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a>
            <a class="${activeTab === 'profile' ? 'active' : ''}" href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a>
            <div class="nav-divider"></div>
            <a href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a>
            <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
        `;

        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);

        if (isApplyTab && window.App.Views.Patient) {
            const mount = workspaceContent.querySelector('#embedded-booking-mount');
            if (mount) mount.appendChild(window.App.Views.Patient(true));
        }

        // Bind Prescription & Lab Report modals
        container.querySelectorAll('.btn-view-rx').forEach(btn => {
            btn.onclick = () => {
                const visitId = btn.dataset.visitId;
                const visit = state.patientVisits.find(v => String(v.id) === String(visitId)) || activeVisit || latestVisit || {};
                window.App.UI.showPrescriptionModal({
                    ...visit,
                    patientName: patientName,
                    age: state.patientData.age || '32',
                    gender: state.patientData.gender || 'Female'
                });
            };
        });

        const cancelButton = container.querySelector('#cancel-appointment');
        if (cancelButton && activeVisit) cancelButton.onclick = async () => {
            cancelButton.disabled = true;
            try {
                if (activeVisit.id && window.App.DB?.updatePatient) await window.App.DB.updatePatient(activeVisit.id, { status: 'cancelled' });
                recordPatientVisit({ ...activeVisit, status: 'Cancelled' });
                window.App.UI.toast('Demo booking cancelled.', 'success');
                navigate('/dashboard/patient');
            } catch (error) {
                cancelButton.disabled = false;
                window.App.UI.toast(error.message || 'We could not cancel this booking.', 'error');
            }
        };

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
        container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav('patient', state.route));
        window.App.UI.bindMobileBottomNav(container);

        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.PatientHistory = function () {
        const { state, getMedicalHistory, saveMedicalHistory, registerMedicalPassport, logout, hrefFor } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';

        const historyData = getMedicalHistory();
        const patientData = state.patientData || {};
        const patientName = patientData.name || (state.loggedEmail ? state.loggedEmail.split('@')[0].replace(/[._-]/g, ' ') : 'Patient');
        const patientAge = patientData.age ? `${patientData.age} Y` : 'N/A';
        const patientGender = patientData.gender || 'Not specified';
        const patientCity = patientData.city || 'Hyderabad';
        
        // Parse dynamic URL parameters (e.g. ?passportId=SC-PASSPORT-8924&mode=view)
        const urlParams = new URLSearchParams(window.location.search);
        const ownerSeed = String(state.loggedEmail || 'guest').toLowerCase();
        const passportNumber = ownerSeed === 'patient@smartcare.demo' ? 8924 : 100000 + ([...ownerSeed].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0) % 900000);
        const dynamicPassportId = urlParams.get('passportId') || urlParams.get('pin') || `SC-PASSPORT-${passportNumber}`;
        const isPrintMode = urlParams.get('mode') === 'print';
        registerMedicalPassport(dynamicPassportId);

        const prevDoc = historyData.previousProvider || { doctorName: '', hospitalName: '', city: '', contactPhone: '' };
        const diseases = Array.isArray(historyData.diseases) ? historyData.diseases : [];
        const preferences = Array.isArray(historyData.personalPreferences) ? historyData.personalPreferences : [];
        const effectiveMeds = Array.isArray(historyData.effectiveMedications) ? historyData.effectiveMedications : [];
        const allergies = Array.isArray(historyData.allergiesAndAvoid) ? historyData.allergiesAndAvoid : [];
        const careConditions = Array.isArray(historyData.careConditions) ? historyData.careConditions : [];
        const protocols = Array.isArray(historyData.emergencyProtocols) ? historyData.emergencyProtocols : [];
        const lastUpdated = historyData.lastUpdated || 'No history recorded yet';

        container.innerHTML = `
            <!-- STANDARD UNIFORM SHELL HEADER -->
            <header class="flow-topbar print-hide" data-section="history-topbar">
                <div class="topbar-left">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient Portal</span></span>
                    </a>
                </div>
                <div class="topbar-actions">
                    ${window.App.UI.topbarControls(true)}
                </div>
            </header>

            <div class="provider-shell">
                <aside class="workspace-drawer workspace-tabs" data-section="patient-nav" aria-label="Patient workspace tabs">
                    <a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a>
                    <a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a>
                    <a class="active" href="/dashboard/patient/history" data-route="/dashboard/patient/history">${icon('file-text', 16)}<span>Medical Passport</span></a>
                    <a href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a>
                    <a href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a>
                    <div class="nav-divider"></div>
                    <a href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
                    <a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a>
                    <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
                </aside>

                <main class="workspace-content section-patient-history" data-section="patient-history" aria-label="Patient medical history passport" style="padding:1.25rem 1rem 4rem">
                    
                    <!-- ON-SCREEN HEADER & BODY ACTIONS -->
                    <div class="flow-header print-hide" style="margin-bottom:1.5rem">
                        <div style="display:flex;justify-content:space-between;align-items:start;width:100%;flex-wrap:wrap;gap:1rem">
                            <div>
                                <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Health Passport (ID: ${esc(dynamicPassportId)})</div>
                                <h1 style="font-size:1.6rem;margin:.2rem 0">Patient Medical History</h1>
                                <p style="font-size:.88rem;color:var(--muted)">Manage your medical records, effective medicines, allergies, and care preferences in one portable profile.</p>
                            </div>
                            <div style="display:flex;align-items:center;gap:.4rem;background:var(--mint);color:var(--teal);font-size:.76rem;font-weight:600;padding:.4rem .85rem;border-radius:2rem">
                                ${icon('clock-3', 14)} <span>Last updated: ${esc(lastUpdated)}</span>
                            </div>
                        </div>

                        <!-- PAGE BODY ACTION BUTTONS -->
                        <div class="flow-header-actions print-hide" style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-top:1.25rem">
                            <button id="edit-passport-btn" class="btn-primary btn-icon" type="button" style="min-height:2.4rem">
                                ${icon('plus-circle', 16)} <span>Add / Edit Medical Record</span>
                            </button>
                            <button id="download-pdf-btn" class="btn-secondary btn-icon" type="button" style="min-height:2.4rem">
                                ${icon('download', 16)} <span>Download PDF Report</span>
                            </button>
                            <button id="qr-handoff-btn" class="btn-ghost btn-icon" type="button" style="min-height:2.4rem">
                                ${icon('qr-code', 16)} <span>Doctor QR Handoff</span>
                            </button>
                        </div>
                    </div>

                    <!-- ON-SCREEN PATIENT DEMOGRAPHICS CARD -->
                    <div class="card print-hide" style="padding:1.25rem;border-radius:1.2rem;background:#fff;border:1px solid var(--line);margin-bottom:1.25rem">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;padding-bottom:.5rem;border-bottom:1px solid var(--line)">
                            <strong style="font-size:.9rem;color:var(--teal-dark);display:flex;align-items:center;gap:.4rem">
                                ${icon('user-round', 16)} Patient Demographics
                            </strong>
                            <span class="badge" style="background:#e8f4fb;color:var(--teal);font-size:.72rem">Verified Profile</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:1rem;font-size:.84rem">
                            <div><small style="color:var(--muted);display:block">Full Name</small><strong>${esc(patientName)}</strong></div>
                            <div><small style="color:var(--muted);display:block">Age / Gender</small><strong>${esc(patientAge)} / ${esc(patientGender)}</strong></div>
                            <div><small style="color:var(--muted);display:block">City</small><strong>${esc(patientCity)}</strong></div>
                            <div><small style="color:var(--muted);display:block">Passport Ref</small><strong>${esc(dynamicPassportId)}</strong></div>
                        </div>
                    </div>

                    <!-- DEDICATED PRINTABLE MEDICAL REPORT CONTAINER -->
                    <div id="printable-medical-report">
                        
                        <!-- PDF PRINT HEADER -->
                        <div id="pdf-print-header" class="print-only">
                            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:1rem;border-bottom:2.5px solid #0a3b69;margin-bottom:1.25rem">
                                <div style="display:flex;align-items:center;gap:.75rem">
                                    <span style="width:2.4rem;height:2.4rem;display:grid;place-items:center;background:#0a3b69;color:#fff;border-radius:.6rem;font-weight:bold">${icon('heart-pulse', 22)}</span>
                                    <div>
                                        <strong style="font-size:1.4rem;color:#0a3b69;letter-spacing:-.03em;display:block">SmartCare Healthcare Systems</strong>
                                        <small style="color:#5a7a8e;font-size:.78rem;font-weight:600">Official Patient Profile &amp; Medical History Report</small>
                                    </div>
                                </div>
                                <div style="text-align:right">
                                    <span style="display:block;font-size:.82rem;color:#0a3b69;font-weight:800">PASSPORT ID: ${esc(dynamicPassportId)}</span>
                                    <span style="display:block;font-size:.74rem;color:#5a7a8e;font-weight:600">Report Date: ${esc(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}</span>
                                </div>
                            </div>

                            <!-- PATIENT DEMOGRAPHICS PRINT SUMMARY -->
                            <div style="padding:1rem;border:1px solid #c2dcf3;border-radius:.75rem;background:#f0f7fc;margin-bottom:1.25rem;display:grid;grid-template-columns:repeat(4, 1fr);gap:1rem;font-size:.82rem">
                                <div><strong>Patient Name:</strong> <span>${esc(patientName)}</span></div>
                                <div><strong>Age / Gender:</strong> <span>${esc(patientAge)} / ${esc(patientGender)}</span></div>
                                <div><strong>City:</strong> <span>${esc(patientCity)}</span></div>
                                <div><strong>Last Synced:</strong> <span>${esc(lastUpdated)}</span></div>
                            </div>
                        </div>

                        <!-- PREVIOUS DOCTOR & CLINICAL OVERVIEW CARD -->
                        <div class="card patient-history-overview-card" style="padding:1.25rem;border-radius:1.2rem;background:linear-gradient(145deg, #f0f7fc 0%, #e5f1fc 100%);border:1px solid #c2dcf3;margin-bottom:1.5rem">
                            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem">
                                <div>
                                    <small style="color:var(--muted);font-weight:700;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:.3rem">
                                        ${icon('hospital', 13)} Previous Primary Provider
                                    </small>
                                    <strong style="display:block;color:var(--teal-dark);font-size:.95rem;margin-top:.25rem">
                                        ${prevDoc.doctorName ? esc(prevDoc.doctorName) : '<span style="color:var(--muted);font-weight:400;font-style:italic">No previous doctor recorded</span>'}
                                    </strong>
                                    <span style="font-size:.78rem;color:var(--muted);display:block;margin-top:.15rem">
                                        ${prevDoc.hospitalName ? esc(prevDoc.hospitalName) : ''} ${prevDoc.city ? `(${esc(prevDoc.city)})` : ''} ${prevDoc.contactPhone ? `· ${esc(prevDoc.contactPhone)}` : ''}
                                    </span>
                                </div>
                                <div>
                                    <small style="color:var(--muted);font-weight:700;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:.3rem">
                                        ${icon('activity', 13)} Active Diagnosed Conditions
                                    </small>
                                    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.3rem">
                                        ${diseases.length ? diseases.map(d => `<span class="badge" style="background:#fff;color:var(--teal-dark);border:1px solid #b8daf5;font-size:.74rem;padding:.2rem .6rem;display:inline-flex;align-items:center;gap:.3rem">${icon('hospital', 12)} ${esc(d.diseaseName)} (${esc(d.diagnosedSince)})</span>`).join('') : '<span style="font-size:.78rem;color:var(--muted)">No chronic conditions recorded</span>'}
                                    </div>
                                </div>
                                <div>
                                    <small style="color:var(--muted);font-weight:700;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:.3rem">
                                        ${icon('star', 13)} Personal Care Preferences
                                    </small>
                                    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.3rem">
                                        ${preferences.length ? preferences.map(p => `<span class="badge" style="background:#fff;color:var(--ink);border:1px solid var(--line);font-size:.74rem;padding:.2rem .6rem;display:inline-flex;align-items:center;gap:.3rem">${icon('star', 12)} ${esc(p.preference)}</span>`).join('') : '<span style="font-size:.78rem;color:var(--muted)">No preferences recorded</span>'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 4-PILLAR HEALTH PASSPORT GRID -->
                        <div class="history-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(290px, 1fr));gap:1.25rem">
                            
                            <!-- PILLAR 1: EFFECTIVE MEDICATIONS -->
                            <div class="card history-pillar-card" style="padding:1.25rem;border-radius:1.2rem;background:#fff;border:1px solid var(--line)">
                                <div class="pillar-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid var(--line)">
                                    <div style="display:flex;align-items:center;gap:.6rem">
                                        <span style="width:2rem;height:2rem;display:grid;place-items:center;border-radius:.5rem;background:#e8f4fb;color:var(--teal)">${icon('pill', 18)}</span>
                                        <h3 style="margin:0;font-size:1.02rem;color:var(--teal-dark)">Effective Medicines</h3>
                                    </div>
                                </div>
                                <p style="font-size:.78rem;color:var(--muted);margin-bottom:.85rem">Medicines &amp; dosages that work best for your condition.</p>
                                <div class="pillar-list" style="display:flex;flex-direction:column;gap:.75rem">
                                    ${effectiveMeds.length ? effectiveMeds.map((med, idx) => `
                                        <div class="history-item-row" style="padding:.75rem;border-radius:.8rem;background:var(--canvas);border:1px solid var(--line)">
                                            <div style="display:flex;justify-content:space-between;align-items:start;gap:.5rem">
                                                <strong style="font-size:.88rem;color:var(--ink)">${esc(med.medicineName)}</strong>
                                                <div style="display:flex;align-items:center;gap:.3rem">
                                                    <span class="badge" style="background:#e8f4fb;color:var(--teal);font-size:.7rem;padding:.15rem .5rem">${esc(med.dosage)}</span>
                                                    <button type="button" class="btn-delete-item print-hide" data-type="med" data-idx="${idx}" style="border:0;background:none;color:#dc2626;cursor:pointer;padding:0 .2rem">${icon('trash-2', 13)}</button>
                                                </div>
                                            </div>
                                            <div style="font-size:.78rem;color:var(--muted);margin-top:.25rem">Condition: ${esc(med.conditionTreated)}</div>
                                            ${med.notes ? `<div style="font-size:.72rem;color:var(--ink);margin-top:.35rem;font-style:italic">Note: "${esc(med.notes)}"</div>` : ''}
                                        </div>
                                    `).join('') : '<div style="font-size:.78rem;color:var(--muted);padding:.75rem;background:var(--canvas);border-radius:.6rem;text-align:center">No effective medications recorded. Click "Add / Edit Medical Record" to add.</div>'}
                                </div>
                            </div>

                            <!-- PILLAR 2: ALLERGIES & AVOID LIST -->
                            <div class="card history-pillar-card" style="padding:1.25rem;border-radius:1.2rem;background:#fff;border:1px solid #fecaca">
                                <div class="pillar-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid #fee2e2">
                                    <div style="display:flex;align-items:center;gap:.6rem">
                                        <span style="width:2rem;height:2rem;display:grid;place-items:center;border-radius:.5rem;background:#fee2e2;color:#dc2626">${icon('triangle-alert', 18)}</span>
                                        <h3 style="margin:0;font-size:1.02rem;color:#991b1b">Allergies &amp; Avoid List</h3>
                                    </div>
                                </div>
                                <p style="font-size:.78rem;color:var(--muted);margin-bottom:.85rem">Drugs &amp; substances that must be strictly avoided by doctors.</p>
                                <div class="pillar-list" style="display:flex;flex-direction:column;gap:.75rem">
                                    ${allergies.length ? allergies.map((alg, idx) => `
                                        <div class="history-item-row" style="padding:.75rem;border-radius:.8rem;background:#fff5f5;border:1px solid #fecaca">
                                            <div style="display:flex;justify-content:space-between;align-items:start;gap:.5rem">
                                                <strong style="font-size:.88rem;color:#991b1b;display:flex;align-items:center;gap:.3rem">
                                                    ${icon('triangle-alert', 14)} ${esc(alg.substance)}
                                                </strong>
                                                <div style="display:flex;align-items:center;gap:.3rem">
                                                    <span class="badge" style="background:#fee2e2;color:#dc2626;font-size:.7rem;padding:.15rem .5rem">${esc(alg.severity)}</span>
                                                    <button type="button" class="btn-delete-item print-hide" data-type="alg" data-idx="${idx}" style="border:0;background:none;color:#dc2626;cursor:pointer;padding:0 .2rem">${icon('trash-2', 13)}</button>
                                                </div>
                                            </div>
                                            <div style="font-size:.76rem;color:#7f1d1d;margin-top:.35rem">${esc(alg.reactionDescription)}</div>
                                        </div>
                                    `).join('') : '<div style="font-size:.78rem;color:var(--muted);padding:.75rem;background:#fff5f5;border-radius:.6rem;text-align:center">No allergies recorded. Click "Add / Edit Medical Record" to add.</div>'}
                                </div>
                            </div>

                            <!-- PILLAR 3: OPTIMAL CARE CONDITIONS -->
                            <div class="card history-pillar-card" style="padding:1.25rem;border-radius:1.2rem;background:#fff;border:1px solid var(--line)">
                                <div class="pillar-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid var(--line)">
                                    <div style="display:flex;align-items:center;gap:.6rem">
                                        <span style="width:2rem;height:2rem;display:grid;place-items:center;border-radius:.5rem;background:#fef3c7;color:#d97706">${icon('shield-alert', 18)}</span>
                                        <h3 style="margin:0;font-size:1.02rem;color:var(--teal-dark)">Optimal Care Conditions</h3>
                                    </div>
                                </div>
                                <p style="font-size:.78rem;color:var(--muted);margin-bottom:.85rem">Dietary, positioning, &amp; environmental guidelines.</p>
                                <div class="pillar-list" style="display:flex;flex-direction:column;gap:.75rem">
                                    ${careConditions.length ? careConditions.map((cond, idx) => `
                                        <div class="history-item-row" style="padding:.75rem;border-radius:.8rem;background:#fffdf5;border:1px solid #fef3c7">
                                            <div style="display:flex;justify-content:space-between;align-items:start">
                                                <span class="badge" style="background:#fef3c7;color:#b45309;font-size:.68rem;padding:.1rem .45rem;margin-bottom:.3rem;display:inline-block">${esc(cond.category)}</span>
                                                <button type="button" class="btn-delete-item print-hide" data-type="cond" data-idx="${idx}" style="border:0;background:none;color:#dc2626;cursor:pointer;padding:0 .2rem">${icon('trash-2', 13)}</button>
                                            </div>
                                            <div style="font-size:.82rem;color:var(--ink);font-weight:600">${esc(cond.instruction)}</div>
                                        </div>
                                    `).join('') : '<div style="font-size:.78rem;color:var(--muted);padding:.75rem;background:#fffdf5;border-radius:.6rem;text-align:center">No care conditions recorded. Click "Add / Edit Medical Record" to add.</div>'}
                                </div>
                            </div>

                            <!-- PILLAR 4: EMERGENCY PROTOCOLS -->
                            <div class="card history-pillar-card" style="padding:1.25rem;border-radius:1.2rem;background:#fff;border:1px solid var(--line)">
                                <div class="pillar-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.65rem;border-bottom:1px solid var(--line)">
                                    <div style="display:flex;align-items:center;gap:.6rem">
                                        <span style="width:2rem;height:2rem;display:grid;place-items:center;border-radius:.5rem;background:#e0e7ff;color:#4338ca">${icon('siren', 18)}</span>
                                        <h3 style="margin:0;font-size:1.02rem;color:var(--teal-dark)">Emergency Protocols</h3>
                                    </div>
                                </div>
                                <p style="font-size:.78rem;color:var(--muted);margin-bottom:.85rem">Step-by-step crisis action plans for attending doctors.</p>
                                <div class="pillar-list" style="display:flex;flex-direction:column;gap:.75rem">
                                    ${protocols.length ? protocols.map((emg, idx) => `
                                        <div class="history-item-row" style="padding:.75rem;border-radius:.8rem;background:#f5f3ff;border:1px solid #ddd6fe">
                                            <div style="display:flex;justify-content:space-between;align-items:start">
                                                <strong style="font-size:.82rem;color:#4338ca;display:flex;align-items:center;gap:.3rem">
                                                    ${icon('siren', 14)} Trigger: ${esc(emg.triggerCondition)}
                                                </strong>
                                                <button type="button" class="btn-delete-item print-hide" data-type="emg" data-idx="${idx}" style="border:0;background:none;color:#dc2626;cursor:pointer;padding:0 .2rem">${icon('trash-2', 13)}</button>
                                            </div>
                                            <div style="font-size:.78rem;color:#3730a3;margin-top:.3rem">Action: ${esc(emg.actionSteps)}</div>
                                        </div>
                                    `).join('') : '<div style="font-size:.78rem;color:var(--muted);padding:.75rem;background:#f5f3ff;border-radius:.6rem;text-align:center">No emergency protocols recorded. Click "Add / Edit Medical Record" to add.</div>'}
                                </div>
                            </div>

                        </div>

                        <!-- PDF PRINT FOOTER -->
                        <div id="pdf-print-footer" class="print-only">
                            <div style="margin-top:2.5rem;padding-top:1rem;border-top:1.5px solid #d8e4ef;display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:#5a7a8e">
                                <div>
                                    <strong>Confidential Medical Document</strong> — Generated by SmartCare Healthcare Systems.
                                    <br>For authorized clinical, emergency, &amp; attending physician use only.
                                </div>
                                <div style="text-align:right">
                                    <strong>SmartCare Patient Health Passport · Page 1 of 1</strong>
                                    <br><span>https://mohammed-ashraf-shaik.github.io/smart-care-app/</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- DYNAMIC ADD & EDIT PASSPORT MODAL OVERLAY -->
                    <div id="edit-passport-modal" class="modal-overlay print-hide" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999;place-items:center;padding:1rem">
                        <div class="modal-card" style="background:#fff;padding:1.5rem;border-radius:1.5rem;max-width:620px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.2);max-height:88vh;overflow-y:auto">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:.5rem;border-bottom:1px solid var(--line)">
                                <h3 style="margin:0;color:var(--teal-dark);font-size:1.15rem;display:flex;align-items:center;gap:.5rem">
                                    ${icon('square-pen', 18)} Add &amp; Edit Medical History Records
                                </h3>
                                <button id="cancel-edit-modal-top" type="button" class="btn-ghost modal-close-button" aria-label="Close medical record editor">${icon('x', 18)}</button>
                            </div>
                            
                            <form id="edit-passport-form">
                                <div style="display:grid;gap:1.25rem">
                                    
                                    <!-- SECTION 1: PREVIOUS PROVIDER -->
                                    <div class="modal-section-card">
                                        <strong style="font-size:.85rem;color:var(--teal-dark);display:block;margin-bottom:.6rem">1. Previous Doctor &amp; Primary Clinic</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <input id="edit-doc-name" type="text" value="${esc(prevDoc.doctorName)}" placeholder="Doctor Name (e.g. Dr. Ramesh Sharma)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
                                                <input id="edit-hosp-name" type="text" value="${esc(prevDoc.hospitalName)}" placeholder="Hospital / Clinic Name" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                                <input id="edit-doc-phone" type="text" value="${esc(prevDoc.contactPhone)}" placeholder="Contact Phone Number" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SECTION 2: ADD NEW EFFECTIVE MEDICATION -->
                                    <div class="modal-section-card">
                                        <strong style="font-size:.85rem;color:var(--teal-dark);display:block;margin-bottom:.6rem">2. Add Effective Medication</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <input id="edit-med-name" type="text" value="" placeholder="Medication Name (e.g. Dolo 650)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
                                                <input id="edit-med-dosage" type="text" value="" placeholder="Dosage (e.g. 650mg as needed)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                                <input id="edit-med-condition" type="text" value="" placeholder="Condition Treated" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SECTION 3: ADD NEW ALLERGY ALERT -->
                                    <div class="modal-section-card modal-section-alert">
                                        <strong style="font-size:.85rem;color:#991b1b;display:block;margin-bottom:.6rem">3. Add Allergy &amp; Avoid Alert</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <input id="edit-alg-substance" type="text" value="" placeholder="Substance to Avoid (e.g. Penicillin / Amoxicillin)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            <input id="edit-alg-desc" type="text" value="" placeholder="Reaction Description (e.g. Severe skin hives)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                        </div>
                                    </div>

                                    <!-- SECTION 4: CARE CONDITION -->
                                    <div class="modal-section-card">
                                        <strong style="font-size:.85rem;color:var(--teal-dark);display:block;margin-bottom:.6rem">4. Add Care Condition</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <input id="edit-care-category" type="text" value="" placeholder="Category (e.g. Respiratory care)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            <input id="edit-care-instruction" type="text" value="" placeholder="Care instruction" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                        </div>
                                    </div>

                                    <!-- SECTION 5: EMERGENCY PROTOCOL -->
                                    <div class="modal-section-card modal-section-alert">
                                        <strong style="font-size:.85rem;color:#991b1b;display:block;margin-bottom:.6rem">5. Add Emergency Protocol</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <input id="edit-emergency-trigger" type="text" value="" placeholder="Trigger condition" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            <input id="edit-emergency-action" type="text" value="" placeholder="Recommended action steps" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                        </div>
                                    </div>

                                    <!-- SECTION 6: CLINICAL OVERVIEW -->
                                    <div class="modal-section-card">
                                        <strong style="font-size:.85rem;color:var(--teal-dark);display:block;margin-bottom:.6rem">6. Add Condition or Care Preference</strong>
                                        <div style="display:grid;gap:.6rem">
                                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem">
                                                <input id="edit-disease-name" type="text" value="" placeholder="Disease (e.g. Type-2 Diabetes)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                                <input id="edit-disease-since" type="text" value="" placeholder="Duration (e.g. 3 years)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                            </div>
                                            <input id="edit-pref-text" type="text" value="" placeholder="Personal Preference (e.g. Quiet room, Low sodium diet)" style="width:100%;padding:.6rem;border-radius:.5rem;border:1px solid var(--line)">
                                        </div>
                                    </div>

                                </div>

                                <div style="display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.5rem">
                                    <button id="cancel-edit-btn" type="button" class="btn-ghost">Cancel</button>
                                    <button type="submit" class="btn-primary">Save Passport Updates</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- QR HANDOFF MODAL CONTAINER -->
                    <div id="qr-modal-overlay" class="modal-overlay print-hide" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999;place-items:center;padding:1rem">
                        <div class="modal-card" style="background:#fff;padding:2rem;border-radius:1.5rem;max-width:440px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.2);position:relative">
                            <button id="close-qr-modal" class="btn-ghost modal-close-button" type="button" aria-label="Close QR handoff" style="position:absolute;top:1rem;right:1rem">${icon('x', 18)}</button>
                            <div style="width:3.5rem;height:3.5rem;margin:0 auto 1rem;display:grid;place-items:center;border-radius:1rem;background:#e8f4fb;color:var(--teal)">
                                ${icon('qr-code', 28)}
                            </div>
                            <h3 style="margin:0 0 .4rem;color:var(--teal-dark)">Doctor QR Handoff Code</h3>
                            <p style="font-size:.8rem;color:var(--muted);margin-bottom:1.25rem">Ask the clinician to scan this code inside the SmartCare Doctor workspace to open a read-only demo summary.</p>

                            <div id="qr-code-canvas" style="display:inline-block;padding:1rem;background:#fff;border:2px dashed var(--teal);border-radius:1rem;margin-bottom:1rem"></div>

                            <div style="background:var(--mint);padding:.75rem;border-radius:.8rem;margin-bottom:1.5rem">
                                <small style="color:var(--muted);display:block;font-size:.72rem">Medical Passport ID</small>
                                <strong style="font-size:1.2rem;letter-spacing:.1em;color:var(--teal-dark)">${esc(dynamicPassportId)}</strong>
                            </div>

                            <button id="close-qr-done" class="btn-primary btn-wide" type="button">Done Sharing</button>
                        </div>
                    </div>

                </main>
            </div>
        `;

        // Bind topbar & navigation
        window.App.UI.bindTopbarControls(container);

        const logoutBtn = container.querySelector('#workspace-logout');
        if (logoutBtn) logoutBtn.onclick = logout;

        // Download PDF / Print handler
        const downloadPdfBtn = container.querySelector('#download-pdf-btn');
        if (downloadPdfBtn) {
            downloadPdfBtn.onclick = () => {
                window.print();
            };
        }

        if (isPrintMode) {
            window.setTimeout(() => window.print(), 500);
        }

        // Delete individual history item handlers
        container.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.onclick = (e) => {
                const type = btn.dataset.type;
                const idx = parseInt(btn.dataset.idx, 10);
                if (type === 'med') effectiveMeds.splice(idx, 1);
                if (type === 'alg') allergies.splice(idx, 1);
                if (type === 'cond') careConditions.splice(idx, 1);
                if (type === 'emg') protocols.splice(idx, 1);

                historyData.effectiveMedications = effectiveMeds;
                historyData.allergiesAndAvoid = allergies;
                historyData.careConditions = careConditions;
                historyData.emergencyProtocols = protocols;
                historyData.lastUpdated = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                saveMedicalHistory(historyData);
            };
        });

        // Edit Modal Handlers
        const editModal = container.querySelector('#edit-passport-modal');
        const editBtn = container.querySelector('#edit-passport-btn');
        const cancelEdit = container.querySelector('#cancel-edit-btn');
        const cancelEditTop = container.querySelector('#cancel-edit-modal-top');
        const editForm = container.querySelector('#edit-passport-form');

        if (editModal) {
            editModal.querySelector('.modal-card')?.setAttribute('role', 'dialog');
            editModal.querySelector('.modal-card')?.setAttribute('aria-modal', 'true');
            editModal.querySelector('.modal-card')?.setAttribute('aria-label', 'Add or update Medical Passport records');
            editModal.onclick = event => { if (event.target === editModal) closeEditModal(); };
            editModal.onkeydown = event => { if (event.key === 'Escape') closeEditModal(); };
        }
        const openEditModal = () => {
            if (!editModal) return;
            editModal.style.display = 'grid';
            editModal.querySelector('#edit-doc-name')?.focus();
        };
        function closeEditModal() {
            if (!editModal) return;
            editModal.style.display = 'none';
            editBtn?.focus();
        }
        if (editBtn) editBtn.onclick = openEditModal;
        if (cancelEdit) cancelEdit.onclick = closeEditModal;
        if (cancelEditTop) cancelEditTop.onclick = closeEditModal;

        if (editForm) {
            editForm.onsubmit = event => {
                event.preventDefault();
                const docName = container.querySelector('#edit-doc-name')?.value || '';
                const hospName = container.querySelector('#edit-hosp-name')?.value || '';
                const docPhone = container.querySelector('#edit-doc-phone')?.value || '';
                const diseaseName = container.querySelector('#edit-disease-name')?.value || '';
                const diseaseSince = container.querySelector('#edit-disease-since')?.value || '';
                const prefText = container.querySelector('#edit-pref-text')?.value || '';
                const medName = container.querySelector('#edit-med-name')?.value || '';
                const medDosage = container.querySelector('#edit-med-dosage')?.value || '';
                const medCondition = container.querySelector('#edit-med-condition')?.value || '';
                const algSubstance = container.querySelector('#edit-alg-substance')?.value || '';
                const algDesc = container.querySelector('#edit-alg-desc')?.value || '';
                const careCategory = container.querySelector('#edit-care-category')?.value || '';
                const careInstruction = container.querySelector('#edit-care-instruction')?.value || '';
                const emergencyTrigger = container.querySelector('#edit-emergency-trigger')?.value || '';
                const emergencyAction = container.querySelector('#edit-emergency-action')?.value || '';

                historyData.previousProvider = { doctorName: docName, hospitalName: hospName, city: prevDoc.city || 'Hyderabad', contactPhone: docPhone };
                historyData.lastUpdated = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                if (diseaseName) {
                    historyData.diseases = [{ id: `dis-${Date.now()}`, diseaseName, diagnosedSince: diseaseSince || 'Active', status: 'Managed' }, ...diseases];
                }
                if (prefText) {
                    historyData.personalPreferences = [{ id: `pref-${Date.now()}`, category: 'Personal Care', preference: prefText }, ...preferences];
                }
                if (medName) {
                    historyData.effectiveMedications = [{ id: `med-${Date.now()}`, medicineName: medName, dosage: medDosage || 'As directed', conditionTreated: medCondition || 'General treatment', notes: '' }, ...effectiveMeds];
                }
                if (algSubstance) {
                    historyData.allergiesAndAvoid = [{ id: `alg-${Date.now()}`, substance: algSubstance, severity: 'Severe', reactionDescription: algDesc || 'Severe reaction reported' }, ...allergies];
                }
                if (careCategory || careInstruction) {
                    historyData.careConditions = [{ id: `care-${Date.now()}`, category: careCategory || 'General care', instruction: careInstruction || 'Discuss this care condition with the treating clinician' }, ...careConditions];
                }
                if (emergencyTrigger || emergencyAction) {
                    historyData.emergencyProtocols = [{ id: `emg-${Date.now()}`, triggerCondition: emergencyTrigger || 'Emergency symptoms', actionSteps: emergencyAction || 'Seek immediate clinical assessment' }, ...protocols];
                }

                saveMedicalHistory(historyData);
            };
        }

        // QR Modal Handlers
        const qrModal = container.querySelector('#qr-modal-overlay');
        const qrBtn = container.querySelector('#qr-handoff-btn');
        const closeQr = container.querySelector('#close-qr-modal');
        const closeQrDone = container.querySelector('#close-qr-done');

        if (qrModal) {
            qrModal.querySelector('.modal-card')?.setAttribute('role', 'dialog');
            qrModal.querySelector('.modal-card')?.setAttribute('aria-modal', 'true');
            qrModal.querySelector('.modal-card')?.setAttribute('aria-label', 'Doctor QR handoff');
            qrModal.onclick = event => { if (event.target === qrModal) closeQrModal(); };
            qrModal.onkeydown = event => { if (event.key === 'Escape') closeQrModal(); };
        }

        function closeQrModal() {
            if (!qrModal) return;
            qrModal.style.display = 'none';
            qrBtn?.focus();
        }

        if (qrBtn) {
            qrBtn.onclick = () => {
                if (qrModal) {
                    qrModal.style.display = 'grid';
                    closeQr?.focus();
                }
                const qrTarget = container.querySelector('#qr-code-canvas');
                if (window.qrcode && qrTarget) {
                    const typeNumber = 4;
                    const errorCorrectionLevel = 'L';
                    const qr = window.qrcode(typeNumber, errorCorrectionLevel);
                    const shareUrl = hrefFor(`/login?role=doctor&passportId=${encodeURIComponent(dynamicPassportId)}`);
                    qr.addData(window.location.origin + shareUrl);
                    qr.make();
                    qrTarget.innerHTML = qr.createImgTag(5);
                }
            };
        }

        if (closeQr) closeQr.onclick = closeQrModal;
        if (closeQrDone) closeQrDone.onclick = closeQrModal;

        window.App.UI.bindMobileBottomNav(container);
        return container;
    };
})();

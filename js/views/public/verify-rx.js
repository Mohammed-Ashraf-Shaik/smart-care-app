(function () {
    const esc = str => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;

    window.App.Views.VerifyRx = function () {
        const { state, setView, navigate, getPrescriptionByRxId, dispensePrescription } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';

        // Extract ID from search parameter or hash
        const urlParams = new URLSearchParams(window.location.search);
        let rxIdQuery = urlParams.get('id') || urlParams.get('rx') || 'RX-2026-DEMO01';

        function render() {
            const rxRecord = getPrescriptionByRxId(rxIdQuery);

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark" style="background:var(--teal)">${icon('shield-check', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Official Prescription Registry</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(false)}
                        <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back to home</a>
                    </div>
                </div>

                <main class="verify-rx-shell" style="max-width:860px;margin:1.5rem auto;padding:0 1rem" role="main">
                    <div style="text-align:center;margin-bottom:2rem">
                        <span class="badge" style="background:#ebf8ff;color:#2b6cb0;font-weight:700;padding:.4rem .9rem;border-radius:20px;display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem">
                            ${icon('check-check', 14)} Tamper-Proof Cryptographic Verification
                        </span>
                        <h1 style="font-size:clamp(1.5rem, 4vw, 2.1rem);margin:.6rem 0 .4rem;color:var(--ink)">
                            Verify Medical Prescription
                        </h1>
                        <p style="color:var(--muted);max-width:540px;margin:0 auto;font-size:.92rem">
                            Pharmacists and healthcare providers can scan or enter a SmartCare Rx Token to verify authenticity against hospital records and prevent duplicate dispensing.
                        </p>
                    </div>

                    <!-- Search / Lookup Bar -->
                    <div class="provider-card rx-lookup-card" style="padding:1.25rem;margin-bottom:1.5rem">
                        <form id="verify-search-form" class="rx-search-form">
                            <div class="rx-search-input-wrap">
                                <span class="rx-search-icon">${icon('search', 16)}</span>
                                <input id="rx-search-input" type="text" value="${esc(rxIdQuery)}" placeholder="Enter Rx ID (e.g. RX-2026-DEMO01)" required>
                            </div>
                            <div class="rx-search-actions">
                                <button type="submit" class="btn-primary btn-icon">
                                    ${icon('shield-check', 16)} Verify Record
                                </button>
                                <button type="button" id="btn-scan-camera" class="btn-secondary btn-icon">
                                    ${icon('qr-code', 16)} Scan QR
                                </button>
                            </div>
                        </form>
                    </div>

                    ${rxRecord ? `
                        <!-- Authentic Record Found -->
                        <article class="prescription-verify-result" style="background:var(--surface);border:2px solid ${rxRecord.status === 'dispensed' ? '#feb2b2' : '#b2f5ea'};border-radius:16px;padding:1.5rem;box-shadow:0 6px 24px rgba(0,0,0,0.06);margin-bottom:2rem">
                            
                            <!-- Authenticity Header Banner -->
                            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid var(--line)">
                                <div style="display:flex;align-items:center;gap:.75rem">
                                    <span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:${rxRecord.status === 'dispensed' ? '#fff5f5' : '#e6fffa'};color:${rxRecord.status === 'dispensed' ? '#e53e3e' : '#2c7a7b'}">
                                        ${icon(rxRecord.status === 'dispensed' ? 'alert-triangle' : 'badge-check', 26)}
                                    </span>
                                    <div>
                                        <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
                                            <span class="badge" style="background:${rxRecord.status === 'dispensed' ? '#c53030' : '#234e52'};color:#fff;font-weight:700;font-size:.78rem;display:inline-flex;align-items:center;gap:.35rem">
                                                ${rxRecord.status === 'dispensed' ? `${icon('lock', 13)} DISPENSED &amp; LOCKED` : `${icon('check-check', 13)} VERIFIED GENUINE PRESCRIPTION`}
                                            </span>
                                            <span style="font-size:.8rem;color:var(--muted)">Hash: <code>${esc(rxRecord.tamperHash || 'SEC-VERIFIED')}</code></span>
                                        </div>
                                        <h2 style="font-size:1.35rem;margin:.3rem 0 0;color:var(--ink)">
                                            ${esc(rxRecord.rxId)}
                                        </h2>
                                    </div>
                                </div>
                                <div style="text-align:right">
                                    <span style="font-size:.8rem;color:var(--muted);display:block">Issuing Hospital</span>
                                    <strong style="font-size:1rem;color:var(--teal)">${esc(rxRecord.hospital || 'SmartCare Community Hospital')}</strong>
                                </div>
                            </div>

                            ${rxRecord.status === 'dispensed' ? `
                                <!-- Dispensation Lock Warning -->
                                <div style="margin:1.25rem 0;background:rgba(229, 62, 62, 0.08);border:1px solid rgba(229, 62, 62, 0.3);border-radius:10px;padding:1rem;color:var(--ink);font-size:.88rem">
                                    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;color:#e53e3e">
                                        ${icon('octagon-alert', 18)}
                                        <strong>DUPLICATE DISPENSING WARNING: THIS PRESCRIPTION IS LOCKED</strong>
                                    </div>
                                    <p style="margin:0;color:var(--muted)">
                                        Fulfilled at <strong>${esc(rxRecord.dispensedBy || 'SmartCare Hospital In-House Pharmacy')}</strong> on <strong>${esc(rxRecord.dispensedAt)}</strong> by ${esc(rxRecord.dispensedPharmacist || 'Pharmacist')}. Under Schedule H regulations, this token cannot be reused to purchase prescription drugs again.
                                    </p>
                                </div>
                            ` : `
                                <div style="margin:1.25rem 0;background:rgba(56, 161, 105, 0.08);border:1px solid rgba(56, 161, 105, 0.3);border-radius:10px;padding:1rem;color:var(--ink);font-size:.88rem">
                                    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.2rem;color:var(--teal)">
                                        ${icon('check-circle', 18)}
                                        <strong>Active Valid Prescription (Ready to Dispense)</strong>
                                    </div>
                                    <p style="margin:0;color:var(--muted)">
                                        Digitally signed by <strong>${esc(rxRecord.doctorName || 'Dr Meera Shah')}</strong> (NMC Reg: ${esc(rxRecord.doctorRegNo || 'NMC-2018-94821')}). Pharmacist can fulfill medications and lock this prescription below.
                                    </p>
                                </div>
                            `}

                            <!-- Patient & Clinical Details -->
                            <div class="rx-meta-grid">
                                <div class="rx-meta-item">
                                    <small>Patient Name</small>
                                    <strong>${esc(rxRecord.patientName || 'Asha Rao')}</strong>
                                </div>
                                <div class="rx-meta-item">
                                    <small>Prescribing Doctor</small>
                                    <strong>${esc(rxRecord.doctorName || 'Dr Meera Shah')}</strong>
                                    <small>Reg: ${esc(rxRecord.doctorRegNo || 'NMC-2018-94821')}</small>
                                </div>
                                <div class="rx-meta-item">
                                    <small>Date Issued</small>
                                    <strong>${esc(rxRecord.issuedAt || '18 Jul 2026')}</strong>
                                </div>
                                <div class="rx-meta-item">
                                    <small>Recorded Vitals</small>
                                    <strong>${rxRecord.vitals ? `BP: ${rxRecord.vitals.bp} · Pulse: ${rxRecord.vitals.pulse} · SpO2: ${rxRecord.vitals.spo2}` : 'Normal'}</strong>
                                </div>
                            </div>

                            <!-- Diagnosis -->
                            <div class="rx-diagnosis-block">
                                <h3 class="rx-section-title">Clinical Assessment / Diagnosis</h3>
                                <p class="rx-diagnosis-text">
                                    ${esc(rxRecord.assessment || 'General consultation')}
                                </p>
                            </div>

                            <!-- Prescribed Medicines Section -->
                            <div class="rx-meds-section">
                                <h3 class="rx-section-title">Prescribed Medications (Official Record)</h3>
                                <div class="rx-med-cards-grid">
                                    ${(rxRecord.medicines || []).map((med, idx) => `
                                        <div class="rx-med-card">
                                            <div class="rx-med-card-top">
                                                <div class="rx-med-badge">#${idx + 1}</div>
                                                <div class="rx-med-title-wrap">
                                                    <strong class="rx-med-name">${esc(med.name)} ${esc(med.strength || '')}</strong>
                                                    <span class="badge badge-dosage">${esc(med.dosage || '1-0-1')}</span>
                                                </div>
                                            </div>
                                            <div class="rx-med-card-meta">
                                                <span><strong>Duration:</strong> ${esc(med.duration || '5 days')}</span>
                                                <span><strong>Instructions:</strong> ${esc(med.instructions || 'After meals')}</span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Pharmacist Actions -->
                            <div class="rx-action-footer">
                                <div class="rx-action-links">
                                    <button type="button" class="btn-secondary btn-icon" id="btn-print-verified">
                                        ${icon('printer', 15)} Print Copy
                                    </button>
                                    <a href="/pharmacy" data-route="/pharmacy" class="btn-secondary btn-icon">
                                        ${icon('pill', 15)} Open Pharmacy
                                    </a>
                                </div>

                                ${rxRecord.status !== 'dispensed' ? `
                                    <button type="button" id="btn-dispense-lock" class="btn-primary btn-icon btn-dispense-cta">
                                        ${icon('lock', 16)} Confirm Dispensation &amp; Lock Rx
                                    </button>
                                ` : `
                                    <span class="rx-locked-notice">
                                        ${icon('lock', 15)} Prescription Locked Against Reuse
                                    </span>
                                `}
                            </div>
                        </article>
                    ` : `
                        <!-- No Record Found -->
                        <div class="provider-empty" style="background:var(--surface);border-radius:16px;padding:3rem 1.5rem;text-align:center">
                            ${icon('file-question', 40)}
                            <h2 style="font-size:1.3rem;margin:.75rem 0 .25rem">Prescription Reference Not Found</h2>
                            <p style="color:var(--muted);max-width:400px;margin:0 auto 1.5rem">
                                No verified prescription matches <strong>"${esc(rxIdQuery)}"</strong>. Please double-check the reference ID or scan the QR code again.
                            </p>
                            <button type="button" id="try-demo-rx" class="btn-primary btn-icon">
                                ${icon('file-check', 16)} Load Sample Verified Rx (RX-2026-DEMO01)
                            </button>
                        </div>
                    `}
                </main>
                ${window.App.UI.footer(false)}
            `;

            window.App.UI.bindTopbarControls(container);
            if (window.lucide) window.lucide.createIcons();

            // Search form
            const searchForm = container.querySelector('#verify-search-form');
            if (searchForm) {
                searchForm.onsubmit = e => {
                    e.preventDefault();
                    rxIdQuery = container.querySelector('#rx-search-input').value.trim();
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('id', rxIdQuery);
                    window.history.replaceState({}, '', newUrl.toString());
                    render();
                };
            }

            // Camera QR scan
            const cameraBtn = container.querySelector('#btn-scan-camera');
            if (cameraBtn) {
                cameraBtn.onclick = () => {
                    window.App.UI.showQRScannerModal(code => {
                        let extractedId = code;
                        try {
                            const u = new URL(code, window.location.origin);
                            extractedId = u.searchParams.get('id') || u.searchParams.get('rx') || code;
                        } catch {}
                        rxIdQuery = extractedId;
                        render();
                        window.App.UI.toast(`Scanned prescription reference: ${extractedId}`, 'success');
                    });
                };
            }

            // Print
            const printBtn = container.querySelector('#btn-print-verified');
            if (printBtn) {
                printBtn.onclick = () => window.print();
            }

            // Try demo Rx
            const demoBtn = container.querySelector('#try-demo-rx');
            if (demoBtn) {
                demoBtn.onclick = () => {
                    rxIdQuery = 'RX-2026-DEMO01';
                    render();
                };
            }

            // Dispense & Lock button
            const lockBtn = container.querySelector('#btn-dispense-lock');
            if (lockBtn && rxRecord) {
                lockBtn.onclick = () => {
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop';
                    backdrop.innerHTML = `
                        <section class="modal-card" role="dialog" aria-modal="true" style="max-width:440px">
                            <div class="modal-heading">
                                <div>
                                    <h2>Confirm Dispensation</h2>
                                    <p>Prescription: <strong>${esc(rxRecord.rxId)}</strong></p>
                                </div>
                                <button type="button" class="btn-ghost modal-close-button" data-close-dispense>${icon('x', 18)}</button>
                            </div>
                            <form id="dispense-form" style="display:flex;flex-direction:column;gap:1rem;margin-top:.5rem">
                                <p style="font-size:.85rem;color:var(--muted);margin:0">
                                    Once marked dispensed, this prescription will be permanently locked across all pharmacies to prevent drug abuse.
                                </p>
                                <div class="field">
                                    <label for="pharmacy-name" style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Dispensing Pharmacy Name</label>
                                    <input id="pharmacy-name" type="text" value="Apollo Pharmacy - Banjara Hills" required style="width:100%;padding:.6rem .8rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                                </div>
                                <div class="field">
                                    <label for="pharmacist-license" style="font-weight:600;font-size:.85rem;display:block;margin-bottom:.3rem">Pharmacist License / Registration No</label>
                                    <input id="pharmacist-license" type="text" value="TS-PH-2024-8842" required style="width:100%;padding:.6rem .8rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                                </div>
                                <div class="modal-actions" style="margin-top:.5rem;display:flex;gap:.5rem;justify-content:flex-end">
                                    <button type="button" class="btn-secondary" data-close-dispense>Cancel</button>
                                    <button type="submit" class="btn-primary btn-icon" style="background:#2b6cb0;border-color:#2b6cb0">
                                        ${icon('lock', 15)} Confirm &amp; Lock Rx
                                    </button>
                                </div>
                            </form>
                        </section>
                    `;
                    document.body.appendChild(backdrop);
                    const close = () => backdrop.remove();
                    backdrop.querySelectorAll('[data-close-dispense]').forEach(b => b.onclick = close);
                    backdrop.onclick = e => { if (e.target === backdrop) close(); };
                    backdrop.querySelector('#dispense-form').onsubmit = e => {
                        e.preventDefault();
                        const pName = backdrop.querySelector('#pharmacy-name').value.trim();
                        const pLic = backdrop.querySelector('#pharmacist-license').value.trim();
                        close();
                        const res = dispensePrescription(rxRecord.rxId, { pharmacyName: pName, pharmacistName: pLic });
                        if (res.success) {
                            window.App.UI.toast('Prescription marked as dispensed and locked from duplicate reuse.', 'success');
                            render();
                        } else {
                            window.App.UI.toast(res.error || 'Dispense lock failed.', 'error');
                        }
                    };
                    if (window.lucide) window.lucide.createIcons();
                };
            }
        }

        render();
        return container;
    };
})();

(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    const footer = () => `
        <footer class="site-footer" data-section="site-footer">
            <div class="footer-inner">
                <div class="footer-brand">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span>
                    </a>
                    <p>Digital queue access for patients, hospitals, and care teams.</p>
                </div>
                <div class="footer-nav-group">
                    <div class="footer-col">
                        <p class="footer-heading">Explore</p>
                        <a data-route="/about" href="/about">About us</a>
                        <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Patient portal</a>
                        <a data-route="/login" href="/login">Provider portal</a>
                        <a data-route="/donate" href="/donate">Community donation</a>
                    </div>
                    <div class="footer-col">
                        <p class="footer-heading">Policies</p>
                        <a data-route="/terms" href="/terms">Terms &amp; conditions</a>
                        <a data-route="/privacy" href="/privacy">Privacy notice</a>
                        <a href="mailto:support@smartcare.demo">Contact support</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <span>© 2026 SmartCare Systems · Demo environment</span>
                <span>Last updated: 25 August 2026</span>
            </div>
        </footer>`;

    function toast(message, type = 'info') {
        let region = document.querySelector('[data-toast-region]');
        if (!region) { region = document.createElement('div'); region.dataset.toastRegion = 'true'; region.className = 'toast-region'; region.setAttribute('aria-live', 'polite'); document.body.appendChild(region); }
        const item = document.createElement('div'); item.className = `toast toast-${type}`; item.textContent = message; region.appendChild(item);
        window.setTimeout(() => { item.classList.add('toast-leaving'); window.setTimeout(() => item.remove(), 220); }, 3200);
    }

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function topbarControls(isWorkspace = false) {
        const theme = getCurrentTheme();
        const themeIcon = theme === 'dark' ? 'moon' : 'sun';
        const themeLabel = theme === 'dark' ? 'Dark' : 'Light';
        
        return `
            <div class="topbar-control-group">
                ${isWorkspace ? `
                    <button type="button" class="topbar-control-btn mobile-menu-btn" id="sidebar-toggle-btn" aria-label="Toggle Navigation" title="Toggle Navigation">
                        ${icon('menu', 18)}
                    </button>
                ` : ''}
                <div class="lang-dropdown-wrapper">
                    <select class="lang-select-native" id="global-lang-select" aria-label="Select language">
                        <option value="en">🌐 English (EN)</option>
                        <option value="hi">🇮🇳 हिन्दी (HI)</option>
                        <option value="te">🇮🇳 తెలుగు (TE)</option>
                        <option value="ta">🇮🇳 தமிழ் (TA)</option>
                        <option value="bn">🇮🇳 বাংলা (BN)</option>
                        <option value="mr">🇮🇳 मराठी (MR)</option>
                        <option value="es">🇪🇸 Español (ES)</option>
                    </select>
                    <span class="lang-dropdown-icon">${icon('chevron-down', 12)}</span>
                </div>
                <button type="button" class="topbar-control-btn" id="theme-toggle-btn" title="Theme: ${themeLabel} (Click to toggle)">
                    ${icon(themeIcon, 15)} <span>${themeLabel}</span>
                </button>
            </div>
        `;
    }

    function bindTopbarControls(container = document) {
        // Clean up any old drawer backdrops and teleported sidebars
        document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());

        const themeBtn = container.querySelector('#theme-toggle-btn');
        if (themeBtn) {
            themeBtn.onclick = () => {
                const current = getCurrentTheme();
                const nextTheme = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', nextTheme);
                try { localStorage.setItem('smartcare.theme', nextTheme); } catch {}
                toast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
                const labelSpan = themeBtn.querySelector('span');
                if (labelSpan) labelSpan.textContent = nextTheme === 'dark' ? 'Dark' : 'Light';
                const iconName = nextTheme === 'dark' ? 'moon' : 'sun';
                themeBtn.innerHTML = `${icon(iconName, 15)} <span>${nextTheme === 'dark' ? 'Dark' : 'Light'}</span>`;
                if (window.lucide) window.lucide.createIcons();
            };
        }

        const langSelect = container.querySelector('#global-lang-select');
        if (langSelect) {
            const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
            if (match && match[1]) {
                const activeCode = match[1].split('/')[2];
                if (activeCode) langSelect.value = activeCode;
            }

            langSelect.onchange = () => {
                const lang = langSelect.value;
                document.cookie = `googtrans=/en/${lang}; path=/;`;
                document.cookie = `googtrans=/en/${lang}; domain=.${location.hostname}; path=/;`;
                
                const combo = document.querySelector('.goog-te-combo');
                if (combo) {
                    combo.value = lang;
                    combo.dispatchEvent(new Event('change'));
                } else {
                    location.reload();
                }
            };
        }

        const sidebarToggleBtn = container.querySelector('#sidebar-toggle-btn');
        const workspaceTabs = container.querySelector('.workspace-tabs');
        const providerShell = container.querySelector('.provider-shell');

        if (!sidebarToggleBtn || !workspaceTabs) return;

        // --- Shared close function ---
        function closeDrawer() {
            workspaceTabs.classList.remove('drawer-open');
            sidebarToggleBtn.innerHTML = icon('menu', 18);
            if (window.lucide) window.lucide.createIcons();
            document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());
        }

        // Add a drawer header (logo + X close button) inside workspaceTabs for mobile mode if not present
        if (!workspaceTabs.querySelector('.mobile-drawer-header')) {
            const drawerHeader = document.createElement('div');
            drawerHeader.className = 'mobile-drawer-header';
            drawerHeader.innerHTML = `
                <div class="brand-lockup">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span class="brand-name">SmartCare</span>
                </div>
                <button type="button" class="mobile-drawer-close" aria-label="Close navigation">
                    ${icon('x', 18)}
                </button>
            `;
            workspaceTabs.insertBefore(drawerHeader, workspaceTabs.firstChild);
            const closeBtn = drawerHeader.querySelector('.mobile-drawer-close');
            if (closeBtn) closeBtn.onclick = closeDrawer;
        }

        // --- Responsive layout manager ---
        function applyLayout() {
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // Teleport sidebar to body so position:fixed works correctly relative to viewport
                if (workspaceTabs.parentElement !== document.body) {
                    document.body.appendChild(workspaceTabs);
                }
                workspaceTabs.classList.add('mobile-drawer');
                workspaceTabs.classList.remove('desktop-sidebar');
                workspaceTabs.style.top = '';
                if (providerShell) {
                    providerShell.style.gridTemplateColumns = '';
                    providerShell.style.marginLeft = '';
                }
                closeDrawer();
            } else {
                // Move sidebar back into provider-shell as first child
                if (workspaceTabs.parentElement !== providerShell && providerShell) {
                    providerShell.insertBefore(workspaceTabs, providerShell.firstChild);
                }
                workspaceTabs.classList.remove('mobile-drawer', 'drawer-open');
                workspaceTabs.classList.add('desktop-sidebar');
                workspaceTabs.style.top = '';
                document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());
                // Restore desktop collapsed state if needed
                if (providerShell && providerShell.classList.contains('sidebar-collapsed')) {
                    providerShell.style.gridTemplateColumns = '0px minmax(0, 1fr)';
                }
            }
        }

        // Initial layout
        applyLayout();

        // Responsive listener
        const mq = window.matchMedia('(max-width: 767px)');
        mq.addEventListener('change', applyLayout);

        // --- Toggle button click handler ---
        sidebarToggleBtn.onclick = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                const isOpen = workspaceTabs.classList.toggle('drawer-open');
                sidebarToggleBtn.innerHTML = isOpen ? icon('x', 18) : icon('menu', 18);
                if (window.lucide) window.lucide.createIcons();

                if (isOpen) {
                    let backdrop = document.querySelector('.workspace-drawer-backdrop');
                    if (!backdrop) {
                        backdrop = document.createElement('div');
                        backdrop.className = 'workspace-drawer-backdrop';
                        document.body.appendChild(backdrop);
                    }
                    backdrop.onclick = closeDrawer;
                } else {
                    document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());
                }
            } else {
                // Desktop: toggle collapse
                if (providerShell) {
                    const isCollapsed = providerShell.classList.toggle('sidebar-collapsed');
                    sidebarToggleBtn.title = isCollapsed ? 'Expand navigation' : 'Collapse navigation';
                }
            }
        };

        // Auto-close drawer when any sidebar link is tapped on mobile
        workspaceTabs.querySelectorAll('a, button').forEach(link => {
            if (!link.classList.contains('mobile-drawer-close')) {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 768) closeDrawer();
                });
            }
        });
    }



    function generateQRCodeDataUrl(text = '') {
        try {
            if (window.qrcode) {
                const qr = window.qrcode(0, 'M');
                qr.addData(String(text));
                qr.make();
                return qr.createDataURL(6, 8);
            }
        } catch (e) {
            console.error('QR Generator error:', e);
        }
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    }

    function showQRScannerModal(onScanSuccess) {
        const modalId = 'qr-scanner-modal-container';
        let existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = modalId;
        backdrop.className = 'modal-backdrop';

        backdrop.innerHTML = `
            <div class="prescription-modal" style="max-width:520px" role="dialog" aria-modal="true" aria-labelledby="qr-scanner-title">
                <div class="prescription-modal-header">
                    <h3 id="qr-scanner-title">${icon('qr-code', 18)} Scan Patient Ticket QR Code</h3>
                    <button type="button" class="btn-ghost" id="close-qr-modal" style="padding:.3rem .6rem;min-height:auto;font-size:1.1rem" aria-label="Close scanner">✕</button>
                </div>
                <div class="prescription-modal-body" style="text-align:center">
                    <p style="margin:0 0 1rem;font-size:.8rem;color:var(--muted)">
                        Point phone camera at patient's confirmation QR code to check them in.
                    </p>
                    <div id="qr-camera-reader" style="width:100%;max-width:380px;min-height:250px;margin:0 auto 1rem;border-radius:.8rem;overflow:hidden;border:1px dashed var(--teal);background:#000"></div>
                    
                    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)">
                        <p style="margin:0 0 .5rem;font-size:.76rem;color:var(--muted)">Or type / paste reference ID manually:</p>
                        <div style="display:flex;gap:.5rem">
                            <input type="text" id="manual-qr-input" placeholder="e.g. SC-DEMO001" style="flex:1;padding:.55rem .75rem;border:1px solid var(--line);border-radius:.5rem;font-size:.84rem;font-weight:700">
                            <button type="button" class="btn-primary" id="btn-submit-manual-qr">Check in</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();

        let scannerInstance = null;

        const stopScanner = async () => {
            if (scannerInstance) {
                try {
                    await scannerInstance.stop();
                    scannerInstance.clear();
                } catch {}
                scannerInstance = null;
            }
            backdrop.remove();
        };

        backdrop.querySelector('#close-qr-modal').onclick = stopScanner;
        backdrop.onclick = e => { if (e.target === backdrop) stopScanner(); };

        const handleSuccess = (code) => {
            if (!code) return;
            toast(`Scanned Ticket: ${code}`, 'success');
            stopScanner();
            if (typeof onScanSuccess === 'function') onScanSuccess(code);
        };

        backdrop.querySelector('#btn-submit-manual-qr').onclick = () => {
            const val = backdrop.querySelector('#manual-qr-input').value.trim();
            if (val) handleSuccess(val);
        };
        backdrop.querySelector('#manual-qr-input').onkeydown = e => {
            if (e.key === 'Enter') {
                const val = backdrop.querySelector('#manual-qr-input').value.trim();
                if (val) handleSuccess(val);
            }
        };

        if (window.Html5Qrcode) {
            try {
                scannerInstance = new window.Html5Qrcode("qr-camera-reader");
                scannerInstance.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    (decodedText) => {
                        handleSuccess(decodedText);
                    },
                    () => {}
                ).catch(err => {
                    console.warn("Camera scan start warning:", err);
                    const readerEl = backdrop.querySelector('#qr-camera-reader');
                    if (readerEl) readerEl.innerHTML = `<div style="padding:2rem 1rem;color:#fff;font-size:.8rem"><p style="margin:0 0 .5rem">📷 Camera preview loading...</p><small style="color:#aaa">Use the manual entry box below if camera permission is denied.</small></div>`;
                });
            } catch (e) {
                console.error("Html5Qrcode error:", e);
            }
        }
    }

    function showPrescriptionModal(visit = {}) {
        const modalId = 'prescription-modal-container';
        let existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = modalId;
        backdrop.className = 'modal-backdrop';

        const rxId = visit.reference || visit.id || `RX-${Date.now().toString(36).toUpperCase()}`;
        const patientName = visit.patientName || window.App.Store?.state?.patientData?.name || 'Asha Rao';
        const age = visit.age || window.App.Store?.state?.patientData?.age || '32';
        const gender = visit.gender || window.App.Store?.state?.patientData?.gender || 'Female';
        const hospital = visit.hospital || 'SmartCare Community Hospital';
        const city = visit.city || 'Hyderabad';
        const date = visit.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const reason = visit.reason || 'General medical consultation';
        const qrUrl = generateQRCodeDataUrl(rxId);

        backdrop.innerHTML = `
            <div class="prescription-modal" role="dialog" aria-modal="true" aria-labelledby="rx-title">
                <div class="prescription-modal-header">
                    <h3 id="rx-title">${icon('file-text', 18)} Clinical Consultation &amp; Prescription Slip</h3>
                    <button type="button" class="btn-ghost" id="close-rx-modal" style="padding:.3rem .6rem;min-height:auto;font-size:1.1rem" aria-label="Close modal">✕</button>
                </div>
                <div class="prescription-modal-body">
                    <div class="prescription-paper">
                        <div class="rx-header">
                            <div class="rx-brand">
                                <h2>${esc(hospital)}</h2>
                                <p>Department of General Medicine &amp; Outpatient Care · ${esc(city)}</p>
                                <p>Emergency Helpline: 108 · Contact: +91 40 2345 6789</p>
                            </div>
                            <div class="rx-meta">
                                <strong>Slip Ref: ${esc(rxId)}</strong><br>
                                <span>Date: ${esc(date)}</span><br>
                                <span>Status: Verified Official</span>
                            </div>
                        </div>

                        <div class="rx-patient-info">
                            <div><span>Patient Name</span><strong>${esc(patientName)}</strong></div>
                            <div><span>Age / Gender</span><strong>${esc(age)} Yrs / ${esc(gender)}</strong></div>
                            <div><span>Clinical Department</span><strong>Outpatient Triage (OPD)</strong></div>
                        </div>

                        <div class="rx-vitals-strip">
                            <span><strong>BP:</strong> 120/80 mmHg</span>
                            <span><strong>Pulse:</strong> 76 bpm</span>
                            <span><strong>Temp:</strong> 98.6 °F</span>
                            <span><strong>SpO2:</strong> 99%</span>
                            <span><strong>Triage:</strong> Routine</span>
                        </div>

                        <div class="rx-section-title">Chief Complaint &amp; Diagnosis</div>
                        <p style="margin:0 0 .75rem;font-size:.84rem;color:#1e3d59">
                            <strong>Symptoms:</strong> ${esc(reason)}<br>
                            <strong>Clinical Assessment:</strong> Patient examined. Clear chest sounds, normal throat evaluation. No acute respiratory distress observed.
                        </p>

                        <div class="rx-section-title">Rx - Prescribed Medications</div>
                        <table class="rx-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Medicine Name &amp; Strength</th>
                                    <th>Dosage Frequency</th>
                                    <th>Duration</th>
                                    <th>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td><strong>Tab. Paracetamol 500mg</strong></td>
                                    <td>1 - 0 - 1 (Morning, Night)</td>
                                    <td>3 Days</td>
                                    <td>After food with water</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td><strong>Tab. Cetirizine 10mg</strong></td>
                                    <td>0 - 0 - 1 (Night)</td>
                                    <td>5 Days</td>
                                    <td>Before sleep</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td><strong>Syp. Cough Relief 100ml</strong></td>
                                    <td>2 tsp (Twice a day)</td>
                                    <td>5 Days</td>
                                    <td>Shake well before use</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="rx-section-title">Diagnostic Lab Reports &amp; Remarks</div>
                        <div style="padding:.65rem;background:#fbfdff;border:1px solid #e0ecf7;border-radius:.4rem;font-size:.78rem">
                            <p style="margin:0 0 .35rem"><strong>Complete Blood Count (CBC):</strong> Hemoglobin 13.8 g/dL, WBC 7,200 /uL, Platelets 2.8 Lakhs (All parameters within normal limits).</p>
                            <p style="margin:0"><strong>Next Steps:</strong> Adequate hydration, warm fluids, review after 5 days if fever recurs.</p>
                        </div>

                        <div class="rx-footer">
                            <div class="rx-seal">
                                ${icon('badge-check', 20)}
                                <span>SMARTCARE VERIFIED DIGITAL PRESCRIPTION</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:1rem">
                                <img src="${qrUrl}" alt="Prescription QR Code" style="width:70px;height:70px;border-radius:4px;border:1px solid #d8e4ef">
                                <div class="rx-signature">
                                    <strong>Dr. Arvind Swaminathan, MD</strong>
                                    <small>Reg No: TS-MED-49102 · SmartCare Health</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prescription-modal-actions">
                    <button type="button" class="btn-secondary btn-icon" id="btn-print-rx">
                        ${icon('printer', 16)} Print / Save PDF
                    </button>
                    <div style="display:flex;gap:.5rem">
                        <button type="button" class="btn-secondary" id="btn-copy-rx">
                            ${icon('copy', 15)} Copy Details
                        </button>
                        <button type="button" class="btn-primary" id="btn-close-rx">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();

        const closeModal = () => backdrop.remove();
        backdrop.querySelector('#close-rx-modal').onclick = closeModal;
        backdrop.querySelector('#btn-close-rx').onclick = closeModal;
        backdrop.onclick = e => { if (e.target === backdrop) closeModal(); };

        backdrop.querySelector('#btn-print-rx').onclick = () => {
            window.print();
        };

        backdrop.querySelector('#btn-copy-rx').onclick = async () => {
            const summary = `SmartCare Prescription - ${hospital}\nRef: ${rxId}\nPatient: ${patientName} (${age}Y/${gender})\nDate: ${date}\nReason: ${reason}\nRx: Paracetamol 500mg, Cetirizine 10mg, Cough Relief Syp\nDoctor: Dr. Arvind Swaminathan, MD`;
            try {
                await navigator.clipboard.writeText(summary);
                toast('Prescription details copied to clipboard!', 'success');
            } catch {
                toast('Failed to copy', 'error');
            }
        };
    }

    // ─── Mobile Bottom Navigation Bar ───────────────────────────────────────────
    // Role-based nav items. Each item: [iconName, label, route, data-route attr OR data-tab]
    const MOBILE_NAV = {
        patient: [
            { icon: 'layout-dashboard', label: 'Overview',   route: '/dashboard/patient',             attr: 'data-route' },
            { icon: 'calendar-plus',    label: 'Book',        route: '/dashboard/patient/apply/1',     attr: 'data-tab',   tab: 'apply', tabRoute: '/dashboard/patient' },
            { icon: 'clipboard-list',   label: 'Visits',      route: '/dashboard/patient/visits',      attr: 'data-tab',   tab: 'visits', tabRoute: '/dashboard/patient' },
            { icon: 'heart-handshake',  label: 'Donations',   route: '/dashboard/patient/donations',   attr: 'data-route' },
            { icon: 'log-out',          label: 'Sign out',    route: null,                             attr: 'signout' },
        ],
        doctor: [
            { icon: 'layout-dashboard', label: 'Overview',   route: '/dashboard/doctor',              attr: 'data-route' },
            { icon: 'list-ordered',     label: 'Queue',       route: '/dashboard/queue',               attr: 'data-route' },
            { icon: 'bar-chart-3',      label: 'Analytics',   route: '/dashboard/analytics',           attr: 'data-route' },
            { icon: 'heart-handshake',  label: 'Donations',   route: '/dashboard/doctor/donations',    attr: 'data-route' },
            { icon: 'log-out',          label: 'Sign out',    route: null,                             attr: 'signout' },
        ],
        staff: [
            { icon: 'layout-dashboard', label: 'Operations', route: '/dashboard/admin',               attr: 'data-route' },
            { icon: 'list-ordered',     label: 'Queue',       route: '/dashboard/queue',               attr: 'data-route' },
            { icon: 'bar-chart-3',      label: 'Analytics',   route: '/dashboard/analytics',           attr: 'data-route' },
            { icon: 'heart-handshake',  label: 'Donations',   route: '/dashboard/admin/donations',     attr: 'data-route' },
            { icon: 'log-out',          label: 'Sign out',    route: null,                             attr: 'signout' },
        ],
    };

    function mobileBottomNav(role, currentRoute) {
        const items = MOBILE_NAV[role] || MOBILE_NAV.patient;
        const buttons = items.map(item => {
            const isActive = item.route && (
                currentRoute === item.route ||
                (item.route === '/dashboard/patient' && currentRoute === '/dashboard/patient') ||
                (item.tab === 'apply' && currentRoute.startsWith('/dashboard/patient/apply'))
            );
            if (item.attr === 'signout') {
                return `<button type="button" class="mobile-nav-btn" data-mobile-nav-signout aria-label="Sign out">
                    ${icon(item.icon, 20)}<span>${item.label}</span>
                </button>`;
            }
            if (item.attr === 'data-tab') {
                return `<a class="mobile-nav-btn${isActive ? ' active' : ''}" href="${item.route}" data-tab="${item.tab}" data-tab-route="${item.tabRoute}" aria-label="${item.label}">
                    ${icon(item.icon, 20)}<span>${item.label}</span>
                </a>`;
            }
            return `<a class="mobile-nav-btn${isActive ? ' active' : ''}" href="${item.route}" data-route="${item.route}" aria-label="${item.label}">
                ${icon(item.icon, 20)}<span>${item.label}</span>
            </a>`;
        }).join('');

        return `<nav class="mobile-bottom-nav" aria-label="Mobile navigation">${buttons}</nav>`;
    }

    function bindMobileBottomNav(container) {
        // Clean up previous bottom navs teleported to body
        document.querySelectorAll('body > .mobile-bottom-nav').forEach(el => el.remove());

        const nav = container.querySelector('.mobile-bottom-nav');
        if (!nav) return;

        // Teleport mobile bottom nav to document.body so position:fixed is always relative to viewport
        if (nav.parentElement !== document.body) {
            document.body.appendChild(nav);
        }

        // Sign-out button
        const signoutBtn = nav.querySelector('[data-mobile-nav-signout]');

        if (signoutBtn && window.App && window.App.Store && window.App.Store.logout) {
            signoutBtn.onclick = window.App.Store.logout;
        }

        // Auto-close sidebar drawer when a bottom nav item is tapped
        nav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sidebar = document.querySelector('.workspace-tabs.mobile-drawer');
                if (sidebar) {
                    sidebar.classList.remove('drawer-open');
                    const backdrop = document.querySelector('.workspace-drawer-backdrop');
                    if (backdrop) backdrop.remove();
                    const toggleBtn = document.querySelector('#sidebar-toggle-btn');
                    if (toggleBtn) { toggleBtn.innerHTML = icon('menu', 18); if (window.lucide) window.lucide.createIcons(); }
                }
            });
        });

        if (window.lucide) window.lucide.createIcons();
    }

    window.App.UI = { icon, footer, toast, topbarControls, bindTopbarControls, mobileBottomNav, bindMobileBottomNav, generateQRCodeDataUrl, showQRScannerModal, showPrescriptionModal };
})();

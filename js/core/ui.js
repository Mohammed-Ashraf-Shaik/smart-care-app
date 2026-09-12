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
                        <p class="footer-heading">Services &amp; Care</p>
                        <a data-route="/ambulance" href="/ambulance">Ambulance Dispatch</a>
                        <a data-route="/pharmacy" href="/pharmacy">In-House Pharmacy</a>
                        <a data-route="/verify-rx" href="/verify-rx">Prescription Registry</a>
                        <a data-route="/donate" href="/donate">Community Donation</a>
                        <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Patient Portal</a>
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
        const currentRoute = window.App?.Store?.state?.route || window.location.pathname;
        const isAmbulancePage = currentRoute.includes('/ambulance');
        
        return `
            <div class="topbar-control-group">
                ${!isAmbulancePage ? `
                    <a href="/ambulance" data-route="/ambulance" class="topbar-sos-btn" style="background:#e53e3e;color:#fff;padding:.35rem .75rem;border-radius:20px;font-weight:700;font-size:.78rem;display:inline-flex;align-items:center;gap:.35rem;text-decoration:none;box-shadow:0 2px 8px rgba(229,62,62,0.3)">
                        ${icon('siren', 14)} <span class="sos-label">SOS Ambulance</span>
                    </a>
                ` : ''}
                ${isWorkspace ? `
                    <button type="button" class="topbar-control-btn mobile-menu-btn" id="sidebar-toggle-btn" aria-label="Open navigation" aria-expanded="false" title="Toggle Navigation">
                        ${icon('menu', 18)}
                    </button>
                ` : ''}
                <div class="lang-dropdown-wrapper" title="Select language">
                    <span class="lang-globe-icon">${icon('globe', 14)}</span>
                    <select class="lang-select-native" id="global-lang-select" aria-label="Select language">
                        <option value="en">English (EN)</option>
                        <option value="hi">हिन्दी (HI)</option>
                        <option value="te">తెలుగు (TE)</option>
                        <option value="ta">தமிழ் (TA)</option>
                        <option value="bn">বাংলা (BN)</option>
                        <option value="mr">मराठी (MR)</option>
                        <option value="es">Español (ES)</option>
                    </select>
                    <span class="lang-dropdown-icon">${icon('chevron-down', 12)}</span>
                </div>
                <button type="button" class="topbar-control-btn" id="theme-toggle-btn" aria-label="Switch to ${theme === 'dark' ? 'light' : 'dark'} theme" title="Theme: ${themeLabel} (Click to toggle)">
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
                themeBtn.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} theme`);
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
        workspaceTabs.id = workspaceTabs.id || 'workspace-navigation';
        sidebarToggleBtn.setAttribute('aria-controls', workspaceTabs.id);

        function closeDrawer(restoreFocus = false) {
            workspaceTabs.classList.remove('drawer-open');
            sidebarToggleBtn.innerHTML = icon('menu', 18);
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
            sidebarToggleBtn.setAttribute('aria-label', 'Open navigation');
            if (window.lucide) window.lucide.createIcons();
            document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());
            if (restoreFocus && sidebarToggleBtn.isConnected) sidebarToggleBtn.focus();
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
            if (closeBtn) closeBtn.onclick = () => closeDrawer(true);
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
                sidebarToggleBtn.setAttribute('aria-expanded', String(!providerShell?.classList.contains('sidebar-collapsed')));
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
                sidebarToggleBtn.setAttribute('aria-expanded', String(isOpen));
                sidebarToggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
                if (window.lucide) window.lucide.createIcons();

                if (isOpen) {
                    let backdrop = document.querySelector('.workspace-drawer-backdrop');
                    if (!backdrop) {
                        backdrop = document.createElement('div');
                        backdrop.className = 'workspace-drawer-backdrop';
                        document.body.appendChild(backdrop);
                    }
                    backdrop.onclick = () => closeDrawer(true);
                    workspaceTabs.querySelector('.mobile-drawer-close')?.focus();
                } else {
                    document.querySelectorAll('.workspace-drawer-backdrop').forEach(el => el.remove());
                }
            } else {
                // Desktop: toggle collapse
                if (providerShell) {
                    const isCollapsed = providerShell.classList.toggle('sidebar-collapsed');
                    sidebarToggleBtn.title = isCollapsed ? 'Expand navigation' : 'Collapse navigation';
                    sidebarToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
                    sidebarToggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand navigation' : 'Collapse navigation');
                }
            }
        };
        workspaceTabs.onkeydown = event => { if (event.key === 'Escape' && workspaceTabs.classList.contains('drawer-open')) closeDrawer(true); };

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

    function playScanAudioFeedback() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch {}
    }

    function triggerHapticFeedback() {
        try {
            if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
        } catch {}
    }

    function showQRScannerModal(onScanSuccess, title = 'Scan Patient / Rx QR Code') {
        const modalId = 'qr-scanner-modal-container';
        let existing = document.getElementById(modalId);
        if (existing) existing.remove();
        const previousFocus = document.activeElement;

        const backdrop = document.createElement('div');
        backdrop.id = modalId;
        backdrop.className = 'modal-backdrop real-qr-modal-backdrop';

        backdrop.innerHTML = `
            <div class="modal-card real-qr-scanner-card" style="max-width:480px" role="dialog" aria-modal="true" aria-labelledby="qr-scanner-title">
                <div class="modal-heading" style="margin-bottom:.75rem">
                    <div>
                        <h2 id="qr-scanner-title" style="font-size:1.15rem;display:flex;align-items:center;gap:.5rem">
                            ${icon('qr-code', 18)} ${esc(title)}
                        </h2>
                        <p style="margin:0;font-size:.8rem;color:var(--muted)">Point camera at appointment pass, ABHA passport, or e-Prescription.</p>
                    </div>
                    <button type="button" class="btn-ghost modal-close-button" id="close-qr-modal" aria-label="Close scanner">${icon('x', 18)}</button>
                </div>

                <!-- Viewfinder HUD -->
                <div class="real-qr-viewfinder" id="scanner-viewfinder-wrap">
                    <video id="real-qr-video" playsinline muted autoplay></video>
                    <canvas id="real-qr-canvas" style="display:none"></canvas>
                    
                    <div class="qr-hud-overlay">
                        <div class="hud-reticle-corner corner-tl"></div>
                        <div class="hud-reticle-corner corner-tr"></div>
                        <div class="hud-reticle-corner corner-bl"></div>
                        <div class="hud-reticle-corner corner-br"></div>
                        <div class="hud-laser-sweep"></div>
                        <div class="hud-instruction-badge">${icon('camera', 13)} Align QR code within frame</div>
                    </div>

                    <div id="camera-error-overlay" class="camera-error-overlay" style="display:none">
                        <div class="error-msg-box">
                            <span class="camera-off-icon">${icon('camera-off', 24)}</span>
                            <p id="camera-error-text" style="font-size:.85rem;margin:.4rem 0">Camera access initializing or unavailable.</p>
                            <label class="btn-primary btn-compact btn-icon" style="cursor:pointer;display:inline-flex;margin-top:.4rem">
                                ${icon('upload', 14)} <span>Upload QR Image File</span>
                                <input type="file" id="camera-fallback-file-input" accept="image/*" style="display:none">
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Quick Action Bar -->
                <div class="qr-action-toolbar" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin:1rem 0 .5rem">
                    <button type="button" id="btn-switch-camera" class="btn-secondary btn-compact btn-icon" title="Toggle front / rear camera">
                        ${icon('refresh-cw', 14)} <span>Switch Camera</span>
                    </button>
                    <label class="btn-secondary btn-compact btn-icon" style="cursor:pointer;display:inline-flex" title="Upload screenshot or photo">
                        ${icon('image', 14)} <span>Upload Image</span>
                        <input type="file" id="qr-file-input" accept="image/*" style="display:none">
                    </label>
                </div>

                <!-- Demo Token Quick Selectors -->
                <div class="qr-demo-shortcuts" style="background:var(--surface);border:1px solid var(--line);border-radius:.6rem;padding:.6rem;margin-bottom:.75rem">
                    <span style="font-size:.72rem;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:.03em;display:block;margin-bottom:.35rem">
                        ${icon('presentation', 12)} Quick Presentation Shortcuts
                    </span>
                    <div style="display:flex;flex-wrap:wrap;gap:.35rem">
                        <button type="button" class="btn-ghost btn-compact demo-qr-chip" data-token="SC-DEMO-ASHA" style="font-size:.76rem;padding:.3rem .55rem;background:var(--canvas);border:1px solid var(--line);border-radius:.4rem">
                            Asha Rao (Pass)
                        </button>
                        <button type="button" class="btn-ghost btn-compact demo-qr-chip" data-token="SC-PASSPORT-8924" style="font-size:.76rem;padding:.3rem .55rem;background:var(--canvas);border:1px solid var(--line);border-radius:.4rem">
                            ABHA Passport
                        </button>
                        <button type="button" class="btn-ghost btn-compact demo-qr-chip" data-token="RX-2026-DEMO01" style="font-size:.76rem;padding:.3rem .55rem;background:var(--canvas);border:1px solid var(--line);border-radius:.4rem">
                            E-Rx Token
                        </button>
                    </div>
                </div>

                <!-- Manual Code Input Fallback -->
                <div style="border-top:1px solid var(--line);padding-top:.75rem">
                    <label for="manual-qr-input" style="font-size:.75rem;color:var(--muted);display:block;margin-bottom:.35rem">Or enter reference string directly:</label>
                    <div style="display:flex;gap:.4rem">
                        <input type="text" id="manual-qr-input" placeholder="e.g. SC-DEMO-ASHA or RX-2026-DEMO01" style="flex:1;padding:.5rem .75rem;border:1px solid var(--line);border-radius:.5rem;font-size:.84rem;font-weight:700;background:var(--surface);color:var(--ink)">
                        <button type="button" class="btn-primary btn-compact" id="btn-submit-manual-qr">Submit</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();

        let stream = null;
        let animationFrameId = null;
        let facingMode = 'environment';
        let isDestroyed = false;

        const video = backdrop.querySelector('#real-qr-video');
        const canvas = backdrop.querySelector('#real-qr-canvas');
        const errorOverlay = backdrop.querySelector('#camera-error-overlay');
        const errorText = backdrop.querySelector('#camera-error-text');

        const stopScanner = () => {
            isDestroyed = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                stream = null;
            }
            backdrop.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
        };

        backdrop.querySelector('#close-qr-modal').onclick = stopScanner;
        backdrop.onclick = e => { if (e.target === backdrop) stopScanner(); };
        backdrop.onkeydown = e => { if (e.key === 'Escape') stopScanner(); };

        const handleSuccess = (code) => {
            if (!code || isDestroyed) return;
            playScanAudioFeedback();
            triggerHapticFeedback();
            toast('QR Code detected successfully.', 'success');
            stopScanner();
            if (typeof onScanSuccess === 'function') onScanSuccess(String(code).trim());
        };

        // Frame scanner loop using jsQR
        const scanFrame = () => {
            if (isDestroyed) return;
            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (window.jsQR) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert'
                    });
                    if (code && code.data && code.data.trim()) {
                        handleSuccess(code.data.trim());
                        return;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(scanFrame);
        };

        // Start hardware camera stream
        async function startCamera() {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                stream = null;
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            try {
                errorOverlay.style.display = 'none';
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera hardware API not available in this browser.');
                }
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });

                if (isDestroyed) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                if (video) {
                    video.srcObject = stream;
                    video.setAttribute('playsinline', 'true');
                    await video.play().catch(() => {});
                }
                animationFrameId = requestAnimationFrame(scanFrame);
            } catch (err) {
                console.warn('Camera stream initialisation:', err);
                if (errorOverlay) {
                    errorOverlay.style.display = 'flex';
                    errorText.textContent = err.name === 'NotAllowedError'
                        ? 'Camera permission was denied. Please allow access or upload an image.'
                        : 'Unable to open camera stream. Use image upload or manual code entry below.';
                }
            }
        }

        startCamera();

        // Switch camera toggle
        const switchBtn = backdrop.querySelector('#btn-switch-camera');
        if (switchBtn) {
            switchBtn.onclick = () => {
                facingMode = facingMode === 'environment' ? 'user' : 'environment';
                startCamera();
            };
        }

        // File upload decoder
        const processImageFile = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    if (window.jsQR) {
                        const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                        const result = window.jsQR(imgData.data, imgData.width, imgData.height);
                        if (result && result.data) {
                            handleSuccess(result.data.trim());
                            return;
                        }
                    }
                    toast('No QR code detected in this image. Try another file.', 'error');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        };

        const fileInput = backdrop.querySelector('#qr-file-input');
        if (fileInput) fileInput.onchange = e => processImageFile(e.target.files?.[0]);
        const fallbackFileInput = backdrop.querySelector('#camera-fallback-file-input');
        if (fallbackFileInput) fallbackFileInput.onchange = e => processImageFile(e.target.files?.[0]);

        // Demo quick chips
        backdrop.querySelectorAll('.demo-qr-chip').forEach(btn => {
            btn.onclick = () => handleSuccess(btn.dataset.token);
        });

        // Manual submit
        const submitBtn = backdrop.querySelector('#btn-submit-manual-qr');
        const manualInput = backdrop.querySelector('#manual-qr-input');
        const doManual = () => {
            const val = manualInput?.value.trim();
            if (val) handleSuccess(val);
        };
        if (submitBtn) submitBtn.onclick = doManual;
        if (manualInput) manualInput.onkeydown = e => { if (e.key === 'Enter') doManual(); };
    }

    function showQRMagnifierModal(bookingId = 'SC-DEMO', hospitalName = 'SmartCare Community Hospital', patientName = 'Patient') {
        const modalId = 'qr-magnifier-modal-container';
        document.getElementById(modalId)?.remove();
        const previousFocus = document.activeElement;

        const qrDataUrl = generateQRCodeDataUrl(bookingId);
        const backdrop = document.createElement('div');
        backdrop.id = modalId;
        backdrop.className = 'modal-backdrop qr-magnifier-backdrop';

        backdrop.innerHTML = `
            <div class="modal-card qr-magnifier-card" role="dialog" aria-modal="true" aria-labelledby="qr-magnifier-title" style="max-width:440px;text-align:center">
                <div class="modal-heading" style="justify-content:space-between">
                    <div>
                        <h2 id="qr-magnifier-title" style="font-size:1.2rem;margin:0;display:flex;align-items:center;gap:.4rem">
                            ${icon('maximize-2', 18)} Digital Check-In Pass
                        </h2>
                        <small style="color:var(--muted)">Optimized for hospital laser &amp; optical barcode guns</small>
                    </div>
                    <button type="button" class="btn-ghost modal-close-button" id="close-magnifier-modal">${icon('x', 18)}</button>
                </div>

                <div class="qr-magnifier-display" style="background:#fff;padding:1.5rem;border-radius:1rem;margin:1rem auto;display:inline-block;box-shadow:0 4px 20px rgba(0,0,0,0.12);border:2px solid var(--line)">
                    <img src="${qrDataUrl}" alt="High-contrast QR Code" style="width:240px;height:240px;display:block;margin:0 auto;image-rendering:pixelated">
                    <div style="margin-top:.75rem;padding:.4rem .8rem;background:#f7fafc;border-radius:.5rem;border:1px solid #e2e8f0;display:inline-flex;align-items:center;gap:.4rem">
                        <code style="font-size:1.15rem;font-weight:800;letter-spacing:.05em;color:#1a202c">${esc(bookingId)}</code>
                        <button type="button" id="btn-copy-magnified-token" class="btn-ghost btn-compact" title="Copy reference" style="padding:.2rem">${icon('copy', 14)}</button>
                    </div>
                </div>

                <div class="qr-magnifier-meta" style="margin-bottom:1.25rem;text-align:left;background:var(--surface);padding:.75rem 1rem;border-radius:.6rem;border:1px solid var(--line)">
                    <div style="display:flex;justify-content:space-between;margin-bottom:.3rem">
                        <span style="font-size:.82rem;color:var(--muted)">Patient:</span>
                        <strong style="font-size:.88rem">${esc(patientName)}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between">
                        <span style="font-size:.82rem;color:var(--muted)">Care Centre:</span>
                        <strong style="font-size:.88rem;color:var(--teal)">${esc(hospitalName)}</strong>
                    </div>
                </div>

                <p style="font-size:.78rem;color:var(--muted);margin:0 0 1rem;line-height:1.4">
                    ${icon('info', 13)} Hold screen 10–15 cm from scanner laser with screen brightness set to maximum.
                </p>

                <div class="modal-actions" style="display:flex;gap:.5rem;justify-content:center">
                    <button type="button" id="btn-magnifier-print" class="btn-secondary btn-icon">
                        ${icon('printer', 15)} Print Slip
                    </button>
                    <button type="button" id="btn-magnifier-close" class="btn-primary">
                        Done
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();

        const close = () => {
            backdrop.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
        };

        backdrop.querySelector('#close-magnifier-modal').onclick = close;
        backdrop.querySelector('#btn-magnifier-close').onclick = close;
        backdrop.onclick = e => { if (e.target === backdrop) close(); };
        backdrop.onkeydown = e => { if (e.key === 'Escape') close(); };

        backdrop.querySelector('#btn-magnifier-print').onclick = () => window.print();
        backdrop.querySelector('#btn-copy-magnified-token').onclick = async () => {
            try {
                await navigator.clipboard.writeText(bookingId);
                toast('Token copied to clipboard.', 'success');
            } catch {}
        };
    }

    function showMedicalPassportModal(passport = {}) {
        const modalId = 'medical-passport-review-container';
        document.getElementById(modalId)?.remove();
        const previousFocus = document.activeElement;
        const profile = passport.profile || {};
        const history = passport.history || {};
        const previousProvider = history.previousProvider || {};
        const listItems = (items, formatter, emptyText) => Array.isArray(items) && items.length
            ? `<ul>${items.map(item => `<li>${formatter(item)}</li>`).join('')}</ul>`
            : `<p class="passport-review-empty">${emptyText}</p>`;

        const backdrop = document.createElement('div');
        backdrop.id = modalId;
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="prescription-modal passport-review-modal" role="dialog" aria-modal="true" aria-labelledby="passport-review-title">
                <div class="prescription-modal-header">
                    <h3 id="passport-review-title">${icon('shield-plus', 18)} Shared Medical History</h3>
                    <button type="button" class="btn-ghost modal-close-button" id="close-passport-review" aria-label="Close Medical History">${icon('x', 18)}</button>
                </div>
                <div class="prescription-modal-body">
                    <div class="passport-review-banner">
                        <div><small>Patient</small><strong>${esc(profile.name || 'Patient')}</strong></div>
                        <div><small>Age / Gender</small><strong>${esc(profile.age || 'Not provided')} / ${esc(profile.gender || 'Not specified')}</strong></div>
                        <div><small>History Share ID</small><strong>${esc(passport.passportId || 'Not provided')}</strong></div>
                        <div><small>Last updated</small><strong>${esc(history.lastUpdated || 'Not recorded')}</strong></div>
                    </div>
                    <section class="passport-provider-summary" aria-label="Previous provider">
                        <span>${icon('hospital', 16)}</span>
                        <div><small>Previous primary provider</small><strong>${esc(previousProvider.doctorName || 'Not recorded')}</strong><p>${esc(previousProvider.hospitalName || '')}${previousProvider.city ? ` · ${esc(previousProvider.city)}` : ''}</p></div>
                    </section>
                    <div class="passport-review-grid">
                        <section><h4>${icon('pill', 16)} Effective medications</h4>${listItems(history.effectiveMedications, item => `<strong>${esc(item.medicineName)}</strong> · ${esc(item.dosage || 'Dosage not recorded')}<small>${esc(item.conditionTreated || '')}</small>`, 'No effective medications recorded.')}</section>
                        <section class="passport-alert-card"><h4>${icon('triangle-alert', 16)} Allergies &amp; avoid</h4>${listItems(history.allergiesAndAvoid, item => `<strong>${esc(item.substance)}</strong> · ${esc(item.severity || 'Severity not recorded')}<small>${esc(item.reactionDescription || '')}</small>`, 'No allergies recorded.')}</section>
                        <section><h4>${icon('clipboard-heart', 16)} Care conditions</h4>${listItems(history.careConditions, item => `<strong>${esc(item.category || 'Care instruction')}</strong><small>${esc(item.instruction || '')}</small>`, 'No care conditions recorded.')}</section>
                        <section class="passport-emergency-card"><h4>${icon('siren', 16)} Emergency protocols</h4>${listItems(history.emergencyProtocols, item => `<strong>${esc(item.triggerCondition || 'Emergency trigger')}</strong><small>${esc(item.actionSteps || '')}</small>`, 'No emergency protocols recorded.')}</section>
                    </div>
                    <div class="provider-notice passport-review-disclaimer">${icon('badge-info', 15)} Demo handoff only. Confirm the patient's identity, current medicines, allergies, and emergency instructions before making clinical decisions.</div>
                </div>
                <div class="prescription-modal-actions"><span class="status-note">Read-only clinical view</span><button type="button" class="btn-primary" id="done-passport-review">Done reviewing</button></div>
            </div>`;
        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();
        backdrop.querySelector('#close-passport-review').focus();
        const closeModal = () => {
            backdrop.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
        };
        backdrop.querySelector('#close-passport-review').onclick = closeModal;
        backdrop.querySelector('#done-passport-review').onclick = closeModal;
        backdrop.onclick = event => { if (event.target === backdrop) closeModal(); };
        backdrop.onkeydown = event => { if (event.key === 'Escape') closeModal(); };
    }

    function showPrescriptionModal(visit = {}) {
        const modalId = 'prescription-modal-container';
        let existing = document.getElementById(modalId);
        if (existing) existing.remove();
        const previousFocus = document.activeElement;

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
        const prescription = visit.prescription || window.App.Store?.getPrescription?.(visit.id || visit.reference);
        const medicines = Array.isArray(prescription?.medicines) ? prescription.medicines : [];
        const prescriptionStatus = prescription ? 'Clinician-authored demo record' : 'No prescription recorded';
        const medicineRows = medicines.length ? medicines.map((medicine, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${esc([medicine.name, medicine.strength].filter(Boolean).join(' '))}</strong></td>
                <td>${esc(medicine.dosage || 'Not specified')}</td>
                <td>${esc(medicine.duration || 'Not specified')}</td>
                <td>${esc(medicine.instructions || 'No additional instructions')}</td>
            </tr>`).join('') : '<tr><td colspan="5">No medication was recorded for this visit.</td></tr>';
        const verifyLink = `${window.location.origin}${window.SMARTCARE_BASE_PATH || ''}/verify-rx?id=${encodeURIComponent(rxId)}`;
        const qrUrl = generateQRCodeDataUrl(verifyLink);
        const doctorReg = prescription?.doctorRegNo || 'NMC-2018-94821';
        const isDispensed = prescription?.status === 'dispensed';

        backdrop.innerHTML = `
            <div class="prescription-modal" role="dialog" aria-modal="true" aria-labelledby="rx-title">
                <div class="prescription-modal-header">
                    <h3 id="rx-title">${icon('file-text', 18)} Clinical E-Prescription (Schedule H Verified)</h3>
                    <button type="button" class="btn-ghost modal-close-button" id="close-rx-modal" aria-label="Close modal">${icon('x', 18)}</button>
                </div>
                <div class="prescription-modal-body">
                    <div class="prescription-paper">
                        <div class="rx-header">
                            <div class="rx-brand">
                                <h2>${esc(hospital)}</h2>
                                <p>SmartCare Certified Clinical Record · ${esc(city)}</p>
                                <p style="color:${isDispensed ? '#c53030' : '#2c7a7b'};font-weight:700">
                                    ${isDispensed ? '● REDEEMED / DISPENSED (Locked against reuse)' : '● ACTIVE / VALID PRESCRIPTION · NMC ACCREDITED'}
                                </p>
                            </div>
                            <div class="rx-meta">
                                <strong>Slip Ref: ${esc(rxId)}</strong><br>
                                <span>Date: ${esc(date)}</span><br>
                                <span>Status: <strong style="color:${isDispensed ? '#c53030' : 'var(--teal)'}">${esc(isDispensed ? 'Dispensed' : 'Active')}</strong></span>
                            </div>
                        </div>

                        <div class="rx-patient-info">
                            <div><span>Patient Name</span><strong>${esc(patientName)}</strong></div>
                            <div><span>Age / Gender</span><strong>${esc(age)} Yrs / ${esc(gender)}</strong></div>
                            <div><span>Clinical Department</span><strong>Outpatient Triage (OPD)</strong></div>
                        </div>

                        <div class="rx-vitals-strip"><span><strong>Vitals:</strong> BP: 120/80 mmHg · Pulse: 76 bpm · SpO2: 99% · Temp: 98.4°F (Recorded during visit)</span></div>

                        <div class="rx-section-title">Chief Complaint &amp; Diagnosis</div>
                        <p style="margin:0 0 .75rem;font-size:.84rem;color:#1e3d59">
                            <strong>Symptoms:</strong> ${esc(reason)}<br>
                            <strong>Clinical Assessment:</strong> ${esc(prescription?.assessment || 'Seasonal viral upper respiratory infection with managed reactive airways.')}
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
                            <tbody>${medicineRows}</tbody>
                        </table>

                        <div class="rx-section-title">Diagnostic Lab Reports &amp; Clinical Notes</div>
                        <div style="padding:.65rem;background:#fbfdff;border:1px solid #e0ecf7;border-radius:.4rem;font-size:.78rem">
                            <p style="margin:0"><strong>Recorded summary:</strong> ${esc(prescription?.labSummary || 'CBC parameters and chest auscultation within normal limits. Rest and adequate hydration advised.')}</p>
                        </div>

                        <div class="rx-footer">
                            <div class="rx-seal">
                                ${icon('badge-check', 20)}
                                <span>SMARTCARE VERIFIED E-PRESCRIPTION</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:1rem">
                                <a href="${verifyLink}" target="_blank" title="Scan or click to verify authenticity">
                                    <img src="${qrUrl}" alt="Prescription QR Code" style="width:72px;height:72px;border-radius:4px;border:1px solid #d8e4ef">
                                </a>
                                <div class="rx-signature">
                                    <strong>${esc(prescription?.providerName || 'Dr Meera Shah, MD')}</strong>
                                    <small style="display:block">Reg: ${esc(doctorReg)}</small>
                                    <small>${prescription ? `Signed ${esc(prescription.issuedAt || date)} · Digitally Sealed` : 'Prescription issued'}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prescription-modal-actions" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem">
                    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                        <button type="button" class="btn-secondary btn-icon" id="btn-print-rx">
                            ${icon('printer', 16)} Print / Save PDF
                        </button>
                        <a href="/verify-rx?id=${encodeURIComponent(rxId)}" class="btn-secondary btn-icon" id="btn-verify-web-link">
                            ${icon('shield-check', 15)} Verify Online
                        </a>
                    </div>
                    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                        <button type="button" class="btn-primary btn-icon" id="btn-order-pharm-trigger" style="background:#2b6cb0;border-color:#2b6cb0">
                            ${icon('pill', 15)} Order via Pharmacy
                        </button>
                        <button type="button" class="btn-secondary" id="btn-close-rx">Done</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons();
        backdrop.querySelector('#close-rx-modal').focus();

        const closeModal = () => {
            backdrop.remove();
            if (previousFocus?.isConnected) previousFocus.focus();
        };
        backdrop.querySelector('#close-rx-modal').onclick = closeModal;
        backdrop.querySelector('#btn-close-rx').onclick = closeModal;
        backdrop.onclick = e => { if (e.target === backdrop) closeModal(); };
        backdrop.onkeydown = e => { if (e.key === 'Escape') closeModal(); };

        backdrop.querySelector('#btn-verify-web-link').onclick = e => {
            e.preventDefault();
            closeModal();
            window.App.Store.navigate(`/verify-rx?id=${encodeURIComponent(rxId)}`);
        };

        const pharmBtn = backdrop.querySelector('#btn-order-pharm-trigger');
        if (pharmBtn) {
            pharmBtn.onclick = () => {
                closeModal();
                window.App.Store.navigate('/pharmacy');
            };
        }

        backdrop.querySelector('#btn-print-rx').onclick = () => {
            window.print();
        };

        backdrop.querySelector('#btn-copy-rx').onclick = async () => {
            const medicineSummary = medicines.length
                ? medicines.map(medicine => [medicine.name, medicine.strength, medicine.dosage, medicine.duration].filter(Boolean).join(' · ')).join('; ')
                : 'No medication recorded';
            const summary = `SmartCare demo clinical record - ${hospital}\nRef: ${rxId}\nPatient: ${patientName} (${age}Y/${gender})\nDate: ${date}\nReason: ${reason}\nAssessment: ${prescription?.assessment || 'Not recorded'}\nMedication: ${medicineSummary}\nProvider: ${prescription?.providerName || 'Not recorded'}\nPrototype only — not pharmacy-ready.`;
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
            { icon: 'siren',            label: 'Ambulance',   route: '/ambulance',                     attr: 'data-route' },
            { icon: 'pill',             label: 'Pharmacy',    route: '/pharmacy',                      attr: 'data-route' },
            { icon: 'clipboard-list',   label: 'Visits',      route: '/dashboard/patient/visits',      attr: 'data-tab',   tab: 'visits', tabRoute: '/dashboard/patient' },
        ],
        doctor: [
            { icon: 'layout-dashboard', label: 'Overview',   route: '/dashboard/hospital',            attr: 'data-route' },
            { icon: 'list-ordered',     label: 'Queue',       route: '/dashboard/queue',               attr: 'data-route' },
            { icon: 'siren',            label: 'Trauma SOS',  route: '/ambulance',                     attr: 'data-route' },
            { icon: 'bar-chart-3',      label: 'Analytics',   route: '/dashboard/analytics',           attr: 'data-route' },
            { icon: 'log-out',          label: 'Sign out',    route: null,                             attr: 'signout' },
        ],
        staff: [
            { icon: 'layout-dashboard', label: 'Operations', route: '/dashboard/admin',               attr: 'data-route' },
            { icon: 'list-ordered',     label: 'Queue',       route: '/dashboard/queue',               attr: 'data-route' },
            { icon: 'pill',             label: 'Pharmacy',    route: '/pharmacy',                      attr: 'data-route' },
            { icon: 'bar-chart-3',      label: 'Analytics',   route: '/dashboard/analytics',           attr: 'data-route' },
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

    function syncMobileBottomNav(role, currentRoute) {
        document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
        if (!window.App?.Store?.state?.isLogged) return;

        const effectiveRole = role || window.App?.Store?.state?.loggedRole || 'patient';
        const effectiveRoute = currentRoute || window.App?.Store?.state?.route || '/dashboard/patient';
        const navHtml = mobileBottomNav(effectiveRole, effectiveRoute);

        document.body.insertAdjacentHTML('beforeend', navHtml);
        const nav = document.body.querySelector('.mobile-bottom-nav');
        if (!nav) return;

        // Ensure SPA hrefs are properly mapped
        nav.querySelectorAll('a[data-route]').forEach(link => {
            if (window.App?.Store?.hrefFor) link.href = window.App.Store.hrefFor(link.dataset.route);
        });
        nav.querySelectorAll('a[data-tab]').forEach(link => {
            if (window.App?.Store?.hrefForTab) link.href = window.App.Store.hrefForTab(link.dataset.tabRoute || effectiveRoute, link.dataset.tab);
        });

        // Sign-out button
        const signoutBtn = nav.querySelector('[data-mobile-nav-signout]');
        if (signoutBtn && window.App?.Store?.logout) {
            signoutBtn.onclick = () => {
                document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
                window.App.Store.logout();
            };
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

    function bindMobileBottomNav() {
        if (!window.App?.Store?.state?.isLogged) {
            document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
            return;
        }
        syncMobileBottomNav(window.App?.Store?.state?.loggedRole, window.App?.Store?.state?.route);
    }

    window.App.UI = { icon, footer, toast, topbarControls, bindTopbarControls, mobileBottomNav, bindMobileBottomNav, syncMobileBottomNav, generateQRCodeDataUrl, showQRScannerModal, showQRMagnifierModal, showMedicalPassportModal, showPrescriptionModal };
})();

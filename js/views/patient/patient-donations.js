(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
    const ORGANS = ['Kidney', 'Liver', 'Heart', 'Cornea', 'Lung', 'Pancreas'];

    // Demo map centres (lat/lng tuples for Hyderabad)
    const DEMO_CENTRES_MAP = [
        { name: 'SmartCare Community Hospital Blood Bank', area: 'Banjara Hills', lat: 17.4126, lng: 78.4482, type: 'blood' },
        { name: 'Red Cross Donation Centre', area: 'Secunderabad', lat: 17.4399, lng: 78.4983, type: 'blood' },
        { name: 'CityCare Blood Services', area: 'Kukatpally', lat: 17.4849, lng: 78.3956, type: 'blood' },
        { name: 'Apollo Organ Coordination', area: 'Jubilee Hills', lat: 17.4239, lng: 78.4101, type: 'organ' },
        { name: 'NOTTO Hyderabad Node', area: 'Begumpet', lat: 17.4437, lng: 78.4637, type: 'organ' },
    ];

    let leafletMap = null;
    let leafletMarkers = [];

    window.App.Views.PatientDonations = function () {
        const { state, logout, getDonationsData, addPatientDonation } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';
        const patientName = state.patientData.name || (state.loggedEmail || 'Patient').split('@')[0].replace(/[._-]/g, ' ');

        // Read state from URL
        const urlParams = new URLSearchParams(window.location.search);
        let donationType = ['blood', 'organ'].includes(urlParams.get('type')) ? urlParams.get('type') : 'blood';
        let mode = ['give', 'receive'].includes(urlParams.get('mode')) ? urlParams.get('mode') : 'give';
        let selectedGroup = '';
        let formMessage = '';
        let formMessageType = '';

        function syncUrl() {
            const url = new URL(window.location.href);
            url.searchParams.set('type', donationType);
            url.searchParams.set('mode', mode);
            window.history.replaceState({}, '', url.toString());
        }

        function navHtml() {
            return `<a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a>
<a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a>
<a href="/dashboard/patient/history" data-route="/dashboard/patient/history">${icon('file-text', 16)}<span>Medical History</span></a>
<a href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a>
<a href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a>
<div class="nav-divider"></div>
<a href="/ambulance" data-route="/ambulance" style="color:#e53e3e">${icon('siren', 16)}<span>Ambulance SOS</span></a>
<a href="/pharmacy" data-route="/pharmacy">${icon('pill', 16)}<span>Pharmacy</span></a>
<a href="/verify-rx" data-route="/verify-rx">${icon('shield-check', 16)}<span>Verify Rx</span></a>
<a class="active" href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a>
<a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a>
<button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        }

        // ─── MAP ────────────────────────────────────────────────────
        function initMap() {
            const mapEl = container.querySelector('#pd-map-canvas');
            if (!mapEl || !window.L) return;
            if (leafletMap) {
                leafletMap.remove();
                leafletMap = null;
                leafletMarkers = [];
            }
            leafletMap = window.L.map(mapEl, {
                center: [17.4399, 78.4983],
                zoom: 12,
                zoomControl: true,
            });
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(leafletMap);

            // Custom marker icon
            const markerIcon = window.L.divIcon({
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -34],
                html: `<div class="pd-map-pin"><span></span></div>`,
            });

            DEMO_CENTRES_MAP.forEach(c => {
                const marker = window.L.marker([c.lat, c.lng], { icon: markerIcon }).addTo(leafletMap);
                marker.bindPopup(`<div class="pd-popup"><strong>${c.name}</strong><span>${c.area}</span><small>${c.type === 'blood' ? 'Blood donation centre' : 'Organ coordination'}</small></div>`);
                leafletMarkers.push({ marker, type: c.type, centre: c });
            });

            filterMapMarkers(donationType);

            // Invalidate size after next paint (panel may have just been shown)
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    if (leafletMap) leafletMap.invalidateSize();
                });
            });
        }

        function filterMapMarkers(type) {
            if (!leafletMap) return;
            leafletMarkers.forEach(({ marker, type: mType }) => {
                if (type === mType || type === 'all') {
                    if (!leafletMap.hasLayer(marker)) marker.addTo(leafletMap);
                } else {
                    if (leafletMap.hasLayer(marker)) leafletMap.removeLayer(marker);
                }
            });
        }

        function loadLeaflet(cb) {
            if (window.L) { cb(); return; }
            // Load CSS
            if (!document.querySelector('#leaflet-css')) {
                const lnk = document.createElement('link');
                lnk.id = 'leaflet-css';
                lnk.rel = 'stylesheet';
                lnk.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(lnk);
            }
            // Load JS
            if (!document.querySelector('#leaflet-js')) {
                const scr = document.createElement('script');
                scr.id = 'leaflet-js';
                scr.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                scr.onload = cb;
                document.head.appendChild(scr);
            }
        }

        // ─── RESULTS LIST ───────────────────────────────────────────
        function renderResults(centres) {
            const scroll = container.querySelector('#pd-results-scroll');
            const header = container.querySelector('#pd-results-header');
            const count = container.querySelector('#pd-result-count');
            const subtitle = container.querySelector('#pd-results-subtitle');
            if (!scroll) return;

            count.textContent = centres.length;
            subtitle.textContent = centres.length ? `Showing ${donationType} donation centres` : '';
            header.style.display = 'flex';

            if (!centres.length) {
                scroll.innerHTML = `
<div class="nd-empty-state">
  <div class="nd-empty-symbol">${icon('search-x', 22)}</div>
  <h3>No centres found</h3>
  <p>No demo centre matched that search. Try a different group or nearby city.</p>
</div>`;
                return;
            }

            scroll.innerHTML = centres.map(c => `
<div class="nd-result-row" data-centre="${esc(c.name)}">
  <button type="button" class="nd-result-select pd-result-select" data-lat="${c.lat || ''}" data-lng="${c.lng || ''}">
    <div class="nd-blood-avatar">${donationType === 'blood' ? esc(selectedGroup || 'B+') : icon('heart-handshake', 18)}</div>
    <div class="nd-result-info">
      <strong>${esc(c.name)}</strong>
      <span>${esc(c.area || '')} · ${esc(c.hours || 'Call to confirm hours')}</span>
      ${c.note ? `<small>${esc(c.note)}</small>` : ''}
    </div>
    <div class="nd-distance">${icon('map-pin', 12)}<small>Nearby</small></div>
  </button>
  <button type="button" class="nd-request-btn pd-pledge-btn" data-centre="${esc(c.name)}">
    ${icon(mode === 'give' ? 'heart-handshake' : 'phone', 13)} ${mode === 'give' ? 'Pledge' : 'Request'} ${icon('chevron-right', 13)}
  </button>
</div>`).join('');
            if (window.lucide) window.lucide.createIcons();

            // Fly to centre on result click
            container.querySelectorAll('.pd-result-select').forEach(btn => {
                btn.onclick = () => {
                    const lat = parseFloat(btn.dataset.lat);
                    const lng = parseFloat(btn.dataset.lng);
                    if (leafletMap && lat && lng) {
                        leafletMap.flyTo([lat, lng], 15, { duration: 0.8 });
                        leafletMarkers.forEach(({ marker, centre }) => {
                            if (centre.name === btn.closest('[data-centre]').dataset.centre) {
                                marker.openPopup();
                            }
                        });
                    }
                    // Mobile: switch to map view
                    const shell = container.querySelector('#pd-finder-shell');
                    if (shell && window.innerWidth <= 760) {
                        shell.classList.add('nd-show-map');
                        if (leafletMap) leafletMap.invalidateSize();
                    }
                };
            });

            container.querySelectorAll('.pd-pledge-btn').forEach(btn => {
                btn.onclick = () => {
                    window.App.UI.toast(`Demo response recorded for ${btn.dataset.centre}. No coordinator was contacted.`, 'info');
                };
            });
        }

        // ─── RENDER ──────────────────────────────────────────────────
        function render() {
            syncUrl();
            const donationsData = getDonationsData();
            const targetMode = mode === 'give' ? 'request' : 'offer';
            const hospitalPosts = donationsData.hospitalPosts.filter(p => p.type === donationType && p.mode === targetMode);
            const myPosts = donationsData.patientPosts.filter(p => p.type === donationType);

            // Destroy map before re-render
            if (leafletMap) { leafletMap.remove(); leafletMap = null; leafletMarkers = []; }

            container.innerHTML = `
<div class="flow-topbar" data-section="donations-topbar">
  <a class="brand-lockup" data-route="/" href="/">
    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient portal</span></span>
  </a>
  <div class="flow-topbar-actions">
    ${window.App.UI.topbarControls(true)}
    <a class="back-link" data-route="/dashboard/patient" href="/dashboard/patient">${icon('arrow-left', 16)} Dashboard</a>
  </div>
</div>

<main class="provider-shell" data-section="patient-donations">

  <!-- Sidebar injected by JS below -->

  <div class="workspace-content pd-workspace-content">

    <!-- Finder shell: left panel + right map -->
    <div class="nd-finder-shell" id="pd-finder-shell">

      <!-- LEFT PANEL -->
      <aside class="nd-finder-panel" id="pd-finder-panel">

        <!-- Header: name + mode tabs -->
        <div class="nd-finder-intro pd-intro">
          <div class="pd-intro-meta">
            <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Community &amp; Hospital</div>
            <h1>Give or receive,<br><span>${esc(patientName)}.</span></h1>
          </div>

          <!-- Type switch (Blood / Organ) -->
          <div class="nd-type-switch" role="tablist" aria-label="Donation type">
            <button class="nd-type-btn${donationType === 'blood' ? ' active' : ''}" data-dtype="blood" role="tab">
              ${icon('droplets', 15)} Blood
            </button>
            <button class="nd-type-btn${donationType === 'organ' ? ' active' : ''}" data-dtype="organ" role="tab">
              ${icon('heart-handshake', 15)} Organ
            </button>
          </div>

          <!-- Mode tabs (Give / Receive) -->
          <div class="pd-mode-tabs" role="tablist" aria-label="Give or receive">
            <button class="pd-mode-btn${mode === 'give' ? ' active' : ''}" data-mode="give">${icon('heart-handshake', 14)} I want to give</button>
            <button class="pd-mode-btn${mode === 'receive' ? ' active' : ''}" data-mode="receive">${icon('hand', 14)} I need a donation</button>
          </div>
        </div>

        <!-- Blood panel -->
        <div class="nd-tab-panel${donationType === 'blood' ? ' active' : ''}" data-panel="blood">
          <div class="nd-search-controls">
            <fieldset class="nd-blood-selector">
              <legend>Select blood group</legend>
              <div class="nd-blood-grid" id="pd-blood-grid">
                ${BLOOD_GROUPS.map(g => `<button type="button" class="nd-bg-btn" data-group="${esc(g)}">${esc(g)}</button>`).join('')}
              </div>
            </fieldset>
            <div class="nd-field">
              <label for="pd-blood-city">City or PIN code</label>
              <div class="nd-input-row">
                <div class="nd-select-wrap">
                  ${icon('map-pin', 14)}
                  <input id="pd-blood-city" type="text" placeholder="e.g. Hyderabad or 500034" value="${esc(state.patientData.city || 'Hyderabad')}">
                </div>
                <button type="button" class="nd-locate-btn" id="pd-locate-btn" title="Use my location">${icon('locate', 16)}</button>
              </div>
            </div>
            <button type="button" class="nd-search-btn" id="pd-search-btn">${icon('search', 15)} Find ${mode === 'give' ? 'donation centres' : 'blood availability'}</button>
          </div>

          <!-- Results -->
          <div class="nd-results-header" id="pd-results-header" style="display:none">
            <h2>${icon('droplets', 14)} Results <span class="nd-count" id="pd-result-count">0</span></h2>
            <span id="pd-results-subtitle"></span>
          </div>
          <div class="nd-results-scroll" id="pd-results-scroll" aria-live="polite">
            <div class="nd-empty-state">
              <div class="nd-empty-symbol">${icon('map-pin', 22)}</div>
              <h3>Choose a blood group</h3>
              <p>Select a group and tap "Find centres" to see nearby demo donation locations.</p>
            </div>
          </div>

          <!-- My submissions -->
          ${myPosts.length ? `
          <div class="pd-my-posts">
            <div class="pd-my-posts-header">${icon('clipboard-list', 14)} Your active registrations</div>
            ${myPosts.map(p => `
            <div class="nd-result-row">
              <div class="nd-result-select" style="cursor:default">
                <div class="nd-blood-avatar" style="background:var(--mint);font-size:.8rem">${esc(p.group)}</div>
                <div class="nd-result-info">
                  <strong>${esc(p.name)} (${esc(p.group)})</strong>
                  <span>${p.mode === 'give' ? 'Registered donor' : 'Requested'} · ${esc(p.status || 'Active')}</span>
                </div>
                <span style="font-size:.65rem;color:var(--teal);font-weight:700">Listed</span>
              </div>
            </div>`).join('')}
          </div>` : ''}

          <!-- Register donor form -->
          <div class="nd-panel-aside pd-register-aside">
            ${icon(mode === 'give' ? 'heart-handshake' : 'package-check', 16)}
            <div>
              <strong>${mode === 'give' ? 'Register as donor' : 'Request blood'}</strong>
              <form id="pd-blood-form" class="pd-mini-form">
                <input type="text" id="pd-b-name" placeholder="Your name" value="${esc(patientName)}" required>
                <select id="pd-b-group">${BLOOD_GROUPS.map(g => `<option>${g}</option>`).join('')}</select>
                ${mode === 'receive' ? `<select id="pd-b-urgency"><option>Routine</option><option>Urgent</option><option>Emergency</option></select>` : `<label class="pd-mini-consent"><input type="checkbox" id="pd-b-consent" required> I understand this is a demo interest only.</label>`}
                <button type="submit" class="nd-search-btn pd-mini-submit">${icon(mode === 'give' ? 'heart-handshake' : 'send', 14)} ${mode === 'give' ? 'Save interest' : 'Save request'}</button>
              </form>
              ${formMessage && donationType === 'blood' ? `<div class="nd-organ-message ${formMessageType}" role="status">${formMessage}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Organ panel -->
        <div class="nd-tab-panel${donationType === 'organ' ? ' active' : ''}" data-panel="organ">
          <div class="nd-search-controls">
            <p class="nd-intro-text">${mode === 'give' ? 'Record a non-binding organ donation interest for a care team to follow up on.' : 'Record a demo organ guidance request to explore the coordinator workflow.'}</p>
            <form id="pd-organ-form" class="nd-organ-form">
              <div class="nd-field">
                <label for="pd-o-name">Full name <span>*</span></label>
                <input id="pd-o-name" type="text" value="${esc(patientName)}" required>
              </div>
              <div class="nd-field">
                <label for="pd-o-organ">${mode === 'give' ? 'Organ of interest' : 'Organ guidance needed'}</label>
                <select id="pd-o-organ">${ORGANS.map(o => `<option>${o}</option>`).join('')}</select>
              </div>
              <div class="nd-field">
                <label for="pd-o-city">City <span>*</span></label>
                <input id="pd-o-city" type="text" placeholder="Hyderabad" value="${esc(state.patientData.city || 'Hyderabad')}" required>
              </div>
              ${mode === 'give'
                ? `<label class="nd-consent-label"><input type="checkbox" id="pd-o-consent" required><span>I understand this is not legal donor registration or an official registry submission.</span></label>`
                : `<div class="nd-field"><label for="pd-o-urgency">Urgency</label><select id="pd-o-urgency"><option>Routine</option><option>Urgent</option><option>Emergency</option></select></div>`}
              <button type="submit" class="nd-search-btn">${icon(mode === 'give' ? 'heart-handshake' : 'send', 14)} ${mode === 'give' ? 'Save organ interest' : 'Save guidance request'}</button>
            </form>
            ${formMessage && donationType === 'organ' ? `<div class="nd-organ-message ${formMessageType}" role="status" style="margin-top:.5rem">${formMessage}</div>` : ''}
          </div>

          <!-- Hospital organ posts -->
          ${hospitalPosts.length ? `
          <div class="nd-results-header" style="display:flex">
            <h2>${icon('building-2', 14)} Hospital ${mode === 'give' ? 'requirements' : 'availability'} <span class="nd-count">${hospitalPosts.length}</span></h2>
          </div>
          <div class="nd-results-scroll" style="max-height:220px">
            ${hospitalPosts.map(p => `
            <div class="nd-result-row">
              <div class="nd-result-select" style="cursor:default">
                <div class="nd-blood-avatar">${icon('activity', 16)}</div>
                <div class="nd-result-info">
                  <strong>${esc(p.group)} · ${esc(p.hospital)}</strong>
                  <span>${p.units ? `${esc(String(p.units))} units · ` : ''}${esc(p.urgency || 'Routine')} · ${esc(p.city)}</span>
                  ${p.notes ? `<small>${esc(p.notes)}</small>` : ''}
                </div>
                <button type="button" class="nd-request-btn pd-pledge-btn" data-centre="${esc(p.hospital)}" style="width:auto;padding:.35rem .65rem;margin-left:auto;font-size:.65rem;white-space:nowrap">
                  ${mode === 'give' ? 'Pledge' : 'Request'}
                </button>
              </div>
            </div>`).join('')}
          </div>` : ''}

          <!-- Organ aside -->
          <div class="nd-panel-aside">
            ${icon('scale', 16)}
            <div>
              <strong>Important distinction</strong>
              <p>Legal organ donation registration depends on your country, official registry, family process, and clinical guidance.</p>
              <a class="nd-text-link" href="https://notto.mohfw.gov.in/" target="_blank" rel="noopener noreferrer">Visit India's official NOTTO site ${icon('external-link', 13)}</a>
            </div>
          </div>
        </div>

        <div class="nd-panel-bottom">
          ${icon('info', 12)}
          <span>Demo only — no real hospitals, registries, or care centres are contacted.</span>
        </div>
      </aside>

      <!-- RIGHT MAP -->
      <div class="nd-finder-map pd-map-area" id="pd-finder-map">
        <div id="pd-map-canvas" class="pd-map-canvas"></div>
        <div class="nd-map-legend">
          <span class="nd-legend-dot"></span> Donation centre
          <span class="nd-legend-dot" style="background:#0a3b69;margin-left:.75rem"></span> Organ coord.
        </div>
      </div>

      <!-- Mobile toggle -->
      <button class="nd-mobile-view-toggle" id="pd-mobile-view-toggle" aria-label="Toggle map/list view">
        ${icon('layers', 14)} <span id="pd-toggle-label">Show map</span>
      </button>

    </div><!-- /.nd-finder-shell -->
  </div><!-- /.workspace-content -->
</main>

${window.App.UI.footer(true)}`;

            // ─── Inject sidebar nav ─────────────────────────────────
            const workspaceMain = container.querySelector('main');
            const workspaceNav = document.createElement('nav');
            workspaceNav.className = 'workspace-tabs';
            workspaceNav.setAttribute('aria-label', 'Patient portal navigation');
            workspaceNav.innerHTML = navHtml();
            workspaceMain.insertBefore(workspaceNav, workspaceMain.firstChild);

            // ─── Bind events ────────────────────────────────────────
            container.querySelector('#workspace-logout').onclick = logout;

            // Type switch
            container.querySelectorAll('[data-dtype]').forEach(btn => {
                btn.onclick = () => { donationType = btn.dataset.dtype; formMessage = ''; render(); };
            });

            // Mode tabs
            container.querySelectorAll('[data-mode]').forEach(btn => {
                btn.onclick = () => { mode = btn.dataset.mode; formMessage = ''; render(); };
            });

            // Blood group grid
            container.querySelectorAll('#pd-blood-grid .nd-bg-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('#pd-blood-grid .nd-bg-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedGroup = btn.dataset.group;
                };
            });

            // Locate button
            const locateBtn = container.querySelector('#pd-locate-btn');
            if (locateBtn) {
                locateBtn.onclick = () => {
                    if (!navigator.geolocation) return window.App.UI.toast('Geolocation not available.', 'error');
                    locateBtn.disabled = true;
                    locateBtn.innerHTML = icon('loader', 16);
                    if (window.lucide) window.lucide.createIcons();
                    navigator.geolocation.getCurrentPosition(pos => {
                        locateBtn.disabled = false;
                        locateBtn.innerHTML = icon('locate', 16);
                        if (window.lucide) window.lucide.createIcons();
                        const cityInput = container.querySelector('#pd-blood-city');
                        if (cityInput) { cityInput.value = ''; cityInput.placeholder = `Near you (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`; }
                        if (leafletMap) leafletMap.flyTo([pos.coords.latitude, pos.coords.longitude], 13);
                    }, () => {
                        locateBtn.disabled = false;
                        locateBtn.innerHTML = icon('locate', 16);
                        if (window.lucide) window.lucide.createIcons();
                        window.App.UI.toast('Could not get location. Enter city manually.', 'error');
                    });
                };
            }

            // Search button
            const searchBtn = container.querySelector('#pd-search-btn');
            if (searchBtn) {
                searchBtn.onclick = async () => {
                    const group = selectedGroup;
                    const city = (container.querySelector('#pd-blood-city')?.value || '').trim();
                    if (!group) return window.App.UI.toast('Please select a blood group first.', 'error');
                    if (!city) return window.App.UI.toast('Please enter a city or PIN code.', 'error');

                    const scroll = container.querySelector('#pd-results-scroll');
                    scroll.innerHTML = `<div class="nd-results-loading">${icon('loader', 18)} Finding centres near ${esc(city)}…</div>`;
                    if (window.lucide) window.lucide.createIcons();
                    container.querySelector('#pd-results-header').style.display = 'none';

                    try {
                        const raw = await window.App.DB.findBloodCentres({ group, city });
                        // Merge with demo map positions
                        const centres = raw.map(c => {
                            const pos = DEMO_CENTRES_MAP.find(d => d.name === c.name);
                            return { ...c, lat: pos?.lat, lng: pos?.lng };
                        });
                        renderResults(centres);
                        filterMapMarkers(donationType);
                        // Mobile: keep list view after search
                        const shell = container.querySelector('#pd-finder-shell');
                        if (shell) shell.classList.remove('nd-show-map');
                    } catch {
                        container.querySelector('#pd-results-scroll').innerHTML = `<div class="nd-empty-state"><div class="nd-empty-symbol">${icon('triangle-alert', 22)}</div><h3>Unavailable</h3><p>Donation support is unavailable right now.</p></div>`;
                        if (window.lucide) window.lucide.createIcons();
                    }
                };
            }

            // Blood donor register form
            const bloodForm = container.querySelector('#pd-blood-form');
            if (bloodForm) {
                bloodForm.onsubmit = e => {
                    e.preventDefault();
                    const name = container.querySelector('#pd-b-name')?.value.trim();
                    const group = container.querySelector('#pd-b-group')?.value;
                    const urgency = container.querySelector('#pd-b-urgency')?.value || 'Routine';
                    const consent = container.querySelector('#pd-b-consent');
                    const city = state.patientData.city || 'Hyderabad';

                    if (!name) { formMessage = 'Please enter your name.'; formMessageType = 'error'; render(); return; }
                    if (mode === 'give' && consent && !consent.checked) { formMessage = 'Please confirm the demo notice.'; formMessageType = 'error'; render(); return; }

                    addPatientDonation({ type: 'blood', mode, name, group, city, urgency });
                    formMessage = mode === 'give'
                        ? `Saved ${name}'s ${group} blood donor interest. No hospital contacted.`
                        : `Saved ${group} blood request in the demo pool.`;
                    formMessageType = 'success';
                    window.App.UI.toast(formMessage, 'success');
                    render();
                    if (mode === 'give') {
                        showDonorCardModal({ name, type: 'blood', group, city });
                    }
                };
            }

            // Organ form
            const organForm = container.querySelector('#pd-organ-form');
            if (organForm) {
                organForm.onsubmit = async e => {
                    e.preventDefault();
                    const name = container.querySelector('#pd-o-name')?.value.trim();
                    const group = container.querySelector('#pd-o-organ')?.value;
                    const city = container.querySelector('#pd-o-city')?.value.trim() || state.patientData.city || 'Hyderabad';
                    const urgency = container.querySelector('#pd-o-urgency')?.value || 'Routine';
                    const consent = container.querySelector('#pd-o-consent');

                    if (!name) { formMessage = 'Please enter your name.'; formMessageType = 'error'; render(); return; }
                    if (mode === 'give' && consent && !consent.checked) { formMessage = 'Please confirm the demo notice.'; formMessageType = 'error'; render(); return; }

                    addPatientDonation({ type: 'organ', mode, name, group, city, urgency });
                    formMessage = mode === 'give'
                        ? `Saved organ donation interest for ${group}. No registry contacted.`
                        : `Saved ${group} organ guidance request.`;
                    formMessageType = 'success';
                    window.App.UI.toast(formMessage, 'success');
                    render();
                    if (mode === 'give') {
                        showDonorCardModal({ name, type: 'organ', group, city });
                    }
                };
            }

            // Pledge buttons in hospital organ posts
            container.querySelectorAll('.pd-pledge-btn').forEach(btn => {
                btn.onclick = () => {
                    const centre = btn.dataset.centre;
                    window.App.UI.toast(`Demo response recorded for ${centre}. No coordinator was contacted.`, 'info');
                    showDonorCardModal({ name: patientName, type: donationType, group: donationType === 'blood' ? 'O+' : 'All Tissues & Organs', city: centre });
                };
            });

            function showDonorCardModal(pledge) {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                const donorId = 'SCD-' + Math.floor(1000 + Math.random() * 9000);
                const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                backdrop.innerHTML = `
                    <section class="modal-card" role="dialog" aria-modal="true" style="max-width:480px;width:95%;padding:0;overflow:hidden;border-radius:16px">
                        <div style="background:linear-gradient(135deg, #134e4a 0%, #0d9488 100%);color:#fff;padding:1.5rem;position:relative">
                            <button type="button" class="btn-ghost modal-close-button" data-close-card aria-label="Close card" style="position:absolute;top:1rem;right:1rem;color:#fff">${icon('x', 18)}</button>
                            <div style="display:flex;align-items:center;gap:.65rem;margin-bottom:1rem">
                                <span style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.2)">
                                    ${icon(pledge.type === 'blood' ? 'droplets' : 'heart-handshake', 22)}
                                </span>
                                <div>
                                    <span style="font-size:.72rem;letter-spacing:0.05em;text-transform:uppercase;color:#ccfbf1;font-weight:700">Official Donor Recognition Card</span>
                                    <h3 style="font-size:1.25rem;margin:.15rem 0 0;color:#fff">SmartCare Donor Honor Roll</h3>
                                </div>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);padding:1rem;border-radius:10px;border:1px solid rgba(255,255,255,0.15)">
                                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
                                    <div>
                                        <small style="color:#ccfbf1;font-size:.7rem;display:block">HONORARY DONOR</small>
                                        <strong style="font-size:1.15rem;letter-spacing:0.02em">${esc(pledge.name)}</strong>
                                    </div>
                                    <div style="text-align:right">
                                        <small style="color:#ccfbf1;font-size:.7rem;display:block">${pledge.type === 'blood' ? 'BLOOD GROUP' : 'PLEDGED'}</small>
                                        <strong style="font-size:1.25rem;color:#fef08a">${esc(pledge.group)}</strong>
                                    </div>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:.75rem;color:#e6fffa;border-top:1px solid rgba(255,255,255,0.15);padding-top:.5rem">
                                    <span>Ref: <strong>${donorId}</strong></span>
                                    <span>City: ${esc(pledge.city || 'Hyderabad')}</span>
                                    <span>Date: ${dateStr}</span>
                                </div>
                            </div>
                        </div>

                        <div style="padding:1.25rem;background:var(--surface)">
                            <div style="display:flex;align-items:flex-start;gap:.75rem;background:var(--canvas);padding:.85rem;border-radius:8px;border:1px solid var(--line);margin-bottom:1.25rem">
                                ${icon('shield-check', 20)}
                                <div style="font-size:.82rem;color:var(--muted);line-height:1.4">
                                    <strong style="color:var(--ink);display:block;margin-bottom:.15rem">Thank you for pledging care to our community!</strong>
                                    Registered in the SmartCare Community Donor Pool. You may show this digital card at any partner hospital blood bank or coordination desk.
                                </div>
                            </div>

                            <div class="modal-actions" style="display:flex;justify-content:space-between;gap:.5rem">
                                <button type="button" class="btn-secondary btn-icon" id="btn-print-donor-card">
                                    ${icon('printer', 14)} Print Card
                                </button>
                                <button type="button" class="btn-primary" data-close-card style="padding:.45rem 1.25rem">
                                    Done
                                </button>
                            </div>
                        </div>
                    </section>
                `;

                if (window.lucide) window.lucide.createIcons();

                const close = () => backdrop.remove();
                backdrop.querySelectorAll('[data-close-card]').forEach(b => b.onclick = close);
                backdrop.onclick = e => { if (e.target === backdrop) close(); };

                const printBtn = backdrop.querySelector('#btn-print-donor-card');
                if (printBtn) {
                    printBtn.onclick = () => window.print();
                }

                document.body.appendChild(backdrop);
            }

            // Mobile view toggle
            const mobileToggle = container.querySelector('#pd-mobile-view-toggle');
            const shell = container.querySelector('#pd-finder-shell');
            const toggleLabel = container.querySelector('#pd-toggle-label');
            if (mobileToggle) {
                mobileToggle.onclick = () => {
                    const isMap = shell.classList.toggle('nd-show-map');
                    if (toggleLabel) toggleLabel.textContent = isMap ? 'Show list' : 'Show map';
                    if (isMap && leafletMap) {
                        window.requestAnimationFrame(() => leafletMap.invalidateSize());
                    }
                };
            }

            // ─── Topbar + sidebar controls ──────────────────────────
            window.App.UI.bindTopbarControls(container);
            if (state.isLogged) {
                window.App.UI.syncMobileBottomNav('patient', state.route);
            } else {
                document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
            }

            // ─── Load Leaflet map ───────────────────────────────────
            loadLeaflet(() => {
                initMap();
                filterMapMarkers(donationType);
            });

            if (window.lucide) window.lucide.createIcons();
        }

        render();
        return container;
    };
})();

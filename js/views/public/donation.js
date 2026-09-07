(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    window.App.Views.Donation = function () {
        const { state, navigateTab } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell donation-shell';

        const activeTab = ['blood', 'organ'].includes(state.activeTab) ? state.activeTab : 'blood';

        const render = () => {
            container.innerHTML = `
<div class="flow-topbar donation-topbar" data-section="donation-topbar">
  <a class="brand-lockup" data-route="/" href="/">
    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Community care</span></span>
  </a>
  <nav class="flow-topbar-nav" aria-label="Community navigation">
    <a data-route="/" href="/">Home</a>
    <a class="active" data-route="/donate" href="/donate">Donation</a>
    <a data-route="/about" href="/about">About</a>
    <a data-route="/login" href="/login">Portal sign in</a>
  </nav>
  <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back home</a>
</div>

<div class="nd-finder-shell" id="nd-finder-shell">

  <!-- LEFT PANEL -->
  <aside class="nd-finder-panel" id="nd-finder-panel">

    <!-- Intro -->
    <div class="nd-finder-intro">
      <div class="nd-type-switch" role="tablist" aria-label="Donation type">
        <button class="nd-type-btn${activeTab === 'blood' ? ' active' : ''}" data-tab="blood" role="tab" aria-selected="${activeTab === 'blood'}">
          ${icon('droplets', 16)} Blood
        </button>
        <button class="nd-type-btn${activeTab === 'organ' ? ' active' : ''}" data-tab="organ" role="tab" aria-selected="${activeTab === 'organ'}">
          ${icon('heart-handshake', 16)} Organ
        </button>
      </div>
      <h1 id="nd-heading">${activeTab === 'blood' ? 'Find blood<br><span>donation support.</span>' : 'Organ donation<br><span>interest.</span>'}</h1>
    </div>

    <!-- Blood Panel -->
    <div class="nd-tab-panel${activeTab === 'blood' ? ' active' : ''}" data-panel="blood">
      <div class="nd-search-controls">
        <!-- Blood group grid -->
        <fieldset class="nd-blood-selector">
          <legend>Select blood group</legend>
          <div class="nd-blood-grid" id="nd-blood-grid">
            ${BLOOD_GROUPS.map(g => `<button type="button" class="nd-bg-btn" data-group="${esc(g)}">${esc(g)}</button>`).join('')}
          </div>
        </fieldset>
        <!-- City search -->
        <div class="nd-field">
          <label for="nd-blood-city">City or PIN code</label>
          <div class="nd-input-row">
            <div class="nd-select-wrap nd-city-wrap">
              ${icon('map-pin', 14)}
              <input id="nd-blood-city" type="text" placeholder="e.g. Hyderabad or 500034" autocomplete="off">
            </div>
            <button type="button" class="nd-locate-btn" id="nd-locate-btn" title="Use my location">
              ${icon('locate', 16)}
            </button>
          </div>
        </div>
        <div class="nd-origin-label" id="nd-origin-label" style="display:none">
          <span>${icon('navigation', 10)} <span id="nd-origin-text"></span></span>
          <button type="button" id="nd-clear-loc">Clear</button>
        </div>
        <button type="button" class="nd-search-btn" id="nd-search-btn">
          ${icon('search', 15)} Find donation centres
        </button>
      </div>

      <!-- Results -->
      <div class="nd-results-header" id="nd-results-header" style="display:none">
        <h2>${icon('droplets', 14)} Results <span class="nd-count" id="nd-result-count">0</span></h2>
        <span id="nd-results-subtitle"></span>
      </div>
      <div class="nd-results-scroll" id="nd-results-scroll" aria-live="polite">
        <div class="nd-empty-state nd-location-empty">
          <div class="nd-empty-symbol">${icon('map-pin', 22)}</div>
          <h3>Choose a location</h3>
          <p>Select a blood group and enter your city to see nearby demo donation centres.</p>
        </div>
      </div>

      <!-- Before you donate aside -->
      <div class="nd-panel-aside">
        ${icon('shield-check', 16)}
        <div>
          <strong>Before you donate</strong>
          <ul>
            <li>Use official screening and eligibility guidance.</li>
            <li>Bring valid identification where required.</li>
            <li>Do not share medical records in this demo.</li>
          </ul>
          <a class="nd-text-link" data-route="/about" href="/about">How SmartCare handles demo data ${icon('arrow-right', 13)}</a>
        </div>
      </div>
    </div>

    <!-- Organ Panel -->
    <div class="nd-tab-panel${activeTab === 'organ' ? ' active' : ''}" data-panel="organ">
      <div class="nd-search-controls">
        <p class="nd-intro-text">Record a non-binding demo interest so a care team can explain official next steps.</p>
        <form id="nd-organ-form" class="nd-organ-form">
          <div class="nd-field">
            <label for="nd-organ-name">Your name <span>*</span></label>
            <input id="nd-organ-name" type="text" autocomplete="name" placeholder="e.g. Asha Rao" required>
          </div>
          <div class="nd-field">
            <label for="nd-organ-city">City or state <span>*</span></label>
            <input id="nd-organ-city" type="text" placeholder="e.g. Hyderabad" required>
          </div>
          <div class="nd-field">
            <label for="nd-organ-pref">Interest</label>
            <select id="nd-organ-pref">
              <option>Learn about donation</option>
              <option>Register interest with a care team</option>
              <option>Support a family conversation</option>
            </select>
          </div>
          <label class="nd-consent-label">
            <input type="checkbox" id="nd-organ-consent" required>
            <span>I understand this demo is not a legal donor registration or consent form.</span>
          </label>
          <button type="submit" class="nd-search-btn">
            ${icon('heart-handshake', 15)} Save demo interest
          </button>
        </form>
        <div class="nd-organ-message" id="nd-organ-message" role="status" aria-live="polite"></div>
      </div>

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
      <span>This is a demo. All data shown is for demonstration only and does not represent real donation opportunities.</span>
    </div>
  </aside>

  <!-- RIGHT AREA — visual illustration / map placeholder -->
  <div class="nd-finder-map" id="nd-finder-map" aria-hidden="true">
    <div class="nd-map-placeholder">
      <div class="nd-map-icon">${icon(activeTab === 'blood' ? 'droplets' : 'heart-handshake', 48)}</div>
      <p>SmartCare Community Care</p>
      <span>Connecting communities with donation support</span>
    </div>
    <div class="nd-map-legend">
      <span class="nd-legend-dot"></span> Donation centre
    </div>
  </div>

  <!-- Mobile view toggle (map / list) -->
  <button class="nd-mobile-view-toggle" id="nd-mobile-view-toggle" aria-label="Switch view">
    ${icon('layers', 14)} Toggle view
  </button>
</div>

${window.App.UI.footer()}`;

            bind();
            if (window.lucide) window.lucide.createIcons();
        };

        render();
        return container;

        function bind() {
            // Tab switching
            container.querySelectorAll('.nd-type-btn').forEach(btn => {
                btn.onclick = e => {
                    e.preventDefault();
                    navigateTab(btn.dataset.tab, '/donate');
                };
            });

            // Blood group grid selection
            let selectedGroup = '';
            container.querySelectorAll('.nd-bg-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.nd-bg-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedGroup = btn.dataset.group;
                };
            });

            // Locate button
            const locateBtn = container.querySelector('#nd-locate-btn');
            const originLabel = container.querySelector('#nd-origin-label');
            const originText = container.querySelector('#nd-origin-text');
            const cityInput = container.querySelector('#nd-blood-city');

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
                        cityInput.value = '';
                        cityInput.placeholder = `Near you (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`;
                        originText.textContent = `Using device location`;
                        originLabel.style.display = 'flex';
                    }, () => {
                        locateBtn.disabled = false;
                        locateBtn.innerHTML = icon('locate', 16);
                        if (window.lucide) window.lucide.createIcons();
                        window.App.UI.toast('Could not get location. Please enter city manually.', 'error');
                    });
                };
            }

            const clearLocBtn = container.querySelector('#nd-clear-loc');
            if (clearLocBtn) {
                clearLocBtn.onclick = () => {
                    cityInput.value = '';
                    cityInput.placeholder = 'e.g. Hyderabad or 500034';
                    originLabel.style.display = 'none';
                };
            }

            // Search button
            const searchBtn = container.querySelector('#nd-search-btn');
            if (searchBtn) {
                searchBtn.onclick = async () => {
                    const group = selectedGroup;
                    const city = cityInput.value.trim();
                    if (!group) return window.App.UI.toast('Please select a blood group first.', 'error');
                    if (!city) return window.App.UI.toast('Please enter a city or PIN code.', 'error');

                    const scroll = container.querySelector('#nd-results-scroll');
                    const header = container.querySelector('#nd-results-header');
                    const count = container.querySelector('#nd-result-count');
                    const subtitle = container.querySelector('#nd-results-subtitle');

                    scroll.innerHTML = `<div class="nd-results-loading">${icon('loader', 18)} Finding centres near ${esc(city)}…</div>`;
                    if (window.lucide) window.lucide.createIcons();
                    header.style.display = 'none';

                    try {
                        const centres = await window.App.DB.findBloodCentres({ group, city });
                        count.textContent = centres.length;
                        subtitle.textContent = centres.length ? `Showing demo results for ${esc(city)}` : '';
                        header.style.display = 'flex';

                        if (!centres.length) {
                            scroll.innerHTML = `
<div class="nd-empty-state">
  <div class="nd-empty-symbol">${icon('search-x', 22)}</div>
  <h3>No centres found</h3>
  <p>No demo centre matched "${esc(city)}" for blood group ${esc(group)}. Try a nearby city or different group.</p>
</div>`;
                        } else {
                            scroll.innerHTML = centres.map(c => `
<div class="nd-result-row" data-centre="${esc(c.name)}">
  <button type="button" class="nd-result-select">
    <div class="nd-blood-avatar">${esc(group)}</div>
    <div class="nd-result-info">
      <strong>${esc(c.name)}</strong>
      <span>${esc(c.area)} · ${esc(c.hours || 'Hours not listed')}</span>
      ${c.note ? `<small>${esc(c.note)}</small>` : ''}
    </div>
    <div class="nd-distance">${icon('map-pin', 12)}<small>Nearby</small></div>
  </button>
  <button type="button" class="nd-request-btn" data-centre="${esc(c.name)}">
    ${icon('phone', 13)} Contact centre ${icon('chevron-right', 13)}
  </button>
</div>`).join('');
                        }
                        if (window.lucide) window.lucide.createIcons();

                        // Contact buttons
                        container.querySelectorAll('.nd-request-btn').forEach(btn => {
                            btn.onclick = () => window.App.UI.toast(`${btn.dataset.centre} accepts blood donation enquiries.`, 'info');
                        });
                    } catch {
                        scroll.innerHTML = `<div class="nd-empty-state"><div class="nd-empty-symbol">${icon('triangle-alert', 22)}</div><h3>Unavailable</h3><p>Donation support is unavailable right now.</p></div>`;
                        if (window.lucide) window.lucide.createIcons();
                    }
                };
            }

            // Organ form
            const organForm = container.querySelector('#nd-organ-form');
            if (organForm) {
                organForm.onsubmit = async e => {
                    e.preventDefault();
                    const name = container.querySelector('#nd-organ-name').value.trim();
                    const city = container.querySelector('#nd-organ-city').value.trim();
                    const preference = container.querySelector('#nd-organ-pref').value;
                    const consent = container.querySelector('#nd-organ-consent').checked;
                    const msg = container.querySelector('#nd-organ-message');

                    if (!name || !city || !consent) {
                        msg.textContent = 'Add your name, location, and confirm the demo notice.';
                        msg.className = 'nd-organ-message error';
                        return;
                    }
                    const result = await window.App.DB.submitDonationInterest({ type: 'organ', name, city, preference });
                    if (!result.success) {
                        msg.textContent = result.error || 'We could not save the demo interest.';
                        msg.className = 'nd-organ-message error';
                        return;
                    }
                    msg.textContent = 'Demo interest saved. A future care team flow can connect you with official guidance.';
                    msg.className = 'nd-organ-message success';
                    window.App.UI.toast('Donation interest saved for this demo.', 'success');
                };
            }

            // Mobile view toggle
            const mobileToggle = container.querySelector('#nd-mobile-view-toggle');
            const shell = container.querySelector('#nd-finder-shell');
            if (mobileToggle) {
                mobileToggle.onclick = () => shell.classList.toggle('nd-show-map');
            }
        }
    };
})();

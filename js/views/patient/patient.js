(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
    
    const distanceKm = (a, b) => {
        const radians = Math.PI / 180;
        const dLat = (b.lat - a.lat) * radians;
        const dLng = (b.lng - a.lng) * radians;
        const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
    };

    const mapStyle = {
        version: 8,
        sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '&copy; OpenStreetMap contributors' } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    };

    window.App.Views.Patient = function (isEmbedded = false) {
        const { state, setStep, updatePatientData, recordPatientVisit, setView, persistDraft, getCareTeam, getAppointmentSlots, setAuthTarget } = window.App.Store;
        const { step, patientData } = state;
        const container = document.createElement('div');
        container.className = isEmbedded ? 'patient-application-shell embedded-application-shell' : 'flow-shell patient-application-shell';
        let map;
        let markerNodes = [];
        let saveStatusTimer;
        const steps = ['Profile', 'Find care', 'Visit details', 'Confirmed'];

        container.innerHTML = isEmbedded
            ? `<section class="flow-card section-application compact-flow-card" data-section="patient-application">${step === 4 ? confirmation() : activeFlow()}</section>`
            : `${topbar()}<section class="flow-card section-application compact-flow-card" data-section="patient-application">${step === 4 ? confirmation() : activeFlow()}</section>${window.App.UI.footer()}`;

        const backBtn = container.querySelector('#btn-back-home');
        if (backBtn) backBtn.onclick = event => { event.preventDefault(); if (step === 1 || step === 4) setView('landing'); else setStep(step - 1); };
        const demoBtn = container.querySelector('#patient-demo');
        if (demoBtn) demoBtn.onclick = loadPatientDemo;

        if (step === 4) { bindConfirmation(); return container; }

        const target = container.querySelector('#step-content');
        if (step === 1) renderProfile(target);
        if (step === 2) renderLocation(target);
        if (step === 3) renderDetails(target);

        window.App.UI.bindTopbarControls(container);
        if (state.isLogged) {
            window.App.UI.syncMobileBottomNav('patient', '/dashboard/patient/apply/1');
        } else {
            document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove());
        }
        if (window.lucide) window.lucide.createIcons();
        return container;


        function demoLabel() {
            if (step === 1) return 'Fill profile demo';
            if (step === 2) return 'Fill care demo';
            if (step === 3) return patientData.symptoms ? 'Demo visit filled' : 'Fill visit demo';
            return 'Demo complete';
        }

        function topbar() {
            return `
                <div class="flow-topbar patient-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient portal</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(true)}
                        <button id="patient-demo-topbar" class="btn-secondary btn-icon btn-compact" type="button" ${step === 4 || (step === 3 && patientData.symptoms) ? 'disabled' : ''}>
                            ${icon('sparkles', 15)} <span>${demoLabel()}</span>
                        </button>
                        <button id="btn-back-home" class="back-link" type="button">
                            ${icon('arrow-left', 15)} <span>${step === 1 || step === 4 ? 'Back to home' : 'Back'}</span>
                        </button>
                    </div>
                </div>
            `;
        }

        function activeFlow() {
            const title = step === 1 ? 'Tell us a little about you' : step === 2 ? 'Choose your care centre' : 'Visit details & clinician';
            const description = step === 1 ? 'Quick essentials so the medical team is prepared.' : step === 2 ? 'Locate nearby hospitals and clinics.' : 'Select clinician, preferred slot, and consultation reason.';
            return `
                <div class="flow-header compact-flow-header">
                    <div class="flow-header-content">
                        <div class="flow-header-eyebrow">
                            <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Care reservation</span>
                            <span class="step-pill">Step ${step} of 4</span>
                        </div>
                        <h1>${title}</h1>
                        <p>${description}</p>
                    </div>
                    <div class="flow-header-actions">
                        <span id="draft-status" class="draft-note" role="status" aria-live="polite">Draft saved</span>
                        <button id="patient-demo" class="btn-secondary btn-icon btn-compact demo-trigger-btn" type="button" ${step === 4 || (step === 3 && patientData.symptoms) ? 'disabled' : ''}>
                            ${icon('sparkles', 14)} <span>${demoLabel()}</span>
                        </button>
                    </div>
                </div>
                ${stepper()}
                <div id="step-content"></div>
            `;
        }

        function markDraftSaved() {
            const status = container.querySelector('#draft-status');
            if (!status) return;
            status.textContent = 'Saving...';
            window.clearTimeout(saveStatusTimer);
            saveStatusTimer = window.setTimeout(() => { status.textContent = 'Saved just now'; }, 300);
        }

        function stepper() {
            return `
                <div class="stepper stepper-compact" aria-label="Application progress">
                    ${steps.map((label, index) => `
                        <div class="step-item ${step === index + 1 ? 'active' : ''} ${step > index + 1 ? 'done' : ''}" ${step === index + 1 ? 'aria-current="step"' : ''}>
                            <span class="step-number">${step > index + 1 ? icon('check', 13) : index + 1}</span>
                            <span class="step-label">${label}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderProfile(target) {
            target.innerHTML = `
                <form id="patient-profile-step" class="profile-step-form" novalidate>
                    <div class="form-grid profile-grid">
                        <div class="field">
                            <label for="patient-name">Full name <span>*</span></label>
                            <input id="patient-name" autocomplete="name" minlength="2" maxlength="80" value="${esc(patientData.name)}" placeholder="e.g. Asha Rao" required>
                        </div>
                        <div class="field">
                            <label for="patient-age">Age <span>*</span></label>
                            <input id="patient-age" type="number" min="1" max="120" step="1" inputmode="numeric" value="${esc(patientData.age)}" placeholder="e.g. 32" required>
                        </div>
                        <fieldset class="field full">
                            <legend>Preferred care type <span>*</span></legend>
                            <div class="choice-grid compact-choice-grid">
                                ${[['General consultation', 'stethoscope'], ['Women\'s health', 'heart'], ['Child care', 'baby']].map(([label, iconName], index) => `
                                    <div class="choice">
                                        <input id="pref-${index}" type="radio" name="pref" value="${label}" ${patientData.doctorPref === label ? 'checked' : ''} ${index === 0 ? 'required' : ''}>
                                        <label for="pref-${index}">
                                            <span class="choice-icon">${icon(iconName, 16)}</span>
                                            <span class="choice-label-text">${label}</span>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                            <span class="hint">Select care category. You can modify this at the care centre.</span>
                        </fieldset>
                    </div>
                    <div class="flow-actions compact-flow-actions">
                        <span class="status-note">Required fields marked with *</span>
                        <button id="profile-next" class="btn-primary btn-icon" type="submit">Continue to centre search ${icon('arrow-right', 16)}</button>
                    </div>
                </form>
            `;
            const form = target.querySelector('#patient-profile-step');
            const nameInput = target.querySelector('#patient-name');
            const ageInput = target.querySelector('#patient-age');
            const preferenceInputs = [...target.querySelectorAll('input[name="pref"]')];
            const clearError = () => target.querySelector('.inline-error')?.remove();
            nameInput.oninput = event => { clearError(); updatePatientData('name', event.target.value); markDraftSaved(); };
            ageInput.oninput = event => { clearError(); updatePatientData('age', event.target.value); markDraftSaved(); };
            preferenceInputs.forEach(input => input.onchange = event => { clearError(); updatePatientData('doctorPref', event.target.value); markDraftSaved(); });
            form.onsubmit = event => {
                event.preventDefault();
                const name = nameInput.value.trim();
                const age = Number(ageInput.value);
                const preference = preferenceInputs.find(input => input.checked)?.value || '';
                if (!name || name.length < 2) {
                    nameInput.focus();
                    return showInlineError(target, 'Enter your full name using at least 2 characters.');
                }
                if (!ageInput.value || !Number.isInteger(age) || age < 1 || age > 120) {
                    ageInput.focus();
                    return showInlineError(target, 'Enter a whole-number age between 1 and 120.');
                }
                if (!preference) {
                    preferenceInputs[0]?.focus();
                    return showInlineError(target, 'Choose a preferred care type before continuing.');
                }
                updatePatientData('name', name);
                updatePatientData('age', String(age));
                updatePatientData('doctorPref', preference);
                setStep(2);
            };
        }

        function renderLocation(target) {
            target.innerHTML = `
                <div class="step-location-shell">
                    <div class="location-search-header">
                        <form id="location-search-form" class="location-unified-bar">
                            <span class="search-bar-icon">${icon('search', 16)}</span>
                            <label class="sr-only" for="location-query">City, neighbourhood, or PIN code</label>
                            <input id="location-query" type="search" autocomplete="postal-code" maxlength="80" placeholder="Search city, area, or PIN code...">
                            <button class="btn-secondary btn-icon btn-compact" type="submit">${icon('search', 14)} <span>Search</span></button>
                            <button id="use-location" class="btn-primary btn-icon btn-compact" type="button" title="Detect device location">
                                ${icon('locate-fixed', 15)} <span>Auto-detect GPS</span>
                            </button>
                        </form>
                        <div class="map-toolbar compact-map-toolbar">
                            <div class="map-toolbar-info">
                                <span id="map-status" class="status-note" role="status" aria-live="polite">Choose auto-detect or search an area.</span>
                                <span id="map-accuracy" class="map-accuracy"></span>
                            </div>
                            <div class="map-toolbar-actions">
                                <button id="map-recenter" class="text-link text-link-dark btn-icon" type="button">${icon('crosshair', 14)} Recenter</button>
                                <div class="map-view-toggle" role="group" aria-label="Map view">
                                    <button id="show-map" class="active" type="button">${icon('map', 13)} Map</button>
                                    <button id="show-list" type="button">${icon('list', 13)} List</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="map-layout section-map compact-map-layout" data-section="care-map">
                        <div class="map-panel">
                            <div class="map-wrap compact-map-wrap">
                                <div id="hospital-map" aria-label="Map of nearby care centres"></div>
                                <div class="map-overlay">${icon('map-pin', 13)} Care map</div>
                            </div>
                        </div>
                        <aside class="hospital-results">
                            <div class="results-heading">
                                <div>
                                    <h2>Nearby care centres</h2>
                                    <p id="results-summary" aria-live="polite">Use your location or search to view nearby centres.</p>
                                </div>
                                <label class="filter-control" for="care-filter">
                                    <span>Filter</span>
                                    <select id="care-filter">
                                        <option value="all">All care</option>
                                        <option value="hospital">Hospitals</option>
                                        <option value="clinic">Clinics</option>
                                    </select>
                                </label>
                            </div>
                            <div id="hospital-list" class="hospital-list">
                                <div class="review-card"><p class="status-note">Your results will appear after you detect or search an area.</p></div>
                            </div>
                        </aside>
                    </div>
                    <div id="selected-hospital-banner" class="selected-hospital-banner" ${patientData.hospital ? '' : 'style="display:none"'}>
                        <div class="selected-banner-copy">
                            ${icon('check-circle', 16)}
                            <span>Selected: <strong id="selected-hospital-name">${esc(patientData.hospital || '')}</strong></span>
                        </div>
                        <span class="selected-banner-hint">Ready to proceed</span>
                    </div>
                    <div class="flow-actions compact-flow-actions">
                        <button id="location-back" class="btn-secondary btn-icon" type="button">${icon('arrow-left', 16)} Back</button>
                        <button id="location-next" class="btn-primary btn-icon" ${patientData.hospital ? '' : 'disabled'}>
                            Continue with selected centre ${icon('arrow-right', 16)}
                        </button>
                    </div>
                </div>
            `;
            const status = target.querySelector('#map-status');
            target.querySelector('#care-filter').onchange = () => { if (state.userCoords) renderMap(state.userCoords.lat, state.userCoords.lng); };
            target.querySelector('#location-back').onclick = () => setStep(1);
            target.querySelector('#location-next').onclick = () => { if (patientData.hospital) setStep(3); else showInlineError(target, 'Choose a care centre before continuing.'); };
            target.querySelector('#map-recenter').onclick = () => { if (map && state.userCoords) map.easeTo({ center: [state.userCoords.lng, state.userCoords.lat], zoom: 13, duration: 500 }); };
            target.querySelector('#show-map').onclick = () => setMapMode('map');
            target.querySelector('#show-list').onclick = () => setMapMode('list');
            target.querySelector('#use-location').onclick = useDeviceLocation;
            target.querySelector('#location-search-form').onsubmit = event => {
                event.preventDefault();
                searchLocation(target.querySelector('#location-query').value.trim());
            };
            setMapMode('map');
            if (state.tempHospitals?.length && state.userCoords) {
                populateHospitals(state.userCoords.lat, state.userCoords.lng);
            } else {
                status.textContent = 'Auto-detect device GPS or search by city, neighbourhood, or PIN code.';
            }

            function setMapMode(mode) {
                const layout = target.querySelector('.map-layout');
                layout.classList.toggle('map-show-list', mode === 'list');
                layout.classList.toggle('map-show-map', mode === 'map');
                target.querySelector('#show-map').classList.toggle('active', mode === 'map');
                target.querySelector('#show-list').classList.toggle('active', mode === 'list');
                if (map) window.setTimeout(() => map.resize(), 100);
            }

            async function useDeviceLocation() {
                const button = target.querySelector('#use-location');
                button.disabled = true; status.textContent = 'Requesting device location...';
                if (!navigator.geolocation) { button.disabled = false; status.textContent = 'Location not available in this browser. Search for a city instead.'; return; }
                navigator.geolocation.getCurrentPosition(async position => {
                    const { latitude: lat, longitude: lng, accuracy } = position.coords;
                    patientData.area = 'Live location';
                    state.userCoords = { lat, lng, accuracy };
                    const place = await window.App.API.reverseGeocode(lat, lng);
                    if (place) {
                        patientData.country = place.country || 'India';
                        patientData.state = place.state || '';
                        patientData.city = place.city || '';
                    }
                    persistDraft();
                    button.disabled = false;
                    status.textContent = `Location detected${patientData.city ? ` near ${patientData.city}` : ''}. Showing nearby care centres.`;
                    await populateHospitals(lat, lng);
                }, () => {
                    button.disabled = false;
                    status.textContent = 'Location permission not granted. Search for a city instead.';
                }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
            }

            async function searchLocation(query) {
                if (!query) return showInlineError(target, 'Enter a city, neighbourhood or PIN code first.');
                status.textContent = `Finding care centres near ${query}...`;
                const coords = await window.App.API.getCoordinates(query, patientData.country || 'India');
                const resolved = coords || { lat: 17.385, lng: 78.4867 };
                patientData.area = query;
                patientData.country = coords?.country || 'India';
                patientData.state = coords?.state || '';
                patientData.city = coords?.city || query;
                state.userCoords = { lat: resolved.lat, lng: resolved.lng, accuracy: coords ? 100 : 10000 };
                persistDraft();
                await populateHospitals(resolved.lat, resolved.lng);
            }

            async function populateHospitals(lat, lng) {
                const list = target.querySelector('#hospital-list');
                const results = target.querySelector('.hospital-results');
                results?.setAttribute('aria-busy', 'true');
                target.querySelector('#results-summary').textContent = 'Loading nearby care listings...';
                list.innerHTML = Array.from({ length: 3 }, () => `<div class="hospital-result-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>`).join('');
                let mapResult = { results: [], radius: 0 };
                try { mapResult = await window.App.API.getNearbyHospitals(lat, lng); } catch {}
                const hospitals = mapResult.results || [];
                state.tempHospitals = hospitals.map(hospital => ({ ...hospital, distance: distanceKm({ lat, lng }, hospital) })).sort((a, b) => a.distance - b.distance);
                state.searchRadius = mapResult.radius || 5000;
                state.careResultsFetchedAt = new Date().toISOString();
                persistDraft();
                status.textContent = state.tempHospitals.length
                    ? `${state.tempHospitals.length} centres found within ${Math.round((state.searchRadius || 5000) / 1000)} km.`
                    : `No listings found within ${Math.round((state.searchRadius || 5000) / 1000)} km. Try another area.`;
                target.querySelector('#map-accuracy').textContent = state.userCoords?.accuracy < 10000 ? `GPS ±${Math.round(state.userCoords.accuracy)}m` : 'Search-based';
                renderMap(lat, lng);
                results?.setAttribute('aria-busy', 'false');
            }

            function renderMap(lat, lng) {
                if (map) map.remove();
                map = null;
                markerNodes = [];
                const filter = target.querySelector('#care-filter')?.value || 'all';
                const visibleHospitals = filter === 'all' ? state.tempHospitals : state.tempHospitals.filter(hospital => String(hospital.type).toLowerCase().includes(filter));
                const mapTarget = target.querySelector('#hospital-map');

                if (window.maplibregl) {
                    map = new window.maplibregl.Map({ container: 'hospital-map', style: mapStyle, center: [lng, lat], zoom: 13, attributionControl: false });
                    map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
                    map.addControl(new window.maplibregl.AttributionControl({ compact: true }), 'bottom-left');
                    map.on('error', () => { mapTarget.classList.add('map-unavailable'); status.textContent = 'Map preview unavailable. Choose a centre from list.'; });

                    const userElement = document.createElement('div');
                    userElement.className = 'smartcare-user-marker';
                    userElement.innerHTML = '<span></span>';
                    new window.maplibregl.Marker({ element: userElement }).setLngLat([lng, lat]).setPopup(new window.maplibregl.Popup().setText('Your location')).addTo(map);

                    visibleHospitals.forEach((hospital, index) => {
                        const isPublicListing = hospital.source === 'OpenStreetMap';
                        const element = document.createElement('button');
                        element.type = 'button';
                        element.className = 'smartcare-hospital-marker';
                        element.setAttribute('aria-label', `Select ${hospital.name}`);
                        element.innerHTML = `<span><b>${index + 1}</b></span>`;

                        const popupHtml = `
                            <strong>${esc(hospital.name)}</strong><br>
                            ${esc(hospital.type || 'Care centre')}<br>
                            ${hospital.distance.toFixed(1)} km straight-line<br>
                            <small>${isPublicListing ? 'OpenStreetMap listing' : 'Fictional demo centre'}</small><br>
                            ${isPublicListing ? `<a style="display:inline-block;margin-top:.45rem;font-size:.74rem;font-weight:700;color:var(--teal)" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer">Directions →</a>` : '<small>Demo centre</small>'}
                        `;

                        const marker = new window.maplibregl.Marker({ element }).setLngLat([hospital.lng, hospital.lat]).setPopup(new window.maplibregl.Popup({ offset: 20 }).setHTML(popupHtml)).addTo(map);
                        element.onclick = () => selectHospital(hospital.id);
                        markerNodes.push({ hospital, marker });
                    });

                    if (visibleHospitals.length) {
                        const bounds = new window.maplibregl.LngLatBounds([lng, lat], [lng, lat]);
                        visibleHospitals.forEach(hospital => bounds.extend([hospital.lng, hospital.lat]));
                        map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
                    }
                } else {
                    mapTarget.innerHTML = `<div class="map-fallback">${icon('map-off', 24)}<strong>Map unavailable</strong><span>Choose a centre from the list.</span></div>`;
                    status.textContent = 'Map preview unavailable. Showing nearby centres in list.';
                }

                const list = target.querySelector('#hospital-list');
                const fetchedLabel = state.careResultsFetchedAt ? new Date(state.careResultsFetchedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'just now';
                target.querySelector('#results-summary').textContent = visibleHospitals.length
                    ? `${visibleHospitals.length} centres nearby · updated ${fetchedLabel}`
                    : 'No matching listings found';

                list.innerHTML = visibleHospitals.length ? visibleHospitals.map((hospital, index) => {
                    const hours = hospital.openingHours === '24/7' ? 'Open 24/7' : (hospital.openingHours || 'Hours unlisted');
                    const isPublicListing = hospital.source === 'OpenStreetMap';
                    const isSelected = patientData.hospital === hospital.name;
                    return `
                        <article class="hospital-option ${isSelected ? 'selected' : ''}">
                            <button class="hospital-select-button" type="button" data-hospital-id="${esc(hospital.id)}" aria-pressed="${isSelected}">
                                <span class="hospital-option-header">
                                    <span>
                                        <strong><span class="hospital-badge-num">${index + 1}</span>${esc(hospital.name)}</strong>
                                        <small>${esc(hospital.type || 'Care centre')} · ${esc(hours)}</small>
                                    </span>
                                    <span class="hospital-distance">${hospital.distance.toFixed(1)} km</span>
                                </span>
                            </button>
                            <div class="hospital-card-meta">
                                <span class="hospital-tag">${icon(isPublicListing ? 'map-pin' : 'flask-conical', 11)} ${isPublicListing ? 'Public listing' : 'Demo centre'}</span>
                                ${isPublicListing ? `
                                    <a class="hospital-ext-nav" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer">
                                        ${icon('navigation', 11)} Directions
                                    </a>` : ''}
                                ${isSelected ? `<span class="badge-selected">${icon('check', 11)} Selected</span>` : ''}
                            </div>
                        </article>
                    `;
                }).join('') : `<div class="provider-empty">${icon('map-pin-off', 24)}<p>No centres found. Search a nearby city or PIN code.</p></div>`;

                list.querySelectorAll('[data-hospital-id]').forEach(button => {
                    button.onclick = () => selectHospital(button.dataset.hospitalId);
                    button.onmouseenter = () => {
                        const id = button.dataset.hospitalId;
                        const markerNode = markerNodes.find(item => String(item.hospital.id) === String(id));
                        if (markerNode && map) markerNode.marker.getElement().classList.add('active');
                    };
                    button.onmouseleave = () => {
                        const id = button.dataset.hospitalId;
                        const markerNode = markerNodes.find(item => String(item.hospital.id) === String(id));
                        if (markerNode && map) markerNode.marker.getElement().classList.remove('active');
                    };
                });

                function selectHospital(id) {
                    const hospital = state.tempHospitals.find(item => String(item.id) === String(id));
                    if (!hospital) return;
                    updatePatientData('hospital', hospital.name);
                    markDraftSaved();
                    target.querySelectorAll('[data-hospital-id]').forEach(button => {
                        const selected = button.dataset.hospitalId === String(id);
                        button.closest('.hospital-option')?.classList.toggle('selected', selected);
                        button.setAttribute('aria-pressed', selected);
                    });
                    const markerNode = markerNodes.find(item => String(item.hospital.id) === String(id));
                    if (markerNode && map) {
                        map.easeTo({ center: [hospital.lng, hospital.lat], zoom: 14, duration: 500 });
                        markerNode.marker.togglePopup();
                    }
                    const banner = target.querySelector('#selected-hospital-banner');
                    const bannerName = target.querySelector('#selected-hospital-name');
                    if (banner && bannerName) {
                        bannerName.textContent = hospital.name;
                        banner.style.display = 'flex';
                    }
                    target.querySelector('#location-next').disabled = false;
                }
            }
        }

        function renderDetails(target) {
            updatePatientData('fee', 125);
            updatePatientData('triage', 'Unassessed');
            const careTeam = getCareTeam();
            const appointmentSlots = getAppointmentSlots();
            const departments = [...new Set(careTeam.map(member => member.department))];
            const suggestions = ['Fever', 'Cold & cough', 'Stomach pain', 'Headache', 'Fatigue', 'Routine check-up'];
            const selectedSymptoms = new Set((Array.isArray(patientData.symptomSelections) ? patientData.symptomSelections : []).filter(item => suggestions.includes(item)));
            const customTags = new Set((Array.isArray(patientData.customSymptomTags) ? patientData.customSymptomTags : []).map(item => String(item).trim()).filter(Boolean));
            const initialCustomSymptoms = patientData.customSymptoms || (!selectedSymptoms.size && !customTags.size ? patientData.symptoms : '');
            const preferredDepartment = { 'Women\'s health': 'Women\'s health', 'Child care': 'Paediatrics' }[patientData.doctorPref] || 'General medicine';
            const department = departments.includes(patientData.department) ? patientData.department : preferredDepartment;
            const departmentDoctors = careTeam.filter(member => member.department === department);
            const currentDoctor = departmentDoctors.find(member => member.id === patientData.doctorId) || departmentDoctors[0];
            const currentSlot = appointmentSlots.find(item => item.date === patientData.appointmentDate && item.slot === patientData.appointmentSlot) || appointmentSlots[0];
            updatePatientData('department', department);
            updatePatientData('doctorId', currentDoctor.id);
            updatePatientData('doctorName', currentDoctor.name);
            updatePatientData('doctorPref', currentDoctor.name);
            updatePatientData('consultationType', patientData.consultationType || 'In-person consultation');
            updatePatientData('appointmentDate', currentSlot.date);
            updatePatientData('appointmentSlot', currentSlot.slot);
            const demoMirror = state.loggedEmail === 'patient@smartcare.demo';

            target.innerHTML = `
                <div class="care-safety-strip" role="note">
                    <span class="safety-icon">${icon('shield-alert', 15)}</span>
                    <span class="safety-text">Demo queue booking · For acute emergencies, call local emergency services immediately.</span>
                    ${demoMirror ? `<span class="demo-badge">${icon('presentation', 12)} Presentation mode</span>` : ''}
                </div>
                <div class="review-grid step3-review-grid">
                    <div class="step3-fields">
                        <section class="care-selection-section" aria-labelledby="care-team-title">
                            <div class="section-heading-compact">
                                <h2 id="care-team-title">Clinician &amp; appointment schedule</h2>
                            </div>
                            <div class="care-selection-grid compact-care-grid">
                                <div class="field">
                                    <label for="visit-department">Department <span>*</span></label>
                                    <select id="visit-department">${departments.map(name => `<option value="${esc(name)}" ${name === department ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>
                                </div>
                                <div class="field">
                                    <label for="visit-doctor">Clinician <span>*</span></label>
                                    <select id="visit-doctor"></select>
                                    <span id="doctor-availability" class="hint"></span>
                                </div>
                                <div class="field">
                                    <label for="consultation-type">Consultation type <span>*</span></label>
                                    <select id="consultation-type">
                                        <option ${patientData.consultationType === 'In-person consultation' ? 'selected' : ''}>In-person consultation</option>
                                        <option ${patientData.consultationType === 'Follow-up consultation' ? 'selected' : ''}>Follow-up consultation</option>
                                        <option ${patientData.consultationType === 'Join walk-in queue' ? 'selected' : ''}>Join walk-in queue</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <label for="appointment-slot">Available slot <span>*</span></label>
                                    <select id="appointment-slot">${appointmentSlots.map(item => `<option value="${esc(item.value)}" ${item.value === currentSlot.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select>
                                </div>
                            </div>
                        </section>

                        <div class="field symptom-search-field">
                            <fieldset class="symptom-picker">
                                <legend>Reason for visit / symptoms <span>*</span></legend>
                                <div class="symptom-suggestions" role="group" aria-label="Common symptoms">
                                    ${suggestions.map(label => {
                                        const isSelected = selectedSymptoms.has(label);
                                        return `<button class="symptom-suggestion${isSelected ? ' active' : ''}" type="button" data-symptom="${esc(label)}" aria-pressed="${isSelected}">${icon(isSelected ? 'check' : 'plus', 13)} <span>${esc(label)}</span></button>`;
                                    }).join('')}
                                </div>
                                <form id="symptom-add-form" class="symptom-add-form compact-symptom-form">
                                    <input id="symptom-search" type="search" maxlength="60" autocomplete="off" placeholder="Add custom symptom...">
                                    <button id="add-custom-symptom" class="btn-secondary btn-icon btn-compact" type="submit">${icon('plus', 14)} Add</button>
                                </form>
                                <div id="custom-symptom-tags" class="custom-symptom-tags" aria-live="polite"></div>
                            </fieldset>
                        </div>

                        <div class="field symptom-custom-field">
                            <label for="custom-symptoms">Additional notes <small>(optional)</small> <span id="symptom-count" class="hint symptom-count"></span></label>
                            <textarea id="custom-symptoms" rows="2" maxlength="300" placeholder="When did symptoms start or any context for the care team?">${esc(initialCustomSymptoms)}</textarea>
                        </div>
                    </div>

                    <aside class="step3-aside">
                        <section class="booking-summary-card compact-summary-card" aria-labelledby="booking-summary-title">
                            <div class="summary-card-header">
                                <h2 id="booking-summary-title">${icon('clipboard-list', 15)} Booking summary</h2>
                                <span class="step-badge-mini">Step 3 of 4</span>
                            </div>
                            <div class="summary-rows-group">
                                <div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}, ${esc(patientData.age)}</strong></div>
                                <div class="summary-row"><span>Centre</span><strong>${esc(patientData.hospital || 'Not selected')}</strong></div>
                                <div class="summary-row"><span>Department</span><strong id="summary-department"></strong></div>
                                <div class="summary-row"><span>Clinician</span><strong id="summary-doctor"></strong></div>
                                <div class="summary-row"><span>Consultation</span><strong id="summary-consultation"></strong></div>
                                <div class="summary-row"><span>Slot</span><strong id="summary-slot"></strong></div>
                            </div>
                            <div class="summary-fee-strip">
                                <div>
                                    <small>Consultation fee</small>
                                    <strong id="fee-estimate">₹125</strong>
                                </div>
                                <div style="text-align:right">
                                    <small>Queue window</small>
                                    <span class="queue-window-badge">Priority queue</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
                <div class="flow-actions compact-flow-actions">
                    <button id="details-back" class="btn-secondary btn-icon" type="button">${icon('arrow-left', 16)} Back</button>
                    <button id="details-next" class="btn-primary btn-icon" type="button">Review &amp; confirm booking ${icon('arrow-right', 16)}</button>
                </div>
            `;
            const departmentSelect = target.querySelector('#visit-department');
            const doctorSelect = target.querySelector('#visit-doctor');
            const consultationSelect = target.querySelector('#consultation-type');
            const slotSelect = target.querySelector('#appointment-slot');
            const searchInput = target.querySelector('#symptom-search');
            const addCustomButton = target.querySelector('#add-custom-symptom');
            const customSymptoms = target.querySelector('#custom-symptoms');
            const count = target.querySelector('#symptom-count');

            const refreshSummary = () => {
                const selectedSlot = appointmentSlots.find(item => item.value === slotSelect.value) || appointmentSlots[0];
                target.querySelector('#summary-department').textContent = patientData.department;
                target.querySelector('#summary-doctor').textContent = patientData.doctorName;
                target.querySelector('#summary-consultation').textContent = patientData.consultationType;
                target.querySelector('#summary-slot').textContent = selectedSlot.label;
            };

            const renderDoctorOptions = preferredDoctorId => {
                const doctors = careTeam.filter(member => member.department === departmentSelect.value);
                const selected = doctors.find(member => member.id === preferredDoctorId) || doctors[0];
                doctorSelect.innerHTML = doctors.map(member => `<option value="${esc(member.id)}" ${member.id === selected.id ? 'selected' : ''}>${esc(member.name)} - ${esc(member.specialty)}</option>`).join('');
                updatePatientData('department', departmentSelect.value);
                updatePatientData('doctorId', selected.id);
                updatePatientData('doctorName', selected.name);
                updatePatientData('doctorPref', selected.name);
                target.querySelector('#doctor-availability').textContent = `${selected.room}. ${selected.availability}.`;
                refreshSummary();
            };

            const syncSymptoms = () => {
                const customValue = customSymptoms.value.trim();
                updatePatientData('symptomSelections', [...selectedSymptoms]);
                updatePatientData('customSymptomTags', [...customTags]);
                updatePatientData('customSymptoms', customSymptoms.value);
                updatePatientData('symptoms', [...selectedSymptoms, ...customTags, customValue].filter(Boolean).join('; '));
                count.textContent = `${customSymptoms.value.length}/300`;
                target.querySelector('.inline-error')?.remove();
                markDraftSaved();
            };

            const renderCustomTags = () => {
                const tagRegion = target.querySelector('#custom-symptom-tags');
                tagRegion.innerHTML = [...customTags].map(tag => `<button class="custom-symptom-tag" type="button" data-custom-symptom="${esc(tag)}" aria-label="Remove custom symptom ${esc(tag)}"><span>${esc(tag)}</span>${icon('x', 13)}</button>`).join('');
                tagRegion.querySelectorAll('[data-custom-symptom]').forEach(button => button.onclick = () => {
                    customTags.delete(button.dataset.customSymptom);
                    renderCustomTags();
                    syncSymptoms();
                });
                if (window.lucide) window.lucide.createIcons();
            };

            const filterSuggestions = () => {
                const query = searchInput.value.trim().toLowerCase();
                let visible = 0;
                target.querySelectorAll('.symptom-suggestion').forEach(button => {
                    const matches = !query || button.dataset.symptom.toLowerCase().includes(query);
                    button.hidden = !matches;
                    if (matches) visible += 1;
                });
                addCustomButton.disabled = !query;
            };

            const toggleSuggestion = button => {
                const symptom = button.dataset.symptom;
                if (selectedSymptoms.has(symptom)) selectedSymptoms.delete(symptom);
                else selectedSymptoms.add(symptom);
                const isSelected = selectedSymptoms.has(symptom);
                button.classList.toggle('active', isSelected);
                button.setAttribute('aria-pressed', String(isSelected));
                button.innerHTML = `${icon(isSelected ? 'check' : 'plus', 13)} <span>${esc(symptom)}</span>`;
                syncSymptoms();
                if (window.lucide) window.lucide.createIcons();
            };

            const addCustomSymptom = () => {
                const value = searchInput.value.trim();
                if (!value) return;
                const matchingSuggestion = [...target.querySelectorAll('.symptom-suggestion')].find(button => button.dataset.symptom.toLowerCase() === value.toLowerCase());
                if (matchingSuggestion) toggleSuggestion(matchingSuggestion);
                else if ([...customTags].some(tag => tag.toLowerCase() === value.toLowerCase())) showInlineError(target, 'Custom symptom already added.');
                else if (customTags.size >= 8) showInlineError(target, 'Maximum 8 custom symptom tags allowed.');
                else {
                    customTags.add(value);
                    renderCustomTags();
                    syncSymptoms();
                }
                searchInput.value = '';
                filterSuggestions();
                searchInput.focus();
            };

            renderDoctorOptions(currentDoctor.id);
            consultationSelect.onchange = () => { updatePatientData('consultationType', consultationSelect.value); refreshSummary(); markDraftSaved(); };
            slotSelect.onchange = () => {
                const selectedSlot = appointmentSlots.find(item => item.value === slotSelect.value) || appointmentSlots[0];
                updatePatientData('appointmentDate', selectedSlot.date);
                updatePatientData('appointmentSlot', selectedSlot.slot);
                refreshSummary();
                markDraftSaved();
            };
            departmentSelect.onchange = () => { renderDoctorOptions(); markDraftSaved(); };
            doctorSelect.onchange = () => {
                const member = careTeam.find(item => item.id === doctorSelect.value);
                if (!member) return;
                updatePatientData('doctorId', member.id);
                updatePatientData('doctorName', member.name);
                updatePatientData('doctorPref', member.name);
                target.querySelector('#doctor-availability').textContent = `${member.room}. ${member.availability}.`;
                refreshSummary();
                markDraftSaved();
            };
            target.querySelector('#symptom-add-form').onsubmit = event => { event.preventDefault(); addCustomSymptom(); };
            searchInput.oninput = filterSuggestions;
            addCustomButton.disabled = true;
            renderCustomTags();
            count.textContent = `${customSymptoms.value.length}/300`;
            customSymptoms.oninput = syncSymptoms;
            target.querySelectorAll('.symptom-suggestion').forEach(button => button.onclick = () => toggleSuggestion(button));
            target.querySelector('#details-back').onclick = () => setStep(2);
            target.querySelector('#details-next').onclick = () => {
                if (!patientData.department || !patientData.doctorId || !patientData.consultationType || !patientData.appointmentDate || !patientData.appointmentSlot) {
                    showInlineError(target, 'Choose department, clinician, consultation type, and slot.');
                    departmentSelect.focus();
                    return;
                }
                if (!patientData.symptoms.trim()) {
                    showInlineError(target, 'Select at least one symptom or describe your reason for visit.');
                    searchInput.focus();
                    return;
                }
                showBookingReview();
            };

            function showBookingReview() {
                const selectedSlot = appointmentSlots.find(item => item.date === patientData.appointmentDate && item.slot === patientData.appointmentSlot) || appointmentSlots[0];
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `<section class="modal-card booking-review-modal" role="dialog" aria-modal="true" aria-labelledby="booking-review-title"><div class="modal-heading"><div><h2 id="booking-review-title">Confirm booking details</h2><p>Review information before adding this visit to queue.</p></div><button class="btn-ghost modal-close-button" type="button" data-close-review aria-label="Close booking review">${icon('x', 18)}</button></div><div class="booking-review-list"><div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}, ${esc(patientData.age)}</strong></div><div class="summary-row"><span>Care centre</span><strong>${esc(patientData.hospital)}</strong></div><div class="summary-row"><span>Department</span><strong>${esc(patientData.department)}</strong></div><div class="summary-row"><span>Clinician</span><strong>${esc(patientData.doctorName)}</strong></div><div class="summary-row"><span>Consultation</span><strong>${esc(patientData.consultationType)}</strong></div><div class="summary-row"><span>Time</span><strong>${esc(selectedSlot.label)}</strong></div><div class="summary-row summary-row-stacked"><span>Reason for visit</span><strong>${esc(patientData.symptoms)}</strong></div>${demoMirror ? `<div class="demo-routing-note compact">${icon('presentation', 16)}<span>Mirrored in SmartCare Community Hospital workspace.</span></div>` : ''}</div><div class="modal-actions"><button class="btn-secondary" type="button" data-close-review>Edit details</button><button class="btn-primary btn-icon" id="confirm-reservation" type="button">Confirm reservation ${icon('check', 16)}</button></div></section>`;
                document.body.appendChild(backdrop);
                const closeReview = () => { backdrop.remove(); target.querySelector('#details-next')?.focus(); };
                backdrop.querySelectorAll('[data-close-review]').forEach(button => button.onclick = closeReview);
                backdrop.onclick = event => { if (event.target === backdrop) closeReview(); };
                backdrop.onkeydown = event => { if (event.key === 'Escape') closeReview(); };
                backdrop.querySelector('#confirm-reservation').onclick = () => { backdrop.remove(); reserveVisit(); };
                if (window.lucide) window.lucide.createIcons();
                backdrop.querySelector('[data-close-review]')?.focus();
            }
        }

        function confirmation() {
            const confirmedVisit = state.patientVisits.find(visit => String(visit.id) === String(state.lastBookingId))
                || state.patientVisits.find(visit => ['booked', 'waiting', 'called', 'in_progress'].includes(String(visit.status || '').toLowerCase()));
            const booking = state.lastBookingId || confirmedVisit?.reference || confirmedVisit?.id;
            if (!booking) {
                return `
                    <div class="success-state compact-success-state">
                        <div class="success-icon">${icon('calendar-x', 30)}</div>
                        <div class="eyebrow eyebrow-dark success-eyebrow"><span class="eyebrow-dot"></span> No reservation found</div>
                        <h1>Start a new booking</h1>
                        <p>No active reservation found for the signed-in patient.</p>
                        <div class="confirmation-actions">
                            <button id="btn-book-another" class="btn-primary">${icon('calendar-plus', 16)} Start booking</button>
                            <button id="btn-view-dashboard" class="btn-secondary">${icon('layout-dashboard', 16)} View dashboard</button>
                        </div>
                    </div>
                `;
            }
            const confirmedHospital = confirmedVisit?.hospital || patientData.hospital || 'SmartCare Community Hospital';
            const confirmedPatient = patientData.name || 'Patient';
            const appointmentSlots = getAppointmentSlots();
            const confirmedSlot = appointmentSlots.find(item => item.date === (confirmedVisit?.appointmentDate || patientData.appointmentDate) && item.slot === (confirmedVisit?.appointmentSlot || patientData.appointmentSlot));
            const qrUrl = window.App.UI.generateQRCodeDataUrl(booking);
            const isPaid = window.localStorage.getItem(`smartcare.payment.${booking}`) === 'paid';
            const paymentTxn = window.localStorage.getItem(`smartcare.payment_txn.${booking}`) || 'TXN-SC-748921';

            return `
                <div class="confirmation-container">
                    <div class="confirmation-hero-bar">
                        <div class="conf-hero-icon">${icon('check-check', 24)}</div>
                        <div class="conf-hero-text">
                            <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Reservation confirmed</span>
                            <h1>You're on the care list</h1>
                            <p>Digital appointment ticket generated. Keep this reference for check-in.</p>
                        </div>
                    </div>

                    <div class="confirmation-layout-grid">
                        <!-- Digital Appointment Boarding Pass -->
                        <section class="appointment-pass-card" aria-label="Appointment boarding pass">
                            <div class="pass-header">
                                <div>
                                    <span class="pass-tag">${icon('hospital', 13)} Care centre</span>
                                    <h2 class="pass-hospital">${esc(confirmedHospital)}</h2>
                                    <small class="pass-dept">${esc(confirmedVisit?.department || patientData.department || 'General medicine')}</small>
                                </div>
                                <div id="pass-payment-badge-mount">
                                    <span class="payment-status-badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}">
                                        ${icon(isPaid ? 'badge-check' : 'clock', 12)}
                                        <span>${isPaid ? 'Fee Paid (₹125)' : 'Payment pending (₹125)'}</span>
                                    </span>
                                </div>
                            </div>

                            <div class="pass-body">
                                <div class="pass-field">
                                    <small>Patient name</small>
                                    <strong>${esc(confirmedPatient)}</strong>
                                </div>
                                <div class="pass-field">
                                    <small>Consulting clinician</small>
                                    <strong>${esc(confirmedVisit?.doctorName || patientData.doctorName || 'Assigned clinician')}</strong>
                                </div>
                                <div class="pass-field">
                                    <small>Consultation type</small>
                                    <strong>${esc(confirmedVisit?.consultationType || patientData.consultationType || 'In-person')}</strong>
                                </div>
                                <div class="pass-field">
                                    <small>Scheduled slot</small>
                                    <strong>${esc(confirmedSlot?.label || `${confirmedVisit?.appointmentDate || patientData.appointmentDate || 'Today'} · Slot pending`)}</strong>
                                </div>
                            </div>

                            <div class="pass-tear-line">
                                <span class="notch notch-left"></span>
                                <span class="dashed-line"></span>
                                <span class="notch notch-right"></span>
                            </div>

                            <div class="pass-qr-strip">
                                <img src="${qrUrl}" alt="Check-in QR Code" class="pass-qr-img">
                                <div class="pass-qr-details">
                                    <span class="pass-qr-label">${icon('qr-code', 13)} Scan at hospital counter</span>
                                    <div class="token-card compact-token-card" data-reference="${esc(booking)}" role="button" tabindex="0" title="Click to copy reference">
                                        <div>
                                            <small>Token Reference String</small>
                                            <strong>${esc(booking)}</strong>
                                        </div>
                                        ${icon('copy', 16)}
                                    </div>
                                    <small class="copy-hint-text">Click token to copy</small>
                                </div>
                            </div>
                        </section>

                        <!-- Next Steps & Actions -->
                        <section class="confirmation-next-section">
                            <div class="next-steps-card compact-steps-card">
                                <h3>${icon('info', 16)} Next steps</h3>
                                <ul class="next-steps-list">
                                    <li>
                                        <strong>Check live queue:</strong>
                                        <span>View live waiting room numbers on your patient dashboard.</span>
                                    </li>
                                    <li>
                                        <strong>Hospital scan demo:</strong>
                                        <span>Open the Hospital Portal and scan reference <code>${esc(booking)}</code> to simulate check-in.</span>
                                    </li>
                                    <li>
                                        <strong>Consultation fee:</strong>
                                        <span>Simulate online payment or settle at the hospital desk.</span>
                                    </li>
                                </ul>
                            </div>

                            <div class="confirmation-action-buttons">
                                <button id="btn-simulate-payment" class="btn-primary btn-payment-action ${isPaid ? 'btn-paid-state' : ''}" type="button">
                                    ${icon(isPaid ? 'badge-check' : 'credit-card', 16)}
                                    <span>${isPaid ? `Payment done ✓ (Ref: ${esc(paymentTxn)})` : 'Simulate "Payment Done" portal (₹125)'}</span>
                                </button>
                                <button id="btn-book-another" class="btn-secondary btn-icon" type="button">
                                    ${icon('calendar-plus', 16)} <span>Book another appointment</span>
                                </button>
                                <button id="btn-view-dashboard" class="btn-secondary btn-icon" type="button">
                                    ${icon('layout-dashboard', 16)} <span>View my patient dashboard</span>
                                </button>
                                <button id="btn-test-doctor" class="btn-secondary btn-icon" type="button">
                                    ${icon('stethoscope', 16)} <span>Test scanning as hospital</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            `;
        }

        function bindConfirmation() {
            const confirmedVisit = state.patientVisits.find(visit => String(visit.id) === String(state.lastBookingId))
                || state.patientVisits.find(visit => ['booked', 'waiting', 'called', 'in_progress'].includes(String(visit.status || '').toLowerCase()));
            const booking = state.lastBookingId || confirmedVisit?.reference || confirmedVisit?.id || 'SC-DEMO';
            const confirmedHospital = confirmedVisit?.hospital || patientData.hospital || 'SmartCare Community Hospital';
            const confirmedPatient = patientData.name || 'Patient';
            const confirmedDoctor = confirmedVisit?.doctorName || patientData.doctorName || 'Assigned Clinician';

            const token = container.querySelector('.token-card');
            if (token) {
                const copyReference = async () => {
                    try {
                        await navigator.clipboard.writeText(token.dataset.reference || '');
                        token.classList.add('copied');
                        token.setAttribute('aria-label', 'Reservation reference copied');
                        const hint = container.querySelector('.copy-hint-text');
                        if (hint) hint.textContent = 'Copied to clipboard!';
                        setTimeout(() => {
                            token.classList.remove('copied');
                            if (hint) hint.textContent = 'Click token to copy';
                        }, 2000);
                    } catch {
                        token.setAttribute('aria-label', 'Reservation reference');
                    }
                };
                token.onclick = copyReference;
                token.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        copyReference();
                    }
                };
            }

            // Payment simulation modal trigger
            const paymentBtn = container.querySelector('#btn-simulate-payment');
            if (paymentBtn) {
                paymentBtn.onclick = () => showPaymentModal(booking, confirmedHospital, confirmedPatient, confirmedDoctor);
            }

            const bookAnother = container.querySelector('#btn-book-another');
            if (bookAnother) {
                bookAnother.onclick = () => {
                    patientData.symptoms = '';
                    patientData.symptomSelections = [];
                    patientData.customSymptomTags = [];
                    patientData.customSymptoms = '';
                    patientData.hospital = '';
                    patientData.department = '';
                    patientData.doctorId = '';
                    patientData.doctorName = '';
                    patientData.consultationType = '';
                    patientData.appointmentDate = '';
                    patientData.appointmentSlot = '';
                    patientData.fee = 0;
                    persistDraft();
                    setStep(1);
                };
            }
            const viewDash = container.querySelector('#btn-view-dashboard');
            if (viewDash) viewDash.onclick = () => setView('patientDashboard');
            const testDoc = container.querySelector('#btn-test-doctor');
            if (testDoc) testDoc.onclick = () => { setAuthTarget('doctor'); setView('doctor'); };
            if (window.lucide) window.lucide.createIcons();
        }

        function showPaymentModal(booking, hospital, patient, doctor) {
            const isAlreadyPaid = window.localStorage.getItem(`smartcare.payment.${booking}`) === 'paid';
            let existingTxn = window.localStorage.getItem(`smartcare.payment_txn.${booking}`) || 'TXN-SC-748921';

            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop payment-modal-backdrop';
            backdrop.innerHTML = `
                <div class="modal-card payment-gateway-modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
                    <div class="payment-modal-header">
                        <div class="gateway-brand">
                            <span class="gateway-logo">${icon('shield-check', 20)}</span>
                            <div>
                                <h3 id="payment-modal-title">SmartCare Pay</h3>
                                <small>Simulated Secure Healthcare Gateway</small>
                            </div>
                        </div>
                        <button class="btn-ghost modal-close-button" type="button" data-close-payment aria-label="Close payment modal">${icon('x', 18)}</button>
                    </div>

                    <div id="payment-modal-body" class="payment-modal-body">
                        ${isAlreadyPaid ? renderPaidReceipt(existingTxn) : renderPaymentCheckout()}
                    </div>
                </div>
            `;

            document.body.appendChild(backdrop);
            if (window.lucide) window.lucide.createIcons();

            const closeBtn = backdrop.querySelector('[data-close-payment]');
            const closeModal = () => backdrop.remove();
            if (closeBtn) closeBtn.onclick = closeModal;
            backdrop.onclick = e => { if (e.target === backdrop) closeModal(); };
            backdrop.onkeydown = e => { if (e.key === 'Escape') closeModal(); };

            bindPaymentActions();

            function renderPaymentCheckout() {
                return `
                    <div class="checkout-summary-box">
                        <div class="checkout-row">
                            <span>Service</span>
                            <strong>Doctor Consultation (${esc(doctor)})</strong>
                        </div>
                        <div class="checkout-row">
                            <span>Centre</span>
                            <strong>${esc(hospital)}</strong>
                        </div>
                        <div class="checkout-row">
                            <span>Patient</span>
                            <strong>${esc(patient)} (Ref: ${esc(booking)})</strong>
                        </div>
                        <div class="checkout-total-row">
                            <span>Total Consultation Fee</span>
                            <strong class="checkout-amount">₹125.00</strong>
                        </div>
                    </div>

                    <div class="payment-methods-tabs" role="tablist">
                        <button class="pm-tab active" data-tab="upi" type="button">${icon('smartphone', 14)} UPI / QR</button>
                        <button class="pm-tab" data-tab="card" type="button">${icon('credit-card', 14)} Card</button>
                        <button class="pm-tab" data-tab="netbanking" type="button">${icon('building', 14)} NetBanking</button>
                        <button class="pm-tab" data-tab="counter" type="button">${icon('wallet', 14)} At Counter</button>
                    </div>

                    <div id="pm-tab-content" class="pm-tab-content">
                        <!-- UPI tab (default) -->
                        <div class="pm-pane" id="pane-upi">
                            <div class="upi-mock-box">
                                <div class="mock-qr-wrap">
                                    <div class="mock-qr-code">${icon('qr-code', 56)}</div>
                                    <small>Scan with any UPI app</small>
                                </div>
                                <div class="upi-apps-row">
                                    <span class="upi-chip">GPay</span>
                                    <span class="upi-chip">PhonePe</span>
                                    <span class="upi-chip">Paytm</span>
                                    <span class="upi-chip">BHIM</span>
                                </div>
                                <div class="field" style="margin-top:.75rem">
                                    <label for="mock-upi-id">Or enter simulated UPI ID</label>
                                    <input id="mock-upi-id" value="${esc(patient.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'patient'}@okhdfcbank" readonly>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-modal-footer">
                        <div class="security-badge">
                            ${icon('lock', 12)}
                            <span>256-bit Simulated Sandbox Protection</span>
                        </div>
                        <button id="btn-process-payment" class="btn-primary btn-process-payment" type="button">
                            ${icon('check', 16)} Complete Simulated Payment (₹125)
                        </button>
                    </div>
                `;
            }

            function renderPaidReceipt(txnId) {
                const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="receipt-success-view">
                        <div class="receipt-success-icon">${icon('check-circle-2', 48)}</div>
                        <h2>Payment Done Successfully</h2>
                        <p class="receipt-subtitle">Consultation fee has been verified and settled.</p>

                        <div class="receipt-card">
                            <div class="receipt-row">
                                <span>Status</span>
                                <strong class="badge-success-inline">${icon('check', 12)} Paid / Settled</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Transaction ID</span>
                                <strong><code>${esc(txnId)}</code></strong>
                            </div>
                            <div class="receipt-row">
                                <span>Amount Paid</span>
                                <strong>₹125.00</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Patient</span>
                                <strong>${esc(patient)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Clinician</span>
                                <strong>${esc(doctor)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Hospital</span>
                                <strong>${esc(hospital)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Booking Reference</span>
                                <strong>${esc(booking)}</strong>
                            </div>
                            <div class="receipt-row">
                                <span>Date &amp; Time</span>
                                <strong>${now}</strong>
                            </div>
                        </div>

                        <div class="receipt-actions">
                            <button id="btn-receipt-done" class="btn-primary" type="button">
                                ${icon('check', 16)} Return to Booking
                            </button>
                        </div>
                    </div>
                `;
            }

            function bindPaymentActions() {
                const processBtn = backdrop.querySelector('#btn-process-payment');
                if (processBtn) {
                    processBtn.onclick = () => {
                        processBtn.disabled = true;
                        processBtn.innerHTML = `${icon('loader-circle', 16)} Authorizing transaction...`;
                        if (window.lucide) window.lucide.createIcons();

                        setTimeout(() => {
                            const newTxn = `TXN-SC-${Math.floor(100000 + Math.random() * 900000)}`;
                            window.localStorage.setItem(`smartcare.payment.${booking}`, 'paid');
                            window.localStorage.setItem(`smartcare.payment_txn.${booking}`, newTxn);

                            // Update the booking screen badge and button immediately
                            const badgeMount = container.querySelector('#pass-payment-badge-mount');
                            if (badgeMount) {
                                badgeMount.innerHTML = `
                                    <span class="payment-status-badge badge-paid">
                                        ${icon('badge-check', 12)}
                                        <span>Fee Paid (₹125)</span>
                                    </span>
                                `;
                            }
                            const payActionBtn = container.querySelector('#btn-simulate-payment');
                            if (payActionBtn) {
                                payActionBtn.classList.add('btn-paid-state');
                                payActionBtn.innerHTML = `
                                    ${icon('badge-check', 16)}
                                    <span>Payment done ✓ (Ref: ${newTxn})</span>
                                `;
                            }

                            // Show receipt in modal
                            const body = backdrop.querySelector('#payment-modal-body');
                            if (body) {
                                body.innerHTML = renderPaidReceipt(newTxn);
                                const doneBtn = body.querySelector('#btn-receipt-done');
                                if (doneBtn) doneBtn.onclick = closeModal;
                            }
                            if (window.lucide) window.lucide.createIcons();
                        }, 750);
                    };
                }

                const receiptDone = backdrop.querySelector('#btn-receipt-done');
                if (receiptDone) receiptDone.onclick = closeModal;

                // Tab switching inside payment checkout
                backdrop.querySelectorAll('.pm-tab').forEach(tab => {
                    tab.onclick = () => {
                        backdrop.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const pane = backdrop.querySelector('#pm-tab-content');
                        if (!pane) return;
                        const tabType = tab.dataset.tab;
                        if (tabType === 'upi') {
                            pane.innerHTML = `
                                <div class="upi-mock-box">
                                    <div class="mock-qr-wrap">
                                        <div class="mock-qr-code">${icon('qr-code', 56)}</div>
                                        <small>Scan with any UPI app</small>
                                    </div>
                                    <div class="upi-apps-row">
                                        <span class="upi-chip">GPay</span>
                                        <span class="upi-chip">PhonePe</span>
                                        <span class="upi-chip">Paytm</span>
                                        <span class="upi-chip">BHIM</span>
                                    </div>
                                    <div class="field" style="margin-top:.75rem">
                                        <label for="mock-upi-id">Or enter simulated UPI ID</label>
                                        <input id="mock-upi-id" value="${esc(patient.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'patient'}@okhdfcbank" readonly>
                                    </div>
                                </div>
                            `;
                        } else if (tabType === 'card') {
                            pane.innerHTML = `
                                <div class="card-mock-form">
                                    <div class="field">
                                        <label>Card Number</label>
                                        <input value="•••• •••• •••• 4242 (Demo Visa)" readonly>
                                    </div>
                                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
                                        <div class="field"><label>Expiry</label><input value="08/28" readonly></div>
                                        <div class="field"><label>CVV</label><input value="•••" readonly></div>
                                    </div>
                                </div>
                            `;
                        } else if (tabType === 'netbanking') {
                            pane.innerHTML = `
                                <div class="netbanking-grid">
                                    <span class="nb-bank active">HDFC Bank</span>
                                    <span class="nb-bank">State Bank of India</span>
                                    <span class="nb-bank">ICICI Bank</span>
                                    <span class="nb-bank">Axis Bank</span>
                                </div>
                            `;
                        } else if (tabType === 'counter') {
                            pane.innerHTML = `
                                <div class="counter-pay-box">
                                    <span style="color:var(--teal)">${icon('wallet', 32)}</span>
                                    <p><strong>Pay ₹125 in Cash / Card at Hospital Desk</strong><br>Your appointment will remain confirmed. Present your token ticket at reception.</p>
                                </div>
                            `;
                        }
                        if (window.lucide) window.lucide.createIcons();
                    };
                });
            }
        }

        async function reserveVisit() {
            const button = container.querySelector('#details-next');
            button.disabled = true;
            button.innerHTML = `${icon('loader-circle', 16)} Saving reservation...`;
            if (window.lucide) window.lucide.createIcons();
            try {
                const isDemoPatient = state.loggedEmail === 'patient@smartcare.demo';
                state.lastBookingId = await window.App.DB.addPatient({
                    ...patientData,
                    hospital: patientData.hospital || 'SmartCare Community Hospital',
                    requestedHospital: patientData.hospital || 'SmartCare Community Hospital',
                    queueHospital: isDemoPatient ? 'SmartCare Community Hospital' : (patientData.hospital || 'SmartCare Community Hospital'),
                    patientEmail: state.loggedEmail || '',
                    demoMirrored: isDemoPatient,
                    country: patientData.country || 'India',
                    state: patientData.state || 'Telangana',
                    city: patientData.city || 'Hyderabad'
                });
            } catch (error) {
                button.disabled = false;
                button.innerHTML = `Review booking ${icon('arrow-right', 16)}`;
                showInlineError(container.querySelector('#step-content'), error.message || 'Could not reserve this visit. Check connection and try again.');
                if (window.lucide) window.lucide.createIcons();
                return;
            }
            rememberVisit();
            setStep(4);
        }

        function loadPatientDemo() {
            if (step === 1) {
                Object.assign(patientData, { name: 'Asha Rao', age: '32', doctorPref: 'General consultation' });
                persistDraft();
                setStep(2);
                return;
            }
            if (step === 2) {
                const lat = 17.385, lng = 78.4867;
                state.userCoords = { lat, lng, accuracy: 10000 };
                state.searchRadius = 5000;
                state.tempHospitals = [];
                Object.assign(patientData, { area: 'Hyderabad', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' });
                persistDraft();
                setStep(3);
                return;
            }
            if (step === 3) {
                Object.assign(patientData, {
                    department: 'General medicine',
                    doctorId: 'meera-shah',
                    doctorName: 'Dr Meera Shah',
                    doctorPref: 'Dr Meera Shah',
                    consultationType: 'In-person consultation',
                    appointmentDate: getAppointmentSlots()[0].date,
                    appointmentSlot: getAppointmentSlots()[0].slot,
                    symptomSelections: ['Fever', 'Fatigue'],
                    customSymptomTags: ['Body aches'],
                    customSymptoms: 'Symptoms started two days ago',
                    symptoms: 'Fever; Fatigue; Body aches; Symptoms started two days ago',
                    fee: 125,
                    triage: 'Unassessed'
                });
                persistDraft();
                setStep(3);
            }
        }

        function rememberVisit() {
            recordPatientVisit({
                id: state.lastBookingId,
                hospital: patientData.hospital || 'SmartCare Community Hospital',
                city: patientData.city || patientData.area || 'Hyderabad',
                reason: patientData.symptoms || patientData.doctorPref || 'General consultation',
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: 'Booked',
                reference: state.lastBookingId,
                department: patientData.department,
                doctorId: patientData.doctorId,
                doctorName: patientData.doctorName,
                consultationType: patientData.consultationType,
                appointmentDate: patientData.appointmentDate,
                appointmentSlot: patientData.appointmentSlot
            });
        }

        function showInlineError(target, message) {
            target.querySelector('.inline-error')?.remove();
            target.querySelector('.flow-actions')?.insertAdjacentHTML('beforebegin', `<div class="inline-error" role="alert">${icon('triangle-alert', 15)} ${esc(message)}</div>`);
        }
    };
})();

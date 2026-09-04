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
        const { state, setStep, updatePatientData, recordPatientVisit, setView, persistDraft, getCareTeam, getAppointmentSlots } = window.App.Store;
        const { step, patientData } = state;
        const container = document.createElement('div');
        container.className = isEmbedded ? 'patient-application-shell embedded-application-shell' : 'flow-shell patient-application-shell';
        let map;
        let markerNodes = [];
        let saveStatusTimer;
        const steps = ['Your profile', 'Find care', 'Visit details', 'Confirmed'];

        container.innerHTML = isEmbedded
            ? `<div class="embedded-app-top"><button id="patient-demo" class="btn-secondary btn-icon" type="button" ${step === 4 || (step === 3 && patientData.symptoms) ? 'disabled' : ''}>${icon('sparkles', 16)} ${demoLabel()}</button></div><section class="flow-card section-application" data-section="patient-application">${step === 4 ? confirmation() : activeFlow()}</section>`
            : `${topbar()}<section class="flow-card section-application" data-section="patient-application">${step === 4 ? confirmation() : activeFlow()}</section>${window.App.UI.footer()}`;

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
                        <button id="patient-demo" class="btn-secondary btn-icon" type="button" ${step === 4 || (step === 3 && patientData.symptoms) ? 'disabled' : ''}>
                            ${icon('sparkles', 16)} ${demoLabel()}
                        </button>
                        <button id="btn-back-home" class="back-link" type="button">
                            ${icon('arrow-left', 16)} ${step === 1 || step === 4 ? 'Back to home' : 'Back'}
                        </button>
                    </div>
                </div>
            `;
        }

        function activeFlow() {
            const title = step === 1 ? 'Tell us a little about you.' : step === 2 ? 'Choose care that fits.' : 'Make your visit count.';
            const description = step === 1 ? 'This helps the care team prepare before you arrive.' : step === 2 ? 'We use your location only to show nearby options.' : 'Share the essentials and we will prepare your queue place.';
            return `<div class="flow-header"><div><div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> New care visit</div><h1>${title}</h1><p>${description}</p></div><div><span class="status-eyebrow status-muted">Step ${step} of 4</span><span id="draft-status" class="draft-note" role="status" aria-live="polite">Draft saved on this device</span></div></div>${stepper()}<div id="step-content"></div>`;
        }

        function markDraftSaved() {
            const status = container.querySelector('#draft-status');
            if (!status) return;
            status.textContent = 'Saving changes...';
            window.clearTimeout(saveStatusTimer);
            saveStatusTimer = window.setTimeout(() => { status.textContent = 'Saved just now'; }, 350);
        }

        function stepper() {
            return `<div class="stepper" aria-label="Application progress">${steps.map((label, index) => `<div class="step-item ${step === index + 1 ? 'active' : ''} ${step > index + 1 ? 'done' : ''}" ${step === index + 1 ? 'aria-current="step"' : ''}><span class="step-number">${step > index + 1 ? icon('check', 14) : index + 1}</span><span>${label}</span></div>`).join('')}</div>`;
        }

        function renderProfile(target) {
            target.innerHTML = `<form id="patient-profile-step" novalidate><div class="form-grid"><div class="field"><label for="patient-name">Full name <span>*</span></label><input id="patient-name" autocomplete="name" minlength="2" maxlength="80" value="${esc(patientData.name)}" placeholder="e.g. Asha Rao" required></div><div class="field"><label for="patient-age">Age <span>*</span></label><input id="patient-age" type="number" min="1" max="120" step="1" inputmode="numeric" value="${esc(patientData.age)}" placeholder="e.g. 32" required></div><fieldset class="field full"><legend>Preferred care type <span>*</span></legend><div class="choice-grid">${[['General consultation', 'stethoscope'], ['Women\'s health', 'heart'], ['Child care', 'baby']].map(([label, iconName], index) => `<div class="choice"><input id="pref-${index}" type="radio" name="pref" value="${label}" ${patientData.doctorPref === label ? 'checked' : ''} ${index === 0 ? 'required' : ''}><label for="pref-${index}">${icon(iconName, 16)} ${label}</label></div>`).join('')}</div><span class="hint">Choose one option. You can change it at the care centre.</span></fieldset></div><div class="flow-actions"><span class="status-note">Required fields are marked with an asterisk.</span><button id="profile-next" class="btn-primary btn-icon" type="submit">Continue ${icon('arrow-right', 16)}</button></div></form>`;
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
            target.innerHTML = `<div class="map-layout section-map" data-section="care-map"><div class="map-panel"><div class="field"><label>Find nearby care centres <span>*</span></label><div class="location-entry" style="grid-template-columns:1fr"><button id="use-location" class="btn-primary btn-icon" type="button" style="width:100%;min-height:2.9rem;font-size:.88rem">${icon('locate-fixed', 18)} Detect &amp; use my device location</button></div><span class="hint">Location starts only when you choose and is sent to public map services for this search.</span><div class="location-divider"><span>or search manually</span></div><form id="location-search-form" class="location-search-form"><label class="sr-only" for="location-query">City, neighbourhood, or PIN code</label><input id="location-query" type="search" autocomplete="postal-code" maxlength="80" placeholder="City, neighbourhood, or PIN code"><button class="btn-secondary btn-icon" type="submit">${icon('search', 16)} Search</button></form></div><div class="map-toolbar"><span id="map-status" class="status-note" role="status" aria-live="polite"></span><span id="map-accuracy" class="map-accuracy"></span><div class="map-toolbar-actions"><button id="map-recenter" class="text-link text-link-dark btn-icon" type="button">${icon('crosshair', 15)} Recenter</button><div class="map-view-toggle" role="group" aria-label="Map view"><button id="show-map" class="active" type="button">Map</button><button id="show-list" type="button">List</button></div></div></div><div class="map-wrap"><div id="hospital-map" aria-label="Map of nearby care centres"></div><div class="map-overlay">${icon('map', 14)} MapLibre care map</div></div></div><aside class="hospital-results"><div class="results-heading"><div><h2>Nearby care centres</h2><p id="results-summary" aria-live="polite">Use your location or search an area to view nearby centres.</p></div><label class="filter-control" for="care-filter"><span>Filter</span><select id="care-filter"><option value="all">All care</option><option value="hospital">Hospitals</option><option value="clinic">Clinics</option></select></label></div><div id="hospital-list" class="hospital-list"><div class="review-card"><p class="status-note">Your results will appear after you choose a location method.</p></div></div></aside></div><div class="flow-actions"><button id="location-back" class="btn-secondary btn-icon">${icon('arrow-left', 16)} Back</button><button id="location-next" class="btn-primary btn-icon" disabled>Continue with selected centre ${icon('arrow-right', 16)}</button></div>`;
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
                status.textContent = 'Choose device location or search by city, neighbourhood, or PIN code.';
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
                button.disabled = true; status.textContent = 'Requesting your device location...';
                if (!navigator.geolocation) { button.disabled = false; status.textContent = 'Location is not available in this browser. Search for a city instead.'; return; }
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
                    status.textContent = 'Location permission was not granted. Search for a city instead.';
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
                list.innerHTML = Array.from({ length: 4 }, () => `<div class="hospital-result-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>`).join('');
                let mapResult = { results: [], radius: 0 };
                try { mapResult = await window.App.API.getNearbyHospitals(lat, lng); } catch {}
                const hospitals = mapResult.results || [];
                state.tempHospitals = hospitals.map(hospital => ({ ...hospital, distance: distanceKm({ lat, lng }, hospital) })).sort((a, b) => a.distance - b.distance);
                state.searchRadius = mapResult.radius || 5000;
                state.careResultsFetchedAt = new Date().toISOString();
                persistDraft();
                status.textContent = state.tempHospitals.length
                    ? `${state.tempHospitals.length} OpenStreetMap care listings found within ${Math.round((state.searchRadius || 5000) / 1000)} km.`
                    : `No named hospitals or clinics were found in OpenStreetMap within ${Math.round((state.searchRadius || 5000) / 1000)} km. Try another area.`;
                target.querySelector('#map-accuracy').textContent = state.userCoords?.accuracy < 10000 ? `GPS +/-${Math.round(state.userCoords.accuracy)} m` : 'Search-based location';
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
                    map.on('error', () => { mapTarget.classList.add('map-unavailable'); status.textContent = 'The map preview is unavailable. Choose a centre from the list.'; });

                    const userElement = document.createElement('div');
                    userElement.className = 'smartcare-user-marker';
                    userElement.innerHTML = '<span></span>';
                    new window.maplibregl.Marker({ element: userElement }).setLngLat([lng, lat]).setPopup(new window.maplibregl.Popup().setText('Your selected location')).addTo(map);

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
                            ${hospital.distance.toFixed(1)} km straight-line distance<br>
                            <small>${isPublicListing ? 'OpenStreetMap listing' : 'Fictional demo centre'}</small><br>
                            ${isPublicListing ? `<a style="display:inline-block;margin-top:.45rem;font-size:.74rem;font-weight:700;color:var(--teal)" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer">Open directions →</a>` : '<small>No real-world directions</small>'}
                        `;

                        const marker = new window.maplibregl.Marker({ element }).setLngLat([hospital.lng, hospital.lat]).setPopup(new window.maplibregl.Popup({ offset: 20 }).setHTML(popupHtml)).addTo(map);
                        element.onclick = () => selectHospital(hospital.id);
                        markerNodes.push({ hospital, marker });
                    });

                    if (visibleHospitals.length) {
                        const bounds = new window.maplibregl.LngLatBounds([lng, lat], [lng, lat]);
                        visibleHospitals.forEach(hospital => bounds.extend([hospital.lng, hospital.lat]));
                        map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
                    }
                } else {
                    mapTarget.innerHTML = `<div class="map-fallback">${icon('map-off', 24)}<strong>Map preview unavailable</strong><span>Choose a care centre from the list below.</span></div>`;
                    status.textContent = 'Map preview unavailable. Showing nearby centres in the list.';
                }

                const list = target.querySelector('#hospital-list');
                const fetchedLabel = state.careResultsFetchedAt ? new Date(state.careResultsFetchedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'just now';
                target.querySelector('#results-summary').textContent = visibleHospitals.length
                    ? `${visibleHospitals.length} OpenStreetMap listings, straight-line distance, updated ${fetchedLabel}`
                    : 'No matching OpenStreetMap listings found';

                list.innerHTML = visibleHospitals.length ? visibleHospitals.map((hospital, index) => {
                    const hours = hospital.openingHours === '24/7' ? 'Open 24 hours' : (hospital.openingHours || 'Hours not listed');
                    const isPublicListing = hospital.source === 'OpenStreetMap';
                    return `
                        <article class="hospital-option ${patientData.hospital === hospital.name ? 'selected' : ''}">
                            <button class="hospital-select-button" type="button" data-hospital-id="${esc(hospital.id)}" aria-pressed="${patientData.hospital === hospital.name}">
                                <span class="hospital-option-header">
                                <span><strong><span style="color:var(--teal);margin-right:.3rem">${index + 1}</span>${esc(hospital.name)}</strong><small>${esc(hospital.type || 'Care centre')} · ${esc(hours)}</small></span>
                                    <span class="hospital-distance">${hospital.distance.toFixed(1)} km</span>
                                </span>
                            </button>
                            <div class="hospital-card-meta">
                                <span style="color:var(--muted);font-size:.7rem">${icon(isPublicListing ? 'map-pin' : 'flask-conical', 12)} ${isPublicListing ? 'OpenStreetMap listing' : 'Fictional demo centre'}</span>
                                ${isPublicListing ? `<a class="hospital-ext-nav" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer">
                                    ${icon('navigation', 12)} Google Maps
                                </a>
                                <a class="hospital-ext-nav" href="https://maps.apple.com/?daddr=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer">
                                    ${icon('map-pin', 12)} Apple Maps
                                </a>` : '<span class="status-note">No real-world directions</span>'}
                            </div>
                        </article>
                    `;
                }).join('') : `<div class="provider-empty">${icon('map-pin-off', 28)}<p>No named care centres found. Search a nearby city, neighbourhood, or PIN code.</p></div>`;

                list.querySelectorAll('[data-hospital-id]').forEach(button => {
                    button.onclick = () => selectHospital(button.dataset.hospitalId);
                    button.onmouseenter = () => {
                        const id = button.dataset.hospitalId;
                        const markerNode = markerNodes.find(item => String(item.hospital.id) === String(id));
                        if (markerNode && map) {
                            markerNode.marker.getElement().classList.add('active');
                        }
                    };
                    button.onmouseleave = () => {
                        const id = button.dataset.hospitalId;
                        const markerNode = markerNodes.find(item => String(item.hospital.id) === String(id));
                        if (markerNode && map) {
                            markerNode.marker.getElement().classList.remove('active');
                        }
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
            const suggestions = ['Fever', 'Cold and cough', 'Stomach pain', 'Headache', 'Fatigue', 'Nausea', 'Routine check-up'];
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
            target.innerHTML = `<div class="care-safety-notice" role="note">${icon('triangle-alert', 20)}<div><strong>SmartCare cannot assess emergencies</strong><span>If you believe you need urgent or emergency care, contact local emergency services now instead of using this demo booking flow.</span></div></div>${demoMirror ? `<div class="demo-routing-note" role="note">${icon('presentation', 18)}<div><strong>Presentation mode is connected</strong><span>Your selected centre stays on the patient booking. A mirrored queue entry also appears in the SmartCare Community Hospital demo workspace.</span></div></div>` : ''}<div class="review-grid"><div><section class="care-selection-section" aria-labelledby="care-team-title"><div class="section-heading-compact"><h2 id="care-team-title">Choose your care team</h2><p>Demo availability is shown for presentation. A connected hospital would supply live schedules.</p></div><div class="care-selection-grid"><div class="field"><label for="visit-department">Department <span>*</span></label><select id="visit-department">${departments.map(name => `<option value="${esc(name)}" ${name === department ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></div><div class="field"><label for="visit-doctor">Clinician <span>*</span></label><select id="visit-doctor"></select><span id="doctor-availability" class="hint"></span></div><div class="field"><label for="consultation-type">Consultation type <span>*</span></label><select id="consultation-type"><option ${patientData.consultationType === 'In-person consultation' ? 'selected' : ''}>In-person consultation</option><option ${patientData.consultationType === 'Follow-up consultation' ? 'selected' : ''}>Follow-up consultation</option><option ${patientData.consultationType === 'Join walk-in queue' ? 'selected' : ''}>Join walk-in queue</option></select></div><div class="field"><label for="appointment-slot">Available slot <span>*</span></label><select id="appointment-slot">${appointmentSlots.map(item => `<option value="${esc(item.value)}" ${item.value === currentSlot.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div></div></section><div class="field symptom-search-field"><fieldset class="symptom-picker"><legend>What brings you in today? <span>*</span></legend><span id="symptom-help" class="hint">Choose any number of common symptoms or add your own. This information does not make a clinical triage decision.</span><form id="symptom-add-form" class="symptom-add-form"><label class="sr-only" for="symptom-search">Search or add a symptom</label><input id="symptom-search" type="search" maxlength="60" autocomplete="off" placeholder="Search symptoms or type your own"><button id="add-custom-symptom" class="btn-secondary btn-icon" type="submit">${icon('plus', 15)} Add custom</button></form><div class="symptom-suggestions" role="group" aria-label="Common symptoms">${suggestions.map(label => {
                const isSelected = selectedSymptoms.has(label);
                return `<button class="symptom-suggestion${isSelected ? ' active' : ''}" type="button" data-symptom="${esc(label)}" aria-pressed="${isSelected}">${icon(isSelected ? 'check' : 'plus', 14)} <span>${esc(label)}</span></button>`;
            }).join('')}</div><p id="symptom-no-results" class="symptom-no-results" hidden>No common symptom matches. Use Add custom to keep your entry.</p><div id="custom-symptom-tags" class="custom-symptom-tags" aria-live="polite"></div></fieldset></div><div class="field symptom-custom-field"><label for="custom-symptoms">Additional details <small>(optional)</small></label><textarea id="custom-symptoms" maxlength="300" aria-describedby="custom-symptom-help symptom-count" placeholder="When did this start, and what should the care team know?">${esc(initialCustomSymptoms)}</textarea><span id="custom-symptom-help" class="hint">Add timing or context. Do not enter emergency information here.</span><span id="symptom-count" class="hint symptom-count"></span></div><section class="booking-summary-card" aria-labelledby="booking-summary-title"><h2 id="booking-summary-title">Booking summary</h2><div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}, ${esc(patientData.age)}</strong></div><div class="summary-row"><span>Care centre</span><strong>${esc(patientData.hospital || 'Not selected')}</strong></div><div class="summary-row"><span>Department</span><strong id="summary-department"></strong></div><div class="summary-row"><span>Clinician</span><strong id="summary-doctor"></strong></div><div class="summary-row"><span>Consultation</span><strong id="summary-consultation"></strong></div><div class="summary-row"><span>Time</span><strong id="summary-slot"></strong></div></section></div><aside class="estimate-card"><small>Illustrative demo fee</small><strong id="fee-estimate">₹125</strong><p>Sample display only, not a quote or invoice. The care centre sets actual charges.</p><div class="estimate-rule"></div><small>Queue estimate</small><strong class="estimate-window">Shown after booking</strong><p>The live position changes as the hospital updates its queue.</p></aside></div><div class="flow-actions"><button id="details-back" class="btn-secondary btn-icon" type="button">${icon('arrow-left', 16)} Back</button><button id="details-next" class="btn-primary btn-icon" type="button">Review booking ${icon('arrow-right', 16)}</button></div>`;
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
                target.querySelector('#symptom-no-results').hidden = visible > 0 || !query;
                addCustomButton.disabled = !query;
            };

            const toggleSuggestion = button => {
                const symptom = button.dataset.symptom;
                if (selectedSymptoms.has(symptom)) selectedSymptoms.delete(symptom);
                else selectedSymptoms.add(symptom);
                const isSelected = selectedSymptoms.has(symptom);
                button.classList.toggle('active', isSelected);
                button.setAttribute('aria-pressed', String(isSelected));
                button.innerHTML = `${icon(isSelected ? 'check' : 'plus', 14)} <span>${esc(symptom)}</span>`;
                syncSymptoms();
                if (window.lucide) window.lucide.createIcons();
            };

            const addCustomSymptom = () => {
                const value = searchInput.value.trim();
                if (!value) return;
                const matchingSuggestion = [...target.querySelectorAll('.symptom-suggestion')].find(button => button.dataset.symptom.toLowerCase() === value.toLowerCase());
                if (matchingSuggestion) toggleSuggestion(matchingSuggestion);
                else if ([...customTags].some(tag => tag.toLowerCase() === value.toLowerCase())) showInlineError(target, 'That custom symptom is already included.');
                else if (customTags.size >= 8) showInlineError(target, 'You can add up to 8 custom symptom tags. Use Additional details for more context.');
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
                    showInlineError(target, 'Choose a department, clinician, consultation type, and available slot.');
                    departmentSelect.focus();
                    return;
                }
                if (!patientData.symptoms.trim()) {
                    showInlineError(target, 'Select at least one symptom or describe what brings you in today.');
                    searchInput.focus();
                    return;
                }
                showBookingReview();
            };

            function showBookingReview() {
                const selectedSlot = appointmentSlots.find(item => item.date === patientData.appointmentDate && item.slot === patientData.appointmentSlot) || appointmentSlots[0];
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                backdrop.innerHTML = `<section class="modal-card booking-review-modal" role="dialog" aria-modal="true" aria-labelledby="booking-review-title"><div class="modal-heading"><div><h2 id="booking-review-title">Confirm booking details</h2><p>Review the information below before adding this visit to the queue.</p></div><button class="btn-ghost modal-close-button" type="button" data-close-review aria-label="Close booking review">${icon('x', 18)}</button></div><div class="booking-review-list"><div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}, ${esc(patientData.age)}</strong></div><div class="summary-row"><span>Care centre</span><strong>${esc(patientData.hospital)}</strong></div><div class="summary-row"><span>Department</span><strong>${esc(patientData.department)}</strong></div><div class="summary-row"><span>Clinician</span><strong>${esc(patientData.doctorName)}</strong></div><div class="summary-row"><span>Consultation</span><strong>${esc(patientData.consultationType)}</strong></div><div class="summary-row"><span>Time</span><strong>${esc(selectedSlot.label)}</strong></div><div class="summary-row summary-row-stacked"><span>Reason for visit</span><strong>${esc(patientData.symptoms)}</strong></div>${demoMirror ? `<div class="demo-routing-note compact">${icon('presentation', 16)}<span>This demo visit will also appear in the SmartCare Community Hospital workspace.</span></div>` : ''}</div><div class="modal-actions"><button class="btn-secondary" type="button" data-close-review>Go back and edit</button><button class="btn-primary btn-icon" id="confirm-reservation" type="button">Confirm reservation ${icon('check', 16)}</button></div></section>`;
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
                return `<div class="success-state">
                    <div class="success-icon">${icon('calendar-x', 34)}</div>
                    <div class="eyebrow eyebrow-dark success-eyebrow"><span class="eyebrow-dot"></span> No reservation found</div>
                    <h1>Start a new booking.</h1>
                    <p>This confirmation route does not have a saved reservation for the signed-in patient.</p>
                    <div class="confirmation-actions" style="display:flex;gap:.75rem;margin-top:1.25rem;width:100%;flex-wrap:wrap">
                        <button id="btn-book-another" class="btn-primary">${icon('calendar-plus', 16)} Start booking</button>
                        <button id="btn-view-dashboard" class="btn-secondary">${icon('layout-dashboard', 16)} View dashboard</button>
                    </div>
                </div>`;
            }
            const confirmedHospital = confirmedVisit?.hospital || patientData.hospital || 'SmartCare Community Hospital';
            const confirmedPatient = patientData.name || 'Patient';
            const appointmentSlots = getAppointmentSlots();
            const confirmedSlot = appointmentSlots.find(item => item.date === (confirmedVisit?.appointmentDate || patientData.appointmentDate) && item.slot === (confirmedVisit?.appointmentSlot || patientData.appointmentSlot));
            const qrUrl = window.App.UI.generateQRCodeDataUrl(booking);
            return `
                <div class="success-state">
                    <div class="success-icon">${icon('check', 34)}</div>
                    <div class="eyebrow eyebrow-dark success-eyebrow"><span class="eyebrow-dot"></span> Reservation received</div>
                    <h1>You're on the list.</h1>
                    <p>This prototype QR and reference can be scanned in the SmartCare demo workspace; it is not a real care-centre confirmation.</p>
                    
                    <div class="review-card confirmation-review" style="padding:1.5rem">
                        <div class="summary-row"><span>Care centre</span><strong>${esc(confirmedHospital)}</strong></div>
                        <div class="summary-row"><span>Patient</span><strong>${esc(confirmedPatient)}</strong></div>
                        <div class="summary-row"><span>Department</span><strong>${esc(confirmedVisit?.department || patientData.department || 'General medicine')}</strong></div>
                        <div class="summary-row"><span>Clinician</span><strong>${esc(confirmedVisit?.doctorName || patientData.doctorName || 'Next available clinician')}</strong></div>
                        <div class="summary-row"><span>Consultation</span><strong>${esc(confirmedVisit?.consultationType || patientData.consultationType || 'In-person consultation')}</strong></div>
                        <div class="summary-row"><span>Scheduled for</span><strong>${esc(confirmedSlot?.label || `${confirmedVisit?.appointmentDate || patientData.appointmentDate || 'Today'} - ${confirmedVisit?.appointmentSlot || patientData.appointmentSlot || 'Next available'}`)}</strong></div>
                        
                        <div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px dashed var(--line);display:flex;flex-direction:column;align-items:center;gap:.75rem">
                            <img src="${qrUrl}" alt="Check-in QR Code" style="width:160px;height:160px;border-radius:.6rem;border:1px solid var(--line);background:#fff;padding:.35rem;box-shadow:0 4px 14px rgba(0,0,0,.08)">
                            <span style="font-size:.75rem;font-weight:700;color:var(--teal)">${icon('qr-code', 14)} Digital Scan Ticket</span>
                            
                            <div class="token-card" data-reference="${esc(booking)}" style="width:100%;max-width:320px;justify-content:center;margin-top:.25rem">
                                <div>
                                    <small>Ticket Reference String</small>
                                    <strong>${esc(booking)}</strong>
                                </div>
                                ${icon('copy', 18)}
                            </div>
                        <div class="next-steps-card" style="margin-top:1.25rem;padding:1.15rem 1.25rem;border:1px solid #bce0fd;border-radius:.85rem;background:#f2f8fe;text-align:left">
                            <strong style="font-size:.9rem;color:var(--teal-dark);display:flex;align-items:center;gap:.45rem;margin-bottom:.75rem">
                                ${icon('circle-help', 16)} What happens next?
                            </strong>
                            <ol style="margin:0;padding-left:1.2rem;display:grid;gap:.55rem;font-size:.82rem;color:var(--muted);line-height:1.5">
                                <li><strong>Check the dashboard:</strong> Review the current demo queue status before travelling.</li>
                                <li><strong>For prototype testing:</strong> Open <strong>${esc(confirmedHospital)}</strong> in a provider demo and scan reference <strong>${esc(booking)}</strong>.</li>
                                <li><strong>For real care:</strong> Contact the care centre directly to confirm availability, charges, and arrival instructions.</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="confirmation-actions" style="display:flex;gap:.75rem;margin-top:1.25rem;width:100%;flex-wrap:wrap">
                        <button id="btn-book-another" class="btn-primary" style="flex:1;min-height:2.6rem">${icon('calendar-plus', 16)} Book another appointment</button>
                        <button id="btn-view-dashboard" class="btn-secondary" style="flex:1;min-height:2.6rem">${icon('layout-dashboard', 16)} View my patient dashboard</button>
                        <button id="btn-test-doctor" class="btn-secondary" style="flex:1;min-height:2.6rem">${icon('stethoscope', 16)} Test scanning as hospital</button>
                    </div>
                </div>`;
        }

        function bindConfirmation() {
            const token = container.querySelector('.token-card');
            if (token) {
                const copyReference = async () => {
                    try {
                        await navigator.clipboard.writeText(token.dataset.reference || '');
                        token.classList.add('copied');
                        token.setAttribute('aria-label', 'Reservation reference copied');
                    } catch {
                        token.setAttribute('aria-label', 'Reservation reference');
                    }
                };
                token.setAttribute('role', 'button');
                token.setAttribute('tabindex', '0');
                token.setAttribute('aria-label', 'Copy reservation reference');
                token.onclick = copyReference;
                token.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        copyReference();
                    }
                };
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

        async function reserveVisit() {
            const button = container.querySelector('#details-next');
            button.disabled = true;
            button.innerHTML = `${icon('loader-circle', 16)} Saving your reservation...`;
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
                showInlineError(container.querySelector('#step-content'), error.message || 'We could not reserve this visit. Check your connection and try again.');
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

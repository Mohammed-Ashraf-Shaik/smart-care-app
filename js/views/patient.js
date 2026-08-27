(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
    
    const fallbackHospitals = (lat, lng) => [
        { id: 'fallback-1', name: 'SmartCare Community Hospital', type: 'Hospital', lat: lat + .018, lng: lng + .014 },
        { id: 'fallback-2', name: 'Green Cross Medical Centre', type: 'Clinic', lat: lat - .013, lng: lng + .022 },
        { id: 'fallback-3', name: 'CityCare Family Clinic', type: 'Clinic', lat: lat + .008, lng: lng - .024 }
    ];

    const distanceKm = (a, b) => {
        const radians = Math.PI / 180;
        const dLat = (b.lat - a.lat) * radians;
        const dLng = (b.lng - a.lng) * radians;
        const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
    };

    const getDrivingMeta = (distKm) => {
        const mins = Math.max(4, Math.round(distKm * 2.8));
        const trafficType = distKm < 2.5 ? 'smooth' : distKm < 6 ? 'moderate' : 'congested';
        const trafficLabel = trafficType === 'smooth' ? 'Smooth traffic' : trafficType === 'moderate' ? 'Moderate traffic' : 'Dense traffic';
        return { mins, trafficType, trafficLabel };
    };

    const calculateFee = symptoms => {
        const text = symptoms.toLowerCase();
        if (/chest pain|breathing|stroke|accident|unconscious|bleeding/.test(text)) return { fee: 450, triage: 'Red' };
        if (/fever|vomit|stomach|fatigue|nausea|pain/.test(text)) return { fee: 275, triage: 'Yellow' };
        return { fee: 125, triage: 'Green' };
    };

    const mapStyle = {
        version: 8,
        sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '&copy; OpenStreetMap contributors' } },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
    };

    window.App.Views.Patient = function (isEmbedded = false) {
        const { state, setStep, updatePatientData, recordPatientVisit, setView, persistDraft } = window.App.Store;
        const { step, patientData } = state;
        const container = document.createElement('div');
        container.className = isEmbedded ? 'patient-application-shell embedded-application-shell' : 'flow-shell patient-application-shell';
        let map;
        let markerNodes = [];
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
        // Mobile bottom nav: highlight 'Book' as active on the booking wizard
        container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav('patient', '/dashboard/patient/apply/1'));
        window.App.UI.bindMobileBottomNav(container);
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
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient application</span></span>
                    </a>
                    <nav class="flow-topbar-nav" aria-label="Application navigation">
                        <a data-route="/" href="/">Home</a>
                        <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1" class="active">Patient application</a>
                        <a data-route="/login" href="/login">Provider portal</a>
                        <a data-route="/about" href="/about">About</a>
                    </nav>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(true)}
                        <button id="patient-demo" class="btn-secondary btn-icon" type="button" ${step === 4 || (step === 3 && patientData.symptoms) ? 'disabled' : ''}>
                            ${icon('sparkles', 16)} ${demoLabel()}
                        </button>
                        <button id="btn-back-home" class="back-link" type="button">
                            ${icon('arrow-left', 16)} ${step === 1 || step === 4 ? 'Home' : 'Back'}
                        </button>
                    </div>
                </div>
            `;
        }

        function activeFlow() {
            const title = step === 1 ? 'Tell us a little about you.' : step === 2 ? 'Choose care that fits.' : 'Make your visit count.';
            const description = step === 1 ? 'This helps the care team prepare before you arrive.' : step === 2 ? 'We use your location only to show nearby options.' : 'Share the essentials and we will prepare your queue place.';
            return `<div class="flow-header"><div><div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> New care visit</div><h1>${title}</h1><p>${description}</p></div><div><span class="status-eyebrow status-muted">Step ${step} of 4</span><span class="draft-note">Saved on this device</span></div></div>${stepper()}<div id="step-content"></div>`;
        }

        function stepper() {
            return `<div class="stepper" aria-label="Application progress">${steps.map((label, index) => `<div class="step-item ${step === index + 1 ? 'active' : ''} ${step > index + 1 ? 'done' : ''}" ${step === index + 1 ? 'aria-current="step"' : ''}><span class="step-number">${step > index + 1 ? icon('check', 14) : index + 1}</span><span>${label}</span></div>`).join('')}</div>`;
        }

        function renderProfile(target) {
            target.innerHTML = `<div class="form-grid"><div class="field"><label for="patient-name">Full name <span>*</span></label><input id="patient-name" autocomplete="name" value="${esc(patientData.name)}" placeholder="e.g. Asha Rao" required></div><div class="field"><label for="patient-age">Age <span>*</span></label><input id="patient-age" type="number" min="0" max="120" inputmode="numeric" value="${esc(patientData.age)}" placeholder="e.g. 32" required></div><div class="field full"><label>Preferred care type</label><div class="choice-grid">${[['General consultation', 'stethoscope'], ['Women\'s health', 'heart'], ['Child care', 'baby']].map(([label, iconName], index) => `<div class="choice"><input id="pref-${index}" type="radio" name="pref" value="${label}" ${patientData.doctorPref === label ? 'checked' : ''}><label for="pref-${index}">${icon(iconName, 16)} ${label}</label></div>`).join('')}</div><span class="hint">You can change this at the care centre.</span></div></div><div class="flow-actions"><span class="status-note">Your information is used only for this visit.</span><button id="profile-next" class="btn-primary btn-icon">Continue ${icon('arrow-right', 16)}</button></div>`;
            target.querySelector('#patient-name').oninput = event => updatePatientData('name', event.target.value);
            target.querySelector('#patient-age').oninput = event => updatePatientData('age', event.target.value);
            target.querySelectorAll('input[name="pref"]').forEach(input => input.onchange = event => updatePatientData('doctorPref', event.target.value));
            target.querySelector('#profile-next').onclick = () => {
                if (!patientData.name.trim() || !patientData.age || Number(patientData.age) < 0 || Number(patientData.age) > 120) return showInlineError(target, 'Add a valid name and an age between 0 and 120 to continue.');
                setStep(2);
            };
        }

        function renderLocation(target) {
            target.innerHTML = `<div class="map-layout section-map" data-section="care-map"><div class="map-panel"><div class="field"><label>Find nearby care centres <span>*</span></label><div class="location-entry" style="grid-template-columns:1fr"><button id="use-location" class="btn-primary btn-icon" type="button" style="width:100%;min-height:2.9rem;font-size:.88rem">${icon('locate-fixed', 18)} Detect &amp; use my device location</button></div><span class="hint">Click to automatically detect nearby care centres using your device GPS.</span></div><div class="map-toolbar"><span id="map-status" class="status-note" role="status" aria-live="polite"></span><span id="map-accuracy" class="map-accuracy"></span><div class="map-toolbar-actions"><button id="map-recenter" class="text-link text-link-dark btn-icon" type="button">${icon('crosshair', 15)} Recenter</button><div class="map-view-toggle" role="group" aria-label="Map view"><button id="show-map" class="active" type="button">Map</button><button id="show-list" type="button">List</button></div></div></div><div class="map-wrap"><div id="hospital-map" aria-label="Map of nearby care centres"></div><div class="map-overlay">${icon('map', 14)} MapLibre care map</div></div></div><aside class="hospital-results"><div class="results-heading"><div><h2>Nearby care centres</h2><p id="results-summary" aria-live="polite">Click 'Use my device location' to view nearby centres.</p></div><label class="filter-control" for="care-filter"><span>Filter</span><select id="care-filter"><option value="all">All care</option><option value="hospital">Hospitals</option><option value="clinic">Clinics</option></select></label></div><div id="hospital-list" class="hospital-list"><div class="review-card"><p class="status-note">Your results will appear here after detecting location.</p></div></div></aside></div><div class="flow-actions"><button id="location-back" class="btn-secondary btn-icon">${icon('arrow-left', 16)} Back</button><button id="location-next" class="btn-primary btn-icon" disabled>Continue with selected centre ${icon('arrow-right', 16)}</button></div>`;
            const status = target.querySelector('#map-status');
            target.querySelector('#care-filter').onchange = () => { if (state.userCoords) renderMap(state.userCoords.lat, state.userCoords.lng); };
            target.querySelector('#location-back').onclick = () => setStep(1);
            target.querySelector('#location-next').onclick = () => { if (patientData.hospital) setStep(3); else showInlineError(target, 'Choose a care centre before continuing.'); };
            target.querySelector('#map-recenter').onclick = () => { if (map && state.userCoords) map.easeTo({ center: [state.userCoords.lng, state.userCoords.lat], zoom: 13, duration: 500 }); };
            target.querySelector('#show-map').onclick = () => setMapMode('map');
            target.querySelector('#show-list').onclick = () => setMapMode('list');
            target.querySelector('#use-location').onclick = useDeviceLocation;
            setMapMode('map');
            if (state.tempHospitals?.length && state.userCoords) {
                populateHospitals(state.userCoords.lat, state.userCoords.lng, 'Live location', false);
            } else {
                useDeviceLocation();
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
                    await populateHospitals(lat, lng, 'Live location');
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
                await populateHospitals(resolved.lat, resolved.lng, query, !coords);
            }

            async function populateHospitals(lat, lng, label, isFallback = false) {
                let mapResult = { results: [], radius: 0 };
                try { mapResult = await window.App.API.getNearbyHospitals(lat, lng); } catch {}
                const hospitals = mapResult.results?.length ? mapResult.results : fallbackHospitals(lat, lng);
                state.tempHospitals = hospitals.map(hospital => ({ ...hospital, distance: distanceKm({ lat, lng }, hospital) })).sort((a, b) => a.distance - b.distance);
                state.searchRadius = mapResult.radius || 5000;
                persistDraft();
                status.textContent = isFallback ? 'Showing care preview around Hyderabad.' : `${state.tempHospitals.length} care centres found within ${Math.round((state.searchRadius || 5000) / 1000)} km.`;
                target.querySelector('#map-accuracy').textContent = state.userCoords?.accuracy < 10000 ? `GPS +/-${Math.round(state.userCoords.accuracy)} m` : 'Search-based location';
                renderMap(lat, lng);
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
                        const meta = getDrivingMeta(hospital.distance);
                        const element = document.createElement('button');
                        element.type = 'button';
                        element.className = 'smartcare-hospital-marker';
                        element.setAttribute('aria-label', `Select ${hospital.name}`);
                        element.innerHTML = `<span><b>${index + 1}</b></span>`;

                        const popupHtml = `
                            <strong>${esc(hospital.name)}</strong><br>
                            ${esc(hospital.type || 'Care centre')}<br>
                            ${icon('car', 12)} ~${meta.mins} mins drive (${hospital.distance.toFixed(1)} km)<br>
                            <span class="traffic-badge traffic-${meta.trafficType}">${meta.trafficLabel}</span><br>
                            <a style="display:inline-block;margin-top:.45rem;font-size:.74rem;font-weight:700;color:var(--teal)" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank">Open Navigation →</a>
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
                target.querySelector('#results-summary').textContent = `${visibleHospitals.length} options, sorted by distance & drive time`;

                list.innerHTML = visibleHospitals.map((hospital, index) => {
                    const hours = hospital.openingHours === '24/7' ? 'Open 24 hours' : 'Hours not listed';
                    const meta = getDrivingMeta(hospital.distance);
                    return `
                        <button class="hospital-option ${patientData.hospital === hospital.name ? 'selected' : ''}" data-hospital-id="${esc(hospital.id)}" aria-pressed="${patientData.hospital === hospital.name}" ${index >= 8 ? 'hidden' : ''}>
                            <div class="hospital-option-header">
                                <span><strong><span style="color:var(--teal);margin-right:.3rem">${index + 1}</span>${esc(hospital.name)}</strong><small>${esc(hospital.type || 'Care centre')} · ${hours}</small></span>
                                <span class="hospital-distance">${hospital.distance.toFixed(1)} km</span>
                            </div>
                            <div class="hospital-card-meta">
                                <span style="color:var(--muted);font-size:.7rem">${icon('car', 12)} ~${meta.mins} min</span>
                                <span class="traffic-badge traffic-${meta.trafficType}">${meta.trafficLabel}</span>
                                <a class="hospital-ext-nav" href="https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                                    ${icon('navigation', 12)} Google Maps
                                </a>
                                <a class="hospital-ext-nav" href="https://maps.apple.com/?daddr=${hospital.lat},${hospital.lng}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                                    ${icon('map-pin', 12)} Apple Maps
                                </a>
                            </div>
                        </button>
                    `;
                }).join('') + (visibleHospitals.length > 8 ? `<button class="show-more-results" type="button">Show all ${visibleHospitals.length} centres</button>` : '');

                list.querySelectorAll('[data-hospital-id]').forEach(button => button.onclick = () => selectHospital(button.dataset.hospitalId));
                list.querySelector('.show-more-results')?.addEventListener('click', () => {
                    list.querySelectorAll('.hospital-option').forEach(node => { node.hidden = false; });
                    list.querySelector('.show-more-results')?.remove();
                });

                function selectHospital(id) {
                    const hospital = state.tempHospitals.find(item => String(item.id) === String(id));
                    if (!hospital) return;
                    updatePatientData('hospital', hospital.name);
                    target.querySelectorAll('.hospital-option').forEach(item => {
                        const selected = item.dataset.hospitalId === String(id);
                        item.classList.toggle('selected', selected);
                        item.setAttribute('aria-pressed', selected);
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
            const estimate = patientData.fee ? `₹${patientData.fee}` : 'Calculated next';
            const suggestions = [['Fever', 'Fever for two days'], ['Cold and cough', 'Cold and cough'], ['Stomach pain', 'Stomach pain'], ['Routine check-up', 'Routine check-up']];
            target.innerHTML = `<div class="review-grid"><div><div class="field"><label for="symptoms">What brings you in today? <span>*</span></label><textarea id="symptoms" maxlength="500" placeholder="Tell us briefly what you need help with...">${esc(patientData.symptoms)}</textarea><span class="hint">If this is an emergency, call your local emergency number immediately.</span><div class="symptom-suggestions" aria-label="Common symptom suggestions"><span class="suggestion-label">Try a suggestion</span>${suggestions.map(([label, value]) => `<button class="symptom-suggestion" type="button" data-symptoms="${esc(value)}">${icon('plus', 13)} ${label}</button>`).join('')}</div><span id="symptom-count" class="hint symptom-count"></span></div><div class="field" style="margin-top:1rem"><label>Review your care centre</label><div class="review-card"><div class="summary-row"><span>Centre</span><strong>${esc(patientData.hospital || 'Not selected')}</strong></div><div class="summary-row"><span>Area</span><strong>${esc(patientData.area || 'Not selected')}</strong></div><div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}, ${esc(patientData.age)}</strong></div></div></div></div><aside class="estimate-card"><small>Demo visit estimate</small><strong id="fee-estimate">${estimate}</strong><p>Estimated from urgency signals in the description. The care centre confirms the final charge.</p><div class="pricing-note"><span>Routine</span><strong>₹125</strong><span>Common symptoms</span><strong>₹275</strong><span>Urgent signals</span><strong>₹450</strong></div><div class="estimate-rule"></div><small>Expected queue window</small><strong class="estimate-window">15–25 min</strong></aside></div><div class="flow-actions"><button id="details-back" class="btn-secondary btn-icon">${icon('arrow-left', 16)} Back</button><button id="details-next" class="btn-primary btn-icon">Review and reserve ${icon('arrow-right', 16)}</button></div>`;
            const symptoms = target.querySelector('#symptoms');
            const count = target.querySelector('#symptom-count');
            const updateSymptoms = event => {
                updatePatientData('symptoms', event.target.value);
                const result = calculateFee(event.target.value);
                updatePatientData('fee', result.fee);
                updatePatientData('triage', result.triage);
                target.querySelector('#fee-estimate').textContent = `₹${result.fee}`;
                count.textContent = `${event.target.value.length}/500`;
            };
            count.textContent = `${symptoms.value.length}/500`;
            symptoms.oninput = updateSymptoms;
            target.querySelectorAll('.symptom-suggestion').forEach(button => button.onclick = () => {
                symptoms.value = button.dataset.symptoms;
                updateSymptoms({ target: symptoms });
                symptoms.focus();
            });
            target.querySelector('#details-back').onclick = () => setStep(2);
            target.querySelector('#details-next').onclick = () => {
                if (!patientData.symptoms.trim()) return showInlineError(target, 'Describe what brings you in today before reserving your visit.');
                const result = calculateFee(patientData.symptoms);
                updatePatientData('fee', result.fee);
                updatePatientData('triage', result.triage);
                reserveVisit();
            };
        }

        function confirmation() {
            const booking = state.lastBookingId || `SC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            const qrUrl = window.App.UI.generateQRCodeDataUrl(booking);
            return `
                <div class="success-state">
                    <div class="success-icon">${icon('check', 34)}</div>
                    <div class="eyebrow eyebrow-dark success-eyebrow"><span class="eyebrow-dot"></span> Reservation received</div>
                    <h1>You're on the list.</h1>
                    <p>Show this digital QR code ticket or reference ID when you arrive at the care centre for instant reception check-in.</p>
                    
                    <div class="review-card confirmation-review" style="padding:1.5rem">
                        <div class="summary-row"><span>Care centre</span><strong>${esc(patientData.hospital)}</strong></div>
                        <div class="summary-row"><span>Queue window</span><strong>15-25 minutes</strong></div>
                        <div class="summary-row"><span>Patient</span><strong>${esc(patientData.name)}</strong></div>
                        
                        <div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px dashed var(--line);display:flex;flex-direction:column;align-items:center;gap:.75rem">
                            <img src="${qrUrl}" alt="Check-in QR Code" style="width:160px;height:160px;border-radius:.6rem;border:1px solid var(--line);background:#fff;padding:.35rem;box-shadow:0 4px 14px rgba(0,0,0,.08)">
                            <span style="font-size:.75rem;font-weight:700;color:var(--teal)">${icon('qr-code', 14)} Digital Scan Ticket</span>
                            
                            <div class="token-card" style="width:100%;max-width:320px;justify-content:center;margin-top:.25rem">
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
                                <li><strong>Arrive at care centre:</strong> Head to <strong>${esc(patientData.hospital)}</strong> within your estimated 15–25 min queue window.</li>
                                <li><strong>Present your QR Code:</strong> Show this digital QR ticket or reference ID (<strong>${esc(booking)}</strong>) at the reception desk.</li>
                                <li><strong>Instant Scan Check-in:</strong> The hospital team scans your QR code using their camera scanner to check you in instantly and call your number.</li>
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
                        await navigator.clipboard.writeText(state.lastBookingId || '');
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
                    patientData.hospital = '';
                    patientData.fee = 0;
                    persistDraft();
                    setStep(1);
                };
            }
            const viewDash = container.querySelector('#btn-view-dashboard');
            if (viewDash) viewDash.onclick = () => setView('patient-dashboard');
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
                state.lastBookingId = await window.App.DB.addPatient({
                    ...patientData,
                    hospital: patientData.hospital || 'SmartCare Community Hospital',
                    country: patientData.country || 'India',
                    state: patientData.state || 'Telangana',
                    city: patientData.city || 'Hyderabad'
                });
            } catch {
                state.lastBookingId = `SC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                state.localBooking = true;
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
                state.tempHospitals = fallbackHospitals(lat, lng).map((hospital) => ({
                    ...hospital,
                    type: hospital.type.toLowerCase(),
                    distance: distanceKm({ lat, lng }, hospital),
                    openingHours: '24/7'
                }));
                Object.assign(patientData, { area: 'Hyderabad', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' });
                persistDraft();
                setStep(3);
                return;
            }
            if (step === 3) {
                Object.assign(patientData, { symptoms: 'Routine fever and fatigue', fee: 275, triage: 'Yellow' });
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
                reference: state.lastBookingId
            });
        }

        function showInlineError(target, message) {
            target.querySelector('.inline-error')?.remove();
            target.querySelector('.flow-actions')?.insertAdjacentHTML('beforebegin', `<div class="inline-error" role="alert">${icon('triangle-alert', 15)} ${esc(message)}</div>`);
        }
    };
})();

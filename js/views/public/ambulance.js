(function () {
    const esc = str => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;

    window.App.Views.Ambulance = function () {
        const { state, setView, navigate, getActiveAmbulance, bookAmbulance, cancelAmbulance } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';

        let activeBooking = getActiveAmbulance();
        let selectedType = 'ALS';

        function render() {
            activeBooking = getActiveAmbulance();

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark" style="background:#e53e3e">${icon('siren', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption" style="color:#e53e3e;font-weight:700">Emergency Response</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(false)}
                        <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back to home</a>
                    </div>
                </div>

                <main class="ambulance-main-shell" style="max-width:960px;margin:1.5rem auto;padding:0 1rem" role="main">
                    <div class="emergency-headline" style="text-align:center;margin-bottom:2rem">
                        <span class="badge" style="background:#fed7d7;color:#c53030;font-weight:700;padding:.4rem .9rem;border-radius:20px;display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem">
                            ${icon('zap', 14)} 24/7 SmartCare Emergency Trauma Fleet
                        </span>
                        <h1 style="font-size:clamp(1.6rem, 4vw, 2.3rem);margin:.6rem 0 .4rem;color:var(--ink)">
                            Book an Emergency Ambulance
                        </h1>
                        <p style="color:var(--muted);max-width:580px;margin:0 auto;font-size:.95rem">
                            Instant GPS dispatch. Paramedic-equipped vehicles matched with nearest emergency hospital trauma units.
                        </p>
                    </div>

                    ${activeBooking && activeBooking.status === 'dispatched' ? `
                        <!-- Active Live Dispatch Card -->
                        <div class="active-dispatch-card" style="background:var(--surface);border:2px solid #feb2b2;border-radius:16px;padding:1.5rem;box-shadow:0 8px 30px rgba(229,62,62,0.12)">
                            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-bottom:1.25rem;border-bottom:1px solid var(--line)">
                                <div style="display:flex;align-items:center;gap:.75rem">
                                    <span style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:#fff5f5;color:#e53e3e">
                                        ${icon('siren', 26)}
                                    </span>
                                    <div>
                                        <span class="badge" style="background:#c53030;color:#fff;font-weight:700;font-size:.75rem">VEHICLE DISPATCHED &amp; EN ROUTE</span>
                                        <h2 style="font-size:1.3rem;margin:.25rem 0 0">${esc(activeBooking.typeLabel)}</h2>
                                    </div>
                                </div>
                                <div style="text-align:right">
                                    <span style="font-size:.8rem;color:var(--muted);display:block">Estimated Arrival</span>
                                    <strong id="eta-countdown" style="font-size:1.8rem;color:#e53e3e;line-height:1">~${activeBooking.etaMinutes} mins</strong>
                                </div>
                            </div>

                            <!-- Live Route Progress Visualizer -->
                            <div style="margin:1.5rem 0;background:var(--canvas);border-radius:12px;padding:1.25rem;border:1px solid var(--line)">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;font-size:.85rem;font-weight:600">
                                    <span style="color:#e53e3e;display:flex;align-items:center;gap:.35rem">${icon('navigation', 14)} Fleet Dispatch Centre</span>
                                    <span style="display:flex;align-items:center;gap:.35rem">${icon('map-pin', 14)} ${esc(activeBooking.pickupAddress)}</span>
                                    <span style="color:var(--teal);display:flex;align-items:center;gap:.35rem">${icon('hospital', 14)} ${esc(activeBooking.hospital)} (ICU Ready)</span>
                                </div>
                                <div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;position:relative">
                                    <div style="width:65%;height:100%;background:linear-gradient(90deg, #e53e3e, #f56565);border-radius:4px;transition:width 1s"></div>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--muted);margin-top:.5rem">
                                    <span>Trauma Team Pre-Alerted</span>
                                    <span>Distance: 3.2 km away</span>
                                    <span>Trauma Bed Held</span>
                                </div>
                            </div>

                            <!-- Driver & Vehicle Details Grid -->
                            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;margin-bottom:1.5rem">
                                <div style="padding:.9rem;background:var(--canvas);border-radius:10px;border:1px solid var(--line)">
                                    <small style="color:var(--muted);display:block">Assigned Driver &amp; Paramedic</small>
                                    <strong style="font-size:1.05rem;display:block;margin:.2rem 0">${esc(activeBooking.driver.name)}</strong>
                                    <a href="tel:${esc(activeBooking.driver.phone)}" class="btn-secondary btn-icon" style="display:inline-flex;padding:.3rem .75rem;font-size:.82rem;margin-top:.35rem;color:var(--teal)">
                                        ${icon('phone-call', 14)} Call Driver Now
                                    </a>
                                </div>
                                <div style="padding:.9rem;background:var(--canvas);border-radius:10px;border:1px solid var(--line)">
                                    <small style="color:var(--muted);display:block">Emergency Vehicle</small>
                                    <strong style="font-size:1.05rem;display:block;margin:.2rem 0">${esc(activeBooking.driver.vehicleNo)}</strong>
                                    <span style="font-size:.82rem;color:var(--muted)">${esc(activeBooking.driver.vehicleModel)}</span>
                                </div>
                                <div style="padding:.9rem;background:var(--canvas);border-radius:10px;border:1px solid var(--line)">
                                    <small style="color:var(--muted);display:block">Destination Trauma Centre</small>
                                    <strong style="font-size:1.05rem;display:block;margin:.2rem 0">${esc(activeBooking.hospital)}</strong>
                                    <span style="font-size:.82rem;color:#38a169;font-weight:600">● 1 ICU Trauma Bed Reserved</span>
                                </div>
                            </div>

                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem">
                                <button type="button" id="cancel-amb-btn" class="btn-secondary" style="border-color:#feb2b2;color:#c53030">
                                    ${icon('ban', 14)} Cancel Ambulance
                                </button>
                                <a href="/dashboard/hospital" data-route="/dashboard/hospital" class="btn-secondary btn-icon" style="font-size:.85rem">
                                    ${icon('activity', 14)} View Hospital Emergency Room
                                </a>
                            </div>
                        </div>
                    ` : `
                        <!-- Booking Form Card -->
                        <div class="ambulance-booking-container" style="display:grid;grid-template-columns:1fr;gap:1.5rem">
                            <section class="provider-card" style="padding:1.5rem">
                                <h2 style="font-size:1.25rem;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem">
                                    ${icon('map-pin', 20)} 1. Confirm Emergency Pickup Location
                                </h2>
                                
                                <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
                                    <button type="button" id="btn-detect-gps" class="btn-primary btn-icon" style="background:#e53e3e;border-color:#e53e3e;padding:.6rem 1rem">
                                        ${icon('crosshair', 16)} Use My Current GPS Location
                                    </button>
                                    <span id="gps-status" style="font-size:.85rem;color:var(--muted);align-self:center"></span>
                                </div>

                                <div class="field" style="margin-bottom:1.5rem">
                                    <label for="pickup-address" style="font-weight:600;font-size:.9rem;display:block;margin-bottom:.35rem">Pickup Address / Landmark</label>
                                    <input id="pickup-address" type="text" value="Plot 42, Gachibowli Financial District, Hyderabad" placeholder="Enter road name, landmark, or apartment" required style="width:100%;padding:.75rem 1rem;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:.95rem">
                                </div>

                                <h2 style="font-size:1.25rem;margin:1.5rem 0 1rem;display:flex;align-items:center;gap:.5rem">
                                    ${icon('shield-alert', 20)} 2. Select Ambulance Category
                                </h2>

                                <div class="ambulance-type-selector" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:1rem;margin-bottom:1.5rem">
                                    <div class="amb-card ${selectedType === 'ALS' ? 'selected' : ''}" data-type="ALS" style="border:2px solid ${selectedType === 'ALS' ? '#e53e3e' : 'var(--line)'};border-radius:12px;padding:1.2rem;cursor:pointer;background:${selectedType === 'ALS' ? '#fff5f5' : 'var(--surface)'};transition:all .2s">
                                        <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                            <strong style="color:${selectedType === 'ALS' ? '#c53030' : 'var(--ink)'};font-size:1.05rem">ALS (ICU Critical Care)</strong>
                                            <span class="badge" style="background:#fed7d7;color:#9b2c2c;font-size:.75rem">RECOMMENDED</span>
                                        </div>
                                        <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0">Inbuilt ventilator, defibrillator, cardiac monitor, trauma doctor.</p>
                                        <div style="display:flex;justify-content:space-between;font-size:.85rem;font-weight:700;margin-top:.75rem;color:var(--ink)">
                                            <span>₹1,800 Base Fee</span>
                                            <span style="color:#e53e3e">ETA ~6–8 mins</span>
                                        </div>
                                    </div>

                                    <div class="amb-card ${selectedType === 'BLS' ? 'selected' : ''}" data-type="BLS" style="border:2px solid ${selectedType === 'BLS' ? '#e53e3e' : 'var(--line)'};border-radius:12px;padding:1.2rem;cursor:pointer;background:${selectedType === 'BLS' ? '#fff5f5' : 'var(--surface)'};transition:all .2s">
                                        <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                            <strong style="color:${selectedType === 'BLS' ? '#c53030' : 'var(--ink)'};font-size:1.05rem">BLS (Basic Life Support)</strong>
                                        </div>
                                        <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0">Oxygen cylinders, stretcher, first aid kit, trained EMT paramedic.</p>
                                        <div style="display:flex;justify-content:space-between;font-size:.85rem;font-weight:700;margin-top:.75rem;color:var(--ink)">
                                            <span>₹750 Base Fee</span>
                                            <span style="color:#e53e3e">ETA ~9–12 mins</span>
                                        </div>
                                    </div>

                                    <div class="amb-card ${selectedType === 'PatientTransport' ? 'selected' : ''}" data-type="PatientTransport" style="border:2px solid ${selectedType === 'PatientTransport' ? '#e53e3e' : 'var(--line)'};border-radius:12px;padding:1.2rem;cursor:pointer;background:${selectedType === 'PatientTransport' ? '#fff5f5' : 'var(--surface)'};transition:all .2s">
                                        <div style="display:flex;justify-content:space-between;align-items:flex-start">
                                            <strong style="color:${selectedType === 'PatientTransport' ? '#c53030' : 'var(--ink)'};font-size:1.05rem">Patient Transport</strong>
                                        </div>
                                        <p style="font-size:.85rem;color:var(--muted);margin:.4rem 0">Non-emergency transfers, dialysis runs, post-discharge wheelchair.</p>
                                        <div style="display:flex;justify-content:space-between;font-size:.85rem;font-weight:700;margin-top:.75rem;color:var(--ink)">
                                            <span>₹500 Base Fee</span>
                                            <span style="color:var(--muted)">Scheduled / 15m</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="ambulance-caller-grid">
                                    <div class="field">
                                        <label for="caller-name" style="font-weight:600;font-size:.9rem;display:block;margin-bottom:.35rem">Patient / Caller Name</label>
                                        <input id="caller-name" type="text" value="${esc(state.loggedEmail ? state.loggedEmail.split('@')[0] : 'Emergency Patient')}" required style="width:100%;padding:.65rem .8rem;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                                    </div>
                                    <div class="field">
                                        <label for="caller-phone" style="font-weight:600;font-size:.9rem;display:block;margin-bottom:.35rem">Emergency Contact Phone <span>*</span></label>
                                        <input id="caller-phone" type="tel" value="+91 98765 43210" required style="width:100%;padding:.65rem .8rem;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">
                                    </div>
                                </div>

                                <div class="field" style="margin-bottom:1.5rem">
                                    <label for="dest-hospital" style="font-weight:600;font-size:.9rem;display:block;margin-bottom:.35rem">Preferred Destination Hospital</label>
                                    <select id="dest-hospital" style="width:100%;padding:.7rem 1rem;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:.95rem">
                                        <option value="SmartCare Community Hospital">SmartCare Community Hospital (4 ICU beds available · 3.2 km)</option>
                                        <option value="CityCare Trauma Centre">CityCare Trauma Centre (2 ICU beds · 4.8 km)</option>
                                        <option value="Apollo Emergency Hospital">Apollo Emergency Hospital (5 ICU beds · 6.1 km)</option>
                                    </select>
                                </div>

                                <div class="emergency-action-dock" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-top:1rem;border-top:1px solid var(--line)">
                                    <span style="font-size:.85rem;color:var(--muted)">
                                        ${icon('lock', 13)} Zero prepayment required for dispatch
                                    </span>
                                    <button type="button" id="btn-dispatch-now" class="btn-primary btn-icon" style="background:#e53e3e;border-color:#e53e3e;font-size:1.05rem;padding:.8rem 1.8rem;border-radius:8px;box-shadow:0 4px 15px rgba(229,62,62,0.3)">
                                        ${icon('siren', 20)} DISPATCH AMBULANCE NOW
                                    </button>
                                </div>
                            </section>
                        </div>
                    `}
                </main>
                ${window.App.UI.footer(false)}
            `;

            window.App.UI.bindTopbarControls(container);
            if (window.lucide) window.lucide.createIcons();

            // Bind Type selector chips
            container.querySelectorAll('.amb-card').forEach(card => {
                card.onclick = () => {
                    selectedType = card.dataset.type;
                    render();
                };
            });

            // GPS location detect
            const gpsBtn = container.querySelector('#btn-detect-gps');
            if (gpsBtn) {
                gpsBtn.onclick = () => {
                    const statusEl = container.querySelector('#gps-status');
                    statusEl.textContent = 'Detecting satellite coordinates...';
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            pos => {
                                statusEl.textContent = `📍 Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Accurate to 15m)`;
                                container.querySelector('#pickup-address').value = 'Near Gachibowli Ring Road, Hyderabad (GPS Verified)';
                            },
                            () => {
                                statusEl.textContent = '📍 Address verified via network location.';
                                container.querySelector('#pickup-address').value = 'Financial District Road No 2, Hyderabad';
                            },
                            { timeout: 5000 }
                        );
                    } else {
                        statusEl.textContent = 'GPS not available. Manual address applied.';
                    }
                };
            }

            // Dispatch button
            const dispatchBtn = container.querySelector('#btn-dispatch-now');
            if (dispatchBtn) {
                dispatchBtn.onclick = () => {
                    const address = container.querySelector('#pickup-address').value.trim();
                    const patientName = container.querySelector('#caller-name').value.trim() || 'Emergency Patient';
                    const patientPhone = container.querySelector('#caller-phone').value.trim() || '+91 98765 43210';
                    const hospital = container.querySelector('#dest-hospital').value;

                    dispatchBtn.disabled = true;
                    dispatchBtn.textContent = 'Dispatching nearest vehicle...';

                    setTimeout(() => {
                        bookAmbulance({
                            type: selectedType,
                            pickupAddress: address,
                            patientName,
                            patientPhone,
                            hospital
                        });
                        window.App.UI.toast('Ambulance dispatched! Driver K. Ramesh Babu is en route.', 'success');
                        render();
                    }, 600);
                };
            }

            // Cancel Ambulance
            const cancelBtn = container.querySelector('#cancel-amb-btn');
            if (cancelBtn && activeBooking) {
                cancelBtn.onclick = () => {
                    if (confirm('Are you sure you want to cancel this ambulance dispatch?')) {
                        cancelAmbulance(activeBooking.id, 'Cancelled by patient');
                        window.App.UI.toast('Ambulance dispatch cancelled.', 'info');
                        render();
                    }
                };
            }
        }

        render();
        return container;
    };
})();

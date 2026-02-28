(function () {
    window.App.Views.Patient = function () {
        const { state, setStep, updatePatientData, setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 animate-fade-in font-sans";

        // --- API HELPERS ---
        const { getCoordinates, getNearbyHospitals } = window.App.API;

        // --- MAP CONTROLLER ---
        let map = null;
        let userMarker = null;
        let hospitalLayer = null;
        let watchId = null;

        const initMap = (lat, lng) => {
            if (map) return; // Already initialized

            console.log("[Map] Initializing...");
            map = L.map('hospital-map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OSM Contributors'
            }).addTo(map);

            hospitalLayer = L.layerGroup().addTo(map);
        };

        const updateUserMarker = (lat, lng) => {
            if (!map) return;

            // Create or Move User Marker
            if (!userMarker) {
                const icon = L.divIcon({
                    className: 'bg-blue-600 w-4 h-4 rounded-full border-2 border-white shadow-lg pulse',
                    iconSize: [16, 16]
                });
                userMarker = L.marker([lat, lng], { icon: icon }).addTo(map).bindPopup("You").openPopup();
            } else {
                userMarker.setLatLng([lat, lng]);
            }

            // Smooth Pan
            map.flyTo([lat, lng], 13);
        };

        const renderHospitalMarkers = (hospitals) => {
            if (!map || !hospitalLayer) return;

            hospitalLayer.clearLayers(); // Remove old markers
            console.log(`[Map] Rendering ${hospitals.length} markers`);

            const icon = L.divIcon({
                className: 'bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg',
                iconSize: [16, 16]
            });

            hospitals.forEach(h => {
                L.marker([h.lat, h.lng], { icon: icon })
                    .addTo(hospitalLayer)
                    .bindPopup(`<b>${h.name}</b><br>${h.type}`);
            });
        };


        // --- UI RENDER HELPERS ---
        const renderHospitalList = (hospitals) => {
            const listContainer = container.querySelector('#hospital-list');
            if (!listContainer) return;

            if (hospitals.length > 0) {
                listContainer.innerHTML = hospitals.map((h, index) => {
                    const colors = ['blue', 'cyan', 'indigo', 'violet'];
                    const color = colors[index % colors.length];
                    return `
                    <div class="hospital-card cursor-pointer bg-white/40 border border-white p-6 rounded-[2rem] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all flex justify-between items-center group mb-4 shadow-sm" 
                         data-name="${h.name}">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                <i data-lucide="hospital" class="w-7 h-7"></i>
                            </div>
                            <div>
                                <h3 class="font-black text-xl text-slate-800 group-hover:text-brand-600 tracking-tight">${h.name}</h3>
                                <div class="flex items-center gap-3 mt-1">
                                    <span class="text-xs font-bold text-slate-400 border px-2 py-0.5 rounded-full uppercase tracking-widest">${h.type}</span>
                                    <span class="text-xs font-black text-brand-500">${(Math.random() * 5 + 0.5).toFixed(1)} km</span>
                                </div>
                            </div>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </div>
                    </div>`;
                }).join('');

                if (window.lucide) window.lucide.createIcons();

                // Re-attach listeners
                container.querySelectorAll('.hospital-card').forEach(card => {
                    card.onclick = () => {
                        updatePatientData('hospital', card.dataset.name);
                        // At this point, country/state/city should already be in state.patientData
                        setStep(4);
                    };
                });

            } else {
                listContainer.innerHTML = `
                    <div class="p-8 text-center text-slate-500">
                        <i data-lucide="search-x" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
                        <p>No hospitals found nearby.</p>
                    </div>
                `;
            }
        };


        // --- LOGIC: LIVE TRACKING ---
        const startLiveTracking = () => {
            if (!navigator.geolocation) {
                alert("Geolocation not supported.");
                return;
            }

            console.log("[GPS] Starting Watcher...");

            // Initial "Loading" state if needed

            watchId = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    console.log(`[GPS] Update: ${latitude}, ${longitude}`);

                    // If we are on Step 3, update map
                    if (state.step === 3) {
                        updateUserMarker(latitude, longitude);
                    } else if (state.step === 2) {
                        // First Lock -> Go to Step 3
                        const data = await getNearbyHospitals(latitude, longitude);
                        state.tempHospitals = data.results;
                        state.searchRadius = data.radius;
                        state.userCoords = { lat: latitude, lng: longitude };
                        updatePatientData('area', 'Live Location');
                        setStep(3);
                    }
                },
                (err) => console.error("[GPS] Error", err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        const calculateFee = (symptoms) => {
            const sym = symptoms.toLowerCase();
            let min = 150, max = 250; // Default

            // Risk Levels
            const highRisk = ["chest pain", "breathing", "heart", "unconscious", "accident", "stroke", "bleeding"];
            const lowRisk = ["cough", "cold", "headache", "minor", "sore throat", "itchy"];
            const midRisk = ["fever", "vomit", "stomach", "fatigue", "nausea", "pain"];

            if (highRisk.some(k => sym.includes(k))) {
                min = 350; max = 500;
            } else if (midRisk.some(k => sym.includes(k))) {
                min = 200; max = 350;
            } else if (lowRisk.some(k => sym.includes(k))) {
                min = 50; max = 200;
            }

            const fee = Math.floor(Math.random() * (max - min + 1)) + min;
            return Math.min(Math.max(fee, 1), 500); // Strict clamp 1-500
        };


        // --- VIEW TEMPLATES ---
        let contentHTML = '';

        // Progress UI
        const steps = [1, 2, 3, 4, 5, 6];
        const stepIcons = ['user', 'map-pin', 'search', 'activity', 'credit-card', 'check-circle'];

        const progressHTML = `
            <div class="flex justify-between w-full max-w-lg mb-12 relative px-2">
                <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                    <div class="h-full bg-brand-500 transition-all duration-700 ease-in-out" style="width: ${((state.step - 1) / (steps.length - 1)) * 100}%"></div>
                </div>
                ${steps.map((s, i) => `
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 z-10 
                            ${state.step === s ? 'bg-brand-600 text-white shadow-xl shadow-blue-200 scale-110 rotate-3' :
                state.step > s ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-300 border border-slate-100'}">
                            <i data-lucide="${stepIcons[i]}" class="w-5 h-5"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Render Progress and Container Shell
        const backBtn = `
            <button id="btn-back" class="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-brand-600 font-bold transition-all group">
                <div class="w-10 h-10 glass-card rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </div>
                <span class="text-sm tracking-widest uppercase">Go Back</span>
            </button>`;

        container.innerHTML = `
            ${backBtn}
            <div class="w-full max-w-xl glass-card p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-white relative overflow-hidden animate-slide-up">
                <div class="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
                
                <div class="relative z-10">
                    ${progressHTML}
                    <div id="step-content"></div>
                </div>
            </div>
        `;
        const stepContent = container.querySelector('#step-content');

        // STEP 1: PATIENT DETAILS
        if (state.step === 1) {
            stepContent.innerHTML = `
                <div class="space-y-8 w-full animate-fade-in">
                    <div class="text-center mb-10">
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-2">Patient Profile</h2>
                        <p class="text-slate-500 text-lg">Help us tailor your care experience.</p>
                    </div>

                    <div class="space-y-6">
                        <!-- Name -->
                        <div class="group">
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                            <div class="relative">
                                <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                                <input id="input-name" type="text" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-medium" 
                                    placeholder="e.g. John Doe" value="${state.patientData.name}">
                            </div>
                        </div>

                        <!-- Age & Gender -->
                        <div class="grid grid-cols-2 gap-6">
                            <div class="group">
                                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Age</label>
                                <div class="relative">
                                    <i data-lucide="calendar" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                                    <input id="input-age" type="number" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-medium" 
                                        placeholder="25" value="${state.patientData.age}">
                                </div>
                            </div>
                            <div class="group">
                                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Gender</label>
                                <select id="input-gender" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-medium appearance-none">
                                    <option value="" disabled ${!state.patientData.gender ? 'selected' : ''}>Select</option>
                                    <option value="Male" ${state.patientData.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="Female" ${state.patientData.gender === 'Female' ? 'selected' : ''}>Female</option>
                                    <option value="Other" ${state.patientData.gender === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>

                        <!-- Doctor Preference -->
                        <div>
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Doctor Preference</label>
                            <div class="grid grid-cols-2 gap-4">
                                <label class="cursor-pointer border-2 ${state.patientData.doctorPref === 'Male' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-50 bg-slate-50'} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-white hover:border-brand-200" onclick="document.getElementById('pref-male').click()">
                                    <input type="radio" name="doctorPref" id="pref-male" value="Male" class="hidden" ${state.patientData.doctorPref === 'Male' ? 'checked' : ''}>
                                    <span class="text-2xl">👨‍⚕️</span>
                                    <span class="font-bold text-slate-700 text-sm">Male Doctor</span>
                                </label>
                                <label class="cursor-pointer border-2 ${state.patientData.doctorPref === 'Female' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-50 bg-slate-50'} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-white hover:border-brand-200" onclick="document.getElementById('pref-female').click()">
                                    <input type="radio" name="doctorPref" id="pref-female" value="Female" class="hidden" ${state.patientData.doctorPref === 'Female' ? 'checked' : ''}>
                                    <span class="text-2xl">👩‍⚕️</span>
                                    <span class="font-bold text-slate-700 text-sm">Female Doctor</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button id="btn-next-step1" class="w-full bg-slate-900 hover:bg-brand-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 group">
                        Find Nearby Hospitals 
                        <i data-lucide="arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            `;
        }


        // STEP 2: LOCATION SELECTION
        if (state.step === 2) {
            stepContent.innerHTML = `
                <div class="space-y-8 w-full animate-fade-in">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-2">Your Location</h2>
                        <p class="text-slate-500 text-lg">Pinpoint your area for accurate results.</p>
                    </div>

                    <div class="glass-card p-1 border-slate-50 rounded-[2.5rem] shadow-sm space-y-4 overflow-hidden">
                        <div class="p-6 space-y-5">
                            <div class="group">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Country</label>
                                <select id="patient-country" class="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold appearance-none">
                                    <option value="">Loading Countries...</option>
                                </select>
                            </div>
                            <div class="group">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">State</label>
                                <select id="patient-state" disabled class="w-full px-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-slate-300 outline-none transition-all font-bold appearance-none">
                                    <option value="">Select Country first</option>
                                </select>
                            </div>
                            <div class="group">
                                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">City</label>
                                <select id="patient-city" disabled class="w-full px-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-slate-300 outline-none transition-all font-bold appearance-none">
                                    <option value="">Select State first</option>
                                </select>
                            </div>
                        </div>

                        <button id="btn-location-next" disabled class="w-full bg-slate-900 text-white py-5 rounded-b-[2.5rem] font-black text-lg hover:bg-brand-600 transition-all opacity-50 cursor-not-allowed flex items-center justify-center gap-3 group">
                            Detect Hospitals
                            <i data-lucide="search" class="w-6 h-6 group-hover:scale-110 transition-transform"></i>
                        </button>
                    </div>

                    <div class="relative flex items-center w-full">
                        <div class="h-px bg-slate-100 w-full"></div>
                        <span class="px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick Switch</span>
                        <div class="h-px bg-slate-100 w-full"></div>
                    </div>

                    <!-- Option A: Live -->
                    <button id="btn-live" class="w-full group bg-brand-50/30 hover:bg-brand-50 border-2 border-brand-100 p-6 rounded-3xl flex items-center transition-all text-left">
                        <div class="w-16 h-16 bg-brand-500 text-white rounded-2xl flex items-center justify-center mr-6 shadow-xl shadow-brand-200 group-hover:scale-110 transition-transform">
                            <i data-lucide="crosshair" class="w-8 h-8"></i>
                        </div>
                        <div>
                            <h3 class="font-black text-xl text-slate-900 mb-1">Live Tracking</h3>
                            <p class="text-brand-600/60 font-medium text-sm">Automatic geopositioning (Secure)</p>
                        </div>
                    </button>
                </div>
            `;
        }


        // STEP 3: MAP & LIST
        if (state.step === 3) {
            stepContent.innerHTML = `
                <div class="space-y-6 w-full animate-fade-in">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Hospitals</h2>
                            ${state.searchRadius && state.searchRadius > 5000 ?
                    `<p class="text-[10px] text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full inline-block mt-2 tracking-widest uppercase">
                                    <i data-lucide="alert-circle" class="w-3 h-3 inline mr-1"></i> Area Expanded: ${state.searchRadius / 1000}km
                                </p>` :
                    `<p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Radius: ${state.searchRadius ? state.searchRadius / 1000 : 5}km</p>`
                }
                        </div>
                        <button id="btn-change-loc" class="text-xs font-black text-brand-600 hover:text-brand-800 uppercase tracking-widest pb-1 border-b-2 border-brand-100">Reset</button>
                    </div>
                    
                    <!-- Map Container -->
                    <div id="hospital-map" class="w-full h-72 rounded-[2.5rem] bg-slate-50 z-0 border border-slate-100 shadow-inner overflow-hidden shadow-2xl shadow-slate-200/50"></div>

                    <!-- List Container -->
                    <div id="hospital-list" class="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        <!-- Items injected by JS -->
                        <div class="p-8 text-center text-slate-300 font-bold italic">Scanning medical facilities...</div>
                    </div>
                </div>
            `;
        }


        // STEP 4: SYMPTOMS
        if (state.step === 4) {
            const quickSymptoms = ["Fever", "Headache", "Cough", "Cold", "Body Pain", "Fatigue", "Nausea"];

            stepContent.innerHTML = `
                <div class="space-y-8 w-full animate-fade-in">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-2">Triage Details</h2>
                        <p class="text-slate-500 text-lg">Describe your symptoms for pre-analysis.</p>
                    </div>
                    
                    <div class="space-y-6">
                        <div class="relative group">
                            <div class="absolute -top-3 left-6 px-3 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest z-20">Your Symptoms</div>
                            <textarea id="input-symptoms" class="w-full p-6 pt-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none resize-none text-lg font-medium transition-all" placeholder="Tell us how you're feeling..." rows="5">${state.patientData.symptoms}</textarea>
                        </div>
                        
                        <!-- Quick Select Chips -->
                        <div class="space-y-3">
                            <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Common Symptoms</p>
                            <div class="flex flex-wrap gap-2">
                                ${quickSymptoms.map(s => `
                                    <button class="px-5 py-2.5 bg-white border border-slate-100 hover:border-brand-300 hover:bg-brand-50 text-slate-600 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-95"
                                        onclick="const el = document.getElementById('input-symptoms'); el.value += (el.value ? ', ' : '') + '${s}'; el.dispatchEvent(new Event('input'));">
                                        + ${s}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <button id="btn-next" class="w-full bg-slate-900 group hover:bg-brand-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6">
                        Calculate Estimate 
                        <i data-lucide="arrow-right" class="w-6 h-6 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>`;
        }


        // STEP 5: QUOTE
        if (state.step === 5) {
            const fee = state.patientData.fee || 0;
            stepContent.innerHTML = `
                <div class="w-full text-center space-y-8 animate-fade-in">
                    <div class="bg-gradient-to-br from-brand-600 to-indigo-700 p-10 rounded-[3rem] shadow-2xl shadow-brand-200 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div class="absolute -left-10 -bottom-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl"></div>
                        
                        <div class="relative z-10">
                            <p class="text-brand-100/60 uppercase tracking-[0.3em] text-[10px] font-black mb-3">Service Fee Estimate</p>
                            <div class="flex items-center justify-center gap-2">
                                <span class="text-3xl font-bold text-brand-200 mb-4">₹</span>
                                <h3 class="text-7xl font-black text-white tracking-tighter mb-4 counter">${fee.toFixed(2)}</h3>
                            </div>
                            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                                <i data-lucide="shield-check" class="w-4 h-4 text-cyan-300"></i>
                                <span class="text-white/80 text-[10px] font-black uppercase tracking-widest">Inclusive of all taxes</span>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Card -->
                    <div class="glass-card p-8 rounded-[2.5rem] text-left space-y-5 border-slate-50">
                        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h4 class="text-xs font-black text-slate-300 uppercase tracking-widest">Booking Recap</h4>
                            <div class="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                                <i data-lucide="file-text" class="w-4 h-4"></i>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            <div class="flex justify-between items-center px-2">
                                <span class="text-slate-400 text-sm font-bold">Patient</span>
                                <span class="text-slate-800 font-black">${state.patientData.name}</span>
                            </div>
                            <div class="flex justify-between items-center px-2">
                                <span class="text-slate-400 text-sm font-bold">Hospital</span>
                                <span class="text-slate-800 font-black truncate max-w-[180px]">${state.patientData.hospital}</span>
                            </div>
                            <div class="flex justify-between items-center px-2">
                                <span class="text-slate-400 text-sm font-bold">Priority</span>
                                <span class="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Triage Required</span>
                            </div>
                        </div>
                    </div>

                    <button id="btn-next" class="w-full bg-slate-900 hover:bg-brand-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group">
                        Confirm Appointment
                        <i data-lucide="check-circle" class="w-6 h-6 group-hover:scale-110 transition-transform"></i>
                    </button>
                </div>`;
        }


        // STEP 6: CONFIRMATION
        if (state.step === 6) {
            const randomToken = `#${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(10 + Math.random() * 90)}`;
            const randomWait = Math.floor(5 + Math.random() * 25);

            stepContent.innerHTML = `
                <div class="w-full text-center space-y-8 animate-fade-in py-4">
                    <div class="relative inline-block">
                        <div class="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150"></div>
                        <div class="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative z-10 border-4 border-white shadow-xl">
                            <i data-lucide="check" class="w-12 h-12"></i>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <p class="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Queue Status: Confirmed</p>
                        <h1 class="text-8xl font-black text-slate-900 tracking-tighter py-4">${randomToken}</h1>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="glass-card p-6 rounded-3xl text-center border-slate-50">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wait Time</p>
                            <p class="text-2xl font-black text-brand-600 truncate">~${randomWait}m</p>
                        </div>
                        <div class="glass-card p-6 rounded-3xl text-center border-slate-50">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</p>
                            <p class="text-2xl font-black text-indigo-600">04</p>
                        </div>
                    </div>

                    <!-- Developer Support Card -->
                    <div class="bg-slate-900 p-8 rounded-[2.5rem] text-left relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        <p class="text-brand-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4">Support Infrastructure</p>
                        
                        <div class="space-y-4">
                            <a href="tel:8500543154" class="flex items-center gap-4 text-white hover:text-brand-400 transition-colors">
                                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <i data-lucide="phone" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="text-xs font-black tracking-widest">8500543154</p>
                                    <p class="text-[10px] text-slate-500 font-bold uppercase">Emergency Coordination</p>
                                </div>
                            </a>
                            <a href="mailto:ashubasha52@gmail.com" class="flex items-center gap-4 text-white hover:text-brand-400 transition-colors">
                                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <i data-lucide="mail" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="text-xs font-black tracking-widest lowercase">ashubasha52@gmail.com</p>
                                    <p class="text-[10px] text-slate-500 font-bold uppercase">System Administration</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <button id="btn-home" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-2xl font-black text-lg transition-all active:scale-95">
                        Close Dashboard
                    </button>
                </div>
            `;
        }




        // Event Listeners
        container.querySelector('#btn-back').onclick = () => {
            // Cleanup
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (state.step === 1) setView('landing');
            else setStep(state.step - 1);
        };

        // --- STEP 1 HANDLERS (Details) ---
        if (state.step === 1) {
            container.querySelector('#input-name').oninput = (e) => updatePatientData('name', e.target.value);
            container.querySelector('#input-age').oninput = (e) => updatePatientData('age', e.target.value);
            container.querySelector('#input-gender').onchange = (e) => updatePatientData('gender', e.target.value);

            // Radio buttons for doctorPref
            const prefs = container.querySelectorAll('input[name="doctorPref"]');
            prefs.forEach(p => {
                p.onchange = () => {
                    updatePatientData('doctorPref', p.value);

                    // Manual UI Update to avoid full re-render
                    container.querySelectorAll('input[name="doctorPref"]').forEach(input => {
                        const label = input.closest('label');
                        if (input.checked) {
                            label.classList.remove('border-slate-200');
                            label.classList.add('border-brand-500', 'bg-blue-50');
                        } else {
                            label.classList.remove('border-brand-500', 'bg-blue-50');
                            label.classList.add('border-slate-200');
                        }
                    });
                };
            });

            container.querySelector('#btn-next-step1').onclick = () => {
                const { name, age, gender } = state.patientData;
                if (!name || !age || !gender) {
                    alert("Please fill in all fields.");
                    return;
                }
                setStep(2);
            };
        }

        // --- STEP 2 HANDLERS (Location) ---
        if (state.step === 2) {
            // Live Button
            container.querySelector('#btn-live').onclick = async () => {
                const btn = container.querySelector('#btn-live');
                const originalContent = btn.innerHTML;

                // Show loading state
                btn.disabled = true;
                btn.innerHTML = `
                    <div class="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center mr-5 shadow-lg shadow-blue-200">
                        <i data-lucide="loader-2" class="w-7 h-7 animate-spin"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800">Acquiring Location...</h3>
                        <p class="text-slate-500 text-sm">Please wait while we find nearby hospitals</p>
                    </div>
                `;
                lucide.createIcons();

                startLiveTracking();
            };

            const countrySelect = container.querySelector('#patient-country');
            const stateSelect = container.querySelector('#patient-state');
            const citySelect = container.querySelector('#patient-city');
            const nextBtn = container.querySelector('#btn-location-next');

            const { fetchCountries, fetchStates, fetchCities } = window.App.API;

            (async () => {
                const countries = await fetchCountries();
                const india = countries.find(c => c.name === "India");
                const others = countries.filter(c => c.name !== "India").sort((a, b) => a.name.localeCompare(b.name));
                const sorted = india ? [india, ...others] : others;

                countrySelect.innerHTML = `<option value="" disabled selected>Select Country</option>` +
                    sorted.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            })();

            countrySelect.onchange = async () => {
                updatePatientData('country', countrySelect.value);
                stateSelect.innerHTML = `<option>Loading...</option>`;
                stateSelect.disabled = true;
                const states = await fetchStates(countrySelect.value);
                if (states.length) {
                    stateSelect.innerHTML = `<option value="" disabled selected>Select State</option>` +
                        states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
                    stateSelect.disabled = false;
                    stateSelect.classList.remove('bg-slate-100', 'text-slate-400');
                    stateSelect.classList.add('bg-white', 'text-slate-900');
                } else {
                    stateSelect.innerHTML = `<option>No States</option>`;
                }
            };

            stateSelect.onchange = async () => {
                updatePatientData('state', stateSelect.value);
                citySelect.innerHTML = `<option>Loading...</option>`;
                citySelect.disabled = true;
                const cities = await fetchCities(countrySelect.value, stateSelect.value);
                if (cities.length) {
                    citySelect.innerHTML = `<option value="" disabled selected>Select City</option>` +
                        cities.map(c => `<option value="${c}">${c}</option>`).join('');
                    citySelect.disabled = false;
                    citySelect.classList.remove('bg-slate-100', 'text-slate-400');
                    citySelect.classList.add('bg-white', 'text-slate-900');
                } else {
                    citySelect.innerHTML = `<option>No Cities</option>`;
                }
            };

            citySelect.onchange = () => {
                updatePatientData('city', citySelect.value);
                nextBtn.disabled = false;
                nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            };

            nextBtn.onclick = async () => {
                const query = `${citySelect.value}, ${stateSelect.value}, ${countrySelect.value}`;
                const coords = await window.App.API.getCoordinates(query);
                if (coords) {
                    const data = await window.App.API.getNearbyHospitals(coords.lat, coords.lng);
                    state.tempHospitals = data.results;
                    state.searchRadius = data.radius;
                    state.userCoords = { lat: coords.lat, lng: coords.lng };
                    setStep(3);
                } else {
                    alert("Location not found. Please try a different city.");
                }
            };
        }

        // --- STEP 3 HANDLERS (Map) ---
        if (state.step === 3) {
            setTimeout(() => {
                if (state.userCoords) {
                    initMap(state.userCoords.lat, state.userCoords.lng);
                    updateUserMarker(state.userCoords.lat, state.userCoords.lng);
                    renderHospitalMarkers(state.tempHospitals || []);
                }
            }, 100);

            renderHospitalList(state.tempHospitals || []);

            container.querySelector('#btn-change-loc').onclick = () => {
                if (watchId) navigator.geolocation.clearWatch(watchId);
                setStep(2);
            };
        }

        // --- OTHER STEPS ---
        if (state.step === 4) {
            container.querySelector('#input-symptoms').oninput = (e) => updatePatientData('symptoms', e.target.value);
            container.querySelector('#btn-next').onclick = () => {
                const symptoms = container.querySelector('#input-symptoms').value;
                if (!symptoms) {
                    alert("Please describe your symptoms.");
                    return;
                }
                const fee = calculateFee(symptoms);
                updatePatientData('symptoms', symptoms);
                updatePatientData('fee', fee);
                setStep(5);
            };
        }

        if (state.step === 5) {
            container.querySelector('#btn-next').onclick = async () => {
                const btn = container.querySelector('#btn-next');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin w-5 h-5 inline mr-2"></i> Processing...`;
                lucide.createIcons();

                try {
                    await window.App.DB.addPatient(state.patientData);
                    setStep(6);
                } catch (e) {
                    const errorMsg = e.message || e.details || "Unknown error";
                    alert(`Failed to confirm booking: ${errorMsg}\n\nPlease ensure you have run the SQL setup script in your Supabase dashboard.`);
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    lucide.createIcons();
                }
            };
        }

        if (state.step === 6) container.querySelector('#btn-home').onclick = () => setView('landing');

        return container;
    };
})();

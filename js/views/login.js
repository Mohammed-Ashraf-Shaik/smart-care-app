(function () {
    window.App.Views.Login = function () {
        const { state, setView } = window.App.Store;
        const { fetchCountries, fetchStates, fetchCities } = window.App.API;

        const role = state.auth ? state.auth.targetRole : 'doctor'; // Default
        const roleName = role === 'doctor' ? 'Doctor' : 'Staff/Admin';
        const brandColor = role === 'doctor' ? 'text-cyan-600' : 'text-slate-600';
        const btnColor = role === 'doctor' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-800';

        const container = document.createElement('div');
        container.className = "min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in";

        container.innerHTML = `
            <button id="btn-back" class="absolute top-8 left-8 group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black transition-all">
                <div class="w-10 h-10 glass-card rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </div>
                <span class="text-xs tracking-widest uppercase">Go Back</span>
            </button>

            <div class="w-full max-w-xl glass-card p-12 md:p-16 rounded-[3.5rem] shadow-2xl border border-white relative overflow-hidden animate-slide-up">
                <div class="absolute -right-20 -top-20 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl"></div>
                <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
                
                <div class="relative z-10 space-y-10">
                    <div class="text-center">
                        <div class="w-20 h-20 ${role === 'doctor' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-900 text-white'} rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                            <i data-lucide="${role === 'doctor' ? 'stethoscope' : 'shield-check'}" class="w-10 h-10"></i>
                        </div>
                        <h2 class="text-4xl font-black text-slate-900 tracking-tighter">Facility Access</h2>
                        <p class="text-slate-500 mt-3 text-lg font-medium">${roleName} Authentication Portal</p>
                    </div>

                    <div class="space-y-6">
                        <!-- Location Intelligence -->
                        <div class="glass-card p-1 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div class="p-6 space-y-4">
                                <div class="group">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Location Details</label>
                                    <div class="grid grid-cols-1 gap-3">
                                        <select id="login-country" class="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold appearance-none">
                                            <option value="">Loading Countries...</option>
                                        </select>
                                        <div class="grid grid-cols-2 gap-3">
                                            <select id="login-state" disabled class="w-full px-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-slate-300 outline-none transition-all font-bold appearance-none">
                                                <option value="">State</option>
                                            </select>
                                            <select id="login-city" disabled class="w-full px-4 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl text-slate-300 outline-none transition-all font-bold appearance-none">
                                                <option value="">City</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button id="btn-live" class="w-full bg-slate-900 group hover:bg-brand-600 text-white py-5 rounded-b-[2.5rem] font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3">
                                Detect My Facility
                                <i data-lucide="crosshair" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                            </button>
                        </div>

                        <div class="relative flex items-center w-full py-2">
                            <div class="h-px bg-slate-100 w-full"></div>
                            <span class="px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Credentials</span>
                            <div class="h-px bg-slate-100 w-full"></div>
                        </div>

                        <!-- Credentials -->
                        <div class="space-y-4">
                            <div class="group">
                                <div class="relative">
                                    <i data-lucide="hospital" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                                    <input id="login-hospital" type="text" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-medium" placeholder="Facility Name or ID">
                                </div>
                            </div>

                            <div class="group">
                                <div class="relative">
                                    <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                                    <input id="login-password" type="password" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-medium" placeholder="Access Password">
                                </div>
                            </div>
                        </div>

                        <div id="login-error" class="hidden text-rose-500 text-[10px] font-black text-center bg-rose-50 border border-rose-100 py-3 rounded-xl uppercase tracking-widest">
                            Access Denied: Invalid Credentials
                        </div>

                        <button id="btn-login" class="w-full bg-brand-600 text-white py-6 rounded-[2rem] font-black text-xl tracking-widest uppercase shadow-2xl shadow-brand-200 transition-all hover:bg-brand-700 active:scale-95 flex items-center justify-center gap-4">
                            Sign In
                            <i data-lucide="log-in" class="w-6 h-6"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Logic
        const countrySelect = container.querySelector('#login-country');
        const stateSelect = container.querySelector('#login-state');
        const citySelect = container.querySelector('#login-city');
        const hospitalInput = container.querySelector('#login-hospital');
        const passInput = container.querySelector('#login-password');
        const loginBtn = container.querySelector('#btn-login');
        const errorMsg = container.querySelector('#login-error');

        (async () => {
            const countries = await fetchCountries();
            const india = countries.find(c => c.name === "India");
            const others = countries.filter(c => c.name !== "India").sort((a, b) => a.name.localeCompare(b.name));
            const sorted = india ? [india, ...others] : others;

            countrySelect.innerHTML = `<option value="" disabled selected>Select Country</option>` +
                sorted.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        })();

        const updateLocationSelectors = async (country, state, city) => {
            // Update Country
            countrySelect.value = country;

            // Fetch and Update States
            stateSelect.innerHTML = `<option>Loading...</option>`;
            stateSelect.disabled = true;
            const states = await fetchStates(country);
            if (states.length) {
                stateSelect.innerHTML = `<option value="" disabled>Select State</option>` +
                    states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
                stateSelect.value = state;
                stateSelect.disabled = false;
                stateSelect.classList.remove('bg-slate-100/50', 'text-slate-300');
                stateSelect.classList.add('bg-white', 'text-slate-900');
            }

            // Fetch and Update Cities
            citySelect.innerHTML = `<option>Loading...</option>`;
            citySelect.disabled = true;
            const cities = await fetchCities(country, state);
            if (cities.length) {
                citySelect.innerHTML = `<option value="" disabled>Select City</option>` +
                    cities.map(c => `<option value="${c}">${c}</option>`).join('');
                citySelect.value = city;
                citySelect.disabled = false;
                citySelect.classList.remove('bg-slate-100/50', 'text-slate-300');
                citySelect.classList.add('bg-white', 'text-slate-900');
            }
        };

        container.querySelector('#btn-live').onclick = () => {
            const btn = container.querySelector('#btn-live');
            const originalHTML = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = `
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                    <i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i>
                </div>
                <div class="text-left">
                    <h3 class="font-bold text-slate-800">Acquiring...</h3>
                    <p class="text-slate-500 text-xs">Finding your GPS position</p>
                </div>
            `;
            lucide.createIcons();

            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                const loc = await window.App.API.reverseGeocode(latitude, longitude);

                if (loc) {
                    await updateLocationSelectors(loc.country, loc.state, loc.city);
                } else {
                    alert("Could not determine your exact location. Please select manually.");
                }

                btn.disabled = false;
                btn.innerHTML = originalHTML;
                lucide.createIcons();
            }, (err) => {
                alert("GPS error: " + err.message);
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                lucide.createIcons();
            }, { enableHighAccuracy: true });
        };

        countrySelect.onchange = async () => {
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

        loginBtn.onclick = async () => {
            // Basic Validation
            if (!countrySelect.value || !hospitalInput.value || !passInput.value) {
                errorMsg.textContent = "Please fill all fields";
                errorMsg.classList.remove('hidden');
                return;
            }

            // Database Credential Check
            loginBtn.disabled = true;
            loginBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin w-6 h-6 mr-2"></i> Verifying...`;
            lucide.createIcons();

            const result = await window.App.DB.checkCredentials(hospitalInput.value, passInput.value, role);

            if (result.success) {
                // Save hospital for filtering (Country, State, City, Hospital)
                window.App.Store.setLoggedLocation(
                    countrySelect.value,
                    stateSelect.value,
                    citySelect.value,
                    hospitalInput.value
                );
                setView(role);
            } else {
                errorMsg.textContent = result.error;
                errorMsg.classList.remove('hidden');
                loginBtn.disabled = false;
                loginBtn.innerHTML = `Sign In <i data-lucide="log-in" class="w-6 h-6 ml-2"></i>`;
                lucide.createIcons();
            }
        };

        container.querySelector('#btn-back').onclick = () => setView('landing');

        return container;
    };
})();

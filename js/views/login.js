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
            <button id="btn-back" class="absolute top-6 left-6 flex items-center text-slate-500 hover:text-brand-600 font-bold transition-colors">
                <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i> Back to Hub
            </button>

            <div class="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 ${role === 'doctor' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'} rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="${role === 'doctor' ? 'stethoscope' : 'shield-check'}" class="w-8 h-8"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900">Where are you?</h2>
                    <p class="text-slate-500 mt-2">Select your location to access ${roleName} hub</p>
                </div>

                <div class="space-y-4">
                    <!-- Location Drill -->
                    <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Manual Selection</label>
                        <select id="login-country" class="w-full p-3 mb-2 border border-slate-200 rounded-xl bg-white focus:bg-white transition-colors outline-none text-sm">
                            <option value="">Loading Countries...</option>
                        </select>
                        <select id="login-state" disabled class="w-full p-3 mb-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 outline-none text-sm transition-colors">
                            <option value="">Select Country</option>
                        </select>
                         <select id="login-city" disabled class="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 outline-none text-sm transition-colors">
                            <option value="">Select State</option>
                        </select>
                    </div>

                    <div class="relative py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-1/3 before:h-px before:bg-slate-200 after:content-[''] after:absolute after:right-0 after:top-1/2 after:w-1/3 after:h-px after:bg-slate-200">
                        OR
                    </div>

                    <!-- Live Location Button -->
                    <button id="btn-live" class="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                         <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i data-lucide="crosshair" class="w-6 h-6"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-slate-800">Use Live Location</h3>
                            <p class="text-slate-500 text-xs">Set facility location automatically</p>
                        </div>
                    </button>

                    <hr class="border-slate-100 my-6">

                    <!-- Hospital Name -->
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hospital ID / Name</label>
                        <input id="login-hospital" type="text" class="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. City General">
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Password</label>
                        <input id="login-password" type="password" class="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none" placeholder="••••••••">
                    </div>

                    <div id="login-error" class="hidden text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                        Incorrect Credentials
                    </div>

                    <button id="btn-login" class="w-full ${btnColor} text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200/50 transition-all mt-4 transform active:scale-95">
                        Authenticate
                    </button>
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

                // If detected state isn't in list, inject it
                if (state && !states.find(s => s.name === state)) {
                    stateSelect.innerHTML += `<option value="${state}">${state}</option>`;
                }

                stateSelect.value = state;
                stateSelect.disabled = false;
                stateSelect.classList.remove('bg-slate-100', 'text-slate-400');
                stateSelect.classList.add('bg-white', 'text-slate-900');
            }

            // Fetch and Update Cities
            citySelect.innerHTML = `<option>Loading...</option>`;
            citySelect.disabled = true;
            const cities = await fetchCities(country, state);
            if (cities.length) {
                citySelect.innerHTML = `<option value="" disabled>Select City</option>` +
                    cities.map(c => `<option value="${c}">${c}</option>`).join('');

                // If detected city isn't in list, inject it
                if (city && !cities.includes(city)) {
                    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
                }

                citySelect.value = city;
                citySelect.disabled = false;
                citySelect.classList.remove('bg-slate-100', 'text-slate-400');
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
                console.log(`[GPS] Login Detection: ${latitude}, ${longitude}`);

                try {
                    const loc = await window.App.API.reverseGeocode(latitude, longitude);

                    if (loc) {
                        const countries = await window.App.API.fetchCountries();
                        // Find match in our supported countries list
                        const matchedCountry = countries.find(c =>
                            c.name.toLowerCase().includes(loc.country.toLowerCase()) ||
                            loc.country.toLowerCase().includes(c.name.toLowerCase())
                        );

                        if (matchedCountry) {
                            await updateLocationSelectors(matchedCountry.name, loc.state, loc.city);
                        } else {
                            await updateLocationSelectors(loc.country, loc.state, loc.city);
                        }
                    } else {
                        throw new Error("Reverse geocode failed");
                    }
                } catch (e) {
                    console.error("[GPS] Fail", e);
                    alert("Location detection failed. Please select manually.");
                }

                btn.disabled = false;
                btn.innerHTML = originalHTML;
                lucide.createIcons();
            }, (err) => {
                let msg = "GPS error";
                if (err.code === 1) msg = "Permission denied";
                else if (err.code === 2) msg = "Position unavailable";
                else if (err.code === 3) msg = "Timeout connecting to GPS";

                alert(msg + ". Please enter location manually.");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                lucide.createIcons();
            }, { enableHighAccuracy: false, timeout: 10000 });
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

        loginBtn.onclick = () => {
            // Basic Validation
            if (!countrySelect.value || !hospitalInput.value || !passInput.value) {
                errorMsg.textContent = "Please fill all fields";
                errorMsg.classList.remove('hidden');
                return;
            }

            // Simulation
            if (passInput.value.length < 3) {
                errorMsg.textContent = "Password too short";
                errorMsg.classList.remove('hidden');
                return;
            }

            // Save hospital for filtering (Country, State, City, Hospital)
            window.App.Store.setLoggedLocation(
                countrySelect.value,
                stateSelect.value,
                citySelect.value,
                hospitalInput.value
            );
            setView(role);
        };

        container.querySelector('#btn-back').onclick = () => setView('landing');

        return container;
    };
})();

(function () {
    window.App.Views.Login = function () {
        const { state, setView } = window.App.Store;
        const { fetchCountries, fetchStates, fetchCities } = window.App.API;

        let loginStep = 1;
        let formData = {
            country: '',
            state: '',
            city: '',
            hospital: '',
            password: ''
        };

        const role = state.auth ? state.auth.targetRole : 'doctor';
        const roleName = role === 'doctor' ? 'Doctor' : 'Staff/Admin';
        const brandColor = role === 'doctor' ? 'text-cyan-600' : 'text-slate-600';
        const btnColor = role === 'doctor' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-800';

        const container = document.createElement('div');
        container.className = "min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in";

        const setLoginStep = (step) => {
            loginStep = step;
            render();
        };

        const render = () => {
            container.innerHTML = `
                <button id="btn-back-hub" class="absolute top-6 left-6 flex items-center text-slate-500 hover:text-brand-600 font-bold transition-colors">
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i> ${loginStep === 1 ? 'Back to Hub' : 'Previous Step'}
                </button>

                <div class="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 ${role === 'doctor' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'} rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="${loginStep === 1 ? 'map-pin' : 'lock'}" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-3xl font-black text-slate-900">${roleName} Login</h2>
                        <div class="flex justify-center gap-1 mt-2">
                            <div class="h-1.5 w-6 rounded-full ${loginStep === 1 ? 'bg-cyan-500' : 'bg-slate-200'}"></div>
                            <div class="h-1.5 w-6 rounded-full ${loginStep === 2 ? 'bg-cyan-500' : 'bg-slate-200'}"></div>
                        </div>
                    </div>

                    ${loginStep === 1 ? `
                        <!-- SLIDE 1: LOCATION -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Country</label>
                                <select id="login-country" class="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none text-sm">
                                    <option value="">Loading Countries...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">State / Province</label>
                                <select id="login-state" disabled class="w-full p-4 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 outline-none text-sm transition-all focus:bg-white">
                                    <option value="">Select Country First</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">City / District</label>
                                <select id="login-city" disabled class="w-full p-4 border border-slate-200 rounded-xl bg-slate-100 text-slate-400 outline-none text-sm transition-all focus:bg-white">
                                    <option value="">Select State First</option>
                                </select>
                            </div>
                            <button id="btn-next" disabled class="w-full ${btnColor} text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200/50 transition-all mt-4 opacity-50 cursor-not-allowed">
                                Continue Selection
                            </button>
                        </div>
                    ` : `
                        <!-- SLIDE 2: FACILITY & AUTH -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confirm Facility</label>
                                <select id="login-hospital" class="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all">
                                    <option value="">Searching Hospitals...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Security Key</label>
                                <input id="login-password" type="password" class="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="••••••••">
                            </div>
                            <div id="login-error" class="hidden text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                                Incorrect Credentials
                            </div>
                            <button id="btn-login" class="w-full ${btnColor} text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200/50 transition-all mt-4 transform active:scale-95">
                                Secure Login
                            </button>
                        </div>
                    `}

                    <p class="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-wider font-bold">
                        <i data-lucide="shield-check" class="w-3 h-3 inline mr-1"></i> End-to-End Encryption Active
                    </p>
                </div>
            `;

            lucide.createIcons();
            attachHandlers();
        };

        const attachHandlers = () => {
            const backBtn = container.querySelector('#btn-back-hub');
            backBtn.onclick = () => loginStep === 1 ? setView('landing') : setLoginStep(1);

            if (loginStep === 1) {
                const countrySelect = container.querySelector('#login-country');
                const stateSelect = container.querySelector('#login-state');
                const citySelect = container.querySelector('#login-city');
                const nextBtn = container.querySelector('#btn-next');

                const updateNextBtn = () => {
                    if (formData.country && formData.state && formData.city) {
                        nextBtn.disabled = false;
                        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    } else {
                        nextBtn.disabled = true;
                        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                };

                (async () => {
                    const countries = await fetchCountries();
                    const india = countries.find(c => c.name === "India");
                    const others = countries.filter(c => c.name !== "India").sort((a, b) => a.name.localeCompare(b.name));
                    const sorted = india ? [india, ...others] : others;

                    countrySelect.innerHTML = `<option value="" disabled selected>Select Country</option>` +
                        sorted.map(c => `<option value="${c.name}" ${formData.country === c.name ? 'selected' : ''}>${c.name}</option>`).join('');

                    if (formData.country) countrySelect.onchange();
                })();

                countrySelect.onchange = async () => {
                    formData.country = countrySelect.value;
                    stateSelect.innerHTML = `<option>Loading...</option>`;
                    stateSelect.disabled = true;
                    const states = await fetchStates(formData.country);
                    if (states.length) {
                        stateSelect.innerHTML = `<option value="" disabled selected>Select State</option>` +
                            states.map(s => `<option value="${s.name}" ${formData.state === s.name ? 'selected' : ''}>${s.name}</option>`).join('');
                        stateSelect.disabled = false;
                        stateSelect.classList.remove('bg-slate-100', 'text-slate-400');
                        if (formData.state) stateSelect.onchange();
                    }
                    updateNextBtn();
                };

                stateSelect.onchange = async () => {
                    formData.state = stateSelect.value;
                    citySelect.innerHTML = `<option>Loading...</option>`;
                    citySelect.disabled = true;
                    const cities = await fetchCities(formData.country, formData.state);
                    if (cities.length) {
                        citySelect.innerHTML = `<option value="" disabled selected>Select City</option>` +
                            cities.map(c => `<option value="${c}" ${formData.city === c ? 'selected' : ''}>${c}</option>`).join('');
                        citySelect.disabled = false;
                        citySelect.classList.remove('bg-slate-100', 'text-slate-400');
                    }
                    updateNextBtn();
                };

                citySelect.onchange = () => {
                    formData.city = citySelect.value;
                    updateNextBtn();
                };

                nextBtn.onclick = () => setLoginStep(2);
            } else {
                const hospitalSelect = container.querySelector('#login-hospital');
                const passInput = container.querySelector('#login-password');
                const loginBtn = container.querySelector('#btn-login');
                const errorMsg = container.querySelector('#login-error');

                (async () => {
                    const query = `${formData.city}, ${formData.state}, ${formData.country}`;
                    const coords = await window.App.API.getCoordinates(query);
                    if (coords) {
                        const data = await window.App.API.getNearbyHospitals(coords.lat, coords.lng);
                        if (data.results && data.results.length > 0) {
                            hospitalSelect.innerHTML = `<option value="" disabled selected>Choose Hospital</option>` +
                                data.results.map(h => `<option value="${h.name}">${h.name}</option>`).join('');
                        } else {
                            hospitalSelect.innerHTML = `<option>No Hospitals Found</option>`;
                        }
                    } else {
                        hospitalSelect.innerHTML = `<option>Location Error</option>`;
                    }
                })();

                loginBtn.onclick = () => {
                    if (!hospitalSelect.value || !passInput.value) {
                        errorMsg.textContent = "Please set facility and password";
                        errorMsg.classList.remove('hidden');
                        return;
                    }

                    if (passInput.value.length < 3) {
                        errorMsg.textContent = "Security Key too short";
                        errorMsg.classList.remove('hidden');
                        return;
                    }

                    window.App.Store.setLoggedLocation(
                        formData.country,
                        formData.state,
                        formData.city,
                        hospitalSelect.value
                    );
                    setView(role);
                };
            }
        };

        render();
        return container;
    };
})();

(function () {
    window.App.Views.Login = function () {
        const { state, setView } = window.App.Store;
        const { fetchCountries, fetchStates, fetchCities } = window.App.API;

        const role = state.auth ? state.auth.targetRole : 'doctor'; // Default
        const roleName = role === 'doctor' ? 'Doctor' : 'Staff/Admin';
        const brandColor = role === 'doctor' ? 'text-cyan-600' : 'text-slate-600';
        const btnColor = role === 'doctor' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-slate-700 hover:bg-slate-800';

        const container = document.createElement('div');
        container.className = "min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans";

        container.innerHTML = `
            <!-- Atmospheric Background -->
            <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-900/20 rounded-full blur-[140px]"></div>
            <div class="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]"></div>

            <button id="btn-back" class="absolute top-8 left-8 flex items-center text-slate-500 hover:text-white font-bold transition-colors z-30 group">
                <i data-lucide="arrow-left" class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"></i> Back to Hub
            </button>

            <div class="w-full max-w-lg relative z-20" data-aos="zoom-in" data-aos-duration="800">
                <div class="absolute inset-0 bg-brand-500/10 rounded-[3rem] blur-3xl"></div>
                
                <div class="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] shadow-2xl isolate overflow-hidden">
                    <!-- Glass Shine -->
                    <div class="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

                    <div class="text-center mb-10">
                        <div class="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <i data-lucide="${role === 'doctor' ? 'stethoscope' : 'shield-check'}" class="w-10 h-10 ${role === 'doctor' ? 'text-indigo-400' : 'text-emerald-400'}"></i>
                        </div>
                        <h2 class="text-4xl font-black text-white tracking-tight">${roleName} Access</h2>
                        <p class="text-slate-400 mt-2 font-medium tracking-wide uppercase text-[10px]">Secure Medical Gateway • SmartCare v2.0</p>
                    </div>

                    <div class="space-y-6">
                        <!-- Location Drill -->
                        <div>
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Facility Intelligence</label>
                            <div class="space-y-3">
                                <select id="login-country" class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 transition-all text-sm appearance-none cursor-pointer">
                                    <option value="" class="bg-dark-950">Loading Countries...</option>
                                </select>
                                <div class="grid grid-cols-2 gap-3">
                                    <select id="login-state" disabled class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 outline-none transition-all text-sm appearance-none cursor-not-allowed">
                                        <option value="" class="bg-dark-950">Select State</option>
                                    </select>
                                    <select id="login-city" disabled class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 outline-none transition-all text-sm appearance-none cursor-not-allowed">
                                        <option value="" class="bg-dark-950">Select City</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Hospital Name -->
                        <div class="space-y-2">
                            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional ID</label>
                            <div class="relative group">
                                <i data-lucide="hospital" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors"></i>
                                <input id="login-hospital" type="text" class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:bg-white/10 focus:border-brand-500/50 transition-all text-sm" placeholder="e.g. Apollo Super Specialty">
                            </div>
                        </div>

                        <!-- Password -->
                        <div class="space-y-2">
                             <label class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Access Key</label>
                             <div class="relative group">
                                <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors"></i>
                                <input id="login-password" type="password" class="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:bg-white/10 focus:border-brand-500/50 transition-all text-sm" placeholder="••••••••">
                            </div>
                        </div>

                        <div id="login-error" class="hidden text-red-400 text-xs font-bold text-center bg-red-500/10 border border-red-500/20 py-3 rounded-xl backdrop-blur-md">
                            Validation Failure: Incorrect Credentials
                        </div>

                        <button id="btn-login" class="w-full relative group mt-4 overflow-hidden rounded-2xl p-[2px]">
                            <div class="absolute inset-0 bg-gradient-to-r ${role === 'doctor' ? 'from-indigo-500 to-cyan-400' : 'from-emerald-500 to-teal-400'} animate-gradient-x"></div>
                            <div class="relative bg-dark-950 p-4 rounded-[14px] flex items-center justify-center font-black tracking-widest text-white uppercase text-sm group-hover:bg-transparent transition-colors duration-300">
                                Authenticate Profile
                            </div>
                        </button>
                        
                         <p class="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-6">
                            Secure 256-bit AES End-to-End Encryption
                        </p>
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

        // Initialize AOS & Icons
        setTimeout(() => {
            if (typeof AOS !== 'undefined') AOS.init({ once: true });
            lucide.createIcons();
        }, 100);

        return container;
    };
})();

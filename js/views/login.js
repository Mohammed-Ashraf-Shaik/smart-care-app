(function () {
    window.App.Views.Login = () => {
        const { setView, setLogin, setLoggedLocation } = window.App.Store;
        const { fetchCountries, fetchStates, fetchCities } = window.App.API;

        const role = window.App.Store.state.auth?.targetRole || 'doctor';
        const brandColor = role === 'doctor' ? '#2563eb' : '#059669'; // Blue vs Emerald
        const container = document.createElement('div');
        container.className = 'min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-brand-100 selection:text-brand-900';
        container.style.fontFamily = "'Inter', sans-serif";

        // Internal State
        let currentStep = 'identifier'; // identifier, password, signup, location, recovery
        let recoverySubStep = 'hint'; // hint, reset
        let identifier = '';
        let email = '';
        let hospital = '';
        let password = '';
        let selectedCountry = 'India';
        let selectedState = '';
        let selectedCity = '';

        const renderAuth = () => {
            container.innerHTML = `
                <!-- Back to Home -->
                <button id="btn-back-landing" class="absolute top-8 left-8 group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black transition-all z-50">
                    <div class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    </div>
                    <span class="text-[10px] tracking-widest uppercase">Go Back</span>
                </button>

                <div class="w-full max-w-[450px] bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden transition-all duration-500 ease-out">
                    <!-- Progress Bar (Subtle) -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-slate-100">
                        <div id="auth-progress" class="h-full bg-brand-600 transition-all duration-700" style="width: ${currentStep === 'identifier' ? '25%' : currentStep === 'password' ? '50%' : currentStep === 'location' ? '75%' : '100%'}"></div>
                    </div>

                    <div id="auth-step-container" class="space-y-8 animate-fade-in">
                        <!-- Brand Identity -->
                        <div class="flex flex-col items-center gap-4">
                            <div class="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/10 group animate-float">
                                <i data-lucide="heart-pulse" class="w-10 h-10 text-brand-600 transition-transform group-hover:scale-110"></i>
                            </div>
                            <h1 class="text-3xl font-black text-slate-800 tracking-tight">SmartCare <span class="text-brand-600">HQMS</span></h1>
                        </div>

                        ${currentStep === 'identifier' ? renderIdentifierStep() :
                    currentStep === 'password' ? renderPasswordStep() :
                        currentStep === 'recovery' ? renderRecoveryStep() :
                            currentStep === 'signup' ? renderSignupStep() :
                                currentStep === 'location' ? renderLocationStep() : ''}
                    </div>

                    <!-- Footer Links -->
                    <div class="mt-12 flex justify-end items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div class="flex gap-4">
                            <a href="#" class="hover:text-slate-600">Privacy</a>
                            <a href="#" class="hover:text-slate-600">Terms</a>
                        </div>
                    </div>
                </div>
            `;

            // Re-bind Events
            bindEvents();
            lucide.createIcons();
        };

        const renderIdentifierStep = () => `
            <div class="space-y-8">
                <div class="text-center">
                    <h2 class="text-2xl font-black text-slate-800">Sign in</h2>
                    <p class="text-slate-500 font-medium mt-1">Use your Professional Account (Doctor/Staff)</p>
                </div>

                <div class="space-y-4">
                    <div class="group relative">
                        <i data-lucide="mail" class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                        <input id="input-identifier" type="text" value="${identifier}" class="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-bold placeholder:text-slate-300" placeholder="Email or Professional ID">
                    </div>
                    <div id="error-msg" class="hidden text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl border border-rose-100">Invalid identifier</div>
                </div>

                <div class="flex flex-col gap-6">
                    <button id="btn-create-account" class="text-brand-600 font-black text-xs uppercase tracking-widest self-start hover:text-brand-700 transition-colors">Create account</button>
                    <div class="flex justify-end">
                        <button id="btn-next" class="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-1 transition-all active:scale-95">Next</button>
                    </div>
                </div>
            </div>
        `;

        const renderPasswordStep = () => `
            <div class="space-y-8 animate-slide-in-right">
                <div class="text-center">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full mb-4">
                        <div class="w-2 h-2 rounded-full bg-brand-500"></div>
                        <span class="text-xs font-black text-slate-600 uppercase tracking-widest">${identifier}</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800">Welcome back</h2>
                    <p class="text-slate-500 font-medium mt-1">Enter your credential password</p>
                </div>

                <div class="space-y-4">
                    <div class="group relative">
                        <i data-lucide="lock" class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors"></i>
                        <input id="input-password" type="password" class="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg font-bold placeholder:text-slate-300" placeholder="Password" autofocus>
                    </div>
                    <button id="btn-forgot-password" class="text-brand-600 font-black text-[10px] uppercase tracking-widest hover:text-brand-700 transition-colors">Forgot password?</button>
                    <div id="error-msg" class="hidden text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl border border-rose-100">Incorrect password</div>
                </div>

                <div class="flex justify-between items-center">
                    <button id="btn-back-step" class="text-brand-600 font-black text-xs uppercase tracking-widest hover:text-brand-700 transition-colors">Back</button>
                    <button id="btn-next" class="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-1 transition-all active:scale-95">Sign In</button>
                </div>
            </div>
        `;

        const renderRecoveryStep = () => `
            <div class="space-y-6 animate-slide-in-right">
                <div class="text-center">
                    <h2 class="text-2xl font-black text-slate-800">Account Recovery</h2>
                    <p class="text-slate-500 font-medium mt-1">${recoverySubStep === 'hint' ? 'Verify your identity' : 'Create new password'}</p>
                </div>

                <div class="space-y-4">
                    ${recoverySubStep === 'hint' ? `
                        <div class="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                            <p class="text-blue-900 text-xs font-medium leading-relaxed">Safety Check: Enter the <strong>first 2 letters</strong> of your previous password to continue.</p>
                        </div>
                        <input id="input-hint" type="text" maxlength="2" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold text-center text-2xl tracking-[0.5em] uppercase" placeholder="XX">
                    ` : `
                        <input id="input-new-pass" type="password" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold" placeholder="New Password">
                        <input id="input-confirm-pass" type="password" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white outline-none font-bold" placeholder="Confirm Password">
                    `}
                    <div id="error-msg" class="hidden text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl border border-rose-100">Verification failed</div>
                </div>

                <div class="flex justify-between items-center">
                    <button id="btn-back-pass" class="text-brand-600 font-black text-xs uppercase tracking-widest hover:text-brand-700 transition-colors">Abort</button>
                    <button id="btn-recover-next" class="bg-brand-600 text-white px-10 py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-xl hover:bg-brand-700 transition-all">${recoverySubStep === 'hint' ? 'Verify' : 'Reset Password'}</button>
                </div>
            </div>
        `;

        const renderSignupStep = () => `
            <div class="space-y-6 animate-slide-in-right">
                <div class="text-center">
                    <h2 class="text-2xl font-black text-slate-800">Create Account</h2>
                    <p class="text-slate-500 font-medium mt-1">Join the SmartCare Network</p>
                </div>

                <div class="space-y-3">
                    <input id="reg-hospital" type="text" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-300" placeholder="Facility Name (e.g., City Hospital)">
                    <input id="reg-email" type="email" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-300" placeholder="Professional Email">
                    <input id="reg-password" type="password" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-300" placeholder="Create Password (Min 8 characters)">
                    <div id="error-msg" class="hidden text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 p-4 rounded-xl border border-rose-100">Invalid registration data</div>
                </div>

                <div class="flex justify-between items-center">
                    <button id="btn-back-identifier" class="text-brand-600 font-black text-xs uppercase tracking-widest hover:text-brand-700 transition-colors">Sign in instead</button>
                    <button id="btn-register" class="bg-brand-600 text-white px-10 py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-xl hover:bg-brand-700 transition-all">Register</button>
                </div>
            </div>
        `;

        const renderLocationStep = () => `
            <div class="space-y-6 animate-slide-in-right">
                <div class="text-center">
                    <h2 class="text-2xl font-black text-slate-800">Session Setup</h2>
                    <p class="text-slate-500 font-medium mt-1">Confirm login facility location</p>
                </div>

                <div class="space-y-4">
                    <button id="btn-live-gps" class="w-full flex items-center p-5 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors group">
                        <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <i data-lucide="map-pin" class="text-blue-600 w-6 h-6"></i>
                        </div>
                        <div class="ml-4 text-left">
                            <h3 class="font-black text-slate-800 text-sm uppercase tracking-wider">Detect GPS</h3>
                            <p class="text-[10px] text-blue-500 font-black uppercase tracking-widest">Automatic Fetch</p>
                        </div>
                    </button>

                    <div class="space-y-3">
                        <select id="sel-country" class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:border-brand-500"></select>
                        <div class="grid grid-cols-2 gap-3">
                            <select id="sel-state" disabled class="px-5 py-4 bg-slate-100/50 border border-slate-100 rounded-xl font-bold text-slate-300 outline-none"></select>
                            <select id="sel-city" disabled class="px-5 py-4 bg-slate-100/50 border border-slate-100 rounded-xl font-bold text-slate-300 outline-none"></select>
                        </div>
                    </div>
                </div>

                <button id="btn-complete" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase shadow-2xl hover:bg-black transition-all">Submit & Start Session</button>
            </div>
        `;

        const bindEvents = () => {
            const btnNext = container.querySelector('#btn-next');
            const btnBackStep = container.querySelector('#btn-back-step');
            const btnCreate = container.querySelector('#btn-create-account');
            const btnRegister = container.querySelector('#btn-register');
            const btnComplete = container.querySelector('#btn-complete');
            const btnBackLand = container.querySelector('#btn-back-landing');

            if (btnBackLand) btnBackLand.onclick = () => {
                if (currentStep === 'identifier') setView('landing');
                else if (currentStep === 'password') { currentStep = 'identifier'; renderAuth(); }
                else if (currentStep === 'signup') { currentStep = 'identifier'; renderAuth(); }
                else if (currentStep === 'recovery') { currentStep = 'password'; renderAuth(); }
                else if (currentStep === 'location') { currentStep = 'password'; renderAuth(); }
            };

            if (currentStep === 'identifier') {
                btnCreate.onclick = () => { currentStep = 'signup'; renderAuth(); };
                btnNext.onclick = async () => {
                    const input = container.querySelector('#input-identifier');
                    if (!input.value) return showError("Email or ID required");

                    // Loading State
                    btnNext.disabled = true;
                    btnNext.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>`;
                    lucide.createIcons();

                    const exists = await window.App.DB.checkEmailExists(input.value);

                    if (exists.success === false && exists.error) {
                        showError(exists.error);
                        btnNext.disabled = false;
                        btnNext.innerHTML = 'Next';
                        lucide.createIcons();
                        return;
                    }

                    if (!exists.success) {
                        showError("Account not found. Please sign up.");
                        btnNext.disabled = false;
                        btnNext.innerHTML = 'Next';
                        lucide.createIcons();
                        return;
                    }

                    identifier = input.value;
                    currentStep = 'password';
                    renderAuth();
                };
            }

            if (currentStep === 'password') {
                btnBackStep.onclick = () => { currentStep = 'identifier'; renderAuth(); };
                container.querySelector('#btn-forgot-password').onclick = () => {
                    currentStep = 'recovery';
                    recoverySubStep = 'hint';
                    renderAuth();
                };
                btnNext.onclick = async () => {
                    const input = container.querySelector('#input-password');
                    if (!input.value) return showError("Password required");
                    password = input.value;

                    // Loading State
                    btnNext.disabled = true;
                    btnNext.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
                    lucide.createIcons();

                    const res = await window.App.DB.checkCredentials('', identifier, password, role);
                    if (res.success) {
                        hospital = res.user.hospital;
                        email = res.user.email;
                        currentStep = 'location';
                        renderAuth();
                    } else {
                        showError(res.error);
                        btnNext.disabled = false;
                        btnNext.innerHTML = 'Sign In';
                        lucide.createIcons();
                    }
                };
            }

            if (currentStep === 'recovery') {
                container.querySelector('#btn-back-pass').onclick = () => { currentStep = 'password'; renderAuth(); };
                const btnRecNext = container.querySelector('#btn-recover-next');

                btnRecNext.onclick = async () => {
                    if (recoverySubStep === 'hint') {
                        const hint = container.querySelector('#input-hint').value;
                        if (hint.length < 2) return showError("Enter 2 letters");

                        btnRecNext.disabled = true;
                        const res = await window.App.DB.verifyPasswordHint(identifier, hint);
                        if (res.success) {
                            recoverySubStep = 'reset';
                            renderAuth();
                        } else {
                            showError(res.error);
                            btnRecNext.disabled = false;
                        }
                    } else {
                        const n1 = container.querySelector('#input-new-pass').value;
                        const n2 = container.querySelector('#input-confirm-pass').value;

                        if (!n1 || n1.length < 8) return showError("Min 8 characters");
                        if (n1 !== n2) return showError("Passwords match error");

                        btnRecNext.disabled = true;
                        const res = await window.App.DB.resetPassword(identifier, n1);
                        if (res.success) {
                            alert("Password updated. Please sign in.");
                            currentStep = 'password';
                            renderAuth();
                        } else {
                            showError(res.error);
                            btnRecNext.disabled = false;
                        }
                    }
                };
            }

            if (currentStep === 'signup') {
                container.querySelector('#btn-back-identifier').onclick = () => { currentStep = 'identifier'; renderAuth(); };
                btnRegister.onclick = async () => {
                    const h = container.querySelector('#reg-hospital').value;
                    const e = container.querySelector('#reg-email').value;
                    const p = container.querySelector('#reg-password').value;

                    if (!h || !e || !p) return showError("Fill all fields");
                    if (p.length < 8) return showError("Password too short");

                    const res = await window.App.DB.registerProfessional({ hospital: h, email: e, password: p, role: role });
                    if (res.success) {
                        alert("Account created successfully. Please sign in.");
                        currentStep = 'identifier';
                        renderAuth();
                    } else {
                        showError(res.error);
                    }
                };
            }

            if (currentStep === 'location') {
                const cSel = container.querySelector('#sel-country');
                const sSel = container.querySelector('#sel-state');
                const tSel = container.querySelector('#sel-city');

                // Fill Countries
                fetchCountries().then(list => {
                    const sorted = list.sort((a, b) => a.name.localeCompare(b.name));
                    cSel.innerHTML = '<option disabled selected>Country</option>' + sorted.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
                });

                cSel.onchange = async () => {
                    sSel.disabled = true; sSel.innerHTML = '<option>Loading...</option>';
                    const states = await fetchStates(cSel.value);
                    sSel.innerHTML = '<option disabled selected>State</option>' + states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
                    sSel.disabled = false;
                    sSel.classList.remove('bg-slate-100/50', 'text-slate-300');
                    sSel.classList.add('bg-white', 'text-slate-900');
                };

                sSel.onchange = async () => {
                    tSel.disabled = true; tSel.innerHTML = '<option>Loading...</option>';
                    const cities = await fetchCities(cSel.value, sSel.value);
                    tSel.innerHTML = '<option disabled selected>City</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
                    tSel.disabled = false;
                    tSel.classList.remove('bg-slate-100/50', 'text-slate-300');
                    tSel.classList.add('bg-white', 'text-slate-900');
                };

                container.querySelector('#btn-live-gps').onclick = () => {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        const loc = await window.App.API.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                        if (loc) {
                            cSel.value = loc.country;
                            await cSel.onchange();
                            sSel.value = loc.state;
                            await sSel.onchange();
                            tSel.value = loc.city;
                        }
                    });
                };

                btnComplete.onclick = () => {
                    if (!cSel.value || !sSel.value || !tSel.value) return alert("Please confirm location");
                    setLogin(email);
                    setLoggedLocation(cSel.value, sSel.value, tSel.value, hospital);
                    setView(role);
                };
            }
        };

        const showError = (msg) => {
            const err = container.querySelector('#error-msg');
            if (err) {
                err.textContent = msg;
                err.classList.remove('hidden');
                err.classList.add('animate-shake');
            }
        };

        // Add Animations to Head
        if (!document.getElementById('auth-animations')) {
            const style = document.createElement('style');
            style.id = 'auth-animations';
            style.textContent = `
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.2s ease-in-out 3; }
            `;
            document.head.appendChild(style);
        }

        renderAuth();
        return container;
    };
})();

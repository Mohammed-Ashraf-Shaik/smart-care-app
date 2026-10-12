(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Login = function () {
        const { state, setView, setAuthTarget, setLogin, setLoggedLocation } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';

        const requestedMode = new URLSearchParams(window.location.search).get('mode');
        const requestedRole = new URLSearchParams(window.location.search).get('role');
        let role = requestedRole || state.auth?.targetRole || 'patient',
            isSignUp = requestedMode === 'signup',
            recoveryState = window.location.hash.includes('type=recovery') ? 'update-password' : null,
            email = '', password = '', facility = '', name = '',
            message = '', messageType = '',
            signInPwdVisible = false,
            signUpPwdVisible = false;

        function applyRoleCredentials() {
            if (role === 'patient') {
                email = 'patient@gmail.com';
                password = '1234';
                facility = '';
                name = 'Asha Rao';
            } else if (role === 'doctor') {
                email = 'hospital@gmail.com';
                password = '1234';
                facility = 'SmartCare Community Hospital';
                name = 'Dr. Vikram Seth';
            } else if (role === 'staff') {
                email = 'admin@gmail.com';
                password = '1234';
                facility = 'SmartCare Community Hospital';
                name = 'Reception Ops';
            }
        }

        applyRoleCredentials();
        render();
        return container;

        function render() {
            container.innerHTML = `
                <div class="flow-topbar auth-topbar" data-section="auth-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Role-based access</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        <a class="back-link" data-route="/" href="/">${icon('arrow-left', 16)} Back home</a>
                    </div>
                </div>

                <main class="auth-slider-wrapper" data-section="portal-login" aria-labelledby="auth-main-title">
                    <div class="auth-slider-card ${isSignUp ? 'active' : ''}" id="auth-slider-card">
                        <!-- Mobile Switcher Tabs (Visible on screens <= 768px) -->
                        <div class="mobile-slider-tabs" role="tablist" aria-label="Authentication switch">
                            <button type="button" role="tab" aria-selected="${!isSignUp}" class="mobile-slider-btn ${!isSignUp ? 'active' : ''}" id="mob-toggle-signin">
                                ${icon('log-in', 15)} Sign In
                            </button>
                            <button type="button" role="tab" aria-selected="${isSignUp}" class="mobile-slider-btn ${isSignUp ? 'active' : ''}" id="mob-toggle-signup">
                                ${icon('user-plus', 15)} Sign Up
                            </button>
                        </div>

                        <!-- SIGN UP FORM CONTAINER (Right side on active desktop state) -->
                        <div class="auth-form-container auth-sign-up-container">
                            <form id="signup-form" class="auth-form-card" novalidate>
                                <h1>Create Account</h1>
                                <p class="auth-form-subtitle" id="signup-subtitle">
                                    ${role === 'patient' ? 'Register as a patient for personal health tracking & live queue tickets.' : role === 'doctor' ? 'Register your hospital clinician care workspace.' : 'Register your hospital operations & desk admin portal.'}
                                </p>

                                ${renderRoleSelector('signup')}

                                ${message && isSignUp ? `<div class="auth-message ${messageType}" role="alert">${esc(message)}</div>` : ''}

                                <div class="auth-input-group">
                                    <div class="field" id="signup-name-group" style="${role === 'patient' ? '' : 'display:none;'}">
                                        <label for="signup-name">Full Name <span>*</span></label>
                                        <input id="signup-name" type="text" autocomplete="name" value="${esc(name)}" placeholder="e.g. Asha Rao" ${role === 'patient' ? 'required' : ''}>
                                    </div>

                                    <div class="field" id="signup-facility-group" style="${role !== 'patient' ? '' : 'display:none;'}">
                                        <label for="signup-facility">Care centre name <span>*</span></label>
                                        <input id="signup-facility" type="text" autocomplete="organization" value="${esc(facility)}" placeholder="e.g. SmartCare Community Hospital" ${role !== 'patient' ? 'required' : ''}>
                                    </div>

                                    <div class="field">
                                        <label for="signup-email">${role === 'patient' ? 'Email address' : 'Work email'} <span>*</span></label>
                                        <input id="signup-email" type="email" autocomplete="email" value="${esc(email)}" placeholder="${role === 'patient' ? 'patient@gmail.com' : role === 'doctor' ? 'hospital@gmail.com' : 'admin@gmail.com'}" required>
                                    </div>

                                    <div class="field">
                                        <label for="signup-password">Create password <span>*</span></label>
                                        <div class="auth-password-wrapper">
                                            <input id="signup-password" type="${signUpPwdVisible ? 'text' : 'password'}" autocomplete="new-password" value="${esc(password)}" placeholder="Password (e.g. 1234)" required>
                                            <button type="button" class="auth-password-toggle" id="signup-toggle-pwd" aria-label="Toggle password visibility">
                                                ${icon(signUpPwdVisible ? 'eye-off' : 'eye', 16)}
                                            </button>
                                        </div>
                                    </div>

                                    <div class="field">
                                        <label for="signup-confirm">Confirm password <span>*</span></label>
                                        <input id="signup-confirm" type="password" autocomplete="new-password" value="${esc(password)}" placeholder="Repeat your password" required>
                                    </div>
                                </div>

                                <button type="submit" class="auth-btn-submit" id="btn-signup-submit">
                                    <span>${role === 'patient' ? 'CREATE PATIENT ACCOUNT' : role === 'doctor' ? 'CREATE HOSPITAL ACCOUNT' : 'CREATE OPS ACCOUNT'}</span>
                                    ${icon('arrow-right', 16)}
                                </button>

                                <div class="mobile-auth-switch">
                                    <span>Already registered?</span>
                                    <button type="button" id="mob-switch-to-signin">Sign In</button>
                                </div>
                            </form>
                        </div>

                        <!-- SIGN IN / RECOVERY FORM CONTAINER (Left side on desktop default state) -->
                        <div class="auth-form-container auth-sign-in-container">
                            ${recoveryState === 'update-password' ? renderUpdatePasswordView() : recoveryState === 'recovery' ? renderRecoveryView() : renderSignInView()}
                        </div>

                        <!-- SLIDING MORPH TOGGLE OVERLAY (Desktop only) -->
                        <div class="auth-toggle-container">
                            <div class="auth-toggle">
                                <!-- Left Panel (Shown during Sign Up -> prompts user to Sign In) -->
                                <div class="auth-toggle-panel auth-toggle-left">
                                    <div class="toggle-icon-badge">${icon('shield-check', 28)}</div>
                                    <h1>Welcome Back!</h1>
                                    <p>Enter your credentials to continue access to your SmartCare health workspace.</p>
                                    <button type="button" class="btn-toggle-ghost" id="desktop-to-signin">
                                        ${icon('log-in', 16)} SIGN IN
                                    </button>
                                </div>

                                <!-- Right Panel (Shown during Sign In -> prompts user to Sign Up) -->
                                <div class="auth-toggle-panel auth-toggle-right">
                                    <div class="toggle-icon-badge">${icon('sparkles', 28)}</div>
                                    <h1>Hello, Friend!</h1>
                                    <p>Register with your personal details to use all SmartCare healthcare features.</p>
                                    <button type="button" class="btn-toggle-ghost" id="desktop-to-signup">
                                        ${icon('user-plus', 16)} SIGN UP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            `;

            bindEvents();
            window.App.UI.bindTopbarControls(container);
            if (window.lucide) window.lucide.createIcons();
        }

        function renderRoleSelector(prefix) {
            return `
                <div class="compact-role-selector" role="tablist" aria-label="Select access role">
                    <button type="button" class="compact-role-btn ${role === 'patient' ? 'active' : ''}" data-role="patient" data-prefix="${prefix}">
                        ${icon('user-round', 14)} <span>Patient</span>
                    </button>
                    <button type="button" class="compact-role-btn ${role === 'doctor' ? 'active' : ''}" data-role="doctor" data-prefix="${prefix}">
                        ${icon('hospital', 14)} <span>Hospital</span>
                    </button>
                    <button type="button" class="compact-role-btn ${role === 'staff' ? 'active' : ''}" data-role="staff" data-prefix="${prefix}">
                        ${icon('building-2', 14)} <span>Ops</span>
                    </button>
                </div>
            `;
        }

        function renderSignInView() {
            const patient = role === 'patient';
            return `
                <form id="signin-form" class="auth-form-card" novalidate>
                    <h1 id="auth-main-title">Sign In</h1>
                    <p class="auth-form-subtitle" id="signin-subtitle">
                        ${patient ? 'Sign in to access your digital health passport & queue tokens.' : role === 'doctor' ? 'Sign in to your clinician care workspace.' : 'Sign in to your hospital administration desk.'}
                    </p>

                    ${renderRoleSelector('signin')}

                    ${message && !isSignUp ? `<div class="auth-message ${messageType}" role="alert">${esc(message)}</div>` : ''}

                    <div class="auth-input-group">
                        <div class="field">
                            <label for="signin-email">${patient ? 'Email address' : 'Work email'} <span>*</span></label>
                            <input id="signin-email" type="email" autocomplete="username" value="${esc(email)}" placeholder="${patient ? 'patient@gmail.com' : role === 'doctor' ? 'hospital@gmail.com' : 'admin@gmail.com'}" required>
                        </div>

                        <div class="field" id="signin-facility-group" style="${patient ? 'display:none;' : ''}">
                            <label for="signin-facility">Care centre <span>*</span></label>
                            <input id="signin-facility" type="text" autocomplete="organization" value="${esc(facility)}" placeholder="e.g. SmartCare Community Hospital" ${patient ? '' : 'required'}>
                        </div>

                        <div class="field">
                            <label for="signin-password">Password <span>*</span></label>
                            <div class="auth-password-wrapper">
                                <input id="signin-password" type="${signInPwdVisible ? 'text' : 'password'}" autocomplete="current-password" value="${esc(password)}" placeholder="Enter your password (e.g. 1234)" required>
                                <button type="button" class="auth-password-toggle" id="signin-toggle-pwd" aria-label="Toggle password visibility">
                                    ${icon(signInPwdVisible ? 'eye-off' : 'eye', 16)}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="auth-forgot-link" id="btn-show-recovery">Forgot Your Password?</button>

                    <button type="submit" class="auth-btn-submit" id="btn-signin-submit">
                        <span>${patient ? 'SIGN IN AS PATIENT' : role === 'doctor' ? 'SIGN IN TO HOSPITAL' : 'SIGN IN TO OPS PORTAL'}</span>
                        ${icon('arrow-right', 16)}
                    </button>

                    <div class="mobile-auth-switch">
                        <span>Don't have an account?</span>
                        <button type="button" id="mob-switch-to-signup">Sign Up</button>
                    </div>
                </form>
            `;
        }

        function renderRecoveryView() {
            return `
                <form id="recovery-form" class="auth-form-card" novalidate>
                    <h1>Reset Password</h1>
                    <p class="auth-form-subtitle">We will send a secure password recovery link to your registered email address.</p>

                    ${message ? `<div class="auth-message ${messageType}" role="alert">${esc(message)}</div>` : ''}

                    <div class="auth-input-group">
                        <div class="field">
                            <label for="recovery-email">Account email <span>*</span></label>
                            <input id="recovery-email" type="email" autocomplete="email" value="${esc(email)}" placeholder="name@carecentre.org" required>
                        </div>
                    </div>

                    <button type="submit" class="auth-btn-submit">
                        <span>SEND RESET LINK</span> ${icon('mail', 16)}
                    </button>

                    <button type="button" class="auth-forgot-link" id="btn-cancel-recovery" style="align-self:center;margin-top:1rem;">
                        ${icon('arrow-left', 14)} Return to sign in
                    </button>
                </form>
            `;
        }

        function renderUpdatePasswordView() {
            return `
                <form id="update-password-form" class="auth-form-card" novalidate>
                    <h1>Set New Password</h1>
                    <p class="auth-form-subtitle">Choose a secure password of at least 4 characters.</p>

                    ${message ? `<div class="auth-message ${messageType}" role="alert">${esc(message)}</div>` : ''}

                    <div class="auth-input-group">
                        <div class="field">
                            <label for="update-new-password">New password <span>*</span></label>
                            <input id="update-new-password" type="password" autocomplete="new-password" required minlength="4" placeholder="At least 4 characters">
                        </div>
                        <div class="field">
                            <label for="update-confirm-password">Confirm password <span>*</span></label>
                            <input id="update-confirm-password" type="password" autocomplete="new-password" required minlength="4" placeholder="Repeat your password">
                        </div>
                    </div>

                    <button type="submit" class="auth-btn-submit">
                        <span>UPDATE PASSWORD</span> ${icon('key-round', 16)}
                    </button>
                </form>
            `;
        }

        function bindEvents() {
            const card = container.querySelector('#auth-slider-card');

            // Morph Toggle Handlers (Desktop + Mobile)
            const desktopToSignUp = container.querySelector('#desktop-to-signup');
            const desktopToSignIn = container.querySelector('#desktop-to-signin');
            const mobToggleSignUp = container.querySelector('#mob-toggle-signup');
            const mobToggleSignIn = container.querySelector('#mob-toggle-signin');
            const mobSwitchToSignUp = container.querySelector('#mob-switch-to-signup');
            const mobSwitchToSignIn = container.querySelector('#mob-switch-to-signin');

            const switchToSignUp = () => {
                readActiveFields();
                isSignUp = true;
                message = '';
                card?.classList.add('active');
                updateMobileTabs(true);
                syncUrl();
                container.querySelector('#signup-email')?.focus();
            };

            const switchToSignIn = () => {
                readActiveFields();
                isSignUp = false;
                recoveryState = null;
                message = '';
                card?.classList.remove('active');
                updateMobileTabs(false);
                syncUrl();
                container.querySelector('#signin-email')?.focus();
            };

            if (desktopToSignUp) desktopToSignUp.onclick = switchToSignUp;
            if (desktopToSignIn) desktopToSignIn.onclick = switchToSignIn;
            if (mobToggleSignUp) mobToggleSignUp.onclick = switchToSignUp;
            if (mobToggleSignIn) mobToggleSignIn.onclick = switchToSignIn;
            if (mobSwitchToSignUp) mobSwitchToSignUp.onclick = switchToSignUp;
            if (mobSwitchToSignIn) mobSwitchToSignIn.onclick = switchToSignIn;

            // Password Eye Toggles
            const signinEye = container.querySelector('#signin-toggle-pwd');
            if (signinEye) {
                signinEye.onclick = () => {
                    const input = container.querySelector('#signin-password');
                    signInPwdVisible = !signInPwdVisible;
                    if (input) input.type = signInPwdVisible ? 'text' : 'password';
                    signinEye.innerHTML = icon(signInPwdVisible ? 'eye-off' : 'eye', 16);
                    if (window.lucide) window.lucide.createIcons();
                };
            }

            const signupEye = container.querySelector('#signup-toggle-pwd');
            if (signupEye) {
                signupEye.onclick = () => {
                    const input = container.querySelector('#signup-password');
                    signUpPwdVisible = !signUpPwdVisible;
                    if (input) input.type = signUpPwdVisible ? 'text' : 'password';
                    signupEye.innerHTML = icon(signUpPwdVisible ? 'eye-off' : 'eye', 16);
                    if (window.lucide) window.lucide.createIcons();
                };
            }

            // Compact Role Buttons - AUTOFILL CREDENTIALS & update fields dynamically
            container.querySelectorAll('[data-role]').forEach(btn => {
                btn.onclick = () => {
                    role = btn.dataset.role;
                    setAuthTarget(role);
                    message = '';
                    syncUrl();
                    applyRoleCredentials();

                    // Update active classes on all role buttons
                    container.querySelectorAll('[data-role]').forEach(b => {
                        b.classList.toggle('active', b.dataset.role === role);
                    });

                    // Update Sign In panel dynamic fields & autofill
                    const signinFacilityGrp = container.querySelector('#signin-facility-group');
                    const signinFacilityInput = container.querySelector('#signin-facility');
                    const signinEmailLabel = container.querySelector('label[for="signin-email"]');
                    const signinEmailInput = container.querySelector('#signin-email');
                    const signinPwdInput = container.querySelector('#signin-password');
                    const signinSubtitle = container.querySelector('#signin-subtitle');
                    const signinSubmitBtn = container.querySelector('#btn-signin-submit span');

                    if (signinFacilityGrp) signinFacilityGrp.style.display = role === 'patient' ? 'none' : '';
                    if (signinFacilityInput) {
                        signinFacilityInput.required = role !== 'patient';
                        signinFacilityInput.value = facility;
                    }
                    if (signinEmailLabel) signinEmailLabel.innerHTML = `${role === 'patient' ? 'Email address' : 'Work email'} <span>*</span>`;
                    if (signinEmailInput) {
                        signinEmailInput.placeholder = role === 'patient' ? 'patient@gmail.com' : role === 'doctor' ? 'hospital@gmail.com' : 'admin@gmail.com';
                        signinEmailInput.value = email;
                    }
                    if (signinPwdInput) {
                        signinPwdInput.value = password;
                    }
                    if (signinSubtitle) {
                        signinSubtitle.textContent = role === 'patient'
                            ? 'Sign in to access your digital health passport & queue tokens.'
                            : role === 'doctor'
                                ? 'Sign in to your clinician care workspace.'
                                : 'Sign in to your hospital administration desk.';
                    }
                    if (signinSubmitBtn) {
                        signinSubmitBtn.textContent = role === 'patient'
                            ? 'SIGN IN AS PATIENT'
                            : role === 'doctor'
                                ? 'SIGN IN TO HOSPITAL'
                                : 'SIGN IN TO OPS PORTAL';
                    }

                    // Update Sign Up panel dynamic fields & autofill
                    const signupNameGrp = container.querySelector('#signup-name-group');
                    const signupNameInput = container.querySelector('#signup-name');
                    const signupFacilityGrp = container.querySelector('#signup-facility-group');
                    const signupFacilityInput = container.querySelector('#signup-facility');
                    const signupEmailLabel = container.querySelector('label[for="signup-email"]');
                    const signupEmailInput = container.querySelector('#signup-email');
                    const signupPwdInput = container.querySelector('#signup-password');
                    const signupConfirmInput = container.querySelector('#signup-confirm');
                    const signupSubtitle = container.querySelector('#signup-subtitle');
                    const signupSubmitBtn = container.querySelector('#btn-signup-submit span');

                    if (signupNameGrp) signupNameGrp.style.display = role === 'patient' ? '' : 'none';
                    if (signupNameInput) {
                        signupNameInput.required = role === 'patient';
                        signupNameInput.value = name;
                    }
                    if (signupFacilityGrp) signupFacilityGrp.style.display = role !== 'patient' ? '' : 'none';
                    if (signupFacilityInput) {
                        signupFacilityInput.required = role !== 'patient';
                        signupFacilityInput.value = facility;
                    }
                    if (signupEmailLabel) signupEmailLabel.innerHTML = `${role === 'patient' ? 'Email address' : 'Work email'} <span>*</span>`;
                    if (signupEmailInput) {
                        signupEmailInput.placeholder = role === 'patient' ? 'patient@gmail.com' : role === 'doctor' ? 'hospital@gmail.com' : 'admin@gmail.com';
                        signupEmailInput.value = email;
                    }
                    if (signupPwdInput) {
                        signupPwdInput.value = password;
                    }
                    if (signupConfirmInput) {
                        signupConfirmInput.value = password;
                    }
                    if (signupSubtitle) {
                        signupSubtitle.textContent = role === 'patient'
                            ? 'Register as a patient for personal health tracking & live queue tickets.'
                            : role === 'doctor'
                                ? 'Register your hospital clinician care workspace.'
                                : 'Register your hospital operations & desk admin portal.';
                    }
                    if (signupSubmitBtn) {
                        signupSubmitBtn.textContent = role === 'patient'
                            ? 'CREATE PATIENT ACCOUNT'
                            : role === 'doctor'
                                ? 'CREATE HOSPITAL ACCOUNT'
                                : 'CREATE OPS ACCOUNT';
                    }
                };
            });

            // Password Recovery Toggles
            const showRecovery = container.querySelector('#btn-show-recovery');
            if (showRecovery) {
                showRecovery.onclick = () => {
                    readActiveFields();
                    recoveryState = 'recovery';
                    message = '';
                    render();
                };
            }

            const cancelRecovery = container.querySelector('#btn-cancel-recovery');
            if (cancelRecovery) {
                cancelRecovery.onclick = () => {
                    readActiveFields();
                    recoveryState = null;
                    message = '';
                    render();
                };
            }

            // Form Submissions
            bindSignInForm();
            bindSignUpForm();
            if (recoveryState === 'recovery') bindRecoveryForm();
            if (recoveryState === 'update-password') bindUpdatePasswordForm();
        }

        function updateMobileTabs(isUp) {
            const tabIn = container.querySelector('#mob-toggle-signin');
            const tabUp = container.querySelector('#mob-toggle-signup');
            if (tabIn && tabUp) {
                tabIn.classList.toggle('active', !isUp);
                tabIn.setAttribute('aria-selected', String(!isUp));
                tabUp.classList.toggle('active', isUp);
                tabUp.setAttribute('aria-selected', String(isUp));
            }
        }

        function readActiveFields() {
            const inEmail = container.querySelector('#signin-email');
            const upEmail = container.querySelector('#signup-email');
            const recEmail = container.querySelector('#recovery-email');
            const inFacility = container.querySelector('#signin-facility');
            const upFacility = container.querySelector('#signup-facility');
            const inPwd = container.querySelector('#signin-password');
            const upPwd = container.querySelector('#signup-password');
            const upName = container.querySelector('#signup-name');

            if (inEmail?.value) email = inEmail.value.trim();
            else if (upEmail?.value) email = upEmail.value.trim();
            else if (recEmail?.value) email = recEmail.value.trim();

            if (inFacility?.value) facility = inFacility.value.trim();
            else if (upFacility?.value) facility = upFacility.value.trim();

            if (inPwd?.value) password = inPwd.value;
            else if (upPwd?.value) password = upPwd.value;

            if (upName?.value) name = upName.value.trim();
        }

        function syncUrl() {
            const url = new URL(window.location.href);
            url.searchParams.set('role', role);
            if (isSignUp) url.searchParams.set('mode', 'signup');
            else url.searchParams.delete('mode');
            window.history.replaceState({}, '', url.toString());
        }

        function bindSignInForm() {
            const form = container.querySelector('#signin-form');
            if (!form) return;
            form.onsubmit = async event => {
                event.preventDefault();
                readActiveFields();
                const patient = role === 'patient';
                if (!email || !email.includes('@') || (!patient && !facility) || !password) {
                    return showError(patient ? 'Enter your email and password.' : 'Enter your work email, care centre, and password.', false);
                }

                await runSubmit(form, async () => {
                    const result = await window.App.DB.checkCredentials(facility, email, password, role);
                    if (!result.success) throw new Error(result.error || 'We could not sign you in.');
                    const user = result.user || {};
                    setLoggedLocation(user.country || 'India', user.state || 'Telangana', user.city || 'Hyderabad', patient ? '' : (user.hospital || facility));
                    setLogin(email, role);
                    setView(patient ? 'patientDashboard' : role);
                }, 'Signing you in…');
            };
        }

        function bindSignUpForm() {
            const form = container.querySelector('#signup-form');
            if (!form) return;
            form.onsubmit = async event => {
                event.preventDefault();
                readActiveFields();
                const confirm = container.querySelector('#signup-confirm')?.value || '';
                const patient = role === 'patient';

                if (!email || !email.includes('@') || (!patient && !facility) || password.length < 4) {
                    return showError(patient ? 'Enter a valid email and a password with at least 4 characters.' : 'Use a valid work email, care centre, and a password with at least 4 characters.', true);
                }
                if (password !== confirm) return showError('Passwords do not match.', true);

                await runSubmit(form, async () => {
                    if (patient) {
                        const userName = name || email.split('@')[0];
                        const result = await window.App.DB.registerPatient({ email, password, name: userName, city: 'Hyderabad' });
                        if (!result.success) throw new Error(result.error || 'Account creation failed.');
                        try {
                            localStorage.setItem(`smartcare.patientProfile_${email}`, JSON.stringify({ name: userName, email }));
                        } catch {}
                        setLoggedLocation('India', 'Telangana', 'Hyderabad', 'SmartCare Community Hospital');
                        setLogin(email, 'patient');
                        window.App.UI.toast(`Welcome ${userName}. Your patient account is ready.`, 'success');
                        setView('patientDashboard');
                        return;
                    }
                    const result = await window.App.DB.registerProfessional({ email, hospital: facility, password, role });
                    if (!result.success) throw new Error(result.error || 'Account creation failed.');
                    message = 'Account created successfully. You can now sign in.';
                    messageType = 'success';
                    isSignUp = false;
                    password = '';
                    render();
                }, 'Creating your account…');
            };
        }

        function bindRecoveryForm() {
            const form = container.querySelector('#recovery-form');
            if (!form) return;
            form.onsubmit = async event => {
                event.preventDefault();
                readActiveFields();
                if (!email || !email.includes('@')) return showError('Enter a valid account email.', false);

                await runSubmit(form, async () => {
                    const result = await window.App.DB.resetPassword(email);
                    if (!result.success) throw new Error(result.error || 'Password reset failed.');
                    message = 'If an account exists for this email, a secure reset link has been sent.';
                    messageType = 'success';
                    recoveryState = null;
                    render();
                }, 'Sending reset link…');
            };
        }

        function bindUpdatePasswordForm() {
            const form = container.querySelector('#update-password-form');
            if (!form) return;
            form.onsubmit = async event => {
                event.preventDefault();
                const next = container.querySelector('#update-new-password')?.value || '';
                const confirm = container.querySelector('#update-confirm-password')?.value || '';
                if (next.length < 4) return showError('Use a password with at least 4 characters.', false);
                if (next !== confirm) return showError('Passwords do not match.', false);

                await runSubmit(form, async () => {
                    const result = await window.App.DB.updatePassword(next);
                    if (!result.success) throw new Error(result.error || 'Password update failed.');
                    window.history.replaceState({}, '', window.App.Store.hrefFor('/login'));
                    message = 'Password updated. You can sign in now.';
                    messageType = 'success';
                    recoveryState = null;
                    render();
                }, 'Updating password…');
            };
        }

        async function runSubmit(form, action, loadingText) {
            const button = form.querySelector('button[type="submit"]');
            const originalContent = button ? button.innerHTML : '';
            if (button) {
                button.disabled = true;
                button.innerHTML = `<span>${esc(loadingText)}</span>`;
            }
            try {
                await action();
            } catch (error) {
                showError(error.message || 'Something went wrong. Try again.', isSignUp);
            } finally {
                if (button && button.disabled) {
                    button.disabled = false;
                    button.innerHTML = originalContent;
                }
            }
        }

        function showError(text, forSignUp = false) {
            message = text;
            messageType = 'error';
            isSignUp = forSignUp;
            render();
        }
    };
})();

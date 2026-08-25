(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Login = function () {
        const { state, setView, setAuthTarget, setLogin, setLoggedLocation } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell';
        let role = state.auth?.targetRole || 'patient',
            mode = window.location.hash.includes('type=recovery') ? 'update-password' : 'signin',
            email = '', password = '', facility = '', message = '', messageType = '', passwordVisible = false;

        render();
        return container;

        function render() {
            const patient = role === 'patient';
            const roleName = patient ? 'Patient portal' : role === 'doctor' ? 'Hospital portal' : 'Admin portal';
            const title = mode === 'signin' ? 'Sign in to your workspace' : mode === 'signup' ? 'Create a provider account' : mode === 'recovery' ? 'Recover your access' : 'Set a new password';
            const description = mode === 'signin' ? (patient ? 'Use your email and password to continue.' : 'Use your work email and care centre details to continue.') : mode === 'signup' ? 'Register your care centre once, then manage the live queue.' : mode === 'recovery' ? 'We will email a secure password reset link.' : 'Choose a new password for your SmartCare account.';

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Secure access</span></span>
                    </a>
                    <nav class="flow-topbar-nav" aria-label="Portal navigation">
                        <a data-route="/" href="/">Home</a>
                        <a data-route="/dashboard/patient/apply/1" href="/dashboard/patient/apply/1">Patient portal</a>
                        <a data-route="/login" href="/login" class="active">Provider portal</a>
                        <a data-route="/about" href="/about">About</a>
                    </nav>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls()}
                        <button id="auth-back" class="back-link" type="button">
                            ${icon('arrow-left', 16)} Back to home
                        </button>
                    </div>
                </div>
                <main class="auth-layout section-auth" data-section="portal-login" aria-labelledby="auth-title">
                    <aside class="auth-aside">
                        <div class="eyebrow"><span class="eyebrow-dot"></span> Role-based access</div>
                        <h1>Keep care moving.</h1>
                        <p>Use SmartCare to see the queue clearly, prepare the next visit, and keep patients informed.</p>
                        <ul>
                            <li>${icon('list-checks', 16)} Live queue visibility</li>
                            <li>${icon('shield-check', 16)} Secure role separation</li>
                            <li>${icon('clock-3', 16)} Fewer desk handoffs</li>
                        </ul>
                    </aside>
                    <section class="auth-panel">
                        <div class="auth-mode-switch" style="display:flex;gap:.5rem;margin-bottom:1.25rem;padding:.3rem;background:var(--surface);border:1px solid var(--line);border-radius:2rem">
                            <button type="button" id="tab-signin" class="btn-${mode === 'signin' ? 'primary' : 'ghost'}" style="flex:1;border-radius:1.5rem;min-height:2.4rem;font-size:.8rem;font-weight:800">${icon('log-in', 14)} Sign In</button>
                            <button type="button" id="tab-signup" class="btn-${mode === 'signup' ? 'primary' : 'ghost'}" style="flex:1;border-radius:1.5rem;min-height:2.4rem;font-size:.8rem;font-weight:800">${icon('user-plus', 14)} Sign Up</button>
                        </div>
                        <div class="auth-role-switch" aria-label="Choose portal">
                            <button class="auth-role ${role === 'patient' ? 'active' : ''}" data-role="patient" type="button">${icon('user-round', 15)} Patient</button>
                            <button class="auth-role ${role === 'doctor' ? 'active' : ''}" data-role="doctor" type="button">${icon('stethoscope', 15)} Hospital</button>
                            <button class="auth-role ${role === 'staff' ? 'active' : ''}" data-role="staff" type="button">${icon('clipboard-list', 15)} Admin</button>
                        </div>
                        <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> ${roleName}</div>
                        <h2 id="auth-title">${title}</h2>
                        <p>${description}</p>
                        ${message ? `<div class="auth-message ${messageType}" role="alert">${esc(message)}</div>` : ''}
                        ${mode === 'signin' ? signInForm() : mode === 'signup' ? signUpForm() : mode === 'recovery' ? recoveryForm() : updatePasswordForm()}
                    </section>
                </main>
            `;

            bindCommon();
            if (mode === 'signin') bindSignIn();
            if (mode === 'signup') bindSignUp();
            if (mode === 'recovery') bindRecovery();
            if (mode === 'update-password') bindUpdatePassword();
            window.App.UI.bindTopbarControls(container);
            if (window.lucide) window.lucide.createIcons();
        }

        function signInForm() {
            const patient = role === 'patient';
            return `
                <form id="auth-form" class="auth-form" novalidate>
                    <div class="field">
                        <label for="auth-email">${patient ? 'Email address' : 'Work email'} <span>*</span></label>
                        <input id="auth-email" type="email" autocomplete="username" value="${esc(email)}" placeholder="${patient ? 'you@example.com' : 'name@carecentre.org'}" required>
                    </div>
                    ${patient ? '' : `
                        <div class="field">
                            <label for="auth-facility">Care centre <span>*</span></label>
                            <input id="auth-facility" value="${esc(facility)}" placeholder="e.g. SmartCare Community Hospital" required>
                        </div>
                    `}
                    <div class="field">
                        <label for="auth-password">Password <span>*</span></label>
                        <div class="password-field">
                            <input id="auth-password" type="${passwordVisible ? 'text' : 'password'}" autocomplete="current-password" value="${esc(password)}" placeholder="Enter your password" required>
                            <button class="field-action" id="toggle-password" type="button" aria-label="${passwordVisible ? 'Hide password' : 'Show password'}">
                                ${icon(passwordVisible ? 'eye-off' : 'eye', 17)}
                            </button>
                        </div>
                    </div>
                    <div class="auth-help"><button type="button" id="show-recovery">Forgot password?</button></div>
                    <button class="btn-primary auth-submit btn-icon" type="submit">
                        ${patient ? 'Continue to patient portal' : `Sign in to ${role === 'doctor' ? 'hospital' : 'admin'} portal`} ${icon('arrow-right', 16)}
                    </button>
                    <div class="auth-switch">
                        <span>${patient ? 'Are you a provider?' : 'New provider?'}</span>
                        <button type="button" id="show-signup">${patient ? 'Open provider access' : 'Create an account'}</button>
                    </div>
                </form>
                ${demoAccess()}
            `;
        }

        function demoAccess() {
            return `
                <div class="demo-access">
                    <p class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Demo access</p>
                    <p class="hint">Select a role to load a ready-to-use account. You still control the final sign-in.</p>
                    <div class="demo-buttons">
                        <button type="button" class="text-link demo-button" data-demo-role="patient">${icon('user-round', 15)} Patient demo</button>
                        <button type="button" class="text-link demo-button" data-demo-role="doctor">${icon('stethoscope', 15)} Hospital demo</button>
                        <button type="button" class="text-link demo-button" data-demo-role="staff">${icon('clipboard-list', 15)} Admin demo</button>
                    </div>
                </div>
            `;
        }

        function signUpForm() {
            const patient = role === 'patient';
            return `
                <form id="auth-form" class="auth-form" novalidate>
                    <div class="field">
                        <label for="auth-email">${patient ? 'Email address' : 'Work email'} <span>*</span></label>
                        <input id="auth-email" type="email" autocomplete="email" value="${esc(email)}" placeholder="${patient ? 'you@example.com' : 'name@carecentre.org'}" required>
                    </div>
                    ${patient ? `
                        <div class="field">
                            <label for="auth-name">Full Name <span>*</span></label>
                            <input id="auth-name" type="text" placeholder="e.g. Asha Rao" required>
                        </div>
                    ` : `
                        <div class="field">
                            <label for="auth-facility">Care centre name <span>*</span></label>
                            <input id="auth-facility" value="${esc(facility)}" placeholder="Your registered care centre" required>
                        </div>
                    `}
                    <div class="field">
                        <label for="auth-password">Create password <span>*</span></label>
                        <div class="password-field">
                            <input id="auth-password" type="${passwordVisible ? 'text' : 'password'}" autocomplete="new-password" value="${esc(password)}" placeholder="At least 8 characters" required>
                            <button class="field-action" id="toggle-password" type="button" aria-label="${passwordVisible ? 'Hide password' : 'Show password'}">${icon(passwordVisible ? 'eye-off' : 'eye', 17)}</button>
                        </div>
                    </div>
                    <div class="field"><label for="auth-confirm">Confirm password <span>*</span></label><input id="auth-confirm" type="password" autocomplete="new-password" placeholder="Repeat your password" required></div>
                    <button class="btn-primary auth-submit btn-icon" type="submit">${patient ? 'Create patient account' : 'Create provider account'} ${icon('arrow-right', 16)}</button>
                    <div class="auth-switch"><span>Already registered?</span><button type="button" id="show-signin">Return to sign in</button></div>
                </form>
                ${demoAccess()}
            `;
        }

        function recoveryForm() {
            return `
                <form id="auth-form" class="auth-form" novalidate>
                    <div class="field"><label for="auth-email">Account email <span>*</span></label><input id="auth-email" type="email" autocomplete="username" value="${esc(email)}" placeholder="name@carecentre.org" required></div>
                    <p class="hint">We will send a secure reset link to this email address.</p>
                    <button class="btn-primary auth-submit btn-icon" type="submit">Send reset link ${icon('mail', 16)}</button>
                    <div class="auth-switch"><span>Remembered it?</span><button type="button" id="show-signin">Return to sign in</button></div>
                </form>
            `;
        }

        function updatePasswordForm() {
            return `
                <form id="auth-form" class="auth-form" novalidate>
                    <div class="field"><label for="auth-password">New password <span>*</span></label><input id="auth-password" type="password" autocomplete="new-password" required minlength="8" placeholder="At least 8 characters"></div>
                    <div class="field"><label for="auth-confirm">Confirm password <span>*</span></label><input id="auth-confirm" type="password" autocomplete="new-password" required minlength="8" placeholder="Repeat your password"></div>
                    <button class="btn-primary auth-submit btn-icon" type="submit">Update password ${icon('key-round', 16)}</button>
                </form>
            `;
        }

        function bindCommon() {
            container.querySelector('#auth-back').onclick = e => { e.preventDefault(); setView('landing'); };
            container.querySelectorAll('[data-role]').forEach(button => button.onclick = () => {
                role = button.dataset.role;
                setAuthTarget(role);
                message = '';
                const url = window.App.Store.hrefFor(`/login?role=${role}`);
                window.history.pushState({}, '', url);
                render();
                window.scrollTo({ top: 0, behavior: 'instant' });
            });
            container.querySelectorAll('[data-demo-role]').forEach(button => button.onclick = () => startDemo(button.dataset.demoRole));
            const toggle = container.querySelector('#toggle-password');
            if (toggle) toggle.onclick = () => { passwordVisible = !passwordVisible; render(); };

            const tabSignIn = container.querySelector('#tab-signin');
            if (tabSignIn) tabSignIn.onclick = () => { mode = 'signin'; message = ''; render(); };
            const tabSignUp = container.querySelector('#tab-signup');
            if (tabSignUp) tabSignUp.onclick = () => { mode = 'signup'; message = ''; render(); };

            const signIn = container.querySelector('#show-signin');
            if (signIn) signIn.onclick = () => { mode = 'signin'; message = ''; render(); };
            const signUp = container.querySelector('#show-signup');
            if (signUp) signUp.onclick = () => { mode = 'signup'; message = ''; render(); };
            const recovery = container.querySelector('#show-recovery');
            if (recovery) recovery.onclick = () => { mode = 'recovery'; message = ''; render(); };
        }

        function readFields() {
            email = container.querySelector('#auth-email')?.value.trim() || email;
            facility = container.querySelector('#auth-facility')?.value.trim() || facility;
            password = container.querySelector('#auth-password')?.value || password;
        }

        function bindSignIn() {
            container.querySelector('#auth-form').onsubmit = async event => {
                event.preventDefault();
                readFields();
                const patient = role === 'patient';
                if (!email || !email.includes('@') || (!patient && !facility) || !password) return showError(patient ? 'Enter your email and password.' : 'Enter your work email, care centre, and password.');
                await runSubmit(async () => {
                    if (patient) {
                        setLoggedLocation('India', 'Telangana', 'Hyderabad', 'SmartCare Demo Clinic');
                        setLogin(email, 'patient');
                        setView('patientDashboard');
                        return;
                    }
                    const result = await window.App.DB.checkCredentials(facility, email, password, role);
                    if (!result.success) throw new Error(result.error || 'We could not sign you in.');
                    const user = result.user || {};
                    setLoggedLocation(user.country || 'India', user.state || 'Telangana', user.city || 'Hyderabad', user.hospital || facility);
                    setLogin(email, role);
                    setView(role);
                }, 'Signing you in…');
            };
        }

        function bindSignUp() {
            container.querySelector('#auth-form').onsubmit = async event => {
                event.preventDefault();
                readFields();
                const confirm = container.querySelector('#auth-confirm')?.value || '';
                const patient = role === 'patient';
                if (!email || !email.includes('@') || (!patient && !facility) || password.length < 8) {
                    return showError(patient ? 'Enter a valid email and a password with at least 8 characters.' : 'Use a valid work email, care centre, and a password with at least 8 characters.');
                }
                if (password !== confirm) return showError('Passwords do not match.');
                await runSubmit(async () => {
                    if (patient) {
                        const name = container.querySelector('#auth-name')?.value.trim() || email.split('@')[0];
                        setLoggedLocation('India', 'Telangana', 'Hyderabad', 'SmartCare Community Hospital');
                        setLogin(email, 'patient');
                        try {
                            localStorage.setItem(`smartcare.patientProfile_${email}`, JSON.stringify({ name, email }));
                        } catch {}
                        window.App.UI.toast(`Welcome ${name}! Your patient account is created.`, 'success');
                        setView('patientDashboard');
                        return;
                    }
                    const result = await window.App.DB.registerProfessional({ email, hospital: facility, password, role });
                    if (!result.success) throw new Error(result.error || 'Account creation failed.');
                    message = 'Account created successfully! You can now sign in.';
                    messageType = 'success';
                    mode = 'signin';
                    password = '';
                    render();
                }, 'Creating your account…');
            };
        }

        function bindRecovery() {
            container.querySelector('#auth-form').onsubmit = async event => {
                event.preventDefault();
                readFields();
                if (!email || !email.includes('@')) return showError('Enter a valid account email.');
                await runSubmit(async () => {
                    const result = await window.App.DB.resetPassword(email);
                    if (!result.success) throw new Error(result.error || 'Password reset failed.');
                    message = 'If an account exists for this email, a secure reset link has been sent.';
                    messageType = 'success';
                    mode = 'signin';
                    password = '';
                    render();
                }, 'Sending reset link…');
            };
        }

        function bindUpdatePassword() {
            container.querySelector('#auth-form').onsubmit = async event => {
                event.preventDefault();
                const next = container.querySelector('#auth-password').value;
                const confirm = container.querySelector('#auth-confirm').value;
                if (next.length < 8) return showError('Use a password with at least 8 characters.');
                if (next !== confirm) return showError('Passwords do not match.');
                await runSubmit(async () => {
                    const result = await window.App.DB.updatePassword(next);
                    if (!result.success) throw new Error(result.error || 'Password update failed.');
                    window.history.replaceState({}, '', window.App.Store.hrefFor('/login'));
                    message = 'Password updated. You can sign in now.';
                    messageType = 'success';
                    mode = 'signin';
                    render();
                }, 'Updating password…');
            };
        }

        async function runSubmit(action, loadingText) {
            const button = container.querySelector('#auth-form button[type="submit"]');
            if (button) { button.disabled = true; button.textContent = loadingText; }
            try { await action(); } catch (error) { showError(error.message || 'Something went wrong. Try again.'); }
        }

        function startDemo(demoRole) {
            const prevRole = role;
            role = demoRole;
            setAuthTarget(role);
            email = demoRole === 'patient' ? 'patient@smartcare.demo' : demoRole === 'doctor' ? 'hospital@smartcare.demo' : 'admin@smartcare.demo';
            facility = demoRole === 'patient' ? 'SmartCare Demo Clinic' : demoRole === 'doctor' ? 'SmartCare Community Hospital' : 'SmartCare Operations Centre';
            password = 'demo1234';
            mode = 'signin';
            message = 'Demo credentials loaded. Click sign in to continue.';
            messageType = 'success';

            if (prevRole !== demoRole) {
                render();
                return;
            }

            const emailEl = container.querySelector('#auth-email'); if (emailEl) emailEl.value = email;
            const facilityEl = container.querySelector('#auth-facility'); if (facilityEl) facilityEl.value = facility;
            const passwordEl = container.querySelector('#auth-password'); if (passwordEl) passwordEl.value = password;
            const roleButtons = container.querySelectorAll('[data-role]');
            roleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.role === role));
            const msgEl = container.querySelector('.auth-message');
            if (msgEl) {
                msgEl.textContent = message;
                msgEl.className = `auth-message ${messageType}`;
            } else {
                const authPanel = container.querySelector('.auth-panel');
                if (authPanel) {
                    const div = document.createElement('div');
                    div.className = `auth-message ${messageType}`;
                    div.setAttribute('role', 'alert');
                    div.textContent = message;
                    const form = authPanel.querySelector('#auth-form');
                    if (form) authPanel.insertBefore(div, form);
                }
            }
        }

        function showError(text) {
            message = text;
            messageType = 'error';
            render();
        }
    };
})();

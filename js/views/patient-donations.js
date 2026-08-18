(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.PatientDonations = function () {
        const { state, logout, getDonationsData, addPatientDonation, hrefFor } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell patient-workspace-shell';
        const patientName = state.patientData.name || (state.loggedEmail || 'Patient').split('@')[0].replace(/[._-]/g, ' ');

        // Read state from URL
        const urlParams = new URLSearchParams(window.location.search);
        let donationType = ['blood', 'organ'].includes(urlParams.get('type')) ? urlParams.get('type') : 'blood';
        let mode = ['give', 'receive'].includes(urlParams.get('mode')) ? urlParams.get('mode') : 'give';
        let message = '';
        let messageType = '';
        const organs = ['Kidney', 'Liver', 'Heart', 'Cornea', 'Lung', 'Pancreas'];
        const bloodGroups = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

        function syncUrl() {
            const url = new URL(window.location.href);
            url.searchParams.set('type', donationType);
            url.searchParams.set('mode', mode);
            window.history.replaceState({}, '', url.toString());
        }

        function navHtml() {
            return `<a href="/dashboard/patient" data-route="/dashboard/patient">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/patient/apply/1" data-route="/dashboard/patient/apply/1" data-tab="apply">${icon('calendar-plus', 16)}<span>Book appointment</span></a><a href="/dashboard/patient?tab=visits" data-tab="visits" data-tab-route="/dashboard/patient">${icon('clipboard-check', 16)}<span>Previous visits</span></a><a href="/dashboard/patient?tab=profile" data-tab="profile" data-tab-route="/dashboard/patient">${icon('user-round', 16)}<span>Profile</span></a><div class="nav-divider"></div><a class="active" href="/dashboard/patient/donations" data-route="/dashboard/patient/donations">${icon('heart-handshake', 16)}<span>Donations</span></a><a href="/dashboard/patient/help" data-route="/dashboard/patient/help">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        }

        function render() {
            syncUrl();
            const donationsData = getDonationsData();
            
            // For Patient:
            // If mode === 'give', show hospital requests (hospitals needing blood/organs)
            // If mode === 'receive', show hospital offers (blood bank inventory & organ pool from hospitals)
            const targetHospitalMode = mode === 'give' ? 'request' : 'offer';
            const relevantHospitalPosts = donationsData.hospitalPosts.filter(p => p.type === donationType && p.mode === targetHospitalMode);
            
            // Also show user's own submissions
            const mySubmissions = donationsData.patientPosts.filter(p => p.type === donationType);

            const hospitalItemsHtml = relevantHospitalPosts.map(p => `
                <div class="donation-result">
                    <div class="donation-result-icon">${icon(p.type === 'blood' ? 'droplets' : 'activity', 16)}</div>
                    <div>
                        <strong>${esc(p.group)} · ${esc(p.hospital)}</strong>
                        <p>${p.units ? `${esc(p.units)} units · ` : ''}${esc(p.urgency || 'Routine')} · ${esc(p.city)}</p>
                        ${p.notes ? `<small>${esc(p.notes)}</small>` : ''}
                    </div>
                    <button type="button" class="btn-secondary btn-respond" data-item-id="${p.id}" style="font-size:.72rem;min-height:2.2rem;padding:.4rem .75rem">
                        ${mode === 'give' ? 'Pledge' : 'Request'}
                    </button>
                </div>`).join('');

            const myItemsHtml = mySubmissions.map(p => `
                <div class="donation-result" style="background:#f0f8ff;border-color:#b9daf8">
                    <div class="donation-result-icon" style="background:#d8eeff;color:var(--teal)">${icon(p.mode === 'give' ? 'heart-handshake' : 'hand', 16)}</div>
                    <div>
                        <strong>${esc(p.name)} (${esc(p.group)})</strong>
                        <small>${p.mode === 'give' ? 'Registered donor' : 'Requested'} · Status: ${esc(p.status || 'Active')}</small>
                    </div>
                    <span style="font-size:.68rem;color:var(--teal);font-weight:700">Listed</span>
                </div>`).join('');

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Patient portal</span></span></a>
                    <a class="back-link" data-route="/dashboard/patient" href="/dashboard/patient">${icon('arrow-left', 16)} Back to dashboard</a>
                </div>
                <main class="provider-shell section-dashboard" data-section="patient-donations">
                    <header class="provider-header">
                        <div>
                            <div class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Community &amp; Hospital donations</div>
                            <h1>Give or receive care, ${esc(patientName)}.</h1>
                            <p>Directly synced with care centres and blood banks across the SmartCare network.</p>
                        </div>
                        <div class="provider-date">Live synced pool<br><strong>Network active</strong></div>
                    </header>
                    <div class="donation-type-switch" style="display:flex;gap:.65rem;margin-bottom:1.25rem">
                        <button type="button" id="type-blood" class="btn-${donationType === 'blood' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.5rem;font-size:.78rem">${icon('droplets', 16)} Blood donation</button>
                        <button type="button" id="type-organ" class="btn-${donationType === 'organ' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.5rem;font-size:.78rem">${icon('activity', 16)} Organ donation</button>
                    </div>
                    <div class="donation-grid">
                        <div class="donation-card" style="border-radius:1rem">
                            <div style="display:flex;gap:.65rem;margin-bottom:1.25rem">
                                <button type="button" id="mode-give" class="btn-${mode === 'give' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.4rem;font-size:.78rem">${icon('heart-handshake', 15)} I want to give</button>
                                <button type="button" id="mode-receive" class="btn-${mode === 'receive' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.4rem;font-size:.78rem">${icon('hand', 15)} I need a donation</button>
                            </div>
                            ${donationType === 'blood' ? `
                            <h2>${mode === 'give' ? 'Register as a blood donor' : 'Request blood unit'}</h2>
                            <p>${mode === 'give' ? 'Your availability will show up immediately in hospital care dashboards for matching.' : 'Tell us your blood group. Hospital blood banks with matching inventory will be notified.'}</p>
                            <form id="donation-form" class="donation-form">
                                <label class="field"><span>Full name</span><input id="d-name" type="text" placeholder="Your name" value="${esc(patientName)}" required></label>
                                <label class="field"><span>Blood group</span><select id="d-group">${bloodGroups.map(g => `<option value="${g}">${g}</option>`).join('')}</select></label>
                                <label class="field"><span>City</span><input id="d-city" type="text" placeholder="Hyderabad" value="${esc(state.patientData.city || 'Hyderabad')}" required></label>
                                ${mode === 'give' ? `<label class="consent-field"><input type="checkbox" id="d-consent" checked> I consent to sharing my contact with matched care centres.</label>` : `<label class="field"><span>Urgency</span><select id="d-urgency"><option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option></select></label>`}
                                <button type="submit" class="btn-primary btn-icon" id="d-submit">${icon(mode === 'give' ? 'heart-handshake' : 'send', 16)} ${mode === 'give' ? 'Register as blood donor' : 'Submit blood request'}</button>
                            </form>` : `
                            <h2>${mode === 'give' ? 'Pledge organ donation' : 'Request organ transplant support'}</h2>
                            <p>${mode === 'give' ? 'Organ donation saves lives. Your pledge is shared directly with authorized hospital transplant pools.' : 'Submit a request to matching hospital transplant programs.'}</p>
                            <form id="donation-form" class="donation-form">
                                <label class="field"><span>Full name</span><input id="d-name" type="text" placeholder="Your name" value="${esc(patientName)}" required></label>
                                <label class="field"><span>${mode === 'give' ? 'Organ to pledge' : 'Organ needed'}</span><select id="d-group">${organs.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
                                <label class="field"><span>City</span><input id="d-city" type="text" placeholder="Hyderabad" value="${esc(state.patientData.city || 'Hyderabad')}" required></label>
                                ${mode === 'give' ? `<label class="consent-field"><input type="checkbox" id="d-consent" checked> I consent to organ donation as per national health guidelines.</label>` : `<label class="field"><span>Urgency</span><select id="d-urgency"><option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option></select></label>`}
                                <button type="submit" class="btn-primary btn-icon" id="d-submit">${icon(mode === 'give' ? 'heart-handshake' : 'send', 16)} ${mode === 'give' ? 'Register organ pledge' : 'Submit organ request'}</button>
                            </form>`}
                            ${message ? `<div class="donation-message ${messageType}" role="alert" style="margin-top:.85rem;padding:.75rem;border-radius:.5rem;background:${messageType === 'success' ? '#e8f8f2' : '#fdeeed'};color:${messageType === 'success' ? '#0b754f' : '#b23b35'}">${message}</div>` : ''}
                        </div>
                        <div class="donation-card donation-aside" style="border-radius:1rem">
                            <div class="donation-aside-icon" style="margin-bottom:.75rem">${icon(mode === 'give' ? 'building-2' : 'package-check', 22)}</div>
                            <h2 style="margin:.25rem 0 .35rem;font-size:1.05rem">${mode === 'give' ? `Hospital ${donationType} requirements` : `Hospital ${donationType} availability`}</h2>
                            <p style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem">${mode === 'give' ? `Hospitals actively seeking ${donationType} donations in your network.` : `Centres with available ${donationType} stock or matching donor pools.`}</p>
                            <div class="donation-results">
                                ${hospitalItemsHtml || `<div class="provider-empty" style="padding:1.5rem 0">${icon('check-circle', 26)}<p>No open hospital ${mode === 'give' ? 'requests' : 'offers'} right now.</p></div>`}
                            </div>
                            ${myItemsHtml ? `
                                <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--line)">
                                    <h3 style="font-size:.85rem;margin:0 0 .5rem;color:var(--ink)">Your active registrations</h3>
                                    <div class="donation-results">${myItemsHtml}</div>
                                </div>` : ''}
                        </div>
                    </div>
                </main>
                ${window.App.UI.footer(true)}`;

            // Rebuild workspace nav
            const workspaceMain = container.querySelector('main');
            const workspaceNav = document.createElement('nav');
            workspaceNav.className = 'workspace-tabs';
            workspaceNav.setAttribute('aria-label', 'Patient portal navigation');
            workspaceNav.innerHTML = navHtml();
            const workspaceContent = document.createElement('div');
            workspaceContent.className = 'workspace-content';
            Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
            workspaceMain.append(workspaceNav, workspaceContent);
            container.querySelector('#workspace-logout').onclick = logout;

            // Bind type switch
            container.querySelector('#type-blood').onclick = () => { donationType = 'blood'; message = ''; render(); };
            container.querySelector('#type-organ').onclick = () => { donationType = 'organ'; message = ''; render(); };
            container.querySelector('#mode-give').onclick = () => { mode = 'give'; message = ''; render(); };
            container.querySelector('#mode-receive').onclick = () => { mode = 'receive'; message = ''; render(); };

            // Bind respond buttons
            container.querySelectorAll('.btn-respond').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.itemId;
                    const item = relevantHospitalPosts.find(p => p.id === id);
                    if (item) {
                        window.App.UI.toast(`Connected with ${item.hospital} for ${item.group} ${item.type}. A coordinator has been alerted!`, 'success');
                    }
                };
            });

            // Bind form
            container.querySelector('#donation-form').onsubmit = e => {
                e.preventDefault();
                const name = container.querySelector('#d-name')?.value.trim();
                const group = container.querySelector('#d-group')?.value;
                const city = container.querySelector('#d-city')?.value.trim() || 'Hyderabad';
                const urgency = container.querySelector('#d-urgency')?.value || 'Routine';
                const consent = container.querySelector('#d-consent');

                if (!name) { message = 'Please enter your name.'; messageType = 'error'; render(); return; }
                if (mode === 'give' && consent && !consent.checked) { message = 'Please confirm consent before submitting.'; messageType = 'error'; render(); return; }

                addPatientDonation({
                    type: donationType,
                    mode: mode,
                    name: name,
                    group: group,
                    city: city,
                    urgency: urgency
                });

                message = mode === 'give' 
                    ? `Thank you, ${name}! Your ${group} ${donationType} donor registration is now live and visible to hospitals.` 
                    : `Your ${group} ${donationType} request has been posted. Hospital blood banks and donor coordinators are notified.`;
                messageType = 'success';
                window.App.UI.toast(message, 'success');
                render();
            };

            // RENDER LUCIDE ICONS SO LOGOS ALWAYS LOAD PROPERLY
            if (window.lucide) window.lucide.createIcons();
        }

        render();
        return container;
    };
})();

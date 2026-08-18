(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.DoctorDonations = function () {
        const { state, logout, getDonationsData, addHospitalDonation, hrefFor } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const isStaff = state.loggedRole === 'staff';
        const overviewRoute = isStaff ? '/dashboard/admin' : '/dashboard/doctor';
        const helpRoute = isStaff ? '/dashboard/admin/help' : '/dashboard/doctor/help';
        const donationsRoute = isStaff ? '/dashboard/admin/donations' : '/dashboard/doctor/donations';
        const overviewLabel = isStaff ? 'Operations' : 'Overview';

        // Read state from URL
        const urlParams = new URLSearchParams(window.location.search);
        let donationType = ['blood', 'organ'].includes(urlParams.get('type')) ? urlParams.get('type') : 'blood';
        let mode = ['offer', 'request'].includes(urlParams.get('mode')) ? urlParams.get('mode') : 'offer';
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
            if (isStaff) return `<a href="/dashboard/admin" data-route="/dashboard/admin">${icon('layout-dashboard', 16)}<span>Operations</span></a><a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><div class="nav-divider"></div><a class="active" href="${donationsRoute}" data-route="${donationsRoute}">${icon('heart-handshake', 16)}<span>Donations</span></a><a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
            return `<a href="/dashboard/doctor" data-route="/dashboard/doctor">${icon('layout-dashboard', 16)}<span>Overview</span></a><a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a><a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a><div class="nav-divider"></div><a class="active" href="${donationsRoute}" data-route="${donationsRoute}">${icon('heart-handshake', 16)}<span>Donations</span></a><a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a><button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>`;
        }

        function render() {
            syncUrl();
            const donationsData = getDonationsData();

            // For Hospital:
            // If mode === 'offer', show Patients requesting blood/organs so hospital can fulfill them
            // If mode === 'request', show Registered Donors who can provide blood/organs so hospital can call them
            const targetPatientMode = mode === 'offer' ? 'receive' : 'give';
            const matchingPatients = donationsData.patientPosts.filter(p => p.type === donationType && p.mode === targetPatientMode);

            // Also show hospital inventory / postings
            const hospitalPosts = donationsData.hospitalPosts.filter(p => p.type === donationType);

            const patientMatchesHtml = matchingPatients.map(p => `
                <div class="donation-result">
                    <div class="donation-result-icon">${icon(p.type === 'blood' ? 'droplets' : 'activity', 16)}</div>
                    <div>
                        <strong>${esc(p.name)} · ${esc(p.group)}</strong>
                        <p>${p.mode === 'give' ? 'Registered Donor' : 'Patient Request'} · ${esc(p.city)}</p>
                        <small>${esc(p.status || 'Active')} · ${esc(p.urgency || 'Routine')}</small>
                    </div>
                    <button type="button" class="btn-primary btn-icon btn-contact" data-name="${esc(p.name)}" data-group="${esc(p.group)}" style="font-size:.72rem;min-height:2.2rem;padding:.4rem .75rem">
                        ${icon('phone', 13)} Contact
                    </button>
                </div>`).join('');

            const hospitalPostsHtml = hospitalPosts.map(h => `
                <div class="donation-result" style="background:#f8fbfe;border-color:#b9daf8">
                    <div class="donation-result-icon" style="background:#d8eeff;color:var(--teal)">${icon(h.mode === 'offer' ? 'upload' : 'download', 16)}</div>
                    <div>
                        <strong>${esc(h.hospital)} (${esc(h.group)})</strong>
                        <p>${h.mode === 'offer' ? 'Stock Offer' : 'Centre Request'} · ${h.units ? `${esc(h.units)} units` : ''} · ${esc(h.city)}</p>
                        ${h.notes ? `<small>${esc(h.notes)}</small>` : ''}
                    </div>
                    <span style="font-size:.68rem;color:var(--teal);font-weight:700">${esc(h.urgency || 'Live')}</span>
                </div>`).join('');

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">${isStaff ? 'Operations workspace' : 'Hospital workspace'}</span></span></a>
                    <a class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">${icon('arrow-left', 16)} ${overviewLabel}</a>
                </div>
                <main class="provider-shell section-dashboard" data-section="hospital-donations">
                    <header class="provider-header">
                        <div>
                            <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Blood Bank &amp; Organ Network</div>
                            <h1>Manage centre donations &amp; donor pool.</h1>
                            <p>${esc(state.loggedHospital || 'SmartCare Central Hospital')} · ${esc(state.loggedCity || 'Hyderabad')}</p>
                        </div>
                        <div class="provider-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}<br><strong>Network synced</strong></div>
                    </header>
                    <div class="donation-type-switch" style="display:flex;gap:.65rem;margin-bottom:1.25rem">
                        <button type="button" id="type-blood" class="btn-${donationType === 'blood' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.5rem;font-size:.78rem">${icon('droplets', 16)} Blood bank</button>
                        <button type="button" id="type-organ" class="btn-${donationType === 'organ' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.5rem;font-size:.78rem">${icon('activity', 16)} Organ pool</button>
                    </div>
                    <div class="donation-grid">
                        <div class="donation-card" style="border-radius:1rem">
                            <div style="display:flex;gap:.65rem;margin-bottom:1.25rem">
                                <button type="button" id="mode-offer" class="btn-${mode === 'offer' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.4rem;font-size:.78rem">${icon('upload', 15)} We can offer</button>
                                <button type="button" id="mode-request" class="btn-${mode === 'request' ? 'primary' : 'secondary'} btn-icon" style="min-height:2.4rem;font-size:.78rem">${icon('download', 15)} We need</button>
                            </div>
                            ${donationType === 'blood' ? `
                            <h2>${mode === 'offer' ? 'Publish blood unit availability' : 'Post urgent blood requirement'}</h2>
                            <p>${mode === 'offer' ? 'Add available units to the regional blood bank inventory visible to patients and triage desks.' : 'Broadcast a blood shortage to registered donors and partner medical centres.'}</p>
                            <form id="donation-form" class="donation-form">
                                <label class="field"><span>Blood group</span><select id="d-group">${bloodGroups.map(g => `<option value="${g}">${g}</option>`).join('')}</select></label>
                                <label class="field"><span>Units ${mode === 'offer' ? 'available' : 'needed'}</span><input id="d-units" type="number" min="1" max="100" placeholder="e.g. 5" value="4" required></label>
                                <label class="field"><span>Urgency</span><select id="d-urgency"><option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option></select></label>
                                <label class="field"><span>Storage notes / Location</span><input id="d-notes" type="text" placeholder="e.g. Blood Bank Wing B, shelf 3" value="Main Blood Bank Wing"></label>
                                <button type="submit" class="btn-primary btn-icon" id="d-submit">${icon('send', 16)} ${mode === 'offer' ? 'Publish blood offer' : 'Broadcast blood request'}</button>
                            </form>` : `
                            <h2>${mode === 'offer' ? 'Register organ transplant availability' : 'Broadcast urgent organ transplant need'}</h2>
                            <p>${mode === 'offer' ? 'List available matching organs with authorized transplant coordinators.' : 'Notify the regional organ sharing network and patient registries.'}</p>
                            <form id="donation-form" class="donation-form">
                                <label class="field"><span>${mode === 'offer' ? 'Organ available' : 'Organ required'}</span><select id="d-group">${organs.map(o => `<option value="${o}">${o}</option>`).join('')}</select></label>
                                <label class="field"><span>Urgency</span><select id="d-urgency"><option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="Emergency">Emergency</option></select></label>
                                <label class="field"><span>Clinical notes</span><input id="d-notes" type="text" placeholder="Compatibility, HLA crossmatch details"></label>
                                <label class="consent-field"><input type="checkbox" id="d-consent" checked> I confirm this entry complies with national organ transplant protocols.</label>
                                <button type="submit" class="btn-primary btn-icon" id="d-submit">${icon('send', 16)} ${mode === 'offer' ? 'Publish organ entry' : 'Broadcast organ request'}</button>
                            </form>`}
                            ${message ? `<div class="donation-message ${messageType}" role="alert" style="margin-top:.85rem;padding:.75rem;border-radius:.5rem;background:${messageType === 'success' ? '#e8f8f2' : '#fdeeed'};color:${messageType === 'success' ? '#0b754f' : '#b23b35'}">${message}</div>` : ''}
                        </div>
                        <div class="donation-card donation-aside" style="border-radius:1rem">
                            <div class="donation-aside-icon" style="margin-bottom:.75rem">${icon(mode === 'offer' ? 'users' : 'user-check', 22)}</div>
                            <h2 style="margin:.25rem 0 .35rem;font-size:1.05rem">${mode === 'offer' ? `Patients needing ${donationType}` : `Registered ${donationType} donors`}</h2>
                            <p style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem">${mode === 'offer' ? `Live patient requests across the network waiting for ${donationType}.` : `Community members registered and available for ${donationType} donation.`}</p>
                            <div class="donation-results">
                                ${patientMatchesHtml || `<div class="provider-empty" style="padding:1.5rem 0">${icon('user-x', 26)}<p>No matching patient ${mode === 'offer' ? 'requests' : 'donors'} registered.</p></div>`}
                            </div>
                            <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--line)">
                                <h3 style="font-size:.85rem;margin:0 0 .5rem;color:var(--ink)">Hospital network inventory &amp; requests</h3>
                                <div class="donation-results">${hospitalPostsHtml}</div>
                            </div>
                        </div>
                    </div>
                </main>
                ${window.App.UI.footer(true)}`;

            // Rebuild workspace nav
            const workspaceMain = container.querySelector('main');
            const workspaceNav = document.createElement('nav');
            workspaceNav.className = 'workspace-tabs';
            workspaceNav.setAttribute('aria-label', isStaff ? 'Admin workspace navigation' : 'Hospital workspace navigation');
            workspaceNav.innerHTML = navHtml();
            const workspaceContent = document.createElement('div');
            workspaceContent.className = 'workspace-content';
            Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
            workspaceMain.append(workspaceNav, workspaceContent);
            container.querySelector('#workspace-logout').onclick = logout;

            // Bind type switch
            container.querySelector('#type-blood').onclick = () => { donationType = 'blood'; message = ''; render(); };
            container.querySelector('#type-organ').onclick = () => { donationType = 'organ'; message = ''; render(); };
            container.querySelector('#mode-offer').onclick = () => { mode = 'offer'; message = ''; render(); };
            container.querySelector('#mode-request').onclick = () => { mode = 'request'; message = ''; render(); };

            // Bind contact buttons
            container.querySelectorAll('.btn-contact').forEach(btn => {
                btn.onclick = () => {
                    const name = btn.dataset.name;
                    const group = btn.dataset.group;
                    window.App.UI.toast(`Initiated direct hospital contact dispatch for ${name} (${group}).`, 'success');
                };
            });

            // Bind form submission
            container.querySelector('#donation-form').onsubmit = e => {
                e.preventDefault();
                const group = container.querySelector('#d-group')?.value;
                const units = container.querySelector('#d-units')?.value;
                const urgency = container.querySelector('#d-urgency')?.value || 'Routine';
                const notes = container.querySelector('#d-notes')?.value || '';
                const consent = container.querySelector('#d-consent');

                if (donationType === 'organ' && consent && !consent.checked) {
                    message = 'Please confirm clinical compliance before submitting.';
                    messageType = 'error';
                    render();
                    return;
                }

                addHospitalDonation({
                    type: donationType,
                    mode: mode,
                    group: group,
                    units: units ? Number(units) : 1,
                    hospital: state.loggedHospital || 'SmartCare Central Hospital',
                    city: state.loggedCity || 'Hyderabad',
                    urgency: urgency,
                    notes: notes
                });

                message = mode === 'offer'
                    ? `Successfully posted ${units ? `${units} units of ` : ''}${group} ${donationType} to the network. Visible to patients and partner care centres.`
                    : `Urgent requirement for ${group} ${donationType} published to the network. Matching donors will receive dispatch alerts.`;
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

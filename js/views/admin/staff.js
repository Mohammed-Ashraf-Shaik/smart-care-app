(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Staff = function () {
        const { state, setView, getQueueMetrics, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';
        const metrics = getQueueMetrics();
        const activeTab = state.activeTab || '';
        const defaultRooms = [
            ['Consultation 01', 'Internal medicine', 'In use'],
            ['Consultation 02', 'General care', 'Available'],
            ['Triage desk', 'Initial assessment', 'In use'],
            ['Pharmacy', 'Prescription pickup', 'Available']
        ];
        const roomStorageKey = `smartcare.rooms:${String(state.loggedHospital || 'demo-centre').toLowerCase()}`;
        const readRooms = () => {
            try {
                const stored = JSON.parse(window.localStorage.getItem(roomStorageKey) || 'null');
                if (Array.isArray(stored) && stored.length === defaultRooms.length && stored.every(room => Array.isArray(room) && room.length === 3)) return stored;
            } catch {}
            return defaultRooms.map(room => [...room]);
        };
        const rooms = readRooms();
        const saveRooms = () => { try { window.localStorage.setItem(roomStorageKey, JSON.stringify(rooms)); } catch {} };

        container.innerHTML = `
            <div class="flow-topbar">
                <a class="brand-lockup" data-route="/" href="/">
                    <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                    <span><span class="brand-name">SmartCare</span><span class="brand-caption">Operations workspace</span></span>
                </a>
                <div class="flow-topbar-actions">
                    ${window.App.UI.topbarControls(true)}
                    <button id="staff-back" class="back-link">${icon('arrow-left', 16)} Back to home</button>
                </div>
            </div>
            <main class="provider-shell section-dashboard" data-section="admin-dashboard">
                <header class="provider-header">
                    <div>
                        <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Hospital operations</div>
                        <h1>Keep the centre ready.</h1>
                        <p>${esc(state.loggedHospital || 'Your care centre')} · ${esc(state.loggedCity || 'Location not set')}</p>
                    </div>
                    <div class="provider-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}<br><strong>Operational view</strong></div>
                </header>
                <div class="provider-stats">
                    <div class="provider-stat"><span>Patients waiting</span><strong>${metrics.waiting}</strong><small>Current active queue</small></div>
                    <div class="provider-stat"><span>Average wait</span><strong>${metrics.averageWait}m</strong><small>Based on arrival time</small></div>
                    <div class="provider-stat"><span>Priority cases</span><strong>${metrics.priority}</strong><small>Needs attention first</small></div>
                    <div class="provider-stat"><span>Projected revenue</span><strong>₹${metrics.revenue}</strong><small>Current queue estimate</small></div>
                </div>
                <div class="provider-grid">
                    <section id="tab-rooms" data-tab-panel="rooms" class="provider-card">
                        <div class="provider-card-heading">
                            <div>
                                <h2>Room status</h2>
                                <p>Click a room to keep the next handoff visible to the front desk.</p>
                            </div>
                            <span class="status-eyebrow" style="color:var(--teal)"><i style="background:var(--teal)"></i> Live</span>
                        </div>
                        <div class="room-grid">
                            ${rooms.map(([name, type, status], index) => `
                                <button type="button" class="room-item" data-room-index="${index}" aria-pressed="${status === 'In use'}">
                                    <span>${icon(status === 'Available' ? 'door-open' : 'door-closed', 17)}<strong>${name}</strong><small>${type}</small></span>
                                    <span class="room-status">${status}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="provider-notice">${icon('triangle-alert', 15)} Triage desk is handling the next priority case. The live queue has ${metrics.priority} red-priority patient(s).</div>
                    </section>
                    <section class="provider-card">
                        <div class="provider-card-heading">
                            <div>
                                <h2>Today at a glance</h2>
                                <p>Use these signals to plan the next hour.</p>
                            </div>
                        </div>
                        <div class="summary-row"><span>Peak period</span><strong>10:00–12:00</strong></div>
                        <div class="summary-row"><span>Queue health</span><strong>${metrics.waiting < 6 ? 'Within target' : 'Needs attention'}</strong></div>
                        <div class="summary-row"><span>Facility readiness</span><strong>${Math.max(0, 100 - metrics.priority * 8)}%</strong></div>
                        <a class="btn-secondary btn-wide btn-icon" data-route="/dashboard/analytics" href="/dashboard/analytics" style="margin-top:1rem">
                            Open analytics ${icon('arrow-right', 16)}
                        </a>
                    </section>
                </div>
            </main>
            ${window.App.UI.footer(true)}
        `;

        const workspaceNav = document.createElement('nav');
        workspaceNav.className = 'workspace-tabs';
        workspaceNav.setAttribute('aria-label', 'Admin workspace navigation');
        const helpRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/help' : '/dashboard/admin/help';
        const donRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/donations' : '/dashboard/admin/donations';

        workspaceNav.innerHTML = `
            <a class="${activeTab === '' ? 'active' : ''}" href="/dashboard/admin" data-route="/dashboard/admin">${icon('layout-dashboard', 16)}<span>Operations</span></a>
            <a class="${activeTab === 'rooms' ? 'active' : ''}" href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a>
            <a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a>
            <a href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a>
            <div class="nav-divider"></div>
            <a href="${donRoute}" data-route="${donRoute}">${icon('heart-handshake', 16)}<span>Donations</span></a>
            <a href="${helpRoute}" data-route="${helpRoute}">${icon('circle-help', 16)}<span>Help</span></a>
            <button type="button" id="workspace-logout" class="signout-btn">${icon('log-out', 16)}<span>Sign out</span></button>
        `;

        const workspaceMain = container.querySelector('main');
        const workspaceContent = document.createElement('div');
        workspaceContent.className = 'workspace-content';
        Array.from(workspaceMain.children).forEach(child => workspaceContent.appendChild(child));
        workspaceMain.append(workspaceNav, workspaceContent);

        const quickActions = document.createElement('section');
        quickActions.className = 'dashboard-quick-actions';
        quickActions.setAttribute('aria-label', 'Admin quick actions');
        quickActions.innerHTML = `
            <div>
                <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Next actions</span>
                <strong>Keep the centre moving</strong>
                <small>Register walk-ins, review rooms, and monitor today's operating signals.</small>
            </div>
            <button class="btn-primary btn-icon" id="open-walkin" type="button" aria-expanded="false" aria-controls="walkin-panel">${icon('user-plus', 16)} Register walk-in</button>
            <a class="btn-primary btn-icon" data-route="/dashboard/analytics" href="/dashboard/analytics">Open analytics ${icon('arrow-right', 16)}</a>
        `;
        workspaceContent.insertBefore(quickActions, workspaceContent.querySelector('.provider-stats'));

        const walkInPanel = document.createElement('section');
        walkInPanel.id = 'walkin-panel';
        walkInPanel.className = 'provider-card walkin-panel';
        walkInPanel.hidden = true;
        walkInPanel.innerHTML = `
            <div class="provider-card-heading">
                <div>
                    <span class="eyebrow eyebrow-dark"><span class="eyebrow-dot"></span> Front desk intake</span>
                    <h2>Register a walk-in patient</h2>
                    <p>Add the patient to a clinician's live queue. Emergency symptoms still require the centre's emergency protocol.</p>
                </div>
                <button class="btn-ghost btn-icon" id="close-walkin" type="button" aria-label="Close walk-in registration">${icon('x', 17)} Close</button>
            </div>
            <form id="walkin-form" class="form-grid">
                <div class="field">
                    <label for="walkin-name">Patient name <span>*</span></label>
                    <input id="walkin-name" name="name" type="text" autocomplete="name" maxlength="80" required placeholder="e.g. Asha Rao">
                </div>
                <div class="field">
                    <label for="walkin-age">Age <span>*</span></label>
                    <input id="walkin-age" name="age" type="number" min="0" max="120" inputmode="numeric" required placeholder="32">
                </div>
                <div class="field">
                    <label for="walkin-gender">Gender</label>
                    <select id="walkin-gender" name="gender">
                        <option value="Not specified">Prefer not to say</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="field">
                    <label for="walkin-triage">Triage priority <span>*</span></label>
                    <select id="walkin-triage" name="triage" required>
                        <option value="Green">Green - routine</option>
                        <option value="Yellow">Yellow - urgent</option>
                        <option value="Red">Red - immediate</option>
                    </select>
                </div>
                <div class="field full">
                    <label for="walkin-clinician">Clinician queue <span>*</span></label>
                    <select id="walkin-clinician" name="doctorPref" required>
                        <option value="Dr Meera Shah - Internal medicine">Dr Meera Shah - Internal medicine</option>
                        <option value="Dr Arjun Rao - General care">Dr Arjun Rao - General care</option>
                        <option value="Triage clinician - Emergency and acute care">Triage clinician - Emergency and acute care</option>
                    </select>
                </div>
                <div class="field full">
                    <label for="walkin-symptoms">Reason for visit <span>*</span></label>
                    <textarea id="walkin-symptoms" name="symptoms" rows="3" maxlength="300" required placeholder="Brief symptoms or reason for consultation"></textarea>
                    <span class="hint">Use clinical, non-sensitive summary text only in this demo.</span>
                </div>
                <div class="field full walkin-actions">
                    <button class="btn-primary btn-icon" type="submit">${icon('list-plus', 16)} Add to live queue</button>
                    <button class="btn-secondary" id="cancel-walkin" type="button">Cancel</button>
                </div>
            </form>
        `;
        quickActions.insertAdjacentElement('afterend', walkInPanel);

        container.querySelector('#workspace-logout').onclick = logout;
        container.querySelector('#staff-back').onclick = () => setView('landing');
        const openWalkIn = container.querySelector('#open-walkin');
        const closeWalkIn = () => {
            walkInPanel.hidden = true;
            openWalkIn.setAttribute('aria-expanded', 'false');
            openWalkIn.focus();
        };
        openWalkIn.onclick = () => {
            walkInPanel.hidden = false;
            openWalkIn.setAttribute('aria-expanded', 'true');
            walkInPanel.querySelector('#walkin-name').focus();
            walkInPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        container.querySelector('#close-walkin').onclick = closeWalkIn;
        container.querySelector('#cancel-walkin').onclick = closeWalkIn;
        container.querySelector('#walkin-form').onsubmit = async event => {
            event.preventDefault();
            const form = event.currentTarget;
            const submitButton = form.querySelector('button[type="submit"]');
            const fields = new FormData(form);
            submitButton.disabled = true;
            submitButton.textContent = 'Adding to queue...';
            try {
                const patientId = await window.App.DB.addPatient({
                    name: String(fields.get('name') || '').trim(),
                    age: fields.get('age'),
                    gender: fields.get('gender'),
                    triage: fields.get('triage'),
                    doctorPref: fields.get('doctorPref'),
                    symptoms: String(fields.get('symptoms') || '').trim(),
                    area: 'Front desk walk-in',
                    hospital: state.loggedHospital || 'SmartCare Community Hospital',
                    country: state.loggedCountry || 'India',
                    state: state.loggedState || 'Telangana',
                    city: state.loggedCity || 'Hyderabad'
                });
                window.App.UI.toast(`Walk-in ${patientId} added to the live queue.`, 'success');
                window.App.Store.navigate('/dashboard/queue');
            } catch (error) {
                submitButton.disabled = false;
                submitButton.innerHTML = `${icon('list-plus', 16)} Add to live queue`;
                window.App.UI.toast(error.message || 'The walk-in could not be added.', 'error');
                if (window.lucide) window.lucide.createIcons();
            }
        };
        container.querySelectorAll('[data-room-index]').forEach(button => button.onclick = () => {
            const room = rooms[Number(button.dataset.roomIndex)];
            room[2] = room[2] === 'Available' ? 'In use' : 'Available';
            saveRooms();
            button.setAttribute('aria-pressed', room[2] === 'In use');
            button.querySelector('.room-status').textContent = room[2];
            window.App.UI.toast(`${room[0]} is now ${room[2].toLowerCase()}.`, 'success');
        });

        window.App.UI.bindTopbarControls(container);
        container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav('staff', state.route));
        window.App.UI.bindMobileBottomNav(container);
        if (window.lucide) window.lucide.createIcons();
        return container;
    };
})();

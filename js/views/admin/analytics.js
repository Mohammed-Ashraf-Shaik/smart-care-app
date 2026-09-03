(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

    window.App.Views.Analytics = function () {
        const { state, setView, getQueueMetrics, logout } = window.App.Store;
        const container = document.createElement('div');
        container.className = 'flow-shell workspace-shell';

        let selectedRange = 'today'; // 'today' | 'week' | 'month'

        const isStaff = state.loggedRole === 'staff';
        const overviewRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin';
        const overviewLabel = state.loggedRole === 'doctor' ? 'Overview' : 'Operations';
        const helpRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/help' : '/dashboard/admin/help';
        const donRoute = state.loggedRole === 'doctor' ? '/dashboard/doctor/donations' : '/dashboard/admin/donations';

        function getRangeData(range) {
            const baseMetrics = getQueueMetrics();
            if (range === 'week') {
                return {
                    label: '7-day sample',
                    period: 'Illustrative dataset',
                    sample: true,
                    waiting: 48,
                    avgWait: '14m',
                    priority: 9,
                    revenue: '₹14,850',
                    bars: [
                        { label: 'Mon', height: 65, count: 42 },
                        { label: 'Tue', height: 82, count: 56 },
                        { label: 'Wed', height: 50, count: 35 },
                        { label: 'Thu', height: 75, count: 51 },
                        { label: 'Fri', height: 90, count: 62 },
                        { label: 'Sat', height: 40, count: 28 },
                        { label: 'Sun', height: 25, count: 18 }
                    ],
                    peakHour: 'Friday 10:30 AM',
                    topDept: 'General Medicine (44%)',
                    health: 'Sample: optimal capacity',
                    roomUtilization: 'Sample: 84%'
                };
            }
            if (range === 'month') {
                return {
                    label: 'Monthly sample',
                    period: 'Illustrative dataset',
                    sample: true,
                    waiting: 194,
                    avgWait: '16m',
                    priority: 34,
                    revenue: '₹58,400',
                    bars: [
                        { label: 'Week 1', height: 70, count: 120 },
                        { label: 'Week 2', height: 85, count: 145 },
                        { label: 'Week 3', height: 95, count: 160 },
                        { label: 'Week 4', height: 60, count: 98 }
                    ],
                    peakHour: 'Mornings 09:00–12:00',
                    topDept: 'Emergency & Triage (38%)',
                    health: 'Sample: stable flow',
                    roomUtilization: 'Sample: 84%'
                };
            }

            const hourlyCounts = state.queue.reduce((counts, patient) => {
                const arrival = new Date(patient.created_at || Date.now());
                const hour = Number.isNaN(arrival.getTime()) ? new Date().getHours() : arrival.getHours();
                counts[hour] = (counts[hour] || 0) + 1;
                return counts;
            }, {});
            const maxHourlyCount = Math.max(1, ...Object.values(hourlyCounts));
            const liveBars = Object.entries(hourlyCounts)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([hour, count]) => ({
                    label: `${String(hour).padStart(2, '0')}:00`,
                    height: Math.max(12, Math.round((count / maxHourlyCount) * 100)),
                    count
                }));
            const departmentCounts = state.queue.reduce((counts, patient) => {
                const department = patient.doctorPref || patient.doctor_pref || 'General care';
                counts[department] = (counts[department] || 0) + 1;
                return counts;
            }, {});
            const topDepartment = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No active demand';
            const peakBar = [...liveBars].sort((a, b) => b.count - a.count)[0];

            return {
                label: 'Current queue',
                period: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
                sample: false,
                waiting: baseMetrics.waiting,
                avgWait: `${baseMetrics.averageWait}m`,
                priority: baseMetrics.priority,
                revenue: `₹${baseMetrics.revenue}`,
                bars: liveBars,
                peakHour: peakBar ? `${peakBar.label} (${peakBar.count} active)` : 'No arrivals in current queue',
                topDept: topDepartment,
                health: baseMetrics.waiting === 0 ? 'Queue clear' : baseMetrics.waiting < 8 ? 'Within target' : 'High volume',
                roomUtilization: 'Not measured'
            };
        }

        function exportCSV() {
            const data = getRangeData(selectedRange);
            const csvCell = value => {
                let text = String(value ?? '');
                if (/^[=+\-@]/.test(text)) text = `'${text}`;
                return `"${text.replace(/"/g, '""')}"`;
            };
            const rows = [
                ['SmartCare Queue Report'],
                ['Dataset', data.sample ? 'Illustrative sample — not operational history' : 'Current active queue snapshot'],
                ['Hospital', state.loggedHospital || 'SmartCare Community Hospital'],
                ['Date Range', data.label + ' (' + data.period + ')'],
                ['Export Timestamp', new Date().toISOString()],
                [''],
                ['--- OPERATIONAL SUMMARY ---'],
                ['Total Patient Volume', data.waiting],
                ['Average Wait Time', data.avgWait],
                ['Priority Red Cases', data.priority],
                ['Total Estimated Revenue', data.revenue],
                ['Peak Rush Period', data.peakHour],
                ['Top Department Demand', data.topDept],
                ['Queue Health Status', data.health],
                [''],
                ['--- ACTIVE QUEUE / BREAKDOWN ---'],
                ['Patient ID', 'Patient Name', 'Age', 'Gender', 'Care Preference / Symptoms', 'Triage Level', 'Status', 'Fee (INR)', 'Created At']
            ];

            if (state.queue.length) {
                state.queue.forEach(p => {
                    rows.push([
                        p.id || 'N/A',
                        p.name || 'Anonymous',
                        p.age || 'N/A',
                        p.gender || 'N/A',
                        p.symptoms || p.problem || p.doctorPref || 'General',
                        p.triage || 'Green',
                        p.status || 'waiting',
                        p.fee || 125,
                        p.created_at || new Date().toISOString()
                    ]);
                });
            } else rows.push(['No active queue entries']);

            const csvContent = rows.map(row => row.map(csvCell).join(',')).join('\n');
            const encodedUri = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `SmartCare_Queue_Report_${selectedRange}_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(encodedUri);
            window.App.UI.toast(`Exported ${data.label} CSV report.`, 'success');
        }

        function render() {
            const data = getRangeData(selectedRange);

            container.innerHTML = `
                <div class="flow-topbar">
                    <a class="brand-lockup" data-route="/" href="/">
                        <span class="brand-mark">${icon('heart-pulse', 20)}</span>
                        <span><span class="brand-name">SmartCare</span><span class="brand-caption">Analytics workspace</span></span>
                    </a>
                    <div class="flow-topbar-actions">
                        ${window.App.UI.topbarControls(true)}
                        <a id="analytics-back" class="back-link" data-route="${overviewRoute}" href="${overviewRoute}">
                            ${icon('arrow-left', 16)} ${overviewLabel}
                        </a>
                    </div>
                </div>
                <main class="provider-shell section-dashboard" data-section="analytics-dashboard">
                    <header class="provider-header">
                        <div>
                            <div class="eyebrow" style="color:var(--teal)"><span class="eyebrow-dot"></span> Performance analytics</div>
                            <h1>See where care slows down.</h1>
                            <p>${esc(state.loggedHospital || 'SmartCare Community Hospital')} · ${data.sample ? 'Clearly labeled demo sample' : 'Current active queue snapshot'}</p>
                        </div>
                        <div class="provider-date">${icon('calendar-days', 14)} ${esc(data.period)}<br><strong>Refreshes with the queue</strong></div>
                    </header>

                    <div class="analytics-toolbar">
                        <div class="range-pill-group" role="tablist" aria-label="Date Range Filter">
                            <button type="button" role="tab" aria-selected="${selectedRange === 'today'}" class="range-pill-btn ${selectedRange === 'today' ? 'active' : ''}" data-range="today">
                                ${icon('clock', 13)} Current queue
                            </button>
                            <button type="button" role="tab" aria-selected="${selectedRange === 'week'}" class="range-pill-btn ${selectedRange === 'week' ? 'active' : ''}" data-range="week">
                                ${icon('calendar-days', 13)} 7-day sample
                            </button>
                            <button type="button" role="tab" aria-selected="${selectedRange === 'month'}" class="range-pill-btn ${selectedRange === 'month' ? 'active' : ''}" data-range="month">
                                ${icon('calendar-range', 13)} Monthly sample
                            </button>
                        </div>

                        <div class="analytics-export-group">
                            <button type="button" class="btn-secondary btn-icon" id="btn-export-csv" style="min-height:2.3rem;font-size:.75rem;padding:.4rem .85rem">
                                ${icon('download', 14)} Export CSV / Excel
                            </button>
                            <button type="button" class="btn-secondary btn-icon" id="btn-print-report" style="min-height:2.3rem;font-size:.75rem;padding:.4rem .85rem">
                                ${icon('printer', 14)} Print Summary
                            </button>
                        </div>
                    </div>

                    <div class="provider-stats">
                        <div class="provider-stat">
                            <span>${data.sample ? 'Sample patient volume' : 'Active visits'}</span>
                            <strong>${data.waiting}</strong>
                            <small>${data.sample ? 'Illustrative, not stored history' : 'Current queue entries'}</small>
                        </div>
                        <div class="provider-stat">
                            <span>Average Wait Time</span>
                            <strong>${data.avgWait}</strong>
                            <small>${data.sample ? 'Illustrative duration' : 'Time since queue arrival'}</small>
                        </div>
                        <div class="provider-stat">
                            <span>Priority Triage</span>
                            <strong>${data.priority}</strong>
                            <small>${data.sample ? 'Illustrative red cases' : 'Red cases in current queue'}</small>
                        </div>
                        <div class="provider-stat">
                            <span>Consultation Value</span>
                            <strong>${data.revenue}</strong>
                            <small>${data.sample ? 'Illustrative value' : 'Estimated from active visits'}</small>
                        </div>
                    </div>

                    <div class="provider-grid">
                        <section id="tab-volume" data-tab-panel="volume" class="provider-card" data-section="analytics-volume">
                            <div class="provider-card-heading">
                                <div>
                                    <h2>Queue activity distribution (${data.label})</h2>
                                    <p>Track arrival spikes to balance doctors and triage desk rooms.</p>
                                </div>
                            </div>
                            ${data.bars.length ? `<div class="chart-bars" role="img" aria-label="${data.sample ? 'Illustrative' : 'Current'} queue activity by arrival hour">
                                ${data.bars.map(b => `
                                    <div class="chart-column">
                                        <div class="chart-bar" style="height:${b.height}%" title="${b.label}: ${b.count || b.height} visits"></div>
                                        <small>${b.label}</small>
                                    </div>`).join('')}
                            </div>` : `<div class="provider-empty">${icon('chart-no-axes-column', 28)}<p>No active arrivals to chart.</p></div>`}
                        </section>

                        <section id="tab-signals" data-tab-panel="signals" class="provider-card" data-section="analytics-signals">
                            <div class="provider-card-heading">
                                <div>
                                    <h2>Operational Signals &amp; Bottlenecks</h2>
                                    <p>${data.sample ? 'Illustrative planning signals.' : 'Signals derived from the current active queue only.'}</p>
                                </div>
                            </div>
                            <div class="summary-row"><span>Peak Rush Window</span><strong>${data.peakHour}</strong></div>
                            <div class="summary-row"><span>Top department demand</span><strong>${esc(data.topDept)}</strong></div>
                            <div class="summary-row"><span>Queue Flow Status</span><strong style="color:var(--teal)">${data.health}</strong></div>
                            <div class="summary-row"><span>Room utilization</span><strong>${data.roomUtilization}</strong></div>
                            <a class="btn-secondary btn-wide btn-icon" data-route="${overviewRoute}" href="${overviewRoute}" style="margin-top:1rem">
                                Back to ${overviewLabel} ${icon('arrow-right', 16)}
                            </a>
                        </section>
                    </div>
                </main>
                ${window.App.UI.footer(true)}`;

            const workspaceNav = document.createElement('nav');
            workspaceNav.className = 'workspace-tabs';
            workspaceNav.setAttribute('aria-label', 'Analytics workspace navigation');
            workspaceNav.innerHTML = `
                <a href="${overviewRoute}" data-route="${overviewRoute}">${icon('layout-dashboard', 16)}<span>${overviewLabel}</span></a>
                ${isStaff ? `<a href="/dashboard/admin?tab=rooms" data-tab="rooms" data-tab-route="/dashboard/admin">${icon('door-open', 16)}<span>Rooms</span></a>` : ''}
                <a href="/dashboard/queue" data-route="/dashboard/queue">${icon('list-ordered', 16)}<span>Queue</span></a>
                <a class="active" href="/dashboard/analytics" data-route="/dashboard/analytics">${icon('bar-chart-3', 16)}<span>Analytics</span></a>
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

            // Bind Range Filter Pills
            container.querySelectorAll('.range-pill-btn').forEach(btn => {
                btn.onclick = () => {
                    selectedRange = btn.dataset.range;
                    render();
                };
            });

            // Bind Export Buttons
            container.querySelector('#btn-export-csv').onclick = exportCSV;
            container.querySelector('#btn-print-report').onclick = () => window.print();

            container.querySelector('#workspace-logout').onclick = logout;
            container.querySelector('#analytics-back').onclick = event => {
                event.preventDefault();
                setView(state.loggedRole === 'doctor' ? 'doctor' : 'staff');
            };

            window.App.UI.bindTopbarControls(container);
            container.insertAdjacentHTML('beforeend', window.App.UI.mobileBottomNav(state.loggedRole, state.route));
            window.App.UI.bindMobileBottomNav(container);
            if (window.lucide) window.lucide.createIcons();
        }

        render();
        return container;
    };
})();

(function () {
    const routeMap = { landing: '/', patientDashboard: '/dashboard/patient', patient: '/dashboard/patient/apply/1', login: '/login', doctor: '/dashboard/doctor', queue: '/dashboard/queue', staff: '/dashboard/admin', analytics: '/dashboard/analytics', donations: '/donate', about: '/about', terms: '/terms', privacy: '/privacy', notFound: '/404' };
    const pathMap = { '/': 'landing', '/apply': 'patientDashboard', '/dashboard/patient/apply': 'patientDashboard', '/login': 'login', '/dashboard/patient': 'patientDashboard', '/dashboard/patient/visits': 'patientDashboard', '/dashboard/patient/profile': 'patientDashboard', '/dashboard/patient/help': 'about', '/dashboard/doctor': 'doctor', '/dashboard/doctor/help': 'about', '/dashboard/hospital': 'doctor', '/dashboard/queue': 'queue', '/dashboard/admin': 'staff', '/dashboard/admin/rooms': 'staff', '/dashboard/admin/help': 'about', '/dashboard/analytics': 'analytics', '/dashboard/analytics/help': 'about', '/donate': 'donations', '/donate/blood': 'donations', '/donate/organ': 'donations', '/about': 'about', '/terms': 'terms', '/privacy': 'privacy', '/404': 'notFound' };
    const basePath = window.SMARTCARE_BASE_PATH || '';
    const draftKey = 'smartcare.patientDraft';
    const sessionKey = 'smartcare.session';
    const emptyPatientData = () => ({ name: '', age: '', gender: '', doctorPref: '', area: '', symptoms: '', hospital: '', country: '', state: '', city: '' });
    const readStorage = key => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };
    const savedDraft = readStorage(draftKey);
    const patientVisitKey = 'smartcare.patientVisits';
    const savedVisits = readStorage(patientVisitKey);
    const defaultVisits = [{ id: 'visit-demo-001', hospital: 'SmartCare Community Hospital', city: 'Hyderabad', reason: 'General consultation', date: '18 Jul 2026', status: 'Completed', reference: 'SC-DEMO18' }, { id: 'visit-demo-002', hospital: 'Green Cross Medical Centre', city: 'Hyderabad', reason: 'Follow-up consultation', date: '04 Jun 2026', status: 'Completed', reference: 'SC-DEMO04' }];
    const state = {
        view: 'landing', route: '/', activeTab: '', step: Number(savedDraft?.step) || 1, infoPage: 'about',
        patientData: { ...emptyPatientData(), ...(savedDraft?.patientData || {}) },
        patientVisits: Array.isArray(savedVisits) && savedVisits.length ? savedVisits : defaultVisits,
        userCoords: savedDraft?.userCoords || null, tempHospitals: savedDraft?.tempHospitals || [], searchRadius: savedDraft?.searchRadius || 0,
        queue: [], loggedHospital: '', loggedCountry: '', loggedState: '', loggedCity: '', isLogged: false, loggedEmail: '', loggedRole: '', auth: { targetRole: 'patient' }
    };
    const listeners = [];
    let fullQueue = [];

    function subscribe(callback) { listeners.push(callback); }
    function notify() { listeners.forEach(callback => callback(state)); }
    function stripBasePath(pathname) { if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) return pathname.slice(basePath.length) || '/'; return pathname || '/'; }
    function withBasePath(pathname) { const logicalPath = stripBasePath(pathname); return `${basePath}${logicalPath === '/' ? '/' : logicalPath}`; }
    function hrefFor(path) {
        const url = new URL(path, `${window.location.origin}${basePath}/`);
        url.pathname = withBasePath(url.pathname);
        return `${url.pathname}${url.search}${url.hash}`;
    }
    function tabPath(pathname, tab = '') {
        const path = stripBasePath(pathname);
        if (tab === 'apply' && (path === '/apply' || path === '/dashboard/patient' || path.startsWith('/dashboard/patient/apply'))) return `/dashboard/patient/apply/${state.step || 1}`;
        if (path === '/dashboard/patient' && ['visits', 'profile'].includes(tab)) return `/dashboard/patient/${tab}`;
        if (path === '/dashboard/admin' && tab === 'rooms') return '/dashboard/admin/rooms';
        if (path === '/donate' && ['blood', 'organ'].includes(tab)) return `/donate/${tab}`;
        return path;
    }
    function hrefForTab(path, tab = '') {
        const url = new URL(hrefFor(path), window.location.origin);
        url.pathname = withBasePath(tabPath(url.pathname, tab));
        url.searchParams.delete('tab');
        return `${url.pathname}${url.search}${url.hash}`;
    }
    function tabForPath(pathname) {
        const path = stripBasePath(pathname);
        if (path.startsWith('/dashboard/patient/apply')) return 'apply';
        if (path === '/dashboard/patient/visits') return 'visits';
        if (path === '/dashboard/patient/profile') return 'profile';
        if (path === '/dashboard/admin/rooms') return 'rooms';
        if (path === '/donate/blood') return 'blood';
        if (path === '/donate/organ') return 'organ';
        const queryTab = new URLSearchParams(window.location.search).get('tab') || '';
        if (path === '/dashboard/patient' && ['apply', 'visits', 'profile'].includes(queryTab)) return queryTab;
        if (path === '/dashboard/admin' && queryTab === 'rooms') return queryTab;
        if (path === '/donate' && ['blood', 'organ'].includes(queryTab)) return queryTab;
        return '';
    }
    function viewForPath(pathname) {
        const stripped = stripBasePath(pathname);
        if (stripped.startsWith('/dashboard/patient/apply') || stripped === '/apply') return 'patientDashboard';
        return pathMap[stripped] || 'notFound';
    }
    function routeForView(view) { return routeMap[view] || '/'; }
    function requiredRole(view) { return view === 'patientDashboard' ? ['patient'] : ['doctor', 'queue'].includes(view) ? ['doctor', 'staff'] : view === 'analytics' ? ['doctor', 'staff'] : view === 'staff' ? ['staff'] : ''; }
    function requiredRoleForPath(pathname, view) {
        const path = stripBasePath(pathname);
        if (path === '/dashboard/patient' || path.startsWith('/dashboard/patient/')) return ['patient'];
        if (path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')) return ['staff'];
        if (path === '/dashboard/doctor' || path.startsWith('/dashboard/doctor/') || path === '/dashboard/hospital') return ['doctor'];
        if (path === '/dashboard/queue' || path === '/dashboard/analytics') return ['doctor', 'staff'];
        return requiredRole(view);
    }
    function roleAllowed(required, actual) { return !required || required.includes(actual); }
    function persistDraft() {
        try { window.localStorage.setItem(draftKey, JSON.stringify({ step: state.step, patientData: state.patientData, userCoords: state.userCoords, tempHospitals: state.tempHospitals, searchRadius: state.searchRadius })); } catch { /* local persistence is optional */ }
    }
    function clearDraft() { try { window.localStorage.removeItem(draftKey); } catch { /* local persistence is optional */ } }
    function persistSession() {
        if (!state.isLogged || window.App.Config?.supabaseEnabled === true) return;
        try { window.localStorage.setItem(sessionKey, JSON.stringify({ email: state.loggedEmail, role: state.loggedRole, hospital: state.loggedHospital, country: state.loggedCountry, state: state.loggedState, city: state.loggedCity, expiresAt: state.sessionExpiresAt })); } catch { /* local persistence is optional */ }
    }
    function hydrateSession() {
        if (window.App.Config?.supabaseEnabled === true) return;
        const session = readStorage(sessionKey);
        if (!session || !session.expiresAt || session.expiresAt <= Date.now()) { try { window.localStorage.removeItem(sessionKey); } catch {} return; }
        if (!['patient', 'doctor', 'staff'].includes(session.role)) { try { window.localStorage.removeItem(sessionKey); } catch {} return; }
        state.isLogged = true; state.loggedEmail = session.email || ''; state.loggedRole = session.role; state.loggedHospital = session.hospital || ''; state.loggedCountry = session.country || ''; state.loggedState = session.state || ''; state.loggedCity = session.city || ''; state.sessionExpiresAt = session.expiresAt;
    }
    function syncRoute(replace = false, shouldNotify = true) {
        let pathname = stripBasePath(window.location.pathname || '/');
        const queryTab = new URLSearchParams(window.location.search).get('tab') || '';
        const canonicalPath = tabPath(pathname, queryTab);
        if (queryTab && canonicalPath !== pathname) {
            const canonicalUrl = new URL(window.location.href);
            canonicalUrl.pathname = withBasePath(canonicalPath);
            canonicalUrl.searchParams.delete('tab');
            window.history.replaceState({}, '', canonicalUrl.pathname + canonicalUrl.search + canonicalUrl.hash);
            pathname = canonicalPath;
        }
        let view = viewForPath(pathname);
        const neededRole = requiredRoleForPath(pathname, view);
        if (neededRole && !state.isLogged) {
            setAuthTarget(neededRole[0]);
            const loginPath = hrefFor(`/login?role=${state.auth.targetRole}`);
            window.history.replaceState({}, '', loginPath);
            view = 'login'; state.route = '/login';
        } else if (neededRole && state.loggedRole && !roleAllowed(neededRole, state.loggedRole)) {
            setAuthTarget(neededRole[0]);
            window.history.replaceState({}, '', hrefFor(`/login?role=${neededRole[0]}`));
            view = 'login'; state.route = '/login';
        } else state.route = pathname;
        if (pathname === '/apply') {
            const cleanPath = hrefFor('/dashboard/patient/apply/1');
            window.history.replaceState({}, '', cleanPath);
            state.route = '/dashboard/patient/apply/1';
            state.activeTab = 'apply';
            state.step = 1;
        } else if (pathname.startsWith('/dashboard/patient/apply')) {
            state.activeTab = 'apply';
            const parts = pathname.split('/');
            const lastPart = parts[parts.length - 1];
            const stepNum = Number(lastPart);
            if (Number.isInteger(stepNum) && stepNum >= 1 && stepNum <= 4) {
                state.step = stepNum;
            } else {
                state.step = 1;
            }
        } else {
            state.activeTab = tabForPath(pathname);
        }
        state.view = view;
        if (view === 'about' || view === 'terms' || view === 'privacy') {
            const isHelpPath = pathname.endsWith('/help');
            state.infoPage = isHelpPath ? 'about' : view;
        }
        const role = new URLSearchParams(window.location.search).get('role');
        if (['patient', 'doctor', 'staff'].includes(role)) setAuthTarget(role);
        if (shouldNotify) notify();
    }
    function navigate(path, replace = false) {
        const url = new URL(path, `${window.location.origin}${basePath}/`);
        const view = viewForPath(url.pathname);
        const neededRole = requiredRoleForPath(url.pathname, view);
        if (neededRole && !state.isLogged) { setAuthTarget(neededRole[0]); url.pathname = withBasePath('/login'); url.searchParams.set('role', neededRole[0]); }
        else if (neededRole && state.loggedRole && !roleAllowed(neededRole, state.loggedRole)) { setAuthTarget(neededRole[0]); url.pathname = withBasePath('/login'); url.searchParams.set('role', neededRole[0]); }
        else url.pathname = withBasePath(url.pathname);
        window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
        syncRoute(false, false);
        if (view === 'landing') resetPatient();
        notify();
    }
    function navigateTab(tab, route = state.route) {
        if (tab === 'apply') {
            navigate(`/dashboard/patient/apply/${state.step || 1}`);
            return;
        }
        const safeRoute = route && route.startsWith('/') ? route : '/';
        const nextUrl = new URL(hrefForTab(safeRoute, tab), window.location.origin);
        window.history.pushState({}, '', nextUrl.pathname + nextUrl.search);
        syncRoute(false, false);
        notify();
    }
    function setView(newView) { navigate(routeForView(newView)); }
    function setStep(newStep) { state.step = Math.max(1, Math.min(4, Number(newStep) || 1)); if (state.step < 4) persistDraft(); else clearDraft(); if (state.view === 'patientDashboard' || state.activeTab === 'apply') { navigate(`/dashboard/patient/apply/${state.step}`); } else { notify(); } }
    function setAuthTarget(role) { state.auth.targetRole = ['patient', 'doctor', 'staff'].includes(role) ? role : 'patient'; }
    function updatePatientData(key, value, shouldNotify = false) { state.patientData[key] = value; persistDraft(); if (shouldNotify) notify(); }
    function recordPatientVisit(visit) { state.patientVisits = [visit, ...state.patientVisits.filter(item => item.id !== visit.id)].slice(0, 12); try { window.localStorage.setItem(patientVisitKey, JSON.stringify(state.patientVisits)); } catch { /* local history is optional */ } }
    function updateQueue(newQueue) { fullQueue = Array.isArray(newQueue) ? newQueue : []; const isAdmin = state.loggedRole === 'staff'; const scopedQueue = !isAdmin && state.loggedHospital && state.loggedCity && state.loggedState && state.loggedCountry ? fullQueue.filter(patient => patient.hospital === state.loggedHospital && patient.city === state.loggedCity && patient.state === state.loggedState && patient.country === state.loggedCountry) : fullQueue; state.queue = scopedQueue.filter(patient => !['completed', 'cancelled', 'no-show'].includes(String(patient.status || '').toLowerCase())); if (['doctor', 'staff', 'queue', 'analytics'].includes(state.view)) notify(); }
    function setLoggedLocation(country, stateName, city, hospital) { state.loggedCountry = country; state.loggedState = stateName; state.loggedCity = city; state.loggedHospital = hospital; updateQueue(fullQueue); persistSession(); }
    function setLogin(email, role = 'patient') { state.isLogged = true; state.loggedEmail = email; state.loggedRole = role; state.sessionExpiresAt = Date.now() + (window.App.Config?.sessionTtlMs || 28800000); persistSession(); notify(); }
    function applyRemoteSession(remote) {
        const profile = remote?.profile;
        if (!profile || !['doctor', 'staff'].includes(profile.role)) return false;
        state.isLogged = true; state.loggedEmail = profile.email || remote.user?.email || ''; state.loggedRole = profile.role; state.loggedHospital = profile.hospital || ''; state.loggedCountry = profile.country || ''; state.loggedState = profile.state || ''; state.loggedCity = profile.city || ''; state.sessionExpiresAt = remote.session?.expires_at ? remote.session.expires_at * 1000 : Date.now() + (window.App.Config?.sessionTtlMs || 28800000); updateQueue(fullQueue); return true;
    }
    function logout() { window.App.DB?.signOut?.(); state.isLogged = false; state.loggedEmail = ''; state.loggedRole = ''; state.loggedHospital = ''; state.loggedCountry = ''; state.loggedState = ''; state.loggedCity = ''; state.sessionExpiresAt = 0; try { window.localStorage.removeItem(sessionKey); } catch {} navigate('/'); }
    function resetPatient() { state.step = 1; state.patientData = emptyPatientData(); state.userCoords = null; state.tempHospitals = []; state.searchRadius = 0; clearDraft(); }
    function getRevenue() { return state.queue.reduce((total, patient) => total + (Number(patient.fee) || 0), 0); }
    function queueStatus(patient) { return String(patient?.status || 'waiting').toLowerCase(); }
    function queuePriority(patient) { return { red: 0, yellow: 1, green: 2 }[String(patient?.triage || 'Green').toLowerCase()] ?? 3; }
    function sortQueue(items = state.queue) { return [...items].sort((a, b) => { const statusRank = { in_progress: 0, called: 1, waiting: 2 }[queueStatus(a)] ?? 3; const otherStatusRank = { in_progress: 0, called: 1, waiting: 2 }[queueStatus(b)] ?? 3; return statusRank - otherStatusRank || queuePriority(a) - queuePriority(b) || new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(); }); }
    function getNextPatient() { return sortQueue().find(patient => ['in_progress', 'called', 'waiting'].includes(queueStatus(patient))) || null; }
    async function transitionPatient(id, nextStatus) {
        const patient = state.queue.find(item => String(item.id) === String(id));
        if (!patient) return { success: false, error: 'This visit is no longer in the active queue.' };
        const currentStatus = queueStatus(patient);
        const allowed = { waiting: 'called', called: 'in_progress', in_progress: 'completed' };
        if (allowed[currentStatus] !== nextStatus) return { success: false, error: `This visit is already ${currentStatus.replace('_', ' ')}.` };
        if (nextStatus === 'called' && state.queue.some(item => ['called', 'in_progress'].includes(queueStatus(item)))) return { success: false, error: 'Finish the current consultation before calling another patient.' };
        if (nextStatus === 'in_progress' && state.queue.some(item => String(item.id) !== String(id) && queueStatus(item) === 'in_progress')) return { success: false, error: 'Finish the current consultation before starting another visit.' };
        try {
            await window.App.DB.updatePatient(id, { status: nextStatus });
            const freshQueue = await window.App.DB.fetchQueue();
            updateQueue(freshQueue);
            const visitStatus = { called: 'Called', in_progress: 'In consultation', completed: 'Completed' }[nextStatus];
            const historyVisit = state.patientVisits.find(visit => String(visit.id) === String(id));
            if (visitStatus && historyVisit) recordPatientVisit({ ...historyVisit, status: visitStatus });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'The queue update failed.' };
        }
    }
    function getQueueMetrics() {
        const waiting = state.queue.filter(patient => !['completed', 'cancelled', 'no-show'].includes(String(patient.status || '').toLowerCase()));
        const waits = waiting.map(patient => Math.max(0, Math.round((Date.now() - new Date(patient.created_at || Date.now()).getTime()) / 60000))).filter(Number.isFinite);
        const averageWait = waits.length ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length) : 0;
        const waitingOnly = waiting.filter(patient => queueStatus(patient) === 'waiting');
        const called = waiting.filter(patient => queueStatus(patient) === 'called');
        const inProgress = waiting.filter(patient => queueStatus(patient) === 'in_progress');
        return { waiting: waiting.length, waitingOnly: waitingOnly.length, called: called.length, inProgress: inProgress.length, priority: waiting.filter(patient => patient.triage === 'Red').length, averageWait, revenue: waiting.reduce((sum, patient) => sum + (Number(patient.fee) || 0), 0) };
    }
    function initSync() { window.App.DB.fetchQueue().then(updateQueue).catch(() => updateQueue([])); window.App.DB.listenToQueue(updateQueue); if (window.App.Config?.supabaseEnabled === true) { window.App.DB.getCurrentUser?.().then(remote => { if (remote && applyRemoteSession(remote)) { syncRoute(false, true); } }).catch(() => {}); window.App.DB.listenToAuth?.(session => { if (!session) { state.isLogged = false; state.loggedRole = ''; state.loggedEmail = ''; notify(); return; } window.App.DB.getCurrentUser?.().then(remote => { if (remote && applyRemoteSession(remote)) { syncRoute(false, true); } }).catch(() => {}); }); } }

    hydrateSession();
    syncRoute(true, false);
    window.setInterval(() => { if (state.isLogged && state.sessionExpiresAt && state.sessionExpiresAt <= Date.now()) logout(); }, 60000);
    if (window.App.DB) initSync(); else window.addEventListener('load', () => { if (window.App.DB) initSync(); });
    window.App.Store = { state, subscribe, setView, navigate, navigateTab, syncRoute, setStep, setAuthTarget, updatePatientData, updateQueue, setLoggedLocation, setLogin, recordPatientVisit, logout, getRevenue, getQueueMetrics, getNextPatient, sortQueue, transitionPatient, persistDraft, hrefFor, hrefForTab };
})();

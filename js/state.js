(function () {
    const routeMap = { landing: '/', patientDashboard: '/dashboard/patient', patient: '/apply', login: '/login', doctor: '/dashboard/doctor', queue: '/dashboard/queue', staff: '/dashboard/admin', analytics: '/dashboard/analytics', about: '/about', terms: '/terms', privacy: '/privacy', notFound: '/404' };
    const pathMap = { '/': 'landing', '/apply': 'patient', '/login': 'login', '/dashboard/patient': 'patientDashboard', '/dashboard/doctor': 'doctor', '/dashboard/hospital': 'doctor', '/dashboard/queue': 'queue', '/dashboard/admin': 'staff', '/dashboard/analytics': 'analytics', '/about': 'about', '/terms': 'terms', '/privacy': 'privacy', '/404': 'notFound' };
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
    function hrefForTab(path, tab = '') {
        const url = new URL(hrefFor(path), window.location.origin);
        if (tab) url.searchParams.set('tab', tab); else url.searchParams.delete('tab');
        return `${url.pathname}${url.search}${url.hash}`;
    }
    function viewForPath(pathname) { return pathMap[stripBasePath(pathname)] || 'notFound'; }
    function routeForView(view) { return routeMap[view] || '/'; }
    function requiredRole(view) { return view === 'patientDashboard' ? ['patient'] : ['doctor', 'queue'].includes(view) ? ['doctor', 'staff'] : view === 'analytics' ? ['doctor', 'staff'] : view === 'staff' ? ['staff'] : ''; }
    function roleAllowed(required, actual) { return !required || required.includes(actual); }
    function persistDraft() {
        try { window.localStorage.setItem(draftKey, JSON.stringify({ step: state.step, patientData: state.patientData, userCoords: state.userCoords, tempHospitals: state.tempHospitals, searchRadius: state.searchRadius })); } catch { /* local persistence is optional */ }
    }
    function clearDraft() { try { window.localStorage.removeItem(draftKey); } catch { /* local persistence is optional */ } }
    function persistSession() {
        if (!state.isLogged) return;
        try { window.localStorage.setItem(sessionKey, JSON.stringify({ email: state.loggedEmail, role: state.loggedRole, hospital: state.loggedHospital, country: state.loggedCountry, state: state.loggedState, city: state.loggedCity, expiresAt: state.sessionExpiresAt })); } catch { /* local persistence is optional */ }
    }
    function hydrateSession() {
        const session = readStorage(sessionKey);
        if (!session || !session.expiresAt || session.expiresAt <= Date.now()) { try { window.localStorage.removeItem(sessionKey); } catch {} return; }
        if (!['patient', 'doctor', 'staff'].includes(session.role)) { try { window.localStorage.removeItem(sessionKey); } catch {} return; }
        state.isLogged = true; state.loggedEmail = session.email || ''; state.loggedRole = session.role; state.loggedHospital = session.hospital || ''; state.loggedCountry = session.country || ''; state.loggedState = session.state || ''; state.loggedCity = session.city || ''; state.sessionExpiresAt = session.expiresAt;
    }
    function syncRoute(replace = false, shouldNotify = true) {
        const pathname = stripBasePath(window.location.pathname || '/');
        let view = viewForPath(pathname);
        const neededRole = requiredRole(view);
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
        state.activeTab = new URLSearchParams(window.location.search).get('tab') || '';
        state.view = view;
        if (view === 'about' || view === 'terms' || view === 'privacy') state.infoPage = view;
        const role = new URLSearchParams(window.location.search).get('role');
        if (['patient', 'doctor', 'staff'].includes(role)) setAuthTarget(role);
        if (shouldNotify) notify();
    }
    function navigate(path, replace = false) {
        const url = new URL(path, `${window.location.origin}${basePath}/`);
        const view = viewForPath(url.pathname);
        const neededRole = requiredRole(view);
        if (neededRole && !state.isLogged) { setAuthTarget(neededRole[0]); url.pathname = withBasePath('/login'); url.searchParams.set('role', neededRole[0]); }
        else if (neededRole && state.loggedRole && !roleAllowed(neededRole, state.loggedRole)) { setAuthTarget(neededRole[0]); url.pathname = withBasePath('/login'); url.searchParams.set('role', neededRole[0]); }
        else url.pathname = withBasePath(url.pathname);
        window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
        syncRoute(false, false);
        if (view === 'landing') resetPatient();
        notify();
    }
    function navigateTab(tab, route = state.route) {
        const safeRoute = route && route.startsWith('/') ? route : '/';
        const nextUrl = new URL(hrefForTab(safeRoute, tab), window.location.origin);
        window.history.pushState({}, '', nextUrl.pathname + nextUrl.search);
        syncRoute(false, false);
        notify();
    }
    function setView(newView) { navigate(routeForView(newView)); }
    function setStep(newStep) { state.step = Math.max(1, Math.min(4, Number(newStep) || 1)); if (state.step < 4) persistDraft(); else clearDraft(); notify(); }
    function setAuthTarget(role) { state.auth.targetRole = ['patient', 'doctor', 'staff'].includes(role) ? role : 'patient'; }
    function updatePatientData(key, value, shouldNotify = false) { state.patientData[key] = value; persistDraft(); if (shouldNotify) notify(); }
    function recordPatientVisit(visit) { state.patientVisits = [visit, ...state.patientVisits.filter(item => item.id !== visit.id)].slice(0, 12); try { window.localStorage.setItem(patientVisitKey, JSON.stringify(state.patientVisits)); } catch { /* local history is optional */ } }
    function updateQueue(newQueue) { fullQueue = Array.isArray(newQueue) ? newQueue : []; if (state.loggedHospital && state.loggedCity && state.loggedState && state.loggedCountry) state.queue = fullQueue.filter(patient => patient.hospital === state.loggedHospital && patient.city === state.loggedCity && patient.state === state.loggedState && patient.country === state.loggedCountry); else state.queue = fullQueue; if (['doctor', 'staff', 'analytics'].includes(state.view)) notify(); }
    function setLoggedLocation(country, stateName, city, hospital) { state.loggedCountry = country; state.loggedState = stateName; state.loggedCity = city; state.loggedHospital = hospital; updateQueue(fullQueue); persistSession(); }
    function setLogin(email, role = 'patient') { state.isLogged = true; state.loggedEmail = email; state.loggedRole = role; state.sessionExpiresAt = Date.now() + (window.App.Config?.sessionTtlMs || 28800000); persistSession(); notify(); }
    function logout() { window.App.DB?.signOut?.(); state.isLogged = false; state.loggedEmail = ''; state.loggedRole = ''; state.loggedHospital = ''; state.loggedCountry = ''; state.loggedState = ''; state.loggedCity = ''; state.sessionExpiresAt = 0; try { window.localStorage.removeItem(sessionKey); } catch {} navigate('/'); }
    function resetPatient() { state.step = 1; state.patientData = emptyPatientData(); state.userCoords = null; state.tempHospitals = []; state.searchRadius = 0; clearDraft(); }
    function getRevenue() { return state.queue.reduce((total, patient) => total + (Number(patient.fee) || 0), 0); }
    function getQueueMetrics() {
        const waiting = state.queue.filter(patient => !['completed', 'cancelled', 'no-show'].includes(String(patient.status || '').toLowerCase()));
        const waits = waiting.map(patient => Math.max(0, Math.round((Date.now() - new Date(patient.created_at || Date.now()).getTime()) / 60000))).filter(Number.isFinite);
        const averageWait = waits.length ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length) : 0;
        return { waiting: waiting.length, priority: waiting.filter(patient => patient.triage === 'Red').length, averageWait, revenue: waiting.reduce((sum, patient) => sum + (Number(patient.fee) || 0), 0) };
    }
    function initSync() { window.App.DB.fetchQueue().then(updateQueue).catch(() => updateQueue([])); window.App.DB.listenToQueue(updateQueue); }

    hydrateSession();
    syncRoute(true, false);
    window.setInterval(() => { if (state.isLogged && state.sessionExpiresAt && state.sessionExpiresAt <= Date.now()) logout(); }, 60000);
    if (window.App.DB) initSync(); else window.addEventListener('load', () => { if (window.App.DB) initSync(); });
    window.App.Store = { state, subscribe, setView, navigate, navigateTab, syncRoute, setStep, setAuthTarget, updatePatientData, updateQueue, setLoggedLocation, setLogin, recordPatientVisit, logout, getRevenue, getQueueMetrics, persistDraft, hrefFor, hrefForTab };
})();

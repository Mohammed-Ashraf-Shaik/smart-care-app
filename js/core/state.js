(function () {
    const routeMap = { landing: '/', patientDashboard: '/dashboard/patient', patient: '/dashboard/patient/apply/1', login: '/login', doctor: '/dashboard/hospital', queue: '/dashboard/queue', staff: '/dashboard/admin', analytics: '/dashboard/analytics', patientDonations: '/dashboard/patient/donations', patientHistory: '/dashboard/patient/history', doctorDonations: '/dashboard/hospital/donations', donations: '/donate', about: '/about', terms: '/terms', privacy: '/privacy', notFound: '/404' };
    const pathMap = { '/': 'landing', '/apply': 'patientDashboard', '/dashboard/patient/apply': 'patientDashboard', '/login': 'login', '/dashboard/patient': 'patientDashboard', '/dashboard/patient/visits': 'patientDashboard', '/dashboard/patient/profile': 'patientDashboard', '/dashboard/patient/history': 'patientHistory', '/dashboard/patient/donations': 'patientDonations', '/dashboard/patient/help': 'about', '/dashboard/doctor': 'doctor', '/dashboard/doctor/donations': 'doctorDonations', '/dashboard/doctor/help': 'about', '/dashboard/hospital': 'doctor', '/dashboard/hospital/donations': 'doctorDonations', '/dashboard/hospital/help': 'about', '/dashboard/queue': 'queue', '/dashboard/admin': 'staff', '/dashboard/admin/rooms': 'staff', '/dashboard/admin/donations': 'doctorDonations', '/dashboard/admin/help': 'about', '/dashboard/analytics': 'analytics', '/dashboard/analytics/help': 'about', '/donate': 'donations', '/donate/blood': 'donations', '/donate/organ': 'donations', '/about': 'about', '/terms': 'terms', '/privacy': 'privacy', '/404': 'notFound' };
    const basePath = window.SMARTCARE_BASE_PATH || '';
    const draftKey = 'smartcare.patientDraft';
    const sessionKey = 'smartcare.session';
    const historyKey = 'smartcare.medicalHistory';

    const defaultMedicalHistory = {
        lastUpdated: '',
        previousProvider: {
            doctorName: '',
            hospitalName: '',
            city: '',
            contactPhone: ''
        },
        diseases: [],
        personalPreferences: [],
        effectiveMedications: [],
        allergiesAndAvoid: [],
        careConditions: [],
        emergencyProtocols: []
    };

    const demoMedicalHistory = {
        lastUpdated: '18 Jul 2026, 10:30 am',
        previousProvider: {
            doctorName: 'Dr Meera Shah',
            hospitalName: 'SmartCare Community Hospital',
            city: 'Hyderabad',
            contactPhone: '+91 40 4000 1200'
        },
        diseases: [
            { id: 'demo-condition-1', diseaseName: 'Mild asthma', diagnosedSince: '2019', status: 'Managed' }
        ],
        personalPreferences: [
            { id: 'demo-preference-1', category: 'Communication', preference: 'Explain medication changes before prescribing' }
        ],
        effectiveMedications: [
            { id: 'demo-medication-1', medicineName: 'Salbutamol inhaler', dosage: '100 mcg as needed', conditionTreated: 'Asthma symptoms', notes: 'Use with spacer as previously advised' }
        ],
        allergiesAndAvoid: [
            { id: 'demo-allergy-1', substance: 'Penicillin', severity: 'Moderate', reactionDescription: 'Reported skin rash; clinician verification required' }
        ],
        careConditions: [
            { id: 'demo-care-1', category: 'Respiratory care', instruction: 'Check inhaler use and oxygen saturation during respiratory visits' }
        ],
        emergencyProtocols: [
            { id: 'demo-protocol-1', triggerCondition: 'Severe breathing difficulty', actionSteps: 'Seek emergency assessment immediately and follow the treating clinician\'s acute asthma protocol' }
        ]
    };

    const validMedicalHistory = value => value && Array.isArray(value.effectiveMedications) && Array.isArray(value.allergiesAndAvoid);
    const cloneData = value => JSON.parse(JSON.stringify(value));
    function medicalHistoryKey(ownerEmail = state?.loggedEmail) {
        const owner = String(ownerEmail || 'guest').trim().toLowerCase();
        return `${historyKey}:${owner || 'guest'}`;
    }

    function getMedicalHistory(ownerEmail = state.loggedEmail) {
        const normalizedOwner = String(ownerEmail || '').trim().toLowerCase();
        const scopedKey = medicalHistoryKey(normalizedOwner);
        const stored = readStorage(scopedKey);
        if (validMedicalHistory(stored)) return stored;
        const legacy = readStorage(historyKey);
        if (validMedicalHistory(legacy)) {
            try {
                window.localStorage.setItem(scopedKey, JSON.stringify(legacy));
                window.localStorage.removeItem(historyKey);
            } catch {}
            return legacy;
        }
        const initial = cloneData(normalizedOwner === 'patient@smartcare.demo' ? demoMedicalHistory : defaultMedicalHistory);
        try { window.localStorage.setItem(scopedKey, JSON.stringify(initial)); } catch {}
        return initial;
    }

    function saveMedicalHistory(history) {
        try { window.localStorage.setItem(medicalHistoryKey(), JSON.stringify(history)); } catch {}
        notify();
    }

    function registerMedicalPassport(passportId) {
        const cleanId = String(passportId || '').trim();
        if (!cleanId || state.loggedRole !== 'patient' || !state.loggedEmail) return;
        try { window.localStorage.setItem(`smartcare.passportOwner:${cleanId}`, state.loggedEmail.toLowerCase()); } catch {}
    }

    function getMedicalPassport(scannedValue) {
        if (!['doctor', 'staff'].includes(state.loggedRole)) return null;
        const raw = String(scannedValue || '').trim();
        let passportId = raw;
        try {
            const url = new URL(raw, window.location.origin);
            passportId = url.searchParams.get('passportId') || url.searchParams.get('pin') || raw;
        } catch {}
        if (!passportId.startsWith('SC-PASSPORT-')) return null;
        let owner = '';
        try { owner = window.localStorage.getItem(`smartcare.passportOwner:${passportId}`) || ''; } catch {}
        if (!owner && passportId === 'SC-PASSPORT-8924') owner = 'patient@smartcare.demo';
        if (!owner) return null;
        const savedProfile = readStorage(`smartcare.patientProfile_${owner}`) || {};
        const profile = owner === 'patient@smartcare.demo'
            ? { name: 'Asha Rao', age: '32', gender: 'Female', city: 'Hyderabad', ...savedProfile }
            : { name: owner.split('@')[0].replace(/[._-]/g, ' '), age: 'Not provided', gender: 'Not specified', city: 'Not provided', ...savedProfile };
        return { passportId, profile, history: getMedicalHistory(owner) };
    }
    const careTeam = [
        { id: 'meera-shah', name: 'Dr Meera Shah', department: 'General medicine', specialty: 'Internal medicine', room: 'Consultation 01', availability: 'Available' },
        { id: 'arjun-rao', name: 'Dr Arjun Rao', department: 'General medicine', specialty: 'Family care', room: 'Consultation 02', availability: 'Available' },
        { id: 'nisha-verma', name: 'Dr Nisha Verma', department: 'Paediatrics', specialty: 'Child health', room: 'Consultation 03', availability: 'Available from 11:30' },
        { id: 'kavya-iyer', name: 'Dr Kavya Iyer', department: 'Women\'s health', specialty: 'Gynaecology', room: 'Consultation 04', availability: 'Available from 14:00' },
        { id: 'vikram-desai', name: 'Dr Vikram Desai', department: 'Orthopaedics', specialty: 'Bone and joint care', room: 'Consultation 05', availability: 'Available tomorrow' }
    ];
    const getCareTeam = () => cloneData(careTeam);
    function getAppointmentSlots() {
        const dateKey = offset => {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            return date.toISOString().slice(0, 10);
        };
        return [
            { value: `${dateKey(0)}|Next available`, date: dateKey(0), slot: 'Next available', label: 'Today - next available' },
            { value: `${dateKey(0)}|16:30`, date: dateKey(0), slot: '16:30', label: 'Today - 4:30 pm' },
            { value: `${dateKey(1)}|09:30`, date: dateKey(1), slot: '09:30', label: 'Tomorrow - 9:30 am' },
            { value: `${dateKey(1)}|11:00`, date: dateKey(1), slot: '11:00', label: 'Tomorrow - 11:00 am' },
            { value: `${dateKey(2)}|14:30`, date: dateKey(2), slot: '14:30', label: 'In two days - 2:30 pm' }
        ];
    }
    const emptyPatientData = () => ({ name: '', age: '', gender: '', doctorPref: '', department: '', doctorId: '', doctorName: '', consultationType: '', appointmentDate: '', appointmentSlot: '', area: '', symptoms: '', symptomSelections: [], customSymptomTags: [], customSymptoms: '', hospital: '', country: '', state: '', city: '' });
    const readStorage = key => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };
    let legacyDraft = readStorage(draftKey);
    const patientVisitKey = 'smartcare.patientVisits';
    let legacyVisits = readStorage(patientVisitKey);
    const defaultVisits = [{ id: 'visit-demo-001', hospital: 'SmartCare Community Hospital', city: 'Hyderabad', reason: 'General consultation', date: '18 Jul 2026', status: 'Completed', reference: 'SC-DEMO18' }, { id: 'visit-demo-002', hospital: 'Green Cross Medical Centre', city: 'Hyderabad', reason: 'Follow-up consultation', date: '04 Jun 2026', status: 'Completed', reference: 'SC-DEMO04' }];
    const prescriptionsKey = 'smartcare.prescriptions';
    const defaultPrescriptions = {
        'visit-demo-001': {
            assessment: 'Seasonal upper respiratory symptoms; demo clinical summary only.',
            medicines: [{ name: 'Paracetamol', strength: '500 mg', dosage: 'One tablet when needed', duration: 'Up to 3 days', instructions: 'Take after food; follow clinician guidance' }],
            labSummary: 'Demo CBC summary: parameters shown within the sample reference range.',
            providerName: 'Dr Meera Shah',
            issuedAt: '18 Jul 2026',
            demo: true
        }
    };

    function getPrescription(visitId) {
        const id = String(visitId || '');
        const stored = readStorage(prescriptionsKey) || {};
        return stored[id] || defaultPrescriptions[id] || null;
    }

    function savePrescription(visitId, prescription) {
        const id = String(visitId || '');
        if (!id) throw new Error('A visit reference is required.');
        const stored = readStorage(prescriptionsKey) || {};
        stored[id] = { ...prescription, visitId: id, demo: true };
        try { window.localStorage.setItem(prescriptionsKey, JSON.stringify(stored)); } catch { throw new Error('The demo prescription could not be saved on this device.'); }
        notify();
        return stored[id];
    }
    
    const donationsKey = 'smartcare.donations';
    const defaultDonations = {
        hospitalPosts: [
            { id: 'h-don-1', type: 'blood', mode: 'offer', group: 'O+', units: 4, hospital: 'SmartCare Community Hospital', city: 'Hyderabad', urgency: 'Routine', notes: 'Blood Bank Lab 01', date: 'Today' },
            { id: 'h-don-2', type: 'blood', mode: 'request', group: 'AB−', units: 2, hospital: 'City General Clinic', city: 'Secunderabad', urgency: 'Urgent', notes: 'Emergency ward requirement', date: 'Today' },
            { id: 'h-don-3', type: 'organ', mode: 'request', group: 'Kidney', units: 1, hospital: 'SmartCare Community Hospital', city: 'Hyderabad', urgency: 'Urgent', notes: 'Matching O+ / A+ donor', date: 'Yesterday' },
            { id: 'h-don-4', type: 'organ', mode: 'offer', group: 'Cornea', units: 2, hospital: 'Apollo Care Centre', city: 'Hyderabad', urgency: 'Planned', notes: 'Preserved in Eye Bank', date: '2 days ago' }
        ],
        patientPosts: [
            { id: 'p-don-1', type: 'blood', mode: 'give', name: 'Ravi Kumar', group: 'O+', city: 'Hyderabad', status: 'Available', date: 'Today' },
            { id: 'p-don-2', type: 'blood', mode: 'give', name: 'Priya M.', group: 'AB−', city: 'Secunderabad', status: 'Available', date: 'Yesterday' },
            { id: 'p-don-3', type: 'blood', mode: 'receive', name: 'Arun V.', group: 'B+', city: 'Hyderabad', urgency: 'Urgent', status: 'Pending', date: 'Today' },
            { id: 'p-don-4', type: 'organ', mode: 'give', name: 'K. Sharma (Pledged)', group: 'Kidney', city: 'Hyderabad', status: 'Registered', date: '3 days ago' },
            { id: 'p-don-5', type: 'organ', mode: 'give', name: 'Anita D. (Pledged)', group: 'Cornea', city: 'Hyderabad', status: 'Registered', date: '1 week ago' },
            { id: 'p-don-6', type: 'organ', mode: 'receive', name: 'Mohan R.', group: 'Liver', city: 'Secunderabad', urgency: 'Urgent', status: 'Pending', date: 'Yesterday' }
        ]
    };
    function getDonationsData() {
        const stored = readStorage(donationsKey);
        if (stored && Array.isArray(stored.hospitalPosts) && Array.isArray(stored.patientPosts)) return stored;
        try { window.localStorage.setItem(donationsKey, JSON.stringify(defaultDonations)); } catch {}
        return defaultDonations;
    }
    function saveDonationsData(data) {
        try { window.localStorage.setItem(donationsKey, JSON.stringify(data)); } catch {}
        notify();
    }
    function addHospitalDonation(item) {
        const data = getDonationsData();
        const newItem = { id: `h-don-${Date.now()}`, date: 'Just now', ...item };
        data.hospitalPosts.unshift(newItem);
        saveDonationsData(data);
        return newItem;
    }
    function addPatientDonation(item) {
        const data = getDonationsData();
        const newItem = { id: `p-don-${Date.now()}`, date: 'Just now', status: item.mode === 'give' ? 'Available' : 'Pending', ...item };
        data.patientPosts.unshift(newItem);
        saveDonationsData(data);
        return newItem;
    }

    const state = {
        view: 'landing', route: '/', activeTab: '', step: 1, infoPage: 'about',
        patientData: emptyPatientData(),
        patientVisits: [],
        userCoords: null, tempHospitals: [], searchRadius: 0, careResultsFetchedAt: '',
        queue: [], loggedHospital: '', loggedCountry: '', loggedState: '', loggedCity: '', isLogged: false, loggedEmail: '', loggedRole: '', auth: { targetRole: 'patient' }
    };
    const listeners = [];
    let fullQueue = [];

    const accountStorageKey = (base, email = state.loggedEmail) => `${base}:${String(email || 'guest').trim().toLowerCase() || 'guest'}`;
    function loadPatientAccount(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const scopedDraftKey = accountStorageKey(draftKey, normalizedEmail);
        let draft = readStorage(scopedDraftKey);
        if (!draft && legacyDraft) {
            draft = legacyDraft;
            try {
                window.localStorage.setItem(scopedDraftKey, JSON.stringify(draft));
                window.localStorage.removeItem(draftKey);
            } catch {}
            legacyDraft = null;
        }
        state.step = Math.max(1, Math.min(4, Number(draft?.step) || 1));
        state.patientData = { ...emptyPatientData(), ...(draft?.patientData || {}) };
        state.userCoords = draft?.userCoords || null;
        state.tempHospitals = Array.isArray(draft?.tempHospitals) ? draft.tempHospitals : [];
        state.searchRadius = Number(draft?.searchRadius) || 0;
        state.careResultsFetchedAt = draft?.careResultsFetchedAt || '';

        const scopedVisitsKey = accountStorageKey(patientVisitKey, normalizedEmail);
        let visits = readStorage(scopedVisitsKey);
        if (!Array.isArray(visits) && Array.isArray(legacyVisits)) {
            visits = legacyVisits;
            try {
                window.localStorage.setItem(scopedVisitsKey, JSON.stringify(visits));
                window.localStorage.removeItem(patientVisitKey);
            } catch {}
            legacyVisits = null;
        }
        state.patientVisits = Array.isArray(visits) ? visits : normalizedEmail === 'patient@smartcare.demo' ? cloneData(defaultVisits) : [];
    }

    function loadPatientProfile(email) {
        const saved = readStorage(`smartcare.patientProfile_${email}`);
        if (saved) Object.assign(state.patientData, saved);
        else if (String(email).toLowerCase() !== 'patient@smartcare.demo' && !state.patientData.name) state.patientData.name = String(email).split('@')[0].replace(/[._-]/g, ' ');
    }

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
    function requiredRole(view) { return view === 'patientDashboard' || view === 'patientDonations' ? ['patient'] : ['doctor', 'queue'].includes(view) || view === 'doctorDonations' ? ['doctor', 'staff'] : view === 'analytics' ? ['doctor', 'staff'] : view === 'staff' ? ['staff'] : ''; }
    function requiredRoleForPath(pathname, view) {
        const path = stripBasePath(pathname);
        if (path === '/dashboard/patient' || path.startsWith('/dashboard/patient/')) return ['patient'];
        if (path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')) return ['staff'];
        if (path === '/dashboard/doctor' || path.startsWith('/dashboard/doctor/') || path === '/dashboard/hospital' || path.startsWith('/dashboard/hospital/')) return ['doctor'];
        if (path === '/dashboard/queue' || path === '/dashboard/analytics') return ['doctor', 'staff'];
        return requiredRole(view);
    }
    function roleAllowed(neededRole, loggedRole) {
        if (!neededRole) return true;
        if (Array.isArray(neededRole)) return neededRole.includes(loggedRole);
        return neededRole === loggedRole;
    }
    function persistDraft() {
        try {
            window.localStorage.setItem(accountStorageKey(draftKey), JSON.stringify({
                step: state.step, patientData: state.patientData, userCoords: state.userCoords, tempHospitals: state.tempHospitals, searchRadius: state.searchRadius, careResultsFetchedAt: state.careResultsFetchedAt
            }));
        } catch { /* storage optional */ }
    }
    function clearDraft() { try { window.localStorage.removeItem(accountStorageKey(draftKey)); } catch {} }
    function persistSession() {
        try {
            if (state.isLogged) {
                window.localStorage.setItem(sessionKey, JSON.stringify({
                    email: state.loggedEmail, role: state.loggedRole, hospital: state.loggedHospital, country: state.loggedCountry, state: state.loggedState, city: state.loggedCity, expiresAt: state.sessionExpiresAt
                }));
            } else {
                window.localStorage.removeItem(sessionKey);
            }
        } catch {}
    }
    function hydrateSession() {
        const session = readStorage(sessionKey);
        if (session && session.expiresAt && session.expiresAt > Date.now()) {
            state.isLogged = true; state.loggedEmail = session.email || ''; state.loggedRole = session.role || ''; state.loggedHospital = session.hospital || ''; state.loggedCountry = session.country || ''; state.loggedState = session.state || ''; state.loggedCity = session.city || ''; state.sessionExpiresAt = session.expiresAt;
            if (state.loggedRole === 'patient') { loadPatientAccount(state.loggedEmail); loadPatientProfile(state.loggedEmail); }
        } else if (session) {
            try { window.localStorage.removeItem(sessionKey); } catch {}
        }
    }
    function syncRoute(replace = false, shouldNotify = true) {
        const pathname = stripBasePath(window.location.pathname || '/');
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
    function navigate(path) {
        const url = new URL(hrefFor(path), window.location.origin);
        window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
        const cleanPath = stripBasePath(url.pathname);
        let view = viewForPath(cleanPath);
        const neededRole = requiredRoleForPath(url.pathname, view);
        if (neededRole && !state.isLogged) {
            setAuthTarget(neededRole[0]);
            const loginPath = hrefFor(`/login?role=${state.auth.targetRole}`);
            window.history.replaceState({}, '', loginPath);
            view = 'login';
            state.route = '/login';
        } else if (neededRole && state.loggedRole && !roleAllowed(neededRole, state.loggedRole)) {
            setAuthTarget(neededRole[0]);
            window.history.replaceState({}, '', hrefFor(`/login?role=${neededRole[0]}`));
            view = 'login';
            state.route = '/login';
        } else {
            state.route = cleanPath;
        }
        state.view = view;
        if (cleanPath === '/apply' || cleanPath.startsWith('/dashboard/patient/apply')) {
            state.activeTab = 'apply';
            const parts = cleanPath.split('/');
            const lastPart = parts[parts.length - 1];
            const stepNum = Number(lastPart);
            if (Number.isInteger(stepNum) && stepNum >= 1 && stepNum <= 4) {
                state.step = stepNum;
            } else {
                state.step = 1;
            }
        } else {
            state.activeTab = tabForPath(cleanPath);
        }
        if (view === 'about' || view === 'terms' || view === 'privacy') {
            const isHelpPath = cleanPath.endsWith('/help');
            state.infoPage = isHelpPath ? 'about' : view;
        }
        const role = new URLSearchParams(url.search).get('role');
        if (['patient', 'doctor', 'staff'].includes(role)) setAuthTarget(role);
        notify();
    }
    function navigateTab(tab, basePath = state.route) {
        const targetPath = tabPath(basePath, tab);
        if (targetPath && targetPath !== stripBasePath(window.location.pathname)) {
            navigate(targetPath);
            return;
        }
        const url = new URL(window.location.href);
        if (tab) url.searchParams.set('tab', tab);
        else url.searchParams.delete('tab');
        window.history.pushState({}, '', url.toString());
        state.activeTab = tab;
        notify();
    }
    function setView(newView) { navigate(routeForView(newView)); }
    function setStep(newStep) { state.step = Math.max(1, Math.min(4, Number(newStep) || 1)); if (state.step < 4) persistDraft(); else clearDraft(); if (state.view === 'patientDashboard' || state.activeTab === 'apply') { navigate(`/dashboard/patient/apply/${state.step}`); } else { notify(); } }
    function setAuthTarget(role) { state.auth.targetRole = ['patient', 'doctor', 'staff'].includes(role) ? role : 'patient'; }
    function updatePatientData(key, value, shouldNotify = false) { state.patientData[key] = value; persistDraft(); if (shouldNotify) notify(); }
    function recordPatientVisit(visit) { state.patientVisits = [visit, ...state.patientVisits.filter(item => String(item.id) !== String(visit.id))].slice(0, 12); try { window.localStorage.setItem(accountStorageKey(patientVisitKey), JSON.stringify(state.patientVisits)); } catch { /* local history is optional */ } }
    function updateQueue(newQueue) {
        fullQueue = Array.isArray(newQueue) ? newQueue : [];
        const isAdmin = state.loggedRole === 'staff';
        const isPatient = state.loggedRole === 'patient';
        const patientVisitIds = new Set(state.patientVisits.map(visit => String(visit.id)));
        const patientEmail = String(state.loggedEmail || '').toLowerCase();
        const patientQueue = fullQueue.filter(patient => String(patient.patientEmail || '').toLowerCase() === patientEmail || patientVisitIds.has(String(patient.id)));
        if (isPatient && patientQueue.length) {
            let historyChanged = false;
            state.patientVisits = state.patientVisits.map(visit => {
                const queueVisit = patientQueue.find(patient => String(patient.id) === String(visit.id));
                if (!queueVisit) return visit;
                const nextVisit = {
                    ...visit,
                    status: queueVisit.status || visit.status,
                    department: queueVisit.department || visit.department,
                    doctorName: queueVisit.doctorName || queueVisit.doctor_name || visit.doctorName,
                    consultationType: queueVisit.consultationType || queueVisit.consultation_type || visit.consultationType,
                    appointmentDate: queueVisit.appointmentDate || queueVisit.appointment_date || visit.appointmentDate,
                    appointmentSlot: queueVisit.appointmentSlot || queueVisit.appointment_slot || visit.appointmentSlot
                };
                if (JSON.stringify(nextVisit) !== JSON.stringify(visit)) historyChanged = true;
                return nextVisit;
            });
            if (historyChanged) {
                try { window.localStorage.setItem(accountStorageKey(patientVisitKey), JSON.stringify(state.patientVisits)); } catch {}
            }
        }
        const scopedQueue = isPatient
            ? patientQueue
            : !isAdmin && state.loggedHospital && state.loggedCity
                ? fullQueue.filter(patient => (patient.queueHospital || patient.hospital) === state.loggedHospital && String(patient.city || 'Hyderabad').toLowerCase() === String(state.loggedCity || 'Hyderabad').toLowerCase())
                : fullQueue;
        state.queue = scopedQueue.filter(patient => !['completed', 'cancelled', 'withdrawn', 'no-show'].includes(String(patient.status || '').toLowerCase()));
        if (['patientDashboard', 'doctor', 'staff', 'queue', 'analytics'].includes(state.view)) notify();
    }
    function setLoggedLocation(country, stateName, city, hospital) { state.loggedCountry = country; state.loggedState = stateName; state.loggedCity = city; state.loggedHospital = hospital; updateQueue(fullQueue); persistSession(); }
    function setLogin(email, role = 'patient') {
        state.isLogged = true;
        state.loggedEmail = email;
        state.loggedRole = role;
        state.sessionExpiresAt = Date.now() + (window.App.Config?.sessionTtlMs || 28800000);
        if (role === 'patient') {
            loadPatientAccount(email);
            loadPatientProfile(email);
        } else state.patientVisits = [];
        updateQueue(fullQueue);
        persistSession();
        notify();
    }
    function applyRemoteSession(remote) {
        const profile = remote?.profile;
        if (!profile || !['patient', 'doctor', 'staff'].includes(profile.role)) return false;
        state.isLogged = true; state.loggedEmail = profile.email || remote.user?.email || ''; state.loggedRole = profile.role; state.loggedHospital = profile.hospital || ''; state.loggedCountry = profile.country || ''; state.loggedState = profile.state || ''; state.loggedCity = profile.city || ''; state.sessionExpiresAt = remote.session?.expires_at ? remote.session.expires_at * 1000 : Date.now() + (window.App.Config?.sessionTtlMs || 28800000);
        if (profile.role === 'patient') { loadPatientAccount(state.loggedEmail); loadPatientProfile(state.loggedEmail); }
        else state.patientVisits = [];
        updateQueue(fullQueue);
        return true;
    }
    function logout() { window.App.DB?.signOut?.(); state.isLogged = false; state.loggedEmail = ''; state.loggedRole = ''; state.loggedHospital = ''; state.loggedCountry = ''; state.loggedState = ''; state.loggedCity = ''; state.sessionExpiresAt = 0; try { window.localStorage.removeItem(sessionKey); } catch {} document.querySelectorAll('.mobile-bottom-nav').forEach(el => el.remove()); navigate('/'); }
    function resetPatient() { state.step = 1; state.patientData = emptyPatientData(); state.userCoords = null; state.tempHospitals = []; state.searchRadius = 0; state.careResultsFetchedAt = ''; clearDraft(); }
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
            const historyVisit = state.loggedRole === 'patient' ? state.patientVisits.find(visit => String(visit.id) === String(id)) : null;
            if (visitStatus && historyVisit) recordPatientVisit({ ...historyVisit, status: visitStatus });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'The queue update failed.' };
        }
    }
    function getQueueMetrics() {
        const waiting = state.queue.filter(patient => !['completed', 'cancelled', 'withdrawn', 'no-show'].includes(String(patient.status || '').toLowerCase()));
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
    window.App.Store = { state, subscribe, setView, navigate, navigateTab, syncRoute, setStep, setAuthTarget, updatePatientData, updateQueue, setLoggedLocation, setLogin, recordPatientVisit, logout, getRevenue, getQueueMetrics, getNextPatient, sortQueue, transitionPatient, persistDraft, hrefFor, hrefForTab, getDonationsData, saveDonationsData, addHospitalDonation, addPatientDonation, getMedicalHistory, saveMedicalHistory, registerMedicalPassport, getMedicalPassport, getPrescription, savePrescription, getCareTeam, getAppointmentSlots };
})();

(function () {
    const state = {
        view: 'landing', // landing, patient, doctor, staff
        step: 1,
        patientData: {
            name: '',
            age: '',
            gender: '', // 'male', 'female', 'other'
            doctorPref: '', // 'male', 'female', 'any'
            area: '',
            symptoms: '',
            hospital: '',
            country: '',
            state: '',
            city: ''
        },
        queue: [], // Now populated from DB
        loggedHospital: '', // Track which hospital the professional belongs to
        loggedCountry: '',
        loggedState: '',
        loggedCity: ''
    };

    const listeners = [];
    let fullQueue = []; // Persistent cache of all data from DB

    function subscribe(callback) {
        listeners.push(callback);
    }

    function notify() {
        listeners.forEach(cb => cb(state));
    }

    // Actions
    function setView(newView) {
        state.view = newView;
        if (newView === 'landing') {
            state.step = 1;
            // Clear patient data on return to landing
            state.patientData = {
                name: '', age: '', gender: '', doctorPref: '', area: '', symptoms: '', hospital: '',
                country: '', state: '', city: ''
            };
            state.loggedHospital = '';
            state.loggedCountry = '';
            state.loggedState = '';
            state.loggedCity = '';
        }
        notify();
    }

    function setStep(newStep) {
        state.step = newStep;
        notify();
    }

    function setAuthTarget(role) {
        // Role: 'doctor' or 'staff'
        state.auth = state.auth || {};
        state.auth.targetRole = role;
    }

    function updatePatientData(key, value, shouldNotify = false) {
        state.patientData[key] = value;
        if (shouldNotify) notify(); // Ensure UI reflects changes immediately
    }

    function updateQueue(newQueue) {
        fullQueue = newQueue;
        // Filter by logged-in location if applicable (Country, State, City, Hospital)
        if (state.loggedHospital && state.loggedCity && state.loggedState && state.loggedCountry) {
            state.queue = fullQueue.filter(p =>
                p.hospital === state.loggedHospital &&
                p.city === state.loggedCity &&
                p.state === state.loggedState &&
                p.country === state.loggedCountry
            );
        } else {
            state.queue = fullQueue;
        }

        // Only re-render if we are in a view that explicitly needs real-time queue updates
        if (state.view === 'doctor' || state.view === 'staff') {
            notify();
        }
    }

    function setLoggedLocation(country, stateName, city, hospital) {
        state.loggedCountry = country;
        state.loggedState = stateName;
        state.loggedCity = city;
        state.loggedHospital = hospital;
        // Re-run filter on existing data
        updateQueue(fullQueue);
    }

    function getRevenue() {
        return state.queue.reduce((acc, curr) => acc + (curr.fee || 0), 0);
    }

    // Initialize Database Sync
    function initSync() {
        // Initial Fetch
        window.App.DB.fetchQueue().then(queue => {
            updateQueue(queue);
        });

        // Real-time listener
        window.App.DB.listenToQueue(queue => {
            updateQueue(queue);
        });
    }

    // Wait for DB to be available
    if (window.App.DB) {
        initSync();
    } else {
        window.addEventListener('load', () => {
            if (window.App.DB) initSync();
        });
    }

    // Expose to Global App Namespace
    window.App.Store = {
        state,
        subscribe,
        setView,
        setStep,
        setAuthTarget,
        updatePatientData,
        setLoggedLocation,
        getRevenue
    };
})();

(function () {
    const state = {
        view: 'landing', 
        step: 1,
        patientData: {
            name: '',
            age: '',
            gender: '', 
            doctorPref: '', 
            area: '',
            symptoms: '',
            hospital: '',
            country: '',
            state: '',
            city: ''
        },
        queue: [], 
        loggedHospital: '', 
        loggedCountry: '',
        loggedState: '',
        loggedCity: '',
        isLogged: false,
        loggedEmail: ''
    };

    const listeners = [];
    let fullQueue = []; 

    function subscribe(callback) {
        listeners.push(callback);
    }

    function notify() {
        listeners.forEach(cb => cb(state));
    }

    
    function setView(newView) {
        
        if ((newView === 'doctor' || newView === 'staff') && !state.isLogged) {
            setAuthTarget(newView); 
            state.view = 'login';
            notify();
            return;
        }

        state.view = newView;
        if (newView === 'landing') {
            state.step = 1;
            
            state.patientData = {
                name: '', age: '', gender: '', doctorPref: '', area: '', symptoms: '', hospital: '',
                country: '', state: '', city: ''
            };
            
        }
        notify();
    }

    function setStep(newStep) {
        state.step = newStep;
        notify();
    }

    function setAuthTarget(role) {
        
        state.auth = state.auth || {};
        state.auth.targetRole = role;
    }

    function updatePatientData(key, value, shouldNotify = false) {
        state.patientData[key] = value;
        if (shouldNotify) notify(); 
    }

    function updateQueue(newQueue) {
        fullQueue = newQueue;
        
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

        
        if (state.view === 'doctor' || state.view === 'staff') {
            notify();
        }
    }

    function setLoggedLocation(country, stateName, city, hospital) {
        state.loggedCountry = country;
        state.loggedState = stateName;
        state.loggedCity = city;
        state.loggedHospital = hospital;
        
        updateQueue(fullQueue);
    }

    function setLogin(email) {
        state.isLogged = true;
        state.loggedEmail = email;
        notify();
    }

    function logout() {
        state.isLogged = false;
        state.loggedEmail = '';
        state.view = 'landing';
        notify();
    }

    function getRevenue() {
        return state.queue.reduce((acc, curr) => acc + (curr.fee || 0), 0);
    }

    
    function initSync() {
        
        window.App.DB.fetchQueue().then(queue => {
            updateQueue(queue);
        });

        
        window.App.DB.listenToQueue(queue => {
            updateQueue(queue);
        });
    }

    
    if (window.App.DB) {
        initSync();
    } else {
        window.addEventListener('load', () => {
            if (window.App.DB) initSync();
        });
    }

    
    window.App.Store = {
        state,
        subscribe,
        setView,
        setStep,
        setAuthTarget,
        updatePatientData,
        setLoggedLocation,
        setLogin,
        logout,
        getRevenue
    };
})();

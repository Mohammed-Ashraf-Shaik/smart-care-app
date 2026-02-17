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
            hospital: ''
        },
        queue: [
            { id: 101, name: "John Doe", age: 45, problem: "Chest Pain", triage: "Red", fee: 150 },
            { id: 102, name: "Sarah Smith", age: 22, problem: "Fever", triage: "Yellow", fee: 50 },
            { id: 103, name: "Mike Ross", age: 30, problem: "Checkup", triage: "Green", fee: 30 },
            { id: 104, name: "Emily Clark", age: 28, problem: "Migraine", triage: "Green", fee: 40 },
        ]
    };

    const listeners = [];

    function subscribe(callback) {
        listeners.push(callback);
    }

    function notify() {
        listeners.forEach(cb => cb(state));
    }

    // Actions
    function setView(newView) {
        state.view = newView;
        if (newView === 'landing') state.step = 1;
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

    function updatePatientData(key, value) {
        state.patientData[key] = value;
    }

    function getRevenue() {
        return state.queue.reduce((acc, curr) => acc + curr.fee, 0);
    }

    // Expose to Global App Namespace
    window.App.Store = {
        state,
        subscribe,
        setView,
        setStep,
        setAuthTarget,
        updatePatientData,
        getRevenue
    };
})();

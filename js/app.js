(function () {
    const { state, subscribe } = window.App.Store;
    const { Landing, Patient, Doctor, Staff, Login } = window.App.Views;

    const app = document.getElementById('app');

    function render() {
        app.innerHTML = '';
        let viewComponent;

        switch (state.view) {
            case 'landing':
                viewComponent = Landing();
                break;
            case 'patient':
                viewComponent = Patient();
                break;
            case 'doctor':
                viewComponent = Doctor();
                break;
            case 'staff':
                viewComponent = Staff();
                break;
            case 'login':
                viewComponent = Login();
                break;
            default:
                viewComponent = Landing();
        }

        app.appendChild(viewComponent);

        // Re-initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Initial Render
    render();

    // Subscribe to state changes
    subscribe(() => {
        render();
    });
})();

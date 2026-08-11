(function () {
    const { state, subscribe, syncRoute, navigate } = window.App.Store;
    const app = document.getElementById('app');
    let isBooting = true;
    const views = () => ({ landing: window.App.Views.Landing, patient: window.App.Views.Patient, doctor: window.App.Views.Doctor, staff: window.App.Views.Staff, login: window.App.Views.Login, analytics: window.App.Views.Analytics, about: window.App.Views.Info, terms: window.App.Views.Info, privacy: window.App.Views.Info, notFound: window.App.Views.NotFound });
    function renderSplash() { app.innerHTML = `<main class="splash-screen" aria-label="Loading SmartCare"><div class="splash-inner"><div class="splash-mark"><i data-lucide="heart-pulse" width="34" height="34"></i></div><h1>SmartCare</h1><p>Care access, clearly organized.</p><div class="splash-progress" aria-hidden="true"></div></div></main>`; if (window.lucide) window.lucide.createIcons(); }
    function render() { if (isBooting) return; app.innerHTML = ''; const View = views()[state.view] || window.App.Views.NotFound || window.App.Views.Landing; app.appendChild(View()); document.title = `SmartCare | ${state.view === 'landing' ? 'Care access, simplified' : state.view === 'notFound' ? 'Page not found' : state.view.charAt(0).toUpperCase() + state.view.slice(1)}`; if (window.lucide) window.lucide.createIcons(); }
    document.addEventListener('click', event => { const link = event.target.closest('a[data-route]'); if (!link) return; event.preventDefault(); navigate(link.dataset.route); });
    window.addEventListener('popstate', () => syncRoute(false, true));
    renderSplash();
    window.setTimeout(() => { isBooting = false; render(); }, 850);
    subscribe(render);
})();

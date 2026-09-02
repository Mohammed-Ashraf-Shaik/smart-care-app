(function () {
    window.App = window.App || { Views: {} };
    window.App.Config = {
        environment: 'demo',
        supabaseEnabled: false,
        supabaseUrl: '',
        supabaseAnonKey: '',
        sessionTtlMs: 8 * 60 * 60 * 1000,
        apiTimeoutMs: 12000
    };
})();

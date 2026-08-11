(function () {
    const icon = (name, size = 18) => `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
    const footer = (compact = false) => compact ? `
        <footer class="site-footer site-footer-compact" data-section="site-footer">
            <a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 17)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span></a>
            <nav aria-label="Workspace footer links"><a data-route="/about" href="/about">About</a><a data-route="/terms" href="/terms">Terms</a><a data-route="/privacy" href="/privacy">Privacy</a><a href="mailto:support@smartcare.demo">Support</a></nav>
            <span class="footer-compact-meta">Demo environment · 2026</span>
        </footer>` : `
        <footer class="site-footer" data-section="site-footer">
            <div class="footer-grid">
                <div class="footer-brand"><a class="brand-lockup" data-route="/" href="/"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><span class="brand-name">SmartCare</span><span class="brand-caption">Care access, simplified</span></span></a><p>Digital queue access for patients, hospitals, and care teams.</p></div>
                <div><p class="footer-heading">Explore</p><a data-route="/about" href="/about">About us</a><a data-route="/apply" href="/apply">Patient portal</a><a data-route="/login" href="/login">Provider portal</a></div>
                <div><p class="footer-heading">Policies</p><a data-route="/terms" href="/terms">Terms and conditions</a><a data-route="/privacy" href="/privacy">Privacy notice</a><a href="mailto:support@smartcare.demo">Contact support</a></div>
            </div>
            <div class="footer-bottom"><span>© 2026 SmartCare Systems · Demo environment</span><span>Last updated: 11 August 2026</span></div>
        </footer>`;
    window.App.UI = { icon, footer };
})();

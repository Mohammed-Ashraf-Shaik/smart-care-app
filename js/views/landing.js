(function () {
    window.App.Views.Landing = function () {
        const { setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen flex flex-col font-sans bg-dark-950 text-slate-200 overflow-x-hidden";

        container.innerHTML = `
            <!-- Modern Hero Section -->
            <div class="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20 pb-32">
                <!-- Atmospheric Background Elements -->
                <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-900/40 rounded-full blur-[120px] animate-pulse"></div>
                <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]"></div>
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

                <!-- Content Wrapper -->
                <div class="relative z-10 max-w-5xl w-full text-center" data-aos="fade-up" data-aos-duration="1000">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-teal-400">Next-Gen Healthcare Management</span>
                    </div>

                    <h1 class="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        SmartCare <span class="text-brand-500">HQMS</span>
                    </h1>
                    
                    <p class="text-lg md:text-2xl text-slate-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                        Streamlining patient flow with precision and empathy. Experience the future of hospital queue management.
                    </p>

                    <!-- CTA Group -->
                    <div class="flex flex-wrap justify-center gap-6 mb-20">
                        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                             <i data-lucide="zap" class="w-4 h-4 text-brand-500"></i> Real-time Sync
                        </div>
                        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                             <i data-lucide="shield" class="w-4 h-4 text-brand-500"></i> SQL-Secure
                        </div>
                        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                             <i data-lucide="globe" class="w-4 h-4 text-brand-500"></i> Cloud Ready
                        </div>
                    </div>
                </div>

                <!-- Floating Scroll Indicator -->
                <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
                    <i data-lucide="chevron-down" class="w-6 h-6"></i>
                </div>
            </div>

            <!-- Portal Selection Section -->
            <div class="relative flex-1 px-6 pb-32">
                <div class="max-w-7xl mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-30">
                        <!-- Patient Portal -->
                        <div id="btn-patient" class="group relative" data-aos="fade-up" data-aos-delay="100">
                            <div class="absolute inset-0 bg-blue-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div class="relative bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden isolate shadow-2xl">
                                <div class="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <i data-lucide="users" class="w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-black text-white mb-2">Patient Hub</h3>
                                <p class="text-slate-400 text-sm leading-relaxed">Book visits, check live wait times, and find the nearest care centers instantly.</p>
                                <div class="mt-8 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Get Started <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Doctor Login -->
                        <div id="btn-doctor" class="group relative" data-aos="fade-up" data-aos-delay="200">
                            <div class="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div class="relative bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden isolate shadow-2xl">
                                <div class="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <i data-lucide="stethoscope" class="w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-black text-white mb-2">Specialist Portal</h3>
                                <p class="text-slate-400 text-sm leading-relaxed">Manage your patient queue with advanced triage and real-time medical updates.</p>
                                <div class="mt-8 flex items-center text-indigo-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Access Portal <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Staff/Admin -->
                        <div id="btn-staff" class="group relative" data-aos="fade-up" data-aos-delay="300">
                            <div class="absolute inset-0 bg-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div class="relative bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden isolate shadow-2xl">
                                <div class="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <i data-lucide="line-chart" class="w-8 h-8"></i>
                                </div>
                                <h3 class="text-2xl font-black text-white mb-2">Command Center</h3>
                                <p class="text-slate-400 text-sm leading-relaxed">Live facility analytics, revenue forecasting, and operational management.</p>
                                <div class="mt-8 flex items-center text-emerald-400 text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Launch Dashboard <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer class="relative z-10 py-12 px-6 border-t border-white/5 bg-dark-950/50 backdrop-blur-md">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="flex items-center gap-2 text-white font-black tracking-tighter text-xl">
                         SmartCare <span class="text-brand-500 text-xs uppercase ml-1">v2.0</span>
                    </div>
                    <div class="text-slate-500 text-xs font-medium">
                        &copy; 2026 SmartCare Systems. Engineered for Excellence.
                    </div>
                    <div class="flex gap-6 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <a href="#" class="hover:text-teal-400 transition-colors">Privacy</a>
                        <a href="#" class="hover:text-teal-400 transition-colors">Terms</a>
                        <a href="#" class="hover:text-teal-400 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        `;

        // Attach Listeners
        container.querySelector('#btn-patient').onclick = () => setView('patient');

        container.querySelector('#btn-doctor').onclick = () => {
            window.App.Store.setAuthTarget('doctor');
            setView('login');
        };

        container.querySelector('#btn-staff').onclick = () => {
            window.App.Store.setAuthTarget('staff');
            setView('login');
        };

        // Initialize AOS
        setTimeout(() => {
            AOS.init({
                once: true,
                easing: 'ease-out-quart'
            });
            lucide.createIcons();
        }, 100);

        return container;
    };
})();

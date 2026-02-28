(function () {
    window.App.Views.Landing = function () {
        const { setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen flex flex-col animate-fade-in font-sans";

        container.innerHTML = `
            <!-- Hero Section -->
            <div class="w-full bg-[#002b5c] text-white pt-28 pb-40 px-6 flex flex-col items-center justify-center relative overflow-hidden">
                <!-- Advanced Background Pattern -->
                <div class="absolute inset-0 opacity-20">
                    <svg class="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                
                <!-- Floating Decorative Elements -->
                <div class="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div class="absolute bottom-20 right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-float" style="animation-delay: -2s"></div>

                <!-- Logo Box -->
                <div class="mb-10 relative z-10 animate-slide-up">
                    <div class="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                        <i data-lucide="heart" class="w-12 h-12 text-white fill-current"></i>
                    </div>
                </div>

                <!-- Hero Text -->
                <h1 class="text-6xl md:text-8xl font-black mb-6 tracking-tight text-center relative z-10 animate-slide-up" style="animation-delay: 0.1s">
                    Smart<span class="text-blue-400">Care</span>
                </h1>
                <p class="text-xl md:text-3xl text-blue-100/80 font-medium mb-16 relative z-10 max-w-2xl text-center leading-relaxed animate-slide-up" style="animation-delay: 0.2s">
                    Experience the future of hospital queue management with intelligent infrastructure.
                </p>

                <!-- Micro-Features -->
                <div class="flex flex-wrap justify-center gap-6 md:gap-12 text-xs font-bold tracking-[0.2em] uppercase text-blue-200/60 relative z-10 animate-slide-up" style="animation-delay: 0.3s">
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span> Zero Wait Time
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 bg-cyan-500 rounded-full"></span> Secure Vault
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="w-2 h-2 bg-indigo-500 rounded-full"></span> Smart Triage
                    </div>
                </div>
            </div>

            <!-- Portal Selection -->
            <div class="flex-1 bg-white -mt-20 rounded-t-[4rem] relative z-20 px-6 pb-24 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
                <div class="max-w-7xl mx-auto pt-20">
                    <div class="text-center mb-16 animate-slide-up">
                        <h2 class="text-4xl md:text-5xl font-black text-slate-900 mb-4">Select Your Portal</h2>
                        <div class="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
                        <!-- Patient Portal -->
                        <div id="btn-patient" class="group glass-card p-12 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer border border-slate-100 flex flex-col items-center text-center animate-slide-up" style="animation-delay: 0.1s">
                            <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-lg">
                                <i data-lucide="user" class="w-10 h-10"></i>
                            </div>
                            <h3 class="text-2xl font-black text-slate-900 mb-4">Patient Portal</h3>
                            <p class="text-slate-500 leading-relaxed">Book visits, find the best hospitals near you, and check live status in seconds.</p>
                        </div>

                        <!-- Doctor Login -->
                        <div id="btn-doctor" class="group glass-card p-12 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer border border-slate-100 flex flex-col items-center text-center animate-slide-up" style="animation-delay: 0.2s">
                            <div class="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-cyan-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-lg">
                                <i data-lucide="stethoscope" class="w-10 h-10"></i>
                            </div>
                            <h3 class="text-2xl font-black text-slate-900 mb-4">Doctor Login</h3>
                            <p class="text-slate-500 leading-relaxed">Streamline your practice, manage patient queues, and perform efficient triage.</p>
                        </div>

                        <!-- Staff/Admin -->
                        <div id="btn-staff" class="group glass-card p-12 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer border border-slate-100 flex flex-col items-center text-center animate-slide-up" style="animation-delay: 0.3s">
                            <div class="w-20 h-20 bg-slate-50 text-slate-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                <i data-lucide="bar-chart-2" class="w-10 h-10"></i>
                            </div>
                            <h3 class="text-2xl font-black text-slate-900 mb-4">Staff/Admin</h3>
                            <p class="text-slate-500 leading-relaxed">Optimize hospital operations, monitor analytics, and manage facility resources.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer class="bg-[#fdfbf7] text-slate-800 py-20 px-8 border-t border-slate-100 relative overflow-hidden">
                <!-- Subtle decorative background elements -->
                <div class="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -z-0"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full blur-[100px] -z-0"></div>

                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        <!-- Col 1: Brand & Vision -->
                        <div class="lg:col-span-5 space-y-8">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                                    <i data-lucide="heart" class="w-6 h-6 text-white fill-current"></i>
                                </div>
                                <div>
                                    <h3 class="text-3xl font-black tracking-tighter uppercase leading-none text-[#003580]">SmartCare</h3>
                                    <p class="text-blue-500 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">Health Quality Management</p>
                                </div>
                            </div>
                            <p class="text-slate-500 text-lg leading-relaxed max-w-md">
                                Setting new standards in patient care through intelligent infrastructure. We build tools that save time and save lives.
                            </p>
                        </div>

                        <!-- Col 2: The Founder / Owner Card -->
                        <div class="lg:col-span-7">
                            <div class="bg-white border border-slate-100 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl shadow-slate-200/50">
                                
                                <div class="space-y-6">
                                    <div>
                                        <p class="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-2">Developed & Owned by</p>
                                        <h4 class="text-2xl font-bold text-slate-900">Ashraf Shaik</h4>
                                        <p class="text-slate-500 text-sm mt-1 font-medium">Founder, SmartCare Systems</p>
                                    </div>
                                    
                                    <div class="space-y-3">
                                        <a href="tel:8500543154" class="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                            <i data-lucide="phone" class="w-4 h-4 text-blue-500 smooth-magnetic"></i>
                                            <span class="text-sm font-bold">8500543154</span>
                                        </a>
                                        <a href="mailto:ashubasha52@gmail.com" class="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                            <i data-lucide="mail" class="w-4 h-4 text-blue-500 smooth-magnetic"></i>
                                            <span class="text-sm font-bold">ashubasha52@gmail.com</span>
                                        </a>
                                    </div>
                                </div>

                                <div class="space-y-6">
                                    <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Follow on Socials</p>
                                    <div class="grid grid-cols-1 gap-3">
                                        <a href="https://instagram.com/shaik.m_ashraf" target="_blank" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-pink-50/50 border border-slate-100 rounded-2xl transition-all group">
                                            <div class="flex items-center gap-3">
                                                <i data-lucide="instagram" class="w-5 h-5 text-pink-500 math-bounce"></i>
                                                <span class="text-sm font-bold text-slate-700">@shaik.m_ashraf</span>
                                            </div>
                                            <i data-lucide="external-link" class="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </a>
                                        <a href="https://twitter.com/ashushaikz" target="_blank" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 rounded-2xl transition-all group">
                                            <div class="flex items-center gap-3">
                                                <i data-lucide="twitter" class="w-5 h-5 text-blue-400 math-bounce"></i>
                                                <span class="text-sm font-bold text-slate-700">@ashushaikz</span>
                                            </div>
                                            <i data-lucide="external-link" class="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <p>&copy; 2026 SmartCare HQMS. All rights reserved.</p>
                        <div class="flex gap-8">
                            <span class="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
                            <span class="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
                        </div>
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

        return container;
    };
})();

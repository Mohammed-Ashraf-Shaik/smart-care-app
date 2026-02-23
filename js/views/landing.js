(function () {
    window.App.Views.Landing = function () {
        const { setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen flex flex-col animate-fade-in font-sans";

        container.innerHTML = `
            <!-- Hero Section (Blue Area) -->
            <div class="w-full bg-[#003580] text-white pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
                <!-- Background Pattern -->
                <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                <!-- Logo -->
                <div class="mb-8 relative z-10">
                    <div class="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                        <i data-lucide="heart" class="w-12 h-12 text-white fill-current"></i>
                    </div>
                </div>

                <!-- Text -->
                <h1 class="text-6xl md:text-7xl font-bold mb-4 tracking-tight text-center relative z-10">Welcome to SmartCare</h1>
                <p class="text-xl md:text-2xl text-blue-200 font-light mb-12 relative z-10">Hospital Queue Management System</p>

                <!-- Features -->
                <div class="flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-semibold tracking-wider uppercase text-blue-100 relative z-10">
                    <div class="flex items-center gap-2">
                        <i data-lucide="clock" class="w-5 h-5"></i> Save Time
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="shield-check" class="w-5 h-5"></i> Secure & Trusted
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="activity" class="w-5 h-5"></i> Better Care
                    </div>
                </div>
            </div>

            <!-- Portal Selection Section -->
            <div class="flex-1 bg-slate-50 -mt-10 rounded-t-[3rem] relative z-20 px-6 pb-20">
                <div class="max-w-7xl mx-auto pt-16">
                    <h2 class="text-3xl font-bold text-slate-800 text-center mb-12">Select Your Portal</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        <!-- Patient Portal -->
                        <div id="btn-patient" class="group bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white relative overflow-hidden">
                            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <i data-lucide="user" class="w-8 h-8"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900 mb-2">Patient Portal</h3>
                            <p class="text-slate-500">Book visits, find hospitals & check live status.</p>
                        </div>

                        <!-- Doctor Login -->
                        <div id="btn-doctor" class="group bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white relative overflow-hidden">
                            <div class="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <i data-lucide="stethoscope" class="w-8 h-8"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900 mb-2">Doctor Login</h3>
                            <p class="text-slate-500">Manage patient queue & triage.</p>
                        </div>

                        <!-- Staff/Admin -->
                        <div id="btn-staff" class="group bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white relative overflow-hidden">
                            <div class="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                                <i data-lucide="bar-chart-2" class="w-8 h-8"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900 mb-2">Staff/Admin</h3>
                            <p class="text-slate-500">Hospital operations & analytics.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer class="bg-white text-slate-600 py-16 px-6 border-t border-slate-100 mt-20">
                <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    <!-- Column 1: Brand -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 text-[#003580]">
                            <i data-lucide="heart" class="w-6 h-6 fill-current"></i>
                            <span class="text-xl font-black tracking-tighter uppercase">SmartCare</span>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Revolutionizing medical queue management with smart, real-time technology. Quality care, delivered faster.
                        </p>
                    </div>

                    <!-- Column 2: The Developer -->
                    <div class="space-y-4">
                        <h4 class="text-slate-900 font-bold uppercase tracking-widest text-[11px]">Developer & Owner</h4>
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg">AS</div>
                            <div>
                                <p class="text-slate-900 font-bold text-base">Ashraf Shaik</p>
                                <p class="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Founder & Lead Engineer</p>
                            </div>
                        </div>
                    </div>

                    <!-- Column 3: Contact & Socials -->
                    <div class="space-y-4">
                        <h4 class="text-slate-900 font-bold uppercase tracking-widest text-[11px]">Get in Touch</h4>
                        <div class="grid grid-cols-1 gap-4">
                            <div class="space-y-3">
                                <a href="tel:8500543154" class="flex items-center gap-3 text-sm hover:text-blue-600 transition-colors group">
                                    <span class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <i data-lucide="phone" class="w-4 h-4 text-slate-400 group-hover:text-blue-500"></i>
                                    </span>
                                    <span class="font-medium">8500543154</span>
                                </a>
                                <a href="mailto:ashubasha52@gmail.com" class="flex items-center gap-3 text-sm hover:text-blue-600 transition-colors group">
                                    <span class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <i data-lucide="mail" class="w-4 h-4 text-slate-400 group-hover:text-blue-500"></i>
                                    </span>
                                    <span class="font-medium">ashubasha52@gmail.com</span>
                                </a>
                            </div>

                            <div class="flex flex-col gap-3 pt-3 border-t border-slate-50">
                                <a href="https://instagram.com/shaik.m_ashraf" target="_blank" class="flex items-center gap-3 text-sm hover:text-pink-600 transition-colors group">
                                    <span class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                                        <i data-lucide="instagram" class="w-4 h-4 text-slate-400 group-hover:text-pink-500"></i>
                                    </span>
                                    <span class="font-medium">@shaik.m_ashraf</span>
                                </a>
                                <a href="https://twitter.com/ashushaikz" target="_blank" class="flex items-center gap-3 text-sm hover:text-blue-400 transition-colors group">
                                    <span class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <i data-lucide="twitter" class="w-4 h-4 text-slate-400 group-hover:text-blue-400"></i>
                                    </span>
                                    <span class="font-medium">@ashushaikz</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto pt-8 border-t border-slate-100 text-center">
                    <p class="text-slate-300 text-[11px] font-medium tracking-wide">&copy; 2026 SmartCare HQMS. All rights reserved. Designed with precision for human health.</p>
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

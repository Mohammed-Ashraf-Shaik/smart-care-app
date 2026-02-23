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

            <footer class="bg-slate-950 text-white py-20 px-8 border-t border-white/5 relative overflow-hidden">
                <!-- Decorative background elements -->
                <div class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-0"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -z-0"></div>

                <div class="max-w-7xl mx-auto relative z-10">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        <!-- Col 1: Brand & Vision -->
                        <div class="lg:col-span-5 space-y-8">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <i data-lucide="heart" class="w-6 h-6 text-white fill-current"></i>
                                </div>
                                <div>
                                    <h3 class="text-3xl font-black tracking-tighter uppercase leading-none">SmartCare</h3>
                                    <p class="text-blue-500 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">Health Quality Management</p>
                                </div>
                            </div>
                            <p class="text-slate-400 text-lg leading-relaxed max-w-md">
                                Setting new standards in patient care through intelligent infrastructure. We build tools that save time and save lives.
                            </p>
                        </div>

                        <!-- Col 2: The Founder / Owner Card -->
                        <div class="lg:col-span-7">
                            <div class="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
                                
                                <div class="space-y-6">
                                    <div>
                                        <p class="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2">Developed & Owned by</p>
                                        <h4 class="text-2xl font-bold">Ashraf Shaik</h4>
                                        <p class="text-slate-400 text-sm mt-1">Founder, SmartCare Systems</p>
                                    </div>
                                    
                                    <div class="space-y-3">
                                        <a href="tel:8500543154" class="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                                            <i data-lucide="phone" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
                                            <span class="text-sm font-medium">8500543154</span>
                                        </a>
                                        <a href="mailto:ashubasha52@gmail.com" class="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                                            <i data-lucide="mail" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
                                            <span class="text-sm font-medium">ashubasha52@gmail.com</span>
                                        </a>
                                    </div>
                                </div>

                                <div class="space-y-6">
                                    <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Follow on Socials</p>
                                    <div class="grid grid-cols-1 gap-3">
                                        <a href="https://instagram.com/shaik.m_ashraf" target="_blank" class="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                            <div class="flex items-center gap-3">
                                                <i data-lucide="instagram" class="w-5 h-5 text-pink-500"></i>
                                                <span class="text-sm font-bold">@shaik.m_ashraf</span>
                                            </div>
                                            <i data-lucide="external-link" class="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </a>
                                        <a href="https://twitter.com/ashushaikz" target="_blank" class="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                            <div class="flex items-center gap-3">
                                                <i data-lucide="twitter" class="w-5 h-5 text-blue-400"></i>
                                                <span class="text-sm font-bold">@ashushaikz</span>
                                            </div>
                                            <i data-lucide="external-link" class="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        <p>&copy; 2026 SmartCare HQMS. All rights reserved.</p>
                        <div class="flex gap-8">
                            <span class="text-slate-700">Privacy Policy</span>
                            <span class="text-slate-700">Terms of Service</span>
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

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

            <footer class="bg-slate-50 text-slate-400 text-sm py-8 text-center">
                &copy; 2026 SmartCare Systems. All rights reserved.
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

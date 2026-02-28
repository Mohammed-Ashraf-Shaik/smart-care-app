(function () {
    window.App.Views.Staff = function () {
        const { state, setView, getRevenue } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen bg-slate-50 p-8 animate-fade-in";

        
        const revenue = getRevenue();
        const patients = 128; 
        const avgWait = "14m";

        container.innerHTML = `
            <div class="max-w-7xl mx-auto space-y-12">
                <div class="flex items-center justify-between">
                    <button id="btn-back" class="group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black transition-all">
                        <div class="w-10 h-10 glass-card rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i data-lucide="arrow-left" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs tracking-widest uppercase">Portal Hub</span>
                    </button>
                    <div class="flex items-center gap-4 text-right">
                        <div>
                            <p class="text-xs font-black text-slate-900 tracking-tight">Executive Dashboard</p>
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-black">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                             <i data-lucide="bar-chart-3" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>

                <header class="relative">
                    <div class="absolute -left-10 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-3xl"></div>
                    <h1 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter relative z-10">Facility Intelligence</h1>
                    <p class="text-slate-400 mt-3 font-medium text-lg tracking-tight">${state.loggedHospital || 'Central Medical Hub'} • <span class="text-brand-600 font-bold">${state.loggedCity} District</span></p>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Total Patients -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-white shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div class="relative z-10">
                            <div class="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <i data-lucide="users" class="w-6 h-6"></i>
                            </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
                            <h2 class="text-5xl font-black text-slate-900 tracking-tighter">${patients}</h2>
                            <div class="flex items-center gap-2 mt-4">
                                <span class="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> 12%
                                </span>
                                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">vs last month</span>
                            </div>
                        </div>
                    </div>

                    <!-- Wait Time -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-white shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div class="relative z-10">
                            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <i data-lucide="clock" class="w-6 h-6"></i>
                            </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Wait</p>
                            <h2 class="text-5xl font-black text-slate-900 tracking-tighter">${avgWait}</h2>
                            <div class="flex items-center gap-2 mt-4">
                                <span class="flex items-center text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> +2m
                                </span>
                                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Efficiency Alert</span>
                            </div>
                        </div>
                    </div>

                    <!-- Revenue -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-white shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div class="relative z-10">
                            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <i data-lucide="banknote" class="w-6 h-6"></i>
                            </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Revenue</p>
                            <h2 class="text-5xl font-black text-slate-900 tracking-tighter">₹${revenue} <span class="text-lg text-slate-300">k</span></h2>
                            <div class="flex items-center gap-2 mt-4">
                                <span class="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    <i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> 5%
                                </span>
                                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Target achieved</span>
                            </div>
                        </div>
                    </div>

                    <!-- Active Cases -->
                    <div class="glass-card p-8 rounded-[2.5rem] border-white shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
                        <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-900 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700"></div>
                        <div class="relative z-10">
                            <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <i data-lucide="activity" class="w-6 h-6"></i>
                            </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Queue</p>
                            <h2 class="text-5xl font-black text-slate-900 tracking-tighter">${state.queue.length}</h2>
                            <div class="flex items-center gap-2 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Live Session tracking
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <!-- Hourly Traffic Chart -->
                    <div class="glass-card p-10 rounded-[3.5rem] border-white shadow-2xl relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl"></div>
                        <div class="flex justify-between items-center mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 tracking-tight">Patient Traffic</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hourly Distribution</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><i data-lucide="download" class="w-4 h-4"></i></button>
                                <button class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><i data-lucide="maximize" class="w-4 h-4"></i></button>
                            </div>
                        </div>
                        <div class="h-64 flex items-end justify-between space-x-6 px-2">
                             ${[40, 65, 45, 90, 65, 80, 50].map((h, i) => `
                                <div class="flex-1 group/bar relative">
                                    <div class="w-full bg-slate-50 rounded-[1.5rem] group-hover/bar:bg-brand-50 transition-all cursor-pointer relative overflow-hidden" style="height: ${h}%">
                                        <div class="absolute inset-x-0 bottom-0 bg-brand-500 rounded-t-[1.5rem] transition-all duration-1000 origin-bottom scale-y-0 group-hover/bar:scale-y-100" style="height: 100%"></div>
                                        <div class="absolute inset-x-0 bottom-0 bg-brand-400/20 rounded-t-[1.5rem]" style="height: 100%"></div>
                                    </div>
                                    <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 shadow-xl z-20 whitespace-nowrap">
                                        ${h} PAX
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                    </div>
                                    <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-tighter">${8 + i * 2}${8 + i * 2 >= 12 ? 'pm' : 'am'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Room Status Grid -->
                    <div class="glass-card p-10 rounded-[3.5rem] border-white shadow-2xl relative overflow-hidden">
                        <div class="flex justify-between items-center mb-10">
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 tracking-tight">Room Assets</h3>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Occupancy Monitor</p>
                            </div>
                            <div class="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-2">
                                <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span class="text-[10px] font-black uppercase tracking-widest">Real-time</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <!-- Room 1 -->
                            <div class="glass-card p-5 border-slate-50/50 hover:border-white transition-all flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <i data-lucide="door-closed" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">OPD-1</p>
                                        <p class="font-black text-slate-800 tracking-tight">Internal Med</p>
                                    </div>
                                </div>
                                <div class="px-3 py-1 bg-rose-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Busy</div>
                            </div>
                            <!-- Room 2 -->
                            <div class="glass-card p-5 border-slate-50/50 hover:border-white transition-all flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <i data-lucide="door-open" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">OPD-2</p>
                                        <p class="font-black text-slate-800 tracking-tight">Pediatrics</p>
                                    </div>
                                </div>
                                <div class="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Free</div>
                            </div>
                            <!-- Room 3 -->
                            <div class="glass-card p-5 border-slate-50/50 hover:border-white transition-all flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <i data-lucide="door-closed" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">ER-1</p>
                                        <p class="font-black text-slate-800 tracking-tight">Trauma Bay</p>
                                    </div>
                                </div>
                                <div class="px-3 py-1 bg-rose-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Critical</div>
                            </div>
                             <!-- Room 4 -->
                             <div class="glass-card p-5 border-slate-50/50 hover:border-white transition-all flex items-center justify-between group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <i data-lucide="sparkles" class="w-6 h-6"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">ER-2</p>
                                        <p class="font-black text-slate-800 tracking-tight">Sterilization</p>
                                    </div>
                                </div>
                                <div class="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">Clean</div>
                            </div>
                        </div>

                        <div class="mt-8 p-6 bg-slate-900 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                            <div class="flex items-start gap-4 relative z-10">
                                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-500">
                                    <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-white text-sm tracking-tight">Infrastructure Alert</h4>
                                    <p class="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 uppercase tracking-widest">Cardiology dept. reaching threshold. Automated routing enabled.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </div>
        `;

        container.querySelector('#btn-back').onclick = () => setView('landing');

        return container;
    };

})();

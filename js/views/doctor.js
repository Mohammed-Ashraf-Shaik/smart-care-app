(function () {
    window.App.Views.Doctor = function () {
        const { state, setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen bg-slate-50 p-8 animate-fade-in";

        const queueRows = state.queue.map(p => {
            const badgeStyles = p.triage === 'Red' ? 'bg-red-50 text-red-600 border-red-100' :
                p.triage === 'Yellow' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';

            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-all group cursor-pointer">
                    <td class="p-6">
                        <span class="text-xs font-black text-slate-300 group-hover:text-brand-500 transition-colors">#${p.id}</span>
                    </td>
                    <td class="p-6">
                        <div class="font-black text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform inline-block text-lg">${p.name}</div>
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Age: ${p.age} • Priority: ${p.triage}</div>
                    </td>
                    <td class="p-6">
                        <div class="text-sm font-medium text-slate-600 line-clamp-1">${p.problem}</div>
                    </td>
                    <td class="p-6">
                        <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeStyles}">${p.triage}</span>
                    </td>
                    <td class="p-6 text-right">
                        <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner ml-auto">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const currentPatient = state.queue[0] || null;
        const currentPatientName = currentPatient ? currentPatient.name : "No Active Patient";
        const currentPatientId = currentPatient ? `#${currentPatient.id}` : "";
        const currentPatientProblem = currentPatient ? currentPatient.problem : "Awaiting next appointment";

        container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-10">
                <div class="flex items-center justify-between">
                    <button id="btn-back" class="group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black transition-all">
                        <div class="w-10 h-10 glass-card rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i data-lucide="arrow-left" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs tracking-widest uppercase">Portal Hub</span>
                    </button>
                    <div class="flex items-center gap-4 text-right">
                        <div>
                            <p class="text-xs font-black text-slate-900 tracking-tight">${state.loggedHospital}</p>
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-black">${state.loggedCity}</p>
                        </div>
                        <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                             <i data-lucide="user" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>
                
                <div class="relative overflow-hidden group">
                    <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                    <div class="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div class="glass-card p-10 md:p-12 rounded-[3.5rem] border-white shadow-2xl relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                        <!-- Patient Info -->
                        <div class="flex-1 space-y-6">
                            <div class="space-y-2">
                                <p class="text-brand-600 font-black text-[10px] tracking-[0.4em] uppercase">Active Treatment Session</p>
                                <div class="flex items-baseline gap-4">
                                    <h2 class="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">${currentPatientName}</h2>
                                    <span class="text-2xl font-black text-slate-300">${currentPatientId}</span>
                                </div>
                                <p class="text-xl font-medium text-slate-500 max-w-md leading-relaxed">${currentPatientProblem}</p>
                            </div>
                            
                            <div class="flex gap-4">
                                <button class="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm tracking-widest uppercase shadow-xl hover:bg-brand-600 transition-all active:scale-95">Open EMR</button>
                                <button class="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-white transition-all">
                                    <i data-lucide="history" class="w-6 h-6"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Pulse Widget -->
                        <div class="w-full lg:w-96 space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="glass-card p-6 rounded-3xl border-slate-50/50 hover:border-white transition-all">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Heart Rate</p>
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-3xl font-black text-rose-500">72</span>
                                        <span class="text-xs font-bold text-slate-300">BPM</span>
                                    </div>
                                </div>
                                <div class="glass-card p-6 rounded-3xl border-slate-50/50 hover:border-white transition-all">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saturation</p>
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-3xl font-black text-cyan-500">98</span>
                                        <span class="text-xs font-bold text-slate-300">%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button id="btn-next-patient" class="w-full bg-brand-600 text-white py-6 rounded-[2rem] font-black text-lg tracking-widest uppercase shadow-2xl shadow-brand-200 transition-all hover:bg-brand-700 active:scale-95 flex items-center justify-center gap-4 ${!currentPatient ? 'opacity-50 cursor-not-allowed' : ''}">
                                Complete Treatment
                                <i data-lucide="check-circle" class="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="glass-card rounded-[3rem] border-white shadow-2xl overflow-hidden pb-6">
                    <div class="p-10 border-b border-slate-50 flex justify-between items-center bg-white/50">
                        <div>
                            <h3 class="font-black text-2xl text-slate-900 tracking-tight">Patient Queue</h3>
                            <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time status monitor</p>
                        </div>
                        <div class="px-6 py-2.5 bg-brand-50 rounded-full border border-brand-100">
                             <span class="text-brand-600 text-xs font-black uppercase tracking-widest">${state.queue.length} Active in Queue</span>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse whitespace-nowrap">
                            <thead class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/30">
                                <tr>
                                    <th class="p-6">ID</th>
                                    <th class="p-6">Patient Details</th>
                                    <th class="p-6">Chief Complaint</th>
                                    <th class="p-6">Triage</th>
                                    <th class="p-6"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${queueRows}
                            </tbody>
                        </table>
                    </div>
                    ${state.queue.length === 0 ? `
                        <div class="p-20 text-center space-y-4">
                            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <i data-lucide="coffee" class="w-10 h-10"></i>
                            </div>
                            <p class="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Queue Clear • Time for Coffee</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        container.querySelector('#btn-back').onclick = () => setView('landing');

        const nextBtn = container.querySelector('#btn-next-patient');
        if (nextBtn && currentPatient) {
            nextBtn.onclick = async () => {
                nextBtn.disabled = true;
                nextBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i>`;
                lucide.createIcons();
                try {
                    await window.App.DB.removePatient(currentPatient.id);
                } catch (e) {
                    alert("Failed to complete treatment. Please try again.");
                    nextBtn.disabled = false;
                    nextBtn.innerHTML = `NEXT <i data-lucide="chevron-right" class="w-5 h-5 ml-2"></i>`;
                    lucide.createIcons();
                }
            };
        }

        return container;
    };
})();

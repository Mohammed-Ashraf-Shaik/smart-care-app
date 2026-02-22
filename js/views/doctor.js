(function () {
    window.App.Views.Doctor = function () {
        const { state, setView } = window.App.Store;

        const container = document.createElement('div');
        container.className = "min-h-screen bg-slate-50 p-8 animate-fade-in";

        const queueRows = state.queue.map(p => {
            const badgeColor = p.triage === 'Red' ? 'bg-red-100 text-red-600' :
                p.triage === 'Yellow' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-600';

            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td class="p-6 font-bold text-slate-700">#${p.id}</td>
                    <td class="p-6">
                        <div class="font-bold text-slate-900">${p.name}</div>
                        <div class="text-xs text-slate-400">Age: ${p.age}</div>
                    </td>
                    <td class="p-6 text-slate-600">${p.problem}</td>
                    <td class="p-6">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}">${p.triage}</span>
                    </td>
                    <td class="p-6 text-right">
                        <button class="text-slate-300 hover:text-brand-600 transition-colors">
                            <i data-lucide="more-horizontal"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        const currentPatient = state.queue[0] || null;
        const currentPatientName = currentPatient ? `${currentPatient.name} (#${currentPatient.id})` : "No Patient";
        const currentPatientProblem = currentPatient ? currentPatient.problem : "No active session";

        container.innerHTML = `
            <div class="max-w-6xl mx-auto">
                 <button id="btn-back" class="mb-8 flex items-center text-slate-500 hover:text-blue-600 font-bold transition-colors">
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i> Back to Hub
                </button>
                
                <div class="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-brand-900 to-slate-900 opacity-90"></div>
                    <div class="absolute -right-20 -top-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl"></div>
                    
                    <!-- Patient Info -->
                    <div class="relative z-10 mb-6 md:mb-0 md:w-1/3">
                        <p class="opacity-70 uppercase text-xs tracking-widest mb-1">Treating at ${state.loggedHospital || 'Facility'}</p>
                        <h2 class="text-4xl font-black tracking-tight">${currentPatientName}</h2>
                        <p class="text-blue-200 mt-2 flex items-center"><i data-lucide="activity" class="w-4 h-4 mr-2"></i> ${currentPatientProblem}</p>
                    </div>

                    <!-- Vitals Widget (NEW) -->
                    <div class="relative z-10 grid grid-cols-3 gap-4 md:w-1/3 mb-6 md:mb-0">
                        <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                            <p class="text-[10px] uppercase tracking-wider opacity-60">Heart Rate</p>
                            <p class="text-xl font-bold text-green-400">72 <span class="text-xs font-normal opacity-50">bpm</span></p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                            <p class="text-[10px] uppercase tracking-wider opacity-60">Blood Press.</p>
                            <p class="text-xl font-bold text-blue-400">120/80</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
                            <p class="text-[10px] uppercase tracking-wider opacity-60">SpO2</p>
                            <p class="text-xl font-bold text-yellow-400">98<span class="text-xs font-normal opacity-50">%</span></p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="relative z-10 flex gap-2">
                         <button class="bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl transition backdrop-blur-md" title="Patient History">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                        </button>
                        <button id="btn-next-patient" class="bg-white text-slate-900 px-6 py-4 rounded-xl font-black hover:bg-blue-50 transition shadow-lg flex items-center ${!currentPatient ? 'opacity-50 cursor-not-allowed' : ''}">
                            NEXT <i data-lucide="chevron-right" class="w-5 h-5 ml-2"></i>
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 class="font-bold text-xl text-slate-800">Waiting Queue</h3>
                        <span class="bg-blue-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">${state.queue.length} Patients</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse whitespace-nowrap">
                            <thead class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th class="p-6">Token</th>
                                    <th class="p-6">Patient Details</th>
                                    <th class="p-6">Problem</th>
                                    <th class="p-6">Priority</th>
                                    <th class="p-6"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                ${queueRows}
                            </tbody>
                        </table>
                    </div>
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

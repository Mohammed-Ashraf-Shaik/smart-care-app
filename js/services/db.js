(function () {
    const config = window.App?.Config || {};
    const supabaseEnabled = config.supabaseEnabled === true && !!config.supabaseUrl && !!config.supabaseAnonKey && !!window.supabase;

    const readStorage = key => { try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; } };

    if (!supabaseEnabled) {
        const queueKey = 'smartcare.demoQueue';
        const accountsKey = 'smartcare.localAccounts';
        const defaultQueue = [{
            id: 'SC-DEMO001',
            name: 'Maya Singh',
            age: 29,
            gender: 'Female',
            doctorPref: 'General consultation',
            area: 'Hyderabad',
            symptoms: 'Follow-up consultation',
            problem: 'Follow-up consultation',
            hospital: 'SmartCare Community Hospital',
            country: 'India',
            state: 'Telangana',
            city: 'Hyderabad',
            triage: 'Green',
            fee: 125,
            status: 'waiting',
            created_at: new Date(Date.now() - 18 * 60000).toISOString()
        }];

        const storedQueue = readStorage(queueKey);
        const demoQueue = Array.isArray(storedQueue) && storedQueue.length ? storedQueue : defaultQueue;
        const seededVisit = demoQueue.find(item => item.id === 'SC-DEMO001' && String(item.status || '').toLowerCase() === 'waiting');
        if (seededVisit && Date.now() - new Date(seededVisit.created_at || 0).getTime() > 2 * 60 * 60 * 1000) {
            seededVisit.created_at = new Date(Date.now() - 18 * 60000).toISOString();
            try { window.localStorage.setItem(queueKey, JSON.stringify(demoQueue)); } catch {}
        }

        function saveDemoQueue() {
            try { window.localStorage.setItem(queueKey, JSON.stringify(demoQueue)); } catch {}
            window.dispatchEvent(new CustomEvent('smartcare:queue-updated', { detail: [...demoQueue] }));
        }

        const demoUsers = {
            'patient@smartcare.demo': { email: 'patient@smartcare.demo', password: 'demo1234', role: 'patient', name: 'Asha Rao', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' },
            'hospital@smartcare.demo': { email: 'hospital@smartcare.demo', password: 'demo1234', role: 'doctor', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' },
            'admin@smartcare.demo': { email: 'admin@smartcare.demo', password: 'demo1234', role: 'staff', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' }
        };
        const savedAccounts = readStorage(accountsKey);
        const localUsers = { ...demoUsers, ...(savedAccounts && typeof savedAccounts === 'object' ? savedAccounts : {}) };
        const saveAccounts = () => {
            const registeredUsers = Object.fromEntries(Object.entries(localUsers).filter(([email]) => !demoUsers[email]));
            try { window.localStorage.setItem(accountsKey, JSON.stringify(registeredUsers)); } catch {}
        };
        const demoBloodCentres = [
            { id: 'blood-demo-1', name: 'SmartCare Community Hospital Blood Bank', area: 'Banjara Hills, Hyderabad', city: 'hyderabad', supported_groups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], hours: 'Open today · 09:00–17:00', note: 'Supports all common blood groups.' },
            { id: 'blood-demo-2', name: 'Red Cross Donation Centre', area: 'Secunderabad, Hyderabad', city: 'hyderabad', supported_groups: ['A+', 'B+', 'AB+', 'O+'], hours: 'Open today · 10:00–18:00', note: 'Call ahead for group-specific availability.' },
            { id: 'blood-demo-3', name: 'CityCare Blood Services', area: 'Kukatpally, Hyderabad', city: 'hyderabad', supported_groups: ['A-', 'B-', 'AB-', 'O-'], hours: 'Open today · 08:00–16:00', note: 'Bring a valid photo ID for screening.' }
        ];

        window.App.DB = {
            checkEmailExists: async email => ({ success: !!localUsers[String(email).toLowerCase()] }),
            checkCredentials: async (hospital, email, password, role) => {
                const user = localUsers[String(email).toLowerCase()];
                const hospitalMatches = role === 'patient' || !hospital || String(user?.hospital || '').toLowerCase() === String(hospital).toLowerCase();
                return user && user.password === password && user.role === role && hospitalMatches
                    ? { success: true, user: { email: user.email, role: user.role, hospital: user.hospital, country: user.country, state: user.state, city: user.city } }
                    : { success: false, error: 'The email, password, portal, or care centre does not match this account.' };
            },
            registerProfessional: async profData => {
                const email = String(profData.email || '').toLowerCase();
                if (localUsers[email]) return { success: false, error: 'An account with this email already exists.' };
                const user = { email, password: profData.password, role: profData.role, hospital: profData.hospital, country: 'India', state: 'Telangana', city: 'Hyderabad' };
                localUsers[email] = user;
                saveAccounts();
                return { success: true, user: { email, role: user.role, hospital: user.hospital, country: user.country, state: user.state, city: user.city } };
            },
            registerPatient: async patientData => {
                const email = String(patientData.email || '').toLowerCase();
                if (localUsers[email]) return { success: false, error: 'An account with this email already exists.' };
                const user = { email, password: patientData.password, role: 'patient', name: patientData.name, hospital: '', country: 'India', state: 'Telangana', city: patientData.city || 'Hyderabad' };
                localUsers[email] = user;
                saveAccounts();
                return { success: true, user: { email, role: 'patient', name: user.name, country: user.country, state: user.state, city: user.city } };
            },
            verifyPasswordHint: async () => ({ success: false, error: 'Password recovery is unavailable in local demo mode.' }),
            resetPassword: async () => ({ success: false, error: 'Password recovery is unavailable in local demo mode.' }),
            updatePassword: async () => ({ success: false, error: 'Password recovery is unavailable in local demo mode.' }),
            fetchQueue: async () => [...demoQueue],
            listenToQueue: onUpdate => {
                const localHandler = event => onUpdate(event.detail || []);
                const storageHandler = event => {
                    if (event.key !== queueKey) return;
                    const nextQueue = readStorage(queueKey);
                    onUpdate(Array.isArray(nextQueue) ? nextQueue : []);
                };
                window.addEventListener('smartcare:queue-updated', localHandler);
                window.addEventListener('storage', storageHandler);
                return () => {
                    window.removeEventListener('smartcare:queue-updated', localHandler);
                    window.removeEventListener('storage', storageHandler);
                };
            },
            signOut: async () => {},
            getCurrentUser: async () => null,
            listenToAuth: () => () => {},
            findBloodCentres: async ({ group, city }) => demoBloodCentres.filter(centre => (!group || centre.supported_groups.includes(group)) && (!city || centre.city.includes(String(city).toLowerCase()) || centre.area.toLowerCase().includes(String(city).toLowerCase()) || centre.area.includes(String(city)))),
            submitDonationInterest: async payload => ({ success: true, id: `donation-demo-${Date.now()}`, payload }),
            addPatient: async patientData => {
                const id = `SC-${Date.now().toString(36).toUpperCase()}`;
                const record = {
                    id,
                    name: patientData.name || 'Patient',
                    age: parseInt(patientData.age) || 30,
                    gender: patientData.gender || 'Not specified',
                    doctorPref: patientData.doctorPref || 'General consultation',
                    doctor_pref: patientData.doctorPref || 'General consultation',
                    department: patientData.department || 'General medicine',
                    doctorId: patientData.doctorId || '',
                    doctorName: patientData.doctorName || patientData.doctorPref || 'Next available clinician',
                    consultationType: patientData.consultationType || 'In-person consultation',
                    appointmentDate: patientData.appointmentDate || new Date().toISOString().slice(0, 10),
                    appointmentSlot: patientData.appointmentSlot || 'Next available',
                    patientEmail: patientData.patientEmail || '',
                    queueHospital: patientData.queueHospital || patientData.hospital || 'SmartCare Community Hospital',
                    requestedHospital: patientData.requestedHospital || patientData.hospital || 'SmartCare Community Hospital',
                    demoMirrored: patientData.demoMirrored === true,
                    area: patientData.area || 'Hyderabad',
                    symptoms: patientData.symptoms || 'General consultation',
                    problem: patientData.symptoms || 'General consultation',
                    hospital: patientData.hospital || 'SmartCare Community Hospital',
                    country: patientData.country || 'India',
                    state: patientData.state || 'Telangana',
                    city: patientData.city || 'Hyderabad',
                    triage: patientData.triage || 'Unassessed',
                    fee: patientData.fee || 125,
                    created_at: new Date().toISOString(),
                    status: 'waiting'
                };
                demoQueue.push(record);
                saveDemoQueue();
                if (window.App.Store?.updateQueue) {
                    window.App.Store.updateQueue([...demoQueue]);
                }
                return id;
            },
            updatePatient: async (id, updates) => {
                const record = demoQueue.find(item => item.id === id);
                if (record) {
                    Object.assign(record, updates);
                    saveDemoQueue();
                    if (window.App.Store?.updateQueue) {
                        window.App.Store.updateQueue([...demoQueue]);
                    }
                }
            },
            removePatient: async id => {
                const index = demoQueue.findIndex(item => item.id === id);
                if (index >= 0) {
                    demoQueue.splice(index, 1);
                    saveDemoQueue();
                    if (window.App.Store?.updateQueue) {
                        window.App.Store.updateQueue([...demoQueue]);
                    }
                }
            }
        };
        return;
    }

    const SUPABASE_URL = config.supabaseUrl;
    const SUPABASE_KEY = config.supabaseAnonKey;

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const DB = {
        signOut: async () => { await supabase.auth.signOut(); },
        getCurrentUser: async () => {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session?.user) return null;
            const { data: profile, error: profileError } = await supabase.from('professionals').select('id,email,hospital,role,country,state,city').eq('id', sessionData.session.user.id).maybeSingle();
            if (profileError) return null;
            return { session: sessionData.session, user: sessionData.session.user, profile: profile || { email: sessionData.session.user.email, role: 'patient', hospital: '', country: 'India', state: '', city: '' } };
        },
        listenToAuth: callback => {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
            return () => data.subscription.unsubscribe();
        },
        findBloodCentres: async ({ group, city }) => {
            const query = supabase.from('blood_donation_centres').select('id,name,area,hours,note,supported_groups').limit(12);
            if (city) query.ilike('area', `%${city}%`);
            if (group) query.contains('supported_groups', [group]);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        submitDonationInterest: async payload => {
            const { data, error } = await supabase.from('donation_interests').insert([{ type: payload.type, name: payload.name, city: payload.city, preference: payload.preference }]).select('id').single();
            return error ? { success: false, error: error.message } : { success: true, id: data?.id };
        },
        checkEmailExists: async (email) => {
            const { data, error } = await supabase
                .from('professionals')
                .select('email')
                .eq('email', email.toLowerCase())
                .maybeSingle();

            if (error) return { success: false, error: error.message };
            return { success: !!data };
        },
        checkCredentials: async (hospital, email, password, role) => {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
            if (authError || !authData.user) return { success: false, error: 'Invalid credentials. Please check your email and password.' };
            if (role === 'patient') return { success: true, user: { email: authData.user.email, role: 'patient', hospital: '', country: 'India', state: '', city: '' } };
            const { data: profile, error: profileError } = await supabase.from('professionals').select('id,email,hospital,role,country,state,city').eq('id', authData.user.id).maybeSingle();
            if (profileError || !profile || profile.role !== role) { await supabase.auth.signOut(); return { success: false, error: 'This account is not enabled for the selected portal.' }; }
            if (String(hospital || '').trim().toLowerCase() !== String(profile.hospital || '').trim().toLowerCase()) { await supabase.auth.signOut(); return { success: false, error: 'The care centre does not match this account.' }; }
            return { success: true, user: profile };
        },
        registerProfessional: async (profData) => {
            const { data: authData, error: authError } = await supabase.auth.signUp({ email: profData.email.toLowerCase(), password: profData.password });
            if (authError || !authData.user) return { success: false, error: authError?.message || 'Account creation failed.' };
            const { data, error } = await supabase.from('professionals').insert([{ id: authData.user.id, email: profData.email.toLowerCase(), hospital: profData.hospital, role: profData.role }]).select('id,email,hospital,role');
            if (error) { await supabase.auth.signOut(); if (error.code === '23505') return { success: false, error: 'An account with this email already exists.' }; return { success: false, error: error.message }; }
            await supabase.auth.signOut();
            return { success: true, user: data[0] };
        },
        registerPatient: async patientData => {
            const { data: authData, error: authError } = await supabase.auth.signUp({ email: patientData.email.toLowerCase(), password: patientData.password, options: { data: { name: patientData.name, role: 'patient' } } });
            if (authError || !authData.user) return { success: false, error: authError?.message || 'Account creation failed.' };
            await supabase.auth.signOut();
            return { success: true, user: { email: patientData.email.toLowerCase(), name: patientData.name, role: 'patient' } };
        },
        verifyPasswordHint: async () => ({ success: false, error: 'Use the secure email recovery link instead.' }),
        resetPassword: async email => {
            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), { redirectTo: `${window.location.origin}${window.SMARTCARE_BASE_PATH || ''}/login` });
            return error ? { success: false, error: error.message } : { success: true };
        },
        updatePassword: async password => {
            const { error } = await supabase.auth.updateUser({ password });
            return error ? { success: false, error: error.message } : { success: true };
        },
        fetchQueue: async () => {
            const { data, error } = await supabase
                .from('queue')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Supabase Fetch Error:", error);
                return [];
            }
            return data;
        },
        listenToQueue: (onUpdate) => {
            const channel = supabase.channel('public:queue')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'queue'
                }, async (payload) => {
                    const queue = await DB.fetchQueue();
                    onUpdate(queue);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        },
        addPatient: async (patientData) => {
            try {
                const data = {
                    name: patientData.name,
                    age: parseInt(patientData.age),
                    gender: patientData.gender,
                    doctor_pref: patientData.doctorPref,
                    area: patientData.area,
                    symptoms: patientData.symptoms,
                    hospital: patientData.hospital,
                    country: patientData.country,
                    state: patientData.state,
                    city: patientData.city,
                    triage: patientData.triage || "Unassessed",
                    fee: patientData.fee || 125,
                    problem: patientData.symptoms || "Unknown"
                };

                const { data: insertedData, error } = await supabase
                    .from('queue')
                    .insert([data])
                    .select();

                if (error) throw error;
                return insertedData[0].id;
            } catch (e) {
                console.error("Error adding patient: ", e);
                throw e;
            }
        },
        updatePatient: async (id, updates) => {
            try {
                const { error } = await supabase
                    .from('queue')
                    .update(updates)
                    .eq('id', id);
                if (error) throw error;
            } catch (e) {
                console.error("Error updating patient: ", e);
                throw e;
            }
        },
        removePatient: async id => {
            try {
                const { error } = await supabase
                    .from('queue')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } catch (e) {
                console.error("Error removing patient: ", e);
                throw e;
            }
        }
    };

    window.App.DB = DB;
})();

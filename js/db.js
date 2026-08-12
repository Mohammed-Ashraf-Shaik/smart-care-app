(function () {
    
    const config = window.App?.Config || {};
    const supabaseEnabled = config.supabaseEnabled === true && !!config.supabaseUrl && !!config.supabaseAnonKey && !!window.supabase;

    if (!supabaseEnabled) {
        const demoQueue = [{
            id: 'demo-queue-001',
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
        const demoUsers = {
            'hospital@smartcare.demo': { email: 'hospital@smartcare.demo', password: 'demo1234', role: 'doctor', hospital: 'SmartCare Community Hospital', country: 'India', state: 'Telangana', city: 'Hyderabad' },
            'admin@smartcare.demo': { email: 'admin@smartcare.demo', password: 'demo1234', role: 'staff', hospital: 'SmartCare Operations Centre', country: 'India', state: 'Telangana', city: 'Hyderabad' }
        };

        window.App.DB = {
            checkEmailExists: async email => ({ success: !!demoUsers[String(email).toLowerCase()] }),
            checkCredentials: async (hospital, email, password, role) => {
                const user = demoUsers[String(email).toLowerCase()];
                return user && user.password === password && user.role === role
                    ? { success: true, user: { ...user, hospital: hospital || user.hospital } }
                    : { success: false, error: 'Demo mode: use one of the supplied demo accounts.' };
            },
            registerProfessional: async profData => ({ success: true, user: { ...profData, email: profData.email.toLowerCase() } }),
            verifyPasswordHint: async () => ({ success: false, error: 'Password recovery is unavailable in local demo mode.' }),
            resetPassword: async () => ({ success: false, error: 'Password recovery is unavailable in local demo mode.' }),
            fetchQueue: async () => [...demoQueue],
            listenToQueue: () => () => {},
            signOut: async () => {},
            addPatient: async patientData => {
                const id = `SC-${Date.now().toString(36).toUpperCase()}`;
                demoQueue.push({ id, ...patientData, created_at: new Date().toISOString(), status: 'waiting' });
                return id;
            },
            updatePatient: async (id, updates) => {
                const record = demoQueue.find(item => item.id === id);
                if (record) Object.assign(record, updates);
            },
            removePatient: async id => {
                const index = demoQueue.findIndex(item => item.id === id);
                if (index >= 0) demoQueue.splice(index, 1);
            }
        };
        return;
    }

    const SUPABASE_URL = config.supabaseUrl;
    const SUPABASE_KEY = config.supabaseAnonKey;

    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const DB = {
        signOut: async () => { await supabase.auth.signOut(); },
        
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
            const { data: profile, error: profileError } = await supabase.from('professionals').select('id,email,hospital,role,country,state,city').eq('id', authData.user.id).maybeSingle();
            if (profileError || !profile || profile.role !== role) { await supabase.auth.signOut(); return { success: false, error: 'This account is not enabled for the selected portal.' }; }
            return { success: true, user: { ...profile, hospital: hospital || profile.hospital } };
        },

        
        registerProfessional: async (profData) => {
            const { data: authData, error: authError } = await supabase.auth.signUp({ email: profData.email.toLowerCase(), password: profData.password });
            if (authError || !authData.user) return { success: false, error: authError?.message || 'Account creation failed.' };
            const { data, error } = await supabase.from('professionals').insert([{ id: authData.user.id, email: profData.email.toLowerCase(), hospital: profData.hospital, role: profData.role }]).select('id,email,hospital,role');
            if (error) { await supabase.auth.signOut(); if (error.code === '23505') return { success: false, error: 'An account with this email already exists.' }; return { success: false, error: error.message }; }
            await supabase.auth.signOut();
            return { success: true, user: data[0] };
        },

        
        verifyPasswordHint: async () => ({ success: false, error: 'Use the secure email recovery link instead.' }),

        
        resetPassword: async email => {
            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), { redirectTo: `${window.location.origin}${window.SMARTCARE_BASE_PATH || ''}/login` });
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
                    console.log('Change received!', payload);
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
                    triage: patientData.triage || "Green",
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

        
        removePatient: async (id) => {
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

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
            const { data, error } = await supabase
                .from('professionals')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('password', password)
                .eq('role', role)
                .single();

            if (error || !data) {
                return {
                    success: false,
                    error: "Invalid credentials. Please check your email, password, and portal role."
                };
            }

            return {
                success: true,
                user: data
            };
        },

        
        registerProfessional: async (profData) => {
            const { data, error } = await supabase
                .from('professionals')
                .insert([{
                    email: profData.email.toLowerCase(),
                    hospital: profData.hospital,
                    password: profData.password,
                    role: profData.role
                }])
                .select();

            if (error) {
                if (error.code === '23505') return { success: false, error: "An account with this email already exists." };
                return { success: false, error: error.message };
            }

            return { success: true, user: data[0] };
        },

        
        verifyPasswordHint: async (email, hint) => {
            const { data, error } = await supabase
                .from('professionals')
                .select('password')
                .eq('email', email.toLowerCase())
                .single();

            if (error || !data) return { success: false, error: "Identifier not found." };

            const firstTwo = data.password.substring(0, 2);
            if (firstTwo === hint) return { success: true };
            return { success: false, error: "Verification hint incorrect." };
        },

        
        resetPassword: async (email, newPassword) => {
            const { error } = await supabase
                .from('professionals')
                .update({ password: newPassword })
                .eq('email', email.toLowerCase());

            if (error) return { success: false, error: error.message };
            return { success: true };
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

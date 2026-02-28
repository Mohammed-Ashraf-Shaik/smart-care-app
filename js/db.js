(function () {
    
    const SUPABASE_URL = "https://lwltivsudapbpobfdwwp.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bHRpdnN1ZGFwYnBvYmZkd3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2Njk3MTQsImV4cCI6MjA4NzI0NTcxNH0.0ZoDTM79VfdHIhF0sJDvOdH3lu1oBm3uy4Cxykac3xA";

    
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
                    fee: patientData.fee || 75,
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

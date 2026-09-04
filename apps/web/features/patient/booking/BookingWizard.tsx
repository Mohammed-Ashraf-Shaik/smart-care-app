'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PatientShell } from '@/components/layout/Shell';
import { usePatient, useAppStore, useSession, CARE_TEAM, getAppointmentSlots, emptyPatientData } from '@/lib/store/app-store';
import { DemoDB } from '@/lib/db/demo-db';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
import type { PatientVisit } from '@smartcare/types';

const STEPS = ['Location', 'Details', 'Review', 'Confirmation'];

const SYMPTOM_OPTIONS = [
  { label: 'General consultation', value: 'general' },
  { label: 'Fever or flu', value: 'fever' },
  { label: 'Injury', value: 'injury' },
  { label: 'Chest pain', value: 'chest_pain' },
  { label: 'Headache', value: 'headache' },
  { label: 'Abdominal pain', value: 'abdominal' },
  { label: 'Breathing difficulty', value: 'breathing' },
  { label: 'Skin condition', value: 'skin' },
];

interface BookingWizardProps {
  step: number;
}

export function BookingWizard({ step: initialStep }: BookingWizardProps) {
  const router = useRouter();
  const { patientData, step, userCoords } = usePatient();
  const { email, isLogged } = useSession();
  const { setStep, updatePatientData, setUserCoords, recordPatientVisit, showToast } = useAppStore((s) => ({
    setStep: s.setStep,
    updatePatientData: s.updatePatientData,
    setUserCoords: s.setUserCoords,
    recordPatientVisit: s.recordPatientVisit,
    showToast: s.showToast,
  }));

  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(patientData.symptomSelections || []);
  const [geoError, setGeoError] = useState('');

  const currentStep = initialStep || step || 1;

  useEffect(() => {
    if (initialStep && initialStep >= 1 && initialStep <= 4) {
      setStep(initialStep);
    }
  }, [initialStep, setStep]);

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    router.push(`/dashboard/patient/apply/${nextStep}`);
  };

  const slots = getAppointmentSlots();

  const getLocation = () => {
    if (!navigator.geolocation) { setGeoError('Geolocation is not supported by your browser.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        updatePatientData('hospital', 'SmartCare Community Hospital');
        updatePatientData('city', 'Hyderabad');
        updatePatientData('state', 'Telangana');
        updatePatientData('country', 'India');
        setLoading(false);
        setGeoError('');
      },
      () => {
        setGeoError('Location permission denied. Using default location.');
        updatePatientData('hospital', 'SmartCare Community Hospital');
        updatePatientData('city', 'Hyderabad');
        updatePatientData('state', 'Telangana');
        updatePatientData('country', 'India');
        setLoading(false);
      }
    );
  };

  const toggleSymptom = (value: string) => {
    const next = selectedSymptoms.includes(value)
      ? selectedSymptoms.filter((s) => s !== value)
      : [...selectedSymptoms, value];
    setSelectedSymptoms(next);
    updatePatientData('symptomSelections', next);
    const labels = next.map((v) => SYMPTOM_OPTIONS.find((o) => o.value === v)?.label || v);
    updatePatientData('symptoms', labels.join(', ') || 'General consultation');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const doctorMember = CARE_TEAM.find((d) => d.id === patientData.doctorId) || CARE_TEAM[0];
      const slotStr = patientData.appointmentSlot || '';
      const [datePart, timePart] = slotStr.includes('|') ? slotStr.split('|') : [new Date().toISOString().slice(0, 10), slotStr];

      const id = await DemoDB.addPatient({
        ...patientData,
        doctorName: doctorMember?.name || patientData.doctorPref,
        appointmentDate: datePart,
        appointmentSlot: timePart,
        patientEmail: email,
        demoMirrored: true,
        triage: 'Unassessed',
        fee: 125,
      });

      const visit: PatientVisit = {
        id,
        hospital: patientData.hospital || 'SmartCare Community Hospital',
        city: patientData.city || 'Hyderabad',
        reason: patientData.symptoms || 'General consultation',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Booked',
        reference: id,
        department: patientData.department,
        doctorName: doctorMember?.name,
        consultationType: patientData.consultationType,
        appointmentDate: datePart,
        appointmentSlot: timePart,
      };

      recordPatientVisit(visit);
      setBookingRef(id);
      goToStep(4);
      showToast('Appointment booked successfully!', 'success');
    } catch (err) {
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <PatientShell subtitle="Book appointment" backHref="/dashboard/patient">
      <div className="max-w-xl mx-auto py-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  i + 1 < currentStep ? 'bg-[var(--teal)] border-[var(--teal)] text-white' :
                  i + 1 === currentStep ? 'border-[var(--teal)] text-[var(--teal)] bg-white' :
                  'border-[var(--line)] text-[var(--text-dim)] bg-white'
                )}>
                  {i + 1 < currentStep ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className="text-[0.6rem] text-[var(--text-muted)] hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--teal)] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h1 className="text-xl font-extrabold">Find care near you</h1>
            <p className="text-sm text-[var(--text-muted)]">Allow location access to find nearby care centres, or continue with the default.</p>

            {geoError && <p className="text-xs text-[var(--yellow)] bg-[var(--yellow-bg)] px-3 py-2 rounded-[var(--radius)]">{geoError}</p>}

            {userCoords ? (
              <div className="flex items-start gap-3 p-4 bg-[var(--mint)] border border-[var(--teal)]/20 rounded-[var(--radius-card)]">
                <MapPin size={18} className="text-[var(--teal)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">SmartCare Community Hospital</p>
                  <p className="text-xs text-[var(--text-muted)]">Hyderabad, Telangana · 2.3 km away</p>
                  <p className="text-xs text-[var(--green)] mt-1">Available · Est. wait 15–25 min</p>
                </div>
              </div>
            ) : (
              <button onClick={getLocation} disabled={loading} className="flex items-center gap-2 h-11 px-5 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-sm hover:bg-[var(--teal-dark)] transition-colors disabled:opacity-60">
                <MapPin size={16} />
                {loading ? 'Finding your location…' : 'Use my location'}
              </button>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Or search by location</p>
              <input
                type="text"
                placeholder="City or area (e.g. Hyderabad)"
                defaultValue={patientData.city || ''}
                onBlur={(e) => { if (e.target.value) { updatePatientData('city', e.target.value); updatePatientData('hospital', 'SmartCare Community Hospital'); updatePatientData('country', 'India'); updatePatientData('state', 'Telangana'); } }}
                className="h-11 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>

            <button
              onClick={() => {
                if (!patientData.hospital) { updatePatientData('hospital', 'SmartCare Community Hospital'); updatePatientData('city', 'Hyderabad'); updatePatientData('state', 'Telangana'); updatePatientData('country', 'India'); }
                goToStep(2);
              }}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-sm hover:bg-[var(--teal-dark)] transition-colors"
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Step 2: Patient details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h1 className="text-xl font-extrabold">Your details</h1>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Full name *</label>
                <input className="h-10 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--teal)]" value={patientData.name} onChange={(e) => updatePatientData('name', e.target.value)} placeholder="e.g. Asha Rao" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Age *</label>
                <input className="h-10 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--teal)]" type="number" value={patientData.age} onChange={(e) => updatePatientData('age', e.target.value)} placeholder="e.g. 32" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                  <button key={g} onClick={() => updatePatientData('gender', g)} className={cn('flex-1 h-9 rounded-[var(--radius)] text-xs font-semibold border transition-colors', patientData.gender === g ? 'bg-[var(--teal)] text-white border-transparent' : 'border-[var(--line)] text-[var(--text-muted)] hover:bg-[var(--surface-raised)]')}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Reason for visit *</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => toggleSymptom(opt.value)} className={cn('px-3 h-8 rounded-full text-xs font-semibold border transition-colors', selectedSymptoms.includes(opt.value) ? 'bg-[var(--teal)] text-white border-transparent' : 'border-[var(--line)] text-[var(--text-muted)] hover:bg-[var(--surface-raised)]')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Preferred clinician</label>
              <select className="h-10 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--teal)]" value={patientData.doctorId} onChange={(e) => updatePatientData('doctorId', e.target.value)}>
                <option value="">Next available clinician</option>
                {CARE_TEAM.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.department}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Appointment slot</label>
              <select className="h-10 px-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--teal)]" value={patientData.appointmentSlot} onChange={(e) => updatePatientData('appointmentSlot', e.target.value)}>
                {slots.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToStep(1)} className="flex items-center gap-1.5 h-11 px-4 rounded-[var(--radius)] border border-[var(--line)] text-sm font-bold hover:bg-[var(--surface-raised)]">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={() => {
                  if (!patientData.name || !patientData.age) { showToast('Please fill in your name and age.', 'error'); return; }
                  if (!patientData.symptoms) { showToast('Please select a reason for your visit.', 'error'); return; }
                  goToStep(3);
                }}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-sm hover:bg-[var(--teal-dark)]"
              >
                Review <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h1 className="text-xl font-extrabold">Review your booking</h1>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] divide-y divide-[var(--line)]">
              {[
                ['Name', patientData.name],
                ['Age', patientData.age],
                ['Gender', patientData.gender || 'Not specified'],
                ['Care centre', patientData.hospital || 'SmartCare Community Hospital'],
                ['Reason for visit', patientData.symptoms],
                ['Clinician', patientData.doctorId ? CARE_TEAM.find((m) => m.id === patientData.doctorId)?.name : 'Next available'],
                ['Appointment', patientData.appointmentSlot ? patientData.appointmentSlot.replace('|', ' at ') : 'Next available'],
                ['Consultation fee', '₹125'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">{label}</span>
                  <span className="text-sm text-[var(--text)] text-right">{value || '—'}</span>
                </div>
              ))}
            </div>

            {!isLogged && (
              <div className="p-3 bg-[var(--yellow-bg)] border border-[var(--yellow)]/30 rounded-[var(--radius)] text-xs text-[var(--yellow)]">
                You are not signed in. Your booking will not be linked to an account.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => goToStep(2)} className="flex items-center gap-1.5 h-11 px-4 rounded-[var(--radius)] border border-[var(--line)] text-sm font-bold hover:bg-[var(--surface-raised)]">
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-sm hover:bg-[var(--teal-dark)] disabled:opacity-60"
              >
                {loading ? 'Confirming…' : 'Confirm booking'} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-[var(--green-bg)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-[var(--green)]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold mb-2">Booking confirmed!</h1>
              <p className="text-sm text-[var(--text-muted)]">Your appointment has been added to the queue.</p>
            </div>

            <div className="bg-[var(--mint)] border border-[var(--teal)]/20 rounded-[var(--radius-card)] p-4 text-left">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Reference number</p>
              <p className="font-mono text-xl font-extrabold text-[var(--teal)]">{bookingRef}</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/dashboard/patient')}
                className="h-11 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-sm hover:bg-[var(--teal-dark)]"
              >
                Go to my dashboard
              </button>
              <button
                onClick={() => { goToStep(1); }}
                className="h-11 rounded-[var(--radius)] border border-[var(--line)] text-sm font-bold hover:bg-[var(--surface-raised)]"
              >
                Book another appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </PatientShell>
  );
}

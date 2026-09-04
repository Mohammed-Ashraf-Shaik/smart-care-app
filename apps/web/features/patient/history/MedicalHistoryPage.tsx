'use client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSession } from '@/lib/store/app-store';
import { PatientShell } from '@/components/layout/Shell';
import { DemoDB } from '@/lib/db/demo-db';
import { generatePassportId } from '@/lib/utils';
import { QrCode, Shield, Pill, AlertCircle, FileHeart, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PatientMedicalHistory } from '@smartcare/types';
import { cn } from '@/lib/utils';

export function MedicalHistoryPage() {
  const { role } = useAuthGuard(['patient']);
  const { email } = useSession();
  const [history, setHistory] = useState<PatientMedicalHistory | null>(null);
  const passportId = generatePassportId(email);

  useEffect(() => {
    if (email) setHistory(DemoDB.getMedicalHistory(email));
  }, [email]);

  if (!role || !history) return null;

  const Section = ({ icon: Icon, title, children, empty }: { icon: React.ElementType; title: string; children?: React.ReactNode; empty?: string }) => (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-[var(--line)]">
        <Icon size={16} className="text-[var(--teal)]" />
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="p-4">
        {children || <p className="text-sm text-[var(--text-muted)]">{empty || 'No information added yet.'}</p>}
      </div>
    </div>
  );

  return (
    <PatientShell subtitle="Medical History" backHref="/dashboard/patient">
      <div className="max-w-2xl mx-auto py-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">Medical history</h1>
          {history.lastUpdated && <span className="text-xs text-[var(--text-muted)]">Updated: {history.lastUpdated}</span>}
        </div>

        {/* Passport ID */}
        <div className="flex items-center gap-3 p-4 bg-[var(--mint)] border border-[var(--teal)]/20 rounded-[var(--radius-card)]">
          <QrCode size={24} className="text-[var(--teal)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Your medical passport ID</p>
            <p className="font-mono text-lg font-extrabold text-[var(--teal)]">{passportId}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Share this with a clinician to access your history via QR scan.</p>
          </div>
        </div>

        {/* Previous provider */}
        {history.previousProvider?.doctorName && (
          <Section icon={User} title="Previous care provider">
            <div className="flex flex-col gap-1 text-sm">
              <p><strong>{history.previousProvider.doctorName}</strong></p>
              <p className="text-[var(--text-muted)]">{history.previousProvider.hospitalName} · {history.previousProvider.city}</p>
              <p className="text-[var(--text-muted)]">{history.previousProvider.contactPhone}</p>
            </div>
          </Section>
        )}

        {/* Conditions */}
        <Section icon={FileHeart} title={`Conditions (${history.diseases.length})`} empty="No conditions recorded.">
          {history.diseases.length > 0 && (
            <div className="flex flex-col gap-2">
              {history.diseases.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-[var(--surface-sunken)] rounded-[var(--radius)]">
                  <div>
                    <p className="text-sm font-medium">{d.diseaseName}</p>
                    <p className="text-xs text-[var(--text-muted)]">Since {d.diagnosedSince}</p>
                  </div>
                  <span className={cn('status-pill text-[0.65rem]', d.status === 'Active' ? 'bg-[var(--yellow-bg)] text-[var(--yellow)]' : d.status === 'In Remission' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]')}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Medications */}
        <Section icon={Pill} title={`Medications (${history.effectiveMedications.length})`} empty="No medications recorded.">
          {history.effectiveMedications.length > 0 && (
            <div className="flex flex-col gap-2">
              {history.effectiveMedications.map((m) => (
                <div key={m.id} className="p-3 bg-[var(--surface-sunken)] rounded-[var(--radius)]">
                  <p className="text-sm font-medium">{m.medicineName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.dosage} · {m.conditionTreated}</p>
                  {m.notes && <p className="text-xs text-[var(--text-dim)] mt-0.5">{m.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Allergies */}
        <Section icon={AlertCircle} title={`Allergies (${history.allergiesAndAvoid.length})`} empty="No allergies recorded.">
          {history.allergiesAndAvoid.length > 0 && (
            <div className="flex flex-col gap-2">
              {history.allergiesAndAvoid.map((a) => (
                <div key={a.id} className="flex items-start justify-between p-3 bg-[var(--red-bg)] rounded-[var(--radius)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--red)]">{a.substance}</p>
                    <p className="text-xs text-[var(--text-muted)]">{a.reactionDescription}</p>
                  </div>
                  <span className="status-pill triage-red text-[0.65rem]">{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Emergency protocols */}
        {history.emergencyProtocols.length > 0 && (
          <Section icon={Shield} title="Emergency protocols">
            <div className="flex flex-col gap-2">
              {history.emergencyProtocols.map((ep) => (
                <div key={ep.id} className="p-3 bg-[var(--surface-sunken)] rounded-[var(--radius)]">
                  <p className="text-sm font-semibold text-[var(--red)]">Trigger: {ep.triggerCondition}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{ep.actionSteps}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </PatientShell>
  );
}

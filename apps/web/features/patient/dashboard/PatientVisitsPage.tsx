'use client';
import { usePatient, useAppStore } from '@/lib/store/app-store';
import { PatientShell } from '@/components/layout/Shell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Building2, ChevronRight, FileDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PatientVisitsPage() {
  const { role } = useAuthGuard(['patient']);
  const { patientVisits } = usePatient();
  const showToast = useAppStore((s) => s.showToast);
  if (!role) return null;

  const downloadVisit = (visitId: string) => {
    showToast('PDF download not available in demo mode', 'info');
  };

  return (
    <PatientShell subtitle="My Visits" backHref="/dashboard/patient">
      <div className="max-w-2xl mx-auto py-6 space-y-4">
        <h1 className="text-2xl font-extrabold">My visits</h1>
        {patientVisits.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
            <Clock size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No visits recorded yet.</p>
            <Link href="/dashboard/patient/apply/1" className="text-sm text-[var(--teal)] hover:underline mt-2 block">Book your first appointment →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {patientVisits.map((visit) => (
              <div key={visit.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 bg-[var(--mint)] rounded-[var(--radius)] flex items-center justify-center text-[var(--teal)] shrink-0">
                    <Building2 size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{visit.hospital}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{visit.reason}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-[var(--text-dim)]">{visit.date}</span>
                      <span className={cn('text-xs font-semibold', visit.status === 'Completed' ? 'text-[var(--green)]' : 'text-[var(--text-muted)]')}>
                        {visit.status}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-dim)]">{visit.reference}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadVisit(visit.id)}
                    className="text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors p-1"
                    aria-label="Download visit PDF"
                  >
                    <FileDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientShell>
  );
}

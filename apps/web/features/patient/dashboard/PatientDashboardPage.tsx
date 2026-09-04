'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSession, usePatient, useAppStore, sortQueue, queueStatus } from '@/lib/store/app-store';
import { PatientShell } from '@/components/layout/Shell';
import { useRouter } from 'next/navigation';
import { CalendarPlus, ClipboardList, Heart, QrCode, ChevronRight, Clock, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn, timeAgo, estimatedWait, generatePassportId } from '@/lib/utils';
import Link from 'next/link';

function getStatusIcon(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed') return <CheckCircle2 size={14} className="text-[var(--green)]" />;
  if (s === 'called' || s === 'in consultation') return <AlertCircle size={14} className="text-[var(--yellow)]" />;
  if (s === 'waiting') return <Clock size={14} className="text-[var(--text-muted)]" />;
  return <Loader2 size={14} className="animate-spin text-[var(--teal)]" />;
}

export function PatientDashboardPage() {
  const { role } = useAuthGuard(['patient']);
  const { email } = useSession();
  const { patientData, patientVisits } = usePatient();
  const queue = useAppStore((s) => s.queue);
  const router = useRouter();

  if (!role) return null;

  const displayName = patientData.name || email.split('@')[0].replace(/[._-]/g, ' ') || 'Patient';
  const passportId = generatePassportId(email);

  // Find active queue item for this patient
  const activeQueueItem = queue.find((item) =>
    String(item.patientEmail || '').toLowerCase() === email.toLowerCase() &&
    !['completed', 'cancelled', 'withdrawn', 'no-show'].includes(queueStatus(item))
  );

  const queuePosition = activeQueueItem
    ? sortQueue(queue).filter((i) => !['completed', 'cancelled', 'withdrawn', 'no-show'].includes(queueStatus(i))).findIndex((i) => i.id === activeQueueItem.id)
    : -1;

  const recentVisits = patientVisits.slice(0, 3);

  return (
    <PatientShell subtitle="Patient portal" backHref="/" backLabel="Back to home">
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        {/* Welcome header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">Patient portal</p>
            <h1 className="text-2xl font-extrabold">{displayName}</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{email}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/patient/history')}
            title="Medical Passport"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-[var(--radius)] bg-[var(--mint)] border border-[var(--teal)]/20 text-[var(--teal)] hover:bg-[var(--teal)]/10 transition-colors"
          >
            <QrCode size={20} />
            <span className="text-[0.6rem] font-bold">Passport</span>
          </button>
        </div>

        {/* Active queue status */}
        {activeQueueItem && (
          <div className="bg-[var(--mint)] border border-[var(--teal)]/25 rounded-[var(--radius-card)] p-4">
            <div className="eyebrow mb-2">
              <span className="eyebrow-dot" />
              Active appointment
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[var(--text)]">{activeQueueItem.hospital}</p>
                <p className="text-sm text-[var(--text-muted)]">{activeQueueItem.symptoms}</p>
              </div>
              <div className="text-right">
                <p className={cn('text-xs font-bold uppercase tracking-wide', queueStatus(activeQueueItem) === 'in_progress' ? 'text-[var(--green)]' : queueStatus(activeQueueItem) === 'called' ? 'text-[var(--yellow)]' : 'text-[var(--teal)]')}>
                  {activeQueueItem.status.replace('_', ' ')}
                </p>
                {queuePosition >= 0 && queueStatus(activeQueueItem) === 'waiting' && (
                  <p className="text-xs text-[var(--text-muted)]">~{estimatedWait(queuePosition)}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">Ticket: {activeQueueItem.id}</p>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Book appointment', icon: CalendarPlus, href: '/dashboard/patient/apply/1', primary: true },
            { label: 'My visits', icon: ClipboardList, href: '/dashboard/patient/visits', primary: false },
            { label: 'Medical history', icon: QrCode, href: '/dashboard/patient/history', primary: false },
            { label: 'Donations', icon: Heart, href: '/dashboard/patient/donations', primary: false },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'flex items-center gap-3 p-4 rounded-[var(--radius-card)] no-underline transition-all',
                'border font-medium text-sm',
                action.primary
                  ? 'bg-[var(--teal)] text-white border-transparent hover:bg-[var(--teal-dark)]'
                  : 'bg-[var(--surface)] border-[var(--line)] text-[var(--text)] hover:bg-[var(--surface-raised)] hover:border-[var(--teal)]/20'
              )}
            >
              <action.icon size={18} strokeWidth={1.8} className={action.primary ? 'text-white/90' : 'text-[var(--teal)]'} />
              {action.label}
            </Link>
          ))}
        </div>

        {/* Recent visits */}
        {recentVisits.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">Recent visits</h2>
              <Link href="/dashboard/patient/visits" className="text-xs text-[var(--teal)] hover:underline no-underline">
                See all →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start justify-between gap-3 p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-8 h-8 bg-[var(--surface-sunken)] rounded-lg flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-[var(--text-muted)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{visit.hospital}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{visit.reason}</p>
                      <p className="text-xs text-[var(--text-dim)] mt-0.5">{visit.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusIcon(visit.status)}
                    <span className="text-xs text-[var(--text-muted)]">{visit.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passport ID card */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Medical passport ID</p>
            <p className="font-mono text-sm font-bold text-[var(--teal)]">{passportId}</p>
          </div>
          <Link href="/dashboard/patient/history" className="no-underline">
            <ChevronRight size={18} className="text-[var(--text-muted)]" />
          </Link>
        </div>
      </div>
    </PatientShell>
  );
}

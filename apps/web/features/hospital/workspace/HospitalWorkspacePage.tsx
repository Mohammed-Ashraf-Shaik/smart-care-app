'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSession, useQueue, useAppStore } from '@/lib/store/app-store';
import { WorkspaceShell } from '@/components/layout/Shell';
import { CARE_TEAM } from '@/lib/store/app-store';
import { cn, timeAgo, getTriageColor } from '@/lib/utils';
import { Users, Clock, TrendingUp, DollarSign, UserCheck, QrCode, AlertTriangle } from 'lucide-react';

export function HospitalWorkspacePage() {
  const { role } = useAuthGuard(['doctor', 'staff']);
  const { email, hospital, city } = useSession();
  const { queue, metrics, sorted, nextPatient } = useQueue();
  const { transitionPatient } = useAppStore((s) => ({ transitionPatient: undefined }));

  if (!role) return null;

  return (
    <WorkspaceShell title="Hospital workspace" subtitle="Hospital portal" backHref="/" backLabel="Back to home">
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">Hospital portal</p>
          <h1 className="text-2xl font-extrabold">{hospital || 'SmartCare Community Hospital'}</h1>
          <p className="text-sm text-[var(--text-muted)]">{city || 'Hyderabad'}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'In queue', value: metrics.waiting, icon: Users, color: 'text-[var(--teal)]' },
            { label: 'Avg wait', value: `${metrics.averageWait} min`, icon: Clock, color: 'text-[var(--saffron)]' },
            { label: 'Priority', value: metrics.priority, icon: AlertTriangle, color: 'text-[var(--red)]' },
            { label: 'Revenue', value: `₹${metrics.revenue}`, icon: DollarSign, color: 'text-[var(--green)]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium">{stat.label}</p>
                <stat.icon size={15} className={stat.color} />
              </div>
              <p className="text-2xl font-extrabold text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Next patient */}
        {nextPatient && (
          <div className={cn('bg-[var(--mint)] border border-[var(--teal)]/25 rounded-[var(--radius-card)] p-5')}>
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" />
              Next patient
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold">{nextPatient.name}</h2>
                <p className="text-sm text-[var(--text-muted)]">{nextPatient.symptoms}</p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  {nextPatient.age && `${nextPatient.age} yrs · `}{nextPatient.gender || ''} · {timeAgo(nextPatient.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('status-pill', getTriageColor(nextPatient.triage))}>
                  {nextPatient.triage}
                </span>
                <span className={cn('status-pill', nextPatient.status === 'in_progress' ? 'bg-[var(--green-bg)] text-[var(--green)]' : nextPatient.status === 'called' ? 'bg-[var(--yellow-bg)] text-[var(--yellow)]' : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]')}>
                  {nextPatient.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Queue list */}
        <div>
          <h2 className="text-base font-bold mb-3">Active queue ({metrics.waiting})</h2>
          {sorted.length === 0 ? (
            <div className="text-center py-12 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
              <Users size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No patients in queue right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
                  <span className="w-7 h-7 bg-[var(--surface-sunken)] rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)] shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.symptoms}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('status-pill', getTriageColor(item.triage))}>{item.triage}</span>
                    <span className="text-xs text-[var(--text-muted)] hidden sm:block">{item.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care team */}
        <div>
          <h2 className="text-base font-bold mb-3">Care team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CARE_TEAM.map((member) => (
              <div key={member.id} className="flex items-start gap-3 p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
                <span className="w-9 h-9 bg-[var(--mint)] rounded-full flex items-center justify-center text-[var(--teal)] shrink-0">
                  <UserCheck size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{member.department} · {member.room}</p>
                  <p className="text-xs text-[var(--green)] mt-0.5">{member.availability}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

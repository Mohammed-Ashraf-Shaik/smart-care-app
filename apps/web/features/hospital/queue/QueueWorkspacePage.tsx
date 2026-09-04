'use client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useQueue, useAppStore } from '@/lib/store/app-store';
import { WorkspaceShell } from '@/components/layout/Shell';
import { cn, timeAgo, getTriageColor } from '@/lib/utils';
import { sortQueue, queueStatus } from '@/lib/store/app-store';
import { DemoDB } from '@/lib/db/demo-db';
import { Users, ArrowRight } from 'lucide-react';

export function QueueWorkspacePage() {
  const { role } = useAuthGuard(['doctor', 'staff']);
  const { queue, metrics } = useQueue();
  const showToast = useAppStore((s) => s.showToast);
  const setQueue = useAppStore((s) => s.setQueue);

  if (!role) return null;
  const sorted = sortQueue(queue);

  const advance = async (id: string, currentStatus: string) => {
    const next = ({ waiting: 'called', called: 'in_progress', in_progress: 'completed' } as Record<string, string>)[currentStatus];
    if (!next) return;
    await DemoDB.updatePatient(id, { status: next as any });
    const fresh = await DemoDB.fetchQueue();
    setQueue(fresh);
    showToast(`Patient ${next.replace('_', ' ')}`, 'success');
  };

  return (
    <WorkspaceShell title="Queue workspace" subtitle="Hospital portal">
      <div className="max-w-3xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Patient Queue</h1>
          <span className="text-sm text-[var(--text-muted)]">{metrics.waiting} active</span>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
            <Users size={36} className="mx-auto text-[var(--text-dim)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">Queue is empty right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((item, i) => {
              const status = queueStatus(item);
              const canAdvance = ['waiting', 'called', 'in_progress'].includes(status);
              const nextLabel = ({ waiting: 'Call patient', called: 'Start consultation', in_progress: 'Complete visit' } as Record<string, string>)[status];
              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-4 bg-[var(--surface)] border rounded-[var(--radius-card)] transition-all',
                    status === 'in_progress' ? 'border-[var(--green)]/40 bg-[var(--green-bg)]/30' : status === 'called' ? 'border-[var(--yellow)]/40 bg-[var(--yellow-bg)]/30' : 'border-[var(--line)]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--surface-sunken)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <span className={cn('status-pill text-[0.6rem]', getTriageColor(item.triage))}>{item.triage}</span>
                        <span className="text-xs text-[var(--text-muted)]">{item.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{item.symptoms} · {item.age} yrs · {timeAgo(item.created_at)}</p>
                      {item.doctorName && <p className="text-xs text-[var(--teal)] mt-0.5">{item.doctorName}</p>}
                      <p className="text-xs text-[var(--text-dim)] mt-0.5 font-mono">{item.id}</p>
                    </div>
                    {canAdvance && (
                      <button
                        onClick={() => advance(item.id, status)}
                        className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] transition-colors"
                      >
                        {nextLabel} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

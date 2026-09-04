'use client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useQueue, useAppStore } from '@/lib/store/app-store';
import { WorkspaceShell } from '@/components/layout/Shell';
import { cn, timeAgo, getTriageColor } from '@/lib/utils';
import { DemoDB } from '@/lib/db/demo-db';
import { Users, UserPlus, Settings2 } from 'lucide-react';
import { sortQueue, queueStatus } from '@/lib/store/app-store';

export function AdminWorkspacePage() {
  const { role } = useAuthGuard(['staff']);
  const { queue, metrics } = useQueue();
  const showToast = useAppStore((s) => s.showToast);
  const setQueue = useAppStore((s) => s.setQueue);
  if (!role) return null;
  const sorted = sortQueue(queue);

  const removePatient = async (id: string) => {
    await DemoDB.removePatient(id);
    const fresh = await DemoDB.fetchQueue();
    setQueue(fresh);
    showToast('Patient removed from queue', 'success');
  };

  return (
    <WorkspaceShell title="Operations" subtitle="Admin portal">
      <div className="max-w-4xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Operations</h1>
            <p className="text-sm text-[var(--text-muted)]">SmartCare Community Hospital</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{metrics.waiting} in queue</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Active queue', value: metrics.waiting },
            { label: 'Called/In Progress', value: metrics.called + metrics.inProgress },
            { label: 'Revenue', value: `₹${metrics.revenue}` },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-[var(--teal)]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Full queue management table */}
        <div>
          <h2 className="text-base font-bold mb-3">Full queue</h2>
          {sorted.length === 0 ? (
            <div className="text-center py-12 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
              <Users size={32} className="mx-auto text-[var(--text-dim)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Queue is empty.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)]">
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.symptoms} · {item.doctorName || 'Unassigned'}</p>
                    <p className="text-xs text-[var(--text-dim)] font-mono">{item.id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('status-pill text-[0.6rem]', getTriageColor(item.triage))}>{item.triage}</span>
                    <button
                      onClick={() => removePatient(item.id)}
                      className="text-xs text-[var(--red)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

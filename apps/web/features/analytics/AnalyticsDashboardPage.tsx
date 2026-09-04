'use client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useQueue, useSession } from '@/lib/store/app-store';
import { WorkspaceShell } from '@/components/layout/Shell';
import { cn, getTriageColor } from '@/lib/utils';
import { BarChart3, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export function AnalyticsDashboardPage() {
  const { role } = useAuthGuard(['doctor', 'staff']);
  const { queue, metrics } = useQueue();
  const { hospital, city } = useSession();
  if (!role) return null;

  const triageCounts = { Red: 0, Yellow: 0, Green: 0, Unassessed: 0 };
  queue.forEach((item) => { triageCounts[item.triage] = (triageCounts[item.triage] || 0) + 1; });
  const statusCounts = { waiting: 0, called: 0, in_progress: 0 };
  queue.forEach((item) => { const s = item.status as keyof typeof statusCounts; if (s in statusCounts) statusCounts[s]++; });

  return (
    <WorkspaceShell title="Analytics" subtitle={hospital}>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Analytics</h1>
            <p className="text-sm text-[var(--text-muted)]">{hospital || 'SmartCare Community Hospital'} · {city}</p>
          </div>
          <div className="text-xs text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] px-3 py-1.5">Live</div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total in queue', value: metrics.waiting, icon: Users, color: 'var(--teal)' },
            { label: 'Avg wait time', value: `${metrics.averageWait} min`, icon: Clock, color: 'var(--saffron)' },
            { label: 'Priority cases', value: metrics.priority, icon: AlertTriangle, color: 'var(--red)' },
            { label: 'Est. revenue', value: `₹${metrics.revenue}`, icon: TrendingUp, color: 'var(--green)' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-muted)] font-medium">{stat.label}</p>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Triage distribution */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-5">
          <h2 className="text-sm font-bold mb-4">Triage distribution</h2>
          <div className="flex flex-col gap-3">
            {(['Red', 'Yellow', 'Green', 'Unassessed'] as const).map((level) => {
              const count = triageCounts[level];
              const total = queue.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className={cn('status-pill shrink-0', getTriageColor(level))}>{level}</span>
                  <div className="flex-1 bg-[var(--surface-sunken)] rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: level === 'Red' ? 'var(--red)' : level === 'Yellow' ? 'var(--yellow)' : level === 'Green' ? 'var(--green)' : 'var(--text-dim)' }} />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)] w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-5">
          <h2 className="text-sm font-bold mb-4">Status breakdown</h2>
          <div className="grid grid-cols-3 gap-3">
            {[['Waiting', statusCounts.waiting, 'var(--text-muted)'], ['Called', statusCounts.called, 'var(--yellow)'], ['In progress', statusCounts.in_progress, 'var(--green)']].map(([label, count, color]) => (
              <div key={label as string} className="text-center p-4 bg-[var(--surface-sunken)] rounded-[var(--radius)]">
                <p className="text-2xl font-extrabold" style={{ color: color as string }}>{count as number}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{label as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

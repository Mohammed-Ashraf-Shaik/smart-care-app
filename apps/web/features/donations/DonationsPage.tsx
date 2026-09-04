'use client';
import { useState, useEffect } from 'react';
import { DemoDB } from '@/lib/db/demo-db';
import { WorkspaceShell, PatientShell } from '@/components/layout/Shell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { cn } from '@/lib/utils';
import type { DonationsData } from '@smartcare/types';
import { Heart, Droplets, Syringe, Plus } from 'lucide-react';

interface DonationsPageProps {
  role?: string;
}

const MODE_COLORS: Record<string, string> = {
  offer: 'bg-[var(--green-bg)] text-[var(--green)]',
  request: 'bg-[var(--red-bg)] text-[var(--red)]',
  give: 'bg-[var(--green-bg)] text-[var(--green)]',
  receive: 'bg-[var(--yellow-bg)] text-[var(--yellow)]',
};

export function DonationsPage({ role: roleProp }: DonationsPageProps) {
  const { role: authRole } = useAuthGuard();
  const [data, setData] = useState<DonationsData>({ hospitalPosts: [], patientPosts: [] });
  const [activeTab, setActiveTab] = useState<'hospital' | 'patient'>('hospital');

  useEffect(() => {
    setData(DemoDB.getDonationsData());
  }, []);

  const effectiveRole = roleProp || authRole;
  const Shell = (effectiveRole === 'patient' || !effectiveRole) ? PatientShell : WorkspaceShell;
  const shellProps = effectiveRole === 'patient' || !effectiveRole
    ? { subtitle: 'Donations', backHref: '/dashboard/patient' }
    : { title: 'Donations', subtitle: 'Hospital portal' };

  return (
    <Shell {...(shellProps as any)}>
      <div className="max-w-3xl mx-auto py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Heart size={22} className="text-[var(--red)]" />
          <h1 className="text-2xl font-extrabold">Donation board</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">Connect blood and organ donation needs in your community.</p>

        {/* Tabs */}
        <div className="flex gap-2 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-md)] p-1">
          <button onClick={() => setActiveTab('hospital')} className={cn('flex-1 h-9 rounded-[var(--radius)] text-sm font-semibold transition-colors', activeTab === 'hospital' ? 'bg-[var(--teal)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)]')}>
            Hospital posts ({data.hospitalPosts.length})
          </button>
          <button onClick={() => setActiveTab('patient')} className={cn('flex-1 h-9 rounded-[var(--radius)] text-sm font-semibold transition-colors', activeTab === 'patient' ? 'bg-[var(--teal)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)]')}>
            Community posts ({data.patientPosts.length})
          </button>
        </div>

        {/* Hospital posts */}
        {activeTab === 'hospital' && (
          <div className="flex flex-col gap-3">
            {data.hospitalPosts.map((post) => (
              <div key={post.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-[var(--mint)] rounded-[var(--radius)] flex items-center justify-center text-[var(--teal)] shrink-0">
                      {post.type === 'blood' ? <Droplets size={16} /> : <Syringe size={16} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn('status-pill', MODE_COLORS[post.mode])}>{post.mode}</span>
                        <span className="text-sm font-bold">{post.group}</span>
                        {post.units && <span className="text-xs text-[var(--text-muted)]">× {post.units}</span>}
                        {post.urgency && <span className={cn('text-xs font-bold', post.urgency === 'Urgent' ? 'text-[var(--red)]' : 'text-[var(--text-muted)]')}>{post.urgency}</span>}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{post.hospital} · {post.city}</p>
                      {post.notes && <p className="text-xs text-[var(--text-dim)] mt-0.5">{post.notes}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-dim)] shrink-0">{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient posts */}
        {activeTab === 'patient' && (
          <div className="flex flex-col gap-3">
            {data.patientPosts.map((post) => (
              <div key={post.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 bg-[var(--surface-sunken)] rounded-[var(--radius)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                      {post.type === 'blood' ? <Droplets size={16} /> : <Syringe size={16} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn('status-pill', MODE_COLORS[post.mode])}>{post.mode}</span>
                        <span className="text-sm font-bold">{post.group}</span>
                        <span className={cn('text-xs font-semibold', post.status === 'Available' ? 'text-[var(--green)]' : post.status === 'Urgent' ? 'text-[var(--red)]' : 'text-[var(--text-muted)]')}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{post.name} · {post.city}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-dim)] shrink-0">{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

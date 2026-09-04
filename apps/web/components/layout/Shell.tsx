'use client';

import { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/store/app-store';
import Link from 'next/link';

interface WorkspaceShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** Custom back link. Defaults to "/" */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function WorkspaceShell({ children, title, subtitle, backHref = '/', backLabel = 'Back to home', className }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLogged } = useSession();

  return (
    <div className="min-h-dvh bg-[var(--surface-sunken)] flex flex-col">
      <Topbar
        variant="workspace"
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backLabel={backLabel}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {isLogged && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main
        className={cn(
          'flex-1 w-full mx-auto',
          // Bottom padding accounts for mobile bottom nav
          isLogged && 'pb-20 lg:pb-8',
          className
        )}
        style={{
          paddingLeft: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))',
          paddingRight: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))',
        }}
      >
        {children}
      </main>
    </div>
  );
}

interface PatientShellProps {
  children: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PatientShell({ children, subtitle = 'Patient portal', backHref = '/', backLabel = 'Back to home', className }: PatientShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--surface-sunken)] flex flex-col">
      <Topbar variant="patient" subtitle={subtitle} backHref={backHref} backLabel={backLabel} />
      <main
        className={cn('flex-1 pb-20 lg:pb-8', className)}
        style={{
          paddingLeft: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))',
          paddingRight: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))',
        }}
      >
        {children}
      </main>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--line)] mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 bg-[var(--mint)] rounded-lg flex items-center justify-center text-[var(--teal)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </span>
              <span className="font-extrabold text-[var(--text)]">SmartCare</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Digital queue access for patients, hospitals, and care teams.</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3">Explore</p>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">About us</Link>
                <Link href="/dashboard/patient/apply/1" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">Patient portal</Link>
                <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">Hospital portal</Link>
                <Link href="/donate" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">Community donation</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3">Policies</p>
              <div className="flex flex-col gap-2">
                <Link href="/terms" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">Terms &amp; conditions</Link>
                <Link href="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors no-underline">Privacy notice</Link>
                <a href="mailto:support@smartcare.demo" className="text-sm text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors">Contact support</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t border-[var(--line)] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>© 2026 SmartCare Systems · Demo environment</span>
          <span>Last updated: 04 September 2026</span>
        </div>
      </div>
    </footer>
  );
}

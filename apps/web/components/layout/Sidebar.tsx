'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, HeartPulse, Home, CalendarPlus, ClipboardList, Heart, LayoutDashboard, Users, BarChart3, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, useAppStore } from '@/lib/store/app-store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_CONFIG = {
  patient: [
    { label: 'Overview', href: '/dashboard/patient', icon: Home },
    { label: 'Book appointment', href: '/dashboard/patient/apply/1', icon: CalendarPlus },
    { label: 'My visits', href: '/dashboard/patient/visits', icon: ClipboardList },
    { label: 'Donations', href: '/dashboard/patient/donations', icon: Heart },
    { label: 'Help', href: '/about', icon: HelpCircle },
  ],
  doctor: [
    { label: 'Hospital overview', href: '/dashboard/hospital', icon: LayoutDashboard },
    { label: 'Queue', href: '/dashboard/queue', icon: Users },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Donations', href: '/dashboard/hospital/donations', icon: Heart },
    { label: 'Help', href: '/about', icon: HelpCircle },
  ],
  staff: [
    { label: 'Operations', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Queue', href: '/dashboard/queue', icon: Users },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Donations', href: '/dashboard/admin/donations', icon: Heart },
    { label: 'Help', href: '/about', icon: HelpCircle },
  ],
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { role, email, hospital } = useSession();
  const { logout } = useAppStore((s) => ({ logout: s.logout }));
  const router = useRouter();
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const items = role ? SIDEBAR_CONFIG[role as keyof typeof SIDEBAR_CONFIG] || [] : [];

  // Focus trap on open
  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLogout = () => {
    onClose();
    logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (['/dashboard/patient', '/dashboard/hospital', '/dashboard/admin'].includes(href)) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!isOpen && !role) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className={cn(
            'fixed inset-0 z-[399] bg-black/55 backdrop-blur-sm',
            'transition-opacity duration-200',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        />
      )}

      {/* Drawer */}
      <aside
        aria-label="Navigation drawer"
        aria-hidden={!isOpen}
        className={cn(
          'fixed top-0 left-0 z-[400]',
          'w-[270px] h-[calc(100dvh-64px)]',
          'bg-[var(--surface)] border-r border-[var(--line)]',
          'flex flex-col transition-transform duration-250 ease-smooth',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--line)] shrink-0">
          <Link href="/" className="flex items-center gap-2 no-underline" onClick={onClose} ref={firstLinkRef}>
            <span className="w-8 h-8 bg-[var(--mint)] rounded-lg flex items-center justify-center text-[var(--teal)]">
              <HeartPulse size={16} />
            </span>
            <span>
              <span className="text-[0.9rem] font-extrabold text-[var(--text)] leading-none block">SmartCare</span>
              <span className="text-[0.6rem] text-[var(--text-muted)] leading-none block mt-0.5">
                {role === 'patient' ? 'Patient portal' : role === 'doctor' ? 'Hospital portal' : 'Admin portal'}
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium no-underline mb-0.5',
                  'transition-colors',
                  active
                    ? 'bg-[var(--mint)] text-[var(--teal)] font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer: user info + logout */}
        <div className="border-t border-[var(--line)] p-3 shrink-0">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-[var(--text)] truncate">{email}</p>
            {hospital && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{hospital}</p>}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium',
              'text-[var(--text-muted)] hover:bg-[var(--red-bg)] hover:text-[var(--red)] transition-colors'
            )}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

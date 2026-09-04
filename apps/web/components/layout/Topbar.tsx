'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, Menu, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/app-store';

const LANGUAGES = [
  { code: 'en', label: 'English (EN)' },
  { code: 'hi', label: 'हिन्दी (HI)' },
  { code: 'te', label: 'తెలుగు (TE)' },
  { code: 'ta', label: 'தமிழ் (TA)' },
  { code: 'bn', label: 'বাংলা (BN)' },
  { code: 'mr', label: 'मराठी (MR)' },
  { code: 'es', label: 'Español (ES)' },
];

interface TopbarProps {
  variant?: 'landing' | 'workspace' | 'patient';
  onMenuClick?: () => void;
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
}

export function Topbar({ variant = 'landing', onMenuClick, backHref, backLabel, title, subtitle }: TopbarProps) {
  const router = useRouter();
  const { theme, setTheme, showToast } = useAppStore((s) => ({ theme: s.theme, setTheme: s.setTheme, showToast: s.showToast }));
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
      if (match?.[1]) {
        const code = match[1].split('/')[2];
        if (code) setLang(code);
      }
    } catch {}
  }, []);

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setLang(code);
    document.cookie = `googtrans=/en/${code}; path=/;`;
    document.cookie = `googtrans=/en/${code}; domain=.${location.hostname}; path=/;`;
    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    } else {
      location.reload();
    }
  };

  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  const themeLabel = theme === 'dark' ? 'Dark' : 'Light';

  const Controls = (
    <div className="flex items-center gap-2">
      {/* Workspace menu trigger (mobile) */}
      {variant === 'workspace' && onMenuClick && (
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-[var(--radius)] lg:hidden',
            'bg-[var(--surface-raised)] border border-[var(--line)]',
            'hover:bg-[var(--surface-tint)] transition-colors'
          )}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Language selector */}
      <div className="relative flex items-center bg-[var(--surface-raised)] border border-[var(--line)] rounded-[var(--radius)] h-9 px-2 gap-1.5 hover:bg-[var(--surface-tint)] transition-colors">
        <Globe size={14} className="text-[var(--text-muted)] shrink-0 pointer-events-none" />
        <select
          value={lang}
          onChange={handleLangChange}
          aria-label="Select language"
          className={cn(
            'appearance-none bg-transparent text-[var(--text)] text-xs font-semibold',
            'border-none outline-none cursor-pointer max-w-[3.5rem] truncate',
            'pr-3'
          )}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <ChevronDown size={11} className="text-[var(--text-muted)] shrink-0 pointer-events-none absolute right-1.5" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={handleThemeToggle}
        title={`Theme: ${themeLabel} (click to toggle)`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        className={cn(
          'flex items-center gap-1.5 h-9 px-2.5 rounded-[var(--radius)] text-xs font-semibold',
          'bg-[var(--surface-raised)] border border-[var(--line)]',
          'hover:bg-[var(--surface-tint)] transition-colors'
        )}
      >
        <ThemeIcon size={14} />
        <span className="hidden sm:inline">{themeLabel}</span>
      </button>
    </div>
  );

  // ── Workspace topbar (authenticated views) ────────────────────────────────
  if (variant === 'workspace') {
    return (
      <header
        data-topbar
        className={cn(
          'flex items-center justify-between gap-3 h-14',
          'px-safe-left pr-safe-right',
          'bg-[var(--surface)] border-b border-[var(--line)]',
          'sticky top-0 z-[100]'
        )}
        style={{ paddingLeft: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))', paddingRight: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))' }}
      >
        {/* Brand + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <span className="w-8 h-8 bg-[var(--mint)] rounded-lg flex items-center justify-center text-[var(--teal)]">
              <HeartPulse size={17} />
            </span>
            <span className="hidden sm:flex flex-col">
              <span className="text-[0.9rem] font-800 text-[var(--text)] leading-none">SmartCare</span>
              {subtitle && <span className="text-[0.65rem] text-[var(--text-muted)] leading-none mt-0.5">{subtitle}</span>}
            </span>
          </Link>
          {title && <span className="text-[0.8rem] text-[var(--text-muted)] truncate hidden md:block">/ {title}</span>}
        </div>

        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref} className={cn('text-xs text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors hidden sm:flex items-center gap-1')}>
              {backLabel || 'Back to home'}
            </Link>
          )}
          {Controls}
        </div>
      </header>
    );
  }

  // ── Patient portal topbar ─────────────────────────────────────────────────
  if (variant === 'patient') {
    return (
      <header
        data-topbar
        className={cn(
          'flex items-center justify-between gap-3 h-14',
          'sticky top-0 z-[100]',
          'bg-[var(--surface)] border-b border-[var(--line)]'
        )}
        style={{ paddingLeft: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))', paddingRight: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))' }}
      >
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="w-8 h-8 bg-[var(--mint)] rounded-lg flex items-center justify-center text-[var(--teal)]">
            <HeartPulse size={17} />
          </span>
          <span className="flex flex-col">
            <span className="text-[0.9rem] font-bold text-[var(--text)] leading-none">SmartCare</span>
            {subtitle && <span className="text-[0.65rem] text-[var(--text-muted)] leading-none mt-0.5">{subtitle}</span>}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref} className="text-xs text-[var(--text-muted)] hover:text-[var(--teal)] transition-colors hidden sm:block">
              {backLabel || 'Back to home'}
            </Link>
          )}
          {Controls}
        </div>
      </header>
    );
  }

  // ── Landing topbar ────────────────────────────────────────────────────────
  return (
    <header
      data-topbar
      className={cn(
        'flex items-center justify-between h-16',
        'sticky top-0 z-[100]',
        'bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)]'
      )}
      style={{ paddingLeft: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-left, 0px)))', paddingRight: 'max(1.15rem, calc(0.85rem + env(safe-area-inset-right, 0px)))' }}
    >
      <Link href="/" aria-label="SmartCare home" className="flex items-center gap-2 no-underline">
        <span className="w-9 h-9 bg-[var(--mint)] rounded-xl flex items-center justify-center text-[var(--teal)]">
          <HeartPulse size={19} />
        </span>
        <span className="flex flex-col">
          <span className="text-[0.95rem] font-extrabold text-[var(--text)] leading-none">SmartCare</span>
          <span className="text-[0.6rem] text-[var(--text-muted)] leading-none mt-0.5">Care access, simplified</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
        <a href="#how-it-works" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">How it works</a>
        <a href="#for-providers" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">For hospitals</a>
        <Link href="/donate" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Donation</Link>
        <a href="#trust" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Why SmartCare</a>
      </nav>

      <div className="flex items-center gap-2">
        {Controls}
        <button
          onClick={() => router.push('/login')}
          className={cn(
            'h-9 px-3 rounded-[var(--radius)] text-sm font-bold',
            'border border-[var(--line)] hover:bg-[var(--surface-sunken)] transition-colors'
          )}
        >
          Sign in
        </button>
        <button
          onClick={() => router.push('/login?mode=signup')}
          className={cn(
            'h-9 px-3 rounded-[var(--radius)] text-sm font-bold',
            'bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] transition-colors'
          )}
        >
          Sign up
        </button>
      </div>
    </header>
  );
}

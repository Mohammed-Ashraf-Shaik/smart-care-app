import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function esc(value: unknown = ''): string {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] ?? c));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function generatePassportId(email: string): string {
  if (!email) return '';
  if (email.toLowerCase() === 'patient@smartcare.demo') return 'SC-PASSPORT-8924';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  return `SC-PASSPORT-${Math.abs(hash).toString().slice(0, 4).padStart(4, '0')}`;
}

export function getTriageColor(triage: string): string {
  const t = triage?.toLowerCase();
  if (t === 'red') return 'triage-red';
  if (t === 'yellow') return 'triage-yellow';
  if (t === 'green') return 'triage-green';
  return 'triage-unassessed';
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

export function estimatedWait(position: number): string {
  if (position <= 0) return 'Next up';
  const mins = position * 12; // ~12 min average per patient
  return `${mins}–${mins + 10} min`;
}

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page not found' };

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--surface-sunken)]">
      <div className="text-center max-w-sm px-5">
        <div className="w-16 h-16 bg-[var(--mint)] rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl font-extrabold text-[var(--teal)]">404</span>
        </div>
        <h1 className="text-xl font-extrabold mb-3">Page not found</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">The page you are looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center justify-center h-10 px-5 rounded-[var(--radius)] bg-[var(--teal)] text-white text-sm font-bold no-underline hover:bg-[var(--teal-dark)] transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}

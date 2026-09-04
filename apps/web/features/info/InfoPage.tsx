'use client';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Shell';
import Link from 'next/link';

interface InfoPageProps {
  page: 'about' | 'terms' | 'privacy';
}

const CONTENT = {
  about: {
    title: 'About SmartCare',
    body: `SmartCare is a digital health access platform connecting patients with hospitals and care teams. The system allows patients to find nearby care centres, see queue status, and reserve appointments — all before leaving home.

This is a demonstration environment. All data is stored locally in your browser and is not shared with any external service.

**Core features:**
- Location-based care centre discovery
- Real-time queue visibility
- 4-step patient booking flow
- Medical history passport (QR-based)
- Blood & organ donation board
- Role-specific portals (patient, doctor, operations)

SmartCare is designed to reduce time spent at reception, improve queue transparency, and give clinicians the information they need before each consultation.`,
  },
  terms: {
    title: 'Terms & Conditions',
    body: `**Demo Environment Notice**

SmartCare operates as a demonstration platform. By using this application, you acknowledge:

1. **No real medical services**: This system does not provide actual medical care, diagnoses, or clinical advice.
2. **Data storage**: All information you enter is stored locally in your browser using localStorage. No data is transmitted to external servers in demo mode.
3. **Account data**: Demo accounts and any data you create are for evaluation purposes only and may be cleared at any time.
4. **Queue simulation**: The patient queue shown is for demonstration purposes and does not represent actual hospital operations.
5. **Location data**: Location access is requested only for the care centre discovery feature and is not stored persistently.

If you are experiencing a medical emergency, please call your local emergency services immediately.`,
  },
  privacy: {
    title: 'Privacy Notice',
    body: `**Data handling in demo mode**

SmartCare Demo does not transmit personal data to any server. All information is stored in your browser's localStorage.

**What we store locally:**
- Account credentials (demo login only)
- Patient booking information and visit history  
- Medical history you choose to enter
- Your theme and language preferences

**What we do NOT collect:**
- We do not send any data to external analytics services
- We do not use third-party tracking
- Location coordinates are used only to find nearby care centres and are not persisted

**Clearing your data:**
You can clear all SmartCare data by clearing your browser's localStorage (Settings → Privacy → Clear browsing data → Cached images and files / Site data).

For questions about this notice, contact: support@smartcare.demo`,
  },
};

export function InfoPage({ page }: InfoPageProps) {
  const content = CONTENT[page];

  return (
    <div className="min-h-dvh bg-[var(--surface-sunken)] flex flex-col">
      <Topbar variant="landing" />
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-12">
        <div className="mb-6">
          <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--teal)] no-underline">← Back to home</Link>
        </div>
        <h1 className="text-2xl font-extrabold mb-6">{content.title}</h1>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-card)] p-6 prose-sm">
          {content.body.split('\n\n').map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <h2 key={i} className="text-base font-bold mt-4 mb-2">{para.replace(/\*\*/g, '')}</h2>;
            }
            if (para.startsWith('- ') || para.includes('\n- ')) {
              return (
                <ul key={i} className="list-disc list-inside space-y-1 mb-4">
                  {para.split('\n').filter(Boolean).map((line, j) => (
                    <li key={j} className="text-sm text-[var(--text-muted)]">{line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\./.test(para)) {
              return (
                <ol key={i} className="list-decimal list-inside space-y-2 mb-4">
                  {para.split('\n').filter(Boolean).map((line, j) => (
                    <li key={j} className="text-sm text-[var(--text-muted)]">{line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>
                  ))}
                </ol>
              );
            }
            return (
              <p key={i} className="text-sm text-[var(--text-muted)] mb-3" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

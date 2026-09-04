'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Users,
  ShieldCheck,
  Clock3,
  Accessibility,
  LocateFixed,
  ListChecks,
  Activity,
  MapPin,
  LockKeyhole,
  HeartPulse,
  Sparkles,
  Heart,
  ChevronRight,
  CheckCircle2,
  Stethoscope,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Shell';
import { cn } from '@/lib/utils';

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[var(--surface)] flex flex-col selection:bg-[var(--mint)] selection:text-[var(--teal)]">
      <Topbar variant="landing" />

      <main id="top" className="flex-1 overflow-x-hidden">
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section
          id="hero"
          aria-labelledby="hero-title"
          className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden"
        >
          {/* Ambient luminous glow backdrops */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 dark:bg-blue-400/5 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              
              {/* Left Column: Headline & Call-to-actions */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                {/* Pill Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--mint)] border border-[var(--teal)]/25 mb-6 text-xs font-semibold text-[var(--teal)] shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--teal)]" />
                  </span>
                  <span>Digital Care Access Network · Live in 18+ Facilities</span>
                </div>

                <h1
                  id="hero-title"
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)] leading-[1.12] mb-6"
                >
                  Care that starts{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--teal)] via-teal-600 to-emerald-600">
                    before
                  </span>{' '}
                  you arrive.
                </h1>

                <p className="text-base sm:text-lg text-[var(--text-muted)] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Find the right care nearby, view live hospital triage queues before you leave home, and reserve your place in a few calm, clear steps.
                </p>

                {/* Primary CTA buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8">
                  <button
                    id="hero-login"
                    onClick={() => router.push('/login?mode=signin&role=patient')}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--radius-md)]',
                      'bg-gradient-to-r from-[var(--teal)] to-[var(--teal-dark)] text-white font-bold text-sm shadow-lg shadow-[var(--teal)]/20',
                      'hover:shadow-xl hover:shadow-[var(--teal)]/30 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0'
                    )}
                  >
                    Open Patient Portal <ArrowRight size={17} />
                  </button>

                  <button
                    id="hero-demo"
                    onClick={() => router.push('/login?mode=signin')}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-md)]',
                      'border border-[var(--line)] bg-[var(--surface-raised)] font-bold text-sm text-[var(--text)]',
                      'hover:bg-[var(--surface-sunken)] hover:border-[var(--line-strong)] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 shadow-sm'
                    )}
                  >
                    Explore Demo Roles <Users size={16} />
                  </button>
                </div>

                {/* Feature highlights bar */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-muted)] pt-2 border-t border-[var(--line)]/60">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-500 shrink-0" /> Role-isolated portals
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} className="text-[var(--teal)] shrink-0" /> Live queue tracking
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Accessibility size={15} className="text-amber-500 shrink-0" /> Mobile-first &amp; accessible
                  </span>
                </div>
              </div>

              {/* Right Column: Premium Live Queue & Hospital Preview Card */}
              <div className="w-full max-w-sm sm:max-w-md shrink-0">
                <div className="relative group">
                  {/* Glowing card border ambient shadow */}
                  <div className="absolute -inset-1 rounded-[1.4rem] bg-gradient-to-r from-[var(--teal)]/30 via-emerald-500/20 to-blue-600/30 blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />

                  <div className="relative bg-[var(--surface-raised)]/95 backdrop-blur-md border border-[var(--line)] rounded-[1.25rem] overflow-hidden shadow-2xl">
                    {/* Card Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[var(--line)] bg-[var(--surface)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center font-bold">
                          <HeartPulse size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)] leading-none">SmartCare Community Hospital</p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                            <MapPin size={11} className="text-[var(--teal)]" /> Hyderabad · 2.3 km away
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    </div>

                    {/* Interactive Radar Map Simulation */}
                    <div className="h-36 bg-gradient-to-br from-slate-900 to-[#0a192f] relative overflow-hidden flex items-center justify-center p-4">
                      {/* Concentric radar rings */}
                      <div className="absolute w-56 h-56 rounded-full border border-teal-500/20 animate-ping opacity-30" />
                      <div className="absolute w-40 h-40 rounded-full border border-teal-500/30" />
                      <div className="absolute w-24 h-24 rounded-full border border-teal-500/40" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />

                      {/* Map Pins */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-[var(--teal)] border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-900 shadow-md">
                          You (Current)
                        </span>
                      </div>

                      {/* Hospital Pins */}
                      <div className="absolute top-6 left-12 flex items-center gap-1 text-[10px] text-teal-300 font-semibold bg-slate-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Main OPD (4 min)
                      </div>
                      <div className="absolute bottom-5 right-8 flex items-center gap-1 text-[10px] text-amber-300 font-semibold bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Triage Bed Ready
                      </div>
                    </div>

                    {/* Queue Status Strip */}
                    <div className="p-4 bg-[var(--surface-raised)] border-t border-[var(--line)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[var(--text-muted)] font-medium">Estimated wait window</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">15–25 minutes</span>
                      </div>

                      <div className="w-full bg-[var(--line)] h-2 rounded-full overflow-hidden mb-3">
                        <div className="bg-gradient-to-r from-emerald-500 to-[var(--teal)] h-full w-2/5 rounded-full" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                        <span>Patients in queue: <strong className="text-[var(--text)]">4</strong></span>
                        <Link
                          href="/dashboard/patient/apply/1"
                          className="font-bold text-[var(--teal)] flex items-center gap-0.5 hover:underline"
                        >
                          Book appointment <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Key Metrics Strip ───────────────────────────────────────────── */}
        <section
          aria-label="SmartCare facts and statistics"
          className="bg-[var(--surface-raised)] border-y border-[var(--line)] py-6"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <strong className="text-2xl sm:text-3xl font-black text-[var(--teal)] block">3,800+</strong>
                <span className="text-xs text-[var(--text-muted)] font-medium">Patients Managed</span>
              </div>
              <div>
                <strong className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">15 min</strong>
                <span className="text-xs text-[var(--text-muted)] font-medium">Average Wait Reduced</span>
              </div>
              <div>
                <strong className="text-2xl sm:text-3xl font-black text-[var(--teal)] block">18+</strong>
                <span className="text-xs text-[var(--text-muted)] font-medium">Care Centres Connected</span>
              </div>
              <div>
                <strong className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 block">100%</strong>
                <span className="text-xs text-[var(--text-muted)] font-medium">Browser-Local Demo DB</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Role Workspaces Explorer ────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--mint)] text-[var(--teal)] text-xs font-semibold mb-3">
              <Sparkles size={13} /> Tailored for Healthcare Teams
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
              Three dedicated portals. One continuous flow.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-3">
              Switch between roles anytime with preloaded demo accounts to test clinical triaging, patient booking, and bed management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Card */}
            <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-[var(--teal)]/40 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CalendarCheck size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal)]">For Patients</span>
                <h3 className="text-lg font-bold text-[var(--text)] mt-1 mb-2">Patient Portal &amp; Passport</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  Step-by-step 4-stage appointment booking, symptom picker, digital QR medical history, and blood donation matching.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-[var(--text-muted)]">
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> GPS distance calculation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Digital Passport ID &amp; allergies</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Real-time ticket reference</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login?role=patient')}
                className="w-full py-2.5 px-4 rounded-[var(--radius)] bg-[var(--teal)] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[var(--teal-dark)] transition-colors"
              >
                Launch Patient Demo <ArrowRight size={14} />
              </button>
            </div>

            {/* Doctor / Hospital Card */}
            <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">For Clinicians</span>
                <h3 className="text-lg font-bold text-[var(--text)] mt-1 mb-2">Clinical Care &amp; Queue</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  Live color-coded triage queue (Red/Yellow/Green), quick patient calling, prescription generation, and instant consult wrap-up.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-[var(--text-muted)]">
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Color-coded priority queues</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> One-click patient status change</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Analytics wait-time meters</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login?role=doctor')}
                className="w-full py-2.5 px-4 rounded-[var(--radius)] bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                Launch Doctor Demo <ArrowRight size={14} />
              </button>
            </div>

            {/* Hospital Ops / Staff Card */}
            <div className="bg-[var(--surface-raised)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">For Operations</span>
                <h3 className="text-lg font-bold text-[var(--text)] mt-1 mb-2">Hospital Ops &amp; Triage</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  Front-desk walk-in intake, doctor assignment, department capacity oversight, and organ/blood donation coordination.
                </p>
                <ul className="space-y-2 mb-6 text-xs text-[var(--text-muted)]">
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Walk-in intake &amp; desk handoff</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Real-time capacity monitoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500" /> Blood &amp; organ donation boards</li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/login?role=staff')}
                className="w-full py-2.5 px-4 rounded-[var(--radius)] bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
              >
                Launch Ops Demo <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Visual Journey: How It Works ────────────────────────────────── */}
        <section id="how-it-works" className="bg-[var(--surface-raised)] border-y border-[var(--line)] py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--teal)]">A Calm, Clear Journey</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] mt-1">
                Less time waiting. More time getting care.
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                SmartCare connects patient location, pre-triage intake, and live status into three clear steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: LocateFixed,
                  title: 'Locate & Discover',
                  desc: 'Find nearby hospitals with live distance calculation and verified estimated waiting windows.',
                  href: '/dashboard/patient/apply/1',
                  cta: 'Find Care'
                },
                {
                  step: '02',
                  icon: ListChecks,
                  title: 'Pre-Triage Intake',
                  desc: 'Pick your symptoms and preferred time slot so clinicians receive context before you walk in.',
                  href: '/dashboard/patient/apply/2',
                  cta: 'Start Details'
                },
                {
                  step: '03',
                  icon: Activity,
                  title: 'Follow In Real-Time',
                  desc: 'Keep your booking reference and ticket active. Clinicians call your number directly.',
                  href: '/login?role=patient',
                  cta: 'View Status'
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 relative hover:shadow-lg transition-shadow"
                >
                  <span className="text-4xl font-black text-[var(--teal)]/15 absolute top-5 right-6">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center mb-4">
                    <item.icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-2">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{item.desc}</p>
                  <Link
                    href={item.href}
                    className="text-xs font-bold text-[var(--teal)] flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    {item.cta} <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community Blood & Organ Donation Spotlight ───────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="bg-gradient-to-br from-rose-500/10 via-[var(--mint)] to-teal-500/10 border border-rose-500/25 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/25">
                <Heart size={24} className="fill-current animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Urgent Community Need
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text)]">Blood &amp; Organ Donation Network</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mt-1">
                  Connect directly with regional blood banks and community emergency requests. Every donor profile is verified.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/donate')}
              className="px-5 py-2.5 rounded-[var(--radius)] bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-1.5"
            >
              Open Donation Board <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* ── Trust, Privacy & Standards ──────────────────────────────────── */}
        <section id="trust" className="bg-[var(--surface-raised)] border-t border-[var(--line)] py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)]">Local Privacy First</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Demo medical records and credentials reside safely in your browser storage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)]">Accurate Proximity</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    OpenStreetMap Nominatim and Haversine spatial math route patients to nearby centres.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--mint)] text-[var(--teal)] flex items-center justify-center shrink-0">
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)]">Role Separation</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Strict RBAC boundaries protect patient data from unauthorized clinical views.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

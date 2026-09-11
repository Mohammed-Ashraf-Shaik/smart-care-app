# SmartCare — Tech Stack Shift & Implementation Blueprint

> **Target Environment:** Next.js 14 (App Router) + TypeScript + Tailwind CSS / CSS Modules  
> **Source Repository:** `Code/smartcare` (Vanilla JS ES Modules + CSS)  
> **Destination Repository:** `Code/smartcare ts` (`feature/tech-stack-shift`)  
> **Date:** September 2026

---

## 1. Architectural Overview & Migration Strategy

This document provides a component-by-component and file-by-file specification of all features, services, schemas, and UI/UX behaviors developed in `smartcare`. Use this guide to implement the corresponding TypeScript interfaces, React Server/Client Components, Zustand/Context stores, and API routes in `smartcare ts`.

### Architectural Equivalence Matrix

| Layer | Source (`smartcare`) | Target (`smartcare ts`) |
| :--- | :--- | :--- |
| **Routing** | Client SPA Router (`js/core/app.js` + History API) | Next.js 14 App Router (`app/(routes)`) |
| **State Store** | Reactive Pub/Sub Store (`js/core/state.js`) | Zustand / React Context (`store/useStore.ts`) |
| **Data Layer** | Demo LocalStorage + Supabase (`js/services/db.js`) | Prisma / Supabase Server Client + Local Mock |
| **Icons** | Lucide Script (`icon(name, size)`) | `lucide-react` (`<Icon className="w-4 h-4" />`) |
| **Styling** | Vanilla CSS (`css/styles.css`) | Tailwind CSS + CSS Variables (`globals.css`) |
| **Interactive Modals** | Imperative Backdrop Mounts (`js/core/ui.js`) | Radix UI / Headless UI Dialog components |

---

## 2. Core File Paths & Component Mapping

| Feature / Module | Source File Path in `smartcare` | Suggested Target Path in `smartcare ts` |
| :--- | :--- | :--- |
| **Global Types & Interfaces** | `js/core/state.js` (lines 9–147) | `types/index.ts` |
| **Global State & Session** | `js/core/state.js` | `lib/store/useAppStore.ts` |
| **Database & Auth Adapter** | `js/services/db.js` | `lib/services/db.ts` |
| **UI Utilities & Modals** | `js/core/ui.js` | `components/ui/` & `components/modals/` |
| **Landing & Care Switcher** | `js/views/public/landing.js` | `app/(public)/page.tsx` |
| **Auth & Quick Demo Sign-In**| `js/views/public/login.js` | `app/(auth)/login/page.tsx` |
| **Patient Overview & Queue** | `js/views/patient/patient-dashboard.js` | `app/(dashboard)/patient/page.tsx` |
| **Appointment Booking Flow** | `js/views/patient/patient.js` | `app/(dashboard)/patient/apply/page.tsx` |
| **Medical History (4 Pillars)**| `js/views/patient/history.js` | `app/(dashboard)/patient/history/page.tsx` |
| **Patient Donations & Cards**| `js/views/patient/patient-donations.js` | `app/(dashboard)/patient/donations/page.tsx` |
| **Doctor Console & Vitals** | `js/views/doctor/doctor.js` | `app/(dashboard)/doctor/page.tsx` |
| **Triage Queue & Quick Rx** | `js/views/doctor/queue.js` | `app/(dashboard)/queue/page.tsx` |
| **Hospital Donations** | `js/views/doctor/doctor-donations.js` | `app/(dashboard)/hospital/donations/page.tsx` |
| **Hospital Operations & Rooms**| `js/views/admin/staff.js` | `app/(dashboard)/admin/page.tsx` |
| **Hospital Analytics** | `js/views/admin/analytics.js` | `app/(dashboard)/analytics/page.tsx` |
| **Ambulance Live Dispatch** | `js/views/public/ambulance.js` | `app/(services)/ambulance/page.tsx` |
| **Pharmacy & Order Tracker** | `js/views/public/pharmacy.js` | `app/(services)/pharmacy/page.tsx` |
| **Verify Prescription Portal** | `js/views/public/verify-rx.js` | `app/(services)/verify-rx/page.tsx` |
| **Global Styles & Dark Theme**| `css/styles.css` | `app/globals.css` |

---

## 3. TypeScript Domain Models (`types/index.ts`)

```typescript
export type Role = 'patient' | 'doctor' | 'staff';
export type TriageLevel = 'Red' | 'Yellow' | 'Green';
export type QueueStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled';
export type AmbulanceStatus = 'available' | 'dispatching' | 'dispatched' | 'arrived' | 'cancelled';
export type PharmacyStatus = 'placed' | 'received' | 'verified' | 'packed' | 'ready' | 'delivered';

export interface Vitals {
  bp: string;      // e.g. "120/80"
  pulse: string;   // e.g. "76"
  spo2: string;    // e.g. "99"
  temp: string;    // e.g. "98.4"
}

export interface PrescriptionMedicine {
  name: string;
  strength?: string;
  dosage: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  rxId: string;
  visitId: string;
  patientName: string;
  doctorName: string;
  doctorRegNo?: string;
  hospital: string;
  assessment: string;
  vitals?: Vitals;
  medicines: PrescriptionMedicine[];
  labSummary?: string;
  issuedAt: string;
  status: 'active' | 'dispensed';
  tamperHash?: string;
  dispensedBy?: string;
  dispensedAt?: string;
  dispensedPharmacist?: string;
}

export interface MedicalHistory {
  lastUpdated: string;
  previousProvider: {
    doctorName: string;
    hospitalName: string;
    city: string;
    contactPhone: string;
  };
  effectiveMedications: Array<{
    id: string;
    medicineName: string;
    dosage: string;
    conditionTreated: string;
    notes?: string;
  }>;
  allergiesAndAvoid: Array<{
    id: string;
    substance: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    reactionDescription: string;
  }>;
  careConditions: Array<{
    id: string;
    category: string;
    instruction: string;
  }>;
  emergencyProtocols: Array<{
    id: string;
    triggerCondition: string;
    actionSteps: string;
  }>;
}

export interface QueuePatient {
  id: string;
  name: string;
  patientEmail?: string;
  age: number;
  gender: string;
  doctorPref: string;
  doctorId?: string;
  doctorName?: string;
  department?: string;
  consultationType?: string;
  appointmentDate?: string;
  appointmentSlot?: string;
  area: string;
  symptoms: string;
  problem: string;
  hospital: string;
  queueHospital?: string;
  country: string;
  state: string;
  city: string;
  triage: TriageLevel;
  fee: number;
  status: QueueStatus;
  cancelledBy?: 'patient' | 'doctor';
  cancellationReason?: string;
  cancelledAt?: string;
  refundStatus?: 'none' | 'eligible' | 'processed';
  refundRef?: string;
  created_at: string;
}
```

---

## 4. Key Features & Implementation Logic

### 1. Demo Patient & Demo Hospital Linkage
- **Source Paths:**  
  - `js/services/db.js` (lines 10–55)  
  - `js/core/state.js` (lines 135–185, 455–465)  
- **Implementation Detail:**
  - Demo patient `patient@smartcare.demo` (Asha Rao) is linked directly with **SmartCare Community Hospital** and **Dr. Meera Shah** (`SC-DEMO-ASHA`).
  - When logged in as `patient`, an upcoming appointment card displays with real-time queue position and estimated window.
  - When logged in as `hospital@smartcare.demo` (Doctor), Asha Rao appears in the waiting room triage table. Action state transitions (`called`, `in_progress`, `completed`) automatically update across both portals.

### 2. Clinical Vitals & Medical Passport in Doctor Login
- **Source Paths:**  
  - `js/views/doctor/doctor.js` (lines 210–240, 410–480)  
  - `js/views/doctor/queue.js` (lines 150–190)  
- **Implementation Detail:**
  - **1-Click Medical Passport:** Clinicians click `Medical Passport` on the consultation hero or table rows to open the patient's verified allergies (e.g. Penicillin warning), effective medications, and crisis instructions.
  - **On-Duty Vitals Capture:** Modal dialog allowing doctors to record BP (`mmHg`), Pulse (`bpm`), SpO2 (`%`), and Temp (`°F`), immediately appended to the active `Prescription`.
  - **Dynamic Triage Adjuster:** Dropdown in doctor hero allowing instant re-classification (`Red` / `Yellow` / `Green`) which re-sorts queue rank.
  - **Trauma Bay Alert Response:** Incoming trauma banner has a `Prep Trauma Bay 01` action that notifies the team and holds ICU bed capacity.

### 3. Appointment Lifecycle & 1-Click Refund Recovery
- **Source Paths:**  
  - `js/views/patient/patient-dashboard.js` (lines 50–70, 320–360)  
  - `js/core/state.js` (lines 720–765)  
- **Implementation Detail:**
  - When appointments are cancelled by hospital duty, a doctor-cancellation banner renders on the patient dashboard.
  - Patients can click `Claim ₹125 refund` which executes `claimRefund(visitId)`, generating an audit token (`REF-XXXX`), persisting the refund status, and updating badges.
  - Alternatively, patients click `Reschedule free of charge` to re-select a slot without re-charging.

### 4. Interactive Live Care Network Panel
- **Source Path:** `js/views/public/landing.js` (lines 80–140)  
- **Implementation Detail:**
  - Replaces static images with an interactive hospital toggle (*SmartCare Community Hospital* vs *CityCare Trauma Centre*).
  - Tapping displays real-time wait times, distance, ICU availability, and pre-selects the hospital in the appointment booking flow.

### 5. Real-Time Ambulance Fleet & Dispatch
- **Source Paths:**  
  - `js/views/public/ambulance.js`  
  - `js/core/state.js` (lines 200–280)  
- **Implementation Detail:**
  - Dispatches an emergency ambulance with driver details, plate number, live animated route progress bar, and distance decrements (`3.2 km` -> `0.1 km` -> `Arrived`).
  - Emergency SOS quick buttons in the flow header topbar for rapid 1-tap activation.

### 6. Pharmacy Tracker & Quantity Steppers
- **Source Paths:**  
  - `js/views/public/pharmacy.js`  
  - `js/core/state.js` (lines 295–350)  
- **Implementation Detail:**
  - Live 4-stage tracking stepper (`Received` -> `Verified` -> `Packed` -> `Ready`).
  - Searchable medicine catalog with Rx / OTC category filters.
  - Interactive `+` / `-` quantity steppers in catalog and checkout drawers.

### 7. Prescription Registry & Tamper Verification
- **Source Paths:**  
  - `js/views/public/verify-rx.js`  
  - `css/styles.css` (lines 5858–6085)  
- **Implementation Detail:**
  - Pharmacist lookup tool for prescription reference IDs or camera QR scans.
  - Dispense lock action (`dispensePrescription`) that permanently locks the token to prevent duplicate fulfillment under Schedule H regulations.

### 8. Digital Donor Honor Roll Card
- **Source Path:** `js/views/patient/patient-donations.js` (lines 550–620)  
- **Implementation Detail:**
  - Pledging blood or organs generates a digital certificate modal complete with reference token, issuing hospital notice, and 1-click print support.

---

## 5. Mobile & Touch Polish Specifications

Ensure the Next.js / Tailwind implementation respects these exact mobile standards from `css/styles.css`:

1. **Touch Target Dimensions:**  
   All buttons, input fields, selects, and icon triggers have a minimum height of `44px` on tablet viewports (`<= 768px`) and `48px` on mobile viewports (`<= 600px`).
2. **Fixed Bottom Navigation Clearance:**  
   Every flow shell and workspace main container must include safe-area padding:
   ```css
   padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
   ```
   This guarantees that submit buttons, floating docks, and action bars are never hidden behind `.mobile-bottom-nav`.
3. **Modal Dialog Sizing on Mobile:**  
   - Modals use `max-width: min(94vw, 560px)` and `max-height: 88vh`.
   - Modals have internal vertical scrolling (`overflow-y: auto`) and responsive button stacking (`flex-direction: column-reverse`).
4. **Zero Emojis:**  
   Strictly use SVG Lucide icons via `<Icon className="..." />` instead of unicode emojis.
5. **Dark Mode Tokens:**  
   Use CSS variables (`var(--surface)`, `var(--canvas)`, `var(--ink)`, `var(--line)`) rather than hardcoded white (`#fff`) to avoid blinding flashes in dark mode.

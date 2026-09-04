import type { Metadata } from 'next';
import { PatientVisitsPage } from '@/features/patient/dashboard/PatientVisitsPage';
export const metadata: Metadata = { title: 'My Visits', description: 'Your previous visits and appointments.' };
export default function VisitsPage() { return <PatientVisitsPage />; }

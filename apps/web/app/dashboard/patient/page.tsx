import type { Metadata } from 'next';
import { PatientDashboardPage } from '@/features/patient/dashboard/PatientDashboardPage';

export const metadata: Metadata = {
  title: 'Patient Dashboard',
  description: 'Manage your appointments, visits, and medical history.',
};

export default function PatientDashboard() {
  return <PatientDashboardPage />;
}

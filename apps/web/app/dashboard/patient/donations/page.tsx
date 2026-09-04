import type { Metadata } from 'next';
import { DonationsPage } from '@/features/donations/DonationsPage';
export const metadata: Metadata = { title: 'Patient Donations' };
export default function PatientDonationsPage() { return <DonationsPage role="patient" />; }

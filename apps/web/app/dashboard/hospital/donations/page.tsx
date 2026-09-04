import type { Metadata } from 'next';
import { DonationsPage } from '@/features/donations/DonationsPage';
export const metadata: Metadata = { title: 'Hospital Donations' };
export default function HospitalDonationsPage() { return <DonationsPage role="doctor" />; }

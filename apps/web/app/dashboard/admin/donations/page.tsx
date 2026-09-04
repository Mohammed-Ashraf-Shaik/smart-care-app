import type { Metadata } from 'next';
import { DonationsPage } from '@/features/donations/DonationsPage';
export const metadata: Metadata = { title: 'Admin Donations' };
export default function AdminDonationsPage() { return <DonationsPage role="staff" />; }

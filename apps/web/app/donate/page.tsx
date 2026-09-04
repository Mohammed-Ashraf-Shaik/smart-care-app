import type { Metadata } from 'next';
import { DonationsPage } from '@/features/donations/DonationsPage';
export const metadata: Metadata = { title: 'Donations', description: 'Blood and organ donation community.' };
export default function DonatePage() { return <DonationsPage />; }

import type { Metadata } from 'next';
import { InfoPage } from '@/features/info/InfoPage';
export const metadata: Metadata = { title: 'Terms & Conditions' };
export default function Terms() { return <InfoPage page="terms" />; }

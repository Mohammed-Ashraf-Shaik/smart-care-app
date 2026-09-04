import type { Metadata } from 'next';
import { InfoPage } from '@/features/info/InfoPage';
export const metadata: Metadata = { title: 'Privacy Notice' };
export default function Privacy() { return <InfoPage page="privacy" />; }

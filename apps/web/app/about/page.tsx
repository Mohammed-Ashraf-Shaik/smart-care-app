import type { Metadata } from 'next';
import { InfoPage } from '@/features/info/InfoPage';
export const metadata: Metadata = { title: 'About SmartCare', description: 'About SmartCare and how it works.' };
export default function About() { return <InfoPage page="about" />; }

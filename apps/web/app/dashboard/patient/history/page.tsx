import type { Metadata } from 'next';
import { MedicalHistoryPage } from '@/features/patient/history/MedicalHistoryPage';
export const metadata: Metadata = { title: 'Medical History', description: 'Your personal medical history and passport.' };
export default function HistoryPage() { return <MedicalHistoryPage />; }

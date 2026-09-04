import type { Metadata } from 'next';
import { AnalyticsDashboardPage } from '@/features/analytics/AnalyticsDashboardPage';
export const metadata: Metadata = { title: 'Analytics', description: 'Queue analytics and operational insights.' };
export default function Analytics() { return <AnalyticsDashboardPage />; }

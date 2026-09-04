import type { Metadata } from 'next';
import { QueueWorkspacePage } from '@/features/hospital/queue/QueueWorkspacePage';
export const metadata: Metadata = { title: 'Queue Workspace', description: 'Live patient queue management.' };
export default function QueuePage() { return <QueueWorkspacePage />; }

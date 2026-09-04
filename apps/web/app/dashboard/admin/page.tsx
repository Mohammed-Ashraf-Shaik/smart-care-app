import type { Metadata } from 'next';
import { AdminWorkspacePage } from '@/features/admin/workspace/AdminWorkspacePage';
export const metadata: Metadata = { title: 'Admin Operations', description: 'Hospital operations, rooms, and walk-in management.' };
export default function AdminPage() { return <AdminWorkspacePage />; }

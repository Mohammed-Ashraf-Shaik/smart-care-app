'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/store/app-store';
import type { UserRole } from '@smartcare/types';

/**
 * Guards a page to require authentication.
 * Redirects to /login if not logged in, or if role doesn't match allowedRoles.
 */
export function useAuthGuard(allowedRoles?: UserRole[]) {
  const { isLogged, role } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLogged) {
      const roleParam = allowedRoles?.[0] ? `?role=${allowedRoles[0]}` : '';
      router.replace(`/login${roleParam}`);
      return;
    }
    if (allowedRoles && role && !allowedRoles.includes(role as UserRole)) {
      // Redirect to their own dashboard
      const dest = role === 'patient' ? '/dashboard/patient' : role === 'doctor' ? '/dashboard/hospital' : '/dashboard/admin';
      router.replace(dest);
    }
  }, [isLogged, role, allowedRoles, router]);

  return { isLogged, role };
}

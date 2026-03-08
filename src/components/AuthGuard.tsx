'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { isRouteAllowed, getDefaultRoute } from '@/lib/roles';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authLoading, role, roleLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace('/');
      return;
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    if (authLoading || roleLoading || !isLoggedIn) return;
    if (!pathname || pathname === '/') return;
    if (!isRouteAllowed(role, pathname)) {
      router.replace(getDefaultRoute(role));
    }
  }, [authLoading, roleLoading, isLoggedIn, role, pathname, router]);

  if (authLoading || !isLoggedIn) {
    return null;
  }

  if (roleLoading) {
    return (
      <div className="h-screen-safe flex items-center justify-center bg-[#f2f0eb]">
        <div className="w-12 h-12 rounded-full border-4 border-[#e4e0d8] border-t-[#FA3E3E] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

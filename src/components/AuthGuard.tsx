'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, authLoading, router]);

  if (authLoading || !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { LoginForm } from '@/components/LoginForm';
import { getDefaultRoute } from '@/lib/roles';

export default function HomePage() {
  const { isLoggedIn, authLoading, role, roleLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (isLoggedIn) {
      router.replace(getDefaultRoute(role));
    }
  }, [isLoggedIn, authLoading, roleLoading, role, router]);

  if (authLoading || isLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen-safe bg-[#f2f0eb]">
      <LoginForm />
    </div>
  );
}

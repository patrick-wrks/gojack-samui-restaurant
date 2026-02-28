'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { LoginForm } from '@/components/LoginForm';

export default function HomePage() {
  const { isLoggedIn, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (isLoggedIn) {
      router.replace('/pos');
    }
  }, [isLoggedIn, authLoading, router]);

  if (authLoading || isLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f2f0eb]">
      <LoginForm />
    </div>
  );
}

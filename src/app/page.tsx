'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { LoginForm } from '@/components/LoginForm';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/pos');
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f2f0eb]">
      <LoginForm />
    </div>
  );
}

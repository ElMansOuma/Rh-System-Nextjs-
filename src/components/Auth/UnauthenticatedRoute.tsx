"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/authService';

export default function UnauthenticatedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (AuthService.isAuthenticated()) {
      // If authenticated, redirect to the dashboard or home page
      router.push('/protected/dashboard');
    }
  }, [router]);

  // If not authenticated, render children (login/register form)
  if (!AuthService.isAuthenticated()) {
    return <>{children}</>;
  }

  // Show loading spinner during check/redirect
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
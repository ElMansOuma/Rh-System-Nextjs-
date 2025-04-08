"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/authService';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    if (!AuthService.isAuthenticated()) {
      router.push('/public/auth/sign-in');
    }
  }, [router]);

  // Si authentifié, afficher les enfants du composant
  if (AuthService.isAuthenticated()) {
    return <>{children}</>;
  }

  // Pendant la vérification/redirection
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
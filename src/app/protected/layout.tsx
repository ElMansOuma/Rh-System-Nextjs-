"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/authService";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (!isAuth) {
        // Rediriger vers la page de connexion si non authentifié
        router.push("/public/auth/sign-in");
      }
    };

    checkAuth();

    // Vérifier l'authentification à chaque changement d'onglet/focus
    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  // Afficher un écran de chargement pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  // Si authentifié, afficher le layout protégé
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />
        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
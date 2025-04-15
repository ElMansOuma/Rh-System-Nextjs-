// app/public/auth/sign-in/page.tsx
import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Link from "next/link";
import { Users, Building2 } from "lucide-react";
import UnauthenticatedRoute from "@/components/Auth/UnauthenticatedRoute";

export const metadata: Metadata = {
  title: "Sign in | Gestion RH",
};

export default function SignIn() {
  return (
    <UnauthenticatedRoute>

    <div className="min-h-screen w-full flex items-center justify-center overflow-x-hidden py-4">
      <div className="w-full max-w-7xl mx-auto rounded-lg bg-white shadow-1 dark:bg-gray-dark dark:shadow-card flex flex-col xl:flex-row">
        <div className="w-full xl:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <Signin />
          </div>
        </div>

        <div className="hidden xl:flex xl:w-1/2">
          <div className="custom-gradient-1 h-full w-full overflow-hidden rounded-r-lg px-12 py-12 dark:!bg-dark-2 dark:bg-none flex flex-col">
            {/* Logo en haut */}
            <div className="flex justify-center mb-10">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-5 shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div className="text-center mt-3">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Gestion RH</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-grow">
              {/* Partie texte avec design élégant */}
              <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm p-8 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-sm">
                <div className="mb-6 border-l-4 border-blue-500 pl-4">
                  <p className="text-xl font-medium text-dark dark:text-white mb-2">
                    Connectez-vous à votre compte
                  </p>

                  <h1 className="mb-3 text-3xl font-bold text-dark dark:text-white sm:text-heading-3">
                    Bienvenue !
                  </h1>
                </div>

                <p className="font-medium text-dark-4 dark:text-dark-6 leading-relaxed">
                  Veuillez vous connecter à votre compte en remplissant les champs nécessaires ci-dessous
                </p>
              </div>

              {/* Élément décoratif en bas */}
              <div className="w-full flex justify-center mt-auto pt-10">
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UnauthenticatedRoute>
  );
}
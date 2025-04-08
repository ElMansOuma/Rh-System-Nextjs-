"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import AuthService from "@/services/authService";
import { useRouter } from "next/navigation";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    fullName: string;
    email: string;
    profilePicture: string | null;
    role: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsOpen(false);
    router.push('/public/auth/sign-in');
  };

  // Image par défaut si l'utilisateur n'a pas de photo de profil

  if (!user) {
    return null; // Ne rien afficher si aucun utilisateur n'est connecté
  }

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">Mon Compte</span>

        <figure className="flex items-center gap-3">

          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{user.fullName}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">Informations utilisateur</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {user.fullName}
            </div>
            <div className="leading-none text-gray-6">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />
        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/protected/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">Voir profil</span>
          </Link>

          <Link
            href={"/protected/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Paramètres du compte
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Déconnexion</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
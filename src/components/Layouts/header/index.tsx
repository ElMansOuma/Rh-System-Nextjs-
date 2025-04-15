"use client";


import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { Building2 } from "lucide-react";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1.5 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </Link>
      )}



      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">

        <ThemeToggleSwitch />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Signup from "@/components/Auth/Signup";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUp() {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-7xl mx-auto rounded-lg bg-white shadow-1 dark:bg-gray-dark dark:shadow-card flex">
        <div className="w-full xl:w-1/2 h-full flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <Signup />
          </div>
        </div>

        <div className="hidden xl:flex xl:w-1/2 h-full">
          <div className="custom-gradient-1 h-full w-full overflow-hidden rounded-r-lg px-12 py-12 dark:!bg-dark-2 dark:bg-none flex flex-col">
            <Link className="mb-8" href="/src/app/public">
              <Image
                className="hidden dark:block"
                src={"/images/logo/logo.svg"}
                alt="Logo"
                width={176}
                height={32}
              />
              <Image
                className="dark:hidden"
                src={"/images/logo/logo-dark.svg"}
                alt="Logo"
                width={176}
                height={32}
              />
            </Link>
            <div className="flex flex-col flex-grow">
              <p className="mb-3 text-xl font-medium text-dark dark:text-white">
                Créer un nouveau compte
              </p>

              <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                Commencez !
              </h1>

              <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
                Rejoignez notre communauté en créant votre compte et profitez de toutes nos fonctionnalités              </p>

              <div className="mt-auto">
                <Image
                  src={"/images/grids/grid-02.svg"}
                  alt="Logo"
                  width={405}
                  height={325}
                  className="mx-auto dark:opacity-30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/app/public/layout.tsx
import type { PropsWithChildren } from "react";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-2 dark:bg-[#020d1a]">
      <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {children}
      </main>
    </div>
  );
}
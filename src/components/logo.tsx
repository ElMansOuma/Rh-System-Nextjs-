import { Building2 } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-5 shadow-lg">
        <Building2 className="w-5 h-6 text-white" />
      </div>
      <div className="text-center mt-3">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Gestion RH</p>
      </div>
    </div>
  );
}
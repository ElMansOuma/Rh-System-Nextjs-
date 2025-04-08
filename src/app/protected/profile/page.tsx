"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AuthService from "@/services/authService";
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Hash,
  Award
} from 'lucide-react';

// Types précis pour le composant Badge
type BadgeVariant = "default" | "destructive" | "success";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

// Composant Badge élégant avec icône
const Badge = ({ children, variant = "default", icon }: BadgeProps) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-blue-100 text-blue-700 border-blue-200",
    destructive: "bg-red-100 text-red-700 border-red-200",
    success: "bg-green-100 text-green-700 border-green-200"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variantClasses[variant]} border transition-all duration-300 hover:shadow-md`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

interface AdminData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

export default function ProfilePage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [animate, setAnimate] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = AuthService.getCurrentUser();
        if (userData) {
          setAdminData({
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            active: userData.active
          });
        }
        setLoading(false);

        // Start animation after data is loaded
        setTimeout(() => setAnimate(true), 100);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center text-gray-500">
          <div className="w-10 h-10 border-3 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-3"></div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 text-red-700 max-w-sm">
          <XCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
          <div className="text-lg font-semibold mb-1">Session expirée</div>
          <div>Veuillez vous reconnecter</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 px-4 max-w-3xl transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <Card className="shadow-lg border border-gray-100 overflow-hidden rounded-xl transition-all duration-500 hover:shadow-xl">
        <CardContent className="p-0">
          {/* Header with gradient background - reduced vertical padding */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center border-b relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

            {/* Profile avatar - smaller size */}
            <div className={`w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md border-2 border-white transition-all duration-700 ${animate ? 'scale-100' : 'scale-0'}`}>
              {adminData.fullName.split(' ').map(part => part[0]).join('')}
            </div>

            <h2 className={`text-2xl font-bold mb-2 text-white transition-all duration-500 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {adminData.fullName}
            </h2>

            <div className={`flex justify-center space-x-2 mb-2 transition-all duration-500 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Badge
                variant={adminData.role === 'ADMIN' ? 'destructive' : 'default'}
                icon={<Shield size={12} />}
              >
                {adminData.role}
              </Badge>

              <Badge
                variant={adminData.active ? 'success' : 'default'}
                icon={adminData.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
              >
                {adminData.active ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            <p className={`text-blue-100 text-sm flex items-center justify-center transition-all duration-500 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Mail size={14} className="mr-1" />
              {adminData.email}
            </p>
          </div>

          {/* Contenu principal - reduced spacing */}
          <div className="px-6 py-6 bg-white">
            <div className="space-y-4">
              <div className={`flex justify-between items-center border-b pb-3 transition-all duration-500 delay-400 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="flex items-center text-gray-600">
                  <Hash size={16} className="mr-2 text-blue-500" />
                  <span className="text-base">ID Administrateur</span>
                </div>
                <span className="font-semibold text-base">{adminData.id}</span>
              </div>

              <div className={`flex justify-between items-center border-b pb-3 transition-all duration-500 delay-500 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2 text-blue-500" />
                  <span className="text-base">Nom complet</span>
                </div>
                <span className="font-semibold text-base">{adminData.fullName}</span>
              </div>

              <div className={`flex justify-between items-center border-b pb-3 transition-all duration-500 delay-600 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2 text-blue-500" />
                  <span className="text-base">Email</span>
                </div>
                <span className="font-semibold text-base">{adminData.email}</span>
              </div>

              <div className={`flex justify-between items-center transition-all duration-500 delay-700 ${animate ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2 text-blue-500" />
                  <span className="text-base">Date d{"'"}inscription</span>
                </div>
                <span className="font-semibold text-base">{new Date().toLocaleDateString()}</span>
              </div>

              {/* Simplified award section */}
              <div className={`flex justify-center items-center mt-4 pt-3 border-t transition-all duration-500 delay-800 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-300 p-2 rounded-lg flex items-center shadow-sm">
                  <Award size={18} className="text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm font-medium">Membre depuis {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CameraIcon } from "@/app/protected/profile/_components/icons";
import { SocialAccounts } from "@/app/protected/profile/_components/social-accounts";
import AuthService from "@/services/authService";
import apiClient from "@/services/api";

export default function Page() {
  const [data, setData] = useState({
    fullName: "",
    profilePhoto: "/images/user/default-avatar.png",
    coverPhoto: "/images/cover/cover-01.png",
    jobTitle: "Utilisateur",
    about: "Aucune information disponible.",
    posts: 0,
    followers: 0,
    following: 0
  });

  const [loading, setLoading] = useState(true);

  // Charger les informations de l'utilisateur au montage du composant
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = AuthService.getCurrentUser();

        if (currentUser) {
          // Récupérer les informations détaillées de l'utilisateur depuis l'API si nécessaire
          try {
            const response = await apiClient.get(`/admins/${currentUser.id}`);
            const userDetails = response.data;

            setData({
              fullName: userDetails.fullName || currentUser.fullName,
              profilePhoto: userDetails.profilePicture || currentUser.profilePicture || "/images/user/default-avatar.png",
              coverPhoto: userDetails.coverPhoto || "/images/cover/cover-01.png",
              jobTitle: userDetails.jobTitle || "Administrateur",
              about: userDetails.about || "Aucune information disponible.",
              posts: userDetails.posts || 0,
              followers: userDetails.followers || 0,
              following: userDetails.following || 0
            });
          } catch (error) {
            // En cas d'erreur, utiliser les informations de base du localStorage
            console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
            setData({
              ...data,
              fullName: currentUser.fullName,
              profilePhoto: currentUser.profilePicture || "/images/user/default-avatar.png"
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = async (e: any) => {
    if (e.target.name === "profilePhoto") {
      const file = e.target?.files[0];
      if (file) {
        setData({
          ...data,
          profilePhoto: URL.createObjectURL(file),
        });

        // Créer un FormData pour l'envoi du fichier
        try {
          const formData = new FormData();
          formData.append('profilePicture', file);

          const currentUser = AuthService.getCurrentUser();
          if (currentUser && currentUser.id) {
            await apiClient.put(`/admins/${currentUser.id}/profile-picture`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });

            // Mettre à jour les informations utilisateur dans le localStorage
            const updatedUser = {
              ...currentUser,
              profilePicture: URL.createObjectURL(file)
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour de la photo de profil:", error);
          // Afficher un message d'erreur à l'utilisateur si nécessaire
        }
      }
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];
      if (file) {
        setData({
          ...data,
          coverPhoto: URL.createObjectURL(file),
        });

        // Implémentation similaire pour la photo de couverture si votre API le supporte
      }
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-gray-6">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profil" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data.coverPhoto}
            alt="photo de couverture"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="coverPhoto"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />

              <CameraIcon />

              <span>Modifier</span>
            </label>
          </div>
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              {data.profilePhoto && (
                <>
                  <Image
                    src={data.profilePhoto}
                    width={160}
                    height={160}
                    className="overflow-hidden rounded-full"
                    alt="photo de profil"
                  />

                  <label
                    htmlFor="profilePhoto"
                    className="absolute bottom-0 right-0 flex size-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                  >
                    <CameraIcon />

                    <input
                      type="file"
                      name="profilePhoto"
                      id="profilePhoto"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/png, image/jpg, image/jpeg"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {data.fullName}
            </h3>
            <p className="font-medium">{data.jobTitle}</p>
            <div className="mx-auto mb-5.5 mt-5 grid max-w-[370px] grid-cols-3 rounded-[5px] border border-stroke py-[9px] shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:shadow-card">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  {data.posts}
                </span>
                <span className="text-body-sm">Posts</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-dark-3 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  {data.followers}
                </span>
                <span className="text-body-sm">Abonnés</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="font-medium text-dark dark:text-white">
                  {data.following}
                </span>
                <span className="text-body-sm-sm">Abonnements</span>
              </div>
            </div>

            <div className="mx-auto max-w-[720px]">
              <h4 className="font-medium text-dark dark:text-white">
                À propos de moi
              </h4>
              <p className="mt-4">
                {data.about}
              </p>
            </div>

            <SocialAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
// components/Auth/SignupWithPassword/index.tsx
"use client";
import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, ChangeEvent } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import AuthService from "@/services/authService";
import { useRouter } from "next/navigation";

export default function SignupWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Formulaire soumis", data); // Ajout de log pour déboguer

    if (!data.agreeTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Tentative d'inscription avec:", data);
      const response = await AuthService.register(data);
      console.log("Réponse d'inscription:", response);
      // Redirection après inscription réussie
      router.push("/public/auth/sign-in");
    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      setError(
        err.response?.data?.message ||
        "Une erreur s'est produite lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <InputGroup
        type="text"
        label="Nom complet"
        className="mb-4 [&_input]:py-3"
        placeholder="Entrez votre nom complet"
        name="fullName"
        handleChange={handleChange}
        value={data.fullName}
        icon={<UserIcon />}
        required
      />
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-3"
        placeholder="Entrez votre email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
        required
      />
      <InputGroup
        type="password"
        label="Mot de passe"
        className="mb-4 [&_input]:py-3"
        placeholder="Créez un mot de passe"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
        required
      />
      <InputGroup
        type="password"
        label="Confirmer le mot de passe"
        className="mb-4 [&_input]:py-3"
        placeholder="Confirmez votre mot de passe"
        name="confirmPassword"
        handleChange={handleChange}
        value={data.confirmPassword}
        icon={<PasswordIcon />}
        required
      />
      <div className="mb-5 flex items-start gap-2 py-1 font-medium">
        <Checkbox
          label=""
          name="agreeTerms"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            console.log("Terms checkbox changed:", e.target.checked);
            setData({
              ...data,
              agreeTerms: e.target.checked,
            });
          }}
        />

        <div className="ml-1">
          <span>
            J{"'"}accepte les{" "}
            <Link href="/terms" className="text-primary">
             Conditions d{"'"}utilisation
            </Link>{" "}
            et{" "}
            <Link href="/privacy" className="text-primary">
             Politique de confidentialité
            </Link>
          </span>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white transition hover:bg-opacity-90"
          disabled={!data.agreeTerms || loading}
        >
          Créer un compte
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
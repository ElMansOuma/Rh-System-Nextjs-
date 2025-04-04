"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import AuthService from "@/services/authService";
import { useRouter } from "next/navigation";

export default function SigninWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AuthService.login(data);
      // Redirection après connexion réussie
      router.push("/protected/collaborateurs"); // Ajustez selon votre route de tableau de bord
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Une erreur s'est produite lors de la connexion"
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
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-3"
        placeholder="Entrez votre email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="mot de passe"
        className="mb-4 [&_input]:py-3"
        placeholder="Entrez votre mot de passe"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-5 flex items-center justify-between gap-2 py-1 font-medium">
        <Checkbox
          label="Se souvenir de moi"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <Link
          href="/public/auth/forgot-password"
          className="hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-3 font-medium text-white transition hover:bg-opacity-90"
          disabled={loading}
        >
          Connexion
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
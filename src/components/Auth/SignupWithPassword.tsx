"use client";
import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, ChangeEvent } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";

export default function SignupWithPassword() {
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="text"
        label="Nom complet"
        className="mb-4 [&_input]:py-3"
        placeholder="Entrez votre nom complet"
        name="fullName"
        handleChange={handleChange}
        value={data.fullName}
        icon={<UserIcon />}
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
      />
      <InputGroup
        type="password"
        label="Mot de passe"
        className="mb-4 [&_input]:py-3"
        placeholder=" Créez un mot de passe"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
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
      />
      <div className="mb-5 flex items-start gap-2 py-1 font-medium">
        <Checkbox
          label=""
          name="agreeTerms"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setData({
              ...data,
              agreeTerms: e.target.checked,
            })
          }
          // Assuming 'required' is not a valid prop for your Checkbox component
          // If you need to make it required, update your Checkbox component to accept this prop
        />

        <div className="ml-1">
          <span>
            J'accepte les{" "}
            <Link href="/terms" className="text-primary">
             Conditions d'utilisation
            </Link>{" "}
            and{" "}
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
          disabled={!data.agreeTerms}
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

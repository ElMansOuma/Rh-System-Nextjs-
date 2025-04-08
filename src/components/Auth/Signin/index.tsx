// components/Auth/Signin/index.jsx
import Link from "next/link";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <>
      <div>
        <SigninWithPassword />
      </div>

      <div className="mt-6 text-center">
        <p>
          Vous n'avez pas de compte ?
          <Link href="/public/auth/sign-up" className="text-primary">
            S'inscrire
          </Link>
        </p>
      </div>
    </>
  );
}
import Link from "next/link";
import SignupWithPassword from "../SignupWithPassword";

export default function Signup() {
  return (
    <>

      <div>
        <SignupWithPassword />
      </div>

      <div className="mt-6 text-center">
        <p>
          Vous avez déjà un compte ?
          <Link href="/public/auth/sign-in" className="text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </>
  );
}


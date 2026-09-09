import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { signIn } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to see your Openfield sessions.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-d2">Welcome back.</h1>
      <p className="mt-4 text-ink-70">
        Signing in is only for seeing your sessions in one place.{" "}
        <Link href="/book" className="text-ink underline underline-offset-4">
          Booking works without an account.
        </Link>
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <AuthForm action={signIn} submitLabel="Sign in" mode="signin" />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-ink-55">
        No account?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4">
          Create one
        </Link>
      </p>
    </>
  );
}

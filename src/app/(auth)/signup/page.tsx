import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { signUp } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Optional account for keeping your Openfield sessions together.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <>
      <h1 className="text-d2">Create an account.</h1>
      <p className="mt-4 text-ink-70">
        Optional. It keeps your sessions together and lets you reschedule
        yourself.{" "}
        <Link href="/book" className="text-ink underline underline-offset-4">
          You can book without one.
        </Link>
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <AuthForm action={signUp} submitLabel="Create account" mode="signup" />
        </Suspense>
      </div>

      <p className="mt-8 text-sm text-ink-55">
        Already have one?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}

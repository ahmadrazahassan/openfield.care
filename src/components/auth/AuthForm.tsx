"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuthState } from "@/lib/actions/auth";

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({
  action,
  submitLabel,
  mode,
}: {
  action: Action;
  submitLabel: string;
  mode: "signin" | "signup";
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const params = useSearchParams();
  const next = params.get("next") ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {mode === "signup" && (
        <Field label="Full name" name="fullName" autoComplete="name" required />
      )}

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
        hint={mode === "signup" ? "At least 8 characters." : undefined}
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </p>
      )}
      {state.notice && (
        <p
          role="status"
          className="rounded-md border border-ink-12 px-4 py-3 text-sm text-ink-70"
        >
          {state.notice}
        </p>
      )}

      <Button type="submit" size="lg" arrow disabled={pending} className="mt-1">
        {pending ? "One moment" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={hintId}
        className="mt-2 w-full rounded-md border border-ink-12 bg-paper px-4 py-3 text-ink placeholder:text-ink-40 focus:border-ink-40"
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-ink-55">
          {hint}
        </p>
      )}
    </div>
  );
}

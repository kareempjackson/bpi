"use client";

import { useActionState } from "react";

import { requestMagicLink, type FormState } from "@/app/lib/portal/actions";

import { fieldClass, labelClass, pillClass } from "../../ui";

export default function LoginForm({ lang }: { lang: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    requestMagicLink,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className={fieldClass}
        />
      </div>

      {state ? (
        <p
          className={`text-sm ${state.ok ? "text-error-800" : "text-red-600"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={pillClass("primary")}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}

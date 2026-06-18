"use client";

import { useActionState } from "react";

import { requestAccess, type FormState } from "@/app/lib/portal/actions";

import { fieldClass, labelClass, pillClass } from "../../ui";

export default function RequestForm({ lang }: { lang: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    requestAccess,
    null,
  );

  // On success, swap the form for a confirmation message.
  if (state?.ok) {
    return (
      <p className="rounded-sm border border-error-500/30 bg-error-25 px-4 py-3 text-sm text-error-800">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="lang" value={lang} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input id="name" name="name" required className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Work email
        </label>
        <input id="email" name="email" type="email" required className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="organization" className={labelClass}>
          Organization
        </label>
        <input id="organization" name="organization" className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClass}>
          Anything we should know?{" "}
          <span className="text-primary-500/40">(optional)</span>
        </label>
        <textarea id="message" name="message" rows={3} className={fieldClass} />
      </div>

      {state && !state.ok ? (
        <p className="text-sm text-red-600" role="status">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={pillClass("primary")}>
        {pending ? "Submitting…" : "Request access"}
      </button>
    </form>
  );
}

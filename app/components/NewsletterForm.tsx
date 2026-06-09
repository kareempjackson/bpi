"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const PILL_FIELD =
  "w-full rounded-round border border-transparent bg-white px-5 py-2.5 text-sm text-primary-500 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-error-500/30 disabled:opacity-60";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: fd.get("fullName")?.toString() ?? "",
      email: fd.get("email")?.toString() ?? "",
    };

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus({
          kind: "error",
          message:
            data.error ?? "Something went wrong. Please try again shortly.",
        });
        return;
      }
      form.reset();
      setStatus({ kind: "success" });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  const submitting = status.kind === "submitting";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
    >
      <span className="font-display text-lg sm:text-xl md:text-2xl text-white shrink-0 tracking-[-0.01em]">
        Newsletter signup
      </span>
      <fieldset
        disabled={submitting}
        className="flex flex-col md:flex-row gap-2.5 md:gap-3 border-0 p-0 m-0"
      >
        <label className="sr-only" htmlFor="footer-newsletter-name">
          Full name
        </label>
        <input
          id="footer-newsletter-name"
          name="fullName"
          type="text"
          placeholder="Full Name"
          autoComplete="name"
          required
          className={`${PILL_FIELD} md:w-44 lg:w-52`}
        />
        <label className="sr-only" htmlFor="footer-newsletter-email">
          Email
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className={`${PILL_FIELD} md:w-52 lg:w-60`}
        />
      </fieldset>
      <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-round border border-transparent bg-error-500 px-7 py-2.5 text-sm md:px-8 font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_-10px_rgba(0,0,54,0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500/60 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
        {status.kind === "success" ? (
          <p
            role="status"
            aria-live="polite"
            className="text-xs md:text-sm text-white/85"
          >
            Thanks — you&rsquo;re on the list.
          </p>
        ) : null}
        {status.kind === "error" ? (
          <p role="alert" className="text-xs md:text-sm text-error-300">
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

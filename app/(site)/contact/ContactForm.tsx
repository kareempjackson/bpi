"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Button from "../../components/Button";

const INPUT_CLASS =
  "peer w-full rounded-round border border-transparent bg-white px-5 py-3 text-sm text-primary-500 placeholder-transparent outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 disabled:opacity-60";
const FLOATING_LABEL_CLASS =
  "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-primary-500 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function ContactForm({ submitLabel }: { submitLabel: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      fullName: fd.get("fullName")?.toString() ?? "",
      email: fd.get("email")?.toString() ?? "",
      businessName: fd.get("businessName")?.toString() ?? "",
      phone: fd.get("phone")?.toString() ?? "",
    };

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact", {
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
      className="mt-6 lg:mt-8 flex flex-col gap-3 max-w-xl"
    >
      <fieldset
        disabled={submitting}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-0 p-0 m-0"
      >
        <div className="relative">
          <input
            name="fullName"
            placeholder="Full Name"
            autoComplete="name"
            required
            aria-label="Full Name"
            className={INPUT_CLASS}
          />
          <label className={FLOATING_LABEL_CLASS}>
            Full Name <span className="text-[#ff5a5a]">*</span>
          </label>
        </div>
        <div className="relative">
          <input
            name="businessName"
            placeholder="Business Name"
            autoComplete="organization"
            aria-label="Business Name"
            className={INPUT_CLASS}
          />
          <label className={FLOATING_LABEL_CLASS}>Business Name</label>
        </div>
        <div className="relative">
          <input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            autoComplete="tel"
            aria-label="Phone Number"
            className={INPUT_CLASS}
          />
          <label className={FLOATING_LABEL_CLASS}>Phone Number</label>
        </div>
        <div className="relative">
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            aria-label="Email"
            className={INPUT_CLASS}
          />
          <label className={FLOATING_LABEL_CLASS}>
            Email <span className="text-[#ff5a5a]">*</span>
          </label>
        </div>
      </fieldset>

      <div className="mt-2 flex items-center gap-4">
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Sending…" : submitLabel}
        </Button>
        {status.kind === "success" ? (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-primary-500"
          >
            Thanks — we&rsquo;ve received your message and will be in touch.
          </p>
        ) : null}
        {status.kind === "error" ? (
          <p role="alert" className="text-sm text-[#b3261e]">
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

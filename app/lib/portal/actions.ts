"use server";

import { redirect } from "next/navigation";

import {
  PORTAL_USER_BY_EMAIL_QUERY,
} from "@/sanity/lib/queries";
import type { PortalUser } from "@/sanity/lib/types";
import { getWriteClient } from "@/sanity/lib/writeClient";
import { toLocale } from "@/app/lib/locale";

import { signLoginToken } from "./magic-link";
import { sendMagicLink } from "./mailer";
import { rateLimit } from "./ratelimit";
import { getPortalClient } from "./sanity";
import { destroySession } from "./session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormState = { ok: boolean; message: string } | null;

function str(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

/**
 * Email the user a one-time magic sign-in link. Always returns the SAME neutral
 * message whether or not the email maps to an active account, so the form can't
 * be used to enumerate who has portal access.
 */
export async function requestMagicLink(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = str(formData, "email", 200).toLowerCase();
  const lang = toLocale(str(formData, "lang", 5));

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const neutral: FormState = {
    ok: true,
    message:
      "If that email is registered, a sign-in link is on its way. Check your inbox.",
  };

  // Rate-limit per email: 5 link requests / 15 min.
  if (!rateLimit(`magic:${email}`, 5, 15 * 60 * 1000, Date.now())) {
    return {
      ok: false,
      message: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  try {
    const user = await getPortalClient().fetch<PortalUser | null>(
      PORTAL_USER_BY_EMAIL_QUERY,
      { email },
    );
    if (user && user.status === "active") {
      const token = await signLoginToken(email);
      const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
      const url = `${base}/${lang}/portal/verify?token=${encodeURIComponent(token)}`;
      await sendMagicLink(email, url);
    }
  } catch (err) {
    // Don't leak failures to the client — log and still return neutral.
    console.error("[portal] requestMagicLink failed:", err);
  }

  return neutral;
}

/**
 * Create a pending access request (a `portalUser` with status "pending"). An
 * admin reviews and approves it in Studio.
 */
export async function requestAccess(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = str(formData, "name", 200);
  const email = str(formData, "email", 200).toLowerCase();
  const organization = str(formData, "organization", 200);
  const message = str(formData, "message", 2000);

  if (!name) return { ok: false, message: "Please enter your name." };
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!rateLimit(`request:${email}`, 3, 60 * 60 * 1000, Date.now())) {
    return {
      ok: false,
      message: "We've already received a request. We'll be in touch soon.",
    };
  }

  const confirmation: FormState = {
    ok: true,
    message:
      "Thanks — your request has been received. We'll review it and email you a sign-in link once you're approved.",
  };

  try {
    // Skip creating a duplicate if this email already has any record.
    const existing = await getPortalClient().fetch<{ _id: string } | null>(
      PORTAL_USER_BY_EMAIL_QUERY,
      { email },
    );
    if (!existing) {
      await getWriteClient().create({
        _type: "portalUser",
        name,
        email,
        organization: organization || undefined,
        requestMessage: message || undefined,
        roles: [],
        status: "pending",
        requestedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[portal] requestAccess failed:", err);
    return {
      ok: false,
      message: "Something went wrong on our end. Please try again later.",
    };
  }

  return confirmation;
}

/** Clear the session and return to the login page. */
export async function logout(formData: FormData): Promise<void> {
  const lang = toLocale(str(formData, "lang", 5));
  await destroySession();
  redirect(`/${lang}/portal/login`);
}

import Link from "next/link";

import { isDevBypassEnabled } from "@/app/lib/portal/devBypass";
import { toLocale } from "@/app/lib/locale";

import { pillClass } from "../../ui";
import AuthCard from "../AuthCard";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function PortalLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);
  const { error } = await searchParams;
  const devBypass = isDevBypassEnabled();

  return (
    <AuthCard
      title="Sign in"
      subtitle="Enter your email and we'll send you a one-time sign-in link. No password required."
      footer={
        <>
          Don&apos;t have access yet?{" "}
          <Link
            href={`/${lang}/portal/request`}
            className="hov-underline font-medium text-primary-500"
          >
            Request access
          </Link>
        </>
      }
    >
      {error ? (
        <p className="mb-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          That sign-in link is invalid or has expired. Request a new one below.
        </p>
      ) : null}
      <LoginForm lang={lang} />

      {devBypass ? (
        <div className="mt-6 border-t border-primary-500/10 pt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary-500/50">
            Preview mode
          </p>
          <a
            href={`/${lang}/portal/dev-login`}
            className={pillClass("secondary", "w-full")}
          >
            Preview the portal →
          </a>
          <p className="mt-2 text-xs text-primary-500/50">
            Signs you in as a sample investor + partner. Disable by unsetting
            PORTAL_DEV_BYPASS.
          </p>
        </div>
      ) : null}
    </AuthCard>
  );
}

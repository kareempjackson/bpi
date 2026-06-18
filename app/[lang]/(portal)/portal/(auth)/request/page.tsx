import Link from "next/link";

import { toLocale } from "@/app/lib/locale";

import AuthCard from "../AuthCard";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function PortalRequestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);

  return (
    <AuthCard
      title="Request access"
      subtitle="Tell us who you are. We review every request, and email you a sign-in link once you're approved."
      footer={
        <>
          Already have access?{" "}
          <Link
            href={`/${lang}/portal/login`}
            className="hov-underline font-medium text-primary-500"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RequestForm lang={lang} />
    </AuthCard>
  );
}

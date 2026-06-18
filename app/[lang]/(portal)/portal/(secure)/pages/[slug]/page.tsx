import Link from "next/link";
import { notFound } from "next/navigation";

import { canAccess, requireUser } from "@/app/lib/portal/dal";
import { toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { PORTAL_PAGE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { PortalPageDetail } from "@/sanity/lib/types";

import PortalBody from "../../PortalBody";

export const dynamic = "force-dynamic";

export default async function PortalPageDetailRoute({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = toLocale(raw);
  const user = await requireUser(lang);

  const page = await loadQuery<PortalPageDetail | null>(
    PORTAL_PAGE_BY_SLUG_QUERY,
    { params: { lang, slug }, tags: [TAG.portalPage] },
  );

  // Not found OR the viewer's tier may not see it — same 404 either way, so a
  // directly-typed URL can't reveal that a restricted page exists.
  if (!page || !canAccess(user.roles, page.audiences)) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href={`/${lang}/portal`}
        className="hov-underline text-sm text-primary-500/60 hover:text-primary-500"
      >
        ← Back to overview
      </Link>
      <h1 className="mt-4 font-display text-display-sm font-semibold tracking-[-0.02em] text-primary-500">
        {page.title}
      </h1>
      {page.summary ? (
        <p className="mt-2 text-lg text-primary-500/70">{page.summary}</p>
      ) : null}
      <div className="mt-8">
        {page.body && page.body.length > 0 ? (
          <PortalBody value={page.body} />
        ) : (
          <p className="text-primary-500/50">This page has no content yet.</p>
        )}
      </div>
    </article>
  );
}

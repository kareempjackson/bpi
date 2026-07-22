import Link from "next/link";

import PortableTextBody from "@/app/components/PortableTextBody";
import { requireUser } from "@/app/lib/portal/dal";
import { toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import {
  PORTAL_PAGES_QUERY,
  PORTAL_RESOURCES_QUERY,
} from "@/sanity/lib/queries";
import type { PortalPageSummary, PortalResource } from "@/sanity/lib/types";

import { pillClass } from "../ui";

export const dynamic = "force-dynamic";

export default async function PortalDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);
  const user = await requireUser(lang);

  const [pages, resources] = await Promise.all([
    loadQuery<PortalPageSummary[]>(PORTAL_PAGES_QUERY, {
      params: { lang, roles: user.roles },
      tags: [TAG.portalPage],
    }),
    loadQuery<PortalResource[]>(PORTAL_RESOURCES_QUERY, {
      params: { lang, roles: user.roles },
      tags: [TAG.portalResource],
    }),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="font-display text-display-sm font-semibold tracking-[-0.02em] text-primary-500">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-primary-500/60">
          {labelForRoles(user.roles)} access · {pages?.length ?? 0} pages ·{" "}
          {resources?.length ?? 0} resources
        </p>
      </div>

      <Section title="Pages">
        {pages && pages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {pages.map((page) => (
              <Link
                key={page._id}
                href={`/${lang}/portal/pages/${page.slug}`}
                className="hov-card group rounded-lg border border-primary-500/10 bg-white p-5"
              >
                <h3 className="font-display text-lg font-semibold text-primary-500">
                  {page.title}
                </h3>
                {page.summary ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-primary-500/65">
                    {page.summary}
                  </p>
                ) : null}
                <span className="mt-3 inline-block text-sm font-medium text-warning-500">
                  View →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState>No pages have been shared with you yet.</EmptyState>
        )}
      </Section>

      <Section
        title="Resources"
        action={
          <Link
            href={`/${lang}/portal/resources`}
            className="hov-underline text-sm text-primary-500/70 hover:text-primary-500"
          >
            View all
          </Link>
        }
      >
        {resources && resources.length > 0 ? (
          <ul className="divide-y divide-primary-500/10 overflow-hidden rounded-lg border border-primary-500/10 bg-white">
            {resources.slice(0, 5).map((resource) => (
              <li
                key={resource._id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-primary-500">
                    {resource.title}
                  </p>
                  {resource.description ? (
                    <PortableTextBody
                      value={resource.description}
                      className="mt-0.5"
                      paragraphClassName="text-sm text-primary-500/60"
                    />
                  ) : null}
                </div>
                <a
                  href={`/api/portal/download?id=${resource._id}`}
                  className={pillClass("primary", "shrink-0")}
                >
                  {resource.kind === "video" ? "Watch" : "Download"}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No resources have been shared with you yet.</EmptyState>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500/50">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-primary-500/20 px-5 py-10 text-center text-sm text-primary-500/50">
      {children}
    </div>
  );
}

function labelForRoles(roles: string[]): string {
  if (roles.includes("investor") && roles.includes("partner")) {
    return "Investor & Partner";
  }
  if (roles.includes("investor")) return "Investor";
  if (roles.includes("partner")) return "Partner";
  return "Member";
}

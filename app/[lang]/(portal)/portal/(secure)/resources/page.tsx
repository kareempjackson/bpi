import { requireUser } from "@/app/lib/portal/dal";
import { toLocale } from "@/app/lib/locale";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { PORTAL_RESOURCES_QUERY } from "@/sanity/lib/queries";
import type { PortalResource } from "@/sanity/lib/types";

import { pillClass } from "../../ui";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<PortalResource["kind"], string> = {
  file: "Document",
  video: "Video",
  dataset: "Dataset",
};

export default async function PortalResourcesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);
  const user = await requireUser(lang);

  const resources = await loadQuery<PortalResource[]>(PORTAL_RESOURCES_QUERY, {
    params: { lang, roles: user.roles },
    tags: [TAG.portalResource],
  });

  return (
    <div>
      <h1 className="font-display text-display-sm font-semibold tracking-[-0.02em] text-primary-500">
        Resources
      </h1>
      <p className="mt-1.5 text-sm text-primary-500/60">
        Proprietary documents, videos, and datasets shared with you.
      </p>

      {resources && resources.length > 0 ? (
        <ul className="mt-8 divide-y divide-primary-500/10 overflow-hidden rounded-lg border border-primary-500/10 bg-white">
          {resources.map((resource) => (
            <li
              key={resource._id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-error-25 px-2 py-0.5 text-xs font-medium text-error-800">
                    {KIND_LABEL[resource.kind] ?? resource.kind}
                  </span>
                  <p className="font-medium text-primary-500">
                    {resource.title}
                  </p>
                </div>
                {resource.description ? (
                  <p className="mt-1 text-sm text-primary-500/60">
                    {resource.description}
                  </p>
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
        <div className="mt-8 rounded-lg border border-dashed border-primary-500/20 px-5 py-12 text-center text-sm text-primary-500/50">
          No resources have been shared with you yet.
        </div>
      )}
    </div>
  );
}

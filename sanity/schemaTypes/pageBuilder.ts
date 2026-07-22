import { defineArrayMember, type ArrayOptions } from "sanity";

import { availableBlocks, insertMenuGroups } from "../lib/blockCatalog";

/**
 * Shared page-builder array config. Every insertion zone across the site
 * references the same set of blocks and the same visual, category-grouped
 * insert menu, so the authoring experience is identical everywhere and the
 * catalog is the single source of truth (a block appears here the moment its
 * `available` flag flips in sanity/lib/blockCatalog.ts).
 *
 * Usage in a page/zone field:
 *   defineField({
 *     name: "sections",
 *     type: "array",
 *     of: pageBuilderMembers(),
 *     options: pageBuilderOptions(),
 *   })
 *
 * To restrict a narrow zone to certain categories, pass an allow-list:
 *   of: pageBuilderMembers(["content", "media", "quotes"])
 *   options: pageBuilderOptions(["content", "media", "quotes"])
 *
 * Every zone also offers a `sectionReference` — an author-once/place-many
 * pointer to a `sharedSection` document — under a "Reusable sections" group.
 * Pass `{ includeReference: false }` where references must not appear (e.g.
 * inside a sharedSection itself, so shared sections can't nest references).
 */

import type { CatalogCategory } from "../lib/blockCatalog";

type PageBuilderOpts = { includeReference?: boolean };

export function pageBuilderMembers(
  only?: CatalogCategory[],
  opts?: PageBuilderOpts,
) {
  const members = availableBlocks()
    .filter((b) => !only || only.includes(b.category))
    .map((b) => defineArrayMember({ type: b.type }));
  if (opts?.includeReference !== false) {
    members.push(defineArrayMember({ type: "sectionReference" }));
  }
  return members;
}

export function pageBuilderOptions(
  only?: CatalogCategory[],
  opts?: PageBuilderOpts,
): ArrayOptions {
  const groups: { name: string; title: string; of: string[] }[] =
    insertMenuGroups().filter(
      (g) => !only || only.includes(g.name as CatalogCategory),
    );
  if (opts?.includeReference !== false) {
    groups.push({
      name: "reusable",
      title: "Reusable sections",
      of: ["sectionReference"],
    });
  }
  return {
    insertMenu: {
      // Grid gives the visual, thumbnail-style picker; list is the fallback.
      views: [{ name: "grid" }, { name: "list" }],
      groups,
    },
  };
}

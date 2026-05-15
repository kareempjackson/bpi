import { TrashIcon } from "@sanity/icons";
import { useState } from "react";
import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from "sanity";

/**
 * Force-delete document action.
 *
 * Sanity's mutation API refuses a delete if any *strong* incoming
 * reference still points at the target — even when the schema later
 * marks those reference fields as `weak: true`, existing data saved
 * before that flag was added still counts as strong. This action does
 * the cleanup work first:
 *
 *   1. Find every document that still references this one.
 *   2. In a single transaction, patch each of them to drop the
 *      reference (unset for single-ref fields, filtered unset for
 *      array-of-ref fields).
 *   3. In the same transaction, delete both the published and any draft
 *      copy of the target document.
 *
 * The whole thing is atomic — Sanity either applies all of it or none,
 * so the references never end up dangling in a partial state.
 *
 * Currently wired for `initiative` documents which can be referenced by
 * the `initiativesPage` singleton's `featuredInitiative` (single ref)
 * and `featuredSupportingInitiatives` (array of refs). Extend the body
 * below if other document types start holding references to initiatives.
 */
export const forceDeleteAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    label: busy ? "Deleting…" : "Force delete",
    tone: "critical",
    icon: TrashIcon,
    disabled: busy,
    onHandle: () => {
      setError(null);
      setDialogOpen(true);
    },
    dialog: dialogOpen && {
      type: "confirm",
      tone: "critical",
      message: error
        ? `Force delete failed: ${error}`
        : "This will detach the document from any Initiatives-page slots that reference it, then permanently delete it. The change is atomic — if anything fails, nothing is removed.",
      onCancel: () => {
        setDialogOpen(false);
        setError(null);
      },
      onConfirm: async () => {
        setBusy(true);
        setError(null);
        try {
          // Sanity references always point at the published id; draft
          // docs share the same `_id` minus the `drafts.` prefix. We
          // need to handle both forms when deleting.
          const publishedId = props.id.replace(/^drafts\./, "");
          const draftId = `drafts.${publishedId}`;

          // 1. Find every initiativesPage doc whose `featuredInitiative`
          //    points at the doc we're deleting.
          const pagesWithFeatured = await client.fetch<string[]>(
            `*[_type == "initiativesPage" && featuredInitiative._ref == $id]._id`,
            { id: publishedId },
          );

          // 2. Find every initiativesPage doc whose
          //    `featuredSupportingInitiatives` array contains a ref to
          //    the doc we're deleting.
          const pagesWithSupporting = await client.fetch<string[]>(
            `*[_type == "initiativesPage" && $id in featuredSupportingInitiatives[]._ref]._id`,
            { id: publishedId },
          );

          const tx = client.transaction();

          // Unset the whole `featuredInitiative` object on pages where
          // it points at us. (No-op on pages where it points elsewhere
          // because we filtered to only those that match.)
          for (const pageId of pagesWithFeatured) {
            tx.patch(pageId, (patch) => patch.unset(["featuredInitiative"]));
          }

          // For array refs, use Sanity's filtered-unset path syntax to
          // pluck just the elements whose `_ref` matches us — preserves
          // any other supporting initiatives on the page.
          for (const pageId of pagesWithSupporting) {
            tx.patch(pageId, (patch) =>
              patch.unset([
                `featuredSupportingInitiatives[_ref=="${publishedId}"]`,
              ]),
            );
          }

          // Finally, drop both possible forms of the doc itself.
          tx.delete(publishedId);
          tx.delete(draftId);

          await tx.commit({ visibility: "async" });

          setBusy(false);
          setDialogOpen(false);
          props.onComplete();
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Unknown error during delete.";
          setError(msg);
          setBusy(false);
        }
      },
    },
  };
};

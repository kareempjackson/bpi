import { CheckmarkCircleIcon } from "@sanity/icons";
import { useState } from "react";
import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from "sanity";

import { apiVersion } from "../env";

/**
 * "Approve & email sign-in link" — the one-click path for granting a portal
 * user access.
 *
 * The Studio side stays thin: it just POSTs the user's id to
 * `/api/portal/send-link` (authenticated with the editor's Sanity token). The
 * server route does the privileged work with the write token — set status to
 * "active" and email a magic sign-in link — so we don't juggle draft/published
 * state or signing secrets in the browser.
 *
 * Requires at least one access tier to be set first (enforced server-side).
 */
export const approvePortalUserAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const client = useClient({ apiVersion });
  const doc = (props.draft ?? props.published) as
    | { email?: string; roles?: string[] }
    | null;
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return {
    label: busy ? "Sending…" : "Approve & email sign-in link",
    icon: CheckmarkCircleIcon,
    tone: "positive",
    disabled: busy || !doc?.email,
    onHandle: () => {
      setResult(null);
      setDialogOpen(true);
    },
    dialog: dialogOpen && {
      type: "confirm",
      tone: "positive",
      message:
        result ??
        `Mark ${doc?.email ?? "this user"} as active and email them a one-time sign-in link?`,
      onCancel: () => {
        setDialogOpen(false);
        setResult(null);
      },
      onConfirm: async () => {
        setBusy(true);
        setResult(null);
        try {
          const token = client.config().token;
          const publishedId = props.id.replace(/^drafts\./, "");
          const res = await fetch("/api/portal/send-link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ id: publishedId }),
          });
          if (!res.ok) {
            const { error } = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(error || `Request failed (${res.status})`);
          }
          setBusy(false);
          setDialogOpen(false);
          props.onComplete();
        } catch (e) {
          setResult(
            `Could not send: ${e instanceof Error ? e.message : "unknown error"}`,
          );
          setBusy(false);
        }
      },
    },
  };
};

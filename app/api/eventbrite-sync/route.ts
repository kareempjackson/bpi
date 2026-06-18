import { createHash } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { EVENT_FOR_SYNC_QUERY } from "@/sanity/lib/queries";
import { getWriteClient } from "@/sanity/lib/writeClient";

import {
  type EventSyncInput,
  eventbriteConfigured,
  syncEventToEventbrite,
} from "../../lib/eventbrite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sanity publish webhook → push the event to Eventbrite.
 *
 * Configure a GROQ-powered webhook in sanity.io/manage (API → Webhooks):
 *   - URL:        https://<domain>/api/eventbrite-sync
 *   - Trigger on: Create, Update  (Delete handled as a no-op for now)
 *   - Filter:     _type == "event"
 *   - Projection: { _type, _id }
 *   - Secret:     value of EVENTBRITE_SYNC_SECRET (falls back to
 *                 SANITY_REVALIDATE_SECRET so it can share the revalidate hook)
 *
 * On delivery we verify the signature, load the full event from Sanity, create
 * or update the matching Eventbrite event, then write the Eventbrite id + URL
 * back into the document.
 *
 * Loop guard: every successful or failed sync stores a `syncHash` of the
 * event's *content* fields. Our own write-back only touches sync fields, so its
 * echo webhook recomputes the same content hash → we early-return. A real
 * content edit changes the hash → we sync again. (Caveat: if a sync fails for a
 * reason outside the content — e.g. Eventbrite payout not configured — fixing
 * that and re-publishing won't retry unless you also make a small content edit,
 * since the content hash is unchanged. This is deliberate: it prevents an
 * endless retry loop on a persistently failing event.)
 */
export async function POST(req: NextRequest) {
  const secret =
    process.env.EVENTBRITE_SYNC_SECRET || process.env.SANITY_REVALIDATE_SECRET;

  let body: { _type?: string; _id?: string } | null;
  let isValidSignature: boolean | null;
  try {
    ({ isValidSignature, body } = await parseBody<{
      _type?: string;
      _id?: string;
    }>(req, secret));
  } catch (err) {
    console.error("[eventbrite-sync] failed to parse webhook body:", err);
    return new Response("Bad request", { status: 400 });
  }

  if (!isValidSignature) {
    return new Response("Invalid signature", { status: 401 });
  }
  // Only events are relevant — lets this share the revalidate webhook safely.
  if (body?._type !== "event" || !body?._id) {
    return NextResponse.json({ skipped: "not an event" });
  }

  // Feature can ship before the Eventbrite account exists — no-op until then.
  if (!eventbriteConfigured()) {
    console.warn(
      "[eventbrite-sync] Eventbrite env not configured — skipping sync.",
    );
    return NextResponse.json({ skipped: "eventbrite not configured" });
  }

  const sanity = getWriteClient();
  const doc = await sanity.fetch<
    (EventSyncInput & { syncHash?: string | null }) | null
  >(EVENT_FOR_SYNC_QUERY, { id: body._id });

  if (!doc) {
    // Event unpublished or deleted. Unpublishing in Eventbrite is a follow-up.
    return NextResponse.json({ skipped: "event not found (unpublished?)" });
  }

  const hash = contentHash(doc);
  if (doc.syncHash && doc.syncHash === hash) {
    // This is our own write-back echo, or nothing content-relevant changed.
    return NextResponse.json({ skipped: "unchanged (loop guard)" });
  }

  try {
    const { eventbriteId, eventbriteUrl } = await syncEventToEventbrite(
      doc,
      // Persist the id the moment the Eventbrite event is created so a
      // later-step failure can't orphan it (retries take the update path).
      async (id) => {
        await sanity
          .patch(body._id as string)
          .set({ eventbriteId: id })
          .commit({ autoGenerateArrayKeys: true });
      },
    );

    await sanity
      .patch(body._id as string)
      .set({
        eventbriteId,
        eventbriteUrl,
        syncHash: hash,
        lastSyncedAt: new Date().toISOString(),
        syncError: "",
      })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ synced: true, eventbriteId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[eventbrite-sync] sync failed for ${body._id}:`, message);

    // Record the error AND the content hash, so the failing echo doesn't loop.
    await sanity
      .patch(body._id as string)
      .set({
        syncHash: hash,
        lastSyncedAt: new Date().toISOString(),
        syncError: message,
      })
      .commit({ autoGenerateArrayKeys: true })
      .catch((e) => console.error("[eventbrite-sync] could not record error:", e));

    // 200 so Sanity doesn't keep retrying the webhook — the error is in the doc.
    return NextResponse.json({ synced: false, error: message });
  }
}

/** SHA-1 of the content fields only — sync fields are deliberately excluded. */
function contentHash(doc: EventSyncInput): string {
  const canonical = JSON.stringify({
    title: doc.title ?? null,
    summary: doc.summary ?? null,
    description: doc.description ?? null,
    startAt: doc.startAt ?? null,
    endAt: doc.endAt ?? null,
    timezone: doc.timezone ?? null,
    locationType: doc.locationType ?? null,
    venueName: doc.venueName ?? null,
    venueAddress: doc.venueAddress ?? null,
    currency: doc.currency ?? null,
    tickets: doc.tickets ?? null,
    imageUrl: doc.imageUrl ?? null,
  });
  return createHash("sha1").update(canonical).digest("hex");
}

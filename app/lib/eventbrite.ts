import type { EventTicketTier, PortableTextBlock } from "@/sanity/lib/types";

/**
 * Eventbrite v3 write client.
 *
 * Pushes a Sanity `event` document into BPI's Eventbrite organization: create
 * (or update) the event, set its description/logo, create ticket tiers, and
 * publish it. Called from `/api/eventbrite-sync` when an event is published in
 * Studio. Sanity stays the source of truth — nothing is read back from
 * Eventbrite except the new event's id + public URL.
 *
 * The core steps (create + publish) throw on failure so the route can record
 * the error. The decorative steps (rich description, logo image) are
 * best-effort: a failure there is logged but does not block publishing.
 */

const API_BASE = "https://www.eventbriteapi.com/v3";

export function eventbriteConfigured(): boolean {
  return Boolean(
    process.env.EVENTBRITE_API_TOKEN && process.env.EVENTBRITE_ORGANIZATION_ID,
  );
}

function token(): string {
  const t = process.env.EVENTBRITE_API_TOKEN;
  if (!t) throw new Error("Missing EVENTBRITE_API_TOKEN");
  return t;
}

function orgId(): string {
  const id = process.env.EVENTBRITE_ORGANIZATION_ID;
  if (!id) throw new Error("Missing EVENTBRITE_ORGANIZATION_ID");
  return id;
}

/** The fields the sync route hands us (image already resolved to a URL). */
export type EventSyncInput = {
  _id: string;
  title: string;
  summary?: string | null;
  description?: PortableTextBlock[] | null;
  startAt: string;
  endAt?: string | null;
  timezone?: string | null;
  locationType?: "online" | "venue" | null;
  venueName?: string | null;
  venueAddress?: string | null;
  currency?: string | null;
  tickets?: EventTicketTier[] | null;
  imageUrl?: string | null;
  /** Present when this event has already been synced before (update path). */
  eventbriteId?: string | null;
};

export type SyncResult = { eventbriteId: string; eventbriteUrl: string };

export type EventbriteAvailability = {
  soldOut: boolean;
  hasTickets: boolean;
  /** e.g. "Free" or "$25.00" — Eventbrite's own display string when present. */
  priceDisplay?: string;
};

/**
 * Best-effort live availability for the detail page. Reads the event's
 * `ticket_availability` from Eventbrite, cached for 5 minutes so the detail
 * page stays mostly static. Returns null (caller falls back to Sanity-derived
 * info) when Eventbrite isn't configured, the event hasn't synced, or the call
 * fails.
 */
export async function getEventbriteAvailability(
  eventbriteId: string | null | undefined,
): Promise<EventbriteAvailability | null> {
  if (!eventbriteId || !eventbriteConfigured()) return null;
  try {
    const res = await fetch(
      `${API_BASE}/events/${eventbriteId}/?expand=ticket_availability`,
      {
        headers: { Authorization: `Bearer ${token()}` },
        next: { revalidate: 300, tags: ["event"] },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ticket_availability?: {
        has_available_tickets?: boolean;
        is_sold_out?: boolean;
        minimum_ticket_price?: { display?: string };
      };
    };
    const ta = data.ticket_availability;
    if (!ta) return null;
    return {
      soldOut: Boolean(ta.is_sold_out),
      hasTickets: Boolean(ta.has_available_tickets),
      priceDisplay: ta.minimum_ticket_price?.display,
    };
  } catch {
    return null;
  }
}

type EventbriteError = {
  error?: string;
  error_description?: string;
};

type EbInit = {
  method?: string;
  headers?: Record<string, string>;
  /** JSON-serializable request body. */
  body?: unknown;
};

/** Authenticated fetch against the Eventbrite API with readable errors. */
async function ebFetch<T>(path: string, init?: EbInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: init?.body != null ? JSON.stringify(init.body) : undefined,
    // Server-to-server mutation — never cache.
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = (json ?? {}) as EventbriteError;
    const detail =
      err.error_description || err.error || `HTTP ${res.status}`;
    throw new Error(`Eventbrite ${init?.method ?? "GET"} ${path} failed: ${detail}`);
  }
  return json as T;
}

/** Eventbrite wants `YYYY-MM-DDTHH:MM:SSZ` (UTC, no milliseconds). */
function toEbUtc(iso: string): string {
  const d = new Date(iso);
  return `${d.toISOString().split(".")[0]}Z`;
}

/** Paid Eventbrite cost is "<CUR>,<minor units>", e.g. "BBD,2500" for $25. */
function ebCost(currency: string, price: number): string {
  return `${currency},${Math.round(price * 100)}`;
}

// ── Minimal Portable Text → HTML ──────────────────────────────────────────────
// Dependency-free serializer good enough for an event description: paragraphs,
// headings, bullet/number lists, and the common inline marks.

type PTChild = { _type?: string; text?: string; marks?: string[] };
type PTMarkDef = { _key?: string; _type?: string; href?: string };
type PTBlock = {
  _type?: string;
  style?: string;
  listItem?: string;
  children?: PTChild[];
  markDefs?: PTMarkDef[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderChildren(block: PTBlock): string {
  const defs = block.markDefs ?? [];
  return (block.children ?? [])
    .map((child) => {
      let html = escapeHtml(child.text ?? "");
      for (const mark of child.marks ?? []) {
        if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "underline") html = `<u>${html}</u>`;
        else {
          const def = defs.find((d) => d._key === mark);
          if (def?._type === "link" && def.href) {
            html = `<a href="${escapeHtml(def.href)}">${html}</a>`;
          }
        }
      }
      return html;
    })
    .join("");
}

export function portableTextToHtml(
  blocks?: PortableTextBlock[] | null,
): string {
  if (!blocks || blocks.length === 0) return "";
  const out: string[] = [];
  let listBuffer: string[] = [];
  let listType: "bullet" | "number" | null = null;

  const flushList = () => {
    if (listType && listBuffer.length) {
      const tag = listType === "number" ? "ol" : "ul";
      out.push(`<${tag}>${listBuffer.join("")}</${tag}>`);
    }
    listBuffer = [];
    listType = null;
  };

  for (const raw of blocks) {
    const block = raw as unknown as PTBlock;
    if (block._type !== "block") continue;
    const inner = renderChildren(block);
    const li = block.listItem;
    if (li === "bullet" || li === "number") {
      if (listType && listType !== li) flushList();
      listType = li;
      listBuffer.push(`<li>${inner}</li>`);
      continue;
    }
    flushList();
    const style = block.style ?? "normal";
    if (style === "h1") out.push(`<h1>${inner}</h1>`);
    else if (style === "h2") out.push(`<h2>${inner}</h2>`);
    else if (style === "h3") out.push(`<h3>${inner}</h3>`);
    else if (style === "h4") out.push(`<h4>${inner}</h4>`);
    else if (style === "blockquote") out.push(`<blockquote>${inner}</blockquote>`);
    else out.push(`<p>${inner}</p>`);
  }
  flushList();
  return out.join("");
}

/** Plain-text excerpt for Eventbrite's `summary` (hard 140-char limit). */
function plainSummary(input: EventSyncInput): string {
  const fromSummary = (input.summary ?? "").trim();
  if (fromSummary) return fromSummary.slice(0, 140);
  const fromBody = portableTextToHtml(input.description)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return fromBody.slice(0, 140);
}

// ── API operations ────────────────────────────────────────────────────────────

function eventBody(input: EventSyncInput) {
  const tz = input.timezone || "America/Barbados";
  return {
    event: {
      name: { html: input.title },
      summary: plainSummary(input),
      start: { timezone: tz, utc: toEbUtc(input.startAt) },
      end: { timezone: tz, utc: toEbUtc(input.endAt || input.startAt) },
      currency: input.currency || "USD",
      online_event: input.locationType !== "venue",
      listed: true,
      shareable: true,
    },
  };
}

async function createEvent(input: EventSyncInput): Promise<{ id: string; url: string }> {
  const data = await ebFetch<{ id: string; url: string }>(
    `/organizations/${orgId()}/events/`,
    { method: "POST", body: eventBody(input) },
  );
  return { id: data.id, url: data.url };
}

async function updateEvent(
  eventbriteId: string,
  input: EventSyncInput,
): Promise<{ id: string; url: string }> {
  const data = await ebFetch<{ id: string; url: string }>(
    `/events/${eventbriteId}/`,
    { method: "POST", body: eventBody(input) },
  );
  return { id: data.id, url: data.url };
}

type EbTicketClass = { id: string; name: string };

/** Create the doc's ticket tiers, reconciling by name on updates. */
async function syncTicketClasses(
  eventbriteId: string,
  input: EventSyncInput,
): Promise<void> {
  const tiers = input.tickets ?? [];
  if (tiers.length === 0) return;
  const currency = input.currency || "USD";

  const existing = await ebFetch<{ ticket_classes: EbTicketClass[] }>(
    `/events/${eventbriteId}/ticket_classes/`,
  ).then((r) => r.ticket_classes ?? []);

  for (const tier of tiers) {
    const ticket_class: Record<string, unknown> = { name: tier.name };
    if (tier.kind === "paid" && tier.price != null) {
      ticket_class.cost = ebCost(currency, tier.price);
    } else {
      ticket_class.free = true;
    }
    if (tier.quantityTotal != null) {
      ticket_class.quantity_total = tier.quantityTotal;
    }

    const match = existing.find((c) => c.name === tier.name);
    if (match) {
      await ebFetch(`/events/${eventbriteId}/ticket_classes/${match.id}/`, {
        method: "POST",
        body: { ticket_class },
      });
    } else {
      await ebFetch(`/events/${eventbriteId}/ticket_classes/`, {
        method: "POST",
        body: { ticket_class },
      });
    }
  }
}

/** Best-effort: upload the Sanity image as the event logo. */
async function setEventLogo(
  eventbriteId: string,
  imageUrl: string,
): Promise<void> {
  // 1. Ask Eventbrite where to upload.
  const instr = await ebFetch<{
    upload_token: string;
    upload_url: string;
    upload_data: Record<string, string>;
    file_parameter_name: string;
  }>(`/media/upload/?type=image-event-logo`);

  // 2. Stream the Sanity image bytes to the provided upload URL.
  const imgRes = await fetch(imageUrl, { cache: "no-store" });
  if (!imgRes.ok) throw new Error(`Could not fetch image (${imgRes.status})`);
  const blob = await imgRes.blob();

  const form = new FormData();
  for (const [k, v] of Object.entries(instr.upload_data)) form.append(k, v);
  form.append(instr.file_parameter_name, blob, "event-logo");
  const up = await fetch(instr.upload_url, { method: "POST", body: form });
  if (!up.ok) throw new Error(`Upload failed (${up.status})`);

  // 3. Notify Eventbrite and attach the resulting media as the event logo.
  const media = await ebFetch<{ id: string }>(`/media/upload/`, {
    method: "POST",
    body: { upload_token: instr.upload_token },
  });
  await updateEventLogoId(eventbriteId, media.id);
}

async function updateEventLogoId(eventbriteId: string, logoId: string) {
  await ebFetch(`/events/${eventbriteId}/`, {
    method: "POST",
    body: { event: { logo_id: logoId } },
  });
}

/**
 * Best-effort: push the rich description as Eventbrite "structured content".
 *
 * Eventbrite's modern description lives in versioned structured content rather
 * than the legacy `event.description.html`. We read the current version and
 * post the next one with a single text module. Wrapped by the caller in
 * try/catch — a failure here never blocks publishing (the `summary` already
 * carries a short description).
 */
async function setEventDescription(
  eventbriteId: string,
  html: string,
): Promise<void> {
  if (!html) return;
  const current = await ebFetch<{ page_version_number?: number }>(
    `/events/${eventbriteId}/structured_content/?purpose=listing`,
  ).catch(() => null);
  const nextVersion = (current?.page_version_number ?? 0) + 1;

  await ebFetch(
    `/events/${eventbriteId}/structured_content/${nextVersion}/?purpose=listing`,
    {
      method: "POST",
      body: {
        purpose: "listing",
        publish: true,
        modules: [
          {
            type: "text",
            data: { body: { type: "text", text: html, alignment: "left" } },
          },
        ],
      },
    },
  );
}

async function publishEvent(eventbriteId: string): Promise<void> {
  await ebFetch(`/events/${eventbriteId}/publish/`, { method: "POST" });
}

/**
 * Full create-or-update sync for one event.
 *
 * @param onEventCreated invoked with the new Eventbrite id the moment the event
 *   is created (before tickets/publish) so the caller can persist it
 *   immediately — making retries idempotent instead of creating duplicates.
 */
export async function syncEventToEventbrite(
  input: EventSyncInput,
  onEventCreated?: (eventbriteId: string) => Promise<void>,
): Promise<SyncResult> {
  // 1. Create or update the core event.
  let id: string;
  let url: string;
  if (input.eventbriteId) {
    ({ id, url } = await updateEvent(input.eventbriteId, input));
  } else {
    ({ id, url } = await createEvent(input));
    // Persist the id right away so a later-step failure can't orphan it.
    if (onEventCreated) await onEventCreated(id);
  }

  // 2. Best-effort logo — never block publishing on an image hiccup.
  if (input.imageUrl) {
    try {
      await setEventLogo(id, input.imageUrl);
    } catch (err) {
      console.error(`[eventbrite] logo upload failed for ${input._id}:`, err);
    }
  }

  // 3. Best-effort rich description (structured content).
  try {
    await setEventDescription(id, portableTextToHtml(input.description));
  } catch (err) {
    console.error(`[eventbrite] description sync failed for ${input._id}:`, err);
  }

  // 4. Ticket tiers (required for a publishable event).
  await syncTicketClasses(id, input);

  // 5. Publish. Paid tiers fail here if payout isn't configured — the thrown
  //    message propagates to the route and into the doc's syncError.
  await publishEvent(id);

  return { eventbriteId: id, eventbriteUrl: url };
}

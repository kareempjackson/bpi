import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity publish webhook → on-demand cache revalidation.
 *
 * Configure a GROQ-powered webhook in sanity.io/manage (API → Webhooks):
 *   - URL:        https://<prod-domain>/api/revalidate
 *   - Trigger on: Create, Update, Delete
 *   - Projection: { _type, "slug": slug.current }
 *   - HTTP method: POST
 *   - Secret:     value of SANITY_REVALIDATE_SECRET
 *
 * On each delivery we verify the signature, then `revalidateTag(_type)`. Every
 * server read is tagged with the document `_type` it depends on (see
 * sanity/lib/fetch.ts `TAG`), so busting the type invalidates exactly the pages
 * that read that content — and nothing else stays warm-cached.
 */
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{
      _type?: string;
      slug?: string;
    }>(req, process.env.SANITY_REVALIDATE_SECRET);

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }
    if (!body?._type) {
      return new Response("Bad request: missing _type", { status: 400 });
    }

    // `{ expire: 0 }` expires the tag immediately so the next request fetches
    // fresh — the right choice for a publish webhook (Next 16 recommends it for
    // third-party callers that need immediate expiry). The default `"max"`
    // would serve stale-while-revalidate once, making an editor's just-published
    // change appear a beat late.
    revalidateTag(body._type, { expire: 0 });

    return NextResponse.json({
      revalidated: true,
      tag: body._type,
      now: Date.now(),
    });
  } catch (err) {
    console.error("Revalidate webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

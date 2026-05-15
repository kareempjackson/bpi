import { NextResponse } from "next/server";

import { getWriteClient } from "../../../sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  fullName?: string;
  email?: string;
  businessName?: string;
  phone?: string;
};

async function parseBody(request: Request): Promise<Payload> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Payload;
  }
  const form = await request.formData();
  return {
    fullName: form.get("fullName")?.toString(),
    email: form.get("email")?.toString(),
    businessName: form.get("businessName")?.toString(),
    phone: form.get("phone")?.toString(),
  };
}

function clean(input: string | undefined, max: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim().slice(0, max);
  return trimmed.length === 0 ? undefined : trimmed;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await parseBody(request);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const fullName = clean(body.fullName, 200);
  const email = clean(body.email, 200);
  const businessName = clean(body.businessName, 200);
  const phone = clean(body.phone, 50);

  if (!fullName) {
    return NextResponse.json(
      { error: "Full name is required." },
      { status: 400 },
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  try {
    const client = getWriteClient();
    await client.create({
      _type: "contactSubmission",
      fullName,
      email,
      businessName,
      phone,
      submittedAt: new Date().toISOString(),
      read: false,
    });
  } catch (err) {
    console.error("Failed to save contact submission:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

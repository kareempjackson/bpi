import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await draftMode()).disable();

  const url = new URL(request.url);
  const redirectPath = url.searchParams.get("redirect") ?? "/";
  return NextResponse.redirect(new URL(redirectPath, url.origin));
}

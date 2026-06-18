import "server-only";

/**
 * Email delivery for the portal, via Resend's REST API (no SDK dependency —
 * just a fetch). Swap the provider by changing only this file.
 *
 * If RESEND_API_KEY / PORTAL_FROM_EMAIL are unset, sending no-ops with a
 * server-side warning so the feature can ship before the mail account exists
 * (the login flow still returns its neutral "check your email" message).
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function send({ to, subject, html, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PORTAL_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn(
      "[portal] RESEND_API_KEY / PORTAL_FROM_EMAIL not configured — email not sent.",
      { to, subject },
    );
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}

/** Email a magic sign-in link. */
export async function sendMagicLink(to: string, url: string): Promise<void> {
  await send({
    to,
    subject: "Your BPI portal sign-in link",
    text: `Sign in to the BPI investor & partner portal:\n\n${url}\n\nThis link expires in 15 minutes and can be used once. If you didn't request it, you can safely ignore this email.`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:18px;margin:0 0 16px">Sign in to the BPI portal</h1>
        <p style="font-size:14px;line-height:1.6;margin:0 0 24px;color:#334155">
          Click the button below to access the investor &amp; partner portal.
          This link expires in 15 minutes and can be used once.
        </p>
        <p style="margin:0 0 24px">
          <a href="${url}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600">
            Open the portal
          </a>
        </p>
        <p style="font-size:12px;line-height:1.6;color:#64748b;margin:0">
          If the button doesn't work, paste this URL into your browser:<br />
          <span style="word-break:break-all">${url}</span>
        </p>
        <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:24px 0 0">
          Didn't request this? You can safely ignore this email.
        </p>
      </div>
    `,
  });
}

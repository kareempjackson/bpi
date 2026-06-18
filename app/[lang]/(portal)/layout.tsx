import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor & Partner Portal — BPI",
  robots: { index: false, follow: false },
};

/**
 * Minimal shell for the whole portal area (auth pages + the gated app). Kept
 * deliberately separate from the public site chrome — no marketing nav/footer.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-error-25 font-sans text-primary-500">
      {children}
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { albertSans, avenirNext } from "@/app/fonts";
import BrandTheme from "@/app/components/BrandTheme";
import BrowserCheck from "@/app/components/BrowserCheck";
import { hasLocale, locales } from "@/app/lib/locale";

export const metadata: Metadata = {
  title: "Barbados Pharmaceutical Inc",
  description: "Barbados Pharmaceutical Inc",
};

// Tint mobile browser chrome with the site's signature mint.
export const viewport: Viewport = {
  themeColor: "#cdffe6",
};

// Pre-render every supported locale; unknown locales 404 instead of
// rendering on-demand.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${albertSans.variable} ${avenirNext.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Inject the editable brand tokens as :root CSS vars before content. */}
        <BrandTheme />
        <BrowserCheck />
        {children}
      </body>
    </html>
  );
}

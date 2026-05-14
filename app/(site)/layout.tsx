import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import BfcacheReset from "../components/BfcacheReset";
import Footer from "../components/Footer";
import LenisProvider from "../components/LenisProvider";
import ParallaxController from "../components/ParallaxController";
import RevealController from "../components/RevealController";
import { SanityLive, sanityFetch } from "../../sanity/lib/live";
import { resolveMenuConfig } from "../../sanity/lib/menu";
import { SITE_SETTINGS_QUERY } from "../../sanity/lib/queries";
import type { SiteSettings } from "../../sanity/lib/types";
import DraftModeBanner from "./DraftModeBanner";
import StickyTopNavSlot from "./StickyTopNavSlot";

async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  return data as SiteSettings | null;
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ isEnabled: isDraftMode }, settings] = await Promise.all([
    draftMode(),
    getSiteSettings(),
  ]);

  const navLinks = (settings?.navLinks ?? []).map((l) => ({
    label: l.label,
    href: l.href,
    disabled: l.disabled ?? false,
  }));
  const menuConfig = resolveMenuConfig(settings);

  return (
    <LenisProvider>
      <BfcacheReset />
      <RevealController />
      <ParallaxController />
      <StickyTopNavSlot
        navLinks={navLinks.length ? navLinks : undefined}
        menuConfig={menuConfig}
      />
      <div className="flex-1">{children}</div>
      <Footer
        partners={
          settings?.footerPartners
            ?.filter((p) => !!p.logoUrl)
            .map((p) => ({
              name: p.name,
              logoSrc: p.logoUrl as string,
              href: p.href ?? undefined,
            })) ?? undefined
        }
      />
      <SanityLive />
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DraftModeBanner />
        </>
      ) : null}
    </LenisProvider>
  );
}

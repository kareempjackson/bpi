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

  // Footer socials mirror the modal menu's social list, narrowed to the
  // two platforms BPI is actually active on. Same Sanity field powers
  // both surfaces, so editing the menu socials updates the footer too.
  const footerSocialLinks = (settings?.menuSocialLinks ?? [])
    .filter((s) => s.kind === "LinkedIn" || s.kind === "Instagram")
    .filter((s) => !!s.href)
    .map((s) => ({ name: s.kind as "LinkedIn" | "Instagram", href: s.href }));

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
        showPartners={settings?.showFooterPartners ?? true}
        partners={
          settings?.footerPartners
            ?.filter((p) => !!p.logoUrl)
            .map((p) => ({
              name: p.name,
              logoSrc: p.logoUrl as string,
              href: p.href ?? undefined,
            })) ?? undefined
        }
        socialLinks={
          footerSocialLinks.length > 0 ? footerSocialLinks : undefined
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

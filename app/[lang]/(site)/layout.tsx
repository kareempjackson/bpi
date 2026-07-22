import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import AnnouncementBar from "@/app/components/AnnouncementBar";
import BfcacheReset from "@/app/components/BfcacheReset";
import BuildingSection from "@/app/components/BuildingSection";
import CustomCursor from "@/app/components/CustomCursor";
import Footer from "@/app/components/Footer";
import LenisProvider from "@/app/components/LenisProvider";
import ViewTransitionProvider from "@/app/components/ViewTransitionProvider";
import { localizedHref } from "@/app/lib/locale";
import { SanityLive } from "@/sanity/lib/live";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMenuConfig } from "@/sanity/lib/menu";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";
import DraftModeBanner from "./DraftModeBanner";
import StickyTopNavSlot from "./StickyTopNavSlot";

async function getSiteSettings(lang: string): Promise<SiteSettings | null> {
  return loadQuery<SiteSettings | null>(SITE_SETTINGS_QUERY, {
    params: { lang },
    tags: [TAG.siteSettings],
  });
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const [{ isEnabled: isDraftMode }, settings] = await Promise.all([
    draftMode(),
    getSiteSettings(lang),
  ]);

  // Editor-managed nav structure from Sanity, already localized by GROQ.
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

  // Site-wide bands, authored on siteSettings and gated on their own toggles.
  const announcement = settings?.announcement;
  const globalCta = settings?.globalCta;

  return (
    <LenisProvider>
      <BfcacheReset />
      <CustomCursor />
      {announcement?.enabled ? (
        <AnnouncementBar announcement={announcement} lang={lang} />
      ) : null}
      <StickyTopNavSlot navLinks={navLinks} menuConfig={menuConfig} />
      <ViewTransitionProvider>
        <div className="flex-1">{children}</div>
      </ViewTransitionProvider>
      {globalCta?.enabled ? (
        <BuildingSection
          heading={globalCta.heading ?? undefined}
          body={globalCta.body ?? undefined}
          primaryLabel={globalCta.primaryCta?.label}
          primaryHref={
            globalCta.primaryCta?.href
              ? localizedHref(lang, globalCta.primaryCta.href)
              : undefined
          }
          secondaryLabel={globalCta.secondaryCta?.label}
          secondaryHref={
            globalCta.secondaryCta?.href
              ? localizedHref(lang, globalCta.secondaryCta.href)
              : undefined
          }
          tone={globalCta.tone === "blue" ? "blue" : "green"}
        />
      ) : null}
      <Footer
        navGroups={settings?.footerNavGroups}
        legalLinks={settings?.footerLegalLinks}
        tagline={settings?.footerTagline}
        rightsLabel={settings?.footerRights}
        showPartners={true}
        socialLinks={
          footerSocialLinks.length > 0 ? footerSocialLinks : undefined
        }
      />
      {isDraftMode ? (
        <>
          {/* Live Content API connection — preview only. Mounting this for all
              visitors opens a per-visitor Sanity live connection, so it's gated
              to draft mode; production freshness comes from the publish webhook. */}
          <SanityLive />
          <VisualEditing />
          <DraftModeBanner />
        </>
      ) : null}
    </LenisProvider>
  );
}

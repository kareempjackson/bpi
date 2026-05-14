import type {
  MenuConfig,
  MenuLink as ResolvedMenuLink,
  MenuMedia as ResolvedMenuMedia,
  SocialLink as ResolvedSocial,
  SubMenuLink as ResolvedSubMenuLink,
} from "../../app/components/Menu";
import { resolveImage } from "./image";
import type { MenuMedia, SiteSettings } from "./types";

function resolveMenuMedia(
  m: MenuMedia | null | undefined,
): ResolvedMenuMedia | undefined {
  if (!m) return undefined;
  if (m.kind === "video") {
    const src = m.videoUrl || m.videoFallbackSrc || undefined;
    if (!src) return undefined;
    return { type: "video", src };
  }
  const img = resolveImage(m.image, { width: 1200 });
  if (!img) return undefined;
  return { type: "image", src: img.src, alt: img.alt };
}

/**
 * Convert the Sanity `siteSettings` document into the shape the Menu
 * component expects. Returns `undefined` when no menu data is configured
 * so the component falls back to its built-in defaults.
 */
export function resolveMenuConfig(
  settings: SiteSettings | null | undefined,
): MenuConfig | undefined {
  if (!settings) return undefined;

  const links: ResolvedMenuLink[] | undefined =
    settings.menuLinks && settings.menuLinks.length
      ? settings.menuLinks.map((l) => {
          const out: ResolvedMenuLink = { label: l.label, href: l.href };
          const media = resolveMenuMedia(l.media);
          if (media) out.media = media;
          if (l.subItems && l.subItems.length) {
            out.subItems = l.subItems.map((s): ResolvedSubMenuLink => {
              const sub: ResolvedSubMenuLink = { label: s.label, href: s.href };
              const subMedia = resolveMenuMedia(s.media);
              if (subMedia) sub.media = subMedia;
              return sub;
            });
          }
          return out;
        })
      : undefined;

  const legalLinks =
    settings.menuLegalLinks && settings.menuLegalLinks.length
      ? settings.menuLegalLinks
          .filter((l) => !l.disabled)
          .map((l) => ({ label: l.label, href: l.href }))
      : undefined;

  const socialLinks: ResolvedSocial[] | undefined =
    settings.menuSocialLinks && settings.menuSocialLinks.length
      ? settings.menuSocialLinks.map((s) => ({
          name: s.kind,
          href: s.href,
          label: s.label ?? undefined,
        }))
      : undefined;

  const defaultMedia = resolveMenuMedia(settings.menuBackground);

  // If nothing is configured, return undefined so the component uses defaults.
  if (!links && !legalLinks && !socialLinks && !defaultMedia) return undefined;

  return { links, legalLinks, socialLinks, defaultMedia };
}

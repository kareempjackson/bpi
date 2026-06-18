import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** May be null/undefined when it comes from an unset Sanity CTA. */
  href?: string | null;
  children: ReactNode;
};

/**
 * CTA wrapper that picks the right link element for an href that may
 * come from Sanity (could be a route or an absolute external URL).
 *
 * - Internal hrefs (start with "/") render `<Link>` so navigation is
 *   client-side and the shared `(site)` layout (Lenis, sticky nav,
 *   SanityLive SSE, etc.) is preserved across the navigation.
 * - Absolute / external hrefs render an `<a target="_blank">` so the
 *   user is taken to the external site in a new tab.
 *
 * Using `<Link>` everywhere for internal nav is what removes the site's
 * reliance on the browser's bfcache for back navigation — which is what
 * was leaving pages frozen / unscrollable after a Back click.
 */
export default function CtaLink({ href, children, ...rest }: Props) {
  // No destination configured (e.g. a Sanity CTA left blank). Render the
  // styled element as a non-navigating `<a>` rather than crashing on a
  // null href — the label still shows; it just isn't clickable.
  if (!href) {
    return <a {...rest}>{children}</a>;
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

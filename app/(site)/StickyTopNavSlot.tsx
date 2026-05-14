"use client";

import { usePathname } from "next/navigation";

import type { MenuConfig } from "../components/Menu";
import StickyTopNav, {
  type StickyNavLink,
} from "../components/StickyTopNav";

/**
 * Routes where the global sticky nav should not render at all. The home
 * page is intentionally NOT in this set — `StickyTopNav` already hides
 * itself over the hero and reveals on scroll-up below it, so it can
 * coexist with the hero's own embedded nav without duplicating.
 */
const NO_STICKY_NAV_ROUTES = new Set<string>([]);

type Props = {
  navLinks?: StickyNavLink[];
  menuConfig?: MenuConfig;
};

export default function StickyTopNavSlot({ navLinks, menuConfig }: Props) {
  const pathname = usePathname() ?? "/";
  if (NO_STICKY_NAV_ROUTES.has(pathname)) return null;
  return <StickyTopNav navLinks={navLinks} menuConfig={menuConfig} />;
}

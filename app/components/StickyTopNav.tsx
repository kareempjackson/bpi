"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import MenuLauncher from "./MenuLauncher";

type Theme = "light" | "dark";

/**
 * Tall sticky bar that hides on scroll-down and reveals on scroll-up.
 * Shows only the brand icon (left) and the hamburger menu launcher (right).
 * No nav links, no wordmark.
 * Logo color adapts to the section underneath via [data-nav-theme] tags.
 */
export default function StickyTopNav() {
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const visibleRef = useRef(false);
  const themeRef = useRef<Theme>("light");
  const lastYRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    lastYRef.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      const pastHero = y > window.innerHeight * 0.5;

      // Show on scroll up; hide on scroll down. Always hidden over the hero.
      let nextVisible = visibleRef.current;
      if (!pastHero) {
        nextVisible = false;
      } else if (dy < -2) {
        nextVisible = true;
      } else if (dy > 2) {
        nextVisible = false;
      }
      lastYRef.current = y;

      if (nextVisible !== visibleRef.current) {
        visibleRef.current = nextVisible;
        setVisible(nextVisible);
      }

      // Theme detection — find section sitting at the nav's vertical center
      const navY = 56;
      const themedEls = document.querySelectorAll<HTMLElement>(
        "[data-nav-theme]"
      );
      let nextTheme: Theme = "light";
      for (const el of themedEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= navY && rect.bottom > navY) {
          const t = el.dataset.navTheme;
          if (t === "dark" || t === "light") nextTheme = t;
          break;
        }
      }
      if (nextTheme !== themeRef.current) {
        themeRef.current = nextTheme;
        setTheme(nextTheme);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isDark = theme === "dark";
  const iconColor = isDark ? "text-white" : "text-primary-500";

  return (
    <div
      data-page-header
      aria-hidden={!visible}
      className={`fixed top-0 inset-x-0 z-40 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className={isDark ? "bg-primary-500" : "bg-error-25"}>
        <div className="flex items-center justify-between px-6 md:px-10 lg:px-14 h-20 lg:h-24">
          <a
            href="/"
            aria-label="BPI home"
            className={`inline-flex items-center transition-colors duration-500 ease-out ${iconColor}`}
          >
            <Logo iconOnly size={36} />
          </a>

          <MenuLauncher size={96} />
        </div>
      </div>
    </div>
  );
}

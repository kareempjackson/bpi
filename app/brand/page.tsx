import type { Metadata } from "next";

import ArrowRight from "../components/ArrowRight";
import Button from "../components/Button";
import Checkbox from "../components/Checkbox";
import HamburgerMenu from "../components/HamburgerMenu";
import Input from "../components/Input";
import Logo from "../components/Logo";
import Radio from "../components/Radio";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Toggle from "../components/Toggle";
import BlogPostShape from "../components/shapes/BlogPostShape";
import FooterShape from "../components/shapes/FooterShape";
import FooterImageShape from "../components/shapes/FooterImageShape";
import HeroImage2Shape from "../components/shapes/HeroImage2Shape";
import HeroShape1 from "../components/shapes/HeroShape1";
import InitiativesShape from "../components/shapes/InitiativesShape";
import LogoShape from "../components/shapes/LogoShape";

export const metadata: Metadata = {
  title: "Brand — BPI",
  description: "BPI design system and brand guidelines",
};

const BASE_COLORS = [
  { name: "Blue", hex: "#000036", bg: "bg-base-blue", fg: "text-white" },
  {
    name: "White",
    hex: "#FFFFFF",
    bg: "bg-white border border-gray-200",
    fg: "text-primary-500",
  },
  { name: "Green", hex: "#06FE83", bg: "bg-base-green", fg: "text-primary-500" },
  { name: "Teal", hex: "#0870AD", bg: "bg-base-teal", fg: "text-white" },
];

const PRIMARY_SCALE = [
  { step: "25", hex: "#b3b3c3", bg: "bg-primary-25", contrast: "AA 5.28" },
  { step: "50", hex: "#80809b", bg: "bg-primary-50", contrast: "AA 5.17" },
  { step: "100", hex: "#666686", bg: "bg-primary-100", contrast: "AA 4.75" },
  { step: "200", hex: "#4d4d72", bg: "bg-primary-200", contrast: "4.15" },
  { step: "300", hex: "#33335e", bg: "bg-primary-300", contrast: "3.50" },
  { step: "400", hex: "#1a1a4a", bg: "bg-primary-400", contrast: "1.84" },
  { step: "500", hex: "#000036", bg: "bg-primary-500", contrast: "2.34" },
  { step: "600", hex: "#000031", bg: "bg-primary-600", contrast: "3.49" },
  { step: "700", hex: "#000026", bg: "bg-primary-700", contrast: "AA 5.40" },
  { step: "800", hex: "#000010", bg: "bg-primary-800", contrast: "AAA 7.49" },
  { step: "900", hex: "#00000b", bg: "bg-primary-900", contrast: "AAA 9.48" },
  { step: "950", hex: "#000005", bg: "bg-primary-950", contrast: "AAA 13.92" },
];

const ERROR_SCALE = [
  { step: "25", hex: "#cdffe6", bg: "bg-error-25" },
  { step: "50", hex: "#9bffcd", bg: "bg-error-50" },
  { step: "100", hex: "#83ffc1", bg: "bg-error-100" },
  { step: "200", hex: "#51fea8", bg: "bg-error-200" },
  { step: "300", hex: "#38fe9c", bg: "bg-error-300" },
  { step: "400", hex: "#1ffe8f", bg: "bg-error-400" },
  { step: "500", hex: "#06fe83", bg: "bg-error-500" },
  { step: "600", hex: "#05cb69", bg: "bg-error-600" },
  { step: "700", hex: "#04b25c", bg: "bg-error-700" },
  { step: "800", hex: "#037f42", bg: "bg-error-800" },
  { step: "900", hex: "#01331a", bg: "bg-error-900" },
  { step: "950", hex: "#01190d", bg: "bg-error-950" },
];

const WARNING_SCALE = [
  { step: "25", hex: "#cee2ef", bg: "bg-warning-25" },
  { step: "50", hex: "#b5d4e6", bg: "bg-warning-50" },
  { step: "100", hex: "#84b8d6", bg: "bg-warning-100" },
  { step: "200", hex: "#529bc6", bg: "bg-warning-200" },
  { step: "300", hex: "#398dbd", bg: "bg-warning-300" },
  { step: "400", hex: "#217eb5", bg: "bg-warning-400" },
  { step: "500", hex: "#0870ad", bg: "bg-warning-500" },
  { step: "600", hex: "#07659c", bg: "bg-warning-600" },
  { step: "700", hex: "#064e79", bg: "bg-warning-700" },
  { step: "800", hex: "#054368", bg: "bg-warning-800" },
  { step: "900", hex: "#022234", bg: "bg-warning-900" },
  { step: "950", hex: "#010b11", bg: "bg-warning-950" },
];

const GRAY_SCALE = [
  { step: "25", hex: "#FCFCFD", bg: "bg-gray-25" },
  { step: "50", hex: "#F9FAFB", bg: "bg-gray-50" },
  { step: "100", hex: "#F2F4F7", bg: "bg-gray-100" },
  { step: "200", hex: "#E4E7EC", bg: "bg-gray-200" },
  { step: "300", hex: "#D0D5DD", bg: "bg-gray-300" },
  { step: "400", hex: "#98A2B3", bg: "bg-gray-400" },
  { step: "500", hex: "#667085", bg: "bg-gray-500" },
  { step: "600", hex: "#475467", bg: "bg-gray-600" },
  { step: "700", hex: "#344054", bg: "bg-gray-700" },
  { step: "800", hex: "#182230", bg: "bg-gray-800" },
  { step: "900", hex: "#101828", bg: "bg-gray-900" },
  { step: "950", hex: "#0C111D", bg: "bg-gray-950" },
];

const SOCIAL_ICONS = [
  {
    name: "Web",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-7 h-7"
        aria-hidden
      >
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fontFamily="inherit"
          fill="currentColor"
        >
          in
        </text>
      </svg>
    ),
  },
  {
    name: "X",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="w-6 h-6"
        aria-hidden
      >
        <path d="M5 5l14 14M19 5L5 19" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    svg: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-7 h-7"
        aria-hidden
      >
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const WEIGHTS = [
  { name: "Regular", value: "400", className: "font-normal" },
  { name: "Medium", value: "500", className: "font-medium" },
  { name: "Semibold", value: "600", className: "font-semibold" },
  { name: "Bold", value: "700", className: "font-bold" },
];

const DISPLAY_SIZES = [
  {
    name: "Display 2xl",
    className: "text-display-2xl",
    spec: "72px / 90px / -2%",
  },
  {
    name: "Display xl",
    className: "text-display-xl",
    spec: "60px / 72px / -2%",
  },
  {
    name: "Display lg",
    className: "text-display-lg",
    spec: "48px / 60px / -2%",
  },
  {
    name: "Display md",
    className: "text-display-md",
    spec: "36px / 44px / -2%",
  },
  { name: "Display sm", className: "text-display-sm", spec: "30px / 38px" },
  { name: "Display xs", className: "text-display-xs", spec: "24px / 32px" },
];

const TEXT_SIZES = [
  { name: "Text xl", className: "text-xl", spec: "20px / 30px" },
  { name: "Text lg", className: "text-lg", spec: "18px / 28px" },
  { name: "Text md", className: "text-md", spec: "16px / 24px" },
  { name: "Text sm", className: "text-sm", spec: "14px / 20px" },
  { name: "Text xs", className: "text-xs", spec: "12px / 18px" },
];

const RADII = [
  { name: "Radius-sm", value: "12px", className: "rounded-sm" },
  { name: "Radius-lg", value: "24px", className: "rounded-lg" },
  { name: "Radius-round", value: "60px", className: "rounded-round" },
];

function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  tone?: "light" | "dark";
}) {
  const titleColor = tone === "dark" ? "text-white" : "text-primary-500";
  const bodyColor = tone === "dark" ? "text-white/80" : "text-gray-600";
  const eyebrowColor = tone === "dark" ? "text-white/70" : "text-gray-500";
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p
          className={`text-xs uppercase tracking-[0.18em] font-medium mb-3 ${eyebrowColor}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-display-md font-bold ${titleColor}`}>
        {title}
      </h2>
      <p className={`text-md mt-3 ${bodyColor}`}>{description}</p>
    </div>
  );
}

function ColorScale({
  title,
  description,
  scale,
}: {
  title: string;
  description: string;
  scale: { step: string; hex: string; bg: string }[];
}) {
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12 items-start">
      <div>
        <h3 className="font-display text-display-xs font-semibold text-primary-500">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
        {scale.map((c) => (
          <div
            key={c.step}
            className="rounded-sm overflow-hidden border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <div className={`${c.bg} aspect-[4/3]`} />
            <div className="p-3">
              <p className="text-sm font-semibold text-primary-500">{c.step}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {c.hex}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="bg-white text-primary-500">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin pt-24 pb-20 border-b border-gray-100">
        <p className="text-sm font-medium tracking-[0.18em] uppercase text-gray-500">
          BPI · Brand System
        </p>
        <h1 className="font-display text-display-xl lg:text-display-2xl font-bold mt-6 max-w-4xl">
          Brand guidelines.
        </h1>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl">
          The foundation of the BPI product — colors, typography, spacing, and
          components that keep every screen feeling like one product.
        </p>
      </section>

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-display-xl font-bold">Logo</h2>
            <p className="text-md text-gray-600 mt-4 max-w-md">
              The BPI mark is the primary expression of the brand. Use it with
              clear space and never alter its proportions or color.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-sm h-55 flex items-center justify-center p-10">
              <Logo size={266} className="text-primary-500" />
            </div>
            <div className="bg-primary-500 rounded-sm h-55 flex items-center justify-center p-10">
              <Logo size={266} className="text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Iconography ──────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-display-xl font-bold">
              Iconography
            </h2>
            <p className="text-md text-gray-600 mt-4 max-w-md">
              Social and product icons share a single line weight and sit
              inside a dashed circular container that echoes the brand&rsquo;s
              playful frame.
            </p>
          </div>
          <div className="bg-base-green rounded-sm p-12 flex items-center justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-8 text-primary-500">
              {SOCIAL_ICONS.map((icon) => (
                <li key={icon.name}>
                  <span className="sr-only">{icon.name}</span>
                  <div className="relative w-20 h-20">
                    <svg
                      viewBox="0 0 80 80"
                      fill="none"
                      className="absolute inset-0 w-full h-full"
                      aria-hidden
                    >
                      <circle
                        cx="40"
                        cy="40"
                        r="38"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="4 5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {icon.svg}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Colors hero ──────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-display-xl font-bold">Colors</h2>
            <p className="text-md text-gray-600 mt-4 max-w-md">
              Colors define the visual identity of the product and help create
              consistency across screens.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-[420px]">
            {BASE_COLORS.map((c) => (
              <div
                key={c.name}
                className={`${c.bg} ${c.fg} rounded-sm relative h-full flex items-end p-5`}
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm opacity-80">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Color scales ─────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin pb-24 space-y-16">
        <ColorScale
          title="Primary"
          description="The brand color, used across all interactive elements such as buttons, links, and inputs."
          scale={PRIMARY_SCALE}
        />
        <ColorScale
          title="Error"
          description="Used across error states and destructive actions."
          scale={ERROR_SCALE}
        />
        <ColorScale
          title="Warning"
          description="Communicates that an action is potentially destructive or on hold."
          scale={WARNING_SCALE}
        />
        <ColorScale
          title="Gray"
          description="The neutral foundation — text, form fields, backgrounds, and dividers."
          scale={GRAY_SCALE}
        />
      </section>

      {/* ── Typography ───────────────────────────────────────────── */}
      <section className="bg-warning-500 text-white px-6 lg:px-margin py-24">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-display-xl font-bold">
              Typography
            </h2>
            <p className="text-md text-white/80 mt-4 max-w-md">
              Typography creates hierarchy, improves readability, and
              strengthens the overall visual identity.
            </p>
          </div>
          <div>
            <p className="text-md font-medium text-white/80">Albert Sans</p>
            <p className="font-display text-[180px] leading-none mt-2 mb-10">
              Aa
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {WEIGHTS.map((w) => (
                <div
                  key={w.value}
                  className="bg-white text-primary-500 rounded-sm px-5 py-4 flex items-center gap-5"
                >
                  <p
                    className={`font-display text-[44px] leading-none ${w.className}`}
                  >
                    Aa
                  </p>
                  <div>
                    <p className={`font-display text-md ${w.className}`}>
                      {w.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Font weight: {w.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Display scale ────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <SectionHeader
          eyebrow="Display · Albert Sans"
          title="Display scale"
          description="Use display sizes for marketing and section headlines. Letter spacing tightens by -2% from md and up."
        />
        <div className="mt-12 divide-y divide-gray-100">
          {DISPLAY_SIZES.map((s) => (
            <div
              key={s.name}
              className="grid lg:grid-cols-[200px_1fr_180px] gap-6 py-6 items-baseline"
            >
              <p className="text-sm text-gray-500 font-medium">{s.name}</p>
              <p className={`font-display font-semibold ${s.className}`}>
                Almost before we knew it.
              </p>
              <p className="text-sm text-gray-500">{s.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Body scale ───────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <SectionHeader
          eyebrow="Body · Inter"
          title="Body scale"
          description="Use text sizes for paragraphs, UI copy, labels, and inline content."
        />
        <div className="mt-12 divide-y divide-gray-100">
          {TEXT_SIZES.map((s) => (
            <div
              key={s.name}
              className="grid lg:grid-cols-[200px_1fr_180px] gap-6 py-6 items-baseline"
            >
              <p className="text-sm text-gray-500 font-medium">{s.name}</p>
              <p className={`font-sans ${s.className}`}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-sm text-gray-500">{s.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Buttons ──────────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <SectionHeader
          eyebrow="Components"
          title="Buttons"
          description="Primary buttons highlight the main action on a screen, while secondary and tertiary buttons support less important actions."
        />

        <div className="mt-12 space-y-6">
          {/* Primary · Green */}
          <div className="rounded-lg border border-gray-200 p-8">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Primary · Green
              </p>
              <p className="text-sm text-gray-500">
                Main CTA — one per screen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Initiate</Button>
              <Button>Sign up for newsletter</Button>
              <Button>
                Get in touch <ArrowRight />
              </Button>
              <Button iconOnly="lg" aria-label="Next">
                <ArrowRight />
              </Button>
              <Button iconOnly="xl" aria-label="Next">
                <ArrowRight />
              </Button>
            </div>
          </div>

          {/* Secondary · Light */}
          <div className="rounded-lg border border-gray-200 p-8 bg-gray-25">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Secondary · Light
              </p>
              <p className="text-sm text-gray-500">
                Supporting actions and card CTAs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" size="sm">
                Button CTA
              </Button>
              <Button variant="secondary">
                Why BPI <ArrowRight />
              </Button>
              <Button variant="secondary">
                View all <ArrowRight />
              </Button>
              <Button variant="secondary" iconOnly="sm" aria-label="Next">
                <ArrowRight className="size-3.5" />
              </Button>
              <Button variant="secondary" iconOnly="md" aria-label="Next">
                <ArrowRight />
              </Button>
            </div>
          </div>

          {/* Tertiary · Dashed */}
          <div className="rounded-lg border border-gray-200 p-8 bg-white">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tertiary · Dashed
              </p>
              <p className="text-sm text-gray-500">
                Quiet, ghosted CTAs — pairs alongside a primary.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="tertiary" size="sm">
                Learn more
              </Button>
              <Button variant="tertiary">Subscribe</Button>
              <Button variant="tertiary">
                Read the report <ArrowRight />
              </Button>
              <Button variant="tertiary" iconOnly="lg" aria-label="Next">
                <ArrowRight />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Often used next to a primary action — e.g. <em>Get in touch</em>{" "}
              alongside a dashed <em>Learn more</em>.
            </p>
          </div>

          {/* Tertiary · Dashed (light) */}
          <div className="rounded-lg border border-gray-200 p-8 bg-white">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Tertiary · Dashed (light)
              </p>
              <p className="text-sm text-gray-500">
                Quieter still — for low-emphasis or optional actions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="tertiary-light" size="sm">
                Learn more
              </Button>
              <Button variant="tertiary-light">Subscribe</Button>
              <Button variant="tertiary-light">
                Read the report <ArrowRight />
              </Button>
              <Button variant="tertiary-light" iconOnly="lg" aria-label="Next">
                <ArrowRight />
              </Button>
            </div>
          </div>

          {/* On dark */}
          <div className="rounded-lg p-8 bg-primary-500">
            <div className="flex items-baseline justify-between mb-6">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                On dark
              </p>
              <p className="text-sm text-white/60">
                Green primary, white-dashed tertiary, outline tertiary.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button>Sign up for newsletter</Button>
              <Button>
                Get started <ArrowRight />
              </Button>
              <Button variant="tertiary" onDark>
                Learn more <ArrowRight />
              </Button>
              <Button iconOnly="lg" aria-label="Next">
                <ArrowRight />
              </Button>
              <Button variant="tertiary" onDark iconOnly="lg" aria-label="Next">
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-primary-500">Primary</p>
            <p className="text-sm text-gray-600 mt-1">
              Green pill with primary text. The main action — one per screen.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-primary-500">Secondary</p>
            <p className="text-sm text-gray-600 mt-1">
              White pill with primary text. Sits alongside the primary.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-primary-500">Tertiary</p>
            <p className="text-sm text-gray-600 mt-1">
              Dashed-outline pills, or small icon-only round buttons on cards.
            </p>
          </div>
        </div>
      </section>

      {/* ── Forms ────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <SectionHeader
          eyebrow="Components"
          title="Forms"
          description="Inputs use the small radius, gray-300 borders, and shift to primary on focus. Errors lean on the green error scale."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-12">
          <form className="space-y-6">
            <Input
              id="firstname"
              type="text"
              label="First name"
              placeholder="First Name"
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="Email"
              helperText="We'll never share your email."
            />

            <Input
              id="password"
              type="password"
              label="Password — error state"
              defaultValue="••••••"
              errorText="Must be at least 8 characters."
            />

            <Select id="role" label="Role">
              <option>Engineer</option>
              <option>Designer</option>
              <option>Operator</option>
            </Select>

            <Textarea
              id="message"
              label="Message"
              placeholder="Write a short message…"
            />

            <Input
              id="disabled"
              label="Disabled"
              placeholder="Not available"
              disabled
            />

            <Input
              id="referral"
              type="text"
              variant="dashed"
              label="Referral code — dashed outline"
              placeholder="Optional"
            />

            <Input
              id="promo"
              type="text"
              variant="dashed-light"
              label="Promo code — dashed outline (light)"
              placeholder="Optional"
            />

            <Button>
              Submit <ArrowRight />
            </Button>
          </form>

          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Selection
              </p>
              <div className="space-y-3">
                <Checkbox defaultChecked label="Subscribe to product updates" />
                <Checkbox label="Send me invoices via email" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Radio
              </p>
              <div className="space-y-3">
                {["Monthly", "Quarterly", "Yearly"].map((opt, i) => (
                  <Radio
                    key={opt}
                    name="cadence"
                    defaultChecked={i === 0}
                    label={opt}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Toggle
              </p>
              <div className="space-y-3">
                <Toggle defaultChecked label="Two-factor authentication" />
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter — pill inputs on dark */}
        <div className="mt-12 rounded-lg bg-primary-500 p-8 lg:p-10">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-6 items-center">
            <div>
              <p className="font-display text-display-xs font-semibold text-white">
                Newsletter signup
              </p>
              <p className="text-sm text-white/70 mt-1">
                Pill inputs on dark — no border, white surface.
              </p>
            </div>
            <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
              <Input
                variant="pill-light"
                type="text"
                placeholder="First Name"
                aria-label="First name"
              />
              <Input
                variant="pill-light"
                type="email"
                placeholder="Email"
                aria-label="Email"
              />
              <Button>Sign up for newsletter</Button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Borders & Radius ─────────────────────────────────────── */}
      <section className="bg-error-500 text-primary-500 px-6 lg:px-margin py-24">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center">
          <div>
            <h2 className="font-display text-display-xl font-bold">
              Borders &amp; Radius
            </h2>
            <p className="text-md mt-4 max-w-md">
              Consistent radius values help create a more polished and unified
              design system.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5 items-end h-[420px]">
            {RADII.map((r, i) => (
              <div
                key={r.name}
                className={`bg-white ${r.className} flex flex-col justify-end p-5`}
                style={{
                  height: i === 0 ? "100%" : i === 1 ? "100%" : "55%",
                }}
              >
                <p className="font-semibold text-primary-500">{r.name}</p>
                <p className="text-sm text-gray-500">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid + Spacing ───────────────────────────────────────── */}
      <section className="bg-gray-50 px-6 lg:px-margin py-24">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <h2 className="font-display text-display-xl font-bold">
              Grid spacing
              <br />
              &amp; layout
            </h2>
            <p className="text-md text-gray-600 mt-4 max-w-md">
              Grids provide a framework for aligning content and maintaining
              consistency across layouts.
            </p>
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt className="text-gray-500">Page margin</dt>
                <dd className="font-medium text-primary-500">120px</dd>
              </div>
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt className="text-gray-500">Column width</dt>
                <dd className="font-medium text-primary-500">84px</dd>
              </div>
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt className="text-gray-500">Gutter</dt>
                <dd className="font-medium text-primary-500">24px</dd>
              </div>
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt className="text-gray-500">Inner spacing</dt>
                <dd className="font-medium text-primary-500">12px</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            {/* 12-column grid */}
            <div className="bg-white rounded-sm p-3 border border-gray-200">
              <div className="grid grid-cols-12 gap-[6px] h-[200px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-error-100 rounded-[4px]"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                12 columns · 24px gutter · 120px page margin
              </p>
            </div>

            {/* Stacked rows */}
            <div className="bg-white rounded-sm p-3 border border-gray-200">
              <div className="space-y-[12px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-error-100 rounded-[4px] h-7"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Stack · 12px between rows
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shapes ───────────────────────────────────────────────── */}
      <section className="px-6 lg:px-margin py-24 border-b border-gray-100">
        <SectionHeader
          eyebrow="Components"
          title="Shapes"
          description="Organic SVG shapes built from the brand palette. They live as React components so spacing, color, and interaction stay consistent."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          {/* Light context */}
          <div className="rounded-lg border border-gray-200 bg-error-25 p-10 flex flex-col items-start gap-8">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Hamburger menu
              </p>
              <p className="text-md text-primary-500 mt-2 max-w-sm">
                Navigation trigger. The blob ties the icon to the brand
                language; the lines stay primary blue for legibility.
              </p>
            </div>
            <HamburgerMenu size={240} />
            <div className="flex items-center gap-6">
              <HamburgerMenu size={120} />
              <HamburgerMenu size={80} />
              <HamburgerMenu size={56} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 w-full text-sm text-gray-600">
              <div>
                <p className="font-semibold text-primary-500">Default</p>
                <p>Green blob, primary lines.</p>
              </div>
              <div>
                <p className="font-semibold text-primary-500">Hover</p>
                <p>Blob darkens to error-400.</p>
              </div>
              <div>
                <p className="font-semibold text-primary-500">Pressed</p>
                <p>Whole control scales to 0.97.</p>
              </div>
            </div>
          </div>

          {/* Dark context */}
          <div className="rounded-lg bg-primary-500 p-10 flex flex-col items-start gap-8">
            <div>
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                On dark
              </p>
              <p className="text-md text-white mt-2 max-w-sm">
                The same component holds against the deep blue with no extra
                styling — the green blob carries the contrast.
              </p>
            </div>
            <HamburgerMenu size={240} />
            <div className="flex items-center gap-6">
              <HamburgerMenu size={120} />
              <HamburgerMenu size={80} />
              <HamburgerMenu size={56} />
            </div>
            <div className="text-sm text-white/70 max-w-md">
              Usage: drop directly into the header or a nav bar.{" "}
              <code className="font-mono text-error-500">
                {"<HamburgerMenu size={96} onClick={open} />"}
              </code>
            </div>
          </div>
        </div>

        {/* ── Brand shapes library ─────────────────────────────── */}
        <div className="mt-20 mb-8">
          <h3 className="font-display text-display-xs font-semibold text-primary-500">
            Brand shapes library
          </h3>
          <p className="text-md text-gray-600 mt-3 max-w-2xl">
            Pre-built SVG primitives for the recurring shapes across the BPI
            experience. Each accepts a{" "}
            <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">
              size
            </code>{" "}
            prop, and most accept either a{" "}
            <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">
              fill
            </code>{" "}
            color or an{" "}
            <code className="font-mono text-sm bg-gray-100 px-1.5 py-0.5 rounded">
              imageSrc
            </code>{" "}
            to fill the shape with an image.
          </p>
        </div>

        <div className="space-y-6">
          {/* LogoShape */}
          <div className="rounded-lg p-10 bg-primary-500">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wide">
                LogoShape
              </p>
              <code className="font-mono text-xs text-white/50">
                size · fill
              </code>
            </div>
            <p className="text-md text-white/80 mb-8 max-w-md">
              The BPI brandmark with the green-to-white gradient. Pass a{" "}
              <code className="font-mono text-sm">fill</code> to override with a
              solid color.
            </p>
            <div className="flex items-center justify-center">
              <LogoShape size={520} />
            </div>
            <code className="block mt-6 font-mono text-xs text-white/50">
              {"<LogoShape size={520} />"}
            </code>
          </div>

          {/* BlogPostShape + InitiativesShape — paired */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-200 p-8 bg-gray-50">
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  BlogPostShape
                </p>
                <code className="font-mono text-xs text-gray-400">
                  size · fill
                </code>
              </div>
              <p className="text-md text-primary-500 mb-6 max-w-md">
                Card frame for content tiles. The notch in the bottom-right
                makes room for an action button.
              </p>
              <div className="flex items-end justify-center gap-4 min-h-60">
                <BlogPostShape size={140} />
                <BlogPostShape size={140} fill="#000036" />
                <BlogPostShape size={140} fill="#06fe83" />
              </div>
              <code className="block mt-4 font-mono text-xs text-gray-500">
                {'<BlogPostShape size={200} fill="#06fe83" />'}
              </code>
            </div>

            <div className="rounded-lg border border-gray-200 p-8 bg-warning-100">
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  InitiativesShape
                </p>
                <code className="font-mono text-xs text-gray-400">
                  size · fill · imageSrc
                </code>
              </div>
              <p className="text-md text-primary-500 mb-6 max-w-md">
                Vertical card used in the Initiatives module. Pass{" "}
                <code className="font-mono text-sm">imageSrc</code> to fill the
                shape with a clipped image.
              </p>
              <div className="flex items-end justify-center gap-4 min-h-60">
                <InitiativesShape size={120} />
                <InitiativesShape size={120} fill="#000036" />
                <InitiativesShape size={120} fill="#06fe83" />
              </div>
              <code className="block mt-4 font-mono text-xs text-gray-500">
                {'<InitiativesShape size={200} imageSrc="/photo.jpg" />'}
              </code>
            </div>
          </div>

          {/* FooterShape */}
          <div className="rounded-lg border border-gray-200 p-8 bg-white">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                FooterShape
              </p>
              <code className="font-mono text-xs text-gray-400">
                size · fill · children
              </code>
            </div>
            <p className="text-md text-primary-500 mb-6 max-w-md">
              Wide horizontal band used for footer panels and CTAs. The notch
              hosts a circular button.
            </p>
            <div className="flex items-center justify-center overflow-hidden">
              <FooterShape size={720} />
            </div>
            <code className="block mt-4 font-mono text-xs text-gray-500">
              {'<FooterShape size={1090} fill="#ABE8FE" />'}
            </code>
          </div>

          {/* FooterImageShape */}
          <div className="rounded-lg border border-gray-200 p-8 bg-white">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                FooterImageShape
              </p>
              <code className="font-mono text-xs text-gray-400">
                size · fill · imageSrc
              </code>
            </div>
            <p className="text-md text-primary-500 mb-6 max-w-md">
              Two-piece footer frame — a top banner plus a larger bottom panel
              joined by a notched divider. Pass{" "}
              <code className="font-mono text-sm">imageSrc</code> to fill both
              pieces with one image.
            </p>
            <div className="flex items-center justify-center overflow-hidden">
              <FooterImageShape size={760} />
            </div>
            <code className="block mt-4 font-mono text-xs text-gray-500">
              {'<FooterImageShape size={1245} imageSrc="/team.jpg" />'}
            </code>
          </div>

          {/* HeroShape1 */}
          <div className="rounded-lg border border-gray-200 p-8 bg-error-100">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                HeroShape1
              </p>
              <code className="font-mono text-xs text-gray-400">
                size · fill · fillOpacity
              </code>
            </div>
            <p className="text-md text-primary-500 mb-6 max-w-md">
              Dark overlay layered over the hero image. The two top notches
              frame the logo and the navigation pill.
            </p>
            <div className="flex items-center justify-center overflow-hidden">
              <HeroShape1 size={680} />
            </div>
            <code className="block mt-4 font-mono text-xs text-gray-500">
              {"<HeroShape1 size={1414} fillOpacity={0.5} />"}
            </code>
          </div>

          {/* HeroImage2Shape */}
          <div className="rounded-lg border border-gray-200 p-8 bg-error-100">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                HeroImage2Shape
              </p>
              <code className="font-mono text-xs text-gray-400">
                size · fill · fillOpacity
              </code>
            </div>
            <p className="text-md text-primary-500 mb-6 max-w-md">
              Variant hero overlay with a single notch at the top-right — used
              for inner pages and secondary heroes.
            </p>
            <div className="flex items-center justify-center overflow-hidden">
              <HeroImage2Shape size={680} />
            </div>
            <code className="block mt-4 font-mono text-xs text-gray-500">
              {'<HeroImage2Shape size={1412} fill="#000036" />'}
            </code>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="px-6 lg:px-margin py-10 border-t border-gray-100">
        <p className="text-sm text-gray-500">© 2026 BPI · Brand system</p>
      </footer>
    </main>
  );
}

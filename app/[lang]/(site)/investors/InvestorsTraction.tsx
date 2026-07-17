import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type { InvestorRole } from "@/sanity/lib/types";

/**
 * "Traction" — an eyebrow over a large italic heading on the left, with a
 * stacked list of named projects (title + description) on the right.
 */
export default function InvestorsTraction({
  eyebrow,
  heading,
  items,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  items?: InvestorRole[] | null;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left — eyebrow + italic heading. */}
        <div className="flex flex-col gap-6">
          {eyebrow ? (
            <Reveal
              as="span"
              className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-primary-500/50"
            >
              {eyebrow}
            </Reveal>
          ) : null}
          {heading ? (
            <Reveal
              as="p"
              className="max-w-md font-display text-3xl md:text-4xl lg:text-5xl italic text-primary-500 leading-[1.15] tracking-[-0.02em]"
            >
              {heading}
            </Reveal>
          ) : null}
        </div>

        {/* Right — project list. */}
        {items?.length ? (
          <Stagger className="flex flex-col gap-7 md:gap-8">
            {items.map((item, i) => (
              <StaggerItem
                key={`${item.label ?? "project"}-${i}`}
                className="flex flex-col gap-1.5"
              >
                <h3 className="text-sm md:text-base font-bold text-primary-500 leading-snug">
                  {item.label}
                </h3>
                <p className="text-xs md:text-sm text-primary-500/70 leading-relaxed">
                  {item.description}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}
      </div>
    </section>
  );
}

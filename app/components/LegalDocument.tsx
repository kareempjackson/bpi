// Shared layout for the site's legal pages (Terms, Privacy). A compact dark
// hero with the document title + last-updated date, then a readable, numbered
// body of sections on the light background.

import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Stagger, StaggerItem } from "@/app/components/motion";

export type LegalSection = {
  heading: string;
  /** One or more body paragraphs. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
};

export default function LegalDocument({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="relative bg-error-25">
      {/* Hero */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-20 lg:pb-24"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />
        <div className="relative mx-auto w-full max-w-page">
          <Stagger
            as="h1"
            className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-white leading-[1.02] tracking-[-0.03em] max-w-3xl"
          >
            {title}
          </Stagger>
          <Stagger
            as="p"
            className="mt-5 text-sm md:text-base text-white/60"
          >
            Last updated: {lastUpdated}
          </Stagger>
        </div>
      </section>

      {/* Body */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-24"
      >
        <div className="mx-auto w-full max-w-3xl">
          <Stagger
            as="p"
            className="text-lg md:text-xl text-primary-500 leading-[1.6]"
          >
            {intro}
          </Stagger>

          <div className="mt-12 lg:mt-16 flex flex-col gap-10 lg:gap-12">
            {sections.map((section, i) => (
              <Stagger key={section.heading}>
                <StaggerItem
                  as="h2"
                  className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em]"
                >
                  {i + 1}. {section.heading}
                </StaggerItem>
                <StaggerItem className="mt-3 flex flex-col gap-4">
                  {section.body.map((para, j) => (
                    <p
                      key={j}
                      className="text-base lg:text-lg text-primary-500/80 leading-[1.75]"
                    >
                      {para}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="flex flex-col gap-2.5 list-disc list-outside pl-6 marker:text-primary-500/50 text-base lg:text-lg text-primary-500/80 leading-[1.75]">
                      {section.bullets.map((b, k) => (
                        <li key={k} className="pl-1">
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </StaggerItem>
              </Stagger>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

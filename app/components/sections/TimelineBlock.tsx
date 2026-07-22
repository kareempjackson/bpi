import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { plainText } from "@/app/lib/plainText";
import type { InvestorRole } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `timelineBlock`. Framed by the Zone. A heading
 * over an ordered vertical timeline — each step is a connector dot on an
 * auto-numbered rail with a label and description (shared `investorRole`
 * model). Server component: purely presentational, no client state.
 */
export default function TimelineBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  // Coerce step label/description to plain text — build-safe if a field is
  // switched to WYSIWYG (Portable Text) in Sanity.
  const steps = ((block.steps as InvestorRole[] | null) ?? []).map((s) => ({
    ...s,
    label: plainText(s.label),
    description: plainText(s.description),
  }));

  if (!steps.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading ? (
        <Reveal className="mb-10 max-w-2xl lg:mb-14">
          <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
        </Reveal>
      ) : null}

      {steps.length ? (
        <Stagger className="mx-auto max-w-3xl">
          {steps.map((step, i) => (
            <StaggerItem
              key={`${step.label ?? "step"}-${i}`}
              className="grid grid-cols-[auto_1fr] gap-5 pb-10 last:pb-0 md:gap-8"
            >
              {/* Numbered dot + connector rail down to the next step. */}
              <div className="relative flex flex-col items-center">
                <span className="type-label relative z-10 grid h-11 w-11 place-items-center rounded-full border border-primary-500/15 bg-error-25 text-primary-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-11 bottom-0 w-px bg-primary-500/15"
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5 pt-1.5">
                {step.label ? (
                  <h3 className="type-card-heading text-primary-500">
                    {step.label}
                  </h3>
                ) : null}
                {step.description ? (
                  <p className="type-body text-primary-500/70">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}
    </div>
  );
}

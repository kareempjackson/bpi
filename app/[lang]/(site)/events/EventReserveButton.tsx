"use client";

import {
  checkoutTriggerId,
  useEventbriteCheckout,
} from "@/app/components/EventbriteCheckout";

/**
 * Reserve / register CTA for the event detail page. Opens Eventbrite's embedded
 * checkout modal (via the shared widget hook); falls back to the Eventbrite
 * page link when the widget can't load or JS is off.
 */
export default function EventReserveButton({
  eventbriteId,
  eventbriteUrl,
  label = "Reserve Spot",
  soldOut = false,
}: {
  eventbriteId?: string | null;
  eventbriteUrl?: string | null;
  label?: string;
  soldOut?: boolean;
}) {
  useEventbriteCheckout(eventbriteId ? [eventbriteId] : []);

  if (!eventbriteId && !eventbriteUrl) return null;

  if (soldOut) {
    return (
      <span className="inline-flex w-fit items-center rounded-round bg-primary-500/10 px-6 py-2.5 text-sm lg:text-base font-semibold text-primary-500/60">
        Sold Out
      </span>
    );
  }

  return (
    <a
      id={eventbriteId ? checkoutTriggerId(eventbriteId) : undefined}
      href={eventbriteUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[var(--ease-premium)] hover:bg-error-400 active:scale-[0.98] motion-reduce:transform-none"
    >
      {label}
    </a>
  );
}

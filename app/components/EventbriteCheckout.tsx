"use client";

import { useEffect } from "react";

const WIDGET_SRC = "https://www.eventbrite.com/static/widgets/eb_widgets.js";

/** Trigger element id convention shared with the Register button markup. */
export function checkoutTriggerId(eventbriteId: string): string {
  return `eb-trigger-${eventbriteId}`;
}

type EBWidgets = {
  createWidget: (opts: {
    widgetType: "checkout";
    eventId: string;
    modal: true;
    modalTriggerElementId: string;
    onOrderComplete?: () => void;
  }) => void;
};

declare global {
  interface Window {
    EBWidgets?: EBWidgets;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Inject Eventbrite's widget script once; resolve when `EBWidgets` is ready. */
function loadWidgetScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.EBWidgets) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Binds Eventbrite's embedded checkout modal to Register buttons.
 *
 * Each event id must have a trigger element with id `checkoutTriggerId(id)`
 * (e.g. the Register button). Clicking it opens Eventbrite's checkout in a
 * modal over the current page. If the script fails to load or JS is disabled,
 * the buttons should carry an `href` to the Eventbrite page as a fallback.
 *
 * Re-runs whenever the set of visible event ids changes (e.g. after filtering).
 */
export function useEventbriteCheckout(eventbriteIds: string[]): void {
  // Stable dependency: order-independent join of the ids.
  const key = [...eventbriteIds].sort().join(",");

  useEffect(() => {
    if (eventbriteIds.length === 0) return;
    let cancelled = false;

    loadWidgetScript()
      .then(() => {
        if (cancelled || !window.EBWidgets) return;
        for (const eventId of eventbriteIds) {
          // Only wire ids whose trigger is actually in the DOM.
          if (!document.getElementById(checkoutTriggerId(eventId))) continue;
          window.EBWidgets.createWidget({
            widgetType: "checkout",
            eventId,
            modal: true,
            modalTriggerElementId: checkoutTriggerId(eventId),
          });
        }
      })
      .catch(() => {
        // Swallow — the Register buttons fall back to their href.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

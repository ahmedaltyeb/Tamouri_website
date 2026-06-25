// Client-side analytics utility.
// All functions are fire-and-forget: they never block the UI.

export type AnalyticsEventName =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "purchase_completed";

export interface TrackPayload {
  event: AnalyticsEventName;
  productId?: string;
  metadata?: Record<string, unknown>;
}

// ── Session ID ────────────────────────────────────────────────────────────────
// Persisted in sessionStorage so events within one browser tab share an ID.
// A new tab / new session gets a new ID automatically.

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "tamouri_sid";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// ── Core sender ───────────────────────────────────────────────────────────────

/**
 * Send an analytics event to the backend.
 * Uses `navigator.sendBeacon` when available (works on page unload),
 * falls back to a non-awaited `fetch`.
 *
 * Never throws — any failure is silently swallowed.
 */
export function track(
  event: AnalyticsEventName,
  options: Omit<TrackPayload, "event"> = {}
): void {
  if (typeof window === "undefined") return; // SSR guard

  const body = JSON.stringify({
    event,
    sessionId: getSessionId(),
    productId: options.productId,
    metadata: options.metadata ?? {},
  });

  const url = "/api/analytics/track";

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      // fire-and-forget fetch — intentionally not awaited
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // never throw — analytics must not break the UI
  }
}

"use client";
import { useEffect, useCallback } from "react";
import { track, type AnalyticsEventName } from "@/lib/analytics/track";

// ── Generic hook ──────────────────────────────────────────────────────────────

export function useAnalytics() {
  const trackEvent = useCallback(
    (event: AnalyticsEventName, options: { productId?: string; metadata?: Record<string, unknown> } = {}) => {
      track(event, options);
    },
    []
  );
  return { trackEvent };
}

// ── Auto page-view tracker ────────────────────────────────────────────────────

export function usePageView(metadata?: Record<string, unknown>) {
  useEffect(() => {
    track("page_view", { metadata: { path: window.location.pathname, ...metadata } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once per mount — intentional
}

// ── Auto product-view tracker ─────────────────────────────────────────────────

export function useProductView(productId: string, metadata?: Record<string, unknown>) {
  useEffect(() => {
    if (!productId) return;
    track("product_view", {
      productId,
      metadata: { path: window.location.pathname, ...metadata },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // re-fires if productId changes (navigation between products)
}

// ── Add-to-cart wrapper ───────────────────────────────────────────────────────

export function useTrackAddToCart() {
  return useCallback(
    (productId: string, extra?: Record<string, unknown>) => {
      track("add_to_cart", { productId, metadata: extra });
    },
    []
  );
}

// ── Checkout-start tracker ────────────────────────────────────────────────────

export function useCheckoutStart() {
  useEffect(() => {
    track("checkout_start", { metadata: { path: window.location.pathname } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

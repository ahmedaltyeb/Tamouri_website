"use client";

// global-error.tsx catches errors thrown inside the root layout itself
// (e.g. getSiteSettings() throws, provider crashes, theme CSS generation fails).
// Because the root layout has errored, this component must provide its own
// <html> and <body> — no providers, no theme tokens, no Tailwind custom colors.
// Intentionally minimal: inline styles only, no dependency on theme system.

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FAF8F5" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            {/* Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#FEF2F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#6B3A2A", marginBottom: "0.75rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#78716C", marginBottom: "0.5rem" }}>
              The application encountered a critical error and could not load.
            </p>
            <p style={{ color: "#A8A29E", fontSize: "0.875rem", marginBottom: "2rem", direction: "rtl" }}>
              حدث خطأ حرج. يرجى المحاولة مجدداً.
            </p>

            {process.env.NODE_ENV === "development" && error.message && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#A8A29E",
                  fontFamily: "monospace",
                  background: "#F5F5F4",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "2rem",
                  textAlign: "left",
                  wordBreak: "break-all",
                }}
              >
                {error.message}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  background: "#C49A3C",
                  color: "#fff",
                  border: "none",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  border: "2px solid #8B5E3C",
                  color: "#8B5E3C",
                  background: "transparent",
                  padding: "0.875rem 2rem",
                  borderRadius: "0.75rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "مربع الغربية للتمور — Marbea Al Gharbeya Dates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colour tokens (mirrors globals.css :root defaults)
const GOLD        = "#C49A3C";
const GOLD_LIGHT  = "#D4AE5C";
const GOLD_PALE   = "#F5D98A";
const BROWN       = "#8B5E3C";
const BROWN_DARK  = "#6B4423";
const CREAM       = "#FAF8F5";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif",
          overflow: "hidden",
          position: "relative",
          background: CREAM,
        }}
      >
        {/* ── Left panel — rich gradient background ── */}
        <div
          style={{
            width: "520px",
            height: "630px",
            background: `linear-gradient(145deg, ${BROWN_DARK} 0%, ${BROWN} 45%, ${GOLD} 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: "-80px", left: "-80px",
            width: "300px", height: "300px", borderRadius: "50%",
            border: `2px solid ${GOLD_LIGHT}`, opacity: 0.2, display: "flex",
          }}/>
          <div style={{
            position: "absolute", bottom: "-60px", right: "-60px",
            width: "240px", height: "240px", borderRadius: "50%",
            border: `2px solid ${GOLD_LIGHT}`, opacity: 0.15, display: "flex",
          }}/>

          {/* Logo mark — rounded square with palm SVG embedded as inline SVG-in-img */}
          <div style={{
            width: "140px", height: "140px", borderRadius: "32px",
            background: `linear-gradient(135deg, ${BROWN} 0%, ${GOLD} 100%)`,
            border: `3px solid ${GOLD_PALE}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
          }}>
            {/* Inline palm icon — simplified SVG paths as JSX */}
            <svg
              width="90" height="90"
              viewBox="0 0 512 512"
              style={{ display: "flex" }}
            >
              {/* Trunk */}
              <path d="M237 480 L275 480 L268 248 L244 248 Z" fill={GOLD_PALE}/>
              {/* Crown */}
              <ellipse cx="256" cy="248" rx="28" ry="16" fill={GOLD_PALE}/>
              {/* Frond up */}
              <path d="M256 248 C252 210 248 180 244 132 C248 150 254 175 256 248Z" fill={GOLD_PALE}/>
              <path d="M256 248 C260 210 264 180 268 132 C264 150 258 175 256 248Z" fill={GOLD_PALE} opacity="0.85"/>
              {/* Fronds upper left/right */}
              <path d="M248 242 C230 208 210 185 172 152 C196 172 220 198 248 242Z" fill={GOLD_PALE}/>
              <path d="M264 242 C282 208 302 185 340 152 C316 172 292 198 264 242Z" fill={GOLD_PALE}/>
              {/* Fronds mid left/right */}
              <path d="M244 250 C218 228 194 216 148 208 C174 214 208 228 244 250Z" fill={GOLD_PALE}/>
              <path d="M268 250 C294 228 318 216 364 208 C338 214 304 228 268 250Z" fill={GOLD_PALE}/>
              {/* Fronds drooping */}
              <path d="M244 256 C214 254 186 264 148 288 C176 270 214 260 244 256Z" fill={GOLD_PALE} opacity="0.8"/>
              <path d="M268 256 C298 254 326 264 364 288 C336 270 298 260 268 256Z" fill={GOLD_PALE} opacity="0.8"/>
              {/* Date clusters */}
              <ellipse cx="188" cy="215" rx="14" ry="10" fill={GOLD}/>
              <ellipse cx="324" cy="215" rx="14" ry="10" fill={GOLD}/>
              <ellipse cx="216" cy="170" rx="12" ry="8" fill={GOLD}/>
              <ellipse cx="296" cy="170" rx="12" ry="8" fill={GOLD}/>
            </svg>
          </div>

          {/* Arabic brand name */}
          <div style={{
            color: GOLD_PALE,
            fontSize: "38px",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.2,
            direction: "rtl",
            letterSpacing: "0.5px",
          }}>
            مربع الغربية
          </div>

          {/* Gold divider */}
          <div style={{
            width: "80px", height: "2px",
            background: `linear-gradient(90deg, transparent, ${GOLD_LIGHT}, transparent)`,
            margin: "14px 0",
            display: "flex",
          }}/>

          {/* Arabic tagline */}
          <div style={{
            color: GOLD_LIGHT,
            fontSize: "20px",
            fontWeight: 600,
            textAlign: "center",
            direction: "rtl",
            opacity: 0.9,
          }}>
            للتمور والقهوة العربية
          </div>
        </div>

        {/* ── Right panel — cream with text content ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 60px 56px 52px",
            position: "relative",
            background: CREAM,
          }}
        >
          {/* Decorative gold corner accent */}
          <div style={{
            position: "absolute", top: "0", right: "0",
            width: "120px", height: "120px",
            background: `linear-gradient(225deg, ${GOLD}22 0%, transparent 70%)`,
            display: "flex",
          }}/>
          <div style={{
            position: "absolute", bottom: "0", left: "0",
            width: "100px", height: "100px",
            background: `linear-gradient(45deg, ${BROWN}18 0%, transparent 70%)`,
            display: "flex",
          }}/>

          {/* UAE flag dot — subtle authenticity marker */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "20px",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: GOLD,
              display: "flex",
            }}/>
            <div style={{
              color: GOLD,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}>
              UAE • أبوظبي
            </div>
          </div>

          {/* English headline */}
          <div style={{
            color: BROWN_DARK,
            fontSize: "46px",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "18px",
            letterSpacing: "-0.5px",
          }}>
            Premium UAE Dates
            <br/>
            &amp; Arabic Coffee
          </div>

          {/* Gold divider */}
          <div style={{
            width: "64px", height: "3px",
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
            borderRadius: "2px",
            marginBottom: "20px",
            display: "flex",
          }}/>

          {/* Description */}
          <div style={{
            color: "#5C4A38",
            fontSize: "19px",
            lineHeight: 1.6,
            marginBottom: "32px",
            maxWidth: "480px",
          }}>
            Authentic Emirati hospitality gifts — dates, saffron,
            Arabic coffee &amp; tea. Delivered across the UAE.
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["🌴 Premium Dates", "☕ Arabic Coffee", "🚚 Free Delivery"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: `${GOLD}18`,
                  border: `1.5px solid ${GOLD}55`,
                  color: BROWN,
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Domain watermark */}
          <div style={{
            position: "absolute",
            bottom: "28px", right: "52px",
            color: GOLD,
            fontSize: "14px",
            fontWeight: 600,
            opacity: 0.6,
          }}>
            marbeaalgharbeya.ae
          </div>
        </div>

        {/* ── Vertical gold separator line ── */}
        <div style={{
          position: "absolute",
          left: "520px", top: "40px", bottom: "40px",
          width: "2px",
          background: `linear-gradient(180deg, transparent, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_LIGHT}, transparent)`,
          opacity: 0.5,
          display: "flex",
        }}/>
      </div>
    ),
    {
      ...size,
      headers: {
        // Cache the OG image for 7 days on CDN
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    },
  );
}

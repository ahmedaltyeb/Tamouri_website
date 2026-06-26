"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Period = 7 | 30 | 90;

interface ChartData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

type View = "revenue" | "orders";

const PERIODS: { label: string; value: Period }[] = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function formatDate(iso: string, short = false): string {
  const d = new Date(iso + "T00:00:00Z");
  if (short) return d.toLocaleDateString("en-AE", { month: "short", day: "numeric", timeZone: "UTC" });
  return d.toLocaleDateString("en-AE", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}


export default function SalesChart() {
  const [period, setPeriod] = useState<Period>(30);
  const [view, setView] = useState<View>("revenue");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setLoading(true);
    setTooltip(null);
    fetch(`/api/admin/dashboard/sales-chart?days=${period}`)
      .then((r) => r.json())
      .then((d: ChartData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const W = 800, H = 220, PAD = 24;

  const series = data ? (view === "revenue" ? data.revenue : data.orders) : [];
  const max = series.length > 0 ? Math.max(...series, 1) : 1;

  const pts = series.map((v, i) => ({
    x: PAD + (i / (series.length - 1 || 1)) * (W - 2 * PAD),
    y: PAD + (1 - v / max) * (H - 2 * PAD),
    v,
    label: data?.labels[i] ?? "",
  }));

  // Smooth bezier path
  let linePath = "";
  let areaPath = "";
  if (pts.length > 1) {
    linePath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      linePath += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    areaPath = linePath + ` L ${pts[pts.length - 1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;
  }

  // Y-axis labels (4 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD + (1 - f) * (H - 2 * PAD),
    label: view === "revenue"
      ? `${Math.round(max * f).toLocaleString("en-AE")} AED`
      : String(Math.round(max * f)),
  }));

  // X-axis label density: show every Nth label
  const xStep = Math.ceil(pts.length / (period <= 7 ? 7 : period <= 30 ? 10 : 12));

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || pts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - mx);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setTooltip({ x: pts[closest].x, y: pts[closest].y, idx: closest });
  }, [pts]);

  // Totals
  const total = series.reduce((a, b) => a + b, 0);
  const prevHalf = series.slice(0, Math.floor(series.length / 2)).reduce((a, b) => a + b, 0);
  const currHalf = series.slice(Math.floor(series.length / 2)).reduce((a, b) => a + b, 0);
  const trend = prevHalf > 0 ? ((currHalf - prevHalf) / prevHalf) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-stone-800">Sales Analytics</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {loading ? "Loading…" : view === "revenue"
              ? `${total.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED total`
              : `${total} orders total`}
            {!loading && Math.abs(trend) > 0.5 && (
              <span className={`ml-2 font-semibold ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5">
            {(["revenue", "orders"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${view === v ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                {v === "revenue" ? "Revenue" : "Orders"}
              </button>
            ))}
          </div>
          {/* Period */}
          <div className="flex bg-stone-100 rounded-lg p-0.5 gap-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${period === p.value ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative"
        onMouseLeave={() => setTooltip(null)}
      >
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-stone-400">Loading chart…</span>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-[220px] overflow-visible"
            onMouseMove={handleMouseMove}
            style={{ cursor: "crosshair" }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y gridlines */}
            {yTicks.map((t, i) => (
              <g key={i}>
                <line x1={PAD} y1={t.y} x2={W - PAD} y2={t.y} stroke="#f5f0eb" strokeWidth="1" />
                <text x={PAD - 4} y={t.y + 4} fontSize="9" textAnchor="end" fill="#a8a29e">
                  {t.label}
                </text>
              </g>
            ))}

            {/* X axis labels */}
            {pts.filter((_, i) => i % xStep === 0).map((p) => (
              <text key={p.label} x={p.x} y={H - 4} fontSize="9" textAnchor="middle" fill="#a8a29e">
                {formatDate(p.label, true)}
              </text>
            ))}

            {/* Area */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Line */}
            {linePath && (
              <path d={linePath} fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Hover vertical line */}
            {tooltip && (
              <line
                x1={tooltip.x} y1={PAD}
                x2={tooltip.x} y2={H - PAD}
                stroke="#d97706" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"
              />
            )}

            {/* Hover dot */}
            {tooltip && (
              <>
                <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="white" stroke="#d97706" strokeWidth="2" />
                <circle cx={tooltip.x} cy={tooltip.y} r="3" fill="#d97706" />
              </>
            )}

            {/* Zero line */}
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e7e5e4" strokeWidth="1" />
          </svg>
        )}

        {/* Tooltip box */}
        {tooltip && data && !loading && (() => {
          const idx = tooltip.idx;
          const v = series[idx];
          const label = data.labels[idx];
          const tipW = 150;
          // keep within SVG bounds
          const svgW = svgRef.current?.getBoundingClientRect().width ?? W;
          const tipPct = tooltip.x / W;
          const tipLeft = tipPct > 0.7 ? "auto" : `${(tipPct * 100).toFixed(1)}%`;
          const tipRight = tipPct > 0.7 ? `${((1 - tipPct) * 100).toFixed(1)}%` : "auto";
          return (
            <div
              className="absolute top-0 pointer-events-none bg-stone-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg z-10 min-w-[130px]"
              style={{ left: tipLeft, right: tipRight, transform: "translateX(8px)" }}
            >
              <p className="text-stone-400 mb-1">{formatDate(label)}</p>
              <p className="font-bold text-white">
                {view === "revenue"
                  ? `${v.toLocaleString("en-AE", { maximumFractionDigits: 0 })} AED`
                  : `${v} ${v === 1 ? "order" : "orders"}`}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

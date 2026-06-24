import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseMLText } from "@/lib/products";
import * as XLSX from "xlsx";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type Product = {
  id: string;
  sku: string | null;
  name: unknown;        // Prisma Json
  description: unknown; // Prisma Json
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  inStock: boolean;
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

function buildProductRow(p: Product) {
  const name = parseMLText(p.name);
  const desc = parseMLText(p.description);
  return {
    ID: p.id,
    SKU: p.sku ?? "",
    "Name (EN)": name.en,
    "Name (AR)": name.ar,
    "Description (EN)": desc.en,
    "Description (AR)": desc.ar,
    Category: p.category,
    "Category Slug": p.categorySlug,
    Price: p.price,
    "Original Price": p.originalPrice ?? "",
    Stock: p.stock,
    "In Stock": p.inStock ? "Yes" : "No",
    Badge: p.badge ?? "",
    Rating: p.rating,
    Reviews: p.reviews,
    "Primary Image": p.image,
    "All Images": p.images.join("|"),
    "Created At": p.createdAt.toISOString(),
    "Updated At": p.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "xlsx";
  const category = searchParams.get("category") || "";
  const inStockFilter = searchParams.get("inStock") || "all";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};
  if (category && category !== "all") where.categorySlug = category;
  if (inStockFilter === "true") where.inStock = true;
  if (inStockFilter === "false") where.inStock = false;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
    };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, sku: true, name: true, description: true,
      category: true, categorySlug: true, price: true,
      originalPrice: true, badge: true, inStock: true,
      stock: true, rating: true, reviews: true,
      image: true, images: true, createdAt: true, updatedAt: true,
    },
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `products-export-${timestamp}`;

  if (format === "csv") {
    const rows = products.map(buildProductRow);
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const rows = products.map((p) => {
      const name = parseMLText(p.name);
      return `
      <tr>
        <td>${escHtml(p.id.slice(-8).toUpperCase())}</td>
        <td>${escHtml(p.sku ?? "—")}</td>
        <td>${escHtml(name.en)}</td>
        <td>${escHtml(name.ar)}</td>
        <td>${escHtml(p.category)}</td>
        <td>${p.price} AED${p.originalPrice ? ` <s style="color:#999">${p.originalPrice}</s>` : ""}</td>
        <td>${p.stock}</td>
        <td style="color:${p.inStock ? "green" : "red"}">${p.inStock ? "In Stock" : "Out"}</td>
        <td>${escHtml(p.badge ?? "—")}</td>
        <td>${p.rating.toFixed(1)} (${p.reviews})</td>
        <td>${p.createdAt.toLocaleDateString()}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Products Export — ${timestamp}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #222; margin: 20px; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  p.meta { color: #666; font-size: 10px; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #78350f; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  tr:nth-child(even) td { background: #fafaf9; }
  @media print { body { margin: 0; } button { display: none !important; } }
</style>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
  <div>
    <h1>Products Export</h1>
    <p class="meta">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total: ${products.length} products</p>
  </div>
  <button onclick="window.print()" style="background:#78350f;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;">Print / Save PDF</button>
</div>
<table>
  <thead>
    <tr>
      <th>ID</th><th>SKU</th><th>Name (EN)</th><th>Name (AR)</th><th>Category</th>
      <th>Price</th><th>Stock</th><th>Status</th><th>Badge</th>
      <th>Rating</th><th>Created</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}.html"`,
      },
    });
  }

  // Default: xlsx
  const rows = products.map(buildProductRow);
  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = [
    { wch: 28 }, { wch: 14 }, { wch: 32 }, { wch: 32 }, { wch: 40 }, { wch: 40 },
    { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 10 },
    { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 50 }, { wch: 80 },
    { wch: 24 }, { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

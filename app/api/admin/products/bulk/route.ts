import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type BulkAction =
  | "delete"
  | "changeCategory"
  | "changeStatus"
  | "updateStock"
  | "updatePrice"
  | "markFeatured"
  | "unmarkFeatured";

interface BulkBody {
  action: BulkAction;
  ids: string[];
  data?: {
    category?: string;
    categorySlug?: string;
    inStock?: boolean;
    stock?: number;
    price?: number;
    originalPrice?: number | null;
    badge?: string | null;
  };
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized();

  let body: BulkBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, ids, data } = body;

  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });
  if (!ids || !Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  if (ids.length > 500)
    return NextResponse.json({ error: "Maximum 500 products per bulk operation" }, { status: 400 });

  const where = { id: { in: ids } };

  switch (action) {
    case "delete": {
      // Check for products that have order items — prevent orphan orders
      const withOrders = await prisma.orderItem.findMany({
        where: { productId: { in: ids } },
        select: { productId: true },
        distinct: ["productId"],
      });
      const lockedIds = new Set(withOrders.map((o) => o.productId));
      const deletableIds = ids.filter((id) => !lockedIds.has(id));

      if (deletableIds.length > 0) {
        // Remove cart items and wishlist items first (cascade via Prisma)
        await prisma.cartItem.deleteMany({ where: { productId: { in: deletableIds } } });
        await prisma.wishlistItem.deleteMany({ where: { productId: { in: deletableIds } } });
        await prisma.product.deleteMany({ where: { id: { in: deletableIds } } });
      }

      return NextResponse.json({
        success: true,
        affected: deletableIds.length,
        skipped: lockedIds.size,
        message:
          lockedIds.size > 0
            ? `${deletableIds.length} deleted. ${lockedIds.size} skipped (linked to orders).`
            : `${deletableIds.length} product(s) deleted.`,
      });
    }

    case "changeCategory": {
      if (!data?.category || !data?.categorySlug)
        return NextResponse.json({ error: "category and categorySlug are required" }, { status: 400 });
      const result = await prisma.product.updateMany({
        where,
        data: { category: data.category, categorySlug: data.categorySlug },
      });
      return NextResponse.json({ success: true, affected: result.count });
    }

    case "changeStatus": {
      if (data?.inStock === undefined)
        return NextResponse.json({ error: "inStock (true/false) is required" }, { status: 400 });
      const result = await prisma.product.updateMany({
        where,
        data: { inStock: data.inStock },
      });
      return NextResponse.json({ success: true, affected: result.count });
    }

    case "updateStock": {
      if (data?.stock === undefined || data.stock < 0)
        return NextResponse.json({ error: "stock must be a non-negative number" }, { status: 400 });
      const result = await prisma.product.updateMany({
        where,
        data: { stock: data.stock, inStock: data.stock > 0 },
      });
      return NextResponse.json({ success: true, affected: result.count });
    }

    case "updatePrice": {
      if (!data?.price || data.price <= 0)
        return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });
      const updateData: { price: number; originalPrice?: number | null } = { price: data.price };
      if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
      const result = await prisma.product.updateMany({ where, data: updateData });
      return NextResponse.json({ success: true, affected: result.count });
    }

    case "markFeatured": {
      const badge = data?.badge || "Featured";
      const result = await prisma.product.updateMany({ where, data: { badge } });
      return NextResponse.json({ success: true, affected: result.count });
    }

    case "unmarkFeatured": {
      const result = await prisma.product.updateMany({ where, data: { badge: null } });
      return NextResponse.json({ success: true, affected: result.count });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

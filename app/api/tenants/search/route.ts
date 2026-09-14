import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (!query) return NextResponse.json([]);

  const tenants = await prisma.tenant.findMany({
    where: { name: { contains: query } },
    include: {
      property: { select: { name: true } },
      unit: { include: { property: { select: { name: true } } } },
      payments: { orderBy: { dueDate: "desc" } },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(tenants);
}

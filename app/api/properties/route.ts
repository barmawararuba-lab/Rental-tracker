import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET /api/properties - list all properties with units & tenants
export async function GET() {
  const properties = await prisma.property.findMany({
    include: {
      units: { include: { tenants: true } },
      tenants: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

// POST /api/properties - create a new property (with optional units)
export async function POST(req: Request) {
  const body = await req.json();

  const unitsData = Array.isArray(body.units)
    ? body.units
        .filter((u: any) => u.unitName && u.unitName.trim())
        .map((u: any) => ({
          unitName: u.unitName.trim(),
          // Safely parse: empty string or NaN → 0, negative → 0
          rentAmount: Math.max(0, parseFloat(u.rentAmount) || 0),
        }))
    : [];

  const property = await prisma.property.create({
    data: {
      name: body.name,
      type: body.type,
      address: body.address,
      rentAmount: parseFloat(body.rentAmount || 0),
      imageUrl: body.imageUrl || null,
      ...(unitsData.length > 0 && {
        units: {
          create: unitsData,
        },
      }),
    },
    include: { units: true },
  });

  revalidatePath("/", "layout");

  return NextResponse.json(property, { status: 201 });
}

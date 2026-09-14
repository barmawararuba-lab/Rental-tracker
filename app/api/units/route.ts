import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// POST /api/units - add a new unit to an apartment building property
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.propertyId || !body.unitName || body.rentAmount === undefined || body.rentAmount === "") {
      return NextResponse.json({ error: "Missing required unit fields" }, { status: 400 });
    }

    const rentAmount = Math.max(0, parseFloat(body.rentAmount) || 0);

    const unit = await prisma.unit.create({
      data: {
        propertyId: body.propertyId,
        unitName: body.unitName.trim(),
        rentAmount,
      },
    });

    revalidatePath("/", "layout");
    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Failed to create unit:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}

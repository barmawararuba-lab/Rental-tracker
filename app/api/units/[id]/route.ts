import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PATCH /api/units/[id] - update a unit's name and/or rent amount
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: { unitName?: string; rentAmount?: number } = {};

    if (body.unitName !== undefined) {
      data.unitName = String(body.unitName).trim();
    }
    if (body.rentAmount !== undefined) {
      const parsed = Math.max(0, parseFloat(body.rentAmount) || 0);
      data.rentAmount = parsed;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const unit = await prisma.unit.update({
      where: { id: params.id },
      data,
    });

    revalidatePath("/", "layout");
    return NextResponse.json(unit);
  } catch (error) {
    console.error("Failed to update unit:", error);
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

// DELETE /api/units/[id] - remove a unit (only if vacant)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.unit.delete({ where: { id: params.id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete unit:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}

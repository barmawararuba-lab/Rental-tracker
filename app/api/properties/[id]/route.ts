import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// DELETE /api/properties/[id] - remove a property and all related records
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$transaction(async (tx) => {
      const units = await tx.unit.findMany({ where: { propertyId: params.id }, select: { id: true } });
      const unitIds = units.map((unit) => unit.id);
      const tenantWhere = unitIds.length > 0
        ? { OR: [{ propertyId: params.id }, { unitId: { in: unitIds } }] }
        : { propertyId: params.id };
      const tenants = await tx.tenant.findMany({ where: tenantWhere, select: { id: true } });
      const tenantIds = tenants.map((tenant) => tenant.id);

      if (tenantIds.length > 0) {
        await tx.payment.deleteMany({ where: { tenantId: { in: tenantIds } } });
        await tx.tenant.deleteMany({ where: { id: { in: tenantIds } } });
      }
      if (unitIds.length > 0) {
        await tx.unit.deleteMany({ where: { id: { in: unitIds } } });
      }
      await tx.property.delete({ where: { id: params.id } });
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete property:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

// PATCH /api/properties/[id] - update property details or imageUrl
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type }),
        ...(body.address && { address: body.address }),
        ...(body.rentAmount !== undefined && { rentAmount: parseFloat(body.rentAmount) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      },
    });

    revalidatePath("/", "layout");

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Failed to update property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

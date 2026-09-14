import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET /api/tenants - list all tenants/bookings
export async function GET() {
  const tenants = await prisma.tenant.findMany({
    include: { property: true, unit: true, payments: true },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(tenants);
}

// POST /api/tenants - add a new tenant/booking, linking to Property OR Unit
export async function POST(req: Request) {
  const body = await req.json();

  const tenant = await prisma.tenant.create({
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      bookingType: body.bookingType, // "RECURRING" or "ONE_TIME"
      rentAmount: parseFloat(body.rentAmount),
      dueDate: new Date(body.dueDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes?.trim() || null,
      flagged: body.flagged === true,
      depositAmount: body.depositAmount ? parseFloat(body.depositAmount) : null,
      propertyId: body.propertyId || null,
      unitId: body.unitId || null,
    },
  });

  // Automatically create the first payment record tied to this tenant
  await prisma.payment.create({
    data: {
      amount: tenant.rentAmount,
      dueDate: tenant.dueDate,
      status: "DUE",
      tenantId: tenant.id,
    },
  });

  revalidatePath("/", "layout");

  return NextResponse.json(tenant, { status: 201 });
}

// DELETE /api/tenants - remove a tenant/booking and its payment records
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { tenantId: body.id } });
      await tx.tenant.delete({ where: { id: body.id } });
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete tenant:", error);
    return NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
  }
}

// PATCH /api/tenants - update tenant deposit state
export async function PATCH(req: Request) {
  const body = await req.json();

  if (!body.id || typeof body.depositReturned !== "boolean") {
    return NextResponse.json({ error: "id and depositReturned are required" }, { status: 400 });
  }

  const tenant = await prisma.tenant.update({
    where: { id: body.id },
    data: { depositReturned: body.depositReturned },
  });

  revalidatePath("/", "layout");
  return NextResponse.json(tenant);
}

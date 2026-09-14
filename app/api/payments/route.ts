import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET /api/payments - list all payments, auto-flagging overdue ones
export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      tenant: {
        include: {
          property: true,
          unit: { include: { property: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const today = new Date();

  // Auto-flag anything past due date that's still marked DUE as OVERDUE
  const updated = payments.map((p) => {
    if (p.status === "DUE" && new Date(p.dueDate) < today) {
      return { ...p, status: "OVERDUE" as const };
    }
    return p;
  });

  return NextResponse.json(updated);
}

// PATCH /api/payments - mark a specific payment as paid
export async function PATCH(req: Request) {
  const body = await req.json(); // expects { id, paidDate }

  const payment = await prisma.payment.update({
    where: { id: body.id },
    data: {
      status: "PAID",
      paidDate: new Date(body.paidDate || Date.now()),
    },
  });

  revalidatePath("/", "layout");

  return NextResponse.json(payment);
}

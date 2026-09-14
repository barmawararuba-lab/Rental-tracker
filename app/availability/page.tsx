import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AvailabilitySearch from "@/components/AvailabilitySearch";
import { isTenantEffectivelyActive } from "@/lib/occupancy";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AvailabilityPage() {
  const properties = await prisma.property.findMany({
    include: {
      units: {
        include: {
          tenants: { include: { payments: true } },
        },
        orderBy: { unitName: "asc" },
      },
      tenants: {
        include: { payments: true },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // ──────────────────────────────────────────────────────────────────────
  // Build unified item list.
  // Each item represents one rentable slot (property or unit).
  // `tenants` = ALL effectively-active bookings on that slot (can be > 1
  //   for wedding halls / event spaces that take multiple future bookings).
  // ──────────────────────────────────────────────────────────────────────
  type RentableItem = {
    id: string;
    displayName: string;
    propertyName: string;
    propertyId: string;
    propertyType: string;
    address: string;
    rentAmount: number;
    unitName?: string;
    // ALL active tenants on this slot (may be multiple for event halls)
    activeTenants: any[];
    // The most recent expired tenant (for "lease ended" hint on vacant cards)
    expiredTenant?: any;
  };

  const allItems: RentableItem[] = [];

  properties.forEach((prop) => {
    if (prop.type === "APARTMENT_BUILDING") {
      if (prop.units.length === 0) {
        allItems.push({
          id: prop.id,
          displayName: `${prop.name} (No units added)`,
          propertyName: prop.name,
          propertyId: prop.id,
          propertyType: prop.type,
          address: prop.address,
          rentAmount: prop.rentAmount,
          activeTenants: [],
        });
      } else {
        prop.units.forEach((unit) => {
          const activeTenants = unit.tenants.filter(isTenantEffectivelyActive);
          const expiredTenant = unit.tenants
            .filter((t) => !isTenantEffectivelyActive(t))
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
          allItems.push({
            id: unit.id,
            displayName: `${prop.name} — ${unit.unitName}`,
            propertyName: prop.name,
            propertyId: prop.id,
            propertyType: prop.type,
            address: prop.address,
            rentAmount: unit.rentAmount,
            unitName: unit.unitName,
            activeTenants,
            expiredTenant: activeTenants.length === 0 ? expiredTenant : undefined,
          });
        });
      }
    } else {
      const activeTenants = prop.tenants.filter(isTenantEffectivelyActive);
      const expiredTenant = prop.tenants
        .filter((t) => !isTenantEffectivelyActive(t))
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
      allItems.push({
        id: prop.id,
        displayName: prop.name,
        propertyName: prop.name,
        propertyId: prop.id,
        propertyType: prop.type,
        address: prop.address,
        rentAmount: prop.rentAmount,
        activeTenants,
        expiredTenant: activeTenants.length === 0 ? expiredTenant : undefined,
      });
    }
  });

  const vacantItems = allItems.filter((item) => item.activeTenants.length === 0);
  // occupiedItems: each item that has ≥1 active tenant
  const occupiedItems = allItems.filter((item) => item.activeTenants.length > 0);

  // Flatten: one row per (slot × active tenant), sorted soonest key date first
  type BookingRow = {
    item: RentableItem;
    tenant: any;
    isOneTime: boolean;
    targetDate: Date | null;
    diffDays: number | null;
  };

  const today = new Date();

  function makeRow(item: RentableItem, tenant: any): BookingRow {
    const isOneTime = tenant.bookingType === "ONE_TIME";
    const targetDate = isOneTime
      ? new Date(tenant.dueDate)
      : tenant.endDate
      ? new Date(tenant.endDate)
      : null;
    const diffDays = targetDate
      ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { item, tenant, isOneTime, targetDate, diffDays };
  }

  const bookingRows: BookingRow[] = occupiedItems
    .flatMap((item) => item.activeTenants.map((t) => makeRow(item, t)))
    .sort((a, b) => {
      if (a.diffDays === null && b.diffDays === null) return 0;
      if (a.diffDays === null) return 1;
      if (b.diffDays === null) return -1;
      return a.diffDays - b.diffDays;
    });

  // Count unique slots occupied (not individual bookings)
  const occupiedSlotCount = occupiedItems.length;
  const totalBookingCount = bookingRows.length;

  return (
    <main className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Availability & Leases</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track unit-level vacancies, lease expirations, and event bookings</p>
      </div>

      <AvailabilitySearch vacantItems={vacantItems} bookingRows={bookingRows.map(({ item, tenant, isOneTime, targetDate, diffDays }, rowIdx) => {
        let countdownText = "No end date set";
        let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
        if (diffDays !== null) countdownText = isOneTime ? (diffDays < 0 ? `Event held ${Math.abs(diffDays)} day(s) ago` : diffDays === 0 ? "Event TODAY" : `Event in ${diffDays} day(s)`) : (diffDays < 0 ? `Lease ended ${Math.abs(diffDays)} day(s) ago` : diffDays === 0 ? "Lease ends TODAY" : `Ends in ${diffDays} day(s)`);
        return { item, tenant, isOneTime, targetDate: targetDate ? targetDate.toISOString() : null, countdownText, badgeStyle, isFirstForSlot: rowIdx === 0 || bookingRows[rowIdx - 1].item.id !== item.id, slotBookingCount: item.activeTenants.length };
      })} />

      {/* AvailabilitySearch owns the filtered vacancy and booking sections. */}
    </main>
  );
}

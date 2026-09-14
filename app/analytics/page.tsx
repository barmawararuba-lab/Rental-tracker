import { prisma } from "@/lib/prisma";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChartPoint = { label: string; bookings: number };

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short" });
}

export default async function AnalyticsPage() {
  const [properties, tenants] = await Promise.all([
    prisma.property.findMany({
      include: { units: { select: { id: true, unitName: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tenant.findMany({
      select: {
        propertyId: true,
        unitId: true,
        startDate: true,
        dueDate: true,
      },
    }),
  ]);

  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const unitNames = new Map(
    properties.flatMap((property) => property.units.map((unit) => [unit.id, `${property.name} — ${unit.unitName}`] as const))
  );

  const propertyCounts = new Map<string, number>();
  for (const tenant of tenants) {
    const label = tenant.unitId
      ? unitNames.get(tenant.unitId) || "Unknown unit"
      : tenant.propertyId
        ? propertyNames.get(tenant.propertyId) || "Unknown property"
        : "Unassigned";
    propertyCounts.set(label, (propertyCounts.get(label) || 0) + 1);
  }

  const propertyBookings: ChartPoint[] = Array.from(propertyCounts.entries())
    .map(([label, bookings]) => ({ label, bookings }))
    .sort((a, b) => b.bookings - a.bookings || a.label.localeCompare(b.label));

  const today = new Date();
  const firstMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const monthlyCounts = new Map<string, number>();
  const monthlyLabels = new Map<string, string>();

  for (let index = 0; index < 12; index += 1) {
    const month = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    monthlyCounts.set(monthKey(month), 0);
    monthlyLabels.set(monthKey(month), monthLabel(month));
  }

  const monthlyBookings: ChartPoint[] = [];
  for (const tenant of tenants) {
    const date = tenant.startDate ?? tenant.dueDate;
    const key = monthKey(date);
    if (monthlyCounts.has(key)) monthlyCounts.set(key, (monthlyCounts.get(key) || 0) + 1);
  }

  monthlyCounts.forEach((bookings, key) => {
    monthlyBookings.push({ label: monthlyLabels.get(key) || key, bookings });
  });

  const weekdayCounts = weekdayNames.map((label) => ({ label, bookings: 0 }));
  for (const tenant of tenants) {
    const date = tenant.startDate ?? tenant.dueDate;
    weekdayCounts[date.getDay()].bookings += 1;
  }

  const topProperty = propertyBookings[0]?.label || "No bookings yet";
  const averageBookings = properties.length > 0 ? tenants.length / properties.length : 0;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Understand which properties and dates generate the most bookings</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total bookings</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{tenants.length}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All-time tenant and booking records</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average per property</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{averageBookings.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bookings divided across properties</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Most booked</span>
          <p className="mt-2 truncate text-xl font-extrabold text-indigo-700 dark:text-indigo-300" title={topProperty}>{topProperty}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Highest all-time booking count</p>
        </div>
      </div>

      <AnalyticsCharts
        propertyBookings={propertyBookings}
        monthlyBookings={monthlyBookings}
        weekdayBookings={weekdayCounts}
      />
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CalendarGrid from "@/components/CalendarGrid";

type Tenant = {
  id: string;
  name: string;
  startDate: Date | string;
  dueDate: Date | string;
  endDate: Date | string | null;
  bookingType: string;
  active: boolean;
};

type PropertyCalendarProps = {
  propertyId: string;
  tenants: Tenant[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date | string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * DAY_MS);
}

function isCovered(tenant: Tenant, day: Date, today: Date) {
  if (!tenant.active) return false;
  const start = startOfDay(tenant.startDate);
  const end = tenant.endDate ? startOfDay(tenant.endDate) : null;
  const target = startOfDay(day);
  if (tenant.bookingType === "ONE_TIME") return target.getTime() === startOfDay(tenant.dueDate).getTime();
  if (end) return target >= start && target <= end;
  return target >= start && target <= today;
}

export default function PropertyCalendar({ propertyId, tenants }: PropertyCalendarProps) {
  const router = useRouter();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [view, setView] = useState<"month" | "year">("month");

  const today = useMemo(() => startOfDay(new Date()), []);
  const getDayStatus = (date: Date) => {
    const tenant = tenants.find((candidate) => isCovered(candidate, date, today));
    return { occupied: Boolean(tenant), tenantName: tenant?.name };
  };

  const handleDayClick = (date: Date) => {
    router.push(`/add-tenant?propertyId=${encodeURIComponent(propertyId)}&date=${dateKey(date)}`);
  };

  const changeMonth = (amount: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  const yearMonths = Array.from(
    { length: 12 },
    (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + index, 1)
  );

  return (
    <div className="overflow-visible rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`rounded-md px-2.5 py-1 ${view === "month" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setView("year")}
              className={`rounded-md px-2.5 py-1 ${view === "year" ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              Year View
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            ← Previous Month
          </button>
          <button type="button" onClick={() => changeMonth(1)} className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            Next Month →
          </button>
        </div>
      </div>

      {view === "year" ? (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {yearMonths.map((month) => (
            <div key={`${month.getFullYear()}-${month.getMonth()}`} className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setVisibleMonth(month);
                  setView("month");
                }}
                className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-700"
              >
                {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </button>
              <CalendarGrid
                year={month.getFullYear()}
                month={month.getMonth()}
                getDayStatus={getDayStatus}
                onDayClick={handleDayClick}
                compact={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <CalendarGrid
          year={visibleMonth.getFullYear()}
          month={visibleMonth.getMonth()}
          getDayStatus={getDayStatus}
          onDayClick={handleDayClick}
          compact={false}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 p-4">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-red-200 bg-red-50" /><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Occupied / Booked</span></div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-green-100 bg-green-50" /><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vacant — click to book</span></div>
      </div>
    </div>
  );
}

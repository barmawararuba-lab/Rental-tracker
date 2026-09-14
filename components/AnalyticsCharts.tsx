"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = { label: string; bookings: number };

type AnalyticsChartsProps = {
  propertyBookings: ChartPoint[];
  monthlyBookings: ChartPoint[];
  weekdayBookings: ChartPoint[];
};

const BRAND = "#4338ca";
const BRAND_DARK = "#3730a3";
const SLATE = "#64748b";
const GRID = "#e2e8f0";

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
};

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-72 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400">{message}</div>;
}

export default function AnalyticsCharts({ propertyBookings, monthlyBookings, weekdayBookings }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Most Booked Properties</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Total tenant and booking records across all time</p>
        </div>
        {propertyBookings.length === 0 ? (
          <EmptyChart message="No booking records yet." />
        ) : (
          <div className="h-96 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <BarChart data={propertyBookings} layout="vertical" margin={{ top: 8, right: 44, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID} />
                <XAxis type="number" allowDecimals={false} domain={[0, "dataMax + 1"]} tick={{ fill: SLATE, fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={170} tick={{ fill: SLATE, fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} formatter={(value) => [`${value}`, "Bookings"]} />
                <Bar dataKey="bookings" name="Bookings" fill={BRAND} minPointSize={8} barSize={26} radius={[0, 6, 6, 0]}>
                  <LabelList dataKey="bookings" position="right" fill={BRAND_DARK} fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bookings by Month</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bookings started during the past 12 months</p>
          </div>
          {monthlyBookings.every((point) => point.bookings === 0) ? (
            <EmptyChart message="No bookings in the past 12 months." />
          ) : (
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={monthlyBookings} margin={{ top: 16, right: 16, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fill: SLATE, fontSize: 11 }} />
                  <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} tick={{ fill: SLATE, fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} formatter={(value) => [`${value}`, "Bookings"]} />
                  <Bar dataKey="bookings" name="Bookings" fill={BRAND} minPointSize={6} barSize={24} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="bookings" position="top" fill={BRAND_DARK} fontSize={11} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bookings by Day of Week</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Which days bookings most often begin</p>
          </div>
          {weekdayBookings.every((point) => point.bookings === 0) ? (
            <EmptyChart message="No booking records yet." />
          ) : (
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={weekdayBookings} margin={{ top: 16, right: 16, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fill: SLATE, fontSize: 12 }} />
                  <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} tick={{ fill: SLATE, fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} formatter={(value) => [`${value}`, "Bookings"]} />
                  <Bar dataKey="bookings" name="Bookings" minPointSize={6} barSize={30} radius={[6, 6, 0, 0]}>
                    {weekdayBookings.map((point) => <Cell key={point.label} fill={point.label === "Sat" ? BRAND_DARK : BRAND} />)}
                    <LabelList dataKey="bookings" position="top" fill={BRAND_DARK} fontSize={11} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

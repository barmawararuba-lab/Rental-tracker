import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  const properties = await prisma.property.findMany({
    include: {
      units: { include: { tenants: true } },
      tenants: true,
    },
  });

  const payments = await prisma.payment.findMany({
    include: {
      tenant: {
        include: {
          property: true,
          unit: { include: { property: true } },
        },
      },
    },
  });

  const tenants = await prisma.tenant.findMany({
    select: { depositAmount: true, depositReturned: true },
  });

  const totalProperties = properties.length;
  const today = new Date();

  const thisMonthPayments = payments.filter((p) => {
    const d = new Date(p.dueDate);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const expected = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const collected = thisMonthPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdue = payments.filter(
    (p) => p.status === "DUE" && new Date(p.dueDate) < today
  );

  const collectionPercent = expected > 0 ? Math.round((collected / expected) * 100) : 0;
  const depositsHeld = tenants.reduce(
    (sum, tenant) => sum + (!tenant.depositReturned ? tenant.depositAmount || 0 : 0),
    0
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-heading tracking-tight dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-neutral-text mt-1 dark:text-slate-400">Overview of your rental assets, income, and payment status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Properties */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-text/60 dark:text-slate-400">Total Properties</span>
            <div className="w-10 h-10 rounded-lg bg-neutral-base dark:bg-slate-800 flex items-center justify-center text-neutral-text dark:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-neutral-heading dark:text-slate-100">{totalProperties}</p>
            <Link href="/properties" className="text-xs font-semibold text-brand hover:text-brand-dark dark:text-indigo-400 dark:hover:text-indigo-300">
              View list &rarr;
            </Link>
          </div>
        </div>

        {/* Expected vs Collected */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-text/60 dark:text-slate-400">This Month Collected</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-status-success dark:text-emerald-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-status-success dark:text-green-300">₹{collected.toLocaleString()}</span>
              <span className="text-xs font-medium text-neutral-text/60 dark:text-slate-400">of ₹{expected.toLocaleString()}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full rounded-full bg-neutral-base dark:bg-slate-800 h-2 overflow-hidden">
              <div
                className="bg-status-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overdue Payments */}
        <div className={`bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border ${overdue.length > 0 ? "border-status-danger/30 bg-rose-50/20" : "border-slate-200 dark:border-slate-700 dark:border-slate-700/80"} hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-text/60 dark:text-slate-400">Overdue Payments</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${overdue.length > 0 ? "bg-rose-100 dark:bg-rose-900/30 text-status-danger dark:text-red-300" : "bg-neutral-base dark:bg-slate-800 text-neutral-text/40 dark:text-slate-400"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-extrabold ${overdue.length > 0 ? "text-status-danger dark:text-red-300" : "text-neutral-heading dark:text-slate-100"}`}>
              {overdue.length}
            </p>
            <Link href="/payments" className="text-xs font-semibold text-neutral-text dark:text-slate-300 hover:text-neutral-heading dark:hover:text-slate-100">
              Manage payments &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-text/60 dark:text-slate-400">Deposits Currently Held</span>
        <p className="mt-2 text-3xl font-extrabold text-neutral-heading dark:text-slate-100">₹{depositsHeld.toLocaleString()}</p>
        <p className="mt-1 text-xs text-neutral-text dark:text-slate-400">Unreturned deposits across all tenants</p>
      </div>

      {/* Overdue Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 overflow-hidden dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-heading dark:text-slate-100">Overdue Payments Right Now</h2>
            <p className="text-xs text-neutral-text dark:text-slate-400">Payments that require immediate follow-up</p>
          </div>
          {overdue.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-status-danger dark:bg-rose-900/30 dark:text-red-300">
              {overdue.length} Action Needed
            </span>
          )}
        </div>

        {overdue.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-neutral-base dark:bg-slate-800 text-neutral-text/40 dark:text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-heading dark:text-slate-100 text-base">All Caught Up!</h3>
            <p className="text-sm text-neutral-text dark:text-slate-300 max-w-sm mt-1">
              There are no overdue payments right now. All tenant accounts are up to date.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overdue.map((p) => {
              const propName =
                p.tenant.property?.name ||
                (p.tenant.unit ? `${p.tenant.unit.property.name} (${p.tenant.unit.unitName})` : "Property");

              return (
                <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-base/60 dark:hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-status-danger dark:text-red-300 flex items-center justify-center font-bold text-sm">
                      !
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-heading dark:text-slate-100">{p.tenant.name}</p>
                      <p className="text-xs text-neutral-text dark:text-slate-300">{propName} &bull; Due {new Date(p.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-base font-extrabold text-status-danger">₹{p.amount.toLocaleString()}</span>
                    <Link
                      href="/payments"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-neutral-text dark:text-slate-300 hover:bg-neutral-base dark:hover:bg-slate-800 transition-colors"
                    >
                      Resolve
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

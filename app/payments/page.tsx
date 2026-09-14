"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";

type TenantHistory = {
  id: string;
  name: string;
  bookingType: string;
  rentAmount: number;
  dueDate: string;
  endDate: string | null;
  startDate: string;
  active: boolean;
  property?: { name: string } | null;
  unit?: { unitName: string; property: { name: string } } | null;
  payments: Array<{ id: string; amount: number; status: string; dueDate: string; paidDate: string | null }>;
};

type Payment = {
  id: string;
  amount: number;
  status: "PAID" | "DUE" | "OVERDUE";
  dueDate: string;
  paidDate: string | null;
  tenant: {
    name: string;
    flagged?: boolean;
    property?: { name: string } | null;
    unit?: { unitName: string; property: { name: string } } | null;
  };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantQuery, setTenantQuery] = useState("");
  const [tenantHistory, setTenantHistory] = useState<TenantHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    const res = await fetch("/api/payments");
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    const query = tenantQuery.trim();
    if (!query) {
      setTenantHistory([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setHistoryLoading(true);
      const response = await fetch(`/api/tenants/search?q=${encodeURIComponent(query)}`);
      setTenantHistory(response.ok ? await response.json() : []);
      setHistoryLoading(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [tenantQuery]);

  const markAsPaid = async (id: string) => {
    await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paidDate: new Date().toISOString() }),
    });
    loadPayments();
  };

  const statusBadges = {
    PAID: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    DUE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    OVERDUE: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  };

  const totalCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDue = payments
    .filter((p) => p.status === "DUE")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter((p) => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Payments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track payment statuses, manage due dates, and record transactions</p>
      </div>

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Global Tenant History</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find every booking and payment record for a tenant across all properties.</p></div>
        <SearchBar value={tenantQuery} onChange={setTenantQuery} placeholder="Search tenant name..." className="max-w-xl" />
        {tenantQuery && (historyLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Searching tenant history...</p> : tenantHistory.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No tenant records found.</p> : <div className="space-y-3">{tenantHistory.map((tenant) => { const location = tenant.property?.name || (tenant.unit ? `${tenant.unit.property.name} (${tenant.unit.unitName})` : "—"); const latestPayment = tenant.payments[0]; return <div key={tenant.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-slate-100">{tenant.name}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{location} · {tenant.bookingType === "ONE_TIME" ? "One-time booking" : "Recurring tenancy"}</p></div><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${tenant.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{tenant.active ? "Active" : "Completed"}</span></div><div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-4"><span>Started: {new Date(tenant.startDate).toLocaleDateString()}</span><span>Due/Event: {new Date(tenant.dueDate).toLocaleDateString()}</span><span>Amount: ₹{tenant.rentAmount.toLocaleString()}</span><span>{latestPayment ? `${latestPayment.status} · ₹${latestPayment.amount.toLocaleString()}` : "No payment record"}</span></div></div>; })}</div>)}
      </section>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">Total Collected</span>
            <span className="text-xl font-extrabold text-emerald-600">₹{totalCollected.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">Pending Due</span>
            <span className="text-xl font-extrabold text-amber-600">₹{totalDue.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            ⌛
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">Overdue Amount</span>
            <span className="text-xl font-extrabold text-rose-600">₹{totalOverdue.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-400 text-sm dark:text-slate-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800 dark:border-slate-600 mb-2"></div>
            <p>Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">No payment records found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Payment schedules are created automatically when you register a tenant or booking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Tenant</th>
                  <th className="py-3.5 px-6">Property / Unit</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const propertyName =
                    p.tenant.property?.name ||
                    (p.tenant.unit
                      ? `${p.tenant.unit.property.name} (${p.tenant.unit.unitName})`
                      : "—");

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-800/70 transition-colors dark:hover:bg-slate-800 dark:bg-slate-700">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">{p.tenant.name}{p.tenant.flagged && <span className="ml-2 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700" title="Flagged tenant">⚑</span>}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{propertyName}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-slate-100">₹{p.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(p.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadges[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {p.status !== "PAID" ? (
                          <button
                            onClick={() => markAsPaid(p.id)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 inline-flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-400 flex items-center justify-end gap-1 font-medium">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Paid {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import AvailabilityTableRow from "@/components/AvailabilityTableRow";

type Item = { id: string; displayName: string; propertyName: string; propertyId: string; propertyType: string; address: string; rentAmount: number; activeTenants: any[]; expiredTenant?: any };
type Row = { item: Item; tenant: any; isOneTime: boolean; targetDate: string | null; countdownText: string; badgeStyle: string; isFirstForSlot: boolean; slotBookingCount: number };

export default function AvailabilitySearch({ vacantItems, bookingRows }: { vacantItems: Item[]; bookingRows: Row[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const matches = (item: Item) => !normalized || `${item.displayName} ${item.propertyName} ${item.address}`.toLowerCase().includes(normalized);
  const filteredVacant = useMemo(() => vacantItems.filter(matches), [vacantItems, normalized]);
  const filteredRows = useMemo(() => bookingRows.filter((row) => matches(row.item)), [bookingRows, normalized]);

  return (
    <>
      <SearchBar value={query} onChange={setQuery} placeholder="Search properties or units..." className="max-w-xl" />
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700"><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Vacant Now ({filteredVacant.length})</h2><span className="text-xs text-slate-500 dark:text-slate-400">Ready for new occupants</span></div>
        {filteredVacant.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">No vacant units match your search.</div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredVacant.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h3 className="font-bold text-slate-900 dark:text-slate-100">{item.displayName}</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.address}</p><div className="mt-4 flex justify-between border-t border-slate-100 pt-3 dark:border-slate-700"><span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.rentAmount > 0 ? `₹${item.rentAmount.toLocaleString()}` : "—"}</span><a href={`/add-tenant?propertyId=${item.propertyId}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Assign Tenant</a></div></div>)}</div>}
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700"><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Occupied Units ({filteredRows.length})</h2><span className="text-xs text-slate-500 dark:text-slate-400">Sorted by upcoming key date</span></div>
        {filteredRows.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">No occupied units match your search.</div> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400"><tr><th className="px-6 py-3.5">Unit / Property</th><th className="px-6 py-3.5">Tenant / Booker</th><th className="px-6 py-3.5">Booking Type</th><th className="px-6 py-3.5">Amount</th><th className="px-6 py-3.5">Key Date</th><th className="px-6 py-3.5 text-right">Status / Countdown</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{filteredRows.map((row) => <AvailabilityTableRow key={`${row.tenant.id}-${row.item.id}`} propertyId={row.item.propertyId} displayName={row.item.displayName} tenantName={row.tenant.name} flagged={row.tenant.flagged} amount={row.tenant.rentAmount} isOneTime={row.isOneTime} targetDate={row.targetDate} countdownText={row.countdownText} badgeStyle={row.badgeStyle} isFirstForSlot={row.isFirstForSlot} slotBookingCount={row.slotBookingCount} />)}</tbody></table></div>}
      </section>
    </>
  );
}

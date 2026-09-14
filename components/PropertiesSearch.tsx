"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { isOccupied } from "@/lib/occupancy";

type Unit = { id: string; unitName: string; rentAmount: number; tenants: any[] };
type Property = { id: string; name: string; type: string; address: string; rentAmount: number; imageUrl: string | null; units: Unit[]; tenants: any[] };

export default function PropertiesSearch({ properties }: { properties: Property[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return properties;
    return properties.filter((property) => `${property.name} ${property.address}`.toLowerCase().includes(normalized));
  }, [properties, query]);

  return (
    <>
      <SearchBar value={query} onChange={setQuery} placeholder="Search properties by name or address..." className="max-w-xl" />
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No properties match your search</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another property name or address.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {filtered.map((prop) => {
            const isBuilding = prop.type === "APARTMENT_BUILDING";
            const occupiedUnits = isBuilding ? prop.units.filter((u) => isOccupied(u.tenants)).length : 0;
            const directlyOccupied = !isBuilding && isOccupied(prop.tenants);
            const occupancyLabel = isBuilding ? (prop.units.length ? `${occupiedUnits}/${prop.units.length} units occupied` : "No units yet") : directlyOccupied ? "Occupied" : "Vacant";
            const occupancyStyle = directlyOccupied || (isBuilding && occupiedUnits > 0) ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
            return (
              <Link key={prop.id} href={`/properties/${prop.id}`} className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <div className="relative mb-4 flex h-56 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {prop.imageUrl ? <img src={prop.imageUrl} alt={prop.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <span className="text-xs">No Image</span>}
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200">{prop.type.replace("_", " ")}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100">{prop.name}</h2>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{prop.address}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                  <div><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Rate</span><span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">₹{prop.rentAmount.toLocaleString()}</span></div>
                  <div className="text-right"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Occupancy</span><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${occupancyStyle}`}>{occupancyLabel}</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Unit = { id: string; unitName: string; rentAmount: number };
type Property = { id: string; name: string; type: string; rentAmount: number; units?: Unit[] };

export default function AddTenantForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get("propertyId") || "";
  const dateParam = searchParams.get("date") || "";
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    propertyId: "",
    unitId: "",
    bookingType: "RECURRING",
    rentAmount: "",
    dueDate: "",
    endDate: "",
    notes: "",
    flagged: false,
    depositAmount: "",
  });

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((loadedProperties: Property[]) => {
        setProperties(loadedProperties);

        if (propertyIdParam) {
          const property = loadedProperties.find((item) => item.id === propertyIdParam) || null;
          setSelectedProperty(property);
          setForm((prev) => ({
            ...prev,
            propertyId: property?.id || "",
            dueDate: dateParam,
            rentAmount: property && property.type !== "APARTMENT_BUILDING" && property.rentAmount > 0 ? String(property.rentAmount) : prev.rentAmount,
          }));
        } else if (dateParam) {
          setForm((prev) => ({ ...prev, dueDate: dateParam }));
        }
      });
  }, [dateParam, propertyIdParam]);

  const handlePropertyChange = (selectedId: string) => {
    const prop = properties.find((p) => p.id === selectedId) || null;
    setSelectedProperty(prop);
    setForm((prev) => ({
      ...prev,
      propertyId: selectedId,
      unitId: "",
      rentAmount: prop && prop.type !== "APARTMENT_BUILDING" && prop.rentAmount > 0 ? String(prop.rentAmount) : "",
    }));
  };

  const handleUnitChange = (unitId: string) => {
    const unit = selectedProperty?.units?.find((u) => u.id === unitId);
    const validRent = unit && unit.rentAmount > 0 ? String(unit.rentAmount) : "";
    setForm((prev) => ({ ...prev, unitId, rentAmount: validRent }));
  };

  const handleBookingTypeChange = (newType: string) => {
    setForm((prev) => ({ ...prev, bookingType: newType, endDate: newType === "ONE_TIME" ? "" : prev.endDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    router.refresh();
    router.push("/properties");
  };

  const isBuilding = selectedProperty?.type === "APARTMENT_BUILDING";
  const inputClass = "w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6 md:p-10">
      <div>
        <Link href="/properties" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-slate-100">&larr; Back to Properties</Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Add Tenant / Booking</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Register an occupant or create an event booking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Select Property</label>
          <select required className={inputClass} value={form.propertyId} onChange={(e) => handlePropertyChange(e.target.value)}>
            <option value="">Choose a property...</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type.replace("_", " ")})</option>)}
          </select>
        </div>

        {isBuilding && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Select Unit / Flat</label>
            <select required className={inputClass} value={form.unitId} onChange={(e) => handleUnitChange(e.target.value)}>
              <option value="">Choose a unit...</option>
              {selectedProperty?.units?.map((u) => <option key={u.id} value={u.id}>{u.unitName} (₹{u.rentAmount.toLocaleString()})</option>)}
            </select>
            {(!selectedProperty?.units || selectedProperty.units.length === 0) && <p className="mt-1 text-xs text-red-600">No units created for this building yet. Please add units on the property detail page first.</p>}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tenant Name</label>
          <input required placeholder="e.g. John Doe" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Phone Number</label>
            <input required placeholder="e.g. +91 9876543210" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email (Optional)</label>
            <input type="email" placeholder="john@example.com" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Booking Type</label>
          <select className={inputClass} value={form.bookingType} onChange={(e) => handleBookingTypeChange(e.target.value)}>
            <option value="RECURRING">Recurring (Monthly Rent)</option>
            <option value="ONE_TIME">One-time (Event Booking)</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Security/Damage Deposit (₹) <span className="font-normal text-slate-400 dark:text-slate-400">(Optional)</span></label>
          <input type="number" min="0" placeholder="50000" className={inputClass} value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Rent / Booking Amount (₹)</label>
          <input required type="number" placeholder="15000" className={inputClass} value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} />
          {(form.propertyId || form.unitId) && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Defaulted to rate — edit if custom agreed amount</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Notes <span className="font-normal text-slate-400 dark:text-slate-400">(Optional)</span></label>
          <textarea rows={3} placeholder="Add any useful context about this tenant or booking..." className={`${inputClass} resize-none`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" checked={form.flagged} onChange={(e) => setForm({ ...form, flagged: e.target.checked })} />
          Flag this tenant
        </label>

        {form.bookingType === "ONE_TIME" ? (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Event Date</label>
            <input required type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Next Due Date</label>
              <input required type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Lease End Date <span className="font-normal text-slate-400 dark:text-slate-400">(Optional)</span></label>
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || (isBuilding && !form.unitId)} className="mt-2 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50">
          {loading ? "Saving Tenant..." : "Save Tenant / Booking"}
        </button>
      </form>
    </main>
  );
}

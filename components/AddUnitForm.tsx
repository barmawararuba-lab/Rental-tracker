"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUnitForm({ propertyId, defaultRent }: { propertyId: string; defaultRent: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [rentAmount, setRentAmount] = useState(String(defaultRent || ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, unitName, rentAmount }),
      });

      if (res.ok) {
        setUnitName("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add unit:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
      >
        + Add Unit / Flat
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 space-y-3 mt-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Add New Building Unit</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Unit Name (e.g. Flat 301)"
          className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />
        <input
          required
          type="number"
          min="0"
          placeholder="Rent Amount (₹)"
          className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          value={rentAmount}
          onChange={(e) => setRentAmount(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
        >
          {loading ? "Adding..." : "Save Unit"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  unitId: string;
  currentName: string;
  currentRent: number;
};

export default function EditUnitForm({ unitId, currentName, currentRent }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unitName, setUnitName] = useState(currentName);
  const [rentAmount, setRentAmount] = useState(String(currentRent <= 0 ? "" : currentRent));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/units/${unitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitName, rentAmount }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update unit:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-md transition-colors"
        title="Edit unit name / rent"
      >
        ✎ Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        required
        value={unitName}
        onChange={(e) => setUnitName(e.target.value)}
        placeholder="Unit name"
        className="w-32 rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <input
        required
        type="number"
        min="0"
        value={rentAmount}
        onChange={(e) => setRentAmount(e.target.value)}
        placeholder="Rent (₹)"
        className="w-24 rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-800"
      >
        Cancel
      </button>
    </form>
  );
}

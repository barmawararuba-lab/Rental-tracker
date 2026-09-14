"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  propertyId: string;
  currentRent: number;
};

export default function EditPropertyForm({ propertyId, currentRent }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rentAmount, setRentAmount] = useState(String(currentRent > 0 ? currentRent : ""));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedRent = Number(rentAmount);
    if (!Number.isFinite(parsedRent) || parsedRent <= 0) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentAmount: parsedRent }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
        title="Edit property rent"
      >
        ✎ Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        required
        type="number"
        min="0.01"
        value={rentAmount}
        onChange={(event) => setRentAmount(event.target.value)}
        placeholder="Rent (₹)"
        className="w-28 rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={() => setIsOpen(false)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
        Cancel
      </button>
    </form>
  );
}

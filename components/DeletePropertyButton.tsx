"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePropertyButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${propertyName}? This will also permanently delete all its units, tenants, and payment records. This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.push("/properties");
      router.refresh();
    } catch (error) {
      console.error(error);
      setDeleting(false);
      window.alert("The property could not be deleted. Please try again.");
    }
  };

  return (
    <button type="button" onClick={handleDelete} disabled={deleting} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40">
      {deleting ? "Deleting Property…" : "Delete Property"}
    </button>
  );
}

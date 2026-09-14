"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTenantButton({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${tenantName}? This will also permanently delete this booking and its payment records. This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/tenants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tenantId }),
      });
      if (!response.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (error) {
      console.error(error);
      setDeleting(false);
      window.alert("The tenant could not be deleted. Please try again.");
    }
  };

  return (
    <button type="button" onClick={handleDelete} disabled={deleting} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40">
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}

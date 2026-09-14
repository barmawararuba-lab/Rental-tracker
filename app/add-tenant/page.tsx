import { Suspense } from "react";
import AddTenantForm from "@/components/AddTenantForm";

export default function AddTenantPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg p-6 md:p-10">Loading tenant form...</main>}>
      <AddTenantForm />
    </Suspense>
  );
}

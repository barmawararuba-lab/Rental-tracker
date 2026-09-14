import { prisma } from "@/lib/prisma";
import PropertiesSearch from "@/components/PropertiesSearch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: { units: { include: { tenants: true } }, tenants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Properties</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your rental units, rates, and occupant assignments</p>
      </div>
      {properties.length === 0 ? (
        <div className="mx-auto my-8 flex max-w-lg flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No properties added yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by clicking &quot;+ Add Property&quot; in the top navigation bar.</p>
        </div>
      ) : (
        <PropertiesSearch properties={properties} />
      )}
    </main>
  );
}

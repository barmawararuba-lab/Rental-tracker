import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PropertyImageEditor from "@/components/PropertyImageEditor";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import EditPropertyForm from "@/components/EditPropertyForm";
import AddUnitForm from "@/components/AddUnitForm";
import EditUnitForm from "@/components/EditUnitForm";
import BookingTimeline from "@/components/BookingTimeline";
import PropertyCalendar from "@/components/PropertyCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      units: {
        include: {
          tenants: { include: { payments: true } },
        },
        orderBy: { unitName: "asc" },
      },
      tenants: { include: { payments: true } },
    },
  });

  if (!property) {
    return (
      <main className="p-10 max-w-lg mx-auto text-center">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Property Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The property you are looking for does not exist or was deleted.</p>
          <Link href="/properties" className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg">
            Back to Properties
          </Link>
        </div>
      </main>
    );
  }

  const isBuilding = property.type === "APARTMENT_BUILDING";

  // Combine all tenants for the calendar
  const allTenants = [
    ...property.tenants,
    ...property.units.flatMap((u) => u.tenants),
  ];

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link href="/properties" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4">
          &larr; Back to Properties
        </Link>

        {/* Property Image Banner & Interactive Editor */}
        <PropertyImageEditor
          propertyId={property.id}
          currentImageUrl={property.imageUrl}
          propertyName={property.name}
        />

        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-block mb-2">
              {property.type.replace("_", " ")}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{property.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.address}
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-700">
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                {isBuilding ? "Default Unit Rent" : "Default Rent"}
              </span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">₹{property.rentAmount.toLocaleString()}</span>
                <EditPropertyForm propertyId={property.id} currentRent={property.rentAmount} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Calendar Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Occupancy Calendar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Visual overview of bookings and vacancies</p>
        </div>
        <PropertyCalendar propertyId={property.id} tenants={allTenants} />
      </div>

      {/* APARTMENT BUILDING (MULTI-UNIT) SECTION */}
      {isBuilding ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Building Units / Flats</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{property.units.length} total units configured</p>
            </div>
            <AddUnitForm propertyId={property.id} defaultRent={property.rentAmount} />
          </div>

          {property.units.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-10 border border-slate-200 dark:border-slate-700 dark:border-slate-700 shadow-sm text-center flex flex-col items-center justify-center">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">No units added yet for this building</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Click "+ Add Unit / Flat" above to add your first apartment unit.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {property.units.map((unit) => {
                const activeTenant = unit.tenants.find((t) => t.active);

                return (
                  <div key={unit.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 shadow-xs p-6 space-y-4 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">{unit.unitName}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                            activeTenant
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {activeTenant ? "Occupied" : "Vacant"}
                          </span>
                          {unit.rentAmount <= 0 && (
                            <span className="text-[10px] text-red-700 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              Invalid rate
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Unit Rent: {unit.rentAmount > 0 ? `₹${unit.rentAmount.toLocaleString()}` : <span className="text-red-600 font-semibold">Not set</span>}
                          </p>
                          <EditUnitForm
                            unitId={unit.id}
                            currentName={unit.unitName}
                            currentRent={unit.rentAmount}
                          />
                        </div>
                      </div>

                      {!activeTenant && (
                        <Link
                          href="/add-tenant"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
                        >
                          + Assign Tenant
                        </Link>
                      )}
                    </div>

                    {/* Active Tenant details if occupied */}
                    {activeTenant ? (
                      <div className="space-y-3 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block">Current Tenant</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{activeTenant.name}</span>
                            {activeTenant.flagged && <span className="ml-2 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700" title="Flagged tenant">⚑ Flagged</span>}
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({activeTenant.phone})</span>
                            {activeTenant.notes && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{activeTenant.notes}</p>}
                          </div>
                          <div className="sm:text-right">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">₹{activeTenant.rentAmount.toLocaleString()}</span>
                            {activeTenant.depositAmount != null && activeTenant.depositAmount > 0 && (
                              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                                <span>Deposit: ₹{activeTenant.depositAmount.toLocaleString()}</span>
                                <button type="button" className="rounded-md border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={async () => { await fetch("/api/tenants", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeTenant.id, depositReturned: !activeTenant.depositReturned }) }); window.location.reload(); }}>
                                  {activeTenant.depositReturned ? "Deposit Returned ✓" : "Mark Deposit as Returned"}
                                </button>
                              </div>
                            )}
                            {activeTenant.endDate && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                                Lease Ends: {new Date(activeTenant.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Payment History */}
                        {activeTenant.payments.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 dark:border-slate-700/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1.5">Payment History</span>
                            <div className="space-y-1">
                              {activeTenant.payments.map((p) => (
                                <div key={p.id} className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 dark:border-slate-700/50">
                                  <span className="text-slate-600 dark:text-slate-300">Due {new Date(p.dueDate).toLocaleDateString()}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">₹{p.amount.toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      p.status === "PAID" ? "bg-green-100 text-green-700" : p.status === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {p.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-400 italic">No occupant assigned to this unit currently.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SINGLE PROPERTY TENANT SECTION (HOUSES, WEDDING HALLS, SHOPS) */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 pb-3 mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Booking Timeline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">History and upcoming events/leases for this property</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {property.tenants.length} Total Bookings
            </span>
          </div>

          {property.tenants.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-10 border border-slate-200 dark:border-slate-700 dark:border-slate-700 shadow-sm text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">No tenants yet for this property</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assign a tenant by clicking "+ Add Tenant" in the navigation bar.</p>
            </div>
          ) : (
            <BookingTimeline tenants={property.tenants} />
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">
        <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
      </div>
    </main>
  );
}

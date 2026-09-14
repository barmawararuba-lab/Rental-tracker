/**
 * lib/occupancy.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Single source of truth for "is a tenant / unit / property currently occupied?"
 *
 * RULES
 * ─────
 * A tenant counts as effectively active (= property/unit is OCCUPIED) when ALL
 * of the following hold:
 *   1. tenant.active === true  (the DB flag has not been manually cleared)
 *   2. Their relevant date has NOT yet passed:
 *        • ONE_TIME  → dueDate  (the event date) must be >= today
 *        • RECURRING → endDate  (the lease end) must be null  OR  >= today
 *
 * Anything else → the slot is treated as VACANT for display purposes.
 * We do NOT auto-flip the DB `active` flag here; that stays as a historical record.
 */

export type TenantLike = {
  active: boolean;
  bookingType: string;
  dueDate: Date | string;
  endDate?: Date | string | null;
};

/**
 * Returns true if the tenant should be considered currently occupying
 * their slot (i.e. the property/unit is NOT vacant).
 */
export function isTenantEffectivelyActive(tenant: TenantLike): boolean {
  if (!tenant.active) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (tenant.bookingType === "ONE_TIME") {
    const eventDate = new Date(tenant.dueDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }

  // RECURRING
  if (tenant.endDate) {
    const endDate = new Date(tenant.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  }

  return true; // open-ended recurring lease → still active
}

/**
 * From a list of tenants on a property/unit, pick the one that is currently
 * "effectively active."  Returns undefined if none qualifies (= vacant).
 */
export function getEffectiveTenant<T extends TenantLike>(
  tenants: T[]
): T | undefined {
  return tenants.find(isTenantEffectivelyActive);
}

/**
 * Convenience: is this property/unit occupied right now?
 */
export function isOccupied(tenants: TenantLike[]): boolean {
  return tenants.some(isTenantEffectivelyActive);
}

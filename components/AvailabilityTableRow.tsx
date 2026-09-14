"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type AvailabilityTableRowProps = {
  propertyId: string;
  displayName: string;
  tenantName: string;
  flagged?: boolean;
  amount: number;
  isOneTime: boolean;
  targetDate: string | null;
  countdownText: string;
  badgeStyle: string;
  isFirstForSlot: boolean;
  slotBookingCount: number;
};

export default function AvailabilityTableRow({
  propertyId,
  displayName,
  tenantName,
  flagged,
  amount,
  isOneTime,
  targetDate,
  countdownText,
  badgeStyle,
  isFirstForSlot,
  slotBookingCount,
}: AvailabilityTableRowProps) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/properties/${propertyId}`)}
      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-700 ${
        !isFirstForSlot ? "border-l-4 border-l-slate-200 dark:border-l-slate-700" : ""
      }`}
    >
      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
        {isFirstForSlot ? (
          <div>
            <Link
              href={`/properties/${propertyId}`}
              onClick={(event) => event.stopPropagation()}
              className="hover:text-indigo-700"
            >
              {displayName}
            </Link>
            {slotBookingCount > 1 && (
              <span className="ml-2 rounded-md border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {slotBookingCount} bookings
              </span>
            )}
          </div>
        ) : (
          <span className="pl-2 text-xs text-slate-300 dark:text-slate-300">↳</span>
        )}
      </td>
      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{tenantName}{flagged && <span className="ml-2 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300" title="Flagged tenant">⚑</span>}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 dark:text-slate-300 py-0.5 text-[10px] font-bold uppercase text-slate-600">
          {isOneTime ? "One-time Event" : "Recurring"}
        </span>
      </td>
      <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">₹{amount.toLocaleString()}</td>
      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
        {targetDate ? (
          <span>
            {new Date(targetDate).toLocaleDateString()}
            <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-400">
              {isOneTime ? "Event Date" : "Lease End"}
            </span>
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <span className={`rounded-md border px-2.5 py-1 text-xs ${badgeStyle}`}>
          {countdownText}
        </span>
      </td>
    </tr>
  );
}

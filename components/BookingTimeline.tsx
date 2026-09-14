"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteTenantButton from "@/components/DeleteTenantButton";

type Payment = {
  id: string;
  amount: number;
  status: string; // PAID, DUE, OVERDUE
  dueDate: string | Date;
  paidDate: string | Date | null;
  notes: string | null;
};

type Tenant = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  bookingType: string; // RECURRING or ONE_TIME
  rentAmount: number;
  dueDate: string | Date;
  endDate: string | Date | null;
  startDate: string | Date;
  active: boolean;
  payments: Payment[];
};

type BookingTimelineProps = {
  tenants: Tenant[];
};

export default function BookingTimeline({ tenants }: BookingTimelineProps) {
  const [showPast, setShowPast] = useState(false);
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});

  const togglePayments = (tenantId: string) => {
    setExpandedPayments((prev) => ({
      ...prev,
      [tenantId]: !prev[tenantId],
    }));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current: Tenant[] = [];
  const upcoming: Tenant[] = [];
  const past: Tenant[] = [];

  tenants.forEach((tenant) => {
    const start = new Date(tenant.startDate);
    start.setHours(0, 0, 0, 0);

    const end = tenant.endDate ? new Date(tenant.endDate) : null;
    if (end) end.setHours(0, 0, 0, 0);

    const due = new Date(tenant.dueDate);
    due.setHours(0, 0, 0, 0);

    if (!tenant.active) {
      past.push(tenant);
    } else {
      if (tenant.bookingType === "ONE_TIME") {
        if (today.getTime() === due.getTime()) {
          current.push(tenant);
        } else if (today < due) {
          upcoming.push(tenant);
        } else {
          past.push(tenant);
        }
      } else {
        // RECURRING
        if (today >= start && (!end || today <= end)) {
          current.push(tenant);
        } else if (today < start) {
          upcoming.push(tenant);
        } else {
          past.push(tenant);
        }
      }
    }
  });

  // Sort Current: start date ascending (earliest first)
  current.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Sort Upcoming: starts soonest first (ascending by start/event date)
  upcoming.sort((a, b) => {
    const aDate = a.bookingType === "ONE_TIME" ? new Date(a.dueDate) : new Date(a.startDate);
    const bDate = b.bookingType === "ONE_TIME" ? new Date(b.dueDate) : new Date(b.startDate);
    return aDate.getTime() - bDate.getTime();
  });

  // Sort Past: ended most recently first (descending by end/event date)
  past.sort((a, b) => {
    const aDate = a.endDate ? new Date(a.endDate) : new Date(a.dueDate);
    const bDate = b.endDate ? new Date(b.endDate) : new Date(b.dueDate);
    return bDate.getTime() - aDate.getTime();
  });

  const getUpcomingCountdown = (tenant: Tenant) => {
    const targetStart = tenant.bookingType === "ONE_TIME" ? new Date(tenant.dueDate) : new Date(tenant.startDate);
    targetStart.setHours(0, 0, 0, 0);
    const diffTime = targetStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Starts tomorrow";
    return `Starts in ${diffDays} days`;
  };

  const getFormattedRange = (tenant: Tenant) => {
    const startStr = new Date(tenant.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (tenant.bookingType === "ONE_TIME") {
      return `Event Date: ${new Date(tenant.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    const endStr = tenant.endDate
      ? new Date(tenant.endDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Ongoing";
    return `${startStr} to ${endStr}`;
  };

  const renderBookingCard = (tenant: Tenant, type: "current" | "upcoming" | "past") => {
    const isExpanded = expandedPayments[tenant.id] ?? (type === "current");
    const isOneTime = tenant.bookingType === "ONE_TIME";

    let borderClass = "";
    let dotClass = "";
    let typeBadge = "";

    if (type === "current") {
      borderClass = "border-l-4 border-l-red-600 shadow-sm";
      dotClass = "bg-red-600 ring-4 ring-red-50";
      typeBadge = "bg-red-50 text-red-700 border-red-200";
    } else if (type === "upcoming") {
      borderClass = "border-l-4 border-l-amber-600 hover:shadow-sm";
      dotClass = "bg-amber-600 ring-4 ring-amber-50";
      typeBadge = "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      borderClass = "border-l-4 border-l-slate-400 opacity-80 hover:opacity-100";
      dotClass = "bg-slate-400 dark:bg-slate-700 ring-4 ring-slate-100";
      typeBadge = "bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 dark:border-slate-700";
    }

    return (
      <div key={tenant.id} className="relative pl-8 group pb-6 last:pb-2">
        {/* Timeline Line & Dot */}
        <div className="absolute left-0 top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 group-last:hidden" />
        <div className={`absolute left-[-5px] top-1.5 w-3.5 h-3.5 rounded-full ${dotClass} transition-all duration-300`} />

        {/* Card Body */}
        <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700/80 p-5 space-y-4 transition-all duration-200 ${borderClass}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{tenant.name}</h4>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeBadge}`}>
                  {isOneTime ? "Event" : "Lease"}
                </span>
                {type === "upcoming" && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                    {getUpcomingCountdown(tenant)}
                  </span>
                )}
                {type === "current" && (
                  <span className="animate-pulse text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-md">
                    Active Now
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-2.5">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1.3 1.3 0 01-.321.988l-1.305 1.4a10.582 10.582 0 004.872 4.872l1.4-1.305a1.3 1.3 0 01.98-.32l2.2.55a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {tenant.phone}
                </span>
                {tenant.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tenant.email}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 sm:text-right flex-shrink-0">
              <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block tracking-wider">Amount</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">₹{tenant.rentAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Dates Metadata Info block */}
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Duration / Date</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{getFormattedRange(tenant)}</span>
            </div>
            {!isOneTime && (
              <div className="space-y-0.5 sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Next Rent Due Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(tenant.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Payment History Accordion */}
          {tenant.payments.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3.5">
              <button
                onClick={() => togglePayments(tenant.id)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Payment History ({tenant.payments.length})
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-1.5 animate-fadeIn">
                  {tenant.payments.map((p) => {
                    const isPaid = p.status === "PAID";
                    const isOverdue = p.status === "OVERDUE";
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800/70 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2.5 gap-y-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Due {new Date(p.dueDate).toLocaleDateString()}
                          </span>
                          {p.paidDate && (
                            <span className="text-slate-400 dark:text-slate-400 text-[11px]">
                              (Paid {new Date(p.paidDate).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">₹{p.amount.toLocaleString()}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700"
                                : isOverdue
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Vacancy Banner */}
      {current.length === 0 && upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start gap-4 text-amber-900 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0 shadow-3xs">
            ⏳
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-amber-900">Currently Vacant</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              No active tenant today, but you have <span className="font-bold">{upcoming.length} upcoming booking{upcoming.length > 1 ? "s" : ""}</span> lined up.
            </p>
          </div>
        </div>
      )}

      {/* 1. CURRENT TIMELINE SECTION */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          Current Booking ({current.length})
        </h3>
        {current.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-400 text-xs">
            No active booking today.
          </div>
        ) : (
          <div className="relative pt-2">
            {current.map((t) => renderBookingCard(t, "current"))}
          </div>
        )}
      </section>

      {/* 2. UPCOMING TIMELINE SECTION */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          Upcoming Bookings ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-400 text-xs">
            No future bookings scheduled.
          </div>
        ) : (
          <div className="relative pt-2">
            {upcoming.map((t) => renderBookingCard(t, "upcoming"))}
          </div>
        )}
      </section>

      {/* 3. PAST TIMELINE SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700" />
            Past Bookings ({past.length})
          </h3>
          {past.length > 0 && (
            <button
              onClick={() => setShowPast(!showPast)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider"
            >
              {showPast ? "Hide past bookings" : "Show past bookings"}
            </button>
          )}
        </div>

        {past.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-400 text-xs">
            No past rental history.
          </div>
        ) : (
          showPast && (
            <div className="relative pt-2 animate-fadeIn">
              {past.map((t) => renderBookingCard(t, "past"))}
            </div>
          )
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavHeader() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/properties", label: "Properties" },
    { href: "/availability", label: "Availability" },
    { href: "/payments", label: "Payments" },
    { href: "/analytics", label: "Analytics" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Rental Tracker home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-colors group-hover:bg-brand-dark">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-neutral-heading transition-colors group-hover:text-brand dark:text-slate-100">
              Rental Tracker
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3.5 py-1.5 text-sm transition-all ${
                    active
                      ? "bg-indigo-50 font-semibold text-brand dark:bg-indigo-950 dark:text-indigo-300"
                      : "font-medium text-neutral-text hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-neutral-heading dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-700"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          <Link
            href="/add-property"
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
              pathname === "/add-property"
                ? "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-neutral-heading dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-neutral-text hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 hover:text-neutral-heading dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:bg-slate-700"
            }`}
          >
            + Add Property
          </Link>
          <Link
            href="/add-tenant"
            className="rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-dark active:scale-95"
          >
            + Add Tenant
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}

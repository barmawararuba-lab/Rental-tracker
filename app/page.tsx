import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-73px)] flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20 motion-safe:animate-gentle-float" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl dark:bg-slate-800/40 motion-safe:animate-gentle-float-reverse" />
      </div>

      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-4">
          <div className="motion-safe:animate-fade-up mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v10" />
            </svg>
          </div>
          <h1 className="motion-safe:animate-fade-up [animation-delay:100ms] text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Rental Tracker</h1>
          <p className="motion-safe:animate-fade-up [animation-delay:200ms] mx-auto max-w-xl text-xl text-slate-600 dark:text-slate-300">Manage your rentals, tenants, and payments in one place. Simple, efficient, and professional.</p>
        </div>

        <div className="motion-safe:animate-fade-up [animation-delay:300ms] flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard" className="w-full rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-md transition duration-300 ease-out hover:scale-105 hover:bg-indigo-700 hover:shadow-lg active:scale-95 sm:w-auto">Go to Dashboard</Link>
          <Link href="/properties" className="w-full rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm transition duration-300 ease-out hover:scale-105 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">Explore Properties</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-12 md:grid-cols-3">
          <div className="motion-safe:animate-fade-up [animation-delay:400ms] rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-indigo-600 dark:text-indigo-400"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 011-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-6 0h6" /></svg></div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Property Management</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track multiple properties and units with ease.</p>
          </div>
          <div className="motion-safe:animate-fade-up [animation-delay:500ms] rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-indigo-600 dark:text-indigo-400"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Payment Tracking</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Monitor collections and identify overdue payments.</p>
          </div>
          <div className="motion-safe:animate-fade-up [animation-delay:600ms] rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 text-indigo-600 dark:text-indigo-400"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Availability</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">See what's vacant and manage upcoming bookings.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

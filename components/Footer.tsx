export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6 text-center text-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">Rental Tracker</p>
        <p>Simple, professional rental management · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

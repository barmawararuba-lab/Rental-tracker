"use client";

interface CalendarGridProps {
  year: number;
  month: number; // 0-11
  getDayStatus: (date: Date) => { occupied: boolean; tenantName?: string };
  onDayClick?: (date: Date) => void;
  compact?: boolean;
}

export default function CalendarGrid({ year, month, getDayStatus, onDayClick, compact }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const dayLabels = compact ? ["S", "M", "T", "W", "T", "F", "S"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cellSize = compact ? "aspect-square text-xs" : "aspect-square text-sm";

  return (
    <div className="grid grid-cols-7 gap-1">
      {dayLabels.map((label, index) => (
        <div key={`${label}-${index}`} className="text-center font-semibold text-slate-400 dark:text-slate-400 text-xs pb-1 dark:text-slate-500">
          {label}
        </div>
      ))}
      {cells.map((date, i) => {
        if (!date) return <div key={i} className={cellSize} />;
        const status = getDayStatus(date);
        return (
          <button
            key={i}
            onClick={() => !status.occupied && onDayClick?.(date)}
            title={status.tenantName || ""}
            className={`${cellSize} rounded flex items-center justify-center border ${
              status.occupied
                ? "bg-red-100 border-red-200 text-red-700 cursor-default dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-pointer dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/50"
            }`}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
}

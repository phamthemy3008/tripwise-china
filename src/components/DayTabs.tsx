import React, { useRef, useEffect, useState } from "react";
import { DayPlan } from "../types/itinerary";
import { Calendar, MapPin, Sparkles, ChevronDown, Check, X } from "lucide-react";

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  todayDayNumber?: number | null;
}

export function checkIsToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const normalized = dateStr.toLowerCase();

  // Pattern: DD/MM or DD-MM or DD.MM
  const ddMmRegex = new RegExp(`(^|[^0-9])0?${day}[/.-]0?${month}([^0-9]|$)`);
  if (ddMmRegex.test(normalized)) return true;

  // Pattern: YYYY-MM-DD
  const ymdRegex = new RegExp(`${year}[/.-]0?${month}[/.-]0?${day}`);
  if (ymdRegex.test(normalized)) return true;

  return false;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  selectedDay,
  onSelectDay,
  todayDayNumber,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);

  // Auto-scroll active day tab into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(
      `[data-day="${selectedDay}"]`
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDay]);

  return (
    <>
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2">
          {/* Top Bar with Quick Jump Selector */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Lịch trình {days.length} ngày</span>
              </span>

              {todayDayNumber && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Hôm nay: Ngày {todayDayNumber}
                </span>
              )}
            </div>

            {/* Quick Grid Selector Button */}
            <button
              type="button"
              onClick={() => setIsGridModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Xem tất cả ({days.length} ngày)</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Horizontal Scrollable Day Cards */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth"
          >
            {days.map((day) => {
              const isActive = day.day_number === selectedDay;
              const isToday =
                day.day_number === todayDayNumber || checkIsToday(day.date);

              return (
                <button
                  key={day.day_number}
                  data-day={day.day_number}
                  type="button"
                  onClick={() => onSelectDay(day.day_number)}
                  className={`flex flex-col items-start min-w-[125px] sm:min-w-[140px] px-3.5 py-2.5 rounded-2xl text-left transition-all shrink-0 cursor-pointer relative group ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 scale-[1.02] border border-amber-300"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                  }`}
                >
                  {/* Today Badge indicator */}
                  {isToday && (
                    <span
                      className={`absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-xs ${
                        isActive
                          ? "bg-slate-950 text-emerald-400 border border-slate-800"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      Hôm nay
                    </span>
                  )}

                  {/* Day Label */}
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? "bg-slate-950 text-amber-400"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {day.day_number}
                    </span>
                    <span>Ngày {day.day_number}</span>
                  </div>

                  {/* Date subtitle if available */}
                  {day.date && (
                    <span
                      className={`text-[10px] truncate max-w-[120px] font-medium mt-0.5 ${
                        isActive ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {day.date.replace(/Ngày\s*\d+\s*[:：]?\s*/i, "")}
                    </span>
                  )}

                  {/* City */}
                  <div
                    className={`flex items-center gap-1 text-[11px] truncate max-w-[125px] font-medium mt-1 ${
                      isActive ? "text-slate-950 font-bold" : "text-slate-400"
                    }`}
                  >
                    <MapPin
                      className={`w-3 h-3 shrink-0 ${
                        isActive ? "text-red-700" : "text-red-400"
                      }`}
                    />
                    <span className="truncate">
                      {day.city || `Chặng ${day.day_number}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Day Grid Selector Modal */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chọn Nhanh Ngày Trong Chuyến Đi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {days.map((day) => {
                const isActive = day.day_number === selectedDay;
                const isToday =
                  day.day_number === todayDayNumber || checkIsToday(day.date);

                return (
                  <button
                    key={day.day_number}
                    type="button"
                    onClick={() => {
                      onSelectDay(day.day_number);
                      setIsGridModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/60 shadow-xs ring-1 ring-amber-500/40"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Ngày {day.day_number}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {day.city} &bull; {day.events.length} hoạt động
                      </p>
                    </div>

                    {isActive && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

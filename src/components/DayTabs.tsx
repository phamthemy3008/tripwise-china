import React from "react";
import { DayPlan } from "../types/itinerary";
import { Calendar, MapPin } from "lucide-react";

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  selectedDay,
  onSelectDay,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {days.map((day) => {
            const isActive = day.day_number === selectedDay;
            return (
              <button
                key={day.day_number}
                type="button"
                onClick={() => onSelectDay(day.day_number)}
                className={`flex flex-col items-start px-3.5 py-2 rounded-xl text-left transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-md scale-[1.02]"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>Ngày {day.day_number}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] truncate max-w-[140px] opacity-90 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{day.city || `Chặng ${day.day_number}`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

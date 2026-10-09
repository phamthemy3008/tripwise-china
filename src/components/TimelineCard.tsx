import React from "react";
import { ActivityEvent } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { AmapButton } from "./AmapButton";
import { DishExplorer } from "./DishExplorer";
import { Info, Sun, Sunset, Moon, MapPin } from "lucide-react";

interface TimelineCardProps {
  event: ActivityEvent;
  index: number;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ event, index }) => {
  const getSlotIcon = (slot: string) => {
    const s = slot.toLowerCase();
    if (s.includes("sáng") || s.includes("morning")) {
      return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (s.includes("chiều") || s.includes("afternoon")) {
      return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
    }
    if (s.includes("tối") || s.includes("night") || s.includes("evening")) {
      return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
    return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const getSlotBadgeColor = (slot: string) => {
    const s = slot.toLowerCase();
    if (s.includes("sáng")) return "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    if (s.includes("chiều")) return "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    if (s.includes("tối")) return "bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  };

  return (
    <div className="relative pl-6 sm:pl-7 pb-6 last:pb-2 border-l-2 border-slate-200 dark:border-slate-800 last:border-l-transparent">
      {/* Circle Node Marker */}
      <div className="absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full bg-slate-900 dark:bg-slate-100 border-3 border-white dark:border-slate-950 shadow-md flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col gap-3">
        {/* Header: Slot Badge & Time Range */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSlotBadgeColor(
                event.time_slot
              )}`}
            >
              {getSlotIcon(event.time_slot)}
              <span>{event.time_slot}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              #{index + 1}
            </span>
          </div>

          {event.time_range && (
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-md">
              {event.time_range}
            </span>
          )}
        </div>

        {/* Title & Place */}
        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {event.activity_title}
          </h4>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {event.place_name}
            </span>
            {event.place_zh && (
              <CopyChip text={event.place_zh} highlight />
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
            {event.description}
          </p>
        )}

        {/* Amap Direct Navigation Button */}
        <div className="pt-0.5">
          <AmapButton
            query={event.amap_query || event.place_zh || event.place_name}
          />
        </div>

        {/* Food Section (Dish Explorer) */}
        {event.dishes && event.dishes.length > 0 && (
          <DishExplorer dishes={event.dishes} />
        )}

        {/* Travel Tips / Notes */}
        {event.tips && (
          <div className="flex items-start gap-2.5 bg-amber-500/10 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 p-3 rounded-xl text-xs leading-relaxed border border-amber-300/60 dark:border-amber-700/50">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Mẹo &amp; Lưu ý:</strong>
              <span>{event.tips}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

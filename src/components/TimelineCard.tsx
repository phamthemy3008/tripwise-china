import React, { useState } from "react";
import { ActivityEvent } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { AmapButton } from "./AmapButton";
import { DishExplorer } from "./DishExplorer";
import {
  Info,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Clock,
  Train,
  Ticket,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface TimelineCardProps {
  event: ActivityEvent;
  index: number;
  cityName?: string;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ event, index, cityName }) => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

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
    if (s.includes("sáng"))
      return "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    if (s.includes("chiều"))
      return "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    if (s.includes("tối"))
      return "bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  };

  return (
    <div className="relative pl-6 sm:pl-7 pb-6 last:pb-2 border-l-2 border-slate-200 dark:border-slate-800 last:border-l-transparent">
      {/* Circle Node Marker */}
      <button
        type="button"
        onClick={() => setIsCheckedIn(!isCheckedIn)}
        className="absolute -left-[9px] top-2.5 w-4.5 h-4.5 rounded-full bg-slate-900 dark:bg-slate-100 border-3 border-white dark:border-slate-950 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
        title={isCheckedIn ? "Đã đánh dấu hoàn thành" : "Bấm để đánh dấu đã đi"}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            isCheckedIn ? "bg-emerald-500 scale-125" : "bg-amber-400"
          }`}
        />
      </button>

      {/* Main Card */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border transition-all flex flex-col gap-3.5 ${
          isCheckedIn
            ? "border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        {/* Header: Slot Badge & Time Range & Quick Check-in */}
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

            {event.time_range && (
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 rounded-md">
                {event.time_range}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {event.duration_hint && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{event.duration_hint}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                isCheckedIn
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Đã đi</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5" />
                  <span>Check-in</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & Place */}
        <div>
          <h4
            className={`text-base sm:text-lg font-bold leading-snug ${
              isCheckedIn
                ? "text-slate-600 dark:text-slate-300 line-through decoration-emerald-500/60"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {event.activity_title}
          </h4>

          {/* Place & Chinese Name & Amap Action */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              {event.place_name}
            </span>
            {event.place_zh && <CopyChip text={event.place_zh} highlight />}

            {/* Inline Amap Button */}
            <AmapButton
              query={event.amap_query || event.place_zh || event.place_name}
            />
          </div>
        </div>

        {/* Transport & Ticket Highlights */}
        {(event.transport_hint || event.ticket_hint) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {event.transport_hint && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-300">
                <Train className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Di chuyển / Metro
                  </span>
                  <span>{event.transport_hint}</span>
                </div>
              </div>
            )}

            {event.ticket_hint && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300">
                <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Vé / Đặt trước
                  </span>
                  <span>{event.ticket_hint}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
            {event.description}
          </p>
        )}

        {/* Food Section (Dish Explorer) */}
        {event.dishes && event.dishes.length > 0 && (
          <DishExplorer
            dishes={event.dishes}
            cityName={cityName}
            placeName={event.place_name}
            placeZh={event.place_zh}
          />
        )}

        {/* Travel Tips / Notes */}
        {event.tips && (
          <div className="flex items-start gap-2.5 bg-amber-500/10 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 p-3 rounded-xl text-xs leading-relaxed border border-amber-300/60 dark:border-amber-700/50">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5 text-amber-700 dark:text-amber-400">
                Mẹo &amp; Lưu ý thực tế:
              </strong>
              <span>{event.tips}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

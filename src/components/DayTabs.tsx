import React, { useRef, useEffect, useState, useCallback } from "react";
import { DayPlan } from "../types/itinerary";
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Layers,
  ListFilter,
  RotateCcw,
  Wallet,
} from "lucide-react";

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  todayDayNumber?: number | null;
  viewMode?: "single" | "all";
  onToggleViewMode?: (mode: "single" | "all") => void;
  onResetCache?: () => void;
  onOpenBudgetModal?: () => void;
  totalBudgetRmb?: number;
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
  viewMode = "single",
  onToggleViewMode,
  onResetCache,
  onOpenBudgetModal,
  totalBudgetRmb,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to display left/right navigation hints
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, days.length]);

  // Auto-scroll active day tab into view smoothly
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
      setTimeout(updateScrollButtons, 350);
    }
  }, [selectedDay, updateScrollButtons]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const activeDayObj = days.find((d) => d.day_number === selectedDay) || days[0];

  return (
    <>
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2">
          {/* Top Bar with Quick Jump Selector & View Mode Switcher */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden xs:inline">Lịch trình</span>
                <span className="text-amber-400 font-black">{days.length} ngày</span>
              </span>

              {todayDayNumber && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Hôm nay: Ngày {todayDayNumber}
                </span>
              )}

              {onResetCache && (
                <button
                  type="button"
                  onClick={onResetCache}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] sm:text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer"
                  title="Xóa cache bộ nhớ tạm và nạp lại lịch trình 16 ngày đầy đủ"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Xóa cache (Tải đủ 16 ngày)</span>
                  <span className="sm:hidden">Làm mới 16 ngày</span>
                </button>
              )}
            </div>

            {/* Right actions: Quick Grid Modal, Budget Modal & View Mode Toggle */}
            <div className="flex items-center gap-1.5">
              {onOpenBudgetModal && (
                <button
                  type="button"
                  onClick={onOpenBudgetModal}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Xem tổng hợp ngân sách & chi phí chuyến đi"
                >
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span>Ngân sách</span>
                  {typeof totalBudgetRmb === "number" && totalBudgetRmb > 0 && (
                    <span className="hidden sm:inline-block pl-1 border-l border-slate-900/30 text-[10px]">
                      ¥{totalBudgetRmb.toLocaleString("vi-VN")}
                    </span>
                  )}
                </button>
              )}
              {/* View Mode Toggle: Single Day vs All Days */}
              {onToggleViewMode && (
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onToggleViewMode("single")}
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "single"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Xem chi tiết từng ngày riêng biệt"
                  >
                    <ListFilter className="w-3 h-3" />
                    <span className="hidden xs:inline">Từng ngày</span>
                    <span className="xs:hidden">1 ngày</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleViewMode("all")}
                    className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "all"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Xem toàn bộ tất cả ngày liên tục trên 1 trang (cuộn dọc)"
                  >
                    <Layers className="w-3 h-3" />
                    <span className="hidden xs:inline">Tất cả {days.length} ngày</span>
                    <span className="xs:hidden">Tất cả</span>
                  </button>
                </div>
              )}

              {/* Quick Grid Selector Button */}
              <button
                type="button"
                onClick={() => setIsGridModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                title="Bấm để mở danh sách chọn nhanh ngày"
              >
                <span className="hidden sm:inline">Chọn nhanh ngày</span>
                <span className="sm:hidden">Ngày {selectedDay}/{days.length}</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Day Cards with Left/Right Touch Arrows */}
          <div className="relative flex items-center group">
            {/* Left Scroll Chevron Arrow */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={handleScrollLeft}
                className="absolute left-0 z-20 w-7 h-11 sm:w-8 sm:h-12 bg-slate-900/95 hover:bg-slate-800 text-amber-400 rounded-r-xl border-y border-r border-slate-700/80 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
                title="Cuộn sang ngày trước"
                aria-label="Cuộn sang trái"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth w-full"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
              }}
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
                    className={`flex flex-col items-start min-w-[86px] xs:min-w-[96px] sm:min-w-[132px] px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-left transition-all shrink-0 cursor-pointer relative group ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-[1.02] border border-amber-300"
                        : "bg-slate-800/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    {/* Today Badge indicator */}
                    {isToday && (
                      <span
                        className={`absolute -top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider shadow-xs ${
                          isActive
                            ? "bg-slate-950 text-emerald-400 border border-slate-800"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        Hôm nay
                      </span>
                    )}

                    {/* Day Label */}
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                      <span
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] font-black shrink-0 ${
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
                        className={`text-[9px] sm:text-[10px] truncate max-w-[80px] xs:max-w-[90px] sm:max-w-[120px] font-medium mt-0.5 ${
                          isActive ? "text-slate-950 font-semibold" : "text-slate-400"
                        }`}
                      >
                        {day.date.replace(/Ngày\s*\d+\s*[:：]?\s*/i, "")}
                      </span>
                    )}

                    {/* City */}
                    <div
                      className={`flex items-center gap-1 text-[10px] sm:text-[11px] truncate max-w-[80px] xs:max-w-[90px] sm:max-w-[125px] font-medium mt-0.5 sm:mt-1 ${
                        isActive ? "text-slate-950 font-bold" : "text-slate-300"
                      }`}
                    >
                      <MapPin
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${
                          isActive ? "text-red-700" : "text-red-400"
                        }`}
                      />
                      <span className="truncate">
                        {day.city ? day.city.split("(")[0].trim() : `Chặng ${day.day_number}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Chevron Arrow */}
            {canScrollRight && (
              <button
                type="button"
                onClick={handleScrollRight}
                className="absolute right-0 z-20 h-11 sm:h-12 px-2 bg-gradient-to-l from-slate-900 via-slate-900/95 to-slate-900/80 hover:bg-slate-800 text-amber-400 rounded-l-xl border-y border-l border-slate-700/80 flex items-center justify-center gap-1 shadow-lg transition-all active:scale-90 cursor-pointer"
                title="Cuộn sang các ngày tiếp theo"
                aria-label="Cuộn sang phải"
              >
                <span className="text-[10px] font-black hidden xs:inline sm:hidden text-amber-300">
                  +{days.length - 2}
                </span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Mobile Helper Hint to reassure user they can swipe or tap to see all days */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1 sm:hidden">
            <span>
              Đang xem: <strong className="text-amber-400">Ngày {selectedDay}</strong> ({activeDayObj?.city || ""})
            </span>
            <span className="text-slate-500">
              Vuốt ngang ➔ còn {days.length} ngày
            </span>
          </div>
        </div>
      </div>

      {/* Quick Day Grid Selector Modal */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Danh Sách Đầy Đủ {days.length} Ngày
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bấm vào bất kỳ ngày nào để xem ngay lịch trình chi tiết
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/60 shadow-xs ring-1 ring-amber-500/40"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Ngày {day.day_number}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                        {day.city || `Chặng ${day.day_number}`}
                      </p>
                      {day.date && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {day.date}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md font-mono">
                        {day.events?.length || 0} điểm
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom modal actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {onToggleViewMode && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleViewMode("all");
                    setIsGridModalOpen(false);
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Xem toàn bộ {days.length} ngày trên một trang cuộn</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsGridModalOpen(false)}
                className="ml-auto py-1.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

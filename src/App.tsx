import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { TripDocument } from "./types/itinerary";
import {
  getSavedTrips,
  saveTrip,
  deleteTrip,
  getActiveTripId,
  setActiveTripId,
} from "./lib/storage";
import { SAMPLE_TRIPS } from "./data/sampleTrips";
import { DayTabs } from "./components/DayTabs";
import { TimelineCard } from "./components/TimelineCard";
import { HotelCard } from "./components/HotelCard";
import { FileDropzone } from "./components/FileDropzone";
import { ChinaSurvivalGuide } from "./components/ChinaSurvivalGuide";
import {
  Compass,
  Plus,
  Share2,
  Download,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  WifiOff,
  Printer,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";

export function App() {
  const [trips, setTrips] = useState<TripDocument[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTripsDrawerOpen, setIsTripsDrawerOpen] = useState<boolean>(false);
  const [isSurvivalGuideOpen, setIsSurvivalGuideOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Initialize trips from storage
  useEffect(() => {
    const loadedTrips = getSavedTrips();
    setTrips(loadedTrips);

    const activeId = getActiveTripId();
    if (activeId && loadedTrips.some((t) => t.id === activeId)) {
      setCurrentTripId(activeId);
    } else if (loadedTrips.length > 0) {
      setCurrentTripId(loadedTrips[0].id || "");
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const currentTrip = trips.find((t) => t.id === currentTripId) || trips[0];

  // Set selected day safely
  const activeDayPlan =
    currentTrip?.days?.find((d) => d.day_number === selectedDayNumber) ||
    currentTrip?.days?.[0];

  const handleSelectTrip = (id: string) => {
    setCurrentTripId(id);
    setActiveTripId(id);
    setSelectedDayNumber(1);
    setIsTripsDrawerOpen(false);
    toast.info("Đã chuyển sang lịch trình mới");
  };

  const handleImportParsed = (newTrip: TripDocument) => {
    const updated = saveTrip(newTrip);
    setTrips(updated);
    setCurrentTripId(newTrip.id || "");
    setSelectedDayNumber(1);
    setIsImportModalOpen(false);
    toast.success("Đã lưu lịch trình thành công vào máy!");
  };

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_TRIPS.find((s) => s.id === sampleId);
    if (sample) {
      const updated = saveTrip(sample);
      setTrips(updated);
      setCurrentTripId(sample.id || "");
      setSelectedDayNumber(1);
      setIsImportModalOpen(false);
      toast.success(`Đã mở: ${sample.trip_title}`);
    }
  };

  const handleDeleteCurrentTrip = (tripId: string) => {
    if (trips.length <= 1) {
      toast.warning("Bạn cần giữ lại ít nhất một lịch trình du lịch");
      return;
    }
    const updated = deleteTrip(tripId);
    setTrips(updated);
    setCurrentTripId(updated[0]?.id || "");
    setSelectedDayNumber(1);
    toast.success("Đã xóa lịch trình");
  };

  const handleExportJSON = () => {
    if (!currentTrip) return;
    const blob = new Blob([JSON.stringify(currentTrip, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTrip.trip_title.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file JSON lịch trình!");
  };

  const handleShareSummary = () => {
    if (!currentTrip) return;
    const summary = `✈️ LỊCH TRÌNH DU LỊCH: ${currentTrip.trip_title} (${currentTrip.duration})\n\n${currentTrip.days
      .map(
        (d) =>
          `📅 Ngày ${d.day_number} (${d.city}): ${d.title}\n` +
          d.events
            .map(
              (e) => ` • [${e.time_slot}] ${e.activity_title} (${e.place_zh})`
            )
            .join("\n")
      )
      .join("\n\n")}`;

    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast.success("Đã sao chép tóm tắt lịch trình để gửi Zalo / Wechat!");
      })
      .catch(() => {
        toast.error("Không thể sao chép");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header / App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  TripWise <span className="text-amber-400">China</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Offline Ready
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden xs:block">
                Lịch trình thông minh &bull; Amap &bull; Ẩm thực Baidu &bull; Ngoại tuyến
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Survival Guide */}
            <button
              type="button"
              onClick={() => setIsSurvivalGuideOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Cẩm nang du lịch Trung Quốc (Alipay, Amap, 12306, VPN)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cẩm Nang</span>
            </button>

            {/* Trips Switcher */}
            <button
              type="button"
              onClick={() => setIsTripsDrawerOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Quản lý các chuyến đi đã lưu"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Chuyến Đi ({trips.length})</span>
            </button>

            {/* New / Import Button */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nhập File / AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Offline Alert Banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 no-print">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Bạn đang ở chế độ Ngoại Tuyến (Offline). Dữ liệu đã lưu trên máy vẫn hoạt động đầy đủ!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto pb-16">
        {currentTrip ? (
          <div>
            {/* Trip Hero Banner */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4 pt-6 pb-5 border-b border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      {currentTrip.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      <Calendar className="w-3 h-3" />
                      {currentTrip.days.length} ngày lịch trình
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {currentTrip.trip_title}
                  </h1>
                </div>

                {/* Quick actions for current trip */}
                <div className="flex items-center gap-2 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={handleShareSummary}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Sao chép tóm tắt chia sẻ"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px]">Chia sẻ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Tải file JSON dự phòng"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px]">Xuất file</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="In lịch trình / Lưu PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">In / PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Day Tabs Navigation */}
            <DayTabs
              days={currentTrip.days}
              selectedDay={selectedDayNumber}
              onSelectDay={(dayNum) => {
                setSelectedDayNumber(dayNum);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            />

            {/* Day Detail View */}
            {activeDayPlan && (
              <div className="px-3 sm:px-4 pt-5">
                {/* Active Day Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 mb-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeDayPlan.date || `Ngày ${activeDayPlan.day_number}`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {activeDayPlan.city}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {activeDayPlan.title}
                  </h2>
                </div>

                {/* Hotel Card if hotel info is present */}
                {activeDayPlan.hotel && <HotelCard hotel={activeDayPlan.hotel} />}

                {/* Timeline Events Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Lịch trình chi tiết trong ngày ({activeDayPlan.events.length} hoạt động)
                    </h3>
                  </div>

                  <div className="space-y-1">
                    {activeDayPlan.events.map((event, idx) => (
                      <TimelineCard key={idx} event={event} index={idx} />
                    ))}
                  </div>
                </div>

                {/* Day Navigation Buttons */}
                <div className="flex items-center justify-between gap-3 pt-6 pb-8 border-t border-slate-200 dark:border-slate-800 mt-6 no-print">
                  <button
                    type="button"
                    disabled={activeDayPlan.day_number <= 1}
                    onClick={() => {
                      setSelectedDayNumber((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Ngày trước</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    {activeDayPlan.day_number} / {currentTrip.days.length}
                  </span>

                  <button
                    type="button"
                    disabled={activeDayPlan.day_number >= currentTrip.days.length}
                    onClick={() => {
                      setSelectedDayNumber((prev) =>
                        Math.min(currentTrip.days.length, prev + 1)
                      );
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Ngày tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State if no trips */
          <div className="p-8 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Chưa có lịch trình nào được lưu
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tải lên file Word (.docx), Markdown hoặc dán văn bản để Gemini AI trích xuất lịch trình thông minh.
            </p>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Nhập Lịch Trình Ngay
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Bar for Mobile */}
      <div className="fixed bottom-3 inset-x-0 mx-auto max-w-sm px-3 z-30 sm:hidden no-print">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2 shadow-2xl border border-slate-700/80 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setIsSurvivalGuideOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-amber-400 p-1.5 font-medium"
          >
            <BookOpen className="w-4 h-4" />
            <span>Cẩm Nang</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTripsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-slate-300 p-1.5 font-medium"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Chuyến Đi</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Nhập Mới</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <FileDropzone
              onParsedSuccess={handleImportParsed}
              onSelectSample={handleSelectSample}
            />
          </div>
        </div>
      )}

      {/* Trips Drawer / Modal */}
      {isTripsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Danh Sách Lịch Trình ({trips.length})
                </h3>
              </div>
              <button
                onClick={() => setIsTripsDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {trips.map((trip) => {
                const isSelected = trip.id === currentTripId;
                return (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id || "")}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {trip.duration}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          &bull; {trip.days.length} ngày
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {trip.trip_title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrentTrip(trip.id || "");
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Xóa lịch trình này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsTripsDrawerOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lịch Trình Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* China Survival Guide Modal */}
      <ChinaSurvivalGuide
        isOpen={isSurvivalGuideOpen}
        onClose={() => setIsSurvivalGuideOpen(false)}
      />

      {/* Global Toast Container */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;

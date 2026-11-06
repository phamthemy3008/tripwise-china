import React, { useState } from "react";
import { DayPlan, ActivityEvent } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { AmapButton } from "./AmapButton";
import {
  Sparkles,
  X,
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Utensils,
  Lightbulb,
  Check,
  Compass,
  Loader2,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { heuristicSmartMatch } from "../lib/gemini";

interface SmartAutoAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DayPlan[];
  exchangeRate?: number;
  onAddEventToDay: (dayNumber: number, event: ActivityEvent) => void;
  onSelectDayView?: (dayNumber: number) => void;
}

export const SmartAutoAddModal: React.FC<SmartAutoAddModalProps> = ({
  isOpen,
  onClose,
  days,
  exchangeRate = 3500,
  onAddEventToDay,
  onSelectDayView,
}) => {
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    matched_day_number: number;
    matched_city: string;
    confidence_score: number;
    match_reason: string;
    alternative_days?: number[];
    event: ActivityEvent;
  } | null>(null);

  // Editable fields in preview
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<string>("Tối");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedPlaceVn, setEditedPlaceVn] = useState<string>("");
  const [editedPlaceZh, setEditedPlaceZh] = useState<string>("");
  const [editedAmap, setEditedAmap] = useState<string>("");
  const [editedTransport, setEditedTransport] = useState<string>("");
  const [editedTips, setEditedTips] = useState<string>("");
  const [editedCostRmb, setEditedCostRmb] = useState<string>("");

  if (!isOpen) return null;

  const quickPills = [
    { label: "🍲 Lẩu Hang Động Trùng Khánh", q: "Lẩu Hang Động (Động Cực Lẩu - 洞穴火锅)" },
    { label: "🧋 Bá Vương Trà Cơ (CHAGEE)", q: "Bá Vương Trà Cơ (CHAGEE 霸王茶姬)" },
    { label: "🐼 Vườn Gấu Trúc Thành Đô", q: "Cơ sở Gấu Trúc Thành Đô" },
    { label: "🚡 Cáp Treo Trường Giang", q: "Cáp treo Trường Giang Trùng Khánh" },
    { label: "🏮 Phố Đèn Lồng Cẩm Lý", q: "Phố cổ Cẩm Lý Thành Đô" },
    { label: "🏔️ Kim Đỉnh Nga Mi Sơn", q: "Kim Đỉnh Núi Nga Mi" },
  ];

  const handleSearchAndAnalyze = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      toast.warning("Vui lòng nhập tên địa điểm hoặc trải nghiệm cần bổ sung!");
      return;
    }

    setIsSearching(true);
    const toastId = toast.loading(`Đang phân tích và đối chiếu "${q}" với lịch trình...`);

    const tripDaysSummary = days.map((d) => ({
      day_number: d.day_number,
      date: d.date,
      city: d.city,
      title: d.title,
      existing_places: (d.events || []).map((e) => e.place_name),
    }));

    try {
      let data: any = null;
      try {
        const res = await fetch("/api/smart-match-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            tripDays: tripDaysSummary,
          }),
        });
        const resJson = await res.json();
        if (res.ok && resJson.success && resJson.data) {
          data = resJson.data;
        }
      } catch (err) {
        console.warn("Backend match call failed, using client heuristic engine:", err);
      }

      // If backend fails or not available, use local instant heuristic
      if (!data) {
        data = heuristicSmartMatch(q, tripDaysSummary);
      }

      if (data && data.matched_day_number && data.event) {
        setAnalysisResult(data);
        setSelectedDayNum(data.matched_day_number);
        setSelectedSlot(data.event.time_slot || "Tối");
        setEditedTitle(data.event.activity_title || "");
        setEditedPlaceVn(data.event.place_name || q);
        setEditedPlaceZh(data.event.place_zh || "");
        setEditedAmap(data.event.amap_query || "");
        setEditedTransport(data.event.transport_hint || "");
        setEditedTips(data.event.tips || "");
        setEditedCostRmb(data.event.cost_rmb ? String(data.event.cost_rmb) : "");

        toast.success(
          `✨ Đã tìm thấy ngày phù hợp: Ngày ${data.matched_day_number} (${data.matched_city})!`,
          { id: toastId }
        );
      } else {
        throw new Error("Không thể phân tích địa điểm. Vui lòng thử lại với từ khóa khác.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi tìm và đối chiếu địa điểm", { id: toastId });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmInsert = () => {
    if (!analysisResult) return;

    const targetDay = days.find((d) => d.day_number === selectedDayNum);
    if (!targetDay) {
      toast.error(`Không tìm thấy Ngày ${selectedDayNum} trong lịch trình!`);
      return;
    }

    const rmbNum = editedCostRmb ? parseFloat(editedCostRmb) : undefined;
    const vndNum = rmbNum && !isNaN(rmbNum) ? Math.round(rmbNum * exchangeRate) : undefined;

    const newEvent: ActivityEvent = {
      ...analysisResult.event,
      time_slot: selectedSlot,
      activity_title: editedTitle.trim() || analysisResult.event.activity_title,
      place_name: editedPlaceVn.trim() || analysisResult.event.place_name,
      place_zh: editedPlaceZh.trim() || analysisResult.event.place_zh,
      amap_query: editedAmap.trim() || analysisResult.event.amap_query,
      transport_hint: editedTransport.trim() || analysisResult.event.transport_hint,
      tips: editedTips.trim() || analysisResult.event.tips,
      cost_rmb: rmbNum && !isNaN(rmbNum) ? rmbNum : analysisResult.event.cost_rmb,
      cost_vnd: vndNum,
      cost_category: analysisResult.event.cost_category || "food",
    };

    onAddEventToDay(selectedDayNum, newEvent);

    toast.success(
      `🎉 Đã thêm thành công "${newEvent.place_name}" vào Ngày ${selectedDayNum} (${targetDay.city})!`,
      {
        duration: 4500,
        action: {
          label: "Xem ngày này",
          onClick: () => {
            if (onSelectDayView) onSelectDayView(selectedDayNum);
          },
        },
      }
    );

    if (onSelectDayView) {
      onSelectDayView(selectedDayNum);
    }

    onClose();
  };

  const selectedTargetDayPlan = days.find((d) => d.day_number === selectedDayNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Tìm & Tự Động Bổ Sung Vào Lịch Trình
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                  Tự Tìm Ngày
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chỉ cần gõ tên quán/địa điểm, hệ thống tự đối chiếu toàn bộ các ngày và điền đầy đủ thông tin chuẩn Amap.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nhập tên địa điểm, quán ăn, trà sữa hoặc trải nghiệm bạn muốn ghé:
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchAndAnalyze();
                  }
                }}
                placeholder="VD: Lẩu Hang Động Trùng Khánh, Bá Vương Trà Cơ, Gấu Trúc..."
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                disabled={isSearching || !query.trim()}
                onClick={() => handleSearchAndAnalyze()}
                className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isSearching ? "Đang tìm..." : "Phân tích"}</span>
              </button>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(pill.q);
                    handleSearchAndAnalyze(pill.q);
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Top AI Match Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/30">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center gap-1 border border-emerald-500/30">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Độ phù hợp: {analysisResult.confidence_score}%
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      Khu vực: <strong>{analysisResult.matched_city}</strong>
                    </span>
                  </div>

                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Khuyên đặt vào: Ngày {analysisResult.matched_day_number}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Lý do AI lựa chọn:</strong> {analysisResult.match_reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Day & Slot Selection Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                {/* Select Day */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    1. Ngày trong lịch trình muốn thêm vào:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDayNum}
                      onChange={(e) => setSelectedDayNum(Number(e.target.value))}
                      className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {days.map((d) => (
                        <option key={d.day_number} value={d.day_number}>
                          Ngày {d.day_number} ({d.date || ""}) - {d.city}{" "}
                          {d.day_number === analysisResult.matched_day_number
                            ? "✨ (Khuyên dùng)"
                            : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {selectedTargetDayPlan && (
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      Lịch ngày {selectedDayNum}: {selectedTargetDayPlan.title}
                    </p>
                  )}
                </div>

                {/* Select Slot */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    2. Khung giờ thực hiện:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Sáng", "Chiều", "Tối"].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          selectedSlot === slot
                            ? "bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{slot}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Editable Event Preview */}
              <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Xem trước chi tiết thẻ hoạt động
                  </span>
                  {editedAmap && <AmapButton query={editedAmap} label="Kiểm tra Amap" />}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Tiêu đề hoạt động:
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Place VN & Place ZH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tên tiếng Việt:
                    </label>
                    <input
                      type="text"
                      value={editedPlaceVn}
                      onChange={(e) => setEditedPlaceVn(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tên chữ Hán (Tra cứu / Taxi):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editedPlaceZh}
                        onChange={(e) => setEditedPlaceZh(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-amber-600 dark:text-amber-400 font-bold"
                      />
                      {editedPlaceZh && <CopyChip text={editedPlaceZh} label="" />}
                    </div>
                  </div>
                </div>

                {/* Amap Query */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Từ khóa định vị Gaode Amap (Cao Đức):
                  </label>
                  <input
                    type="text"
                    value={editedAmap}
                    onChange={(e) => setEditedAmap(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Transport & Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Hướng dẫn di chuyển / Metro:
                    </label>
                    <textarea
                      rows={2}
                      value={editedTransport}
                      onChange={(e) => setEditedTransport(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Mẹo trải nghiệm / Lưu ý:
                    </label>
                    <textarea
                      rows={2}
                      value={editedTips}
                      onChange={(e) => setEditedTips(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 resize-none"
                    />
                  </div>
                </div>

                {/* Dishes / Highlights (if any) */}
                {analysisResult.event.dishes && analysisResult.event.dishes.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-500" />
                      <span>Món đặc sản trứ danh gợi ý kèm theo:</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {analysisResult.event.dishes.map((dish, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <span>{dish.dish_name_vn}</span>
                          <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-mono">
                            ({dish.dish_name_zh})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cost Estimation */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Chi phí dự kiến:
                    </span>
                    <input
                      type="number"
                      value={editedCostRmb}
                      onChange={(e) => setEditedCostRmb(e.target.value)}
                      placeholder="95"
                      className="w-20 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500">¥/người</span>
                  </div>

                  {editedCostRmb && !isNaN(parseFloat(editedCostRmb)) && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ≈ {(parseFloat(editedCostRmb) * exchangeRate).toLocaleString()} VNĐ
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {analysisResult ? (
            <button
              type="button"
              onClick={handleConfirmInsert}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thêm Vào Lịch Trình Ngày {selectedDayNum} Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSearching || !query.trim()}
              onClick={() => handleSearchAndAnalyze()}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Tìm & Phân Tích Ngày Phù Hợp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

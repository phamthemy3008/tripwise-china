import React, { useState } from "react";
import { ActivityEvent } from "../types/itinerary";
import { CopyChip } from "./CopyChip";
import { AmapButton } from "./AmapButton";
import {
  Sparkles,
  X,
  Plus,
  Loader2,
  MapPin,
  Clock,
  Train,
  Ticket,
  Utensils,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface SuggestActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  dayNumber: number;
  existingPlaces: string[];
  onAddEventToDay: (event: ActivityEvent) => void;
}

export const SuggestActivitiesModal: React.FC<SuggestActivitiesModalProps> = ({
  isOpen,
  onClose,
  city,
  dayNumber,
  existingPlaces,
  onAddEventToDay,
}) => {
  const [category, setCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<ActivityEvent[]>([]);
  const [addedPlaces, setAddedPlaces] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    const toastId = toast.loading(`Gemini AI đang tìm địa điểm hấp dẫn tại ${city}...`);
    try {
      const response = await fetch("/api/suggest-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          dayNumber,
          existingPlaces,
          category,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Không thể tải gợi ý địa điểm");
      }

      setSuggestions(resJson.data || []);
      toast.success(`Đã tìm thấy ${resJson.data?.length || 0} gợi ý phù hợp!`, {
        id: toastId,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi lấy gợi ý", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (item: ActivityEvent) => {
    onAddEventToDay(item);
    setAddedPlaces((prev) => new Set(prev).add(item.place_name));
    toast.success(`Đã thêm "${item.place_name}" vào Ngày ${dayNumber}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gợi Ý Thêm Hoạt Động Cho Ngày {dayNumber}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>Khu vực: <strong>{city}</strong></span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters & Generate Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "Tất cả" },
              { id: "sightseeing", label: "Danh lam thắng cảnh" },
              { id: "food", label: "Ẩm thực & Chợ đêm" },
              { id: "culture", label: "Di tích & Bảo tàng" },
              { id: "hot", label: "Check-in Hot Trend" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  category === cat.id
                    ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleFetchSuggestions}
            className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang tìm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gợi ý bằng Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* Content Body: Suggestions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {suggestions.length === 0 && !isLoading ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Chưa có gợi ý nào được tạo
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Bấm nút <strong>"Gợi ý bằng Gemini AI"</strong> ở trên để AI gợi ý các điểm đến, quán ăn và trải nghiệm độc đáo tại {city}.
              </p>
              <button
                type="button"
                onClick={handleFetchSuggestions}
                className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const isAdded = addedPlaces.has(item.place_name);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-2.5 transition-all hover:border-amber-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          {item.time_slot} {item.time_range ? `(${item.time_range})` : ""}
                        </span>
                        {item.duration_hint && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            {item.duration_hint}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {item.activity_title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAdd(item)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isAdded
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-default"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 shadow-xs active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã thêm ✓</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>+ Thêm vào ngày này</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Place & Chinese Name */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {item.place_name}
                    </span>
                    {item.place_zh && <CopyChip text={item.place_zh} highlight />}
                    <AmapButton query={item.amap_query || item.place_zh || item.place_name} />
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      {item.description}
                    </p>
                  )}

                  {/* Metro and Ticket hints */}
                  {(item.transport_hint || item.ticket_hint) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {item.transport_hint && (
                        <div className="flex items-start gap-1.5 text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/20 p-2 rounded-lg">
                          <Train className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                          <span>{item.transport_hint}</span>
                        </div>
                      )}
                      {item.ticket_hint && (
                        <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-2 rounded-lg">
                          <Ticket className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                          <span>{item.ticket_hint}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dishes recommendation */}
                  {item.dishes && item.dishes.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg">
                      <Utensils className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">
                        Món ngon gợi ý: {item.dishes.map((d) => `${d.dish_name_vn} (${d.dish_name_zh})`).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Wallet,
  X,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  TrendingUp,
  PieChart,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plane,
  Building,
  Ticket,
  Utensils,
  RefreshCw,
  DollarSign,
  Layers,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument, CustomExpenseItem } from "../types/itinerary";
import {
  calculateTripBudgetSummary,
  formatRmb,
  formatVnd,
  DEFAULT_EXCHANGE_RATE,
  CATEGORY_LABELS,
  getHotelCostRmb,
  getEventCostRmb,
  inferEventCategory,
} from "../lib/budgetUtils";
import { ExpenseAnalyticsDashboard } from "./ExpenseAnalyticsDashboard";

interface BudgetTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
  onOpenCostEdit: (dayIndex: number, eventIndex?: number, isHotel?: boolean) => void;
  onOpenHotelCalculator?: () => void;
  onOpenTransportCalculator?: (type?: "flight" | "train" | "didi" | "metro") => void;
}

export const BudgetTrackerModal: React.FC<BudgetTrackerModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  onOpenCostEdit,
  onOpenHotelCalculator,
  onOpenTransportCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "categories" | "days" | "custom">("overview");
  const [isSettingBudgetCap, setIsSettingBudgetCap] = useState<boolean>(false);
  const [budgetCappingRmb, setBudgetCappingRmb] = useState<string>(
    trip.budget_cap_rmb ? String(trip.budget_cap_rmb) : ""
  );

  const [isEditingExchangeRate, setIsEditingExchangeRate] = useState<boolean>(false);
  const [exchangeRateStr, setExchangeRateStr] = useState<string>(
    String(trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE)
  );

  // Expanded day index for detailed daily item list
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);

  // New custom expense form state
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customRmb, setCustomRmb] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<CustomExpenseItem["category"]>("flight");
  const [customNote, setCustomNote] = useState<string>("");

  if (!isOpen) return null;

  const summary = calculateTripBudgetSummary(trip);

  const handleSaveBudgetCap = () => {
    const val = budgetCappingRmb !== "" ? parseFloat(budgetCappingRmb) : undefined;
    if (val !== undefined && (isNaN(val) || val < 0)) {
      toast.error("Hạn mức ngân sách không hợp lệ");
      return;
    }

    const updated: TripDocument = {
      ...trip,
      budget_cap_rmb: val,
      updated_at: new Date().toISOString(),
    };
    onUpdateTrip(updated);
    setIsSettingBudgetCap(false);
    toast.success("Đã lưu hạn mức ngân sách!");
  };

  const handleSaveExchangeRate = () => {
    const rate = parseFloat(exchangeRateStr);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Tỷ giá không hợp lệ");
      return;
    }
    const updated: TripDocument = {
      ...trip,
      exchange_rate_rmb_vnd: rate,
      updated_at: new Date().toISOString(),
    };
    onUpdateTrip(updated);
    setIsEditingExchangeRate(false);
    toast.success(`Đã cập nhật tỷ giá: 1 RMB = ${rate.toLocaleString("vi-VN")} VND`);
  };

  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      toast.error("Vui lòng nhập tên khoản chi");
      return;
    }
    const rmbNum = customRmb !== "" ? parseFloat(customRmb) : undefined;
    if (rmbNum === undefined || isNaN(rmbNum) || rmbNum < 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const newItem: CustomExpenseItem = {
      id: "exp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: customTitle.trim(),
      category: customCategory,
      cost_rmb: rmbNum,
      cost_vnd: rmbNum * summary.exchangeRate,
      note: customNote.trim() || undefined,
    };

    const existingCustom = trip.custom_expenses || [];
    const updated: TripDocument = {
      ...trip,
      custom_expenses: [...existingCustom, newItem],
      updated_at: new Date().toISOString(),
    };

    onUpdateTrip(updated);
    setCustomTitle("");
    setCustomRmb("");
    setCustomNote("");
    setIsAddingCustom(false);
    toast.success("Đã thêm khoản chi mới!");
  };

  const handleDeleteCustomExpense = (id: string) => {
    const existingCustom = trip.custom_expenses || [];
    const updated: TripDocument = {
      ...trip,
      custom_expenses: existingCustom.filter((item) => item.id !== id),
      updated_at: new Date().toISOString(),
    };
    onUpdateTrip(updated);
    toast.success("Đã xóa khoản chi");
  };

  const handleCopySummaryText = () => {
    const lines = [
      `📊 BÁO CÁO NGÂN SÁCH CHUYẾN ĐI: ${trip.trip_title}`,
      `Thời gian: ${trip.dates_summary || "Lịch trình du lịch"}`,
      `---------------------------------`,
      `💰 TỔNG CHI PHÍ: ${formatRmb(summary.totalSpentRmb)} RMB (~ ${formatVnd(summary.totalSpentVnd)})`,
      summary.budgetCapRmb
        ? `🎯 Hạn mức: ${formatRmb(summary.budgetCapRmb)} | Còn lại: ${formatRmb(summary.remainingRmb)}`
        : `🎯 Hạn mức: Chưa đặt`,
      `💱 Tỷ giá: 1 RMB = ${summary.exchangeRate.toLocaleString("vi-VN")} VND`,
      ``,
      `📁 CHI PHÍ THEO PHÂN LOẠI:`,
    ];

    summary.categoryBreakdowns.forEach((cat) => {
      lines.push(` • ${cat.categoryLabel}: ${formatRmb(cat.totalRmb)} (~ ${formatVnd(cat.totalVnd)})`);
    });

    lines.push(``);
    lines.push(`📅 CHI PHÍ TỪNG NGÀY:`);
    summary.daySummaries.forEach((day) => {
      lines.push(
        ` • Ngày ${day.dayNumber} (${day.cityName}): ${formatRmb(day.totalRmb)} (Vé: ${formatRmb(
          day.activitiesCostRmb
        )} | KS: ${formatRmb(day.hotelCostRmb)})`
      );
    });

    lines.push(``);
    lines.push(`Tạo bởi TripWise China ✨`);

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Đã sao chép tổng hợp chi phí vào khay nhớ tạm!");
  };

  const percentUsed = summary.budgetCapRmb ? Math.min(100, Math.round((summary.totalSpentRmb / summary.budgetCapRmb) * 100)) : 0;
  const isOverBudget = summary.budgetCapRmb ? summary.totalSpentRmb > summary.budgetCapRmb : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                Quản Lý Ngân Sách & Chi Phí Chuyến Đi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {trip.trip_title} &bull; Tỷ giá 1 RMB = {summary.exchangeRate.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTransportCalculator && (
              <button
                type="button"
                onClick={() => onOpenTransportCalculator()}
                className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Chia tiền vé máy bay, tàu gaotie, DiDi & metro"
              >
                <Plane className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Chia Tiền Vé & Xe</span>
              </button>
            )}

            {onOpenHotelCalculator && (
              <button
                type="button"
                onClick={onOpenHotelCalculator}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Máy tính tự động chia tiền phòng nhiều đêm & chia theo số người"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Chia Tiền KS</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummaryText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sao chép báo cáo chi phí gửi Zalo/Facebook"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Sao chép báo cáo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Key Metrics Banner */}
        <div className="bg-slate-950/80 p-4 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Box 1: Total Spent */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                💰 TỔNG CHI PHÍ DỰ DỰNG
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 leading-none">
                {formatRmb(summary.totalSpentRmb)}
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                ~ {formatVnd(summary.totalSpentVnd)}
              </div>
            </div>

            {/* Box 2: Budget Cap */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  🎯 HẠN MỨC MỤC TIÊU
                </span>
                <button
                  type="button"
                  onClick={() => setIsSettingBudgetCap(!isSettingBudgetCap)}
                  className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  {summary.budgetCapRmb ? "Sửa" : "+ Đặt hạn mức"}
                </button>
              </div>

              {isSettingBudgetCap ? (
                <div className="mt-1.5 flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Nhập hạn mức RMB (VD: 10000)"
                    value={budgetCappingRmb}
                    onChange={(e) => setBudgetCappingRmb(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveBudgetCap}
                    className="p-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="text-base font-extrabold text-white">
                    {summary.budgetCapRmb ? formatRmb(summary.budgetCapRmb) : "Chưa thiết lập"}
                  </div>
                  {summary.budgetCapRmb && (
                    <div
                      className={`text-[11px] font-bold mt-0.5 ${
                        isOverBudget ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isOverBudget
                        ? `Vượt ${formatRmb(Math.abs(summary.remainingRmb || 0))}`
                        : `Còn lại ${formatRmb(summary.remainingRmb)}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Box 3: Exchange Rate */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  💱 TỶ GIÁ TỆ (RMB)
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingExchangeRate(!isEditingExchangeRate)}
                  className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Sửa tỷ giá
                </button>
              </div>

              {isEditingExchangeRate ? (
                <div className="mt-1.5 flex items-center gap-1">
                  <input
                    type="number"
                    value={exchangeRateStr}
                    onChange={(e) => setExchangeRateStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveExchangeRate}
                    className="p-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="text-lg font-extrabold text-white">
                    1 RMB = {summary.exchangeRate.toLocaleString("vi-VN")} ₫
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Tự động quy đổi RMB ➔ VND
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar if cap exists */}
          {summary.budgetCapRmb && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Tiến độ chi tiêu</span>
                <span className={isOverBudget ? "text-rose-400 font-bold" : "text-amber-400"}>
                  {percentUsed}% {isOverBudget && "(Vượt hạn mức)"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverBudget ? "bg-rose-500" : percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Tổng Quan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Biểu Đồ & Phân Tích
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "categories"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Theo Danh Mục ({summary.categoryBreakdowns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("days")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "days"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Theo Ngày ({summary.daySummaries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "custom"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Khoản Chi Khác ({(trip.custom_expenses || []).length})
          </button>
        </div>

        {/* Tab Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Activities Subtotal */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-amber-400" /> Vé & Hoạt động
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {summary.totalSpentRmb > 0
                          ? Math.round((summary.activitiesSpentRmb / summary.totalSpentRmb) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white mt-2">
                      {formatRmb(summary.activitiesSpentRmb)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ~ {formatVnd(summary.activitiesSpentRmb * summary.exchangeRate)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("days")}
                    className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Xem & sửa giá vé từng hoạt động</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hotel Subtotal */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-400" /> Khách sạn & Lưu trú
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {summary.totalSpentRmb > 0
                          ? Math.round((summary.hotelsSpentRmb / summary.totalSpentRmb) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white mt-2">
                      {formatRmb(summary.hotelsSpentRmb)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ~ {formatVnd(summary.hotelsSpentRmb * summary.exchangeRate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab("categories")}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Xem & sửa tiền phòng</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {onOpenHotelCalculator && (
                      <button
                        type="button"
                        onClick={onOpenHotelCalculator}
                        className="text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calculator className="w-3 h-3 text-amber-400" />
                        <span>🧮 Chia tiền nhiều đêm</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Analytics CTA banner in overview */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm">Biểu Đồ & Cảnh Báo Bội Chi Recharts</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Xem cơ cấu phân bổ Donut, tiến độ chi tiêu theo ngày và hạn mức từng nhóm chi phí.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("analytics")}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>Xem Biểu Đồ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick instructions banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Cách nhập & chỉnh sửa chi phí khách sạn & vé:</p>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    • Nếu bạn ở khách sạn A nhiều đêm (ví dụ 1200 RMB từ ngày 4-10) và đi 2 người, hãy bấm nút <strong>"🧮 Máy tính chia tiền KS"</strong> ở trên để hệ thống tự động quy đổi & điền vào từng đêm!
                    <br />• Bạn cũng có thể nhấn tab <strong>"Theo Ngày"</strong> hoặc <strong>"Theo Danh Mục"</strong> để tự chỉnh giá từng đêm.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL ANALYTICS DASHBOARD (RECHARTS) */}
          {activeTab === "analytics" && (
            <ExpenseAnalyticsDashboard
              trip={trip}
              summary={summary}
              onUpdateTrip={onUpdateTrip}
              onOpenCostEdit={onOpenCostEdit}
            />
          )}

          {/* TAB 3: CATEGORIES BREAKDOWN */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              {summary.categoryBreakdowns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có thông tin chi phí. Hãy nhập chi phí cho hoạt động hoặc khách sạn.
                </div>
              ) : (
                summary.categoryBreakdowns.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cat.color}`}>
                          {cat.categoryLabel}
                        </span>
                        <span className="text-xs text-slate-400">({cat.count} mục chi phí)</span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-white">
                          {formatRmb(cat.totalRmb)}
                        </div>
                        <div className="text-[11px] text-slate-400">~ {formatVnd(cat.totalVnd)}</div>
                      </div>
                    </div>

                    {/* Detailed list of items in this category */}
                    <div className="mt-2 space-y-2 pt-2 border-t border-slate-700/50">
                      {cat.category === "hotel" ? (
                        // Hotels List
                        trip.days.map((dayPlan, dayIdx) => {
                          const hotelCost = getHotelCostRmb(dayPlan.hotel);
                          return (
                            <div
                              key={"hotel_cat_" + dayIdx}
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
                                  Ngày {dayPlan.day_number} &bull; {dayPlan.city}
                                </span>
                                <h5 className="font-extrabold text-white truncate">
                                  {dayPlan.hotel?.name_vn || "Khách sạn lưu trú đêm nay"}
                                </h5>
                                {dayPlan.hotel?.cost_note && (
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {dayPlan.hotel.cost_note}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-extrabold text-emerald-400 text-xs">
                                  {formatRmb(hotelCost)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenCostEdit(dayIdx, undefined, true)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Chỉnh sửa tiền phòng khách sạn này"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Sửa giá phòng</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Activities / Custom Items in this category
                        trip.days.map((dayPlan, dayIdx) =>
                          dayPlan.events
                            .map((evt, evtIdx) => ({ evt, evtIdx }))
                            .filter(({ evt }) => inferEventCategory(evt) === cat.category)
                            .map(({ evt, evtIdx }) => {
                              const cost = getEventCostRmb(evt);
                              return (
                                <div
                                  key={`evt_cat_${dayIdx}_${evtIdx}`}
                                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-amber-400 block">
                                      Ngày {dayPlan.day_number} ({dayPlan.city})
                                    </span>
                                    <h5 className="font-bold text-white truncate">
                                      {evt.activity_title}
                                    </h5>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-extrabold text-amber-400 text-xs">
                                      {formatRmb(cost)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onOpenCostEdit(dayIdx, evtIdx, false)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span>Sửa</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: DAILY EXPENDITURE (ITEMIZED EXPANDABLE DAYS) */}
          {activeTab === "days" && (
            <div className="space-y-3">
              {trip.days.map((dayPlan, idx) => {
                const daySummary = summary.daySummaries[idx];
                const isExpanded = expandedDayIndex === idx;
                const hotelCost = getHotelCostRmb(dayPlan.hotel);

                return (
                  <div
                    key={dayPlan.day_number}
                    className="rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden transition-all"
                  >
                    {/* Day Header Row */}
                    <div
                      onClick={() => setExpandedDayIndex(isExpanded ? null : idx)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-amber-400">
                            Ngày {dayPlan.day_number}
                          </span>
                          <span className="text-xs font-bold text-white">&bull; {dayPlan.city}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Vé & HĐ: {formatRmb(daySummary?.activitiesCostRmb || 0)}</span>
                          <span>&bull; KS: {formatRmb(hotelCost)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-amber-300">
                            {formatRmb(daySummary?.totalRmb || 0)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ~ {formatVnd(daySummary?.totalVnd || 0)}
                          </div>
                        </div>

                        <div className="p-1 rounded-lg bg-slate-700/80 text-slate-300">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Itemized Breakdown List for this day */}
                    {isExpanded && (
                      <div className="p-3.5 bg-slate-950/70 border-t border-slate-700/60 space-y-2.5 animate-in fade-in duration-150">
                        {/* Hotel Item */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-extrabold text-indigo-400 uppercase block">
                                Khách Sạn Lưu Trú
                              </span>
                              <h5 className="font-bold text-white truncate">
                                {dayPlan.hotel?.name_vn || "Khách sạn lưu trú đêm nay"}
                              </h5>
                              {dayPlan.hotel?.cost_note && (
                                <p className="text-[10px] text-slate-400 truncate">
                                  {dayPlan.hotel.cost_note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                              <span className="font-extrabold text-emerald-400 text-xs block">
                                {formatRmb(hotelCost)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ~ {formatVnd(hotelCost * summary.exchangeRate)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenCostEdit(idx, undefined, true)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Sửa giá phòng khách sạn đêm này"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa tiền phòng</span>
                            </button>
                          </div>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Các Hoạt Động & Vé Tham Quan:
                          </span>

                          {dayPlan.events.map((evt, evtIdx) => {
                            const cost = getEventCostRmb(evt);
                            return (
                              <div
                                key={`day_evt_${idx}_${evtIdx}`}
                                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-400 shrink-0">
                                    {evt.time_slot}
                                  </span>
                                  <h5 className="font-semibold text-slate-200 truncate">
                                    {evt.activity_title}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-extrabold text-amber-400 text-xs">
                                    {formatRmb(cost)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onOpenCostEdit(idx, evtIdx, false)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Sửa chi phí hoạt động này"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Sửa giá</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: CUSTOM EXPENSES (FLIGHTS, VISA, ESIM, SHOPPING) */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  Các khoản chi khác (Vé máy bay, Visa, eSIM, Ăn uống)
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm khoản chi
                </button>
              </div>

              {/* Add form */}
              {isAddingCustom && (
                <form
                  onSubmit={handleAddCustomExpense}
                  className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 animate-in fade-in"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Tên khoản chi *
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Vé máy bay VietJet Hà Nội - Quảng Châu"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Chi phí RMB (¥) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="VD: 1200"
                        value={customRmb}
                        onChange={(e) => setCustomRmb(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Danh mục
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="flight">Vé máy bay & Tàu hỏa</option>
                        <option value="visa">Visa & Thủ tục</option>
                        <option value="esim">SIM / eSIM 4G</option>
                        <option value="insurance">Bảo hiểm du lịch</option>
                        <option value="shopping">Ăn uống & Mua sắm</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Ghi chú
                      </label>
                      <input
                        type="text"
                        placeholder="Ghi chú tùy chọn"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Lưu Khoản Chi
                    </button>
                  </div>
                </form>
              )}

              {/* List of custom expenses */}
              {(trip.custom_expenses || []).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có khoản chi riêng nào. Nhấn "+ Thêm khoản chi" để thêm vé máy bay, eSIM hoặc Visa.
                </div>
              ) : (
                (trip.custom_expenses || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-white">{item.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-amber-300">
                          {CATEGORY_LABELS[item.category]?.label || item.category}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-amber-400">
                          {formatRmb(item.cost_rmb)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~ {formatVnd((item.cost_rmb || 0) * summary.exchangeRate)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustomExpense(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Xóa khoản chi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

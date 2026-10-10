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
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument, CustomExpenseItem } from "../types/itinerary";
import {
  calculateTripBudgetSummary,
  formatRmb,
  formatVnd,
  DEFAULT_EXCHANGE_RATE,
  CATEGORY_LABELS,
} from "../lib/budgetUtils";

interface BudgetTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDocument;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
  onOpenCostEdit: (dayIndex: number, eventIndex?: number, isHotel?: boolean) => void;
}

export const BudgetTrackerModal: React.FC<BudgetTrackerModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  onOpenCostEdit,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "days" | "custom">("overview");
  const [isSettingBudgetCap, setIsSettingBudgetCap] = useState<boolean>(false);
  const [budgetCappingRmb, setBudgetCappingRmb] = useState<string>(
    trip.budget_cap_rmb ? String(trip.budget_cap_rmb) : ""
  );

  const [isEditingExchangeRate, setIsEditingExchangeRate] = useState<boolean>(false);
  const [exchangeRateStr, setExchangeRateStr] = useState<string>(
    String(trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE)
  );

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
              <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                Ngân Sách & Chi Phí
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {trip.trip_title}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Theo dõi tổng chi phí vé, khách sạn & máy bay thực tế
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummaryText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Sao chép tóm tắt chi phí"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
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

        {/* Top Total Executive Banner */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Box 1: Total Spent */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> TỔNG CHI PHÍ DỰ DỰNG
              </span>
              <div className="mt-1">
                <div className="text-2xl font-black text-amber-400 tracking-tight">
                  {formatRmb(summary.totalSpentRmb)}
                </div>
                <div className="text-xs font-medium text-slate-300 mt-0.5">
                  ~ {formatVnd(summary.totalSpentVnd)}
                </div>
              </div>
            </div>

            {/* Box 2: Budget Cap */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  🎯 HẠN MỨC NGÂN SÁCH
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
                    placeholder="RMB (VD: 5000)"
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
                  <div className="text-lg font-extrabold text-white">
                    {summary.budgetCapRmb ? formatRmb(summary.budgetCapRmb) : "Chưa thiết lập"}
                  </div>
                  {summary.remainingRmb !== undefined && (
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        isOverBudget ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isOverBudget
                        ? `Vượt ngân sách ${formatRmb(Math.abs(summary.remainingRmb))}`
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
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-400" /> Vé & Hoạt động
                    </span>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {formatRmb(summary.activitiesSpentRmb)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ~ {formatVnd(summary.activitiesSpentRmb * summary.exchangeRate)}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {summary.totalSpentRmb > 0
                      ? Math.round((summary.activitiesSpentRmb / summary.totalSpentRmb) * 100)
                      : 0}
                    %
                  </span>
                </div>

                {/* Hotel Subtotal */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-400" /> Khách sạn & Lưu trú
                    </span>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {formatRmb(summary.hotelsSpentRmb)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ~ {formatVnd(summary.hotelsSpentRmb * summary.exchangeRate)}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {summary.totalSpentRmb > 0
                      ? Math.round((summary.hotelsSpentRmb / summary.totalSpentRmb) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {/* Quick instructions banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Cách nhập & chỉnh sửa chi phí:</p>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    • Bạn có thể nhấn trực tiếp vào thẻ <strong>"Giá vé"</strong> hoặc{" "}
                    <strong>"Giá phòng"</strong> ở từng thẻ lịch trình để cập nhật giá RMB thực tế.
                    <br />• Muốn thêm vé máy bay, SIM 4G/eSIM, Visa hoặc các khoản chi cố định, chọn tab{" "}
                    <strong>"Khoản Chi Khác"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES BREAKDOWN */}
          {activeTab === "categories" && (
            <div className="space-y-3">
              {summary.categoryBreakdowns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Chưa có thông tin chi phí. Hãy nhập chi phí cho hoạt động hoặc khách sạn.
                </div>
              ) : (
                summary.categoryBreakdowns.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cat.color}`}>
                        {cat.categoryLabel}
                      </span>
                      <span className="text-xs text-slate-400">({cat.count} mục)</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">
                        {formatRmb(cat.totalRmb)}
                      </div>
                      <div className="text-[11px] text-slate-400">~ {formatVnd(cat.totalVnd)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: DAILY EXPENDITURE */}
          {activeTab === "days" && (
            <div className="space-y-3">
              {summary.daySummaries.map((day, idx) => (
                <div
                  key={day.dayNumber}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-amber-400">
                        Ngày {day.dayNumber}
                      </span>
                      <span className="text-xs font-bold text-white">&bull; {day.cityName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Vé & HĐ: {formatRmb(day.activitiesCostRmb)}</span>
                      <span>KS: {formatRmb(day.hotelCostRmb)}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-amber-300">
                        {formatRmb(day.totalRmb)}
                      </div>
                      <div className="text-[10px] text-slate-400">~ {formatVnd(day.totalVnd)}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCostEdit(idx, 0, false)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer"
                      title="Sửa chi phí ngày này"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CUSTOM EXPENSES (FLIGHTS, VISA, ESIM, SHOPPING) */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  Các khoản chi khác (Vé máy bay, Visa, eSIM, An uống)
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

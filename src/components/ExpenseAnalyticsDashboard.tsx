import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  SlidersHorizontal,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Info,
  Calendar,
  Utensils,
  Car,
  Building,
  Ticket,
  Plane,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { TripDocument } from "../types/itinerary.js";
import {
  TripBudgetSummary,
  formatRmb,
  formatVnd,
  CATEGORY_LABELS,
} from "../lib/budgetUtils.js";

interface ExpenseAnalyticsDashboardProps {
  trip: TripDocument;
  summary: TripBudgetSummary;
  onUpdateTrip: (updatedTrip: TripDocument) => void;
  onOpenCostEdit: (dayIndex: number, eventIndex?: number, isHotel?: boolean) => void;
}

export const ExpenseAnalyticsDashboard: React.FC<ExpenseAnalyticsDashboardProps> = ({
  trip,
  summary,
  onUpdateTrip,
}) => {
  const [currencyMode, setCurrencyMode] = useState<"rmb" | "vnd">("rmb");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCapCat, setEditingCapCat] = useState<string | null>(null);
  const [editingCapValue, setEditingCapValue] = useState<string>("");

  const exchangeRate = summary.exchangeRate;

  // Format amount based on current currency mode
  const formatAmount = (rmbValue: number) => {
    if (currencyMode === "rmb") {
      return formatRmb(rmbValue);
    }
    return formatVnd(rmbValue * exchangeRate);
  };

  // Prepare Donut Chart Data
  const donutData = summary.categoryBreakdowns.map((cat) => ({
    id: cat.category,
    name: cat.categoryLabel,
    value: currencyMode === "rmb" ? cat.totalRmb : Math.round(cat.totalVnd),
    rmb: cat.totalRmb,
    vnd: cat.totalVnd,
    percent: summary.totalSpentRmb > 0 ? (cat.totalRmb / summary.totalSpentRmb) * 100 : 0,
    color: cat.hexColor,
    count: cat.count,
  }));

  // Prepare Daily Bar Chart Data
  const barData = summary.daySummaries.map((day) => ({
    dayNumber: `N${day.dayNumber}`,
    fullDay: `Ngày ${day.dayNumber}`,
    city: day.cityName,
    value: currencyMode === "rmb" ? day.totalRmb : Math.round(day.totalVnd),
    rmb: day.totalRmb,
    vnd: day.totalVnd,
    activitiesRmb: day.activitiesCostRmb,
    hotelRmb: day.hotelCostRmb,
  }));

  const avgDailyRmb =
    summary.daySummaries.length > 0
      ? summary.totalSpentRmb / summary.daySummaries.length
      : 0;
  const avgDailyValue = currencyMode === "rmb" ? avgDailyRmb : avgDailyRmb * exchangeRate;

  // Overbudget categories count
  const overBudgetCats = summary.categoryStatuses.filter((s) => s.isOverBudget);

  // Handle saving a category budget cap
  const handleSaveCategoryCap = (categoryKey: string) => {
    const val = editingCapValue.trim() !== "" ? parseFloat(editingCapValue) : undefined;
    if (val !== undefined && (isNaN(val) || val < 0)) {
      toast.error("Vui lòng nhập số tiền hạn mức hợp lệ");
      return;
    }

    const currentCaps = { ...(trip.category_budget_caps || {}) };
    if (val === undefined || val === 0) {
      delete currentCaps[categoryKey];
    } else {
      currentCaps[categoryKey] = val;
    }

    const updatedTrip: TripDocument = {
      ...trip,
      category_budget_caps: currentCaps,
      updated_at: new Date().toISOString(),
    };

    onUpdateTrip(updatedTrip);
    setEditingCapCat(null);
    setEditingCapValue("");
    toast.success(`Đã cập nhật hạn mức cho ${CATEGORY_LABELS[categoryKey]?.label || categoryKey}`);
  };

  // Smart Auto-allocation of category budget caps based on total trip budget cap
  const handleAutoAllocateCaps = () => {
    const totalCap = trip.budget_cap_rmb || (summary.totalSpentRmb > 0 ? summary.totalSpentRmb * 1.15 : 12000);
    
    // Recommended travel ratios: Hotel ~35%, Food ~25%, Transport ~20%, Ticket ~15%, Shopping/Other ~5%
    const suggestedCaps: Record<string, number> = {
      hotel: Math.round(totalCap * 0.35),
      food: Math.round(totalCap * 0.25),
      transport: Math.round(totalCap * 0.20),
      ticket: Math.round(totalCap * 0.15),
      shopping: Math.round(totalCap * 0.05),
    };

    const updatedTrip: TripDocument = {
      ...trip,
      category_budget_caps: suggestedCaps,
      updated_at: new Date().toISOString(),
    };

    onUpdateTrip(updatedTrip);
    toast.success("Đã tự động tính toán hạn mức chuẩn cho các danh mục!", {
      description: `Dựa trên ngân sách ước tính ¥${totalCap.toLocaleString()} RMB`,
    });
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hotel":
        return <Building className="w-4 h-4 text-emerald-400" />;
      case "food":
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case "transport":
        return <Car className="w-4 h-4 text-blue-400" />;
      case "ticket":
        return <Ticket className="w-4 h-4 text-purple-400" />;
      case "flight":
        return <Plane className="w-4 h-4 text-sky-400" />;
      case "shopping":
        return <ShoppingBag className="w-4 h-4 text-rose-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-slate-400" />;
    }
  };

  // Custom Donut Tooltip
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300 font-mono font-bold text-sm">
            {formatRmb(data.rmb)}{" "}
            <span className="text-[11px] font-normal text-slate-400 font-sans">
              ({formatVnd(data.vnd)})
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Tỷ trọng chi tiêu:</span>
            <span className="font-bold text-amber-400">{data.percent.toFixed(1)}%</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Số mục đã chi: {data.count} lượt
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Bar Chart Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1">
          <div className="font-extrabold text-white text-sm flex items-center justify-between gap-3">
            <span>{data.fullDay}</span>
            <span className="text-amber-400 text-xs font-semibold">{data.city}</span>
          </div>
          <div className="text-slate-200 font-mono font-bold text-sm">
            Tổng ngày: {formatRmb(data.rmb)}
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            {formatVnd(data.vnd)}
          </div>
          <div className="pt-1.5 border-t border-slate-800 space-y-0.5 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Hoạt động & Ăn uống:</span>
              <span className="font-mono">{formatRmb(data.activitiesRmb)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Khách sạn & Lưu trú:</span>
              <span className="font-mono">{formatRmb(data.hotelRmb)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & Financial KPI Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-amber-400" />
            <span>Phân Tích Chi Tiêu &amp; Cảnh Báo Vượt Mức</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Trực quan hóa cơ cấu chi phí, so sánh biểu đồ ngày và kiểm soát bội chi ngân sách.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrencyMode("rmb")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currencyMode === "rmb"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ¥ Nhân Dân Tệ
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode("vnd")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currencyMode === "vnd"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ₫ Tiền Việt (VND)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Spent */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Tổng Chi Tiêu
          </span>
          <p className="text-base sm:text-lg font-black font-mono text-white truncate">
            {formatAmount(summary.totalSpentRmb)}
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            {currencyMode === "rmb" ? formatVnd(summary.totalSpentVnd) : formatRmb(summary.totalSpentRmb)}
          </span>
        </div>

        {/* Card 2: Daily Average */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Bình Quân / Ngày
          </span>
          <p className="text-base sm:text-lg font-black font-mono text-amber-400 truncate">
            {formatAmount(avgDailyRmb)}
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            Trên tổng {summary.daySummaries.length} ngày lịch trình
          </span>
        </div>

        {/* Card 3: Top Category */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Danh Mục Lớn Nhất
          </span>
          <p className="text-sm sm:text-base font-extrabold text-white truncate">
            {summary.categoryBreakdowns[0]?.categoryLabel || "Chưa có dữ liệu"}
          </p>
          <span className="text-[10px] font-mono text-slate-400 block truncate">
            {summary.categoryBreakdowns[0]
              ? `${formatAmount(summary.categoryBreakdowns[0].totalRmb)} (${(
                  (summary.categoryBreakdowns[0].totalRmb / (summary.totalSpentRmb || 1)) *
                  100
                ).toFixed(0)}%)`
              : "0 ¥"}
          </span>
        </div>

        {/* Card 4: Overspending Alert Status */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 transition-colors ${
            overBudgetCats.length > 0
              ? "bg-rose-950/30 border-rose-800/60 text-rose-300"
              : "bg-slate-950/80 border-slate-800/80 text-emerald-400"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider block">
            Cảnh Báo Bội Chi
          </span>
          <div className="flex items-center gap-1.5">
            {overBudgetCats.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-sm sm:text-base font-black text-rose-400">
                  {overBudgetCats.length} Mục Vượt Mức
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm sm:text-base font-black text-emerald-400">
                  Trong Giới Hạn
                </p>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {overBudgetCats.length > 0
              ? `Vượt tổng: +${formatAmount(
                  overBudgetCats.reduce((acc, c) => acc + c.overAmountRmb, 0)
                )}`
              : "Các danh mục kiểm soát tốt"}
          </span>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Donut Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-amber-400" />
                <span>Cơ Cấu Chi Tiêu (Donut)</span>
              </h4>
              <p className="text-[11px] text-slate-400">Tỷ trọng các nhóm chi phí chính</p>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 cursor-pointer"
              >
                Hiện tất cả
              </button>
            )}
          </div>

          {/* Recharts Donut */}
          <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomDonutTooltip />} />
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    onClick={(entry: any) => {
                      const id = entry?.id || entry?.payload?.id;
                      if (id) {
                        setSelectedCategory(selectedCategory === id ? null : id);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        stroke="#0f172a"
                        strokeWidth={2}
                        opacity={
                          selectedCategory === null || selectedCategory === entry.id
                            ? 1
                            : 0.35
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Chưa có dữ liệu chi phí cho biểu đồ
              </div>
            )}

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {selectedCategory
                  ? CATEGORY_LABELS[selectedCategory]?.label || "Danh mục"
                  : "Tổng Chi"}
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-white">
                {selectedCategory
                  ? formatAmount(
                      summary.categoryBreakdowns.find((c) => c.category === selectedCategory)
                        ?.totalRmb || 0
                    )
                  : formatAmount(summary.totalSpentRmb)}
              </span>
            </div>
          </div>

          {/* Category Chips / Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-800/80 text-xs">
            {donutData.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                }
                className={`flex items-center justify-between p-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-800 border-amber-500/60 shadow-xs"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[11px] font-semibold text-slate-300 truncate">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 pl-1 shrink-0">
                  {cat.percent.toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Daily Spending Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Tiến Độ Chi Phí Theo Từng Ngày</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Chi tiêu theo từng ngày lịch trình so với mức trung bình ({formatAmount(avgDailyRmb)}/ngày)
              </p>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <XAxis
                    dataKey="dayNumber"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    tickFormatter={(val) =>
                      currencyMode === "rmb"
                        ? `¥${val}`
                        : `${Math.round(val / 1000000)}Tr`
                    }
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine
                    y={avgDailyValue}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{
                      value: `TB: ${formatAmount(avgDailyRmb)}`,
                      fill: "#f59e0b",
                      fontSize: 9,
                      position: "top",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  >
                    {barData.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.rmb > avgDailyRmb ? "#f59e0b" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Chưa có dữ liệu theo ngày
              </div>
            )}
          </div>

          {/* Bar Chart Legend note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                <span>Bình thường</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>Vượt mức trung bình ngày</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              Rê chuột/chạm cột để xem chi tiết ngày
            </span>
          </div>
        </div>
      </div>

      {/* OVERSPENDING DETECTION & CATEGORY BUDGET LIMIT CARDS */}
      <div className="space-y-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Kiểm Soát Bội Chi Từng Nhóm Chi Phí</span>
            </h4>
            <p className="text-xs text-slate-400">
              Hệ thống theo dõi và gắn huy hiệu cảnh báo tỷ lệ % khi vượt trần ngân sách danh mục
            </p>
          </div>

          {/* Quick Auto-Allocate Button */}
          <button
            type="button"
            onClick={handleAutoAllocateCaps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Tự động phân bổ ngân sách chuẩn cho Khách sạn, Ăn uống, Tàu xe, Vé tham quan..."
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tự Động Gợi Ý Hạn Mức Chuẩn</span>
          </button>
        </div>

        {/* Category Budget Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {summary.categoryStatuses.map((catStatus) => {
            const isEditing = editingCapCat === catStatus.category;
            const hasCap = catStatus.budgetCapRmb !== undefined && catStatus.budgetCapRmb > 0;

            return (
              <div
                key={catStatus.category}
                className={`p-3.5 rounded-xl border transition-all ${
                  catStatus.isOverBudget
                    ? "bg-rose-950/20 border-rose-800/60 shadow-xs"
                    : catStatus.status === "warning"
                    ? "bg-amber-950/20 border-amber-800/60"
                    : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700"
                }`}
              >
                {/* Header: Icon, Category Name, Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
                      {getCategoryIcon(catStatus.category)}
                    </div>
                    <span className="font-bold text-xs text-white truncate">
                      {catStatus.categoryLabel}
                    </span>
                  </div>

                  {/* Percentage Status Badge */}
                  {hasCap ? (
                    catStatus.isOverBudget ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>VƯỢT {catStatus.percentUsed}%</span>
                      </span>
                    ) : catStatus.status === "warning" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <span>Chạm mức {catStatus.percentUsed}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        <span>An toàn {catStatus.percentUsed}%</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Chưa đặt giới hạn
                    </span>
                  )}
                </div>

                {/* Numbers row: Spent vs Cap */}
                <div className="flex items-baseline justify-between gap-2 text-xs mb-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Đã chi:</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {formatAmount(catStatus.spentRmb)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Hạn mức tối đa:</span>
                    {hasCap ? (
                      <span className="font-mono font-bold text-sm text-slate-300">
                        {formatAmount(catStatus.budgetCapRmb!)}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">Chưa cài đặt</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {hasCap && (
                  <div className="space-y-1 mb-2.5">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          catStatus.isOverBudget
                            ? "bg-rose-500"
                            : catStatus.status === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, catStatus.percentUsed)}%` }}
                      />
                    </div>

                    {catStatus.isOverBudget && (
                      <div className="text-[11px] font-semibold text-rose-400 flex items-center justify-between">
                        <span>Số tiền bội chi:</span>
                        <span className="font-mono font-bold">
                          +{formatAmount(catStatus.overAmountRmb)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cap Editor / Modifier */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400">Hạn mức (RMB):</span>
                    <input
                      type="number"
                      autoFocus
                      placeholder="Ví dụ: 2500"
                      value={editingCapValue}
                      onChange={(e) => setEditingCapValue(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCategoryCap(catStatus.category)}
                      className="p-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                      title="Lưu hạn mức"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCapCat(null);
                        setEditingCapValue("");
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                      title="Hủy"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">
                      {hasCap
                        ? catStatus.isOverBudget
                          ? "Cần điều chỉnh lại kế hoạch"
                          : `Còn lại: ${formatAmount(
                              Math.max(0, catStatus.budgetCapRmb! - catStatus.spentRmb)
                            )}`
                        : "Đặt hạn mức để theo dõi bội chi"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCapCat(catStatus.category);
                        setEditingCapValue(
                          catStatus.budgetCapRmb ? String(catStatus.budgetCapRmb) : ""
                        );
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>{hasCap ? "Sửa hạn mức" : "+ Đặt hạn mức"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

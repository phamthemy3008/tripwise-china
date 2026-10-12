import { TripDocument, ActivityEvent, HotelInfo, CustomExpenseItem, DayPlan } from "../types/itinerary";

export const DEFAULT_EXCHANGE_RATE = 3500; // 1 RMB = 3,500 VND

export interface CategoryBreakdown {
  category: string;
  categoryLabel: string;
  totalRmb: number;
  totalVnd: number;
  count: number;
  color: string;
  hexColor: string;
}

export interface DayExpenseSummary {
  dayNumber: number;
  dateStr?: string;
  cityName: string;
  activitiesCostRmb: number;
  hotelCostRmb: number;
  totalRmb: number;
  totalVnd: number;
}

export interface CategoryBudgetStatus {
  category: string;
  categoryLabel: string;
  spentRmb: number;
  spentVnd: number;
  budgetCapRmb?: number;
  budgetCapVnd?: number;
  percentUsed: number;
  isOverBudget: boolean;
  overAmountRmb: number;
  overAmountVnd: number;
  status: "normal" | "warning" | "danger";
  hexColor: string;
}

export interface TripBudgetSummary {
  totalSpentRmb: number;
  totalSpentVnd: number;
  activitiesSpentRmb: number;
  hotelsSpentRmb: number;
  customSpentRmb: number;
  budgetCapRmb?: number;
  budgetCapVnd?: number;
  remainingRmb?: number;
  exchangeRate: number;
  categoryBreakdowns: CategoryBreakdown[];
  daySummaries: DayExpenseSummary[];
  categoryStatuses: CategoryBudgetStatus[];
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string; hexColor: string }> = {
  hotel: { label: "Khách sạn & Lưu trú", color: "bg-emerald-500 text-white", hexColor: "#10B981" },
  food: { label: "Ẩm thực & Ăn uống", color: "bg-amber-500 text-slate-950", hexColor: "#F59E0B" },
  transport: { label: "Di chuyển & Tàu xe", color: "bg-blue-500 text-white", hexColor: "#3B82F6" },
  ticket: { label: "Vé tham quan & Hoạt động", color: "bg-purple-500 text-white", hexColor: "#8B5CF6" },
  flight: { label: "Vé máy bay", color: "bg-sky-500 text-white", hexColor: "#0EA5E9" },
  shopping: { label: "Mua sắm & Quà lưu niệm", color: "bg-rose-500 text-white", hexColor: "#F43F5E" },
  visa: { label: "Visa & Thủ tục", color: "bg-indigo-500 text-white", hexColor: "#6366F1" },
  esim: { label: "SIM / eSIM / Internet", color: "bg-teal-500 text-white", hexColor: "#14B8A6" },
  insurance: { label: "Bảo hiểm du lịch", color: "bg-emerald-600 text-white", hexColor: "#059669" },
  other: { label: "Chi phí khác", color: "bg-slate-500 text-white", hexColor: "#64748B" },
};

/**
 * Extract numbers from hints like "Vé tham quan ~55 RMB", "240 ¥/đêm", "100 RMB"
 */
export function parseCostFromHint(hint?: string): number | undefined {
  if (!hint) return undefined;
  const match = hint.match(/(\d+(?:\.\d+)?)\s*(?:RMB|¥|Yuan|Tệ)/i) || hint.match(/(?:RMB|¥|Yuan|Tệ)\s*(\d+(?:\.\d+)?)/i) || hint.match(/~(\d+(?:\.\d+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

export function formatRmb(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 ¥";
  return `¥${Math.round(amount).toLocaleString("vi-VN")}`;
}

export function formatVnd(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 ₫";
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

export function getEventCostRmb(event: ActivityEvent): number {
  if (typeof event.cost_rmb === "number") {
    return event.cost_rmb;
  }
  const parsedTicket = parseCostFromHint(event.ticket_hint);
  if (parsedTicket) return parsedTicket;

  // Check restaurant price range for dining activities
  if (event.dishes && event.dishes.length > 0) {
    for (const d of event.dishes) {
      if (d.restaurant?.price_range) {
        const parsedFood = parseCostFromHint(d.restaurant.price_range);
        if (parsedFood) return parsedFood;
      }
    }
  }

  // Check transport hint for train/bus fares
  if (event.transport_hint) {
    const parsedTransport = parseCostFromHint(event.transport_hint);
    if (parsedTransport) return parsedTransport;
  }

  return 0;
}

export function getHotelCostRmb(hotel?: HotelInfo | null): number {
  if (!hotel) return 0;
  if (typeof hotel.cost_rmb === "number") {
    return hotel.cost_rmb;
  }
  const parsed = parseCostFromHint(hotel.price_hint);
  if (parsed) return parsed;
  // If hotel has a name and no cost specified, use realistic standard 3-4 star baseline (280 RMB/night)
  if (hotel.name_vn) return 280;
  return 0;
}

/**
 * Automatically infers category for an event if not explicitly specified
 */
export function inferEventCategory(event: ActivityEvent): string {
  if (event.cost_category) return event.cost_category;
  const title = (event.activity_title || "").toLowerCase();
  const desc = (event.description || "").toLowerCase();
  const hint = (event.transport_hint || "").toLowerCase();

  if (event.dishes && event.dishes.length > 0) return "food";
  if (/lẩu|nướng|món|ẩm thực|nhà hàng|quán ăn|ăn tối|ăn trưa|cà phê|trà sữa|mì /i.test(title + " " + desc)) {
    return "food";
  }
  if (event.transport_detail || /tàu|metro|subway|taxi|didi|xe buýt|xe khách|chuyến bay|cáp treo/i.test(title + " " + hint)) {
    return "transport";
  }
  if (/mua sắm|quà|chợ đêm|phố đi bộ/i.test(title)) {
    return "shopping";
  }
  return "ticket";
}

export function calculateTripBudgetSummary(trip: TripDocument): TripBudgetSummary {
  const exchangeRate = trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE;
  let activitiesSpentRmb = 0;
  let hotelsSpentRmb = 0;
  let customSpentRmb = 0;

  const categoriesMap: Record<string, { totalRmb: number; count: number }> = {
    hotel: { totalRmb: 0, count: 0 },
    food: { totalRmb: 0, count: 0 },
    transport: { totalRmb: 0, count: 0 },
    ticket: { totalRmb: 0, count: 0 },
    flight: { totalRmb: 0, count: 0 },
    shopping: { totalRmb: 0, count: 0 },
    visa: { totalRmb: 0, count: 0 },
    esim: { totalRmb: 0, count: 0 },
    insurance: { totalRmb: 0, count: 0 },
    other: { totalRmb: 0, count: 0 },
  };

  const daySummaries: DayExpenseSummary[] = [];

  // Calculate days
  if (trip.days && Array.isArray(trip.days)) {
    trip.days.forEach((day: DayPlan) => {
      let dayActRmb = 0;
      let dayHotelRmb = 0;

      // Events
      if (day.events && Array.isArray(day.events)) {
        day.events.forEach((evt) => {
          const cost = getEventCostRmb(evt);
          if (cost > 0) {
            dayActRmb += cost;
            activitiesSpentRmb += cost;

            const cat = inferEventCategory(evt);
            if (!categoriesMap[cat]) categoriesMap[cat] = { totalRmb: 0, count: 0 };
            categoriesMap[cat].totalRmb += cost;
            categoriesMap[cat].count += 1;
          }
        });
      }

      // Hotel
      if (day.hotel) {
        const hotelCost = getHotelCostRmb(day.hotel);
        if (hotelCost > 0) {
          dayHotelRmb += hotelCost;
          hotelsSpentRmb += hotelCost;

          categoriesMap.hotel.totalRmb += hotelCost;
          categoriesMap.hotel.count += 1;
        }
      }

      const totalDayRmb = dayActRmb + dayHotelRmb;
      daySummaries.push({
        dayNumber: day.day_number,
        dateStr: day.date,
        cityName: day.city,
        activitiesCostRmb: dayActRmb,
        hotelCostRmb: dayHotelRmb,
        totalRmb: totalDayRmb,
        totalVnd: totalDayRmb * exchangeRate,
      });
    });
  }

  // Custom Expenses
  if (trip.custom_expenses && Array.isArray(trip.custom_expenses)) {
    trip.custom_expenses.forEach((item: CustomExpenseItem) => {
      let rmb = item.cost_rmb || 0;
      if (!rmb && item.cost_vnd) {
        rmb = item.cost_vnd / exchangeRate;
      }
      if (rmb > 0) {
        customSpentRmb += rmb;
        const cat = item.category || "other";
        if (!categoriesMap[cat]) categoriesMap[cat] = { totalRmb: 0, count: 0 };
        categoriesMap[cat].totalRmb += rmb;
        categoriesMap[cat].count += 1;
      }
    });
  }

  const totalSpentRmb = activitiesSpentRmb + hotelsSpentRmb + customSpentRmb;
  const totalSpentVnd = totalSpentRmb * exchangeRate;

  const budgetCapRmb = trip.budget_cap_rmb;
  const budgetCapVnd = budgetCapRmb ? budgetCapRmb * exchangeRate : undefined;
  const remainingRmb = budgetCapRmb ? budgetCapRmb - totalSpentRmb : undefined;

  const categoryBreakdowns: CategoryBreakdown[] = Object.keys(categoriesMap)
    .map((catKey) => {
      const info = CATEGORY_LABELS[catKey] || CATEGORY_LABELS.other;
      const totalRmb = categoriesMap[catKey].totalRmb;
      return {
        category: catKey,
        categoryLabel: info.label,
        totalRmb,
        totalVnd: totalRmb * exchangeRate,
        count: categoriesMap[catKey].count,
        color: info.color,
        hexColor: info.hexColor,
      };
    })
    .filter((cat) => cat.totalRmb > 0)
    .sort((a, b) => b.totalRmb - a.totalRmb);

  // Compute category budget statuses and overspending detection
  const categoryCaps = trip.category_budget_caps || {};
  const categoryStatuses: CategoryBudgetStatus[] = categoryBreakdowns.map((cat) => {
    const cap = categoryCaps[cat.category];
    const capRmb = cap !== undefined ? cap : undefined;
    const capVnd = capRmb !== undefined ? capRmb * exchangeRate : undefined;
    const percentUsed = capRmb && capRmb > 0 ? Math.round((cat.totalRmb / capRmb) * 100) : 0;
    const isOver = Boolean(capRmb && cat.totalRmb > capRmb);
    const overRmb = isOver && capRmb ? cat.totalRmb - capRmb : 0;

    let status: "normal" | "warning" | "danger" = "normal";
    if (percentUsed > 100) status = "danger";
    else if (percentUsed >= 80) status = "warning";

    return {
      category: cat.category,
      categoryLabel: cat.categoryLabel,
      spentRmb: cat.totalRmb,
      spentVnd: cat.totalVnd,
      budgetCapRmb: capRmb,
      budgetCapVnd: capVnd,
      percentUsed,
      isOverBudget: isOver,
      overAmountRmb: overRmb,
      overAmountVnd: overRmb * exchangeRate,
      status,
      hexColor: cat.hexColor,
    };
  });

  return {
    totalSpentRmb,
    totalSpentVnd,
    activitiesSpentRmb,
    hotelsSpentRmb,
    customSpentRmb,
    budgetCapRmb,
    budgetCapVnd,
    remainingRmb,
    exchangeRate,
    categoryBreakdowns,
    daySummaries,
    categoryStatuses,
  };
}

import { TripDocument, ActivityEvent, HotelInfo, CustomExpenseItem, DayPlan } from "../types/itinerary";

export const DEFAULT_EXCHANGE_RATE = 3500; // 1 RMB = 3,500 VND

export interface CategoryBreakdown {
  category: "flight" | "visa" | "esim" | "insurance" | "shopping" | "hotel" | "ticket" | "other";
  categoryLabel: string;
  totalRmb: number;
  totalVnd: number;
  count: number;
  color: string;
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
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ticket: { label: "Vé tham quan & Hoạt động", color: "bg-amber-500 text-slate-950" },
  hotel: { label: "Khách sạn & Lưu trú", color: "bg-emerald-500 text-white" },
  flight: { label: "Vé máy bay & Di chuyển", color: "bg-blue-500 text-white" },
  visa: { label: "Visa & Thủ tục", color: "bg-purple-500 text-white" },
  esim: { label: "SIM / eSIM / Internet", color: "bg-cyan-500 text-white" },
  insurance: { label: "Bảo hiểm du lịch", color: "bg-rose-500 text-white" },
  shopping: { label: "Mua sắm & An uống", color: "bg-orange-500 text-white" },
  other: { label: "Chi phí khác", color: "bg-slate-500 text-white" },
};

/**
 * Extract numbers from hints like "Vé tham quan ~55 RMB", "240 ¥/đêm", "100 RMB"
 */
export function parseCostFromHint(hint?: string): number | undefined {
  if (!hint) return undefined;
  // Match regex for numbers near RMB, ¥, or yuan
  const match = hint.match(/(\d+(?:\.\d+)?)\s*(?:RMB|¥|Yuan|Tệ)/i) || hint.match(/(?:RMB|¥|Yuan|Tệ)\s*(\d+(?:\.\d+)?)/i) || hint.match(/~(\d+(?:\.\d+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

export function formatRmb(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 ¥";
  return `¥${amount.toLocaleString("vi-VN")}`;
}

export function formatVnd(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 ₫";
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

export function getEventCostRmb(event: ActivityEvent): number {
  if (typeof event.cost_rmb === "number") {
    return event.cost_rmb;
  }
  // Try fallback parsing from ticket_hint
  const parsed = parseCostFromHint(event.ticket_hint);
  return parsed || 0;
}

export function getHotelCostRmb(hotel?: HotelInfo | null): number {
  if (!hotel) return 0;
  if (typeof hotel.cost_rmb === "number") {
    return hotel.cost_rmb;
  }
  const parsed = parseCostFromHint(hotel.price_hint);
  return parsed || 0;
}

export function calculateTripBudgetSummary(trip: TripDocument): TripBudgetSummary {
  const exchangeRate = trip.exchange_rate_rmb_vnd || DEFAULT_EXCHANGE_RATE;
  let activitiesSpentRmb = 0;
  let hotelsSpentRmb = 0;
  let customSpentRmb = 0;

  const categoriesMap: Record<string, { totalRmb: number; count: number }> = {
    ticket: { totalRmb: 0, count: 0 },
    hotel: { totalRmb: 0, count: 0 },
    flight: { totalRmb: 0, count: 0 },
    visa: { totalRmb: 0, count: 0 },
    esim: { totalRmb: 0, count: 0 },
    insurance: { totalRmb: 0, count: 0 },
    shopping: { totalRmb: 0, count: 0 },
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

            const cat = evt.cost_category || "ticket";
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
        category: catKey as any,
        categoryLabel: info.label,
        totalRmb,
        totalVnd: totalRmb * exchangeRate,
        count: categoriesMap[catKey].count,
        color: info.color,
      };
    })
    .filter((cat) => cat.totalRmb > 0);

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
  };
}

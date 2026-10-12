# Visual Expense Analytics Dashboard with Recharts

A comprehensive visual financial dashboard for TripWise that visualizes trip expenses across categories (food, transport, accommodation, tickets, flights) and daily timelines using Recharts, actively alerting travelers to overspending against custom budget caps.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the interactive clarification phase:
> - **Chart Types**: Interactive Donut Breakdown (category share & totals) alongside a Daily Spending Bar Chart (cost by day and city).
> - **App Integration**: Embedded as a dedicated **"Phân tích & Biểu đồ" (Analytics)** tab inside the existing Budget Tracker modal, providing a seamless transition between logging costs and viewing visual trends.
> - **Overspending Detection**: Percentage warning badges against custom category budget limits (e.g. ⚠️ 112% Over budget on Food), coupled with interactive sliders/inputs to set custom budget limits per category.

---

### 1. Overview & Core Concept

- **What It Does**: Provides travelers with an intuitive, interactive financial visualization suite. Users can inspect the exact percentage distribution of their spending across key trip categories (Khách sạn/Lưu trú, Ăn uống, Di chuyển/Tàu xe, Vé tham quan, Vé máy bay, v.v.), track day-by-day cost progression across 16 itinerary days, and immediately spot categories exceeding allocated budgets with color-coded warning badges.
- **Target Audience**: Independent travelers exploring China (Chongqing, Chengdu, Jiuzhaigou, etc.) who need tight control over their daily and category budgets in both Chinese Yuan (RMB ¥) and Vietnamese Dong (VND ₫).
- **Key Value**: Replaces raw tabular numbers with clear visual insights, preventing unexpected overspending on lodging, transportation, or dining before the trip concludes.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Opening Dashboard**: The traveler opens the Budget Tracker via the header badge or quick button, and clicks the new **"Biểu đồ chi tiêu" (Analytics)** tab.
2. **Category Donut Chart Exploration**:
   - A Recharts Donut chart renders on the left, color-coded by category with custom interactive tooltips showing both RMB and VND values.
   - Clicking a slice filters or highlights that category's detailed expenses.
   - The donut center displays the active total spend or hovered category share.
3. **Daily Spend Bar Chart Exploration**:
   - A Recharts Bar chart displays daily expenses for each day (Day 1 to Day 16), labeled with the city name (Trùng Khánh, Lạc Sơn, Thành Đô...).
   - A benchmark reference line shows the average daily target.
4. **Overspending Warning Badges & Thresholds**:
   - Category limit cards display progress meters with percentage badges:
     - 🟢 Normal ($< 80\%$ of budget limit)
     - 🟡 Approaching limit ($80\% - 100\%$)
     - 🔴 Over budget ($> 100\%$, with exact excess amount highlighted)
   - Quick "Đặt hạn mức" (Set Limit) button allows travelers to customize target limits for Food, Transport, Accommodation, etc.

#### Visual Identity & Layout
- **Container**: Clean, high-density dark mode theme (`bg-slate-900`, `border-slate-800`) matching TripWise's aesthetic.
- **Typography**: Display typography using clean sans headers, with financial numbers strictly rendered in tabular monospace font (`font-mono font-bold`) to prevent layout shifts.
- **Color Palette for Categories**:
  - Accommodation (Khách sạn): Emerald (`#10B981`)
  - Food & Dining (Ẩm thực): Amber / Orange (`#F59E0B`)
  - Transport (Di chuyển / Gaotie / Metro / DiDi): Blue (`#3B82F6`)
  - Sightseeing & Tickets (Vé tham quan): Violet (`#8B5CF6`)
  - Flights & Custom (Chuyến bay & khác): Cyan / Rose (`#06B6D4` / `#F43F5E`)
- **Zero-Pill Restraint**: Informational metadata uses clean unboxed text with typographic dot separators; badges are reserved strictly for semantic status indicators (Over budget / Normal).

---

### 3. Key Product Decisions & Trade-Offs

- **Recharts Library Integration**:
  - *Chosen Approach*: Install `recharts` for declarative, responsive SVG charts in React.
  - *Why*: High visual fidelity, native responsive container support (`ResponsiveContainer`), custom tooltips with dark theme, and smooth animated transitions.
  - *Alternatives Considered*: Custom CSS bars or Chart.js (Chart.js requires canvas canvas resize handlers and imperatively managing DOM contexts, whereas Recharts integrates natively with React state).
- **Category Taxonomy Enrichment**:
  - *Chosen Approach*: Explicitly normalize `food` (ẩm thực) and `transport` (di chuyển) into `budgetUtils.ts` and `itinerary.ts`, ensuring all existing activity costs and hotel costs are accurately categorized.
  - *Why*: Previously food and transport were often bucketed into shopping or other; giving them distinct buckets provides accurate categorization for the user's specific request.
- **Budget Limits Persistence**:
  - *Chosen Approach*: Store `category_budget_caps?: Record<string, number>` in `TripDocument` so customized thresholds persist in Firestore and localStorage alongside the trip.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                     TripDocument State                        │
│   (days[].events[].cost_rmb, days[].hotel, custom_expenses)   │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                   calculateTripBudgetSummary                  │
│       - Categorizes expenses: hotel, food, transport, etc.    │
│       - Aggregates daily spending & category breakdowns       │
│       - Computes overspending vs category_budget_caps         │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                      BudgetTrackerModal                       │
│  Tabs: [Tổng quan] [Biểu đồ phân tích] [Theo ngày] [Tùy chỉnh] │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    ExpenseAnalyticsDashboard                  │
│                                                               │
│   ┌───────────────────────────┐   ┌─────────────────────────┐ │
│   │   Recharts PieChart       │   │   Recharts BarChart     │ │
│   │   (Donut Category Share)  │   │   (Daily Trend by City) │ │
│   └───────────────────────────┘   └─────────────────────────┘ │
│                                                               │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │   Overspending Alert Cards & Budget Cap Configuration   │ │
│   │   (Progress bar, % badge, ⚠️ Overspending indicators)    │ │
│   └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

#### Detailed Component Plan
1. **Package Installation**: Install `recharts` and its types via `install_applet_package`.
2. **Schema & Utilities (`src/types/itinerary.ts` & `src/lib/budgetUtils.ts`)**:
   - Add `food` and `transport` into standard categories.
   - Add `category_budget_caps?: Record<string, number>` to `TripDocument`.
   - Add computation for category percentage vs caps and default baseline suggestions.
3. **New Component `src/components/ExpenseAnalyticsDashboard.tsx`**:
   - Responsive layout with Donut Chart and Daily Bar Chart.
   - Custom animated tooltip with dual currency display (¥ RMB & ₫ VND).
   - Overspending detection cards with percentage badges (`> 100%` red alert, `80-100%` warning).
   - Quick threshold adjusters allowing the user to update budget caps.
4. **Integration in `BudgetTrackerModal.tsx`**:
   - Add the `"analytics"` tab in the top tab navigation bar with an icon (`TrendingUp` / `PieChart`).
   - Mount `<ExpenseAnalyticsDashboard />` seamlessly when the tab is active.

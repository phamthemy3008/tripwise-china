export interface RestaurantRecommendation {
  name_vn: string;
  name_zh: string;
  address_hint?: string;
  amap_query?: string;
  price_range?: string;
  recommended_dish?: string;
  note?: string;
  specialty_note?: string;
  rating?: string;
}

export interface DishItem {
  dish_name_vn: string;
  dish_name_zh: string;
  google_img_keyword?: string;
  baidu_img_keyword?: string;
  restaurant?: RestaurantRecommendation;
  restaurant_name?: string;
  restaurant_zh?: string;
  restaurant_address?: string;
  price_range?: string;
  restaurant_note?: string;
}

export interface TransportDetail {
  mode?: "metro" | "taxi" | "train" | "flight" | "cableway" | "walk" | "bus" | "other";
  // Metro details
  metro_line?: string;
  departure_station_vn?: string;
  departure_station_zh?: string;
  arrival_station_vn?: string;
  arrival_station_zh?: string;
  station_count?: string;
  
  // High-Speed Train (12306 / Gaotie) details
  train_number?: string;
  train_departure_station_vn?: string;
  train_departure_station_zh?: string;
  train_arrival_station_vn?: string;
  train_arrival_station_zh?: string;
  train_duration?: string;
  seat_type_hint?: string;

  // Taxi / DiDi details
  pickup_name_vn?: string;
  pickup_name_zh?: string;
  dropoff_name_vn?: string;
  dropoff_name_zh?: string;
  estimated_duration?: string;
  estimated_fare?: string;
  
  summary?: string;
  notes?: string;
}

export interface CustomExpenseItem {
  id: string;
  title: string;
  category: "flight" | "visa" | "esim" | "insurance" | "shopping" | "hotel" | "ticket" | "other";
  cost_rmb?: number;
  cost_vnd?: number;
  date?: string;
  note?: string;
}

export interface ActivityEvent {
  time_slot: "Sáng" | "Chiều" | "Tối" | string;
  time_range?: string;
  activity_title: string;
  description?: string;
  place_name: string;
  place_zh: string;
  amap_query?: string;
  dishes?: DishItem[];
  tips?: string;
  transport_hint?: string;
  transport_detail?: TransportDetail;
  ticket_hint?: string;
  duration_hint?: string;
  // Budget tracking fields
  cost_rmb?: number;
  cost_vnd?: number;
  cost_category?: "ticket" | "food" | "transport" | "shopping" | "other";
  cost_note?: string;
}

export interface HotelInfo {
  name_vn: string;
  name_zh: string;
  address?: string;
  phone?: string;
  price_hint?: string;
  // Budget tracking fields
  cost_rmb?: number;
  cost_vnd?: number;
  cost_note?: string;
}

export interface DayPlan {
  day_number: number;
  date: string;
  city: string;
  title: string;
  hotel?: HotelInfo;
  events: ActivityEvent[];
  day_budget_cap_rmb?: number;
}

export interface TripDocument {
  id?: string;
  trip_title: string;
  duration: string;
  dates_summary?: string;
  created_at: number;
  updated_at?: string | number;
  days: DayPlan[];
  source_doc_url?: string;
  source_doc_id?: string;
  last_synced_at?: number;
  shared_at?: number;
  is_shared?: boolean;
  // Budget & Currency tracking
  exchange_rate_rmb_vnd?: number; // e.g. 3500
  budget_cap_rmb?: number;
  total_budget_cap_rmb?: number;
  total_budget_cap_vnd?: number;
  custom_expenses?: CustomExpenseItem[];
}

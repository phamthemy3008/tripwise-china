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
  ticket_hint?: string;
  duration_hint?: string;
}

export interface HotelInfo {
  name_vn: string;
  name_zh: string;
  address?: string;
  phone?: string;
}

export interface DayPlan {
  day_number: number;
  date: string;
  city: string;
  title: string;
  hotel?: HotelInfo;
  events: ActivityEvent[];
}

export interface TripDocument {
  id?: string;
  trip_title: string;
  duration: string;
  created_at: number;
  days: DayPlan[];
  source_doc_url?: string;
  source_doc_id?: string;
  last_synced_at?: number;
  shared_at?: number;
  is_shared?: boolean;
}

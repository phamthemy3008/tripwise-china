export interface DishItem {
  dish_name_vn: string;
  dish_name_zh: string;
  google_img_keyword?: string;
  baidu_img_keyword?: string;
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
}

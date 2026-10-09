import { TripDocument } from "../types/itinerary";
import { SAMPLE_TRIPS } from "../data/sampleTrips";

const CACHED_SHARED_TRIPS_KEY = "tripwise_cached_shared_trips";

export interface ShareResult {
  shareId: string;
  shareUrl: string;
}

export async function shareTrip(trip: TripDocument): Promise<ShareResult> {
  const tripId = trip.id || `trip_${Date.now()}`;
  let shareId = tripId;

  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.shareId) {
        shareId = data.shareId;
      }
    }
  } catch (err) {
    console.warn("Share API call failed, falling back to local ID:", err);
  }

  // Also cache locally in browser
  try {
    const existingCache = JSON.parse(localStorage.getItem(CACHED_SHARED_TRIPS_KEY) || "{}");
    existingCache[shareId] = trip;
    localStorage.setItem(CACHED_SHARED_TRIPS_KEY, JSON.stringify(existingCache));
  } catch {
    // ignore
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/?share=${encodeURIComponent(shareId)}`;

  return {
    shareId,
    shareUrl,
  };
}

export async function fetchSharedTrip(shareId: string): Promise<TripDocument | null> {
  if (!shareId) return null;

  // 1. Try public server API /api/share/:id
  try {
    const res = await fetch(`/api/share/${encodeURIComponent(shareId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as TripDocument;
      }
    }
  } catch (err) {
    console.warn("Could not fetch shared trip from /api/share:", err);
  }

  // 2. Try /api/trips/:id
  try {
    const res = await fetch(`/api/trips/${encodeURIComponent(shareId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as TripDocument;
      }
    }
  } catch (err) {
    console.warn("Could not fetch trip from /api/trips:", err);
  }

  // 3. Check sample trips
  const sample = SAMPLE_TRIPS.find((s) => s.id === shareId);
  if (sample) return sample;

  // 4. Check local storage cache of shared trips
  try {
    const cachedMap = JSON.parse(localStorage.getItem(CACHED_SHARED_TRIPS_KEY) || "{}");
    if (cachedMap[shareId]) {
      return cachedMap[shareId] as TripDocument;
    }
  } catch {
    // ignore
  }

  // 5. Check user-saved trips across any local accounts
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("tripwise_user_trips_") || key === "tripwise_china_trips")) {
        const val = localStorage.getItem(key);
        if (val) {
          const list = JSON.parse(val);
          if (Array.isArray(list)) {
            const match = list.find((t: any) => t.id === shareId);
            if (match) return match as TripDocument;
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export function generateShareSummaryText(trip: TripDocument, shareUrl?: string): string {
  const url =
    shareUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/?share=${encodeURIComponent(trip.id || "")}`
      : "");

  const daysSummary = trip.days
    .map((d) => {
      const mainPlaces = d.events
        .slice(0, 3)
        .map((e) => e.place_name)
        .join(", ");
      return `📅 Ngày ${d.day_number} (${d.city}): ${d.title}${mainPlaces ? `\n   📍 Điểm đến: ${mainPlaces}` : ""}`;
    })
    .join("\n\n");

  return `🇨🇳 LỊCH TRÌNH DU LỊCH TRUNG QUỐC: ${trip.trip_title.toUpperCase()}
⏱️ Thời lượng: ${trip.duration} (${trip.days.length} ngày)

${daysSummary}

👉 XEM CHI TIẾT ĐẦY ĐỦ (Bản đồ Amap, tiếng Trung, thời tiết, món ăn) KHÔNG CẦN ĐĂNG NHẬP:
🔗 ${url}

(Chia sẻ qua TripWise China)`;
}

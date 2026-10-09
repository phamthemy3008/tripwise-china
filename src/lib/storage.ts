import { TripDocument } from "../types/itinerary";
import { SAMPLE_TRIPS } from "../data/sampleTrips";

const STORAGE_KEY = "tripwise_china_trips";
const ACTIVE_TRIP_ID_KEY = "tripwise_china_active_id";

export function getSavedTrips(): TripDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with sample trips
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TRIPS));
      return SAMPLE_TRIPS;
    }
    const trips = JSON.parse(raw);
    if (!Array.isArray(trips) || trips.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TRIPS));
      return SAMPLE_TRIPS;
    }
    return trips;
  } catch (e) {
    console.warn("Error reading localStorage trips, falling back to samples:", e);
    return SAMPLE_TRIPS;
  }
}

export function saveTrip(newTrip: TripDocument): TripDocument[] {
  try {
    const currentTrips = getSavedTrips();
    // Prepend or update if id matches
    const existingIndex = currentTrips.findIndex((t) => t.id === newTrip.id);
    let updated: TripDocument[];
    if (existingIndex >= 0) {
      updated = [...currentTrips];
      updated[existingIndex] = newTrip;
    } else {
      updated = [newTrip, ...currentTrips];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, newTrip.id || "");
    return updated;
  } catch (e) {
    console.error("Failed to save trip to localStorage:", e);
    return getSavedTrips();
  }
}

export function deleteTrip(tripId: string): TripDocument[] {
  try {
    const currentTrips = getSavedTrips();
    const updated = currentTrips.filter((t) => t.id !== tripId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete trip:", e);
    return getSavedTrips();
  }
}

export function getTripById(tripId: string): TripDocument | undefined {
  const trips = getSavedTrips();
  return trips.find((t) => t.id === tripId);
}

export function getActiveTripId(): string {
  const id = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
  if (id) return id;
  const trips = getSavedTrips();
  return trips[0]?.id || "";
}

export function setActiveTripId(id: string): void {
  localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
}

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebaseClient";
import { TripDocument } from "../types/itinerary";
import { SAMPLE_TRIPS } from "../data/sampleTrips";

function getUserStorageKey(uid: string) {
  return `tripwise_user_trips_${uid}`;
}

export async function getUserTrips(uid: string): Promise<TripDocument[]> {
  let serverTrips: TripDocument[] | null = null;

  // 1. Try fetching from LXC centralized Server Sync API
  try {
    const res = await fetch(`/api/user-trips/${encodeURIComponent(uid)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        serverTrips = json.data;
      }
    }
  } catch (err) {
    console.warn("Server user-trips sync warning:", err);
  }

  // 2. Try Firebase Firestore if configured
  if (db && isFirebaseConfigured) {
    try {
      const tripsCol = collection(db, "users", uid, "trips");
      const q = query(tripsCol, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const remoteTrips = snapshot.docs.map((docSnap) => docSnap.data() as TripDocument);
        localStorage.setItem(getUserStorageKey(uid), JSON.stringify(remoteTrips));
        return remoteTrips;
      } else if (serverTrips && serverTrips.length > 0) {
        // Sync server trips up to Firestore
        for (const trip of serverTrips) {
          const tripDocRef = doc(db, "users", uid, "trips", trip.id || `trip_${Date.now()}`);
          await setDoc(tripDocRef, trip);
        }
        localStorage.setItem(getUserStorageKey(uid), JSON.stringify(serverTrips));
        return serverTrips;
      }
    } catch (err) {
      console.warn("Firestore fetch error, falling back to server/local cache:", err);
    }
  }

  // If server had trips, return and cache
  if (serverTrips && serverTrips.length > 0) {
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify(serverTrips));
    return serverTrips;
  }

  // 3. Fallback to Local Storage isolated per User UID
  const local = localStorage.getItem(getUserStorageKey(uid));
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }

  // Seed default
  localStorage.setItem(getUserStorageKey(uid), JSON.stringify(SAMPLE_TRIPS));
  return SAMPLE_TRIPS;
}

export async function saveUserTrip(uid: string, trip: TripDocument): Promise<TripDocument[]> {
  const tripId = trip.id || `trip_${Date.now()}`;
  const preparedTrip: TripDocument = { ...trip, id: tripId };

  // 1. Save to LXC Centralized Server Sync API (Syncs instantly across PC and Phone)
  let updatedFromServer: TripDocument[] | null = null;
  try {
    const res = await fetch(`/api/user-trips/${encodeURIComponent(uid)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preparedTrip),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        updatedFromServer = json.data;
      }
    }
  } catch (err) {
    console.warn("Failed to sync trip to server API:", err);
  }

  // 2. Save to Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "users", uid, "trips", tripId);
      await setDoc(docRef, preparedTrip, { merge: true });
    } catch (err) {
      console.warn("Firestore save error, saving to local cache:", err);
    }
  }

  // 3. Update local user cache
  const currentTrips = updatedFromServer || (await getUserTrips(uid));
  let updated: TripDocument[];
  const existingIdx = currentTrips.findIndex((t) => t.id === tripId);
  if (existingIdx >= 0) {
    updated = [...currentTrips];
    updated[existingIdx] = preparedTrip;
  } else {
    updated = [preparedTrip, ...currentTrips];
  }

  localStorage.setItem(getUserStorageKey(uid), JSON.stringify(updated));
  return updated;
}

export async function deleteUserTrip(uid: string, tripId: string): Promise<TripDocument[]> {
  // 1. Delete on LXC Centralized Server Sync API
  try {
    await fetch(`/api/user-trips/${encodeURIComponent(uid)}/${encodeURIComponent(tripId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Failed to delete trip on server API:", err);
  }

  // 2. Delete from Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "users", uid, "trips", tripId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete error:", err);
    }
  }

  // 3. Update local cache
  const currentTrips = await getUserTrips(uid);
  const updated = currentTrips.filter((t) => t.id !== tripId);
  localStorage.setItem(getUserStorageKey(uid), JSON.stringify(updated));
  return updated;
}

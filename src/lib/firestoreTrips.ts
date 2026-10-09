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
  // 1. If Firebase Firestore is configured
  if (db && isFirebaseConfigured) {
    try {
      const tripsCol = collection(db, "users", uid, "trips");
      const q = query(tripsCol, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const remoteTrips = snapshot.docs.map((docSnap) => docSnap.data() as TripDocument);
        // Cache to local storage for offline use
        localStorage.setItem(getUserStorageKey(uid), JSON.stringify(remoteTrips));
        return remoteTrips;
      } else {
        // First-time user: seed with sample trips in Firestore
        for (const sample of SAMPLE_TRIPS) {
          const sampleDocRef = doc(db, "users", uid, "trips", sample.id || `sample_${Date.now()}`);
          await setDoc(sampleDocRef, sample);
        }
        localStorage.setItem(getUserStorageKey(uid), JSON.stringify(SAMPLE_TRIPS));
        return SAMPLE_TRIPS;
      }
    } catch (err) {
      console.warn("Firestore fetch error, falling back to local user cache:", err);
    }
  }

  // 2. Fallback to Local Storage isolated per User UID
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

  // 1. Save to Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "users", uid, "trips", tripId);
      await setDoc(docRef, preparedTrip, { merge: true });
    } catch (err) {
      console.warn("Firestore save error, saving to local cache:", err);
    }
  }

  // 2. Update local user cache
  const currentTrips = await getUserTrips(uid);
  const existingIdx = currentTrips.findIndex((t) => t.id === tripId);
  let updated: TripDocument[];
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
  // 1. Delete from Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, "users", uid, "trips", tripId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete error:", err);
    }
  }

  // 2. Update local cache
  const currentTrips = await getUserTrips(uid);
  const updated = currentTrips.filter((t) => t.id !== tripId);
  localStorage.setItem(getUserStorageKey(uid), JSON.stringify(updated));
  return updated;
}

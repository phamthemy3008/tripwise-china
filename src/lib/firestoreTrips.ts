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

export function getUserStorageKey(uid: string) {
  return `tripwise_user_trips_${uid}`;
}

/**
 * Auto-corrects erroneous station names and outdated cached transport details in any trip
 */
export function healStationNamesInTrip(trip: TripDocument): { trip: TripDocument; changed: boolean } {
  let changed = false;
  if (!trip.days) return { trip, changed: false };

  const fullSample = SAMPLE_TRIPS[0];
  const isZhangjiajieTrip =
    trip.id === fullSample?.id ||
    trip.trip_title?.includes("Trương Gia Giới") ||
    trip.trip_title?.includes("Nga Mi") ||
    trip.trip_title?.includes("Vũ Long");

  const healedDays = trip.days.map((day, dIdx) => {
    let dayChanged = false;
    const sampleDay = isZhangjiajieTrip && fullSample?.days ? fullSample.days[dIdx] : undefined;

    const healedEvents = day.events.map((evt, eIdx) => {
      let evtChanged = false;
      const sampleEvt = sampleDay?.events?.[eIdx];
      let newEvt = { ...evt };

      // 0. Sanitize any personal passenger/booking information from cached trips
      const hasPersonalInfo =
        /(?:Hộ chiếu|HC|Passport)[:\s]*[A-Z0-9]+/i.test(newEvt.ticket_hint || "") ||
        /(?:Vé điện tử|e-ticket)[:\s]*\d{3}-\d{10}/i.test(newEvt.ticket_hint || "") ||
        /(?:PNR|Mã đặt chỗ)[:\s]*[A-Z0-9]+/i.test(newEvt.ticket_hint || "") ||
        /(?:Đơn Trip\.com)[:\s]*\d+/i.test(newEvt.ticket_hint || "") ||
        /\b[A-Z]\d{7}\b/.test(newEvt.ticket_hint || "") ||
        /\b\d{3}-\d{10}\b/.test(newEvt.ticket_hint || "");

      if (hasPersonalInfo) {
        if (day.day_number === 1) {
          newEvt.ticket_hint = "Vé máy bay lượt đi: 1,813 RMB (~6,345,500 VND) | China Southern Airlines (SGN - CAN - DYG)";
        } else if (day.day_number === 16) {
          newEvt.ticket_hint = "Vé máy bay lượt về: 1,981 RMB (~6,933,500 VND) | Sichuan Airlines 3U3903 (TFU - SGN)";
        } else {
          newEvt.ticket_hint = newEvt.ticket_hint
            ?.replace(/(?:PNR|Mã đặt chỗ|Đơn Trip\.com|Hộ chiếu|HC|Passport|Vé điện tử)[^|]*\|?/gi, "")
            ?.trim();
        }
        evtChanged = true;
      }

      // 1. Fix Day 6: Chongqing railway station -> Chongqing North
      if (
        (newEvt.place_zh === "重庆站" || newEvt.place_name?.includes("Ga Trùng Khánh –")) &&
        (newEvt.activity_title?.includes("G2436") || day.day_number === 6)
      ) {
        newEvt.place_zh = "重庆北站";
        newEvt.place_name = "Ga Trùng Khánh Bắc – Giải Phóng Bối";
        newEvt.amap_query = "重庆北站南广场";
        newEvt.activity_title = "Tàu cao tốc G2436 về trung tâm Trùng Khánh (Ga Trùng Khánh Bắc)";
        evtChanged = true;
      }

      // 2. Fix Day 7: Liziba monorail station -> Liziba
      if (newEvt.place_zh === "李子坝单轨站") {
        newEvt.place_zh = "李子坝站";
        newEvt.amap_query = "李子坝站";
        evtChanged = true;
      }

      // 3. Fix Day 10: "hướng Viêm Bắc" -> "hướng Weijianian / 韦家碾"
      if (newEvt.transport_detail?.summary?.includes("Viêm Bắc")) {
        newEvt.transport_detail = {
          ...newEvt.transport_detail,
          summary: newEvt.transport_detail.summary.replace("Viêm Bắc", "Weijianian / 韦家碾"),
        };
        evtChanged = true;
      }

      // 4. Fix Day 13: "Qingchengtrail" -> "Qingchengshan"
      if (newEvt.transport_hint?.includes("Qingchengtrail")) {
        newEvt.transport_hint = newEvt.transport_hint.replace("Qingchengtrail", "Thanh Thành Sơn (青城山站)");
        evtChanged = true;
      }

      // 5. If sample has transport_detail and current event lacks it, backfill
      if (!newEvt.transport_detail && sampleEvt?.transport_detail) {
        newEvt.transport_detail = sampleEvt.transport_detail;
        evtChanged = true;
      } else if (newEvt.transport_detail && sampleEvt?.transport_detail) {
        // Heal station names inside transport_detail if outdated
        if (
          sampleEvt.transport_detail.departure_station_vn !== newEvt.transport_detail.departure_station_vn ||
          sampleEvt.transport_detail.arrival_station_vn !== newEvt.transport_detail.arrival_station_vn ||
          sampleEvt.transport_detail.arrival_station_zh !== newEvt.transport_detail.arrival_station_zh
        ) {
          newEvt.transport_detail = {
            ...newEvt.transport_detail,
            ...sampleEvt.transport_detail,
          };
          evtChanged = true;
        }
      }

      // 6. If Day 7 evening event lacks Cave Hotpot (洞穴火锅 / 洞亭火锅), backfill it from sample
      if (day.day_number === 7 && newEvt.time_slot === "Tối") {
        const hasCaveHotpot = newEvt.dishes?.some(
          (d) => d.dish_name_zh.includes("洞穴火锅") || d.dish_name_zh.includes("洞亭火锅")
        );
        if (!hasCaveHotpot && sampleEvt?.dishes) {
          const sampleCaveDish = sampleEvt.dishes.find(
            (d) => d.dish_name_zh.includes("洞穴火锅") || d.dish_name_zh.includes("洞亭火锅")
          );
          if (sampleCaveDish) {
            newEvt.dishes = [sampleCaveDish, ...(newEvt.dishes || [])];
            evtChanged = true;
          }
        }
      }

      if (evtChanged) {
        dayChanged = true;
        changed = true;
      }
      return newEvt;
    });

    // 7. Update Day 14 hotel if still has old hotel or old price
    let updatedHotel = day.hotel;
    if (
      day.day_number === 14 &&
      (!day.hotel ||
        day.hotel.name_zh?.includes("峨眉山院子") ||
        day.hotel.name_zh?.includes("静竹时光") ||
        !day.hotel.price_hint?.includes("627"))
    ) {
      if (sampleDay?.hotel) {
        updatedHotel = sampleDay.hotel;
        dayChanged = true;
        changed = true;
      }
    }

    // 8. Sanitize Day 1 if still contains personal passenger/booking codes
    if (
      day.day_number === 1 &&
      day.events?.some(
        (e) =>
          /(?:Hộ chiếu|HC|PNR|Trip\.com|\b[A-Z]\d{7}\b|\b\d{3}-\d{10}\b)/i.test(e.ticket_hint || "") ||
          /(?:\b[A-Z]\d{7}\b)/i.test(e.description || "")
      )
    ) {
      if (sampleDay) {
        dayChanged = true;
        changed = true;
        return {
          ...day,
          title: sampleDay.title,
          events: sampleDay.events,
        };
      }
    }

    // 8.1. Sanitize Day 16 if still contains PNR or booking codes
    if (
      day.day_number === 16 &&
      day.events?.some((e) => /(?:PNR|Mã đặt chỗ)/i.test(e.ticket_hint || ""))
    ) {
      if (sampleDay) {
        dayChanged = true;
        changed = true;
        return {
          ...day,
          events: sampleDay.events,
        };
      }
    }

    // 9. Update Day 7 if lacks Guanyinqiao (Quán Âm Kiều / 观音桥) in afternoon
    if (
      day.day_number === 7 &&
      !day.events?.some(
        (e) =>
          e.place_name?.includes("Quán Âm Kiều") ||
          e.place_zh?.includes("观音桥") ||
          e.activity_title?.includes("Quán Âm Kiều") ||
          e.activity_title?.includes("Guanyinqiao")
      )
    ) {
      if (sampleDay) {
        dayChanged = true;
        changed = true;
        return {
          ...day,
          title: sampleDay.title,
          events: sampleDay.events,
        };
      }
    }

    // 10. Update Day 8 if lacks Huguang Guild Hall (湖广会馆) or Laojundong (老君洞)
    if (
      day.day_number === 8 &&
      (!day.events?.some(
        (e) =>
          e.place_name?.includes("Hồ Quảng") ||
          e.place_zh?.includes("湖广会馆") ||
          e.activity_title?.includes("Hồ Quảng") ||
          e.activity_title?.includes("Huguang")
      ) ||
        !day.events?.some(
          (e) =>
            e.place_zh?.includes("老君洞") ||
            e.activity_title?.includes("Lão Quân Động") ||
            e.description?.includes("Lão Quân Động")
        ))
    ) {
      if (sampleDay) {
        dayChanged = true;
        changed = true;
        return {
          ...day,
          title: sampleDay.title,
          events: sampleDay.events,
        };
      }
    }

    // 11. Update Day 9 if lacks Mount Jinyun (Núi Kim Vân / 缙云山) & Jingangbei (Cổ trấn Kim Cương Bi / 金刚碑)
    if (
      day.day_number === 9 &&
      !day.events?.some(
        (e) =>
          e.place_name?.includes("Kim Vân") ||
          e.place_zh?.includes("缙云山") ||
          e.place_name?.includes("Kim Cương Bi") ||
          e.place_zh?.includes("金刚碑")
      )
    ) {
      if (sampleDay) {
        dayChanged = true;
        changed = true;
        return {
          ...day,
          city: sampleDay.city,
          title: sampleDay.title,
          hotel: sampleDay.hotel || day.hotel,
          events: sampleDay.events,
        };
      }
    }

    if (dayChanged) {
      return { ...day, hotel: updatedHotel, events: healedEvents };
    }
    return day;
  });

  let healedTrip = changed ? { ...trip, days: healedDays } : trip;

  // Backfill official exchange rate (3857.1 VND/RMB) and category budget caps
  if (isZhangjiajieTrip) {
    if (!healedTrip.exchange_rate_rmb_vnd || healedTrip.exchange_rate_rmb_vnd === 3500) {
      healedTrip = {
        ...healedTrip,
        exchange_rate_rmb_vnd: fullSample?.exchange_rate_rmb_vnd || 3857.1,
      };
      changed = true;
    }
    if (!healedTrip.category_budget_caps && fullSample?.category_budget_caps) {
      healedTrip = {
        ...healedTrip,
        category_budget_caps: fullSample.category_budget_caps,
        budget_cap_rmb: healedTrip.budget_cap_rmb || fullSample.budget_cap_rmb,
      };
      changed = true;
    }
  }

  return {
    trip: healedTrip,
    changed,
  };
}

/**
 * Checks if any loaded trips are outdated versions of the 16-day sample trip
 * (e.g., old versions cached on phone that only had 2 days) and upgrades them to the complete 16 days,
 * as well as auto-healing any erroneous station names.
 */
export function upgradeTripsWithFullSample(trips: TripDocument[]): {
  upgraded: TripDocument[];
  hasChanges: boolean;
} {
  let hasChanges = false;
  const fullSample = SAMPLE_TRIPS[0];
  if (!fullSample || !fullSample.days) return { upgraded: trips, hasChanges: false };

  const upgraded = trips.map((trip) => {
    const isMatchingZhangjiajie =
      trip.id === fullSample.id ||
      trip.trip_title?.includes("Trương Gia Giới") ||
      trip.trip_title?.includes("Nga Mi") ||
      trip.trip_title?.includes("Vũ Long");

    // If it has fewer than 16 days, it's an outdated cache!
    if (isMatchingZhangjiajie && (!trip.days || trip.days.length < fullSample.days.length)) {
      hasChanges = true;
      return {
        ...fullSample,
        id: trip.id || fullSample.id,
      };
    }

    // Auto-heal station names in existing trips
    const healed = healStationNamesInTrip(trip);
    if (healed.changed) {
      hasChanges = true;
      return healed.trip;
    }

    return trip;
  });

  return { upgraded, hasChanges };
}

export async function getUserTrips(uid: string): Promise<TripDocument[]> {
  // 1. If Firebase Firestore is configured
  if (db && isFirebaseConfigured) {
    try {
      const tripsCol = collection(db, "users", uid, "trips");
      const q = query(tripsCol, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        let remoteTrips = snapshot.docs.map((docSnap) => docSnap.data() as TripDocument);
        
        // Auto-heal if remote Firestore was seeded with an older 2-day version
        const { upgraded, hasChanges } = upgradeTripsWithFullSample(remoteTrips);
        if (hasChanges) {
          remoteTrips = upgraded;
          // Asynchronously update Firestore with full 16-day data
          for (const sample of SAMPLE_TRIPS) {
            const sampleDocRef = doc(db, `users/${uid}/trips/${sample.id || `sample_${Date.now()}`}`);
            setDoc(sampleDocRef, sample, { merge: true }).catch(() => {});
          }
        }

        // Cache to local storage for offline use
        localStorage.setItem(getUserStorageKey(uid), JSON.stringify(remoteTrips));
        return remoteTrips;
      } else {
        // First-time user: seed with sample trips in Firestore
        for (const sample of SAMPLE_TRIPS) {
          const sampleDocRef = doc(db, `users/${uid}/trips/${sample.id || `sample_${Date.now()}`}`);
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
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const { upgraded, hasChanges } = upgradeTripsWithFullSample(parsed);
        if (hasChanges) {
          localStorage.setItem(getUserStorageKey(uid), JSON.stringify(upgraded));
        }
        return upgraded;
      }
    } catch {
      // ignore
    }
  }

  // Seed default
  localStorage.setItem(getUserStorageKey(uid), JSON.stringify(SAMPLE_TRIPS));
  return SAMPLE_TRIPS;
}

/**
 * Hard-resets all cached trips in localStorage and Service Worker,
 * returning the pristine full 16-day sample itinerary.
 */
export async function resetTripsToFullSample(uid?: string): Promise<TripDocument[]> {
  if (typeof window !== "undefined") {
    // Clear all trip-related localStorage keys
    try {
      localStorage.removeItem("tripwise_anonymous_trips");
      localStorage.removeItem("tripwise_china_trips");
      localStorage.removeItem("tripwise_china_active_id");
      if (uid) {
        localStorage.removeItem(getUserStorageKey(uid));
      }
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("tripwise_user_trips_") || key.startsWith("tripwise_anonymous"))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Error clearing localStorage:", e);
    }

    // Clear service worker caches
    if ("caches" in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((k) => caches.delete(k)));
      } catch (e) {
        console.warn("Error clearing caches:", e);
      }
    }
  }

  // Update Firestore if user is logged in
  if (uid && db && isFirebaseConfigured) {
    try {
      for (const sample of SAMPLE_TRIPS) {
        const sampleDocRef = doc(db, `users/${uid}/trips/${sample.id}`);
        await setDoc(sampleDocRef, sample, { merge: true });
      }
    } catch (e) {
      console.warn("Error overwriting Firestore with full 16-day sample:", e);
    }
  }

  // Save full sample to current storage
  if (typeof window !== "undefined") {
    if (uid) {
      localStorage.setItem(getUserStorageKey(uid), JSON.stringify(SAMPLE_TRIPS));
    } else {
      localStorage.setItem("tripwise_anonymous_trips", JSON.stringify(SAMPLE_TRIPS));
    }
  }

  return SAMPLE_TRIPS;
}

export async function saveUserTrip(uid: string, trip: TripDocument): Promise<TripDocument[]> {
  const tripId = trip.id || `trip_${Date.now()}`;
  const preparedTrip: TripDocument = { ...trip, id: tripId };

  // 1. Save to Firestore if available
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, `users/${uid}/trips/${tripId}`);
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
      const docRef = doc(db, `users/${uid}/trips/${tripId}`);
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

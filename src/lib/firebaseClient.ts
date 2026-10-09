import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, Firestore } from "firebase/firestore";

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Read from Vite build-time env
const buildTimeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export let isFirebaseConfigured = Boolean(
  buildTimeConfig.apiKey && buildTimeConfig.projectId
);

function initFirebase(config: typeof buildTimeConfig) {
  if (!config.apiKey || !config.projectId) return;
  try {
    app = !getApps().length ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;

    if (db && typeof window !== "undefined") {
      enableIndexedDbPersistence(db).catch(() => {});
    }
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

let initPromise: Promise<boolean> | null = null;

export async function ensureFirebaseReady(): Promise<boolean> {
  if (initPromise) return initPromise;

  if (isFirebaseConfigured && auth && db) {
    return true;
  }

  initPromise = (async () => {
    // 1. Try build time config
    if (buildTimeConfig.apiKey && buildTimeConfig.projectId) {
      initFirebase(buildTimeConfig);
      return true;
    }

    // 2. Fetch runtime config from server /api/config
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data?.firebase?.apiKey && data?.firebase?.projectId) {
            initFirebase(data.firebase);
            return true;
          }
        }
      } catch (err) {
        console.warn("Failed to load /api/config:", err);
      }
    }
    return false;
  })();

  return initPromise;
}

// Initial eager check
ensureFirebaseReady();

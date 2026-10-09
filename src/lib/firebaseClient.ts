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

// Initial attempt with build-time config
if (isFirebaseConfigured) {
  initFirebase(buildTimeConfig);
} else if (typeof window !== "undefined") {
  // Try fetching runtime config from server /api/config
  fetch("/api/config")
    .then((res) => res.json())
    .then((data) => {
      if (data?.firebase?.apiKey && data?.firebase?.projectId) {
        initFirebase(data.firebase);
      }
    })
    .catch(() => {});
}

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase is not configured. Set the VITE_FIREBASE_* values in your environment.");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseDb = () => getFirestore(getFirebaseApp());

let analyticsInitialization: Promise<void> | undefined;

export function initializeFirebaseAnalytics(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  analyticsInitialization ??= (async () => {
    const analytics = await import("firebase/analytics");
    if (await analytics.isSupported()) analytics.getAnalytics(getFirebaseApp());
  })();
  return analyticsInitialization;
}
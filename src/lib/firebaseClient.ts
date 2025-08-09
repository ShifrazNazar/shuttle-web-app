import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

import { env } from "~/env";

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
  storageBucket?: string;
};

const firebaseConfig: FirebaseWebConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL as string | undefined,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

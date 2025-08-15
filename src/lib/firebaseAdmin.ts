// /lib/firebaseAdmin.ts (Helper file for Firebase Admin initialization)
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "~/env";

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
        databaseURL: env.FIREBASE_ADMIN_DATABASE_URL,
      });

      adminAuth = getAuth(adminApp);
      adminDb = getFirestore(adminApp);

      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      throw error;
    }
  } else {
    const existingApp = getApps()[0];
    if (existingApp) {
      adminApp = existingApp;
      adminAuth = getAuth(adminApp);
      adminDb = getFirestore(adminApp);
    }
  }

  return { adminApp, adminAuth, adminDb };
}

export { adminAuth, adminDb };

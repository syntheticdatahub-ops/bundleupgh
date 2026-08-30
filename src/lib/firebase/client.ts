import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let safeAuth: any = null;
try {
  safeAuth = getAuth(app);
} catch (error) {
  // Ignored during build
}
export const auth = safeAuth;

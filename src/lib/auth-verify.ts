import { adminAuth } from "@/lib/firebase/admin";

export async function verifySessionJwt(token: string): Promise<{ uid: string; email?: string } | null> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? undefined,
    };
  } catch (error) {
    console.error("Firebase session token verification failed:", error);
    return null;
  }
}

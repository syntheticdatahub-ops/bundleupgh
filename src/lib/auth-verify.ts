const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function verifySessionJwt(token: string): Promise<{ uid: string; email?: string } | null> {
  if (!token || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Firebase session lookup failed:", response.status, text);
      return null;
    }

    const data = (await response.json()) as {
      users?: Array<{ localId?: string; email?: string }>;
    };

    const user = data.users?.[0];
    if (!user?.localId) {
      return null;
    }

    return {
      uid: user.localId,
      email: user.email ?? undefined,
    };
  } catch (error) {
    console.error("Firebase session token verification failed:", error);
    return null;
  }
}

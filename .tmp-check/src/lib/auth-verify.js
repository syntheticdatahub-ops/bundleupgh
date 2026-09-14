const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export async function verifySessionJwt(token) {
    var _a, _b;
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
        const data = (await response.json());
        const user = (_a = data.users) === null || _a === void 0 ? void 0 : _a[0];
        if (!(user === null || user === void 0 ? void 0 : user.localId)) {
            return null;
        }
        return {
            uid: user.localId,
            email: (_b = user.email) !== null && _b !== void 0 ? _b : undefined,
        };
    }
    catch (error) {
        console.error("Firebase session token verification failed:", error);
        return null;
    }
}

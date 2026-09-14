function encodeBase64(value) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "utf8").toString("base64");
    }
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}
function decodeBase64(value) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "base64").toString("utf8");
    }
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}
export function encodeCursor(doc, collection) {
    var _a, _b;
    const projectId = (_b = (_a = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) !== null && _a !== void 0 ? _a : process.env.FIREBASE_PROJECT_ID) !== null && _b !== void 0 ? _b : "unknown-project";
    const docPath = `projects/${projectId}/databases/(default)/documents/${collection}/${doc.id}`;
    return encodeBase64(JSON.stringify({ id: doc.id, createdAt: doc.createdAt, docPath }));
}
export function decodeCursor(token, collection) {
    var _a, _b;
    try {
        const decoded = JSON.parse(decodeBase64(token));
        if (!decoded || typeof decoded.id !== "string" || typeof decoded.createdAt !== "string")
            return null;
        const projectId = (_b = (_a = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) !== null && _a !== void 0 ? _a : process.env.FIREBASE_PROJECT_ID) !== null && _b !== void 0 ? _b : "unknown-project";
        const docPath = typeof decoded.docPath === "string" ? decoded.docPath : `projects/${projectId}/databases/(default)/documents/${collection}/${decoded.id}`;
        return { id: decoded.id, createdAt: decoded.createdAt, docPath };
    }
    catch (_c) {
        return null;
    }
}
export function encodeCursorState(tokens) {
    return encodeBase64(JSON.stringify(tokens));
}
export function decodeCursorState(token) {
    if (!token)
        return [];
    try {
        const decoded = JSON.parse(decodeBase64(token));
        return Array.isArray(decoded) ? decoded.filter((value) => typeof value === "string") : [];
    }
    catch (_a) {
        return null;
    }
}

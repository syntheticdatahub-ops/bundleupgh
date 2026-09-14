"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.encodeCursorState = encodeCursorState;
exports.decodeCursorState = decodeCursorState;
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
function encodeCursor(doc, collection) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? "unknown-project";
    const docPath = `projects/${projectId}/databases/(default)/documents/${collection}/${doc.id}`;
    return encodeBase64(JSON.stringify({ id: doc.id, createdAt: doc.createdAt, docPath }));
}
function decodeCursor(token, collection) {
    try {
        const decoded = JSON.parse(decodeBase64(token));
        if (!decoded || typeof decoded.id !== "string" || typeof decoded.createdAt !== "string")
            return null;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID ?? "unknown-project";
        const docPath = typeof decoded.docPath === "string" ? decoded.docPath : `projects/${projectId}/databases/(default)/documents/${collection}/${decoded.id}`;
        return { id: decoded.id, createdAt: decoded.createdAt, docPath };
    }
    catch {
        return null;
    }
}
function encodeCursorState(tokens) {
    return encodeBase64(JSON.stringify(tokens));
}
function decodeCursorState(token) {
    if (!token)
        return [];
    try {
        const decoded = JSON.parse(decodeBase64(token));
        return Array.isArray(decoded) ? decoded.filter((value) => typeof value === "string") : [];
    }
    catch {
        return null;
    }
}

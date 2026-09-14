"use client";
// Admin auto-refresh has been removed (Phase 1 of the Firestore read audit).
//
// Previously this component called router.refresh() every `interval` ms, which
// re-rendered the whole admin server component and re-ran every Firestore read
// (notably getOrders(), which scans the entire /orders collection) roughly every
// 10 seconds. Combined with a second 10s timer inside the orders table, this
// caused dozens of full-collection reads while an admin page was left open.
//
// Admin data now refreshes only on explicit user action or after a relevant
// admin mutation. This component is retained as a no-op placeholder so callers
// do not need to change. It MUST NOT be re-enabled with a polling interval
// without a proper push-based (realtime) mechanism.
export function AutoRefresh({ interval = 0 }) {
    void interval; // accepted for API compatibility; intentionally unused
    return null;
}

"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { DndContext, pointerWithin, DragOverlay, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { GripVerticalIcon, LayoutGridIcon, LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { AccountCards } from "@/components/dashboard/account-cards";
import { QuickTransfer } from "@/components/dashboard/quick-transfer";
import { SpendingLimit } from "@/components/dashboard/spending-limit";
import { MoneyMovement } from "@/components/dashboard/money-movement";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { HealthScore } from "@/components/dashboard/health-score";
const defaultBlocks = [
    { id: "financial-overview", label: "Financial Overview", size: "lg", component: _jsx(FinancialOverview, {}) },
    { id: "account-cards", label: "Account Cards", size: "sm", component: _jsx(AccountCards, {}) },
    { id: "transfer-spending", label: "Transfer & Spending", size: "sm", component: _jsxs("div", { className: "flex flex-col gap-4 [&>*]:flex-1", children: [_jsx(QuickTransfer, {}), _jsx(SpendingLimit, {})] }) },
    { id: "money-movement", label: "Money Movement", size: "sm", component: _jsx(MoneyMovement, {}) },
    { id: "health-score", label: "Financial Health", size: "sm", component: _jsx(HealthScore, {}) },
    { id: "recent-transactions", label: "Recent Transactions", size: "full", component: _jsx(RecentTransactions, {}) },
];
const sizeClass = {
    sm: "col-span-12 lg:col-span-4",
    lg: "col-span-12 lg:col-span-8",
    full: "col-span-12",
};
const STORAGE_KEY = "vault-dashboard-order";
// ── Null strategy: let CSS Grid handle layout, not dnd-kit transforms ──
const nullStrategy = () => null;
function SortableWidget({ block, editing, }) {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
        id: block.id,
        disabled: !editing,
    });
    return (_jsxs("div", { ref: setNodeRef, className: cn(sizeClass[block.size], "relative transition-opacity duration-200", isDragging && "opacity-30", editing && !isDragging && "rounded-xl ring-2 ring-dashed ring-primary/20"), children: [editing && (_jsxs("div", Object.assign({}, attributes, listeners, { className: "absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 cursor-grab items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground shadow-md active:cursor-grabbing", children: [_jsx(GripVerticalIcon, { className: "size-3" }), block.label] }))), _jsx("div", { className: cn("h-full [&>*]:h-full", editing && "pointer-events-none select-none"), children: block.component })] }));
}
export function DashboardCustomizer() {
    const [editing, setEditing] = useState(false);
    const [blocks, setBlocks] = useState(() => {
        if (typeof window === "undefined")
            return defaultBlocks;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const order = JSON.parse(saved);
                const reordered = order
                    .map((id) => defaultBlocks.find((b) => b.id === id))
                    .filter(Boolean);
                for (const b of defaultBlocks) {
                    if (!reordered.find((r) => r.id === b.id))
                        reordered.push(b);
                }
                return reordered;
            }
        }
        catch (_a) { }
        return defaultBlocks;
    });
    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id)
            return;
        setBlocks((prev) => {
            const oldIndex = prev.findIndex((b) => b.id === active.id);
            const newIndex = prev.findIndex((b) => b.id === over.id);
            if (oldIndex === -1 || newIndex === -1)
                return prev;
            const next = arrayMove(prev, oldIndex, newIndex);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((b) => b.id)));
            return next;
        });
    };
    const handleDragCancel = () => {
        setActiveId(null);
    };
    const handleReset = () => {
        setBlocks(defaultBlocks);
        localStorage.removeItem(STORAGE_KEY);
    };
    const activeBlock = blocks.find((b) => b.id === activeId);
    return (_jsxs("div", { className: "flex flex-1 flex-col gap-4 p-4 pt-0", children: [_jsxs("div", { className: "flex items-center justify-end gap-2", children: [editing && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-7 text-xs text-muted-foreground", onClick: handleReset, children: "Reset layout" })), _jsx(Button, { variant: editing ? "default" : "outline", size: "sm", className: "h-7 gap-1.5 text-xs", onClick: () => setEditing(!editing), children: editing ? (_jsxs(_Fragment, { children: [_jsx(LockIcon, { className: "size-3" }), "Lock"] })) : (_jsxs(_Fragment, { children: [_jsx(LayoutGridIcon, { className: "size-3" }), "Customize"] })) })] }), _jsxs(DndContext, { sensors: sensors, collisionDetection: pointerWithin, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDragCancel: handleDragCancel, children: [_jsx(SortableContext, { items: blocks.map((b) => b.id), strategy: nullStrategy, children: _jsx("div", { className: "grid grid-cols-12 gap-4", children: blocks.map((block) => (_jsx(SortableWidget, { block: block, editing: editing }, block.id))) }) }), _jsx(DragOverlay, { dropAnimation: { duration: 200, easing: "ease" }, children: activeBlock ? (_jsx("div", { className: "rounded-xl bg-card p-4 shadow-2xl ring-2 ring-primary/30 rotate-[1deg] scale-[1.02]", children: _jsx("p", { className: "text-sm font-medium text-muted-foreground", children: activeBlock.label }) })) : null })] })] }));
}

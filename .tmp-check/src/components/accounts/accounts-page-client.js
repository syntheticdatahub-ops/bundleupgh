"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { bankAccounts } from "@/data/seed";
import { cn } from "@/lib/utils";
import { AccountSummary } from "@/components/accounts/account-summary";
import { AccountCard } from "@/components/accounts/account-grid";
import { AddAccount } from "@/components/accounts/add-account";
import { EmptyState } from "@/components/empty-state";
const filterTabs = [
    { value: "all", label: "All" },
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "crypto", label: "Crypto" },
    { value: "investment", label: "Investment" },
];
export function AccountsPageClient() {
    const [selectedType, setSelectedType] = useState("all");
    const [accounts, setAccounts] = useState(bankAccounts);
    const filtered = useMemo(() => selectedType === "all"
        ? accounts
        : accounts.filter((a) => a.type === selectedType), [accounts, selectedType]);
    function handleAddAccount(account) {
        setAccounts((prev) => [...prev, account]);
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(AccountSummary, { accounts: accounts }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: filterTabs.map((tab) => (_jsx("button", { onClick: () => setSelectedType(tab.value), className: cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", selectedType === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"), children: tab.label }, tab.value))) }), filtered.length === 0 ? (_jsx(EmptyState, { variant: "filter", title: "No accounts in this category", description: "You don't have any accounts of this type yet. Try a different filter or link a new account." })) : (_jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", children: [filtered.map((account, i) => (_jsx(AccountCard, { account: account, index: i }, account.id))), _jsx(AddAccount, { onAdd: handleAddAccount })] }))] }));
}

"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { detectNetworkCode } from "@/lib/phone";
import { StepPhone } from "./step-phone";
import { StepNetwork } from "./step-network";
import { StepBundle } from "./step-bundle";
import { StepReview } from "./step-review";
import { StepStatus } from "./step-status";
const STEPS_DETECTED = ["Number", "Bundle", "Review", "Done"];
const STEPS_UNDETECTED = ["Number", "Network", "Bundle", "Review", "Done"];
function ProgressBar({ current, total }) {
    return (_jsxs("div", { className: "px-6 pt-6 pb-0", children: [_jsx("div", { className: "flex gap-1 mb-1", children: Array.from({ length: total }).map((_, i) => (_jsx("div", { className: `flex-1 h-1 rounded-full transition-all duration-500 ${i < current ? "bg-primary" : i === current - 1 ? "bg-primary/50" : "bg-muted"}` }, i))) }), _jsxs("p", { className: "text-xs text-muted-foreground text-right", children: ["Step ", Math.min(current, total), " of ", total] })] }));
}
export function BuyFlow({ initialNetworks, initialBundles }) {
    var _a, _b, _c, _d;
    const searchParams = useSearchParams();
    const initialPhone = searchParams.get("phone") || "";
    const preselectedBundleId = searchParams.get("bundleId") || null;
    const allNetworks = initialNetworks;
    // If a bundleId was passed in the URL, pre-resolve network from it
    const preselectedBundle = preselectedBundleId
        ? (_a = initialBundles.find(b => b.id === preselectedBundleId)) !== null && _a !== void 0 ? _a : null
        : null;
    const preselectedNetworkId = (_b = preselectedBundle === null || preselectedBundle === void 0 ? void 0 : preselectedBundle.networkId) !== null && _b !== void 0 ? _b : null;
    // Core state
    const [phone, setPhone] = useState(initialPhone);
    const [networkId, setNetworkId] = useState(preselectedNetworkId);
    const [bundleId, setBundleId] = useState(preselectedBundleId);
    const [stepName, setStepName] = useState("phone");
    const [flowStatus, setFlowStatus] = useState(null);
    const [orderId, setOrderId] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const detectedNetworkCode = detectNetworkCode(phone);
    const detectedNetwork = allNetworks.find(n => n.code === detectedNetworkCode) || null;
    const selectedNetwork = networkId ? allNetworks.find(n => n.id === networkId) || null : null;
    const availableBundles = networkId
        ? initialBundles
            .filter(b => b.networkId === networkId)
            .sort((a, b) => a.sellingPrice - b.sellingPrice)
        : [];
    const selectedBundle = bundleId ? initialBundles.find(b => b.id === bundleId) || null : null;
    // When a bundle is pre-selected from homepage, we always know the network — use shorter steps
    const bundlePreloaded = !!preselectedBundleId && !!preselectedBundle;
    const networkKnown = bundlePreloaded ? true : !!detectedNetwork;
    const steps = networkKnown ? STEPS_DETECTED : STEPS_UNDETECTED;
    const stepIndex = networkKnown
        ? { phone: 1, network: 1, bundle: 2, review: 3, status: 4 }
        : { phone: 1, network: 2, bundle: 3, review: 4, status: 5 };
    useEffect(() => {
        if (initialPhone.length >= 9) {
            const code = detectNetworkCode(initialPhone);
            const net = allNetworks.find(n => n.code === code);
            if (bundlePreloaded) {
                // Bundle pre-selected from homepage — just need phone, go to review
                setNetworkId(preselectedNetworkId);
                setStepName("review");
            }
            else if (net) {
                setNetworkId(net.id);
                setStepName("bundle");
            }
            else {
                setStepName("network");
            }
        }
        else if (!bundlePreloaded && initialPhone.length >= 3) {
            const code = detectNetworkCode(initialPhone);
            const net = allNetworks.find(n => n.code === code);
            if (net)
                setNetworkId(net.id);
        }
    }, [initialPhone, allNetworks]);
    const handlePhoneChange = (val) => {
        var _a;
        setPhone(val);
        // Only auto-detect network and clear bundle if the bundle wasn't pre-selected from homepage
        if (!bundlePreloaded) {
            const code = val.length >= 3 ? detectNetworkCode(val) : null;
            const net = allNetworks.find(n => n.code === code);
            setNetworkId((_a = net === null || net === void 0 ? void 0 : net.id) !== null && _a !== void 0 ? _a : null);
            setBundleId(null);
        }
    };
    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phone.length < 9)
            return;
        if (bundlePreloaded) {
            // Bundle already chosen from homepage — go straight to review
            setStepName("review");
            return;
        }
        const code = detectNetworkCode(phone);
        const net = allNetworks.find(n => n.code === code);
        if (net) {
            setNetworkId(net.id);
            setStepName("bundle");
        }
        else {
            setStepName("network");
        }
    };
    const handleRecipientChange = (newPhone) => {
        var _a, _b;
        setPhone(newPhone);
        const code = detectNetworkCode(newPhone);
        const net = allNetworks.find(n => n.code === code);
        setNetworkId((_a = net === null || net === void 0 ? void 0 : net.id) !== null && _a !== void 0 ? _a : null);
        if (bundleId) {
            const currentBundle = initialBundles.find(b => b.id === bundleId);
            if (!currentBundle || currentBundle.networkId !== ((_b = net === null || net === void 0 ? void 0 : net.id) !== null && _b !== void 0 ? _b : "")) {
                setBundleId(null);
                if (net) {
                    setStepName("bundle");
                }
                else {
                    setStepName("network");
                }
                return;
            }
        }
        setStepName("review");
    };
    const handleConfirmOrder = async () => {
        if (!networkId || !bundleId)
            return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientPhone: phone, networkId, bundleId }),
            });
            if (!res.ok) {
                setFlowStatus("failed");
                setStepName("status");
                return;
            }
            const data = await res.json();
            setOrderId(data.orderId);
            const initRes = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderId }),
            });
            const initData = await initRes.json();
            if (!initRes.ok || !(initData === null || initData === void 0 ? void 0 : initData.authorization_url)) {
                setFlowStatus("failed");
                setStepName("status");
                return;
            }
            setFlowStatus("processing");
            setStepName("status");
            window.location.href = initData.authorization_url;
        }
        catch (_a) {
            setFlowStatus("failed");
            setStepName("status");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleRetry = () => {
        setFlowStatus(null);
        setStepName("review");
        setIsSubmitting(false);
    };
    const handleBundleSelect = (id) => {
        setBundleId(id);
    };
    const handleBundleContinue = (selected) => {
        setBundleId(selected.id);
        setStepName("review");
    };
    const showProgress = stepName !== "status";
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4 py-12", children: _jsx("div", { className: "w-full max-w-2xl", children: _jsxs(Card, { className: "overflow-hidden shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm", children: [showProgress && (_jsx(ProgressBar, { current: stepIndex[stepName], total: steps.length })), _jsxs(AnimatePresence, { mode: "wait", children: [stepName === "phone" && (_jsx(StepPhone, { phone: phone, detectedNetwork: detectedNetwork, preselectedBundle: preselectedBundle, preselectedNetwork: preselectedBundle ? (_c = allNetworks.find(n => n.id === preselectedBundle.networkId)) !== null && _c !== void 0 ? _c : null : null, onChange: handlePhoneChange, onSubmit: handlePhoneSubmit }, "phone")), stepName === "network" && (_jsx(StepNetwork, { phone: phone, networks: allNetworks, networkId: networkId, detectedNetworkId: (_d = detectedNetwork === null || detectedNetwork === void 0 ? void 0 : detectedNetwork.id) !== null && _d !== void 0 ? _d : null, onChange: setNetworkId, onBack: () => setStepName("phone"), onContinue: () => setStepName("bundle") }, "network")), stepName === "bundle" && (_jsx(StepBundle, { bundles: availableBundles, selectedNetwork: selectedNetwork, bundleId: bundleId, phone: phone, onSelect: handleBundleSelect, onBack: () => detectedNetwork ? setStepName("phone") : setStepName("network"), onContinue: (id) => {
                                    const targetId = id || bundleId;
                                    if (!targetId)
                                        return;
                                    const b = initialBundles.find(b => b.id === targetId);
                                    if (b)
                                        handleBundleContinue(b);
                                } }, "bundle")), stepName === "review" && selectedNetwork && selectedBundle && (_jsx(StepReview, { phone: phone, selectedNetwork: selectedNetwork, selectedBundle: selectedBundle, onEditRecipient: handleRecipientChange, onEditBundle: () => setStepName("bundle"), onConfirm: handleConfirmOrder, isLoading: isSubmitting }, "review")), stepName === "status" && flowStatus && (_jsx(StepStatus, { status: flowStatus, orderId: orderId, phone: phone, selectedNetwork: selectedNetwork !== null && selectedNetwork !== void 0 ? selectedNetwork : undefined, selectedBundle: selectedBundle !== null && selectedBundle !== void 0 ? selectedBundle : undefined, onRetry: handleRetry, onGoBack: flowStatus === "processing" ? handleRetry : undefined }, "status"))] })] }) }) }));
}

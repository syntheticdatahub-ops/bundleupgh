"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
export function ManualFulfillmentClient({ networks, bundles }) {
    const [step, setStep] = useState("FORM");
    // Form State
    const [phone, setPhone] = useState("");
    const [networkId, setNetworkId] = useState("");
    const [bundleId, setBundleId] = useState("");
    const [adminNote, setAdminNote] = useState("");
    // Validation / Loading State
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Result State
    const [result, setResult] = useState(null);
    const selectedNetwork = networks.find((n) => n.id === networkId);
    const selectedBundle = bundles.find((b) => b.id === bundleId);
    // Filter bundles based on selected network
    const availableBundles = bundles.filter((b) => b.networkId === networkId);
    const handleReview = () => {
        setError("");
        if (!phone || phone.length < 9) {
            setError("Please enter a valid Ghanaian phone number (e.g. 024 XXX XXXX).");
            return;
        }
        if (!networkId) {
            setError("Please select a network.");
            return;
        }
        if (!bundleId) {
            setError("Please select a bundle.");
            return;
        }
        setStep("REVIEW");
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/admin/manual-fulfillment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientPhone: phone,
                    networkId,
                    bundleId,
                    adminNote
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to process fulfillment");
            }
            setResult(data.order);
            setStep("RESULT");
        }
        catch (err) {
            setError(err.message);
            setStep("FORM"); // Go back to form to show error and allow retry
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const resetForm = () => {
        setPhone("");
        setNetworkId("");
        setBundleId("");
        setAdminNote("");
        setResult(null);
        setError("");
        setStep("FORM");
    };
    if (step === "RESULT" && result) {
        const isSuccess = result.fulfillmentStatus === "SUCCESS";
        const isProcessing = result.fulfillmentStatus === "PROCESSING";
        const isFailed = result.fulfillmentStatus === "FAILED";
        return (_jsxs(Card, { className: "max-w-xl", children: [_jsxs(CardHeader, { className: "text-center pb-2", children: [_jsxs("div", { className: "flex justify-center mb-4", children: [isSuccess && _jsx(CheckCircle2Icon, { className: "size-12 text-green-500" }), isProcessing && _jsx(Loader2Icon, { className: "size-12 text-blue-500 animate-spin" }), isFailed && _jsx(AlertCircleIcon, { className: "size-12 text-red-500" })] }), _jsxs(CardTitle, { className: "text-2xl", children: [isSuccess && "Manual fulfillment successful", isProcessing && "Manual fulfillment submitted", isFailed && "Manual fulfillment failed"] }), _jsxs(CardDescription, { className: "text-base pt-2", children: [isSuccess && "The bundle was successfully provisioned to the customer.", isProcessing && "The provider is still processing the request.", isFailed && (result.providerError ? result.providerError : "The provider rejected the request or an error occurred.")] })] }), _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "bg-muted/40 rounded-lg border p-4 space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Order ID" }), _jsx("span", { className: "font-mono", children: result.publicReference })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Recipient" }), _jsx("span", { className: "font-medium", children: result.recipientPhone })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Bundle" }), _jsx("span", { className: "font-medium", children: result.dataSizeSnapshot })] }), isFailed && result.providerError && (_jsxs("div", { className: "flex justify-between pt-2 border-t mt-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Reason" }), _jsx("span", { className: "font-medium text-red-500 text-right max-w-[200px]", children: result.providerError })] })), result.providerReference && (_jsxs("div", { className: "flex justify-between pt-2 border-t mt-2", children: [_jsx("span", { className: "text-muted-foreground", children: "DataMart Ref" }), _jsx("span", { className: "font-mono text-xs", children: result.providerReference })] }))] }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: resetForm, className: "w-full", children: "Submit Another" }) })] }));
    }
    if (step === "REVIEW" && selectedNetwork && selectedBundle) {
        return (_jsxs(Card, { className: "max-w-xl border-primary/20 shadow-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Review Manual Fulfillment" }), _jsx(CardDescription, { children: "You are about to send a real fulfillment request to DataMart. This will cost DataMart balance." })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "bg-muted/40 rounded-lg border p-4 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center pb-3 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Recipient" }), _jsx("span", { className: "font-semibold text-lg", children: phone })] }), _jsxs("div", { className: "flex justify-between items-center pb-3 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Network" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "size-2.5 rounded-full", style: { backgroundColor: selectedNetwork.color } }), _jsx("span", { className: "font-medium", children: selectedNetwork.name })] })] }), _jsxs("div", { className: "flex justify-between items-center pb-3 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Bundle" }), _jsx("span", { className: "font-medium", children: selectedBundle.dataSize })] }), _jsxs("div", { className: "flex justify-between items-center pb-3 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Provider Cost" }), _jsxs("span", { className: "font-mono text-orange-600 dark:text-orange-400 font-semibold", children: ["GH\u20B5 ", selectedBundle.providerCost.toFixed(2)] })] }), adminNote && (_jsxs("div", { className: "flex flex-col gap-1 pt-1", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Reason / Note" }), _jsx("span", { className: "text-sm italic", children: adminNote })] }))] }), _jsxs("div", { className: "mt-6 flex items-start gap-3 text-sm text-orange-600 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20", children: [_jsx(AlertCircleIcon, { className: "size-5 shrink-0 mt-0.5" }), _jsx("p", { children: "Confirming will create an order and trigger DataMart API. The customer will not be charged via Paystack." })] })] }), _jsxs(CardFooter, { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setStep("FORM"), disabled: isSubmitting, children: "Back to Edit" }), _jsx(Button, { className: "flex-1", onClick: handleSubmit, disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2Icon, { className: "mr-2 size-4 animate-spin" }), "Processing..."] })) : ("Fulfill Bundle") })] })] }));
    }
    // default to FORM
    return (_jsxs(Card, { className: "max-w-xl", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Manual Order" }), _jsx(CardDescription, { children: "Fill out the details to provision a data bundle manually." })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsxs("div", { className: "p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2", children: [_jsx(AlertCircleIcon, { className: "size-4" }), error] })), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Recipient Phone Number" }), _jsx(Input, { placeholder: "024 XXX XXXX", value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")), inputMode: "tel" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Network" }), _jsxs(Select, { value: networkId, onValueChange: (val) => {
                                    if (val) {
                                        setNetworkId(val);
                                        setBundleId(""); // reset bundle when network changes
                                    }
                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select network" }) }), _jsx(SelectContent, { children: networks.map((n) => (_jsx(SelectItem, { value: n.id, children: n.name }, n.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Bundle" }), _jsxs(Select, { value: bundleId, onValueChange: (val) => { if (val)
                                    setBundleId(val); }, disabled: !networkId || availableBundles.length === 0, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: !networkId ? "Select network first" : "Select a bundle" }) }), _jsx(SelectContent, { children: availableBundles.map((b) => (_jsxs(SelectItem, { value: b.id, children: [b.dataSize, " \u2014 GH\u20B5 ", b.sellingPrice.toFixed(2), " (Cost: GH\u20B5 ", b.providerCost.toFixed(2), ")"] }, b.id))) })] }), networkId && availableBundles.length === 0 && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "No active bundles found for this network." }))] }), _jsxs("div", { className: "space-y-2 pt-2", children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Admin Note / Reason (Optional)" }), _jsx(Input, { placeholder: "e.g. Customer paid via cash", value: adminNote, onChange: (e) => setAdminNote(e.target.value) })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", onClick: handleReview, children: "Review Order \u2192" }) })] }));
}

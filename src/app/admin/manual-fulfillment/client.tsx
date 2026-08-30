"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react"
import type { Bundle, Network } from "@/types/domain"

interface Props {
  networks: Network[]
  bundles: Bundle[]
}

type Step = "FORM" | "REVIEW" | "RESULT"

export function ManualFulfillmentClient({ networks, bundles }: Props) {
  const [step, setStep] = useState<Step>("FORM")
  
  // Form State
  const [phone, setPhone] = useState("")
  const [networkId, setNetworkId] = useState("")
  const [bundleId, setBundleId] = useState("")
  const [adminNote, setAdminNote] = useState("")
  
  // Validation / Loading State
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Result State
  const [result, setResult] = useState<any>(null)

  const selectedNetwork = networks.find((n) => n.id === networkId)
  const selectedBundle = bundles.find((b) => b.id === bundleId)

  // Filter bundles based on selected network
  const availableBundles = bundles.filter((b) => b.networkId === networkId)

  const handleReview = () => {
    setError("")
    if (!phone || phone.length < 9) {
      setError("Please enter a valid Ghanaian phone number (e.g. 024 XXX XXXX).")
      return
    }
    if (!networkId) {
      setError("Please select a network.")
      return
    }
    if (!bundleId) {
      setError("Please select a bundle.")
      return
    }
    setStep("REVIEW")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")

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
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to process fulfillment")
      }

      setResult(data.order)
      setStep("RESULT")
    } catch (err: any) {
      setError(err.message)
      setStep("FORM") // Go back to form to show error and allow retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setPhone("")
    setNetworkId("")
    setBundleId("")
    setAdminNote("")
    setResult(null)
    setError("")
    setStep("FORM")
  }

  if (step === "RESULT" && result) {
    const isSuccess = result.fulfillmentStatus === "SUCCESS"
    const isProcessing = result.fulfillmentStatus === "PROCESSING"
    const isFailed = result.fulfillmentStatus === "FAILED"

    return (
      <Card className="max-w-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {isSuccess && <CheckCircle2Icon className="size-12 text-green-500" />}
            {isProcessing && <Loader2Icon className="size-12 text-blue-500 animate-spin" />}
            {isFailed && <AlertCircleIcon className="size-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {isSuccess && "Manual fulfillment successful"}
            {isProcessing && "Manual fulfillment submitted"}
            {isFailed && "Manual fulfillment failed"}
          </CardTitle>
          <CardDescription className="text-base pt-2">
            {isSuccess && "The bundle was successfully provisioned to the customer."}
            {isProcessing && "The provider is still processing the request."}
            {isFailed && (result.providerError ? result.providerError : "The provider rejected the request or an error occurred.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/40 rounded-lg border p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono">{result.publicReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium">{result.recipientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundle</span>
              <span className="font-medium">{result.dataSizeSnapshot}</span>
            </div>
            {isFailed && result.providerError && (
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium text-red-500 text-right max-w-[200px]">{result.providerError}</span>
              </div>
            )}
            {result.providerReference && (
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="text-muted-foreground">DataMart Ref</span>
                <span className="font-mono text-xs">{result.providerReference}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetForm} className="w-full">Submit Another</Button>
        </CardFooter>
      </Card>
    )
  }

  if (step === "REVIEW" && selectedNetwork && selectedBundle) {
    return (
      <Card className="max-w-xl border-primary/20 shadow-md">
        <CardHeader>
          <CardTitle>Review Manual Fulfillment</CardTitle>
          <CardDescription>
            You are about to send a real fulfillment request to DataMart. This will cost DataMart balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 rounded-lg border p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground text-sm">Recipient</span>
              <span className="font-semibold text-lg">{phone}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground text-sm">Network</span>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: selectedNetwork.color }} />
                <span className="font-medium">{selectedNetwork.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground text-sm">Bundle</span>
              <span className="font-medium">{selectedBundle.dataSize}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-muted-foreground text-sm">Provider Cost</span>
              <span className="font-mono text-orange-600 dark:text-orange-400 font-semibold">
                GH₵ {selectedBundle.providerCost.toFixed(2)}
              </span>
            </div>
            {adminNote && (
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-muted-foreground text-xs">Reason / Note</span>
                <span className="text-sm italic">{adminNote}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-start gap-3 text-sm text-orange-600 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
            <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
            <p>
              Confirming will create an order and trigger DataMart API. The customer will not be charged via Paystack.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStep("FORM")} disabled={isSubmitting}>
            Back to Edit
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Fulfill Bundle"
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // default to FORM
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Create Manual Order</CardTitle>
        <CardDescription>Fill out the details to provision a data bundle manually.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
            <AlertCircleIcon className="size-4" />
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient Phone Number</label>
          <Input 
            placeholder="024 XXX XXXX" 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            inputMode="tel"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Network</label>
          <Select 
            value={networkId} 
            onValueChange={(val) => {
              if (val) {
                setNetworkId(val)
                setBundleId("") // reset bundle when network changes
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bundle</label>
          <Select 
            value={bundleId} 
            onValueChange={(val) => { if (val) setBundleId(val) }} 
            disabled={!networkId || availableBundles.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={!networkId ? "Select network first" : "Select a bundle"} />
            </SelectTrigger>
            <SelectContent>
              {availableBundles.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.dataSize} — GH₵ {b.sellingPrice.toFixed(2)} (Cost: GH₵ {b.providerCost.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {networkId && availableBundles.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">No active bundles found for this network.</p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-sm font-medium text-muted-foreground">Admin Note / Reason (Optional)</label>
          <Input 
            placeholder="e.g. Customer paid via cash" 
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleReview}>Review Order →</Button>
      </CardFooter>
    </Card>
  )
}

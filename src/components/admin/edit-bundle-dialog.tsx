"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { Bundle } from "@/types/domain"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function EditBundleDialog({ bundle, open, onOpenChange }: { bundle: Bundle, open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [sellingPrice, setSellingPrice] = useState(bundle.sellingPrice.toString())
  const [active, setActive] = useState(bundle.active)
  const [saving, setSaving] = useState(false)

  // Reset state when bundle changes
  useEffect(() => {
    if (open) {
      setSellingPrice(bundle.sellingPrice.toString())
      setActive(bundle.active)
    }
  }, [bundle, open])

  const parsedPrice = parseFloat(sellingPrice) || 0
  const profit = parsedPrice - bundle.providerCost
  const margin = parsedPrice > 0 ? (profit / parsedPrice) * 100 : 0

  let warningLevel = "PROFITABLE"
  let warningColor = "text-green-600 dark:text-green-400"
  if (profit < 0) {
    warningLevel = "LOSS"
    warningColor = "text-red-600 dark:text-red-400"
  } else if (margin < 5) {
    warningLevel = "LOW MARGIN"
    warningColor = "text-orange-500"
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellingPrice: parsedPrice,
          active,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update bundle")
      }

      router.refresh()
      onOpenChange(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bundle: {bundle.dataSize}</DialogTitle>
          <DialogDescription>
            Manage retail pricing and visibility for this package.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Provider DataMart Price (Wholesale)</p>
            <div className="text-xl font-bold text-muted-foreground p-3 bg-muted rounded-md border">
              GH₵ {bundle.providerCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This is the cost charged to your wallet.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Your Retail Selling Price</p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">GH₵</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="pl-12 text-lg font-bold"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
            <div>
              <p className="text-xs text-muted-foreground">Your Profit</p>
              <div className={cn("text-xl font-bold mt-1", warningColor)}>
                {profit >= 0 ? "+" : ""}GH₵ {profit.toFixed(2)}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit Margin</p>
              <div className={cn("text-xl font-bold mt-1", warningColor)}>
                {margin.toFixed(2)}%
              </div>
            </div>
            <div className="col-span-2">
              <Badge variant="outline" className={cn("mt-2", warningColor)}>
                {warningLevel}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-muted-foreground">
                Inactive bundles are hidden from customers.
              </p>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || parsedPrice < 0}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

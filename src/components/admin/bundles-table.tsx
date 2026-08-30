"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Bundle, Network } from "@/types/domain"
import { EditBundleDialog } from "./edit-bundle-dialog"

export function AdminBundlesTable({ bundles, networks }: { bundles: Bundle[], networks: Network[] }) {
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)

  // Group bundles by networkId
  const bundlesByNetwork = useMemo(() => {
    const grouped: Record<string, Bundle[]> = {}
    // Ensure all networks have at least an empty array
    networks.forEach((n) => {
      grouped[n.id] = []
    })
    // Also handle bundles with unknown networks
    bundles.forEach((b) => {
      if (!grouped[b.networkId]) {
        grouped[b.networkId] = []
      }
      grouped[b.networkId].push(b)
    })
    
    // Sort bundles in each network by data size (simple string sort for now, or by provider cost)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.providerCost - b.providerCost)
    })
    
    return grouped
  }, [bundles, networks])

  const networkIds = Object.keys(bundlesByNetwork)
  const defaultTab = networkIds.length > 0 ? networkIds[0] : ""

  const renderTable = (networkId: string, networkBundles: Bundle[]) => {
    if (networkBundles.length === 0) {
      return (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No bundles found for this network. Click Sync DataMart Catalog to import packages.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">Bundle</th>
              <th className="px-4 py-3 text-right font-medium">DataMart Cost</th>
              <th className="px-4 py-3 text-right font-medium">Your Price</th>
              <th className="px-4 py-3 text-right font-medium">Profit</th>
              <th className="px-4 py-3 text-right font-medium">Margin</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {networkBundles.map((bundle) => {
              const profit = bundle.sellingPrice - bundle.providerCost
              const margin = bundle.sellingPrice > 0 ? (profit / bundle.sellingPrice) * 100 : 0

              let warningLevel = "PROFITABLE"
              let warningColor = "text-green-600 dark:text-green-400"
              if (profit < 0) {
                warningLevel = "LOSS"
                warningColor = "text-red-600 dark:text-red-400"
              } else if (margin < 5) {
                warningLevel = "LOW MARGIN"
                warningColor = "text-orange-500"
              }

              return (
                <tr
                  key={bundle.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold">{bundle.dataSize}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    GH₵ {bundle.providerCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    GH₵ {bundle.sellingPrice.toFixed(2)}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-semibold", warningColor)}>
                    {profit >= 0 ? "+" : ""}GH₵ {profit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-muted-foreground">
                    {margin.toFixed(1)}%
                    <div className={cn("text-[10px] font-bold mt-1", warningColor)}>
                      {warningLevel}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", bundle.providerAvailable !== false ? "bg-green-500" : "bg-red-500")} />
                        <span className={cn(bundle.providerAvailable !== false ? "text-muted-foreground" : "text-red-500 font-medium")}>
                          Provider: {bundle.providerAvailable !== false ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", bundle.active ? "bg-green-500" : "bg-muted-foreground")} />
                        <span className={cn(bundle.active ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground")}>
                          Retail: {bundle.active ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditingBundle(bundle)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (networkIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground text-sm">
          No networks found.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4">
          {networkIds.map((netId) => {
            const net = networks.find(n => n.id === netId)
            const label = net ? net.name : netId
            return (
              <TabsTrigger key={netId} value={netId} className="min-w-[100px]">
                {label}
                <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground font-normal rounded-full px-1.5 py-0">
                  {bundlesByNetwork[netId].length}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {networkIds.map((netId) => (
          <TabsContent key={netId} value={netId} className="mt-0 outline-none">
            <Card>
              <CardContent className="p-0">
                {renderTable(netId, bundlesByNetwork[netId])}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {editingBundle && (
        <EditBundleDialog 
          bundle={editingBundle} 
          open={!!editingBundle} 
          onOpenChange={(open) => !open && setEditingBundle(null)} 
        />
      )}
    </>
  )
}

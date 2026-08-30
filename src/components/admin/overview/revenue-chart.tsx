"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/types/domain"

export function RevenueChart({ orders }: { orders: Order[] }) {
  const successfulOrders = orders.filter((o) => o.paymentStatus === "SUCCESS" || o.fulfillmentStatus === "SUCCESS");

  if (successfulOrders.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-4 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No revenue data yet.</p>
            <p className="text-sm mt-1">Revenue will appear here after your first successful purchase.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by day for the last 7 days (or just all available days)
  const groupedData: Record<string, { revenue: number; profit: number }> = {};
  
  // Sort ascending by date for chart
  const sortedOrders = [...successfulOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedOrders.forEach((o) => {
    const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (!groupedData[date]) {
      groupedData[date] = { revenue: 0, profit: 0 };
    }
    groupedData[date].revenue += o.sellingPriceSnapshot;
    groupedData[date].profit += o.profitSnapshot;
  });

  const chartData = Object.keys(groupedData).map((date) => ({
    date,
    revenue: groupedData[date].revenue,
    profit: groupedData[date].profit,
  }));

  // If there's only one data point, add a dummy one with 0 to make it render a line
  if (chartData.length === 1) {
    chartData.unshift({ date: "Previous", revenue: 0, profit: 0 });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                tickFormatter={(value) => `GHS ${value}`} 
              />
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="mb-2 text-sm font-semibold">{label}</div>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-muted-foreground">Revenue</span>
                            </div>
                            <span className="font-medium">GHS {payload[0].value?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                              <span className="text-muted-foreground">Profit</span>
                            </div>
                            <span className="font-medium">GHS {payload[1].value?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

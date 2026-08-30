// ---------------------------------------------------------------------------
// BundleUp Seed Data — mock data for development UI
// All amounts in GHS (Ghanaian Cedis)
// ---------------------------------------------------------------------------

// ── Networks ────────────────────────────────────────────────────────────────

export type Network = {
  id: "mtn" | "telecel" | "airteltigo"
  name: string
  color: string
  fgColor: string
  prefixes: string[]
}

export const networks: Network[] = [
  {
    id: "mtn",
    name: "MTN",
    color: "var(--mtn-yellow)",
    fgColor: "var(--mtn-yellow-fg)",
    prefixes: ["024", "054", "055", "059", "025"],
  },
  {
    id: "telecel",
    name: "Telecel",
    color: "var(--telecel-red)",
    fgColor: "var(--telecel-red-fg)",
    prefixes: ["020", "050"],
  },
  {
    id: "airteltigo",
    name: "AirtelTigo",
    color: "var(--airteltigo-blue)",
    fgColor: "var(--airteltigo-blue-fg)",
    prefixes: ["026", "056", "027", "057"],
  },
]

export function detectNetwork(phone: string): Network | null {
  const digits = phone.replace(/\D/g, "")
  const local = digits.startsWith("233") ? digits.slice(3) : digits
  const prefix = local.slice(0, 3)
  return networks.find((n) => n.prefixes.includes(prefix)) ?? null
}

// ── Bundles ─────────────────────────────────────────────────────────────────

export type Bundle = {
  id: string
  network: "mtn" | "telecel" | "airteltigo"
  size: string
  validity: string
  costPrice: number
  sellingPrice: number
  isActive: boolean
  tag?: "popular" | "best-value"
}

export const bundles: Bundle[] = [
  // MTN
  { id: "mtn-500mb", network: "mtn", size: "500MB", validity: "1 day", costPrice: 2.00, sellingPrice: 3.00, isActive: true },
  { id: "mtn-1gb", network: "mtn", size: "1GB", validity: "7 days", costPrice: 4.00, sellingPrice: 5.50, isActive: true, tag: "popular" },
  { id: "mtn-2gb", network: "mtn", size: "2GB", validity: "30 days", costPrice: 7.50, sellingPrice: 10.00, isActive: true },
  { id: "mtn-5gb", network: "mtn", size: "5GB", validity: "30 days", costPrice: 17.00, sellingPrice: 22.00, isActive: true, tag: "best-value" },
  { id: "mtn-10gb", network: "mtn", size: "10GB", validity: "30 days", costPrice: 32.00, sellingPrice: 42.00, isActive: true },
  { id: "mtn-20gb", network: "mtn", size: "20GB", validity: "30 days", costPrice: 60.00, sellingPrice: 78.00, isActive: true },
  // Telecel
  { id: "tel-500mb", network: "telecel", size: "500MB", validity: "1 day", costPrice: 1.80, sellingPrice: 2.80, isActive: true },
  { id: "tel-1gb", network: "telecel", size: "1GB", validity: "7 days", costPrice: 3.80, sellingPrice: 5.20, isActive: true, tag: "popular" },
  { id: "tel-2gb", network: "telecel", size: "2GB", validity: "30 days", costPrice: 7.00, sellingPrice: 9.50, isActive: true },
  { id: "tel-5gb", network: "telecel", size: "5GB", validity: "30 days", costPrice: 16.00, sellingPrice: 21.00, isActive: true, tag: "best-value" },
  { id: "tel-10gb", network: "telecel", size: "10GB", validity: "30 days", costPrice: 30.00, sellingPrice: 40.00, isActive: true },
  // AirtelTigo
  { id: "at-500mb", network: "airteltigo", size: "500MB", validity: "1 day", costPrice: 1.90, sellingPrice: 2.90, isActive: true },
  { id: "at-1gb", network: "airteltigo", size: "1GB", validity: "7 days", costPrice: 3.90, sellingPrice: 5.30, isActive: true, tag: "popular" },
  { id: "at-2gb", network: "airteltigo", size: "2GB", validity: "30 days", costPrice: 7.20, sellingPrice: 9.80, isActive: true },
  { id: "at-5gb", network: "airteltigo", size: "5GB", validity: "30 days", costPrice: 16.50, sellingPrice: 21.50, isActive: true, tag: "best-value" },
  { id: "at-10gb", network: "airteltigo", size: "10GB", validity: "30 days", costPrice: 31.00, sellingPrice: 41.00, isActive: false },
]

export function getBundlesByNetwork(networkId: string): Bundle[] {
  return bundles.filter((b) => b.network === networkId)
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type PaymentStatus = "paid" | "pending" | "failed"
export type FulfillmentStatus = "delivered" | "processing" | "failed"

export type Order = {
  id: string
  phone: string
  network: "mtn" | "telecel" | "airteltigo"
  bundle: string
  bundleSize: string
  amount: number
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  date: string
  paystackRef?: string
}

export const orders: Order[] = [
  { id: "BU-10042", phone: "+233 24 123 4567", network: "mtn", bundle: "mtn-5gb", bundleSize: "5GB / 30 days", amount: 22.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 28, 2026", paystackRef: "PS_8472910" },
  { id: "BU-10041", phone: "+233 20 987 6543", network: "telecel", bundle: "tel-1gb", bundleSize: "1GB / 7 days", amount: 5.20, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 28, 2026", paystackRef: "PS_8472905" },
  { id: "BU-10040", phone: "+233 26 555 1234", network: "airteltigo", bundle: "at-2gb", bundleSize: "2GB / 30 days", amount: 9.80, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 28, 2026", paystackRef: "PS_8472899" },
  { id: "BU-10039", phone: "+233 54 345 6789", network: "mtn", bundle: "mtn-2gb", bundleSize: "2GB / 30 days", amount: 10.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 27, 2026", paystackRef: "PS_8472851" },
  { id: "BU-10038", phone: "+233 20 111 2222", network: "telecel", bundle: "tel-5gb", bundleSize: "5GB / 30 days", amount: 21.00, paymentStatus: "paid", fulfillmentStatus: "processing", date: "Aug 27, 2026", paystackRef: "PS_8472840" },
  { id: "BU-10037", phone: "+233 27 888 9900", network: "airteltigo", bundle: "at-1gb", bundleSize: "1GB / 7 days", amount: 5.30, paymentStatus: "pending", fulfillmentStatus: "processing", date: "Aug 27, 2026" },
  { id: "BU-10036", phone: "+233 24 777 8880", network: "mtn", bundle: "mtn-10gb", bundleSize: "10GB / 30 days", amount: 42.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 26, 2026", paystackRef: "PS_8472800" },
  { id: "BU-10035", phone: "+233 55 444 3322", network: "mtn", bundle: "mtn-1gb", bundleSize: "1GB / 7 days", amount: 5.50, paymentStatus: "failed", fulfillmentStatus: "failed", date: "Aug 26, 2026" },
  { id: "BU-10034", phone: "+233 20 333 4455", network: "telecel", bundle: "tel-2gb", bundleSize: "2GB / 30 days", amount: 9.50, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 26, 2026", paystackRef: "PS_8472791" },
  { id: "BU-10033", phone: "+233 26 999 0011", network: "airteltigo", bundle: "at-5gb", bundleSize: "5GB / 30 days", amount: 21.50, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 25, 2026", paystackRef: "PS_8472755" },
  { id: "BU-10032", phone: "+233 24 222 3344", network: "mtn", bundle: "mtn-5gb", bundleSize: "5GB / 30 days", amount: 22.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 25, 2026", paystackRef: "PS_8472740" },
  { id: "BU-10031", phone: "+233 54 678 9012", network: "mtn", bundle: "mtn-2gb", bundleSize: "2GB / 30 days", amount: 10.00, paymentStatus: "pending", fulfillmentStatus: "processing", date: "Aug 25, 2026" },
  { id: "BU-10030", phone: "+233 20 456 7890", network: "telecel", bundle: "tel-10gb", bundleSize: "10GB / 30 days", amount: 40.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 24, 2026", paystackRef: "PS_8472700" },
  { id: "BU-10029", phone: "+233 27 123 4000", network: "airteltigo", bundle: "at-2gb", bundleSize: "2GB / 30 days", amount: 9.80, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 24, 2026", paystackRef: "PS_8472688" },
  { id: "BU-10028", phone: "+233 24 567 8901", network: "mtn", bundle: "mtn-20gb", bundleSize: "20GB / 30 days", amount: 78.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 24, 2026", paystackRef: "PS_8472670" },
  { id: "BU-10027", phone: "+233 55 321 6540", network: "mtn", bundle: "mtn-1gb", bundleSize: "1GB / 7 days", amount: 5.50, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 23, 2026", paystackRef: "PS_8472640" },
  { id: "BU-10026", phone: "+233 20 789 0123", network: "telecel", bundle: "tel-1gb", bundleSize: "1GB / 7 days", amount: 5.20, paymentStatus: "failed", fulfillmentStatus: "failed", date: "Aug 23, 2026" },
  { id: "BU-10025", phone: "+233 26 234 5678", network: "airteltigo", bundle: "at-1gb", bundleSize: "1GB / 7 days", amount: 5.30, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 23, 2026", paystackRef: "PS_8472610" },
  { id: "BU-10024", phone: "+233 24 890 1234", network: "mtn", bundle: "mtn-5gb", bundleSize: "5GB / 30 days", amount: 22.00, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 22, 2026", paystackRef: "PS_8472590" },
  { id: "BU-10023", phone: "+233 20 012 3456", network: "telecel", bundle: "tel-2gb", bundleSize: "2GB / 30 days", amount: 9.50, paymentStatus: "paid", fulfillmentStatus: "delivered", date: "Aug 22, 2026", paystackRef: "PS_8472570" },
]

// ── Customers ────────────────────────────────────────────────────────────────

export type CustomerStatus = "active" | "inactive"

export type Customer = {
  id: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  lastNetwork: "mtn" | "telecel" | "airteltigo"
  status: CustomerStatus
}

export const customers: Customer[] = [
  { id: "c1", phone: "+233 24 123 4567", totalOrders: 12, totalSpent: 187.50, lastOrder: "Aug 28, 2026", lastNetwork: "mtn", status: "active" },
  { id: "c2", phone: "+233 20 987 6543", totalOrders: 8, totalSpent: 94.40, lastOrder: "Aug 28, 2026", lastNetwork: "telecel", status: "active" },
  { id: "c3", phone: "+233 26 555 1234", totalOrders: 5, totalSpent: 73.10, lastOrder: "Aug 28, 2026", lastNetwork: "airteltigo", status: "active" },
  { id: "c4", phone: "+233 54 345 6789", totalOrders: 21, totalSpent: 310.00, lastOrder: "Aug 27, 2026", lastNetwork: "mtn", status: "active" },
  { id: "c5", phone: "+233 20 111 2222", totalOrders: 3, totalSpent: 45.70, lastOrder: "Aug 27, 2026", lastNetwork: "telecel", status: "active" },
  { id: "c6", phone: "+233 27 888 9900", totalOrders: 1, totalSpent: 5.30, lastOrder: "Aug 27, 2026", lastNetwork: "airteltigo", status: "active" },
  { id: "c7", phone: "+233 24 777 8880", totalOrders: 7, totalSpent: 168.00, lastOrder: "Aug 26, 2026", lastNetwork: "mtn", status: "active" },
  { id: "c8", phone: "+233 55 444 3322", totalOrders: 2, totalSpent: 11.00, lastOrder: "Aug 26, 2026", lastNetwork: "mtn", status: "inactive" },
  { id: "c9", phone: "+233 20 333 4455", totalOrders: 9, totalSpent: 89.50, lastOrder: "Aug 26, 2026", lastNetwork: "telecel", status: "active" },
  { id: "c10", phone: "+233 26 999 0011", totalOrders: 4, totalSpent: 67.10, lastOrder: "Aug 25, 2026", lastNetwork: "airteltigo", status: "active" },
  { id: "c11", phone: "+233 24 222 3344", totalOrders: 15, totalSpent: 248.00, lastOrder: "Aug 25, 2026", lastNetwork: "mtn", status: "active" },
  { id: "c12", phone: "+233 54 678 9012", totalOrders: 6, totalSpent: 58.00, lastOrder: "Aug 25, 2026", lastNetwork: "mtn", status: "active" },
]

// ── Revenue & Analytics ──────────────────────────────────────────────────────

export type RevenueDataPoint = {
  month: string
  revenue: number
  orders: number
  profit: number
}

export const revenueData: RevenueDataPoint[] = [
  { month: "Jan", revenue: 1820, orders: 124, profit: 410 },
  { month: "Feb", revenue: 2140, orders: 148, profit: 490 },
  { month: "Mar", revenue: 2480, orders: 172, profit: 571 },
  { month: "Apr", revenue: 2180, orders: 155, profit: 500 },
  { month: "May", revenue: 3120, orders: 210, profit: 720 },
  { month: "Jun", revenue: 2890, orders: 193, profit: 664 },
  { month: "Jul", revenue: 3640, orders: 241, profit: 837 },
  { month: "Aug", revenue: 4210, orders: 287, profit: 968 },
]

export type NetworkStat = {
  network: string
  orders: number
  revenue: number
  color: string
}

export const networkStats: NetworkStat[] = [
  { network: "MTN", orders: 164, revenue: 2480, color: "var(--mtn-yellow)" },
  { network: "Telecel", orders: 71, revenue: 980, color: "var(--telecel-red)" },
  { network: "AirtelTigo", orders: 52, revenue: 750, color: "var(--airteltigo-blue)" },
]

// ── Admin overview summary stats ─────────────────────────────────────────────

export const adminStats = {
  totalRevenue: 22480,
  totalOrders: 1084,
  successfulOrders: 998,
  pendingOrders: 42,
  failedOrders: 44,
  estimatedProfit: 5170,
  revenueGrowth: 16.4,
  ordersGrowth: 22.1,
}

// ── Orders for the track page (customer-facing mock) ─────────────────────────

export const trackOrders: Order[] = [orders[0], orders[3], orders[11]]

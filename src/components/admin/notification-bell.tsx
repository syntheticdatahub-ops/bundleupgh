import { BellIcon } from "lucide-react"
import Link from "next/link"
import { fsCount } from "@/lib/firestore-rest"

export async function NotificationBell() {
  try {
    const failedCount = await fsCount("orders", [{ field: "fulfillmentStatus", op: "EQUAL", value: "FAILED" }])
    const onHoldCount = await fsCount("orders", [{ field: "fulfillmentStatus", op: "EQUAL", value: "ON_HOLD" }])
    const totalStuck = failedCount + onHoldCount

    if (totalStuck === 0) {
      return (
        <Link href="/admin/orders" className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <BellIcon className="size-4" />
        </Link>
      )
    }

    return (
      <Link href="/admin/orders?fulfillmentFilter=FAILED" className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
        <BellIcon className="size-4" />
        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          {totalStuck > 99 ? "99+" : totalStuck}
        </span>
      </Link>
    )
  } catch {
    return (
      <div className="relative p-2 text-muted-foreground">
        <BellIcon className="size-4" />
      </div>
    )
  }
}

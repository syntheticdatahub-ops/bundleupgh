"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  UserIcon,
  ShieldIcon,
  BellIcon,
  CreditCardIcon,
  PaletteIcon,
  LoaderIcon,
  MonitorIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  DownloadIcon,
  SmartphoneIcon,
  LaptopIcon,
  TabletIcon,
  SparklesIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "lucide-react"

type TabId = "profile" | "security" | "notifications" | "billing" | "appearance"

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <UserIcon className="size-4" /> },
  { id: "security", label: "Security", icon: <ShieldIcon className="size-4" /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon className="size-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCardIcon className="size-4" /> },
  { id: "appearance", label: "Appearance", icon: <PaletteIcon className="size-4" /> },
]

// ── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("Abderrahim G.")
  const [email, setEmail] = React.useState("abderrahim@fintech.com")

  function handleSave() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src="/avatars/user.jpg" alt="User avatar" />
            <AvatarFallback className="text-lg">AG</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <LoaderIcon className="size-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Security Tab ─────────────────────────────────────────────────────────────

const mockSessions = [
  { device: "MacBook Pro", icon: <LaptopIcon className="size-4" />, location: "San Francisco, CA", lastActive: "Active now" },
  { device: "iPhone 15", icon: <SmartphoneIcon className="size-4" />, location: "San Francisco, CA", lastActive: "2 hours ago" },
  { device: "iPad Air", icon: <TabletIcon className="size-4" />, location: "New York, NY", lastActive: "3 days ago" },
]

function SecurityTab() {
  const [twoFA, setTwoFA] = React.useState(true)

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="current-pw">
              Current Password
            </label>
            <Input id="current-pw" type="password" placeholder="Enter current password" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-pw">
                New Password
              </label>
              <Input id="new-pw" type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirm-pw">
                Confirm Password
              </label>
              <Input id="confirm-pw" type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Update Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {twoFA ? "Enabled" : "Disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {twoFA
                  ? "Your account is protected with 2FA"
                  : "Enable 2FA for enhanced security"}
              </p>
            </div>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockSessions.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location} &middot; {s.lastActive}
                  </p>
                </div>
              </div>
              {s.lastActive !== "Active now" && (
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Notifications Tab ────────────────────────────────────────────────────────

const notifToggles = [
  { id: "email", label: "Email Notifications", description: "Receive notifications via email", default: true },
  { id: "push", label: "Push Notifications", description: "Receive push notifications on your devices", default: true },
  { id: "transaction", label: "Transaction Alerts", description: "Get notified for every transaction", default: true },
  { id: "security", label: "Security Alerts", description: "Alerts for suspicious activity and logins", default: true },
  { id: "marketing", label: "Marketing Emails", description: "Receive product updates and offers", default: false },
  { id: "digest", label: "Weekly Digest", description: "A weekly summary of your account activity", default: true },
]

function NotificationsTab() {
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(notifToggles.map((t) => [t.id, t.default]))
  )

  function toggle(id: string) {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {notifToggles.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg px-1 py-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
            <Switch
              checked={settings[t.id]}
              onCheckedChange={() => toggle(t.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Billing Tab ──────────────────────────────────────────────────────────────

const invoices = [
  { date: "Mar 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-001" },
  { date: "Feb 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-002" },
  { date: "Jan 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-003" },
]

const freeFeatures = [
  "1 bank account connection",
  "Basic transaction tracking",
  "Monthly budget tracking",
  "Standard support",
]

const proFeatures = [
  "Unlimited bank connections",
  "Advanced analytics & insights",
  "Unlimited virtual cards",
  "Priority support",
  "Custom budget categories",
  "Export to CSV & PDF",
]

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the free plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Vault Free</h3>
                <Badge variant="secondary">Current</Badge>
              </div>
              <ul className="mt-3 space-y-1.5">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckIcon className="size-3.5 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">$0</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-4 text-primary" />
                  <h4 className="font-semibold">Vault Pro</h4>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckIcon className="size-3.5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">$12</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
            </div>
            <div className="mt-4">
              <Button>Upgrade to Pro</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <CreditCardIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Visa ending in 4589</p>
                <p className="text-xs text-muted-foreground">Expires 09/28</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Download past invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell className="tabular-nums">{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-xs">
                      <DownloadIcon className="size-3.5" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const themes: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <SunIcon className="size-5" /> },
    { id: "dark", label: "Dark", icon: <MoonIcon className="size-5" /> },
    { id: "system", label: "System", icon: <MonitorIcon className="size-5" /> },
  ]

  if (!mounted) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how Vault looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-6 transition-all hover:bg-muted/50",
                theme === t.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              )}
            >
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
              {theme === t.id && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ResetDataTab() {
  const [confirmation, setConfirmation] = React.useState("")
  const [isResetting, setIsResetting] = React.useState(false)
  const [resetStatus, setResetStatus] = React.useState<{ type: "success" | "error" | "idle"; message: string }>({
    type: "idle",
    message: "",
  })

  const confirmationText = "RESET BUNDLEUP DATA"
  const canReset = confirmation.trim() === confirmationText

  async function handleReset() {
    if (!canReset) {
      setResetStatus({ type: "error", message: `Type "${confirmationText}" to confirm.` })
      return
    }

    setIsResetting(true)
    setResetStatus({ type: "idle", message: "" })

    try {
      const response = await fetch("/api/admin/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: confirmationText }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? "Reset failed.")
      }

      setResetStatus({
        type: "success",
        message: data?.message ?? "Reset request accepted.",
      })
      setConfirmation("")
    } catch (error: any) {
      setResetStatus({
        type: "error",
        message: error.message || "Unable to process reset request.",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangleIcon className="size-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          This section permanently removes customer, order, and payment data. Bundles and admin configuration remain protected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-destructive/40 bg-background/60 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Protected reset</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Only an authenticated admin can trigger this action.</li>
            <li>Only approved business data collections are cleared.</li>
            <li>Bundles, networks, and admin settings are never deleted.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label htmlFor="reset-confirmation" className="text-sm font-medium text-foreground">
            Type <span className="font-mono font-semibold">{confirmationText}</span> to confirm
          </label>
          <Input
            id="reset-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={confirmationText}
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            This action is irreversible once the reset request is approved.
          </div>
          <Dialog>
            <DialogTrigger>
              <Button variant="destructive" size="sm" disabled={!canReset || isResetting} className="w-full sm:w-auto">
                {isResetting ? <LoaderIcon className="size-4 animate-spin" /> : <AlertTriangleIcon className="size-4" />}
                {isResetting ? "Resetting..." : "Reset Business Data"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm reset</DialogTitle>
                <DialogDescription>
                  This will clear the business data in the approved reset collections. Bundles and admin configuration are excluded.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground">
                Confirmed phrase: <span className="font-mono font-semibold text-foreground">{confirmationText}</span>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button">Cancel</Button>
                <Button variant="destructive" type="button" onClick={handleReset} disabled={isResetting}>
                  {isResetting ? "Resetting..." : "Proceed with reset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {resetStatus.type !== "idle" && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-sm",
              resetStatus.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            )}
          >
            {resetStatus.type === "success" ? (
              <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{resetStatus.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export function SettingsPageClient() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = React.useState<TabId>(
    tabs.some((t) => t.id === tabParam) ? (tabParam as TabId) : "profile"
  )

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    billing: <BillingTab />,
    appearance: <>
      <AppearanceTab />
      <div className="mt-6">
        <ResetDataTab />
      </div>
    </>,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Left nav (desktop) */}
      <nav className="hidden w-52 shrink-0 flex-col gap-1 lg:flex">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start gap-2",
              activeTab === tab.id && "font-semibold"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </nav>

      {/* Mobile tab bar */}
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:hidden">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content — full width */}
      <div className="min-w-0 flex-1">{tabContent[activeTab]}</div>
    </div>
  )
}

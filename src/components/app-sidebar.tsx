"use client"

import * as React from "react"
import {
  ArrowLeftRightIcon,
  BellIcon,
  ChartAreaIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@bundleup.com.gh",
    avatar: "/avatars/shadcn.jpg",
  },
  navManagement: [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: PackageIcon,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: UsersIcon,
    },
    {
      title: "Bundles",
      url: "/admin/bundles",
      icon: DatabaseIcon,
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: ArrowLeftRightIcon,
    },
    {
      title: "Manual Fulfillment",
      url: "/admin/manual-fulfillment",
      icon: ZapIcon,
    },
  ],
  navInsights: [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: ChartAreaIcon,
    },
  ],
  navSecondary: [
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: BellIcon,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },
    {
      title: "Help & Support",
      url: "/admin/support",
      icon: LifeBuoyIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ZapIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">BundleUp</span>
                <span className="truncate text-xs">Admin Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navManagement} title="Management" />
        <NavMain items={data.navInsights} title="Insights" />
        <NavMain items={data.navSecondary} title="System" className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

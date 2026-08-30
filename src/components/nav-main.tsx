"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  title,
  className,
}: {
  title?: string
  className?: string
  items: {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className={className}>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))}
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                <Icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

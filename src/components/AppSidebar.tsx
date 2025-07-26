"use client"
import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BadgeIndianRupee,
  Settings,
} from "lucide-react"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { Button } from "./ui/button"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/settings/KidsLifeSchool")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error("Failed to load settings:", err))
  }, [])

  if (!data) {
    return null // Or a skeleton loader
  }

  console.log('Settings data:', data);
  console.log('Logo base64:', data.logoBase64);
  console.log('Admin image base64:', data.adminImageBase64);

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {data.logoBase64 ? (
                    <img
                      src={data.logoBase64}
                      alt="School Logo"
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        console.error('Logo image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/school_logo.png"
                      alt="Fallback School Logo"
                      width={54}
                      height={54}
                      className="h-12 w-12 object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-lg">{data.schoolName}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.slogan}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {[
              {
                title: "Dashboard",
                icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
                url: "/dashboard",
              },
              {
                title: "Students",
                icon: <Users className="mr-2 h-4 w-4" />,
                url: "/dashboard/students",
                items: [
                  { title: "All Students", url: "/dashboard/students" },
                  { title: "Admissions", url: "/dashboard/admissions" },
                ],
              },
              {
                title: "Finance",
                icon: <BadgeIndianRupee className="mr-2 h-4 w-4" />,
                url: "/dashboard/feeManagement",
                items: [
                  { title: "Fee Management", url: "/dashboard/fee-manangement" },
                  { title: "Expenses", url: "/dashboard/expenses" },
                ],
              },
            ].map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium flex items-center">
                    {item.icon}
                    {item.title}
                  </a>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/dashboard/settings")}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </Button>
        <NavUser
          user={{
            name: data.adminName,
            email: data.adminEmail,
            avatar: data.adminImageBase64
              ? data.adminImageBase64
              : "/avatars/principal.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"
import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BadgeIndianRupee,
  Settings,
} from "lucide-react"

import Image from "next/image"
import Link from "next/link"
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
import { useSchoolData } from "@/app/dashboard/layout"
import { useMemo } from "react"

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { schoolData: data, loading, error } = useSchoolData();

  // Show loading state on server side to prevent hydration mismatch
  if (typeof window === 'undefined' || loading) {
    return (
      <Sidebar variant="floating" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-4">
            <div className="animate-pulse bg-gray-200 rounded-lg w-12 h-12"></div>
            <div className="space-y-2">
              <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>
              <div className="animate-pulse bg-gray-200 rounded h-3 w-16"></div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded h-8"></div>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => [
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
        { title: "Fee Management", url: "/dashboard/fee-management" },
        { title: "Expenses", url: "/dashboard/expenses" },
      ],
    },
  ], []);

  if (error || !data) {
    return (
      <Sidebar variant="floating" {...props}>
        <SidebarHeader>
          <div className="p-4 text-center text-red-500">
            {error || "Failed to load school data"}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center text-sm text-muted-foreground">
            Please refresh the page or contact support.
          </div>
        </SidebarContent>
      </Sidebar>
    );
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
              <Link href="/">
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
                  <span className="font-bold text-lg">{data.schoolName?.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.slogan}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium flex items-center">
                    {item.icon}
                    {item.title}
                  </Link>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>{subItem.title}</Link>
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
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
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
});

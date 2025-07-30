"use client"
import * as React from "react"
import {
  LayoutDashboard,
  Users,
  BadgeIndianRupee,
  Settings,
  Menu,
  X,
} from "lucide-react"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { Button } from "./ui/button"
import { useSchoolData } from "@/app/dashboard/layout"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { schoolData: data, loading, error } = useSchoolData();
  const pathname = usePathname();

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
      url: "/dashboard/fee-management",
      items: [
        { title: "Fee Management", url: "/dashboard/fee-management" },
        { title: "Expenses", url: "/dashboard/expenses" },
      ],
    },
  ], []);

  // Check if current path matches menu item or sub-item
  const isActivePath = (itemUrl: string, subItems?: { url: string }[]) => {
    if (pathname === itemUrl) return true;
    if (subItems) {
      return subItems.some(subItem => pathname === subItem.url);
    }
    return false;
  };

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

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader className="border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-accent/50 transition-colors">
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
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
                  <span className="text-xs text-muted-foreground hidden lg:block">
                    {data.slogan}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={cn(
                    "font-medium flex items-center transition-all duration-200 hover:bg-accent/50 hover:scale-[1.02]",
                    isActivePath(item.url, item.items) && "bg-accent text-accent-foreground shadow-sm"
                  )}
                >
                  <Link href={item.url}>
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5 space-y-1">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild
                          className={cn(
                            "transition-all duration-200 hover:bg-accent/30 hover:scale-[1.01] text-sm",
                            pathname === subItem.url && "bg-accent/20 text-accent-foreground font-medium"
                          )}
                        >
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

      <SidebarFooter className="border-t border-border/40 p-4 space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 w-full justify-center hover:bg-accent/50 transition-colors"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="w-3.5 h-3.5" />
            <span className="truncate">Settings</span>
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

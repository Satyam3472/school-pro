'use client' 
import * as React from "react"
import {
  School,
  Users,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Settings,
  LayoutDashboard,
  BadgeIndianRupee
} from "lucide-react"

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
import Image from "next/image"
import { NavUser } from "./nav-user"

const data = {
  user: {
    name: "Roshan Kumar",
    email: "roshan@kidslife.edu.in",
    avatar: "/avatars/principal.jpg",
  },
  navMain: [
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
          // { title: "Salary Management", url: "/dashboard/salary-management" },
        ],
      },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/assets/school_logo.png"
                    alt="School Logo"
                    width={54}
                    height={54}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-lg">KIDS LIFE SCHOOL</span>
                  <span className="text-xs text-muted-foreground">
                    Shaping Minds, Building Future
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
            {data.navMain.map((item) => (
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 
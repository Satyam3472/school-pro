"use client"
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React, { createContext, useContext, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Navigation context for dashboard
const DashboardNavContext = createContext<{
  breadcrumb: { label: string; href?: string }[];
  setBreadcrumb: (b: { label: string; href?: string }[]) => void;
  pageTitle: string;
  setPageTitle: (t: string) => void;
}>({
  breadcrumb: [{ label: "Dashboard", href: "/dashboard" }],
  setBreadcrumb: () => {},
  pageTitle: "Dashboard",
  setPageTitle: () => {},
});

export function useDashboardNav() {
  return useContext(DashboardNavContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<{ label: string; href?: string }[]>([
    { label: "Dashboard", href: "/dashboard" },
  ]);
  const [pageTitle, setPageTitle] = useState("Dashboard");

  return (
    <DashboardNavContext.Provider value={{ breadcrumb, setBreadcrumb, pageTitle, setPageTitle }}>
      <SidebarProvider
        style={{
          "--sidebar-width": "17rem",
        } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1">
            {/* Shared Dashboard Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumb.map((item, idx) => (
                    <React.Fragment key={item.label}>
                      <BreadcrumbItem className={idx === 0 ? "hidden md:block" : undefined}>
                        {item.href ? (
                          <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {idx < breadcrumb.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main>{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardNavContext.Provider>
  );
} 
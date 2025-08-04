"use client"
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSidebarClose } from "@/hooks/useSidebarClose";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";
import Link from "next/link";


// School data context
const SchoolDataContext = createContext<{
  schoolData: any;
  loading: boolean;
  error: string | null;
}>({
  schoolData: null,
  loading: true,
  error: null,
});

export function useSchoolData() {
  return useContext(SchoolDataContext);
}

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
  
  // School data state - start with loading true to prevent hydration mismatch
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the sidebar close hook for mobile navigation
  useSidebarClose();  

  // Fetch school data once when layout mounts
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        // Only run on client side to avoid hydration mismatch
        if (typeof window === 'undefined') return;
        
        const response = await fetch('/api/dashboard/school-data');
        if (!response.ok) {
          if (response.status === 401) {
            setError("Session expired. Please login again.");
          } else {
            throw new Error(`Failed to fetch school data: ${response.status}`);
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log("Fetched school data:", data);
        setSchoolData(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load school data:", err);
        setError(err instanceof Error ? err.message : "Failed to load school data");
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, []); // Empty dependency array - only run once

  return (
    <SchoolDataContext.Provider value={{ schoolData, loading, error }}>
    <DashboardNavContext.Provider value={{ breadcrumb, setBreadcrumb, pageTitle, setPageTitle }}>
      <SidebarProvider
        style={{
          "--sidebar-width": "18rem",
        } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1">
            {/* Shared Dashboard Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/40">
              <SidebarTrigger className="-ml-1 lg:hidden" data-sidebar-trigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 hidden lg:block"
              />
              <div className="hidden sm:block flex-1 min-w-0">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumb.map((item, idx) => (
                      <React.Fragment key={item.label}>
                          <BreadcrumbItem className={idx === 0 ? "hidden lg:block" : undefined}>
                          {item.href ? (
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                          {idx < breadcrumb.length - 1 && <BreadcrumbSeparator className="hidden lg:block" />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <Link href="/" className="w-full">
                <div className="sm:hidden flex w-full items-center justify-center gap-2">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                      {schoolData?.logoBase64 ? (
                        <img
                          src={schoolData?.logoBase64}
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
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-lg">{schoolData?.schoolName?.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground lg:block">
                        {schoolData?.slogan}
                      </span>
                    </div>
                </div>
              </Link>
            </header>
            <main className="min-h-[calc(100vh-4rem)] bg-background/50">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardNavContext.Provider>
    </SchoolDataContext.Provider>
  );
} 
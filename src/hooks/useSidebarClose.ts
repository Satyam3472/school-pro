import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useSidebarClose() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Find and close the sidebar by clicking the trigger button
      const sidebarTrigger = document.querySelector('[data-sidebar-trigger]') as HTMLElement;
      if (sidebarTrigger) {
        // Small delay to ensure the navigation has completed
        setTimeout(() => {
          sidebarTrigger.click();
        }, 100);
      }
    }
  }, [pathname]);
} 
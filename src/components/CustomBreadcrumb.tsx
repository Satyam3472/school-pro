import React from "react";
import { ChevronRight } from "lucide-react"; 
import Link from "next/link";
import { log } from "console";
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CustomBreadcrumbProps {
  items: BreadcrumbItem[];
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex hidden sm:inline-flex items-center space-x-2 text-sm min-w-[400px] text-gray-600 overflow-x-auto">
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-800 whitespace-nowrap">
              {item.label}
            </span>
          )}
          {idx < items.length - 1 && (
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default CustomBreadcrumb;

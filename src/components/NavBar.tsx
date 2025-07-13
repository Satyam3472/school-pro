'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SCHOOL_NAME } from '../data/data';

const NavBar = () => {
  const [adminView, setAdminView] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Image
              src="/assets/school_logo.png"
              alt="School Logo"
              width={48}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-gray-800 leading-tight">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                {SCHOOL_NAME.toUpperCase()}
              </span>{' '}
              SCHOOL
            </h1>
            <span className="text-xs text-gray-500 italic">
              Shaping Minds, Building Future
            </span>
          </div>
        </div>

        <NavigationMenu className="hidden lg:flex space-x-6 text-sm font-medium">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className="text-gray-700 hover:text-orange-600">Home</Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-700">Academics</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4 bg-white rounded-md shadow-md">
                <ul className="space-y-2">
                  <li><Link href="/academics/primary" className="hover:text-orange-500">Primary</Link></li>
                  <li><Link href="/academics/secondary" className="hover:text-orange-500">Secondary</Link></li>
                  <li><Link href="/academics/senior" className="hover:text-orange-500">Senior</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-700">Admissions</NavigationMenuTrigger>
              <NavigationMenuContent className="p-4 bg-white rounded-md shadow-md">
                <ul className="space-y-2">
                  <li><Link href="/admissions/how-to-apply" className="hover:text-orange-500">How to Apply</Link></li>
                  <li><Link href="/admissions/eligibility" className="hover:text-orange-500">Eligibility</Link></li>
                  <li><Link href="/admissions/fees" className="hover:text-orange-500">Fees Structure</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600">Contact</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden lg:block">
          <Button
            onClick={() => setAdminView(!adminView)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs"
          >
            Admin Panel
          </Button>
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mt-4 space-y-4">
                <Link href="/" className="block text-gray-800 hover:text-orange-600">Home</Link>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Academics</p>
                  <ul className="ml-3 mt-1 space-y-1 text-sm">
                    <li><Link href="/academics/primary" className="block hover:text-orange-500">Primary</Link></li>
                    <li><Link href="/academics/secondary" className="block hover:text-orange-500">Secondary</Link></li>
                    <li><Link href="/academics/senior" className="block hover:text-orange-500">Senior</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Admissions</p>
                  <ul className="ml-3 mt-1 space-y-1 text-sm">
                    <li><Link href="/admissions/how-to-apply" className="block hover:text-orange-500">How to Apply</Link></li>
                    <li><Link href="/admissions/eligibility" className="block hover:text-orange-500">Eligibility</Link></li>
                    <li><Link href="/admissions/fees" className="block hover:text-orange-500">Fees</Link></li>
                  </ul>
                </div>
                <Link href="/contact" className="block text-gray-800 hover:text-orange-600">Contact</Link>

                <Button
                  onClick={() => setAdminView(!adminView)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white mt-4"
                >
                  Admin Panel
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

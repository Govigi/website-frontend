"use client";
import {
  HomeIcon,
  WalletIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  WalletIcon as WalletIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  // Hide navbar on cart page for better checkout UX
  if (pathname === "/cart") {
    return null;
  }

  type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

  const navItems: Array<{
    href: string;
    label: string;
    outline: IconComponent;
    solid: IconComponent;
  }> = [
    {
      href: "/webapp",
      label: "Shop",
      outline: ShoppingBagIcon,
      solid: ShoppingBagIconSolid
    },
    {
      href: "/ordershistory",
      label: "Orders",
      outline: ShoppingBagIcon,
      solid: ShoppingBagIconSolid,
    },
    {
      href: "/wallet",
      label: "Wallet",
      outline: WalletIcon,
      solid: WalletIconSolid,
    },
    { 
      href: "/profile", 
      label: "Profile", 
      outline: UserIcon, 
      solid: UserIconSolid 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <ul className="flex justify-around items-center py-2">
        {navItems.map(({ href, outline: OutlineIcon, solid: SolidIcon, label }) => {
          // Check if pathname starts with the href (handles nested routes)
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center p-1 transition-colors duration-200"
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={"p-2 rounded-full mb-1 transition-all duration-300 w-12 h-8 flex items-center justify-center"}
                >
                  {isActive ? (
                    <SolidIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <OutlineIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <span
                  className={
                    "text-xs font-bold transition-colors duration-200 text-gray-700"
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";
import {
  ShoppingBag,
  Wallet,
  User,
  Receipt,
} from "@phosphor-icons/react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  if (pathname === "/cart") {
    return null;
  }

  const navItems: Array<{
    href: string;
    label: string;
    icon: typeof ShoppingBag;
    activeColor: string;
    inactiveColor: string;
  }> = [
    {
      href: "/webapp",
      label: "Shop",
      icon: ShoppingBag,
      activeColor: "#22c55e",
      inactiveColor: "#6b7280"
    },
    {
      href: "/ordershistory",
      label: "Orders",
      icon: Receipt,
      activeColor: "#22c55e",
      inactiveColor: "#6b7280"
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet,
      activeColor: "#22c55e",
      inactiveColor: "#6b7280"
    },
    { 
      href: "/profile", 
      label: "Profile", 
      icon: User,
      activeColor: "#22c55e",
      inactiveColor: "#6b7280"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <ul className="flex justify-around items-center py-2">
        {navItems.map(({ href, icon: Icon, label, activeColor, inactiveColor }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center justify-center py-2.5 transition-all duration-200"
                aria-current={isActive ? "page" : undefined}
              >
                <Icon 
                  size={22} 
                  weight={isActive ? "duotone" : "regular"}
                  color={isActive ? activeColor : inactiveColor}
                  className="transition-colors duration-200 mb-1"
                />
                
                <span
                  className="text-xs font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? activeColor : inactiveColor,
                    fontSize: "9px"
                  }}
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

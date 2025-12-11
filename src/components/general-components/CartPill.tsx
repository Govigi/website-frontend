"use client";

import { useEffect, useState } from "react";
import { useCart } from "../core/Cart/CartContext";
import { ShoppingCart, ChevronRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CartPill() {
  const { cartItems } = useCart();
  const [showPill, setShowPill] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setShowPill(true);
      if (pathname !== "/cart") {
        const timer = setTimeout(() => setCollapsed(true), 5000);
        return () => clearTimeout(timer);
      } else {
        setCollapsed(false);
      }
    } else {
      setShowPill(false);
    }
  }, [cartItems, pathname]);

  if (!showPill) return null;

  const isCartPage = pathname === "/cart";
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  const handleExpand = (e) => {
    // Prevent navigation and expand if currently collapsed
    if (collapsed && !isCartPage) {
      e.preventDefault();
      setCollapsed(false);

      // Auto-collapse again after 5 seconds if user doesn’t navigate
      const collapseTimer = setTimeout(() => setCollapsed(true), 5000);
      return () => clearTimeout(collapseTimer);
    }
  };

  const linkHref =
    !collapsed && !isCartPage ? "/cart" : isCartPage ? "/checkout" : "#";

  return (
    <div
      className={`fixed z-50 flex justify-center transition-[right,left,bottom] duration-500 ease-in-out h-15 md:hidden ${
        isCartPage
          ? "bottom-20 left-0 right-0"
          : collapsed
          ? "bottom-20 right-4"
          : "bottom-20 left-0 right-0"
      }`}
    >
      <Link
        href={linkHref}
        onClick={handleExpand}
        className={`bg-green-600 text-white shadow-lg flex items-center justify-between gap-3
          hover:bg-green-700 transition-all duration-500 ease-in-out
          overflow-hidden
          ${
            collapsed
              ? "w-14 h-14 rounded-full justify-center scale-95 cursor-pointer"
              : "w-[90%] md:w-[400px] py-3 px-4 rounded-lg scale-100"
          }`}
      >
        {isCartPage ? <CreditCard size={24} /> : <ShoppingCart size={24} />}

        {!collapsed && (
          <>
            <div className="flex flex-col text-sm flex-1 text-left ml-2">
              <span className="font-semibold text-base">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </span>
              {totalPrice > 0 && (
                <span className="font-semibold text-base">₹{totalPrice}</span>
              )}
            </div>
            <span className="text-sm opacity-90">
              {isCartPage ? "Proceed to Checkout" : "Go to Cart"}
            </span>
            <ChevronRight size={20} className="opacity-90" />
          </>
        )}
      </Link>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/general-components/Header";
import WebAppNavbar from "../components/general-components/WebAppNavbar";
import { CartProvider } from "../components/core/Cart/CartContext";
import { AuthProvider } from "../libs/context/AuthContext";
import { ToastProvider } from "../libs/context/ToastContext";
import CartPill from "../components/general-components/CartPill";
import BottomNavbar from "../components/general-components/BottomNavbar";
import ShoppingHeader from "@/components/general-components/ShoppingHeader";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const showWebAppNavbar =
    pathname.startsWith("/webapp") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/wishlist") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/ordershistory") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/saved-address");

  return (
    <html lang="en">
      <link rel="icon" type="image/png" href="/LOGO-png 3.svg" />
      <body className={`${poppins.className} antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {/* ✅ Wrap header with Suspense */}
              <Suspense fallback={null}>
                {showWebAppNavbar ? <ShoppingHeader /> : <Header />}

                <main>{children}</main>

                {showWebAppNavbar && <BottomNavbar />}
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
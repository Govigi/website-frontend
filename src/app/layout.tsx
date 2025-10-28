"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/general-components/Header";
import BottomNavbar from "../components/general-components/BottomNavbar";
import ShoppingHeader from "@/components/general-components/ShoppingHeader";
import { CartProvider } from "../components/core/Cart/CartContext";
import { AuthProvider } from "../libs/context/AuthContext";
import { ToastProvider } from "../libs/context/ToastContext";
import { Suspense } from "react";
import NextTopLoader from "nextjs-progressbar";
import ProgressBar from "@/components/general-components/ProgressBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
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
      <head>
        <link rel="icon" type="image/png" href="/LOGO-png 3.svg" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {/* ✅ Keep loader at very top with a high zIndex */}
        <ProgressBar/>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
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

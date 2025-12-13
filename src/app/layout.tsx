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
import { LoginModalProvider } from "@/libs/context/LoginModalContext";
import { BottomPanelProvider } from "@/components/core/BottomPanel";
import { Suspense } from "react";
import NextTopLoader from "nextjs-progressbar";
import ProgressBar from "@/components/general-components/ProgressBar";
import ServiceWorkerRegister from "@/components/core/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";

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
    pathname.startsWith("/saved-address") ||
    pathname.startsWith("/profile");

  const isProfilePage = pathname.startsWith("/profile");

  // Determine page title and if it's webapp
  const isWebApp = pathname.startsWith("/webapp");
  
  const getPageTitle = () => {
    if (pathname.startsWith("/cart")) return "Cart";
    if (pathname.startsWith("/wishlist")) return "Wishlist";
    if (pathname.startsWith("/notifications")) return "Notifications";
    if (pathname.startsWith("/wallet")) return "Wallet";
    if (pathname.startsWith("/ordershistory")) return "My Orders";
    if (pathname.startsWith("/checkout")) return "Checkout";
    if (pathname.startsWith("/saved-address")) return "Saved Addresses";
    if (pathname.startsWith("/profile")) return "Profile";
    return "";
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" href="/LOGO-png 3.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="description" content="Fresh organic products delivered to your doorstep" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Govigi" />
      </head>
      <body className={`${poppins.className} antialiased overflow-hidden md:overflow-auto`} style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ServiceWorkerRegister />
        <ProgressBar/>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <LoginModalProvider>
                <BottomPanelProvider>
                  <Suspense fallback={null}>
                    {showWebAppNavbar ? <ShoppingHeader isWebApp={isWebApp} pageTitle={getPageTitle()} /> : <Header />}
                    <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 64px)" }}>
                      {children}
                    </main>
                    {(showWebAppNavbar || isProfilePage) && <BottomNavbar />}
                  </Suspense>
                  <Analytics />
                </BottomPanelProvider>
              </LoginModalProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

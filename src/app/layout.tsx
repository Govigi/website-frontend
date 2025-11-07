"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/general-components/Header";
import BottomNavbar from "../components/general-components/BottomNavbar";
import ShoppingHeader from "@/components/general-components/ShoppingHeader";
import { AlertBanner } from "@/components/general-components/AlertBanner";
import { CartProvider } from "../components/core/Cart/CartContext";
import { AuthProvider } from "../libs/context/AuthContext";
import { ToastProvider } from "../libs/context/ToastContext";
import { LoginModalProvider } from "@/libs/context/LoginModalContext";
import { BottomPanelProvider } from "@/components/core/BottomPanel";
import { AlertProvider } from "@/libs/context/AlertContext";
import { Suspense, useEffect, useRef } from "react";
import ProgressBar from "@/components/general-components/ProgressBar";
import ServiceWorkerRegister from "@/components/core/ServiceWorkerRegister";

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
  const headerWrapperRef = useRef<HTMLDivElement | null>(null);
  const bottomWrapperRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

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

  // Dynamically size the scrollable main area to fit between header and bottom nav
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const recompute = () => {
      const headerH = headerWrapperRef.current?.offsetHeight ?? 0;
      const bottomH = bottomWrapperRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--header-h", `${headerH}px`);
      root.style.setProperty("--bottom-h", `${bottomH}px`);
    };

    recompute();

    const ro = new ResizeObserver(() => recompute());
    if (headerWrapperRef.current) ro.observe(headerWrapperRef.current);
    if (bottomWrapperRef.current) ro.observe(bottomWrapperRef.current);
    window.addEventListener("resize", recompute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [pathname]);

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
      <body
        className={`${poppins.className} antialiased`}
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <ServiceWorkerRegister />
        <ProgressBar />
        <ToastProvider>
          <AlertProvider>
            <AuthProvider>
              <CartProvider>
                <LoginModalProvider>
                  <BottomPanelProvider>
                    <Suspense fallback={null}>
                      <div id="header-wrapper" ref={headerWrapperRef} className="flex-shrink-0">
                        <AlertBanner />
                        {showWebAppNavbar ? (
                          <ShoppingHeader isWebApp={isWebApp} pageTitle={getPageTitle()} />
                        ) : (
                          <Header />
                        )}
                      </div>

                      <main
                        id="page-content"
                        ref={mainRef}
                        className="overflow-y-auto overflow-x-hidden md:overflow-visible"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          minHeight: 0,
                          height: "calc(100dvh - var(--header-h, 0px) - var(--bottom-h, 0px))",
                        }}
                      >
                        {children}
                      </main>

                      {(showWebAppNavbar || isProfilePage) && (
                        <div id="bottom-navbar-wrapper" ref={bottomWrapperRef} className="flex-shrink-0">
                          <BottomNavbar />
                        </div>
                      )}
                    </Suspense>
                  </BottomPanelProvider>
                </LoginModalProvider>
              </CartProvider>
            </AuthProvider>
          </AlertProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

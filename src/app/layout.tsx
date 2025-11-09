"use client";

import { usePathname } from "next/navigation";
import { Suspense, useRef, useEffect } from "react";
import { Poppins } from "next/font/google";
import { Header, BottomNavbar, ShoppingHeader } from "@/components/features/layout";
import { AlertBanner } from "@/components/features/alerts";
import { CartProvider } from "@/components/core/Cart/CartContext";
import { AuthProvider } from "@/libs/context/AuthContext";
import { ToastProvider } from "@/libs/context/ToastContext";
import { LoginModalProvider } from "@/libs/context/LoginModalContext";
import { BottomPanelProvider } from "@/components/core/BottomPanel";
import { AlertProvider } from "@/libs/context/AlertContext";
import { CookieConsentProvider } from "@/libs/context/CookieConsentContext";
import ProgressBar from "@/components/general-components/ProgressBar";
import ServiceWorkerRegister from "@/components/core/ServiceWorkerRegister";
import CookieConsent from "@/components/general-components/CookieConsent";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
  }, [pathname]);

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

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" href="/LOGO-png 3.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="description" content="Fresh organic products delivered to your doorstep" />
      </head>

      <body className={`${poppins.variable} h-[100dvh] flex flex-col overflow-hidden bg-white antialiased`}>
        <ServiceWorkerRegister />
        <ProgressBar />

        <CookieConsentProvider>
          <ToastProvider>
            <AlertProvider>
              <AuthProvider>
                <CartProvider>
                  <LoginModalProvider>
                    <BottomPanelProvider>
                      <Suspense fallback={null}>
                        <div className="flex flex-col h-[100dvh] overflow-hidden">
                          {/* Header */}
                          <div className="flex-shrink-0">
                            <AlertBanner />
                            {showWebAppNavbar ? (
                              <ShoppingHeader isWebApp={isWebApp} pageTitle={getPageTitle()} />
                            ) : (
                              <Header />
                            )}
                          </div>

                          {/* Main */}
                          <main className="flex-1 overflow-y-auto overflow-x-hidden">
                            {children}
                          </main>

                          {/* Bottom Navbar */}
                          {(showWebAppNavbar || isProfilePage) && (
                              <BottomNavbar />
                          )}
                        </div>

                      </Suspense>

                      <CookieConsent />
                    </BottomPanelProvider>
                  </LoginModalProvider>
                </CartProvider>
              </AuthProvider>
            </AlertProvider>
          </ToastProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}

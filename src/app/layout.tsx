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
import { AlertProvider } from "@/libs/context/AlertContext";
import { Suspense } from "react";
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
        <link rel="icon" type="image/png" href="/LOGO-png 3.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body
        className={`${poppins.className} antialiased flex flex-col h-screen overflow-hidden bg-white`}
      >
        <ProgressBar />
        <ToastProvider>
          <AlertProvider>
            <AuthProvider>
              <CartProvider>
                <LoginModalProvider>
                  <BottomPanelProvider>
                    <Suspense fallback={null}>
                      {/* Header Section */}
                      {showWebAppNavbar ? (
                        <ShoppingHeader isWebApp={isWebApp} pageTitle={getPageTitle()} />
                      ) : (
                        <Header />
                      )}

                      {/* Main Scrollable Content */}
                      <main
                        className="flex-1 overflow-y-auto overflow-x-hidden md:overflow-visible"
                        style={{
                          WebkitOverflowScrolling: "touch",
                          minHeight: 0,
                        }}
                      >
                        {children}
                      </main>

                      {/* Bottom Navigation (fixed at bottom) */}
                      {(showWebAppNavbar || isProfilePage) && (
                        <div className="flex-shrink-0">
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

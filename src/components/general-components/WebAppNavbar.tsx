"use client";

import {
  Bell,
  Heart,
  MapPinLine,
  Receipt,
  ShoppingCartSimple,
  SignIn,
  SignOut,
  UserCircle,
  Wallet,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../libs/context/AuthContext";
import { useCart } from "../core/Cart/CartContext";
import Address from "./Address";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import QuickPeekPanel from "./QuickPeekPanel";
import SidePanel from "./SidePanel";

export default function Header() {
  const router = useRouter();
  const { logout, isAuthenticated, wishlist } = useAuth();
  const { cartItems } = useCart();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { open: openLogin } = useLoginModal();
  const [location, setLocation] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState(null); // 'cart' | 'notifications' | 'profile' | 'wishlist' | 'orders' | 'wallet' | 'addresses'
  const hoverCloseTimeout = useRef(null);
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/searchpro?query=${searchQuery}`);
    }
  };

  const formatLocation = (locObj) => {
    if (!locObj) return "";
    const { city, state } = locObj;
    return [city, state].filter(Boolean).join(", ");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user-location");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocation(formatLocation(parsed));
        } catch (e) {
          console.error("Invalid location data:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    setShowProfileDropdown(false);
    setMobileMenuOpen(false);
    setPanelOpen(false);
    setPanelType(null);
  }, [pathname]);

  // Lock body scroll when mobile menu or side panel is open
  useEffect(() => {
    if (mobileMenuOpen || panelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, panelOpen]);

  const openPanel = (type) => {
    setPanelType(type);
    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);

  const getPanelData = () => {
    switch (panelType) {
      case "cart":
        return { items: cartItems };
      case "notifications":
        return { list: [] };
      case "wishlist":
        return { list: [] };
      case "orders":
        return { list: [] };
      case "wallet":
        return { balance: 0 };
      case "addresses":
        return { list: [] };
      case "profile":
      default:
        return {};
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="flex items-center justify-between h-16 px-4 md:px-10">
          <div className="flex items-center gap-4 w-full max-w-[60%]">
            <Link href="/webapp">
              <Image
                src="/LOGO-png 3.svg"
                alt="GoVigi Logo"
                width={80}
                height={32}
              />
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-grow">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search here"
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm focus:outline-none"
                />
              </div>
            </form>

            <div
              className="hidden lg:flex flex-col text-sm cursor-pointer"
              onClick={() => setShowLocationPopup(true)}
            >
              <span className="font-semibold text-black">
                Delivery in 24 hours
              </span>
              <span className="text-gray-600 text-xs">
                {location || "Choose your location"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <button
              type="button"
              onClick={() => openPanel("cart")}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
            >
              <ShoppingCartSimple size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => openPanel("notifications")}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
            >
              <Bell size={24} />
            </button>

            {/* Profile (hover to open) */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (hoverCloseTimeout.current)
                  clearTimeout(hoverCloseTimeout.current);
                setShowProfileDropdown(true);
              }}
              onMouseLeave={() => {
                if (hoverCloseTimeout.current)
                  clearTimeout(hoverCloseTimeout.current);
                hoverCloseTimeout.current = setTimeout(
                  () => setShowProfileDropdown(false),
                  150
                );
              }}
            >
              <button
                onClick={() => setShowProfileDropdown((v) => !v)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={showProfileDropdown}
              >
                <UserCircle size={24} />
              </button>
              {showProfileDropdown && (
                <div
                  className="absolute right-0 top-full w-56 bg-white shadow-lg rounded-lg z-50 py-2"
                  onMouseEnter={() => {
                    if (hoverCloseTimeout.current)
                      clearTimeout(hoverCloseTimeout.current);
                    setShowProfileDropdown(true);
                  }}
                  onMouseLeave={() => {
                    if (hoverCloseTimeout.current)
                      clearTimeout(hoverCloseTimeout.current);
                    hoverCloseTimeout.current = setTimeout(
                      () => setShowProfileDropdown(false),
                      150
                    );
                  }}
                >
                  <div className="px-4 pb-2 text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
                    <UserCircle size={16} />
                    <span>My Account</span>
                  </div>
                    <button
                    type="button"
                    onClick={() => {
                      openPanel("profile");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <UserCircle size={18} /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openPanel("addresses");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <MapPinLine size={18} /> Saved Address
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openPanel("orders");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <Receipt size={18} /> Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openPanel("wallet");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <Wallet size={18} /> Wallet
                  </button>
                  <div className="my-1 h-px bg-gray-200" />
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      <SignOut size={18} /> Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        openLogin();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <SignIn size={18} /> Sign in / Sign up
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden fixed inset-0 z-50 ${
            mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          {/* Backdrop */}
          <button
            aria-label="Close mobile menu"
            onClick={() => setMobileMenuOpen(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Right panel */}
          <aside
            className={`absolute right-0 top-0 h-full w-[85%] max-w-xs bg-white shadow-xl transition-transform duration-300 ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-sm font-medium">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 h-[calc(100%-57px)] overflow-y-auto">
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border rounded-md text-sm"
                />
              </form>

              <div className="flex flex-col space-y-4 text-sm">
                {[
                  {
                    href: "/profile",
                    label: "Profile",
                    icon: <UserCircle size={24} />,
                  },
                  {
                    href: "/cart",
                    label: "Cart",
                    icon: <ShoppingCartSimple size={24} />,
                  },
                  {
                    href: "/wishlist",
                    label: "Wishlist",
                    icon: <Heart size={24} />,
                  },
                  {
                    href: "/notifications",
                    label: "Notifications",
                    icon: <Bell size={24} />,
                  },
                  {
                    href: "/ordershistory",
                    label: "My Orders",
                    icon: <Receipt size={24} />,
                  },
                  {
                    href: "/wallet",
                    label: "Wallet",
                    icon: <Wallet size={24} />,
                  },
                  {
                    href: "/saved-address",
                    label: "Saved Address",
                    icon: <MapPinLine size={24} />,
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {isAuthenticated ? (
                  <Link
                    href="/logout"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLogoutConfirm(true);
                    }}
                    className="flex items-center gap-3 text-red-600"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8">
                      <SignOut size={24} />
                    </span>
                    <span>Logout</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openLogin();
                    }}
                    className="flex items-center gap-3 text-green-600"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8">
                      <SignIn size={24} />
                    </span>
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Location Popup */}
        {showLocationPopup && (
          <Address
            isOpen={showLocationPopup}
            onClose={() => setShowLocationPopup(false)}
            onLocationUpdate={(newLoc) => {
              localStorage.setItem("user-location", JSON.stringify(newLoc));
              setLocation(formatLocation(newLoc));
              setShowLocationPopup(false);
            }}
          />
        )}


        {/* logout */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 backdrop-blur-sm">
            <div className="animate-slide-down bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Are you sure you want to logout?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                    // router.push("/");
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
            <style jsx>{`
              .animate-slide-down {
                animation: slideDownFade 0.3s ease-out forwards;
              }
              @keyframes slideDownFade {
                0% {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}
      </header>
      {/* Universal Side Panel for quick peeks from header/dropdown */}
      <SidePanel
        open={panelOpen}
        onClose={closePanel}
        title={
          panelType === "cart"
            ? "My Cart"
            : panelType === "notifications"
            ? "Notifications"
            : panelType === "wishlist"
            ? "Wishlist"
            : panelType === "orders"
            ? "My Orders"
            : panelType === "wallet"
            ? "Wallet"
            : panelType === "addresses"
            ? "Saved Addresses"
            : panelType === "profile"
            ? "My Account"
            : ""
        }
      >
        {panelType && (
          <QuickPeekPanel
            type={panelType}
            data={getPanelData()}
            onClose={closePanel}
          />
        )}
      </SidePanel>
    </>
  );
}

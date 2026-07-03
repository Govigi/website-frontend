"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { ListBulletIcon } from "@heroicons/react/24/solid";
import { useCart } from "../core/Cart/CartContext";
import Image from "next/image";
import Link from "next/link";
import SidePanel from "./SidePanel";
import QuickPeekPanel from "./QuickPeekPanel";

interface ShoppingHeaderProps {
    pageTitle?: string;
    isWebApp?: boolean;
}

export default function ShoppingHeader({ pageTitle = "", isWebApp = false }: ShoppingHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const { cartItems } = useCart();
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelType, setPanelType] = useState(null);

    const closePanel = () => {
        setPanelOpen(false);
        setPanelType(null);
    };

    const openPanel = (type) => {
        setPanelType(type);
        setPanelOpen(true);
    };

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

    const cartItemsCount = cartItems.length;

    const searchQuery = searchParams.get("search")?.trim() || "";

    // 🔹 Update local state when search query changes
    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    // 🔹 Listen for openOrdersPanel event from CartComponent
    useEffect(() => {
        const handleOpenOrdersPanel = () => {
            setPanelType("orders");
            setPanelOpen(true);
        };

        window.addEventListener("openOrdersPanel", handleOpenOrdersPanel);
        return () => window.removeEventListener("openOrdersPanel", handleOpenOrdersPanel);
    }, []);

    // 🔹 Live update on typing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        router.push(`/webapp?search=${encodeURIComponent(value)}`);
    };

    // 🔹 Handle form submit (Enter key or magnifier click)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/webapp?search=${encodeURIComponent(search.trim())}`);
    };

    return (
        <>
            <header className="w-full bg-white/80 backdrop-blur-md shadow-xs sticky top-0 z-50">
                {/* Desktop Header - No changes */}
                <div className="hidden sm:flex items-center justify-between px-8 gap-4 rounded-b-4xl">
                    <Link href="/webapp">
                        <Image
                            src="/logo.svg"
                            alt="GoVigi Logo"
                            width={100}
                            height={40}
                        />
                    </Link>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 justify-end gap-4 items-center"
                    >
                        <div className="relative w-full max-w-lg my-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={handleInputChange}
                                className="max-w-[600px] w-full h-12 pl-14 pr-4 rounded-full border bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400
                         focus:outline-none transition-all duration-200 text-md font-semibold"
                            />
                            <button
                                type="submit"
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600 transition-colors"
                            >
                                <MagnifyingGlassIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div
                            onClick={() => openPanel("cart")}
                            className={`relative flex items-center justify-center w-12 h-12 p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${cartItemsCount > 0 ? "bg-green-600 hover:bg-green-700" : ""
                                }`}
                        >
                            <ShoppingCartIcon
                                className={`w-8 h-8 text-black transition-transform duration-200 group-hover:scale-110 ${cartItemsCount > 0 ? "text-white" : ""
                                    }`}
                            />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black border-2 border-white text-white text-[10px] font-medium flex-col rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemsCount}
                                </span>
                            )}
                        </div>

                        <div
                            onClick={() => openPanel("profile")}
                            className="rounded-full items-center w-12 h-12 p-3 border border-gray-200">
                            <ListBulletIcon className="w-6 h-6 text-black" />
                        </div>
                    </form>
                </div>

                {/* Mobile Header */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 rounded-b-4xl">
                    {isWebApp ? (
                        // Mobile /webapp page - Search + Cart
                        <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex-1">
                                <form onSubmit={handleSubmit} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={search}
                                        onChange={handleInputChange}
                                        className="w-full h-10 pl-10 pr-4 rounded-full border bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                            <div
                                onClick={() => router.push("/cart")}
                                className={`relative flex items-center justify-center w-10 h-10 p-2 border border-gray-200 rounded-full cursor-pointer ${cartItemsCount > 0 ? "bg-green-600" : ""}`}
                            >
                                <ShoppingCartIcon
                                    className={`w-6 h-6 ${cartItemsCount > 0 ? "text-white" : "text-black"}`}
                                />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black border-2 border-white text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Mobile other pages - Chevron + Title + Cart
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <h1 className="text-lg font-semibold">{pageTitle}</h1>
                            </div>
                            <div
                                onClick={() => router.push("/cart")}
                                className={`relative flex items-center justify-center w-10 h-10 p-2 border border-gray-200 rounded-full cursor-pointer ${cartItemsCount > 0 ? "bg-green-600" : ""}`}
                            >
                                <ShoppingCartIcon
                                    className={`w-6 h-6 ${cartItemsCount > 0 ? "text-white" : "text-black"}`}
                                />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black border-2 border-white text-white text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <SidePanel
                open={panelOpen}
                onClose={closePanel}
                title={
                    panelType === "cart"
                        ? "Cart"
                        : panelType === "notifications"
                            ? "Notifications"
                            : panelType === "wishlist"
                                ? "Wishlist"
                                : panelType === "orders"
                                    ? "Orders"
                                    : panelType === "wallet"
                                        ? "Wallet"
                                        : panelType === "addresses"
                                            ? "Saved Addresses"
                                            : panelType === "profile"
                                                ? "Account"
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
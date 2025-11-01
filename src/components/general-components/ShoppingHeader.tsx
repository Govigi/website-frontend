"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { ListBulletIcon } from "@heroicons/react/24/solid";
import { useCart } from "../core/Cart/CartContext";
import Image from "next/image";
import Link from "next/link";
import SidePanel from "./SidePanel";
import QuickPeekPanel from "./QuickPeekPanel";

export default function ShoppingHeader() {
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
            <header className="w-full bg-white/80 backdrop-blur-md flex items-center shadow-xs justify-between sm:px-8 gap-4 rounded-b-4xl px-2 sticky top-0 z-50">
                <Link href="/webapp">
                    <Image
                        src="/LOGO-png 3.svg"
                        alt="GoVigi Logo"
                        width={100}
                        height={40}
                        className="hidden sm:block"
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
                        onClick={() => router.push("/cart")}
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
                        className="rounded-full items-center w-12 h-12 p-3 border border-gray-200 hidden sm:block">
                        <ListBulletIcon className="w-6 h-6 text-black" />
                    </div>
                </form>
            </header>
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
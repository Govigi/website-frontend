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

export default function ShoppingHeader() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const { cartItems } = useCart();
    const cartItemsCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

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
        <header className="w-full bg-white/80 backdrop-blur-md flex items-center shadow-xs justify-between sm:px-8 gap-4 rounded-b-4xl px-2 fixed top-0 z-50">
            <Image
                src="/LOGO-png 3.svg"
                alt="Logo"
                width={100}
                height={40}
                className="hidden sm:block"
            />

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
                    className={`relative flex items-center justify-center w-12 h-12 p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${cartItemsCount > 0 ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                >
                    <ShoppingCartIcon
                        className={`w-8 h-8 text-black transition-transform duration-200 group-hover:scale-110 ${cartItemsCount > 0 ? "text-white" : ""
                            }`}
                    />
                    {cartItemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black border border-white text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {cartItemsCount}
                        </span>
                    )}
                </div>

                <div className="rounded-full p-4 border border-gray-200 hidden sm:block">
                    <ListBulletIcon className="w-6 h-6 text-black" />
                </div>
            </form>
        </header>
    );
}
"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function EmptyCart({ variant }: { variant: string }) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShoppingCartIcon className="w-10 h-10 text-green-600" />
                </div>
            </div>
            <p className="text-gray-900 font-bold text-lg">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-2">
                Start adding items from fresh collection
            </p>
            {variant === "full" && (
                <button
                    onClick={() => router.push("/webapp")}
                    className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md font-semibold transition-all duration-200 shadow-md"
                >
                    Continue Shopping
                </button>
            )}
        </div>
    );
}

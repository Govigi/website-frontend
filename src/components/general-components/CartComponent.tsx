"use client";

import { useCart } from "../core/Cart/CartContext";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { ShoppingCartIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface CartComponentProps {
    variant?: "full" | "preview"; // 'full' for cart page, 'preview' for sidebar
}

export default function CartComponent({ variant = "preview" }: CartComponentProps) {
    const {
        cartItems,
        incrementQuantity,
        decreaseQuantity,
        updateQuantity,
        removeFromCart,
    } = useCart();
    const router = useRouter();

    if (!cartItems?.length) {
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
                        className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white rounded-lg font-semibold transition-all duration-200 shadow-md"
                    >
                        Continue Shopping
                    </button>
                )}
            </div>
        );
    }

    const getItemPrice = (item) => item?.price ?? item?.product?.price ?? 0;
    const getItemName = (item) => item?.name || item?.product?.name || "Product";
    const getItemQuantity = (item) => item?.quantity ?? 1;
    const getItemImage = (item) =>
        item?.image?.url || item?.product?.image?.url || "/placeholder-product.png";

    const subtotal = cartItems.reduce(
        (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
        0
    );
    const delivery = subtotal > 500 ? 0 : 50;
    const total = subtotal + delivery;

    const totalQuantity = cartItems.reduce((sum, item) => sum + getItemQuantity(item), 0);

    return (
        <div className={variant === "full" ? "flex flex-col h-full bg-white" : "space-y-3"}>
            {/* Header - Full Variant */}
            {/* {variant === "full" && (
                <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">My Cart</h1>
                            <p className="text-xs text-gray-500 mt-0.5">{cartItems.length} items</p>
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">
                            {totalQuantity} kg
                        </div>
                    </div>
                </div>
            )} */}

            {/* Scrollable Items Container */}
            <div className={variant === "full" ? "flex-1 overflow-y-auto pb-32 px-4 pt-3" : ""}>
                <div className={`space-y-3 ${variant === "full" ? "" : ""}`}>
                    {cartItems.map((item, i) => {
                        const qty = getItemQuantity(item);
                        const price = getItemPrice(item);
                        const lineTotal = price * qty;

                        return (
                            <div
                                key={i}
                                className="relative bg-white rounded-md border border-gray-200 transition-all overflow-hidden"
                            >
                                {/* Card Content */}
                                <div className="p-3 flex gap-3 items-start">
                                    {/* Image */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={getItemImage(item)}
                                                alt={getItemName(item)}
                                                className="w-full h-full object-contain p-1"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder-product.png";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info & Controls */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                                {getItemName(item)}
                                            </h3>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-md p-1">
                                                <button
                                                    onClick={() =>
                                                        qty <= 1 ? removeFromCart(item) : decreaseQuantity(item)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-700 transition-all active:scale-95 font-semibold text-sm"
                                                >
                                                    <Minus weight="bold" className="w-3 h-3" />
                                                </button>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={qty}
                                                    onChange={(e) => {
                                                        const newQty = Number(e.target.value);
                                                        if (Number.isNaN(newQty) || newQty < 0) return;
                                                        if (newQty === 0) {
                                                            removeFromCart(item);
                                                        } else {
                                                            updateQuantity(item, newQty);
                                                        }
                                                    }}
                                                    className="w-8 h-7 text-center border-0 text-xs font-bold text-gray-900 bg-white rounded-md focus:outline-none"
                                                />

                                                <button
                                                    onClick={() => incrementQuantity(item)}
                                                    disabled={item.stock && qty >= item.stock}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-green-500 text-white transition-all active:scale-95 font-semibold text-sm disabled:opacity-50"
                                                >
                                                    <Plus weight="bold" className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                {qty} kg
                                            </span>
                                        </div>
                                    </div>

                                    {/* Remove Button - Always visible */}
                                    <button
                                        onClick={() => removeFromCart(item)}
                                        className="p-2 rounded-md bg-red-50 text-red-500 transition-all flex-shrink-0"
                                        title="Remove item"
                                    >
                                        <X weight="bold" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Summary - Fixed */}
            {variant === "full" && (
                <div className="bg-white border-t border-gray-200 p-4 shadow-md">
                    <div className="flex items-center justify-start gap-2 mb-4">
                        <div className="h-5 w-1.5 bg-green-500 rounded-full">
                        </div>
                        <p className="text-md text-black font-bold">Cart Summary</p>
                    </div>
                    <div className="max-w-xl mx-auto">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-green-50 rounded-md p-3 border border-green-200">
                                <p className="text-xs text-gray-600 font-medium">Total Quantity</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{totalQuantity} kg</p>
                            </div>
                            <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                                <p className="text-xs text-gray-600 font-medium">Total Items</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{cartItems.length}</p>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button className="w-full py-3 px-4 bg-green-50 border border-green-400 text-green-600 font-semibold rounded-md flex items-center justify-center gap-2 cursor-pointer">
                            <span>Checkout</span>
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Variant */}
            {variant === "preview" && (
                <div className="pt-2 border-t border-gray-200 bg-white rounded-md p-3">
                    <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Items</span>
                            <span className="font-semibold text-gray-900">{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-semibold text-green-600">{totalQuantity} kg</span>
                        </div>
                    </div>
                    <button className="w-full py-2.5 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2">
                        <span>View Cart</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
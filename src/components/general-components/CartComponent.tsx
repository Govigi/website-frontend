"use client";

import { useCart } from "../core/Cart/CartContext";
import { useAuth } from "@/libs/context/AuthContext";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { ShoppingCartIcon, ChevronRightIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGlobalBottomPanel } from "@/components/core/BottomPanel";
import axios from "axios";
import { config } from "@/libs/utils/config";

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
    const { logout } = useAuth();
    const { openPanel: globalOpenPanel, closePanel: globalClosePanel } = useGlobalBottomPanel();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const router = useRouter();
    const backendApi = config.backend_url;
    
    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const parsedToken = JSON.parse(token);
                const res = await axios.post(`${backendApi}/getAddress`, { token: parsedToken });
                setAddresses(res.data?.addresses || []);
            }
        } catch (err) {
            console.error("Failed to fetch addresses", err);
            if (err.response?.status === 500) logout();
        }
    };

    // Address selection panel content
    const getAddressPanel = () => (
        <div className="space-y-2 p-4">
            <p className="text-sm text-gray-600 font-medium mb-3">Your Addresses</p>
            {addresses && addresses.length > 0 ? (
                addresses.map((addr, idx) => (
                    <div
                        key={idx}
                        onClick={() => {
                            setSelectedAddress(idx);
                            setTimeout(() => globalClosePanel(), 300);
                        }}
                        className={`p-3 border rounded-md cursor-pointer transition-all relative ${
                            selectedAddress === idx
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                        {selectedAddress === idx && (
                            <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            </div>
                        )}
                        <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{addr.contact}</p>
                        <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                ))
            ) : null}
            
            {/* Add New Address Button */}
            <button
                onClick={() => router.push("/saved-address")}
                className="w-full p-3 border-2 border-dashed border-green-300 rounded-md text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-2 mt-3"
            >
                <Plus weight="bold" className="w-4 h-4" />
                Add New Address
            </button>
        </div>
    );

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
            {/* Cart Header - Full Variant */}
            {variant === "full" && (
                <div className="sticky top-[-1] z-10 px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-600 font-medium">Items</p>
                                <p className="text-lg font-bold text-gray-900">{cartItems.length}</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div className="text-center">
                                <p className="text-xs text-gray-600 font-medium">Quantity</p>
                                <p className="text-lg font-bold text-green-600">{totalQuantity} kg</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/webapp")}
                            className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-md hover:bg-green-100 transition-colors flex items-center gap-1.5"
                        >
                            <Plus weight="bold" className="w-4 h-4" />
                            Add More
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Items Container */}
            <div className={variant === "full" ? "flex-1 overflow-y-auto pb-32" : ""}>
                <div className={`space-y-3 ${variant === "full" ? "px-4 pt-4" : ""}`}>
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

            {/* Fixed Checkout Bar - Above Bottom Navbar */}
            {variant === "full" && (
                <div className="fixed bottom-19 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                    {/* Place Order Row */}
                    <div className="px-4 py-3 flex items-center gap-2 min-w-0">
                        {/* Selected Address Display */}
                        <button
                            onClick={() => globalOpenPanel(
                                "Select Delivery Address",
                                getAddressPanel()
                            )}
                            className="flex-1 flex items-center gap-2 min-w-0 text-left hover:bg-gray-50 transition-colors py-1"
                        >
                            <MapPinIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 leading-tight">Deliver to</p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                    {selectedAddress !== null && addresses[selectedAddress]
                                        ? `${addresses[selectedAddress].name}, ${addresses[selectedAddress].city}`
                                        : "Select"}
                                </p>
                            </div>
                        </button>

                        {/* Place Order Button */}
                        <button className="px-3 sm:px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs sm:text-sm flex-shrink-0">
                            <span>Place Order</span>
                            <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
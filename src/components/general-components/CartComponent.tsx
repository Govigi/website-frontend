"use client";

import { useCart } from "../core/Cart/CartContext";
import { useAuth } from "@/libs/context/AuthContext";
import { Minus, Plus, X, MapPinArea } from "@phosphor-icons/react";
import { ShoppingCartIcon, ChevronRightIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
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
        clearCart,
    } = useCart();
    const { logout } = useAuth();
    const { openPanel: globalOpenPanel, closePanel: globalClosePanel } = useGlobalBottomPanel();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [inputValues, setInputValues] = useState({}); // Track input values separately
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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
                const fetchedAddresses = res.data?.addresses || [];
                setAddresses(fetchedAddresses);
                // Set first address as default
                if (fetchedAddresses.length > 0) {
                    setSelectedAddress(0);
                }
            }
        } catch (err) {
            console.error("Failed to fetch addresses", err);
            if (err.response?.status === 500) logout();
        }
    };

    // Address selection panel content
    const getAddressPanel = () => (
        <div className="space-y-3 p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 font-medium">Your Addresses</p>
                <button
                    onClick={() => router.push("/saved-address")}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold text-xs transition-colors"
                >
                    <Plus weight="bold" className="w-4 h-4" />
                    Add New
                </button>
            </div>
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
                                ? "border-green-500 bg-gradient-to-br from-green-100"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        style={selectedAddress === idx ? {
                            backgroundImage: "radial-gradient(circle at top right, #dcfce7, #ffffff)"
                        } : {}}
                    >
                        {selectedAddress === idx && (
                            <div className="absolute top-2 right-2">
                                <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                        <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{addr.contact}</p>
                        <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                ))
            ) : null}
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

    const handlePlaceOrder = async () => {
        if (selectedAddress === null || !addresses[selectedAddress]) {
            alert("Please select a delivery address");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty");
            return;
        }

        setIsPlacingOrder(true);

        try {
            const token = localStorage.getItem("token");
            const selectedAddr = addresses[selectedAddress];

            const orderPayload = {
                token: token ? JSON.parse(token) : null,
                phone: selectedAddr?.contact ?? "",
                name: selectedAddr?.name ?? "",
                email: selectedAddr?.email ?? "",
                address: {
                    city: selectedAddr?.city,
                    landmark: selectedAddr?.landmark,
                    state: selectedAddr?.state,
                    pincode: selectedAddr?.pincode,
                    fullAddress: `${selectedAddr?.landmark || ""}, ${selectedAddr?.city}, ${selectedAddr?.state} - ${selectedAddr?.pincode}`,
                },
                items: cartItems.map((item) => ({
                    productId: item._id,
                    name: getItemName(item),
                    quantityKg: getItemQuantity(item),
                    image: getItemImage(item),
                    price: getItemPrice(item),
                })),
                totalAmount: cartItems.reduce(
                    (total, item) => total + getItemQuantity(item) * getItemPrice(item),
                    0
                ),
                scheduledDate: new Date().toISOString().split("T")[0],
            };

            const res = await axios.post(`${backendApi}/createOrder`, orderPayload);

            if (res.status === 200 || res.status === 201) {
                // Clear cart from both localStorage and context
                localStorage.removeItem("cart");
                clearCart();
                
                // Show success message and redirect
                alert("Order placed successfully!");
                
                // Redirect to order history after 1 second
                setTimeout(() => {
                    router.push("/ordershistory");
                }, 1000);
            }
        } catch (err) {
            console.error("Failed to place order", err);
            alert(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className={variant === "full" ? "flex flex-col h-full bg-white" : "space-y-3"}>
            {/* Scrollable Items Container */}
            <div className={variant === "full" ? "flex-1 overflow-y-auto pb-32" : ""}>
                <div className={`space-y-3 ${variant === "full" ? "pt-4" : ""}`}>
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
                                                    value={inputValues[i] !== undefined ? inputValues[i] : qty}
                                                    onChange={(e) => {
                                                        // Allow user to type freely - store raw input value
                                                        setInputValues(prev => ({
                                                            ...prev,
                                                            [i]: e.target.value
                                                        }));
                                                    }}
                                                    onBlur={(e) => {
                                                        const finalValue = e.target.value;
                                                        
                                                        // Clear the input state
                                                        setInputValues(prev => {
                                                            const newState = { ...prev };
                                                            delete newState[i];
                                                            return newState;
                                                        });
                                                        
                                                        // Only process if user entered something
                                                        if (finalValue === "") {
                                                            removeFromCart(item);
                                                        } else {
                                                            const newQty = Number(finalValue);
                                                            if (!Number.isNaN(newQty) && newQty > 0) {
                                                                updateQuantity(item, newQty);
                                                            } else if (newQty === 0 || Number.isNaN(newQty)) {
                                                                removeFromCart(item);
                                                            }
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

            {/* Fixed Checkout Bar - Above Bottom (No navbar on cart page) */}
            {variant === "full" && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                    <div className="px-3 py-3">
                        {/* Address Selection */}
                        <div className="w-full pb-3 mb-3 border-b border-gray-200">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <MapPinArea size={32} color="#16a34a" weight="duotone" className="flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 mb-0.5">
                                            Delivering to {selectedAddress !== null && addresses[selectedAddress]
                                                ? addresses[selectedAddress].name
                                                : "Select Address"}
                                        </p>
                                        {selectedAddress !== null && addresses[selectedAddress] && (
                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                {addresses[selectedAddress].city}, {addresses[selectedAddress].state} {addresses[selectedAddress].pincode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => globalOpenPanel(
                                        "Select Delivery Address",
                                        getAddressPanel()
                                    )}
                                    className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
                                >
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2">
                            {/* Add More Button */}
                            <button
                                onClick={() => router.push("/webapp")}
                                className="flex-1 px-3 py-2.5 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-md hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Plus weight="bold" className="w-4 h-4" />
                                <span>Add More</span>
                            </button>

                            {/* Place Order Button */}
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || selectedAddress === null}
                                className="flex-1 px-3 sm:px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Placing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </>
                                )}
                            </button>
                        </div>
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
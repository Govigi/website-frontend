"use client";

import { MapPinArea, Plus } from "@phosphor-icons/react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface Address {
    name: string;
    contact: string;
    city: string;
    state: string;
    pincode: string;
}

interface CheckoutBarProps {
    isAuthenticated: boolean;
    selectedAddress: number | null;
    addresses: Address[];
    isPlacingOrder: boolean;
    onChangeAddress: () => void;
    onAddMore: () => void;
    onPlaceOrder: () => void;
}

export default function CheckoutBar({
    isAuthenticated,
    selectedAddress,
    addresses,
    isPlacingOrder,
    onChangeAddress,
    onAddMore,
    onPlaceOrder,
}: CheckoutBarProps) {
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="px-3 py-3">
                {/* Address Selection */}
                {isAuthenticated && (
                    <div className="w-full pb-3 mb-3 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                <MapPinArea
                                    size={32}
                                    color="#16a34a"
                                    weight="duotone"
                                    className="flex-shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 mb-0.5">
                                        Delivering to{" "}
                                        {selectedAddress !== null && addresses[selectedAddress]
                                            ? addresses[selectedAddress].name
                                            : "Select Address"}
                                    </p>
                                    {selectedAddress !== null && addresses[selectedAddress] && (
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {addresses[selectedAddress].city},{" "}
                                            {addresses[selectedAddress].state}{" "}
                                            {addresses[selectedAddress].pincode}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onChangeAddress}
                                className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onAddMore}
                        className="flex-1 px-3 py-2.5 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-md hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Plus weight="bold" className="w-4 h-4" />
                        <span>Add More</span>
                    </button>

                    <button
                        onClick={onPlaceOrder}
                        disabled={isPlacingOrder || selectedAddress === null || !isAuthenticated}
                        className="flex-1 px-3 sm:px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                            !isAuthenticated
                                ? "Please sign in to place an order"
                                : ""
                        }
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
    );
}

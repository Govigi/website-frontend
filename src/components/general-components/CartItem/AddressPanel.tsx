"use client";

import { Plus } from "@phosphor-icons/react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface Address {
    name: string;
    contact: string;
    city: string;
    state: string;
    pincode: string;
}

interface AddressPanelProps {
    addresses: Address[];
    selectedAddress: number | null;
    onSelectAddress: (index: number) => void;
}

export default function AddressPanel({
    addresses,
    selectedAddress,
    onSelectAddress,
}: AddressPanelProps) {
    const router = useRouter();

    return (
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
                        onClick={() => onSelectAddress(idx)}
                        className={`p-3 border rounded-md cursor-pointer transition-all relative ${
                            selectedAddress === idx
                                ? "border-green-500 bg-gradient-to-br from-green-100"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        style={
                            selectedAddress === idx
                                ? {
                                      backgroundImage:
                                          "radial-gradient(circle at top right, #dcfce7, #ffffff)",
                                  }
                                : {}
                        }
                    >
                        {selectedAddress === idx && (
                            <div className="absolute top-2 right-2">
                                <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                        <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{addr.contact}</p>
                        <p className="text-xs text-gray-600">
                            {addr.city}, {addr.state} {addr.pincode}
                        </p>
                    </div>
                ))
            ) : null}
        </div>
    );
}

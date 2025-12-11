"use client";

import { X, Plus, SealCheckIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { CheckBadgeIcon as HeroCheckBadgeIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: any[];
  selectedAddress: number | null;
  onSelectAddress: (index: number) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
}: AddressModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-2xl w-[90%] max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Select Delivery Address</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X size={20} weight="bold" className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {addresses && addresses.length > 0 ? (
              addresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectAddress(idx);
                    setTimeout(() => onClose(), 300);
                  }}
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
                      <HeroCheckBadgeIcon className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <p className="font-semibold text-sm text-gray-900">{addr.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{addr.contact}</p>
                  <p className="text-xs text-gray-600">
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No addresses found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <button
            onClick={() => {
              router.push("/saved-address");
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-md font-semibold text-sm transition-colors"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Add New Address
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

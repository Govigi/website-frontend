"use client";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface PreviewSummaryProps {
    cartItemsCount: number;
    totalQuantity: number;
}

export default function PreviewSummary({
    cartItemsCount,
    totalQuantity,
}: PreviewSummaryProps) {
    return (
        <div className="pt-2 border-t border-gray-200 bg-white rounded-md p-3">
            <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold text-gray-900">{cartItemsCount}</span>
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
    );
}

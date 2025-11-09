"use client";

import { X } from "@phosphor-icons/react";
import QuantitySelector from "./QuantitySelector";

interface CartItemProps {
    item: any;
    index: number;
    inputValue?: string | number;
    onInputChange: (index: number, value: string) => void;
    onInputBlur: (index: number, value: string) => void;
    onDecrement: (item: any) => void;
    onIncrement: (item: any) => void;
    onRemove: (item: any) => void;
    getItemImage: (item: any) => string;
    getItemName: (item: any) => string;
    getItemQuantity: (item: any) => number;
    variant?: "full" | "preview";
}

export default function CartItem({
    item,
    index,
    inputValue,
    onInputChange,
    onInputBlur,
    onDecrement,
    onIncrement,
    onRemove,
    getItemImage,
    getItemName,
    getItemQuantity,
    variant = "preview",
}: CartItemProps) {
    const qty = getItemQuantity(item);
    const containerClass =
        variant === "full"
            ? "relative bg-white transition-all overflow-hidden border-b border-gray-200 last:border-b-0"
            : "relative bg-white rounded-md border border-gray-200 transition-all overflow-hidden";

    return (
        <div className={containerClass}>
            <div className="p-3 flex gap-3 items-start">
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

                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {getItemName(item)}
                        </h3>
                    </div>

                    <QuantitySelector
                        quantity={qty}
                        inputValue={inputValue}
                        onInputChange={(value) => onInputChange(index, value)}
                        onInputBlur={(value) => onInputBlur(index, value)}
                        onDecrement={() => (qty <= 1 ? onRemove(item) : onDecrement(item))}
                        onIncrement={() => onIncrement(item)}
                        maxStock={item.stock}
                    />
                </div>

                <button
                    onClick={() => onRemove(item)}
                    className="p-2 rounded-md bg-red-50 text-red-500 transition-all flex-shrink-0"
                    title="Remove item"
                >
                    <X weight="bold" className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

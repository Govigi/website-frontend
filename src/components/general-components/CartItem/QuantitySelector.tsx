"use client";

import { Minus, Plus } from "@phosphor-icons/react";

interface QuantitySelectorProps {
    quantity: number;
    inputValue?: string | number;
    onInputChange: (value: string) => void;
    onInputBlur: (value: string) => void;
    onDecrement: () => void;
    onIncrement: () => void;
    maxStock?: number;
}

export default function QuantitySelector({
    quantity,
    inputValue,
    onInputChange,
    onInputBlur,
    onDecrement,
    onIncrement,
    maxStock,
}: QuantitySelectorProps) {
    const isMaxStock = maxStock && quantity >= maxStock;

    return (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-md p-1">
                <button
                    onClick={onDecrement}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-700 transition-all active:scale-95 font-semibold text-sm"
                >
                    <Minus weight="bold" className="w-3 h-3" />
                </button>

                <input
                    type="number"
                    min="0"
                    value={inputValue !== undefined ? inputValue : quantity}
                    onChange={(e) => onInputChange(e.target.value)}
                    onBlur={(e) => onInputBlur(e.target.value)}
                    className="w-8 h-7 text-center border-0 text-xs font-bold text-gray-900 bg-white rounded-md focus:outline-none"
                />

                <button
                    onClick={onIncrement}
                    disabled={isMaxStock}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-green-500 text-white transition-all active:scale-95 font-semibold text-sm disabled:opacity-50"
                >
                    <Plus weight="bold" className="w-3 h-3" />
                </button>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                {quantity} kg
            </span>
        </div>
    );
}

"use client";

import { TruckIcon } from "@heroicons/react/24/solid";
import CartItem from "./CartItem";

interface CartItemsListProps {
    cartItems: any[];
    variant: "full" | "preview";
    inputValues: Record<number, string>;
    onInputChange: (index: number, value: string) => void;
    onInputBlur: (index: number, value: string) => void;
    onDecrement: (item: any) => void;
    onIncrement: (item: any) => void;
    onRemove: (item: any) => void;
    getItemImage: (item: any) => string;
    getItemName: (item: any) => string;
    getItemQuantity: (item: any) => number;
}

export default function CartItemsList({
    cartItems,
    variant,
    inputValues,
    onInputChange,
    onInputBlur,
    onDecrement,
    onIncrement,
    onRemove,
    getItemImage,
    getItemName,
    getItemQuantity,
}: CartItemsListProps) {
    if (variant === "full") {
        return (
            <div className="border border-gray-200 rounded-md overflow-hidden mt-4">
                <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <TruckIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-medium">Delivery by tomorrow</span>
                </div>

                <div className="space-y-0 p-0">
                    {cartItems.map((item, i) => (
                        <CartItem
                            key={i}
                            item={item}
                            index={i}
                            inputValue={inputValues[i]}
                            onInputChange={onInputChange}
                            onInputBlur={onInputBlur}
                            onDecrement={onDecrement}
                            onIncrement={onIncrement}
                            onRemove={onRemove}
                            getItemImage={getItemImage}
                            getItemName={getItemName}
                            getItemQuantity={getItemQuantity}
                            variant="full"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cartItems.map((item, i) => (
                <CartItem
                    key={i}
                    item={item}
                    index={i}
                    inputValue={inputValues[i]}
                    onInputChange={onInputChange}
                    onInputBlur={onInputBlur}
                    onDecrement={onDecrement}
                    onIncrement={onIncrement}
                    onRemove={onRemove}
                    getItemImage={getItemImage}
                    getItemName={getItemName}
                    getItemQuantity={getItemQuantity}
                    variant="preview"
                />
            ))}
        </div>
    );
}

"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/solid";

export interface WeightPickerContentProps {
  item: any;
  isInCart: boolean;
  initialSelected: number | null;
  initialCustom: string;
  onConfirm: (weight: number) => Promise<void> | void;
  onRemove?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  popularWeights?: number[];
}

export default function WeightPickerContent({
  item,
  isInCart,
  initialSelected,
  initialCustom,
  onConfirm,
  onRemove,
  onCancel,
  confirmLabel = "Add to Cart",
  popularWeights = [0.25, 0.5, 1, 2, 5, 10],
}: WeightPickerContentProps) {
  const [sel, setSel] = useState<number | null>(initialSelected);
  const [custom, setCustom] = useState<string>(initialCustom);
  const [adding, setAdding] = useState(false);

  const finalWeight = sel != null ? sel : (parseFloat(custom) || 0);

  const handleConfirm = async () => {
    if (finalWeight <= 0) return;
    try {
      setAdding(true);
      await onConfirm(finalWeight);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Product Info */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <img
          src={item?.image?.url || "/placeholder-product.png"}
          alt={item?.name}
          className="w-14 h-14 object-contain rounded-md bg-gray-50 p-2"
        />
        <div className="text-left flex-1">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item?.name}</h4>
          <p className="text-xs text-gray-600 mt-1">Choose your preferred weight</p>
        </div>
      </div>

      {/* Quick Select */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">Quick Select</label>
        <div className="grid grid-cols-3 gap-2">
          {popularWeights.map((w) => (
            <button
              key={w}
              onClick={() => { setSel(w); setCustom(""); }}
              className={`py-2.5 rounded-md border text-sm font-medium transition-all duration-200 ${sel === w ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-300 bg-white text-gray-700 hover:border-green-400"}`}
            >
              {w} kg
            </button>
          ))}
        </div>
      </div>

      {/* Custom Weight */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">Custom Weight</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setSel(null); }}
            placeholder="0.0"
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-700 text-sm font-medium">kg</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-200">
        {!isInCart && (
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium">Cancel</button>
        )}

        {isInCart && (
          <button onClick={onRemove} className="flex flex-row items-center flex-1 justify-center py-2.5 text-red-600 border border-red-300 bg-red-50 rounded-md text-sm font-medium gap-1.5">
            <TrashIcon className="w-4 h-4" /> Remove
          </button>
        )}

        <button
          onClick={handleConfirm}
          disabled={adding || finalWeight <= 0}
          className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-md text-sm font-medium gap-2 flex items-center justify-center"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCartIcon className="w-4 h-4" />} {adding ? "Adding..." : confirmLabel}
        </button>
      </div>
    </div>
  );
}

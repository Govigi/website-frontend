"use client";
import { config } from "@/libs/utils/config";
import { useEffect, useState } from "react";
import { useAuth } from "../../libs/context/AuthContext";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import { useToast } from "../../libs/context/ToastContext";
import { Loader2 } from "lucide-react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function ProductCard({
  item,
  onAddToCart,
  webapp,
  onQuickView,
  cartItems,
  incrementQuantity,
  decreaseQuantity,
  updateQuantity,
  removeFromCart,
}) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const popularWeights = [0.25, 0.5, 1, 2, 5, 10];
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [customWeight, setCustomWeight] = useState("");

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const backendURL = config.backend_url;

  // Cart info
  const cartItem = cartItems?.find((c) => c._id === item._id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  const getDiscountPercentage = () =>
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(
        ((item.originalPrice - item.price) / item.originalPrice) * 100
      )
      : 0;

  // No local login modal state; global login modal manages itself

  // Unified modal toggle with scroll management
  const toggleWeightModal = (open) => {
    setShowWeightModal(open);
    document.body.style.overflow = open ? "hidden" : "auto";
  };

  const handleWeightSelect = (weight) => {
    setSelectedWeight(weight);
    setCustomWeight("");
  };

  const handleCustomWeightChange = (value) => {
    setCustomWeight(value);
    setSelectedWeight(null);
  };

  const getFinalWeight = () => {
    return selectedWeight || parseFloat(customWeight) || 0;
  };

  const handleAddWithWeight = async () => {
    const weightToAdd = getFinalWeight();
    if (weightToAdd <= 0) return;

    // if (!isAuthenticated) {
    //   toggleWeightModal(false);
    //   return setShowLogin?.(true);
    // }

    setIsLoading(true);

    try {
      await onAddToCart({ ...item, quantity: weightToAdd });
      setQuantity(1);
      toggleWeightModal(false);
      showToast(`${item.name} added to cart (${weightToAdd} kg)`, "success");
    } catch {
      showToast("Failed to add item to cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200
      p-3 sm:p-4 text-center flex flex-col justify-between h-full transition-all duration-200 w-full">
      {/* Discount badge */}
      {getDiscountPercentage() > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{getDiscountPercentage()}%
        </span>
      )}

      {/* Product Image */}
      <div className="relative flex justify-center items-center w-full h-28 sm:h-28 mb-3 mt-4">
        {!imageLoaded && !imageError && (
          <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
        )}
        {imageError ? (
          <div className="text-gray-400 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-1 flex items-center justify-center">
              📦
            </div>
            <span className="text-xs">No image</span>
          </div>
        ) : (
          <img
            src={item.image?.url || "/placeholder-product.png"}
            alt={item.name}
            className={`w-[100px] h-[100px] object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
              } ${isOutOfStock ? "grayscale opacity-50" : ""}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 text-left space-y-1">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-gray-500 text-xs">1 Kg</p>
        {isOutOfStock ? (
          <p className="text-xs text-red-500 font-medium">Out of Stock</p>
        ) : isLowStock ? (
          <p className="text-xs text-orange-500 font-medium">
            Only {item.stock} left
          </p>
        ) : null}
      </div>

      {/* Footer */}
      {webapp && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end items-center">
          {/* Price */}
          {/* <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-800">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div> */}

          {/* Cart Action */}
          {!isInCart ? (
            <button
              onClick={() => toggleWeightModal(true)}
              disabled={isOutOfStock || isLoading}
              className={`w-[50%] h-[34px] flex items-center justify-center rounded-md border font-medium text-xs sm:text-sm transition-all
                cursor-pointer
                ${isOutOfStock
                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  : isLoading
                    ? "bg-green-400 text-white border-green-400"
                    : "bg-white text-green-600 border-green-600 hover:bg-green-50"
                }`}
            >
              {isLoading ? "Adding..." : "ADD"}
            </button>
          ) : (
            <div className="w-full flex justify-center">
              <div className="flex items-center justify-center w-[50%] h-[34px] bg-green-100 text-green-700 rounded-md mr-2 border border-green-200 overflow-hidden">
                <div className="p-1 text-xs font-medium">
                  {cartQuantity} KG
                </div>
              </div>
              <div className="flex items-center justify-center w-[50%] h-[34px] bg-green-600 text-white rounded-md overflow-hidden">
                <button
                  onClick={() => toggleWeightModal(true)}
                  className="w-full cursor-pointer h-[34px] bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-md w-full max-w-sm shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Select Weight</h2>
              <button
                onClick={() => toggleWeightModal(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors active:scale-95"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-5 border-b border-gray-200 flex items-center gap-3">
              <img
                src={item.image?.url || "/placeholder-product.png"}
                alt={item.name}
                className="w-14 h-14 object-contain rounded-md bg-gray-50 p-2"
              />
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                <p className="text-xs text-gray-600 mt-1">Choose your preferred weight</p>
              </div>
            </div>

            {/* Weight Selection */}
            <div className="p-5 space-y-5">
              {/* Quick Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {popularWeights.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => handleWeightSelect(weight)}
                      className={`py-2.5 rounded-md border text-sm font-medium transition-all duration-200 active:scale-95 ${selectedWeight === weight
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
                        }`}
                    >
                      {weight} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Weight */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wide">
                  Custom Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={customWeight}
                    onChange={(e) => handleCustomWeightChange(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <span className="text-gray-700 text-sm font-medium">kg</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                {!isInCart && (
                  <button
                    onClick={() => toggleWeightModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                )}
                {isInCart && (
                  <button
                    onClick={() => {
                      removeFromCart(item);
                      toggleWeightModal(false);
                    }}
                    className="flex flex-row items-center flex-1 justify-center py-2.5 text-red-600 border border-red-300 bg-red-50 rounded-md text-sm font-medium hover:bg-red-100 transition-colors active:scale-95 gap-1.5"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remove
                  </button>
                )}
                <button
                  onClick={handleAddWithWeight}
                  disabled={isLoading || getFinalWeight() <= 0}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-md text-sm font-medium transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCartIcon className="w-4 h-4" />
                  )}
                  {isLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
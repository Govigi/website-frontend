"use client";
import { config } from "@/libs/utils/config";
import { useEffect, useState } from "react";
import { useAuth } from "../../libs/context/AuthContext";
import { useToast } from "../../libs/context/ToastContext";
import { Heart, Loader2 } from "lucide-react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProductCard({
  item,
  onAddToCart,
  webapp,
  setShowLogin,
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
  const backendURL = config.backend_url;

  // Cart info
  const cartItem = cartItems?.find((c) => c._id === item._id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  const getDiscountPercentage = () =>
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(
        ((item.originalPrice - item.price) / item.originalPrice) * 100
      )
      : 0;

  useEffect(() => {
    if (isAuthenticated && typeof setShowLogin === "function") {
      setShowLogin(false);
    }
  }, [isAuthenticated, setShowLogin]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return setShowLogin?.(true);

    setIsLoading(true);
    try {
      await onAddToCart({ ...item, quantity });
      setQuantity(1);
      showToast(`${item.name} added to cart (${quantity} kg)`, "success");
    } catch {
      showToast("Failed to add item to cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeightSelect = (weight) => {
    setSelectedWeight(weight);
    setCustomWeight("");
  }

  const handleCustomWeightChange = (value) => {
    setCustomWeight(value);
    setSelectedWeight(null);
  }

  const getFinalWeight = () => {
    return selectedWeight || parseFloat(customWeight) || 0;
  }

  const handleAddWithWeight = async () => {
    const weightToAdd = getFinalWeight();
    if (weightToAdd <= 0) return;

    setIsLoading(true);

    try {
      await onAddToCart({ ...item, quantity: weightToAdd });
      setQuantity(1);
      setShowWeightModal(false);
      showToast(`${item.name} added to cart (${weightToAdd} kg)`, "success");
    } catch {
      showToast("Failed to add item to cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-green-300 
      p-3 sm:p-4 text-center flex flex-col justify-between h-full transition-all duration-200 w-full">
      {/* Discount badge */}
      {getDiscountPercentage() > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          -{getDiscountPercentage()}%
        </span>
      )}

      {/* Product Image */}
      <div className="relative flex justify-center items-center w-full h-28 sm:h-32 mb-3 mt-4">
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
            className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
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
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
          {/* Price */}
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-800">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Cart Action */}
          {!isInCart ? (
            <button
              onClick={() => setShowWeightModal(true)}
              disabled={isOutOfStock || isLoading}
              className={`w-[70px] h-[34px] flex items-center justify-center rounded-md border font-medium text-xs sm:text-sm transition-all
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
            <div className="flex items-center justify-between w-[70px] h-[34px] bg-green-600 text-white rounded-md overflow-hidden">
              <button
                onClick={() => decreaseQuantity(item)}
                className="flex-1 h-full text-sm font-bold hover:bg-green-700"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {cartQuantity}
              </span>
              <button
                onClick={() => incrementQuantity(item)}
                disabled={item.stock && cartQuantity >= item.stock}
                className="flex-1 h-full text-sm font-bold hover:bg-green-700 disabled:opacity-50"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}

      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-scale-in border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Select Weight</h2>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <img
                src={item.image?.url || "/placeholder-product.png"}
                alt={item.name}
                className="w-14 h-14 object-contain rounded-lg bg-gray-50 p-2"
              />
              <div className="text-left">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-1">Choose preferred weight</p>
              </div>
            </div>

            {/* Weight Selection */}
            <div className="p-4 space-y-5">
              {/* Popular Weights */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {popularWeights.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => handleWeightSelect(weight)}
                      className={`py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${selectedWeight === weight
                          ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
                        }`}
                    >
                      {weight} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-gray-600 text-sm font-medium">kg</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-2.5 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor:pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWithWeight}
                  disabled={isLoading || getFinalWeight() <= 0}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCartIcon className="w-4 h-4" />
                  )}
                  {isLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// Corrected ProductCard with custom weight edit visibility fix
"use client";
import { config } from "@/libs/utils/config";
import { useEffect, useState } from "react";
import { useAuth } from "../../libs/context/AuthContext";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import { useToast } from "../../libs/context/ToastContext";
import { useGlobalBottomPanel } from "@/components/core/BottomPanel/BottomPanelContext";
import { Loader2 } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@phosphor-icons/react";
import WeightPickerContent from "./WeightPickerContent";

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

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { open: openLogin } = useLoginModal();
  const { openPanel, closePanel } = useGlobalBottomPanel();
  const backendURL = config.backend_url;

  // FIX: ensure custom weight is visible when editing existing item
  const cartItem = cartItems?.find((c) => c._id === item._id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    // no-op: initial values will be passed to reusable content
  }, [isInCart, cartQuantity]);

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  const getDiscountPercentage = () =>
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  const toggleWeightModal = (open) => {
    setShowWeightModal(open);
    document.body.style.overflow = open ? "hidden" : "auto";
  };

  const openWeightPicker = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      // Initialize from current cart state
      const initialSel = !isInCart || popularWeights.includes(cartQuantity) ? (isInCart ? cartQuantity : 1) : null;
      const initialCus = isInCart && !popularWeights.includes(cartQuantity) ? String(cartQuantity) : "";
      openPanel(
        "Select Weight",
        <WeightPickerContent
          item={item}
          isInCart={isInCart}
          initialSelected={initialSel}
          initialCustom={initialCus}
          onCancel={() => closePanel()}
          onRemove={() => { removeFromCart(item); closePanel(); }}
          onConfirm={async (w) => { await onAddToCart({ ...item, quantity: w }); closePanel(); }}
          confirmLabel={isInCart ? "Update Cart" : "Add to Cart"}
        />,
        { maxHeight: "85vh" }
      );
    } else {
      toggleWeightModal(true);
    }
  };

  return (
    <div className="group relative bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 text-center flex flex-col justify-between h-full transition-all duration-200 w-full">

      {/* Discount Badge */}
      {getDiscountPercentage() > 0 && (
        <div className="absolute top-2 left-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-r-lg shadow-md overflow-hidden">
          <div className="px-3 py-1.5 flex items-center justify-center whitespace-nowrap">
            <span className="text-[11px] sm:text-xs font-bold tracking-wide">
              {getDiscountPercentage()}% OFF
            </span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative flex justify-center items-center w-full h-28 sm:h-28 mb-3 mt-4">
        {!imageLoaded && !imageError && <Loader2 className="w-5 h-5 text-green-500 animate-spin" />}

        {imageError ? (
          <div className="text-gray-400 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-1 flex items-center justify-center">📦</div>
            <span className="text-xs">No image</span>
          </div>
        ) : (
          <img
            src={item.image?.url || "/placeholder-product.png"}
            alt={item.name}
            className={`w-[100px] h-[100px] object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"} ${isOutOfStock ? "grayscale opacity-50" : ""}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 text-left space-y-1.5">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">{item.name}</h3>
        <p className="text-gray-500 text-xs">1 Kg</p>

        {/* Price */}
        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-sm font-semibold text-gray-900">₹{item.price || 0}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
          )}
        </div>

        {isOutOfStock ? (
          <p className="text-xs text-red-500 font-medium">Out of Stock</p>
        ) : isLowStock ? (
          <p className="text-xs text-yellow-600 font-medium">Only {item.stock} left</p>
        ) : null}
      </div>

      {/* Footer */}
      {webapp && (
        <div className="mt-3 pt-2 border-t border-dashed border-gray-100 flex justify-end items-center">
          {!isInCart ? (
            <button
              onClick={openWeightPicker}
              disabled={isOutOfStock || isLoading}
              className={`h-[32px] w-[32px] flex items-center justify-center rounded-md border font-semibold transition-all
                ${isOutOfStock ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" : isLoading ? "bg-green-500 text-white border-green-500" : "bg-green-50 text-green-600 border-green-600 hover:bg-green-50"}`}
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusIcon size={14} weight="bold" />}
            </button>
          ) : (
            <div className="w-full flex justify-center">
              <div className="flex items-center justify-center w-[50%] h-[34px] bg-green-100 text-green-700 rounded-md mr-2 border border-green-200 overflow-hidden">
                <div className="p-1 text-xs font-medium">{cartQuantity} KG</div>
              </div>
              <div className="flex items-center justify-center w-[50%] h-[34px] bg-green-600 text-white rounded-md overflow-hidden">
                <button onClick={openWeightPicker} className="w-full h-[34px] bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all">Edit</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showWeightModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4"
          onClick={() => toggleWeightModal(false)}
        >
          <div
            className="bg-white rounded-md w-full max-w-sm shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Select Weight</h2>
              <button
                onClick={() => toggleWeightModal(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors active:scale-95"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <WeightPickerContent
              item={item}
              isInCart={isInCart}
              initialSelected={
                !isInCart || popularWeights.includes(cartQuantity)
                  ? (isInCart ? cartQuantity : 1)
                  : null
              }
              initialCustom={
                isInCart && !popularWeights.includes(cartQuantity)
                  ? String(cartQuantity)
                  : ""
              }
              onCancel={() => toggleWeightModal(false)}
              onRemove={() => {
                removeFromCart(item);
                toggleWeightModal(false);
              }}
              onConfirm={async (w) => {
                await onAddToCart({ ...item, quantity: w });
                toggleWeightModal(false);
              }}
              confirmLabel={isInCart ? "Update Cart" : "Add to Cart"}
            />
          </div>
        </div>
      )}

    </div>
  );
}
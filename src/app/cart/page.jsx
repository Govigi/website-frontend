"use client";

import { useRouter } from "next/navigation";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../components/core/Cart/CartContext";
import Image from "next/image";

export default function CartPage() {
  const {
    cartItems,
    addToCart, // Used for updating quantity via input
    removeFromCart,
    decreaseQuantity,
    incrementQuantity,
  } = useCart();
  const router = useRouter();
  // Calculate totals based on cartItems from the context
  const calculateTotals = () => {
    let totalNoOfItems = 0;
    let totalWeight = 0; // Assuming 'quantity' in your cart items represents weight in Kg's
    let totalPrice = 0;

    cartItems.forEach((item) => {
      totalNoOfItems += 1; // Each unique item is 1 towards total items count
      totalWeight += item.quantity || 0; // Assuming item.quantity is in Kg's
      totalPrice += (item.quantity || 0) * (parseFloat(item.pricePerKg) || 0);
    });

    return { totalNoOfItems, totalWeight, totalPrice };
  };

  const { totalNoOfItems, totalWeight, totalPrice } = calculateTotals();

  const handleQuantityInput = (e, item) => {
    const value = parseInt(e.target.value);
    // Ensure the value is a number and at least 1
    if (!isNaN(value) && value >= 1) {
      // Use addToCart to update the quantity of an existing item
      // This assumes addToCart can handle updating quantity if item already exists
      addToCart({ ...item, quantity: value });
    } else if (e.target.value === "") {
      // Allow empty input temporarily for user to type, but don't update quantity to 0
      // You might want to add a debounce or a blur event to handle this more robustly
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="max-w-xl mx-auto  font-sans">
      {/* Header */}
      <div className="flex justify-center items-center p-4">
        <h1 className="text-xl font-semibold text-gray-800">Cart</h1>
      </div>

      {/* Cart Items Section */}
      <div className="p-5 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 px-2">
            <div className="max-w-md mx-auto">
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <ShoppingCartIcon className="w-10 h-10 text-white" />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full mx-auto blur-xl opacity-50 -z-10"></div>
              </div>
              {/* Text Content */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-gray-600">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg transform focus:outline-none focus:ring-4 focus:ring-green-200 hover:cursor-pointer"
              >
                Continue Buying
              </button>
            </div>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item._id} // Using _id for a more stable key if available
              className="flex items-center space-x-4 pb-4 border-b border-dashed border-gray-200 last:border-b-0"
            >
              {/* Item Image */}
              <img
                src={
                  item.image?.url ||
                  `https://placehold.co/80x80/E0F2F1/00796B?text=${item.name.charAt(
                    0
                  )}`
                } // Fallback placeholder
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
              />

              {/* Item Details (Name, Price) */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  ₹ {parseFloat(item.pricePerKg).toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => decreaseQuantity(item)}
                  className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={item.quantity}
                  onChange={(e) => handleQuantityInput(e, item)}
                  className="w-12 text-center border border-gray-300 rounded-md py-1 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={() => incrementQuantity(item)}
                  className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Remove item"
              >
                <Trash2 size={20} />
                <span className="sr-only">Remove</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Order Summary / Totals */}
      {cartItems.length > 0 && (
        <div className="bg-blue-50 p-5 space-y-3 rounded-b-xl">
          <div className="flex justify-between text-gray-700 text-sm">
            <span>Total No of Items</span>
            <span className="font-medium">{totalNoOfItems}</span>
          </div>
          <div className="flex justify-between text-gray-700 text-sm">
            <span>Total Weight (In Kg's)</span>
            <span className="font-medium">{totalWeight}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Price</span>
            <span>₹ {totalPrice.toFixed(2)}</span>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleCheckout}
            className="w-full py-3 mt-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../components/core/Cart/CartContext";
import Image from "next/image";
import { useAuth } from "@/libs/context/AuthContext";
import { useState } from "react";
import LoginCard from "@/components/general-components/LoginCard";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
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
  const [showLogin, setShowLogin] = useState(false);

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
    <div className="max-w-xl mx-auto py-20 px-4">
      {/* Header */}
      <div className="flex justify-start items-center p-2">
        <h1 className="text-xl font-semibold text-gray-800">Items in Cart</h1>
      </div>

      <div className="max-w-6xl mx-auto px-2 py-2">
        {cartItems.length === 0 ? (
          // Empty Cart View
          <div className="text-center py-16 px-4 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <ShoppingCartIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full mx-auto blur-xl opacity-50 -z-10"></div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>

              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                Continue Buying
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items + Summary
          <div className="grid grid-cols-1  gap-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-4">
              <p className="text-md font-semibold text-gray-800 border-b pb-3">
                Shopping Cart ({totalNoOfItems})
              </p>

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-150"
                >
                  {/* Image + Details */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img
                      src={
                        item.image?.url ||
                        `https://placehold.co/80x80/E0F2F1/00796B?text=${item.name.charAt(
                          0
                        )}`
                      }
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        ₹ {parseFloat(item.pricePerKg).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls + Delete */}
                  <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decreaseQuantity(item)}
                        className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
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
                        className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-6 space-y-4 rounded-xl shadow-md border border-gray-200 h-fit sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Order Summary
              </h3>

              <div className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                <span>Total No. of Items</span>
                <span className="font-medium">{totalNoOfItems}</span>
              </div>

              <div className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                <span>Total Weight (in Kg)</span>
                <span className="font-medium">{totalWeight}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Price</span>
                <span>₹ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    handleCheckout();
                  } else {
                    setShowLogin(true);
                  }
                }}
                className="w-full py-3 mt-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
      </div>



      

      <LoginCard
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={undefined}
      />
    </div>
  );
}

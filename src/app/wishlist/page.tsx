"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useCart } from "../../components/core/Cart/CartContext";
import { LoaderCircle, Trash2 } from "lucide-react";
import axios from "axios";
import { config } from "@/lib/utils/config";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const backendApi = config.backend_url;

  const handleRemoveWish = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (token) token = JSON.parse(token);

      await axios.post(`${backendApi}/togglewish`, { productId, token });
      // fetchWishlist();
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-16">
      {loading ? (
        <div className="flex justify-center items-center">
          <LoaderCircle size={32} className="animate-spin text-gray-500" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-10">
          <div className="mb-6">
            <div className="w-32 h-24 rounded-md flex items-center justify-center">
              <img
                src="/cancel-order.png"
                alt="logo"
                className="max-h-full max-w-full"
              />
            </div>
          </div>
          <div className="text-center text-gray-600 text-xl">
            Your wishlist is empty
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Your Wishlist
          </h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product) =>
              product ? (
                <div
                  key={product._id}
                  className="relative bg-white shadow rounded-lg p-4 hover:shadow-md transition duration-300"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleRemoveWish(product._id)}
                    className="cursor-pointer absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={20} />
                  </button>

                  {/* Product image */}
                  <img
                    src={product.image?.url}
                    alt={product.name}
                    className="w-full h-48 object-contain mb-3"
                  />

                  {/* Product info */}
                  <h3 className="text-lg font-bold">{product.name}</h3>

                  {/* Price + Add to Cart */}
                  <div className="flex justify-between items-center mt-4">
                    <span className=" font-semibold text-gray-800 text-sm">
                      ₹{product.pricePerKg}/Kg
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="cursor-pointer bg-[#2E7D32] hover:bg-green-700 text-white font-medium
                      px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
}

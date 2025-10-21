"use client";

import { config } from "@/libs/utils/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useCart } from "../core/Cart/CartContext";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";

export default function ViewAll({ webapp, setShowLogin }) {
  const {
    cartItems,
    addToCart,
    incrementQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const backendURL = config.backend_url;

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";

  // ✅ Main fetch logic
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendURL}/getAllProducts`);
      let fetched = res.data.products || [];

      console.log("Fetched products:", fetched);

      // Safe name checking
      fetched = fetched.filter((item) => item.name || item.productName || item.title);

      // 🔍 Apply search filter if any
      if (searchQuery) {
        fetched = fetched.filter((item) => {
          const name = (item.name || item.productName || item.title || "").toLowerCase();
          return name.includes(searchQuery.toLowerCase());
        });
      }

      // 🧩 Filter by category if stored
      if (category) {
        fetched = fetched.filter((item) =>
          (item.category || "").toLowerCase().includes(category.toLowerCase())
        );
      }

      setProducts(fetched);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Read category from localStorage
  useEffect(() => {
    const savedCategory = localStorage.getItem("category");
    if (savedCategory) {
      const formatted =
        savedCategory.charAt(0).toUpperCase() + savedCategory.slice(1);
      setCategory(formatted);
    }
  }, []);

  // Fetch products when category or search changes
  useEffect(() => {
    fetchProducts();
  }, [category, searchQuery]);

  // Quantity logic (unchanged)
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const modalTotal = selectedItem
    ? (parseFloat(selectedItem.price) * quantity).toFixed(2)
    : 0;

  return (
    <section className="px-4 md:px-10 py-20">
      <div className="flex flex-row justify-between items-center mb-5">
        <h2 className="text-sm font-bold text-left">
          Buy Bulk Fresh{" "}
          {category ? `${category} ` : ""}Online
        </h2>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchQuery
            ? `No products found for "${searchQuery}".`
            : "No products available."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 transition-all">
          {products.map((item) => (
            <ProductCard
              key={item._id}
              item={item}
              onAddToCart={addToCart}
              webapp={webapp}
              setShowLogin={setShowLogin}
              cartItems={cartItems}
              incrementQuantity={incrementQuantity}
              decreaseQuantity={decreaseQuantity}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              onQuickView={undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

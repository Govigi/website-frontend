"use client";

import { config } from "@/libs/utils/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useCart } from "../core/Cart/CartContext";
import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";

export default function ViewAll({ webapp }) {
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
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const backendURL = config.backend_url;

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendURL}/getAllProducts`);
      let fetched = res.data.products || [];

      console.log("Fetched products:", fetched);

      fetched = fetched.filter((item) => item.name || item.productName || item.title);

      if (searchQuery) {
        fetched = fetched.filter((item) => {
          const name = (item.name || item.productName || item.title || "").toLowerCase();
          return name.includes(searchQuery.toLowerCase());
        });
      }

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendURL}/getAllCategories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    <section className="px-4 md:px-10 max-w-[1220px] mx-auto items-center overflow-hidden">
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
        <div className="flex flex-row md:flex-row gap-4 border border-gray-100 h-[calc(100vh-140px)] pb-20 md:pb-0">
          {/* Categories Sidebar - Scrollable on mobile */}
          <div className="px-4 py-2 border-r border-gray-100 overflow-y-auto md:h-full">
            <div className="mb-6">
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <div className="w-18 rounded-2xl" key={cat._id}>
                    <img src={cat.categoryImage.url} alt={cat.categoryName} className="w-full object-cover rounded-lg h-18" />
                    <span className="text-xs text-gray-800 font-medium mt-1 block text-center break-words">
                      Fresh {cat.categoryName}
                    </span>
                  </div>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Products Grid - Scrollable */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 transition-all p-2 overflow-y-auto flex-1">
            {products.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onAddToCart={addToCart}
                webapp={webapp}
                cartItems={cartItems}
                incrementQuantity={incrementQuantity}
                decreaseQuantity={decreaseQuantity}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                onQuickView={undefined}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
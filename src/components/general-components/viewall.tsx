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

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim() || "";
  const initialCategory = searchParams.get("category")?.trim() || "";

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(initialCategory || ""); // Default to empty (All Products) or query param
  const [loading, setLoading] = useState(false);
  const backendURL = config.backend_url;

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

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
        fetched = fetched.filter((item) => {
          const categoryName =
            typeof item.category === "object" && item.category !== null
              ? (item.category.categoryName || "")
              : (typeof item.category === "string" ? item.category : "");
          const clean = (str: string) => str.toLowerCase().trim().replace(/s$/, "");
          return clean(categoryName).includes(clean(category)) || clean(category).includes(clean(categoryName));
        });
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
    <section className="min-h-0 h-full flex flex-col bg-white">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-20 md:w-24 lg:w-28 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="py-3 md:py-4 px-1 md:px-2 w-full">
            <button
              onClick={() => setCategory("")}
              className={`w-full mb-3 md:mb-4 flex flex-col items-center transition-all ${!category ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-md overflow-hidden mb-1.5 md:mb-2 border-2 transition-all flex items-center justify-center bg-gray-50 ${!category
                ? 'border-green-500 shadow-sm'
                : 'border-gray-200'
                }`}>
                <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className={`text-xs leading-tight text-center px-1 ${!category
                ? 'text-green-600 font-semibold'
                : 'text-gray-600'
                }`}>
                All
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategory(cat.categoryName)}
                className={`w-full mb-3 md:mb-4 flex flex-col items-center transition-all ${category === cat.categoryName ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-md overflow-hidden mb-1.5 md:mb-2 border-2 transition-all ${category === cat.categoryName
                  ? 'border-green-500 shadow-md'
                  : 'border-gray-200'
                  }`}>
                  <img
                    src={cat.categoryImage.url}
                    alt={cat.categoryName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-xs leading-tight text-center px-1 ${category === cat.categoryName
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-600'
                  }`}>
                  {cat.categoryName}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Products Area - independent scroll */}
        <div
          className="flex-1 bg-white overflow-y-auto"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-green-600 mb-3 md:mb-4"></div>
                <p className="text-sm md:text-base text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm md:text-base text-gray-500">
                  {searchQuery
                    ? `No products found for "${searchQuery}"`
                    : "No products available"}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 pb-15 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0">
                  {products.map((item, index) => {
                    const isFirstColumn = index % (typeof window !== 'undefined' ?
                      (window.innerWidth >= 1536 ? 6 :
                        window.innerWidth >= 1280 ? 5 :
                          window.innerWidth >= 1024 ? 4 :
                            window.innerWidth >= 768 ? 3 :
                              window.innerWidth >= 640 ? 3 : 2) : 2) === 0;
                    return (
                      <div key={item._id} className={isFirstColumn ? "" : "border-l border-gray-200"}>
                        <ProductCard
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../core/Cart/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { config } from "@/libs/utils/config";

export default function PriceList() {
  const { cartItems, addToCart, incrementQuantity, decreaseQuantity } =
    useCart();
  const [category, setCategory] = useState("Vegetable");
  const [products, setProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const backendURL = config.backend_url;

  const fetchProducts = async () => {
    localStorage.setItem("category", "Vegetable");
    try {
      const res = await axios.get(`${backendURL}/getAllProducts`);
      setProducts(res.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase().slice(0, -1)
    )
    .slice(0, 8);

  const chunkedProducts = [
    filteredProducts.slice(0, 4),
    filteredProducts.slice(4, 8),
  ];
  const currentProducts = chunkedProducts[slideIndex] || [];

  return (
    <section className="px-6 md:px-20 pb-10">
      {/* Category Tabs */}
      <h2 className="text-3xl font-bold text-center mb-6">Our Categories</h2>
      <div className="bg-green-50 p-4 rounded-xl flex justify-center space-x-6 mb-10">
        <button
          className={`flex flex-col items-center px-6 py-4 rounded-xl transition ${
            category === "Vegetable"
              ? "bg-white shadow border border-green-500"
              : ""
          }`}
          onClick={() => {
            setCategory("Vegetable");
            localStorage.setItem("category", "Vegetable");
            setSlideIndex(0);
          }}
        >
          <img src="/veg.png" className="w-12 h-12 mb-2" />
          <span className="font-medium">Vegetables</span>
        </button>
        <button
          className={`flex flex-col items-center px-6 py-4 rounded-xl transition ${
            category === "Fruits"
              ? "bg-white shadow border border-green-500"
              : ""
          }`}
          onClick={() => {
            setCategory("Fruits");
            localStorage.setItem("category", "Fruits");
            setSlideIndex(0);
          }}
        >
          <img src="/fru.png" className="w-12 h-12 mb-2" />
          <span className="font-medium">Fruits</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{category}</h2>
        {category === "Vegetable" ? (
          <Link
            href="/webapp"
            className="text-green-600 cursor-pointer font-medium"
          >
            View all
          </Link>
        ) : (
          <></>
        )}
      </div>

      {/* Product Grid or Empty Message */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
          <div className="mb-6">
            <div className="w-32 h-24 rounded-md flex items-center justify-center">
              <img src="/cancel-order.png" alt="logo" />
            </div>
          </div>

          <p className="text-center text-gray-700 text-lg mb-6">
            No fruits available at this time. We’ll restock soon!
          </p>

          {/* <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Notify Me
          </button> */}
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* Navigation Arrows */}
          {slideIndex > 0 && (
            <button
              onClick={() => setSlideIndex(slideIndex - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100"
            >
              <ChevronLeft />
            </button>
          )}
          {slideIndex < chunkedProducts.length - 1 && (
            <button
              onClick={() => setSlideIndex(slideIndex + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100"
            >
              <ChevronRight />
            </button>
          )}

          {/* Slide Container */}
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {chunkedProducts.map((group, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 grid-rows-2 sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 sm:gap-6 w-full shrink-0"
                >
                  {group.map((item) => (
                    <div key={item._id} className="p-3">
                      <ProductCard
                        item={item}
                        onAddToCart={addToCart}
                        cartItems={cartItems}
                        incrementQuantity={incrementQuantity}
                        decreaseQuantity={decreaseQuantity}
                        webapp={undefined}
                        onQuickView={undefined}
                        updateQuantity={undefined}
                        removeFromCart={undefined}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

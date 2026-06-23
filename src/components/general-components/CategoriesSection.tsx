"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "@/lib/utils/config";
import { useRouter } from "next/navigation";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const backendURL = config.backend_url;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendURL}/getAllCategories`);
        if (Array.isArray(res.data)) {
          const active = res.data.filter((c: any) => c.categoryStatus === "active");
          setCategories(active);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [backendURL]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-[#FCFDFE] py-12 font-outfit border-y border-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header section styled elegantly with Govigi green accents */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="h-[1px] bg-green-600/20 flex-1 max-w-[120px]" />
            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-green-600 text-center">
              Our Categories
            </h2>
            <div className="h-[1px] bg-green-600/20 flex-1 max-w-[120px]" />
          </div>
          <p className="text-2xl font-black text-gray-800 tracking-tight mt-2 text-center">
            Shop by Fresh Produce & Goods
          </p>
        </div>

        {/* Categories Grid - Responsive for all screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => router.push(`/webapp?category=${encodeURIComponent(cat.categoryName)}`)}
              className="group bg-white border border-gray-100 hover:border-green-600/30 rounded-[20px] p-5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-[0_12px_30px_rgba(22,163,74,0.06)] hover:-translate-y-1 h-36 cursor-pointer"
            >
              {/* Product Category Image Container */}
              <div className="w-16 h-16 mb-3 flex items-center justify-center bg-gray-50/50 rounded-2xl p-1.5 transition-transform duration-300 group-hover:scale-105">
                {cat.categoryImage?.url ? (
                  <img
                    src={cat.categoryImage.url}
                    alt={cat.categoryName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm">
                    {cat.categoryName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Category Title */}
              <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wide leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-green-600">
                {cat.categoryName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

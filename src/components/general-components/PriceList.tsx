"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { config } from "@/libs/utils/config";

export default function PriceList() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const backendURL = config.backend_url;

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendURL}/getAllCategories`);
      if (Array.isArray(res.data)) {
        const active = res.data.filter((c: any) => c.categoryStatus === "active");
        setCategories(active);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="px-6 md:px-20 pb-10">
      {/* Dynamic Category Tabs Grid enclosed in a light green background div */}
      <div className="bg-green-50 p-8 md:p-12 rounded-[32px] border border-green-100/50 font-outfit">
        <div className="flex flex-col items-center mb-8 relative">
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-green-600/20 flex-1" />
            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-green-600 text-center select-none">
              Our Categories
            </h2>
            <div className="h-[1px] bg-gradient-to-l from-transparent to-green-600/20 flex-1" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {categories.map((cat: any) => (
            <div
              key={cat._id}
              onClick={() => {
                router.push(`/webapp?category=${encodeURIComponent(cat.categoryName)}`);
              }}
              className="bg-white rounded-[20px] p-4 cursor-pointer transition-all flex flex-col items-center justify-center relative w-[160px] min-h-[176px]"
            >
              <div className="mb-3">
                {cat.categoryImage?.url ? (
                  <img
                    src={cat.categoryImage.url}
                    alt={cat.categoryName}
                    className="w-full h-[80px] object-contain md:h-[80px] md:p-0 md:overflow-hidden"
                  />
                ) : (
                  <div className="w-[80px] h-[80px] rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg">
                    {cat.categoryName.charAt(0)}
                  </div>
                )}
              </div>

              <span className="text-center text-[16px] font-[600] text-[#1C1C1C] line-clamp-2">
                {cat.categoryName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

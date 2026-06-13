"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function JoinSection() {
  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-outfit">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Left Card: Sellers / Partners */}
        <div className="relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200/90 border border-gray-300/80 rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-sm overflow-hidden min-h-[280px] group hover:shadow-md transition-all duration-300">
          {/* Badge */}
          <div className="absolute top-0 left-8 bg-black text-white text-[9px] font-extrabold uppercase tracking-widest px-4.5 py-2 rounded-b-xl font-sans">
            For Sellers
          </div>
          
          <div className="mt-6 space-y-2.5">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Sell to retailers & customers now
            </h3>
            <p className="text-xs sm:text-sm text-gray-550 font-semibold leading-relaxed">
              Join 50+ trusted partners and grow your brand with scale.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/partner-with-us" 
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-98 shadow-sm"
            >
              Register as a partner
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* Right Card: Customers */}
        <div className="relative bg-gradient-to-br from-[#2E7D32] to-[#1E5E22] text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-md overflow-hidden min-h-[280px] group hover:shadow-lg transition-all duration-300">
          {/* Badge */}
          <div className="absolute top-0 left-8 bg-black text-white text-[9px] font-extrabold uppercase tracking-widest px-4.5 py-2 rounded-b-xl font-sans">
            For Customers
          </div>
          
          <div className="mt-6 space-y-2.5">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Smarter sourcing, better serving
            </h3>
            <p className="text-xs sm:text-sm text-green-100 font-semibold leading-relaxed">
              Trusted for premium organic daily deliveries to your store or home.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              href="/webapp" 
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#2E7D32] text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-98 shadow-sm"
            >
              Signup now
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

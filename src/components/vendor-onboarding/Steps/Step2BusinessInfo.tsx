"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import FloatingInput from "@/components/UI/FloatingInput";

// Categories available for selection
const CATEGORIES = [
  "Grocery",
  "Electronics",
  "Fashion",
  "Pharmacy",
  "Beauty",
  "Home Decor"
];

export default function Step2BusinessInfo() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <h2 className="text-base font-semibold text-zinc-900">Business Profile</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Please provide your official commercial registration details below.</p>
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 pt-2">
        
        {/* Business Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Business Type *</label>
          <select
            {...register("businessType")}
            className={cn(
              "w-full px-3 py-2.5 bg-white border rounded-md text-sm font-normal text-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm",
              errors.businessType ? "border-red-300 focus:ring-red-500" : "border-zinc-300"
            )}
          >
            <option value="">Select business type</option>
            <option value="Retailer">Retailer</option>
            <option value="Distributor">Distributor</option>
            <option value="Manufacturer">Manufacturer</option>
          </select>
          {errors.businessType && <ErrorText message={errors.businessType.message as string} />}
        </div>

        {/* Legal Entity Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Legal Entity Type *</label>
          <select
            {...register("legalEntityType")}
            className={cn(
              "w-full px-3 py-2.5 bg-white border rounded-md text-sm font-normal text-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm",
              errors.legalEntityType ? "border-red-300 focus:ring-red-500" : "border-zinc-300"
            )}
          >
            <option value="">Select entity type</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Private Limited">Private Limited</option>
          </select>
          {errors.legalEntityType && <ErrorText message={errors.legalEntityType.message as string} />}
        </div>

        {/* Legal Business Name (Floating Input) */}
        <FloatingInput
          label="Legal Business Name *"
          error={errors.legalBusinessName?.message as string}
          {...register("legalBusinessName")}
        />

        {/* Brand / Store Name (Floating Input) */}
        <FloatingInput
          label="Brand / Store Name *"
          error={errors.businessName?.message as string}
          {...register("businessName")}
        />
      </div>

      {/* 3. Regulatory Disclaimer */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-medium text-zinc-900">Secure Processing</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
            Information provided is verified directly against regulatory records. We process all registration data in compliance with standard safety protocols.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p className="text-xs text-red-600 mt-1.5 font-normal ml-1">{message}</p>;
}

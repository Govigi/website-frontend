"use client";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { 
  BuildingStorefrontIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import FloatingInput from "@/components/UI/FloatingInput";
import FloatingSelect from "@/components/UI/FloationSelect";
import { config } from "@/lib/utils/config";
import axios from "axios";

interface CategoryItem {
  name: string;
  desc: string;
  image: string;
}

const FALLBACK_CATEGORIES: CategoryItem[] = [
  { name: "Grocery", desc: "Fresh produce, daily essentials, and packaged foods", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&q=80" },
  { name: "Electronics", desc: "Mobile phones, accessories, and home appliances", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&q=80" },
  { name: "Fashion", desc: "Clothing, footwear, watches, and accessories", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=150&q=80" },
  { name: "Pharmacy", desc: "OTC medicines, healthcare products, and wellness", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&q=80" },
  { name: "Beauty", desc: "Cosmetics, personal care, and grooming products", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&q=80" },
  { name: "Home Decor", desc: "Furniture, kitchenware, bedding, and home styling", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150&q=80" }
];

export default function Step2StoreSetup() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const businessCategory = watch("businessCategory");
  const supportedCategories = watch("supportedCategories") || [];
  const storeFiles = (watch("storeFiles") || []) as File[];
  const existingStoreImages = (watch("existingStoreImages") || []) as string[];

  const [storePreviews, setStorePreviews] = useState<{ src: string; isExisting: boolean; indexInOriginal: number }[]>([]);

  const existingSerialized = existingStoreImages.join(",");
  const filesSerialized = storeFiles.map(f => f ? `${f.name}-${f.size}-${f.lastModified}` : "").join(",");

  useEffect(() => {
    const previews = [
      ...existingStoreImages.map((url, idx) => ({ src: url, isExisting: true, indexInOriginal: idx })),
      ...storeFiles.map((file, idx) => {
        let src = "";
        try {
          src = URL.createObjectURL(file);
        } catch (e) {
          console.error(e);
        }
        return { src, isExisting: false, indexInOriginal: idx };
      })
    ];
    setStorePreviews(previews);

    return () => {
      previews.forEach(p => {
        if (!p.isExisting && p.src && p.src.startsWith("blob:")) {
          URL.revokeObjectURL(p.src);
        }
      });
    };
  }, [existingSerialized, filesSerialized]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${config.backend_url}/getAllCategories`);
        if (Array.isArray(res.data)) {
          const active = res.data.filter((c: any) => c.categoryStatus === "active");
          const formatted = active.map((c: any) => ({
            name: c.categoryName,
            desc: c.categoryDescription || `Products and items in ${c.categoryName}`,
            image: c.categoryImage?.url || ""
          }));

          if (!formatted.some((c: any) => c.name.toLowerCase() === "other")) {
            formatted.push({
              name: "Other",
              desc: "Can't find your category? Add custom one",
              image: ""
            });
          }
          setCategories(formatted);
        } else {
          const fallback = [...FALLBACK_CATEGORIES];
          if (!fallback.some(c => c.name === "Other")) {
            fallback.push({ name: "Other", desc: "Can't find your category? Add custom one", image: "" });
          }
          setCategories(fallback);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        const fallback = [...FALLBACK_CATEGORIES];
        if (!fallback.some(c => c.name === "Other")) {
          fallback.push({ name: "Other", desc: "Can't find your category? Add custom one", image: "" });
        }
        setCategories(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleToggleCategory = (name: string) => {
    let nextVal: string[] = [];
    if (supportedCategories.includes(name)) {
      nextVal = supportedCategories.filter((c: string) => c !== name);
      if (name === "Other") {
        setValue("customCategory", "", { shouldValidate: true });
      }
    } else {
      nextVal = [...supportedCategories, name];
    }
    setValue("supportedCategories", nextVal, { shouldValidate: true });
    // Keep businessCategory in sync with the first selected category
    setValue("businessCategory", nextVal[0] || "", { shouldValidate: true });
  };

  const handleStoreImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - (existingStoreImages.length + storeFiles.length);
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      const nextFiles = [...storeFiles, ...filesToUpload];
      setValue("storeFiles", nextFiles, { shouldValidate: true });
    }
  };

  const removeStoreImage = (isExisting: boolean, indexInOriginal: number) => {
    if (isExisting) {
      const nextUrls = existingStoreImages.filter((_, i) => i !== indexInOriginal);
      setValue("existingStoreImages", nextUrls);
    } else {
      const nextFiles = storeFiles.filter((_, i) => i !== indexInOriginal);
      setValue("storeFiles", nextFiles);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* SECTION 1: BUSINESS CATEGORY */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 1 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-5 h-5 text-green-600" />
            1. Store Classification
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Select the primary and supported categories that represent your digital storefront.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-500 mt-3 font-medium">Loading store categories...</p>
          </div>
        ) : (
          <div className="space-y-5">
  
            <div className="space-y-3 pt-2">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-zinc-700">Supported Categories *</label>
                <span className="text-[11px] text-zinc-550 font-normal mt-0.5">Select all secondary categories of items you sell. Select at least one.</span>
              </div>
  
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {categories.map((c) => {
                  const isSelected = supportedCategories.includes(c.name);
                  return (
                    <div
                      key={c.name}
                      onClick={() => handleToggleCategory(c.name)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-all duration-150 select-none",
                        isSelected 
                          ? "border-green-650 bg-green-50/30 text-green-900" 
                          : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                      )}
                    >
                      {/* Checkbox Element */}
                      <div className={cn(
                        "w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all duration-150",
                        isSelected 
                          ? "border-green-600 bg-green-600 text-white" 
                          : "border-zinc-300 bg-white"
                      )}>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="w-2.5 h-2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-semibold tracking-tight">
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              {errors.supportedCategories && (
                <p className="text-xs text-red-650 mt-2.5 font-semibold ml-1">{errors.supportedCategories.message as string}</p>
              )}

              {supportedCategories.includes("Other") && (
                <div className="pt-4 max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
                  <FloatingInput
                    label="Custom Category Name *"
                    error={errors.customCategory?.message as string}
                    {...register("customCategory", {
                      required: "Please specify your custom category"
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: TIMINGS */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 2 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-green-600" />
            2. Store Operational Hours
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Specify your daily opening and closing hours for orders and pickups.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Opening Time *</label>
            <input
              type="time"
              {...register("openTime")}
              className={cn(
                "w-full px-3.5 py-2.5 bg-white border rounded-md text-sm font-normal text-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm",
                errors.openTime ? "border-red-300 focus:ring-red-500" : "border-zinc-300"
              )}
            />
            {errors.openTime && (
              <p className="text-xs text-red-600 mt-1 font-semibold ml-1">{errors.openTime.message as string}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Closing Time *</label>
            <input
              type="time"
              {...register("closeTime")}
              className={cn(
                "w-full px-3.5 py-2.5 bg-white border rounded-md text-sm font-normal text-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 shadow-sm",
                errors.closeTime ? "border-red-300 focus:ring-red-500" : "border-zinc-300"
              )}
            />
            {errors.closeTime && (
              <p className="text-xs text-red-600 mt-1 font-semibold ml-1">{errors.closeTime.message as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: STORE IMAGES */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 3 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-green-600" />
            3. Store Gallery Photos
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Upload up to 5 photos showing your store storefront and interior.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {storePreviews.map((item, i) => (
              <div key={item.src} className="aspect-square border border-zinc-200 rounded-xl overflow-hidden relative group shadow-sm">
                <img src={item.src} alt={`Store Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeStoreImage(item.isExisting, item.indexInOriginal)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(existingStoreImages.length + storeFiles.length) < 5 && (
              <label className="aspect-square border-2 border-dashed border-zinc-200 hover:border-green-500/70 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-zinc-50/20 hover:bg-zinc-50/40 transition-all group">
                <DocumentArrowUpIcon className="w-7 h-7 text-zinc-400 group-hover:text-green-600 transition-colors mb-2" />
                <span className="text-[10px] font-bold text-zinc-600 text-center px-1">Upload Store Image</span>
                <span className="text-[9px] text-zinc-400 mt-1">{(existingStoreImages.length + storeFiles.length)}/5 uploaded</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleStoreImagesUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

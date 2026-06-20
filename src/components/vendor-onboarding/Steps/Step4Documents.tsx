"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheckIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";

export default function Step4Documents() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;

  const entityType = watch("legalEntityType") || "Private Limited Company";
  const businessCategory = watch("businessCategory") || "";

  const isFoodCategory = [
    "grocery", "restaurant", "dairy", "bakery", "food manufacturer", "beverages"
  ].includes(businessCategory.toLowerCase());

  const isPharmacyCategory = businessCategory.toLowerCase() === "pharmacy";

  const showGST = entityType !== "Individual";
  const showCIN = ["Private Limited Company", "Public Limited Company", "One Person Company (OPC)"].includes(entityType);
  const showLLPIN = entityType === "LLP";
  const showPAN = true;
  const showMSME = ["Sole Proprietorship", "Partnership Firm", "LLP", "Private Limited Company", "Public Limited Company"].includes(entityType);
  const showTrade = ["Sole Proprietorship", "Partnership Firm"].includes(entityType);
  const showRegCert = entityType === "Trust / NGO";
  const showFSSAI = isFoodCategory;
  const showDrug = isPharmacyCategory;

  const getVisibleCards = () => {
    const cards = [];

    if (showGST) {
      cards.push({
        id: "gstin",
        label: "GST Number",
        subText: "Optional",
        icon: "GST",
        color: "bg-emerald-500"
      });
    }

    if (showCIN) {
      cards.push({
        id: "cin",
        label: "CIN Number",
        subText: "Optional",
        icon: "CIN",
        color: "bg-blue-500"
      });
    }

    if (showLLPIN) {
      cards.push({
        id: "llpin",
        label: "LLPIN Number",
        subText: "Optional",
        icon: "LLP",
        color: "bg-indigo-500"
      });
    }

    if (showPAN) {
      cards.push({
        id: "panNumber",
        label: entityType === "SOLE_PROPRIETORSHIP" ? "Regular PAN" : "Business PAN",
        subText: "Required",
        icon: "PAN",
        color: "bg-slate-500"
      });
    }

    if (showRegCert) {
      cards.push({
        id: "regCertNumber",
        label: "Reg Certificate",
        subText: "Optional",
        icon: "REG",
        color: "bg-amber-500"
      });
    }

    if (showMSME) {
      cards.push({
        id: "udyamNumber",
        label: "MSME Number",
        subText: "Optional",
        icon: "MSME",
        color: "bg-cyan-500"
      });
    }

    if (showTrade) {
      cards.push({
        id: "tradeLicenseNumber",
        label: "Trade License",
        subText: "Optional",
        icon: "TRADE",
        color: "bg-orange-500"
      });
    }

    if (showFSSAI) {
      cards.push({
        id: "fssaiNumber",
        label: "FSSAI License",
        subText: "Optional",
        icon: "FSSAI",
        color: "bg-green-600"
      });
    }

    if (showDrug) {
      cards.push({
        id: "drugLicenseNumber",
        label: "Drug License",
        subText: "Optional",
        icon: "DRUG",
        color: "bg-red-500"
      });
    }

    return cards;
  };

  const cards = getVisibleCards();

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            1. Business Verification
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Provide compliance documents to help us verify your business.</p>
        </div>

        <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-950">Why we need this?</h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
              These documents help us ensure compliance with government regulations and build trust with customers.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs text-zinc-555">
            Business Structure
            <span className="block text-sm font-bold text-zinc-800 mt-0.5">
              Selected Legal Entity Type: <span className="text-green-700 font-extrabold">{entityType}</span>
            </span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {cards.map((card) => {
              const isFieldFilled = !!watch(card.id);
              return (
                <div 
                  key={card.id} 
                  className={cn(
                    "border rounded-xl p-3.5 bg-white flex items-center gap-3 transition-all relative overflow-hidden",
                    isFieldFilled ? "border-zinc-300" : "border-zinc-200"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-150 flex flex-col items-center justify-center font-extrabold text-[9px] text-zinc-555 shrink-0 select-none shadow-sm relative overflow-hidden">
                    <DocumentTextIcon className="w-4 h-4 text-zinc-400 mb-0.5" />
                    <span>{card.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 truncate leading-tight">{card.label}</p>
                    <p className="text-[9px] font-semibold mt-0.5 text-red-500">
                      {card.subText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-6">
          
          {showGST && (
            <div className="space-y-1.5 max-w-2xl">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                GST Number
              </label>
              <p className="text-[10px] text-zinc-400 font-normal">Enter 15-digit GST number registered under your business.</p>
              <input
                type="text"
                maxLength={15}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className={cn(
                  "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                  errors.gstin ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                )}
                {...register("gstin", {
                  onChange: (e) => setValue("gstin", e.target.value.toUpperCase())
                })}
              />
              {errors.gstin && (
                <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.gstin.message as string}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            
            {showCIN && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Company Corporate Identification Number (CIN)</label>
                <p className="text-[10px] text-zinc-400 font-normal">Enter 21-digit CIN number issued by MCA.</p>
                <input
                  type="text"
                  maxLength={21}
                  placeholder="e.g. U74999TG2024PTC123456"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.cin ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("cin", {
                    onChange: (e) => setValue("cin", e.target.value.toUpperCase())
                  })}
                />
                {errors.cin && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.cin.message as string}</p>
                )}
              </div>
            )}

            {showLLPIN && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">LLP Identification Number (LLPIN)</label>
                <p className="text-[10px] text-zinc-400 font-normal">Enter LLP identification number.</p>
                <input
                  type="text"
                  placeholder="e.g. AAB-1234"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.llpin ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("llpin", {
                    onChange: (e) => setValue("llpin", e.target.value.toUpperCase())
                  })}
                />
                {errors.llpin && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.llpin.message as string}</p>
                )}
              </div>
            )}

            {showPAN && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  {entityType === "SOLE_PROPRIETORSHIP" ? "Regular PAN Number *" : "Business PAN Number *"}
                </label>
                <p className="text-[10px] text-zinc-400 font-normal">
                  {entityType === "SOLE_PROPRIETORSHIP" ? "Enter 10-character Personal/Individual PAN number." : "Enter 10-character Business PAN number."}
                </p>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.panNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("panNumber", {
                    required: "PAN Number is required",
                    onChange: (e) => setValue("panNumber", e.target.value.toUpperCase())
                  })}
                />
                {errors.panNumber && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.panNumber.message as string}</p>
                )}
              </div>
            )}

            {showRegCert && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Registration Certificate Number</label>
                <p className="text-[10px] text-zinc-400 font-normal">Enter Registration Certificate number.</p>
                <input
                  type="text"
                  placeholder="e.g. REG/12345/ABC"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.regCertNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("regCertNumber", {
                    onChange: (e) => setValue("regCertNumber", e.target.value.toUpperCase())
                  })}
                />
                {errors.regCertNumber && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.regCertNumber.message as string}</p>
                )}
              </div>
            )}

            {showMSME && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Udyam / MSME Registration</label>
                <p className="text-[10px] text-zinc-400 font-normal">Enter MSME registration number.</p>
                <input
                  type="text"
                  placeholder="e.g. UDYAM-XX-00-0000000"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.udyamNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("udyamNumber", {
                    onChange: (e) => setValue("udyamNumber", e.target.value.toUpperCase())
                  })}
                />
                {errors.udyamNumber && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.udyamNumber.message as string}</p>
                )}
              </div>
            )}

            {showTrade && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Trade License Number</label>
                <p className="text-[10px] text-zinc-400 font-normal">Enter trade license number issued by local authority.</p>
                <input
                  type="text"
                  placeholder="e.g. TL/2024/12345"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.tradeLicenseNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("tradeLicenseNumber", {
                    onChange: (e) => setValue("tradeLicenseNumber", e.target.value.toUpperCase())
                  })}
                />
                {errors.tradeLicenseNumber && (
                  <p className="text-[10px] text-red-605 font-semibold mt-1 ml-1">{errors.tradeLicenseNumber.message as string}</p>
                )}
              </div>
            )}

            {showFSSAI && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">FSSAI License Number</label>
                <p className="text-[10px] text-zinc-400 font-normal">Only for businesses involved in food & beverages.</p>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 12821013000123"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.fssaiNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("fssaiNumber", {
                    onChange: (e) => setValue("fssaiNumber", e.target.value.replace(/\D/g, ""))
                  })}
                />
                {errors.fssaiNumber && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.fssaiNumber.message as string}</p>
                )}
              </div>
            )}

            {showDrug && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Drug License Number</label>
                <p className="text-[10px] text-zinc-400 font-normal">Only for pharmacies/medical retailers.</p>
                <input
                  type="text"
                  placeholder="e.g. DL-12345-abc"
                  className={cn(
                    "w-full h-11 rounded-lg border px-3.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all uppercase",
                    errors.drugLicenseNumber ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-zinc-300 focus:ring-green-600 focus:border-green-600"
                  )}
                  {...register("drugLicenseNumber", {
                    onChange: (e) => setValue("drugLicenseNumber", e.target.value.toUpperCase())
                  })}
                />
                {errors.drugLicenseNumber && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1 ml-1">{errors.drugLicenseNumber.message as string}</p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

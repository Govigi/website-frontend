"use client";
import React from "react";
import { useFormContext, get } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BuildingStorefrontIcon, 
  UserIcon, 
  MapPinIcon, 
  ClockIcon, 
  CreditCardIcon, 
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import { LEGAL_ENTITY_TYPES, BUSINESS_TYPES } from "@/lib/constants/vendor/onboarding.options";

export default function Step5Review() {
  const { register, watch, formState: { errors } } = useFormContext();
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;
  const resId = searchParams.get("resId");

  // Watch form values for read-only summary
  const businessType = watch("businessType");
  const legalEntityType = watch("legalEntityType");

  const entityTypeOption = LEGAL_ENTITY_TYPES.find(
    (opt) => opt.value === legalEntityType || opt.label === legalEntityType
  );
  const displayEntityType = entityTypeOption ? entityTypeOption.label : (legalEntityType || "").replace(/_/g, " ");

  const businessTypeOption = BUSINESS_TYPES.find(
    (opt) => opt.value === businessType || opt.label === businessType
  );
  const displayBusinessType = businessTypeOption ? businessTypeOption.label : (businessType || "").replace(/_/g, " ");
  const legalBusinessName = watch("legalBusinessName");
  const businessName = watch("businessName");
  const gstin = watch("gstin");
  const fssaiNumber = watch("fssaiNumber");
  
  const contactPerson = watch("contactPerson");
  const role = watch("role");
  const email = watch("email");
  const alternatePhone = watch("alternatePhone");
  const panNumber = watch("panNumber");

  const formattedAddress = watch("address.formattedAddress");
  
  const businessCategory = watch("businessCategory");
  const supportedCategories = watch("supportedCategories") || [];
  const openTime = watch("openTime");
  const closeTime = watch("closeTime");

  const bankName = watch("bankDetails.bankName");
  const accountNumber = watch("bankDetails.accountNumber");
  const accountName = watch("bankDetails.accountName");
  const ifscCode = watch("bankDetails.ifscCode");

  const logoFile = watch("logoFile") as File | null;
  const documentFile = watch("documentFile") as File | null;
  const storeFiles = (watch("storeFiles") || []) as File[];
  const profileImage = watch("profileImage");

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* 1. REVIEW DASHBOARD */}
      <div className={cn(
        "space-y-6",
        "lg:block",
        activeSubStep === 1 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-200 pb-4">
          <h2 className="text-base font-semibold text-zinc-900">Review Partner Profile</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Please review all submitted information before final registration authorization.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Card 1: Business Profile & Location */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BuildingStorefrontIcon className="w-4 h-4 text-green-600" />
                Business Profile & Location
              </h4>
              <Link 
                href={`/onboarding/step1?sub=1${resId ? `&resId=${resId}` : ""}`}
                className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                Edit
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block">Legal Entity Name</span>
                <span className="font-semibold text-zinc-800">{legalBusinessName || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Brand Store Name</span>
                <span className="font-semibold text-zinc-800">{businessName || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Entity Type</span>
                <span className="font-semibold text-zinc-800">{displayEntityType} ({displayBusinessType})</span>
              </div>
              <div>
                <span className="text-zinc-400 block">GSTIN / FSSAI</span>
                <span className="font-semibold text-zinc-800">
                  {gstin || "No GST"} {fssaiNumber ? `/ FSSAI: ${fssaiNumber}` : ""}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-50">
                <span className="text-zinc-400 block flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Store Pickup Address
                </span>
                <span className="font-semibold text-zinc-800 leading-normal block mt-1">{formattedAddress || "—"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Owner & Identity Details */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-green-600" />
                Owner & Identity Details
              </h4>
              <Link 
                href={`/onboarding/step1?sub=2${resId ? `&resId=${resId}` : ""}`}
                className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                Edit
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block">Full Name</span>
                <span className="font-semibold text-zinc-800">{contactPerson || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Role / Designation</span>
                <span className="font-semibold text-zinc-800">{role || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Email Address</span>
                <span className="font-semibold text-zinc-800 truncate block">{email || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Alternate Phone</span>
                <span className="font-semibold text-zinc-800">{alternatePhone || "—"}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-50">
                <span className="text-zinc-500 block">
                  {legalEntityType === "SOLE_PROPRIETORSHIP" || displayEntityType === "Sole Proprietorship" ? "Regular PAN Number" : "Business PAN Number"}
                </span>
                <span className="font-semibold text-zinc-800">{panNumber || "—"}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Storefront Classification */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-green-600" />
                Store Setup & Timings
              </h4>
              <Link 
                href={`/onboarding/step2${resId ? `?resId=${resId}` : ""}`}
                className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                Edit
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block">Primary Category</span>
                <span className="font-semibold text-zinc-800">{businessCategory || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Operating Hours</span>
                <span className="font-semibold text-zinc-800">{openTime} - {closeTime}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-50">
                <span className="text-zinc-500 block">Supported Categories</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {supportedCategories.map((c: string) => (
                    <span key={c} className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded text-[10px] font-semibold">
                      {c}
                    </span>
                  ))}
                  {supportedCategories.length === 0 && <span className="text-zinc-400 italic">None selected</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Settlements & Verification */}
          <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CreditCardIcon className="w-4 h-4 text-green-600" />
                Settlements & Documents
              </h4>
              <div className="flex items-center gap-1.5">
                <Link 
                  href={`/onboarding/step3${resId ? `?resId=${resId}` : ""}`}
                  className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
                >
                  Edit Bank
                </Link>
                <span className="text-zinc-200 text-xs">|</span>
                <Link 
                  href={`/onboarding/step4${resId ? `?resId=${resId}` : ""}`}
                  className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors"
                >
                  Edit Docs
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 block">Bank Name</span>
                <span className="font-semibold text-zinc-800">{bankName || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">IFSC Code</span>
                <span className="font-semibold text-zinc-800">{ifscCode || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block">Account Holder</span>
                <span className="font-semibold text-zinc-800">{accountName || "—"}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Account Number</span>
                <span className="font-semibold text-zinc-800">
                  {accountNumber ? `•••• ${accountNumber.slice(-4)}` : "—"}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-zinc-50">
                <span className="text-zinc-500 block flex items-center gap-1">
                  <DocumentArrowUpIcon className="w-3.5 h-3.5 text-zinc-400" />
                  Uploaded Media
                </span>
                <span className="font-semibold text-zinc-800 mt-1 block">
                  Logo: {logoFile ? "Yes" : "No"} | Liveness: {profileImage ? "Verified" : "No"} | Docs: {documentFile ? "Yes" : "No"} | Store Images: {storeFiles.length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. AGREEMENT ACCEPTANCE */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 2 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            Terms & Consent Agreements
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Please confirm the following declarations to submit your merchant application.</p>
        </div>

        <div className="space-y-4">
          
          {/* Agreement 1 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="agree1"
                type="checkbox"
                {...register("agree1")}
                className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
            </div>
            <div className="text-xs">
              <label htmlFor="agree1" className="font-semibold text-zinc-800 cursor-pointer">
                I hereby declare that all particulars given in this application are true and correct.
              </label>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                Providing false information may result in onboarding rejection or account suspension under Partner Terms of Use.
              </p>
              {errors.agree1 && (
                <p className="text-xs text-red-600 font-semibold mt-1">{errors.agree1.message as string}</p>
              )}
            </div>
          </div>

          {/* Agreement 2 */}
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="agree2"
                type="checkbox"
                {...register("agree2")}
                className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
            </div>
            <div className="text-xs">
              <label htmlFor="agree2" className="font-semibold text-zinc-800 cursor-pointer">
                I agree to the{" "}
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 underline font-bold"
                >
                  Govigi Merchant Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/vendor-privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 underline font-bold"
                >
                  Privacy Policy
                </a>.
              </label>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                By ticking, you authorize Govigi to run business identity queries, process payment settlements, and list items.
              </p>
              {errors.agree2 && (
                <p className="text-xs text-red-600 font-semibold mt-1">{errors.agree2.message as string}</p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

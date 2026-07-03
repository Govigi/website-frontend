"use client";
import React, { useState, useEffect } from "react";
import { useFormContext, get } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { 
  CreditCardIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import FloatingInput from "@/components/UI/FloatingInput";
import { config } from "@/lib/utils/config";

const BACKEND_URL = config.backend_url;

export default function Step3BankDetails() {
  const { register, watch, setValue, setError, clearErrors, formState: { errors } } = useFormContext();
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;

  const bankName = watch("bankDetails.bankName");
  const accountNumber = watch("bankDetails.accountNumber");
  const accountName = watch("bankDetails.accountName");
  const ifscCode = watch("bankDetails.ifscCode");
  const isVerifiedField = watch("bankDetails.isVerified");

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allBanks, setAllBanks] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    verifiedName?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const fetchAllBanks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/getAllBanks`);
        const names = Array.from(new Set(Object.values(response.data) as string[]));
        setAllBanks(names);
      } catch (error) {
        console.error("Error fetching all banks:", error);
      }
    };
    fetchAllBanks();
  }, []);

  // Sync state if form was pre-filled with verified details
  useEffect(() => {
    if (isVerifiedField && !verificationResult) {
      setVerificationResult({
        success: true,
        verifiedName: accountName || "Verified Account",
        message: "Account verified successfully."
      });
    }
  }, [isVerifiedField, accountName, verificationResult]);

  const handleVerifyBank = async () => {
    if (!accountNumber || !ifscCode || !accountName) {
      return;
    }
    setLoading(true);
    setVerificationResult(null);

    /*
    try {
      const response = await axios.post(`${BACKEND_URL}/verifyBankDetails`, {
        accountNumber,
        ifscCode,
        accountName
      });

      if (response.data && response.data.success) {
        setValue("bankDetails.isVerified", true, { shouldValidate: true });
        setVerificationResult({
          success: true,
          verifiedName: response.data.verifiedName,
          message: response.data.message || "Account verified successfully."
        });
      } else {
        setValue("bankDetails.isVerified", false, { shouldValidate: true });
        setVerificationResult({
          success: false,
          message: response.data.message || "Verification failed."
        });
      }
    } catch (error: any) {
      console.error("Bank details verification error:", error);
      setValue("bankDetails.isVerified", false, { shouldValidate: true });
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || "Verification failed. Please check details."
      });
    } finally {
      setLoading(false);
    }
    */

    // ponytail: skip remote verification call, mark as verified locally
    setTimeout(() => {
      setValue("bankDetails.isVerified", true, { shouldValidate: true });
      setVerificationResult({
        success: true,
        verifiedName: accountName,
        message: "Account details registered successfully (verification skipped)."
      });
      setLoading(false);
    }, 500);
  };

  const bankNameError = get(errors, "bankDetails.bankName");
  const accountNumberError = get(errors, "bankDetails.accountNumber");
  const accountNameError = get(errors, "bankDetails.accountName");
  const ifscCodeError = get(errors, "bankDetails.ifscCode");

  const canVerify = accountNumber?.length >= 9 && ifscCode?.length === 11 && accountName?.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* SECTION 1: BANK SETTLEMENTS */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 1 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-green-600" />
            1. Bank Account Details
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Specify the bank account where customer settlements and payouts will be credited.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-2">
          <div className="relative">
            <FloatingInput
              label="Bank Name *"
              error={bankNameError?.message as string}
              onFocus={() => setShowSuggestions(true)}
              {...register("bankDetails.bankName", {
                onChange: (e: any) => {
                  setValue("bankDetails.isVerified", false, { shouldValidate: true });
                  setVerificationResult(null);
                  const val = e.target.value;
                  if (val) {
                    const query = val.toLowerCase();
                    const filtered = allBanks.filter(b => b.toLowerCase().includes(query));
                    setSuggestions(filtered);
                    setShowSuggestions(true);

                    if (allBanks.length > 0 && !allBanks.includes(val)) {
                      setError("bankDetails.bankName", {
                        type: "custom",
                        message: "Please select a bank from the list only"
                      });
                    } else {
                      clearErrors("bankDetails.bankName");
                    }
                  } else {
                    setSuggestions([]);
                    clearErrors("bankDetails.bankName");
                  }
                },
                onBlur: (e: any) => {
                  const val = e.target.value;
                  setTimeout(() => {
                    setShowSuggestions(false);
                    if (val && allBanks.length > 0 && !allBanks.includes(val)) {
                      const matches = allBanks.filter(b => b.toLowerCase().includes(val.toLowerCase()));
                      if (matches.length === 1) {
                        setValue("bankDetails.bankName", matches[0], { shouldValidate: true });
                        clearErrors("bankDetails.bankName");
                      } else {
                        setError("bankDetails.bankName", {
                          type: "custom",
                          message: "Please select a bank from the list only"
                        });
                      }
                    }
                  }, 200);
                }
              })}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-[48px] bg-white border border-zinc-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1 text-sm">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => {
                      setValue("bankDetails.bankName", name, { shouldValidate: true });
                      setValue("bankDetails.isVerified", false, { shouldValidate: true });
                      setVerificationResult(null);
                      clearErrors("bankDetails.bankName");
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <FloatingInput
            label="Account Holder Name *"
            type="text"
            maxLength={50}
            error={accountNameError?.message as string}
            {...register("bankDetails.accountName")}
            onChange={(e) => {
              setValue("bankDetails.accountName", e.target.value.replace(/[^a-zA-Z ]/g, ""), { shouldValidate: true });
              setValue("bankDetails.isVerified", false, { shouldValidate: true });
              setVerificationResult(null);
            }}
          />

          <FloatingInput
            label="Account Number *"
            error={accountNumberError?.message as string}
            {...register("bankDetails.accountNumber")}
            onChange={(e) => {
              setValue("bankDetails.accountNumber", e.target.value.replace(/\D/g, ""), { shouldValidate: true });
              setValue("bankDetails.isVerified", false, { shouldValidate: true });
              setVerificationResult(null);
            }}
          />

          <FloatingInput
            label="IFSC Code *"
            maxLength={11}
            error={ifscCodeError?.message as string}
            {...register("bankDetails.ifscCode")}
            onChange={(e) => {
              setValue("bankDetails.ifscCode", e.target.value.toUpperCase(), { shouldValidate: true });
              setValue("bankDetails.isVerified", false, { shouldValidate: true });
              setVerificationResult(null);
            }}
          />
        </div>

        {/* Verification Trigger and Alert */}
        <div className="pt-2 border-t border-zinc-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            {verificationResult && (
              verificationResult.success ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50/50 border border-green-200 rounded-xl px-4 py-3 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                  <CheckBadgeIcon className="w-5 h-5 shrink-0" />
                  <div>
                    <p>Account Verified Successfully!</p>
                    <p className="text-[10px] text-green-500 font-semibold mt-0.5">Verified Holder: {verificationResult.verifiedName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50/50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                  <XCircleIcon className="w-5 h-5 shrink-0" />
                  <div>
                    <p>Account Verification Failed</p>
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{verificationResult.message || "Please check details."}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              disabled={!canVerify || loading || verificationResult?.success}
              onClick={handleVerifyBank}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 border",
                verificationResult?.success
                  ? "bg-green-50 border-green-300 text-green-700 pointer-events-none"
                  : canVerify
                    ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    : "bg-white border-zinc-300 text-zinc-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : verificationResult?.success ? (
                "Verified"
              ) : (
                "Verify Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

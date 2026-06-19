"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import { config } from "@/lib/utils/config";

const BACKEND_URL = config.backend_url;

interface Step1Props {
  onVerified: () => void;
}

export default function Step1Phone({ onVerified }: Step1Props) {
  const { register, watch, setValue } = useForm({
    defaultValues: {
      contactPhone: "",
    }
  });
  const phoneValue = watch("contactPhone");

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Timer logic for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!phoneValue || phoneValue.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/sendVendorOTP`, { contact: phoneValue });
      setOtpSent(true);
      setCountdown(30);
      toast.success(`OTP sent to +91 ${phoneValue}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/verifyVendorOTP`, { 
        contact: phoneValue, 
        otp 
      });
      
      const token = res.data.token;
      if (token) {
        localStorage.setItem("vendorToken", token);
      }
      
      toast.success("Phone verified successfully!");
      onVerified();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100 shadow-sm">
          <ShieldCheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900">Verify your mobile</h3>
        <p className="text-sm text-zinc-500 leading-normal">To start your partner registration, please authenticate your mobile number.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Phone Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
            Mobile Number
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-zinc-100">
              <span className="text-sm font-bold text-zinc-400">🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="00000 00000"
              disabled={otpSent}
              {...register("contactPhone")}
              onChange={(e) => setValue("contactPhone", e.target.value.replace(/\D/g, ""))}
              className={cn(
                "w-full pl-24 pr-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-base font-bold transition-all focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:bg-white focus:border-green-600",
                otpSent && "opacity-60 bg-zinc-100"
              )}
            />
            {!otpSent && (
              <button
                type="button"
                disabled={phoneValue?.length !== 10 || loading}
                onClick={sendOtp}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
              >
                {loading ? "..." : "Send OTP"}
              </button>
            )}
          </div>
        </div>

        {/* OTP Input Section */}
        {otpSent && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  Enter 4-digit OTP
                </label>
                <button 
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="text-[10px] font-bold text-green-600 hover:underline uppercase"
                >
                  Change Number
                </button>
              </div>
              
              <OTPBoxes value={otp} onChange={setOtp} />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="text-xs font-semibold text-zinc-400">
                {countdown > 0 ? (
                  <span>Resend in <span className="text-zinc-900 font-bold">00:{countdown < 10 ? `0${countdown}` : countdown}</span></span>
                ) : (
                  <button onClick={sendOtp} className="text-green-600 font-bold hover:underline">Resend OTP</button>
                )}
              </div>

              <button
                type="button"
                onClick={verifyOtp}
                disabled={otp.length < 4 || loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 
 * Modular OTP Input Component 
 */
function OTPBoxes({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const newVal = value.split("");
    newVal[index] = val.substring(val.length - 1);
    const finalVal = newVal.join("");
    onChange(finalVal);
    
    // Move to next box
    if (index < 3 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newVal = value.split("");
      // If box is empty, move to previous box
      if (!newVal[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      newVal[index] = "";
      onChange(newVal.join(""));
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-14 h-16 border-2 border-zinc-100 rounded-2xl text-center text-xl font-black text-zinc-900 bg-zinc-50 focus:bg-white focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm"
        />
      ))}
    </div>
  );
}

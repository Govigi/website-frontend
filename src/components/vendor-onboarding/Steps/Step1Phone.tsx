"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import { config } from "@/lib/utils/config";
import { Modal } from "@/components/UI/Modal";
import { AlertTriangleIcon } from "lucide-react";

const BACKEND_URL = config.backend_url;

interface Step1Props {
  onVerified: () => void;
  isModal?: boolean;
}

export default function Step1Phone({ onVerified, isModal = false }: Step1Props) {
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

  if (isModal) {
    return (
      <Modal open={true} onOpenChange={() => {}}>
        <Modal.Content size="md" closeOnOverlay={false} className="rounded-md border border-zinc-100 bg-white p-0 overflow-hidden font-outfit shadow-2xl">
          <Modal.Header onClose={() => { window.location.href = "/"; }}>
            <Modal.Title className="text-2xl font-normal text-zinc-800 tracking-tight">
              {otpSent ? "Verify OTP" : "Login"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="px-6 pt-4 pb-6 space-y-4">
            {!otpSent ? (
              <div className="space-y-4">
                {/* Phone Input Box matching screenshot */}
                <div className="flex items-center border border-zinc-200 rounded-md px-3.5 py-3 bg-white focus-within:border-zinc-400 transition-colors">
                  <div className="flex items-center gap-1.5 pr-3 border-r border-zinc-200 select-none">
                    <span className="text-lg leading-none">🇮🇳</span>
                    <span className="text-sm font-medium text-zinc-700">+91</span>
                    {/* Small Chevron Down */}
                    <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Phone"
                    {...register("contactPhone")}
                    onChange={(e) => setValue("contactPhone", e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-3.5 bg-transparent text-base font-normal text-zinc-850 placeholder-zinc-300 focus:outline-none"
                  />
                </div>

                {/* Action Button matching screenshot */}
                <button
                  type="button"
                  disabled={phoneValue?.length !== 10 || loading}
                  onClick={sendOtp}
                  className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-base font-medium py-3 rounded-md transition-all active:scale-[0.99] flex items-center justify-center h-12 shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Send One Time Password"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-zinc-550">
                  We sent a 4-digit code to <span className="font-semibold text-zinc-700">+91 {phoneValue}</span>.
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="text-green-700 hover:underline font-semibold ml-1.5"
                  >
                    Change
                  </button>
                </p>

                <OTPBoxes value={otp} onChange={setOtp} />

                <div className="flex flex-col gap-4 pt-1">
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length < 4 || loading}
                    className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-base font-medium py-3 rounded-md transition-all active:scale-[0.99] flex items-center justify-center h-12 shadow-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>

                  <div className="text-center text-xs font-semibold text-zinc-400">
                    {countdown > 0 ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <span className="text-black">Not Received OTP?</span>
                        <span className={`text-black font-bold ${countdown === 0 ? "text-green-500" : "text-zinc-500"}`}>Resend in 00:{countdown < 10 ? `0${countdown}` : countdown}</span>
                      </span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={sendOtp} 
                        className="text-green-700 font-bold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-outfit">
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
                "w-full pl-24 pr-32 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-base font-bold transition-all focus:outline-none focus:ring-4 focus:ring-green-500/5 focus:bg-white focus:border-green-600",
                otpSent && "opacity-60 bg-zinc-100"
              )}
            />
            {!otpSent && (
              <button
                type="button"
                disabled={phoneValue?.length !== 10 || loading}
                onClick={sendOtp}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm min-w-[90px] h-10 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Modal for OTP Verification */}
      <Modal open={otpSent} onOpenChange={(val) => { if (!loading) setOtpSent(val); }}>
        <Modal.Content className="max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 bg-white p-0 font-outfit">
          <Modal.Header 
            onClose={() => { if (!loading) setOtpSent(false); }} 
            className="border-b border-zinc-50 p-6 flex justify-between items-center"
          >
            <Modal.Title className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              Verify Mobile Number
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs text-zinc-500 leading-relaxed">
                We have sent a 4-digit One-Time Password to
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-zinc-800">+91 {phoneValue}</span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="text-xs font-bold text-green-600 hover:underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <OTPBoxes value={otp} onChange={setOtp} />

              <div className="flex flex-col gap-4 pt-2">
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otp.length < 4 || loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-150 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center h-12"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>

                <div className="text-center text-xs font-semibold text-zinc-400">
                  {countdown > 0 ? (
                    <span>Resend OTP in <span className="text-zinc-855 font-bold">00:{countdown < 10 ? `0${countdown}` : countdown}</span></span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={sendOtp} 
                      className="text-green-600 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
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
    <div className="flex gap-4 justify-start">
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
          className="w-14 h-16 border-1 border-zinc-300 rounded-md text-center text-xl font-black text-zinc-900 bg-zinc-50 focus:bg-white focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
        />
      ))}
    </div>
  );
}

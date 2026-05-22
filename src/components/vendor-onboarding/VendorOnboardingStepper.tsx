"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CheckIcon, ChevronRightIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import MapPicker from "./MapPicker";
import { useSearchParams } from "next/navigation";

import { config } from "../../libs/utils/config";
const BACKEND_URL = config.backend_url;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const STEPS = [
    { id: 1, label: "Phone Verification" },
    { id: 2, label: "Business Info" },
    { id: 3, label: "Owner Details" },
    { id: 4, label: "Bank Details" },
];

type AddressComponents = {
    houseNumber: string; street: string; area: string;
    city: string; state: string; postalCode: string; country: string;
};

type Form = {
    businessName: string;
    contactPerson: string;
    email: string;
    whatsappUpdates: boolean;
    address: { formattedAddress: string; components: AddressComponents; location: { type: string; coordinates: number[] } };
    bankDetails: { accountName: string; accountNumber: string; bankName: string; ifscCode: string };
    supportedCategories: string[];
    customCategory?: string;
};

const initialForm: Form = {
    businessName: "",
    contactPerson: "",
    email: "",
    whatsappUpdates: true,
    address: {
        formattedAddress: "",
        components: { houseNumber: "", street: "", area: "", city: "", state: "", postalCode: "", country: "India" },
        location: { type: "Point", coordinates: [0, 0] },
    },
    bankDetails: { accountName: "", accountNumber: "", bankName: "", ifscCode: "" },
    supportedCategories: [],
    customCategory: "",
};

function StepSidebar({ step }: { step: number }) {
    return (
        <div className="w-64 shrink-0 hidden lg:block sticky top-24">
            <div className="pr-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 font-inter">Setup Progress</p>
                <div className="relative">
                    <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-gray-200 z-0" />
                    <ul className="space-y-6 relative z-10">
                        {STEPS.map((s) => {
                            const done = step > s.id;
                            const active = step === s.id;
                            return (
                                <li key={s.id} className="flex items-start gap-4">
                                    <span className={`w-6 h-6 rounded-none flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${done ? "bg-[#10b981] text-white" :
                                        active ? "bg-black text-white" :
                                            "bg-white border border-gray-200 text-gray-400"
                                        }`}>
                                        {done ? <CheckIcon className="w-3 h-3" strokeWidth={3} /> : s.id}
                                    </span>
                                    <span className={`text-[11px] uppercase tracking-wider font-bold mt-1 transition-colors duration-300 font-inter ${active ? "text-black" : done ? "text-gray-700" : "text-gray-400"}`}>
                                        {s.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
    return (
        <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                className={`block w-full border-b border-gray-300 bg-transparent py-2.5 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-inter ${props.disabled ? "text-gray-400 cursor-not-allowed" : "text-black font-semibold"}`}
            />
        </div>
    );
}

function FormActions({ onBack, onNext, nextLabel = "Next", nextDisabled = false, loading = false }: {
    onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; loading?: boolean;
}) {
    return (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-8 mt-8 border-t border-gray-100 gap-4">
            {onBack ? (
                <button 
                    onClick={onBack} 
                    type="button"
                    className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black border border-gray-200 hover:border-black bg-white px-6 py-3 transition-all rounded-none"
                >
                    Back
                </button>
            ) : <div className="hidden sm:block" />}
            <button
                onClick={onNext}
                type="button"
                disabled={nextDisabled || loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-[#10b981] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3.5 transition-all rounded-none"
            >
                {loading ? "Please wait..." : nextLabel}
            </button>
        </div>
    );
}

function OTPInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) return;
        
        const newVal = value.split("");
        newVal[index] = val.substring(val.length - 1);
        const finalVal = newVal.join("").substring(0, 4);
        onChange(finalVal);

        if (index < 3 && val) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newVal = value.split("");
            if (newVal[index]) {
                newVal[index] = "";
                onChange(newVal.join(""));
            } else if (index > 0) {
                newVal[index - 1] = "";
                onChange(newVal.join(""));
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").substring(0, 4);
        onChange(pasted);
        if (pasted.length === 4) {
            inputRefs.current[3]?.focus();
            inputRefs.current[3]?.blur();
        }
    };

    return (
        <div className="flex gap-3 sm:gap-4 justify-start mt-2">
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
                    onChange={e => handleChange(e, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    className="w-12 h-14 border border-gray-300 rounded-none text-center text-xl font-bold text-black bg-white focus:outline-none focus:border-black transition-all"
                />
            ))}
        </div>
    );
}

export default function VendorOnboardingStepper() {
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [contact, setContact] = useState("");
    const [otp, setOtp] = useState("");
    const [token, setToken] = useState("");
    const [form, setForm] = useState<Form>(initialForm);
    const [closeFailed, setCloseFailed] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/getAllCategories`);
                if (Array.isArray(res.data)) {
                    const activeNames = res.data
                        .filter((c: any) => c.categoryStatus === "active")
                        .map((c: any) => c.categoryName);
                    setCategories(activeNames);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategoriesList();
    }, []);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpenDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        if (urlToken) {
            setToken(urlToken);
            setOtpVerified(true);
            setStep(2);
            
            try {
                const parts = urlToken.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
                    if (payload && payload.contact) {
                        setContact(payload.contact);
                    }
                }
            } catch (e) {
                console.error("Failed to decode token:", e);
            }
        }
    }, [searchParams]);

    const updateAddress = (key: keyof AddressComponents, val: string) =>
        setForm(p => ({ ...p, address: { ...p.address, components: { ...p.address.components, [key]: val } } }));

    const updateBank = (key: keyof Form["bankDetails"], val: string) =>
        setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, [key]: val } }));

    const sendOtp = async () => {
        if (contact.length < 10) { toast.error("Enter a valid 10-digit mobile number."); return; }
        setLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/sendVendorOTP`, { contact });
            setOtpSent(true);
            toast.success("OTP sent to +91 " + contact);
        } catch (e: any) { toast.error(e.response?.data?.message || "Failed to send OTP."); }
        finally { setLoading(false); }
    };

    const verifyOtp = async () => {
        if (otp.length < 4) { toast.error("Enter the 4-digit OTP."); return; }
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/verifyVendorOTP`, { contact, otp });
            if (res.data.needRegistration || res.data.isNew) {
                setToken(res.data.token);
                setOtpVerified(true);
                setStep(2);
                toast.success("Phone verified!");
            } else {
                setSubmitted(true);
            }
        } catch (e: any) { toast.error(e.response?.data?.message || "Invalid OTP."); }
        finally { setLoading(false); }
    };

    const submitForm = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("token", token);
            formData.append("businessName", form.businessName);
            formData.append("contactPerson", form.contactPerson);
            formData.append("email", form.email);
            formData.append("whatsappUpdates", String(form.whatsappUpdates));
            formData.append("address", JSON.stringify(form.address));
            formData.append("bankDetails", JSON.stringify(form.bankDetails));
            
            let finalCategories = [...form.supportedCategories];
            if (form.supportedCategories.includes("other") && form.customCategory?.trim()) {
                finalCategories = finalCategories.filter(c => c !== "other");
                finalCategories.push(form.customCategory.trim());
            } else {
                finalCategories = finalCategories.filter(c => c !== "other");
            }
            formData.append("supportedCategories", JSON.stringify(finalCategories));

            if (imageFile) {
                formData.append("image", imageFile);
            }
            await axios.post(`${BACKEND_URL}/onboardVendor`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setSubmitted(true);
        } catch (e: any) { 
            toast.error(e.response?.data?.message || "Submission failed."); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleMapConfirm = (data: any) => {
        setForm(p => ({
            ...p,
            address: {
                formattedAddress: data.formattedAddress,
                components: { ...p.address.components, ...data.components },
                location: data.location,
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Mobile step indicator */}
            <div className="lg:hidden border-b border-gray-100 bg-white px-6 py-4 sticky top-16 z-30 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    {STEPS.map((s) => (
                        <div key={s.id} className={`h-1 flex-1 transition-colors ${step >= s.id ? "bg-black" : "bg-gray-100"}`} />
                    ))}
                </div>
                <p className="text-[13px] text-gray-500 font-medium tracking-tight">Step {step} of {STEPS.length} — <span className="text-gray-900 font-bold">{STEPS[step - 1]?.label}</span></p>
            </div>

            <div className="flex-1 p-4 sm:p-8 lg:p-12">
                <div className="max-w-5xl mx-auto flex lg:gap-12 items-start">

                    <StepSidebar step={step} />

                    {/* Main Form Card */}
                    <div className="flex-1 w-full bg-white border border-gray-200 rounded-none p-6 sm:p-10 shadow-sm">

                        {/* Step 1 — Phone Verification */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-1 border-l-2 border-black pl-3 font-inter">Verify your phone</h2>
                                <p className="text-[10px] text-gray-400 mb-8 font-inter uppercase font-semibold">We'll send a one-time password to confirm your identity.</p>

                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">Mobile Number <span className="text-red-500">*</span></label>
                                        <div className="flex border-b border-gray-300 py-2.5 focus-within:border-black transition-colors bg-transparent">
                                            <span className="text-sm font-bold text-gray-500 pr-2 self-center">🇮🇳 +91</span>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                placeholder="10-digit mobile number"
                                                value={contact}
                                                disabled={otpSent}
                                                onChange={e => setContact(e.target.value.replace(/\D/g, ""))}
                                                className="flex-1 text-sm font-semibold text-black bg-transparent focus:outline-none placeholder-gray-300 disabled:text-gray-400"
                                            />
                                        </div>
                                        {otpSent && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setOtpSent(false); setOtp(""); }} 
                                                className="text-[9px] uppercase tracking-wider text-[#10b981] font-bold mt-2 hover:underline"
                                            >
                                                Change number
                                            </button>
                                        )}
                                    </div>

                                    {!otpSent && (
                                        <button
                                            type="button"
                                            onClick={sendOtp}
                                            disabled={loading || contact.length < 10}
                                            className="w-full bg-black hover:bg-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest py-4 transition-all rounded-none"
                                        >
                                            {loading ? "Sending OTP..." : "Send OTP"}
                                        </button>
                                    )}

                                    {otpSent && (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">Enter OTP <span className="text-red-500">*</span></label>
                                                <OTPInput value={otp} onChange={setOtp} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={verifyOtp}
                                                disabled={loading || otp.length < 4}
                                                className="w-full bg-black hover:bg-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest py-4 transition-all rounded-none flex items-center justify-center gap-2"
                                            >
                                                {loading ? "Verifying..." : "Verify & Continue"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Business Info */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-1 border-l-2 border-black pl-3 font-inter">Business information</h2>
                                <p className="text-[10px] text-gray-400 mb-8 font-inter uppercase font-semibold">Let's set up your shop's identity and location.</p>

                                <div className="space-y-6 max-w-2xl">
                                    <Input
                                        label="Business / Shop Name"
                                        required
                                        placeholder="e.g. Govigi Fresh Mart"
                                        value={form.businessName}
                                        onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                                    />

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">
                                            Shop Location <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            onClick={() => setShowMap(true)}
                                            className="flex items-center justify-between border-b border-gray-300 py-3 cursor-pointer hover:border-black transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPinIcon className={`w-5 h-5 shrink-0 ${form.address.formattedAddress ? "text-black" : "text-gray-400"}`} />
                                                <span className={`text-xs ${form.address.formattedAddress ? "text-black font-bold uppercase font-inter" : "text-gray-300"}`}>
                                                    {form.address.formattedAddress || "Tap to mark your shop location on map"}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-black border border-black bg-white px-3 py-1.5 rounded-none shadow-sm shrink-0">
                                                {form.address.formattedAddress ? "Change" : "Select"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {([
                                            ["houseNumber", "Building / House No.", "e.g. 4-1-88"],
                                            ["street", "Street / Road", "e.g. MG Road"],
                                            ["area", "Area / Locality", "e.g. Banjara Hills"],
                                            ["city", "City", "e.g. Hyderabad"],
                                            ["state", "State", "e.g. Telangana"],
                                            ["postalCode", "PIN Code", "e.g. 500034"],
                                        ] as const).map(([key, label, placeholder]) => (
                                            <Input
                                                key={key}
                                                label={label}
                                                placeholder={placeholder}
                                                value={form.address.components[key as keyof AddressComponents]}
                                                onChange={e => updateAddress(key as keyof AddressComponents, e.target.value)}
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 relative">
                                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-black pl-3 text-gray-800">
                                            02. Capability
                                        </h2>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                            <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-2 font-bold font-inter">Supported Categories <span className="text-red-500">*</span></label>
                                            
                                            {/* Premium Custom Dropdown Select */}
                                            <div className="relative" ref={dropdownRef}>
                                                <div 
                                                    onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                                                    className="flex items-center justify-between border-b border-gray-300 py-3 cursor-pointer hover:border-black transition-colors"
                                                >
                                                    <span className="text-xs font-bold uppercase font-inter text-black">
                                                        {form.supportedCategories.length > 0 
                                                            ? form.supportedCategories.map(c => c === "other" ? (form.customCategory || "Other") : c).join(", ")
                                                            : "Select Categories..."}
                                                    </span>
                                                    <span className="text-xs text-gray-400">▼</span>
                                                </div>

                                                {isOpenDropdown && (
                                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl max-h-60 overflow-y-auto z-20">
                                                        {categories.map((cat) => {
                                                            const isSelected = form.supportedCategories.includes(cat);
                                                            return (
                                                                <div 
                                                                    key={cat}
                                                                    onClick={() => {
                                                                        const current = form.supportedCategories;
                                                                        const updated = current.includes(cat)
                                                                            ? current.filter(c => c !== cat)
                                                                            : [...current, cat];
                                                                        setForm(p => ({ ...p, supportedCategories: updated }));
                                                                    }}
                                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors"
                                                                >
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        readOnly
                                                                        className="w-4 h-4 accent-black rounded-none border-gray-300 focus:ring-black"
                                                                    />
                                                                    <span className="text-xs uppercase font-bold text-black font-inter">{cat}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        <div 
                                                            onClick={() => {
                                                                const current = form.supportedCategories;
                                                                const updated = current.includes("other")
                                                                    ? current.filter(c => c !== "other")
                                                                    : [...current, "other"];
                                                                setForm(p => ({ ...p, supportedCategories: updated }));
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                        >
                                                            <input 
                                                                type="checkbox"
                                                                checked={form.supportedCategories.includes("other")}
                                                                readOnly
                                                                className="w-4 h-4 accent-black rounded-none border-gray-300 focus:ring-black"
                                                            />
                                                            <span className="text-xs uppercase font-bold text-black font-inter">Other (Specify...)</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {form.supportedCategories.includes("other") && (
                                                <div className="mt-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-bold">Custom Category Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Specify custom product category..."
                                                        value={form.customCategory || ""}
                                                        onChange={e => setForm(p => ({ ...p, customCategory: e.target.value }))}
                                                        className="block w-full border-b border-gray-300 bg-transparent py-2 text-xs focus:border-black focus:ring-0 focus:outline-none transition-colors font-inter text-black uppercase font-bold"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <FormActions
                                    onBack={() => setStep(1)}
                                    onNext={() => setStep(3)}
                                    nextDisabled={
                                        !form.businessName || 
                                        !form.address.formattedAddress || 
                                        form.supportedCategories.length === 0 || 
                                        (form.supportedCategories.includes("other") && !form.customCategory?.trim())
                                    }
                                />
                            </div>
                        )}

                        {/* Step 3 — Owner Details */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-1 border-l-2 border-black pl-3 font-inter">Owner details</h2>
                                <p className="text-[10px] text-gray-400 mb-8 font-inter uppercase font-semibold">Contact details for business communications.</p>

                                <div className="space-y-6 max-w-lg">
                                    <Input
                                        label="Full Name"
                                        required
                                        placeholder="Owner's full name"
                                        value={form.contactPerson}
                                        onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                                    />
                                    <Input
                                        label="Email Address"
                                        required
                                        type="email"
                                        placeholder="yourname@example.com"
                                        value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    />
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">Mobile Number</label>
                                        <div className="flex items-center justify-between border-b border-gray-300 py-2.5">
                                            <span className="text-xs text-gray-500 font-semibold">🇮🇳 +91 {contact}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#10b981] border border-[#10b981] bg-white px-2.5 py-1">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold font-inter">
                                            Store Owner Photo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-none bg-gray-50/50 shadow-sm">
                                            <div className="relative w-20 h-20 rounded-none overflow-hidden border border-gray-200 bg-white flex items-center justify-center shrink-0">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Owner Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="cursor-pointer bg-black hover:bg-[#10b981] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 transition-all rounded-none">
                                                        Upload Photo
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setImageFile(file);
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setImagePreview(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {imagePreview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                            className="border border-red-200 text-red-500 hover:bg-red-50 text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-none transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">JPEG, PNG or WEBP. Max size 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-4 cursor-pointer mt-4 p-4 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={form.whatsappUpdates}
                                            onChange={e => setForm(p => ({ ...p, whatsappUpdates: e.target.checked }))}
                                            className="mt-0.5 w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black cursor-pointer"
                                        />
                                        <span className="text-[12px] text-gray-600 font-medium leading-snug">I want to receive important business updates and order alerts on WhatsApp.</span>
                                    </label>
                                </div>

                                <FormActions
                                    onBack={() => setStep(2)}
                                    onNext={() => setStep(4)}
                                    nextDisabled={!form.contactPerson || !form.email || !imageFile}
                                />
                            </div>
                        )}

                        {/* Step 4 — Bank Details */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-1 border-l-2 border-black pl-3 font-inter">Bank information</h2>
                                <p className="text-[10px] text-gray-400 mb-8 font-inter uppercase font-semibold">Required for receiving payouts securely from Govigi.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                                    {([
                                        ["bankName", "Bank Name", "e.g. HDFC Bank"],
                                        ["accountNumber", "Account Number", "Your account number"],
                                        ["accountName", "Account Holder Name", "As per bank records"],
                                        ["ifscCode", "IFSC Code", "e.g. HDFC0001234"],
                                    ] as const).map(([key, label, placeholder]) => (
                                        <Input
                                            key={key}
                                            label={label}
                                            placeholder={placeholder}
                                            value={form.bankDetails[key as keyof Form["bankDetails"]]}
                                            onChange={e => updateBank(key as keyof Form["bankDetails"], e.target.value)}
                                        />
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400 mt-4">🔒 Bank details are encrypted and stored securely.</p>

                                <FormActions
                                    onBack={() => setStep(3)}
                                    onNext={submitForm}
                                    nextLabel="Submit Registration"
                                    loading={loading}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MapPicker
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                onConfirm={handleMapConfirm}
                apiKey={GOOGLE_MAPS_API_KEY}
                initialLocation={
                    form.address.location?.coordinates[1] && form.address.location?.coordinates[0]
                        ? { lat: form.address.location.coordinates[1], lng: form.address.location.coordinates[0] }
                        : undefined
                }
                initialAddress={form.address.formattedAddress || undefined}
            />

            {/* Success Modal */}
            {submitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-200 shadow-2xl p-8 sm:p-12 text-center max-w-md w-full rounded-none animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-[#10b981] flex items-center justify-center mx-auto mb-6 shadow-sm rounded-none">
                            <CheckIcon className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-3 font-inter">Registration Complete!</h2>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed font-inter">
                            <strong className="text-black font-extrabold">{form.businessName}</strong> has been submitted successfully.
                        </p>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed font-inter">
                            We will contact you on <strong className="text-black font-extrabold">+91 {contact}</strong> to verify your account shortly.
                        </p>

                        {closeFailed ? (
                            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-none px-4 py-3 font-inter uppercase font-semibold">
                                You can now <strong className="text-black font-extrabold">close this tab</strong> manually.
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    window.close();
                                    setTimeout(() => setCloseFailed(true), 400);
                                }}
                                className="w-full py-3.5 bg-black hover:bg-[#10b981] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-none"
                            >
                                Close Tab
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Header() {
    return (
        <header className="bg-white border-b border-gray-200 px-5 sm:px-10 h-16 flex items-center justify-between sticky top-0 z-40">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/LOGO-png 3.svg" alt="Govigi" width={80} height={32} priority />
                <span className="text-xs text-gray-400 border-l border-gray-200 pl-2 font-medium">Partner</span>
            </Link>
        </header>
    );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
    CheckIcon, 
    ChevronRightIcon, 
    MapPinIcon, 
    BuildingStorefrontIcon, 
    QueueListIcon, 
    IdentificationIcon, 
    DocumentCheckIcon,
    ArrowUpTrayIcon,
    TrashIcon,
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    UserIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon,
    PhotoIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import MapPicker from "./MapPicker";
import { useSearchParams } from "next/navigation";

import { config } from "../../libs/utils/config";
const BACKEND_URL = config.backend_url;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const STEPS = [
    { 
        id: 1, 
        label: "Login & Verification", 
        subtext: "Phone verified",
        icon: ShieldCheckIcon 
    },
    { 
        id: 2, 
        label: "Business Information", 
        subtext: "Tell us about your business",
        icon: BuildingStorefrontIcon 
    },
    { 
        id: 3, 
        label: "Owner Details", 
        subtext: "Add owner / representative details",
        icon: UserIcon 
    },
    { 
        id: 4, 
        label: "Business Location", 
        subtext: "Add your shop location",
        icon: MapPinIcon 
    },
    { 
        id: 5, 
        label: "Business Verification", 
        subtext: "Add compliance details",
        icon: IdentificationIcon 
    },
    { 
        id: 6, 
        label: "Store Setup", 
        subtext: "Add store images and categories",
        icon: PhotoIcon 
    },
    { 
        id: 7, 
        label: "Bank Details", 
        subtext: "Add bank account for payouts",
        icon: CreditCardIcon 
    },
    { 
        id: 8, 
        label: "Review & Agreement", 
        subtext: "Review all details & agree terms",
        icon: DocumentCheckIcon 
    },
];

type AddressComponents = {
    houseNumber: string; street: string; area: string;
    city: string; state: string; postalCode: string; country: string;
};

type Form = {
    businessType: string;
    legalEntityType: string;
    legalBusinessName: string;
    businessName: string; // Brand / Store Name
    businessCategory: string;
    contactPerson: string;
    email: string;
    whatsappUpdates: boolean;
    address: { formattedAddress: string; components: AddressComponents; location: { type: string; coordinates: number[] } };
    bankDetails: { accountName: string; accountNumber: string; bankName: string; ifscCode: string };
    supportedCategories: string[];
    customCategory?: string;
    gstin?: string;
    panNumber?: string;
    fssaiNumber?: string;
};

const initialForm: Form = {
    businessType: "",
    legalEntityType: "",
    legalBusinessName: "",
    businessName: "",
    businessCategory: "",
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
    gstin: "",
    panNumber: "",
    fssaiNumber: "",
};

function OTPInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        <div className="flex gap-2 sm:gap-3 justify-start mt-2">
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
                    className="w-11 h-12 border border-gray-200 rounded-xl text-center text-lg font-bold text-gray-900 bg-gray-50/50 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all font-outfit"
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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [contact, setContact] = useState("");
    const [otp, setOtp] = useState("");
    const [token, setToken] = useState("");
    const [form, setForm] = useState<Form>(initialForm);
    const [closeFailed, setCloseFailed] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [verifyingSession, setVerifyingSession] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string | null>(null);
    
    const [categories, setCategories] = useState<string[]>([]);
    const [backendCategories, setBackendCategories] = useState<any[]>([]);
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/getAllCategories`);
                if (Array.isArray(res.data)) {
                    const activeCats = res.data.filter((c: any) => c.categoryStatus === "active");
                    setBackendCategories(activeCats);
                    setCategories(activeCats.map((c: any) => c.categoryName));
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };
        fetchCategoriesList();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpenDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load draft on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedDraft = localStorage.getItem("vendorOnboardingDraft");
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    if (parsed.form) {
                        setForm(p => ({ ...p, ...parsed.form }));
                    }
                    if (parsed.step) {
                        setStep(parsed.step);
                    }
                } catch (e) {
                    console.error("Failed to load vendor onboarding draft:", e);
                }
            }
        }
    }, []);

    // Save draft on changes
    useEffect(() => {
        if (typeof window !== "undefined" && otpVerified) {
            localStorage.setItem("vendorOnboardingDraft", JSON.stringify({ form, step }));
        }
    }, [form, step, otpVerified]);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        const localToken = typeof window !== "undefined" ? localStorage.getItem("vendorToken") : null;
        const activeToken = urlToken || localToken;

        if (activeToken) {
            setToken(activeToken);
            setOtpVerified(true);
            setShowLoginModal(false);

            // Decode payload for contact mapping
            try {
                const parts = activeToken.split(".");
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
                    if (payload && payload.contact) {
                        setContact(payload.contact);
                    }
                }
            } catch (e) {}

            // Save token locally
            if (urlToken && typeof window !== "undefined") {
                localStorage.setItem("vendorToken", urlToken);
            }

            // Verify registration and approval status from backend
            const checkStatus = async () => {
                setLoading(true);
                try {
                    const res = await axios.get(`${BACKEND_URL}/vendors/refresh`, {
                        headers: { Authorization: `Bearer ${activeToken}` }
                    });
                    
                    if (res.data) {
                        const { isVerified, vendor } = res.data;
                        if (vendor) {
                            setForm(p => ({
                                ...p,
                                businessName: vendor.businessName || "",
                                contactPerson: vendor.contactPerson || "",
                                email: vendor.email || "",
                                address: vendor.address || p.address,
                                bankDetails: vendor.bankDetails || p.bankDetails,
                                supportedCategories: vendor.supportedCategories || [],
                                businessType: vendor.businessType || "",
                                legalEntityType: vendor.legalEntityType || "",
                                legalBusinessName: vendor.legalBusinessName || "",
                                businessCategory: vendor.businessCategory || "",
                                gstin: vendor.gstin || "",
                                panNumber: vendor.panNumber || "",
                                fssaiNumber: vendor.fssaiNumber || "",
                            }));
                        }
                        
                        setSubmitted(true);
                        // Can edit only if NOT yet verified/approved
                        setCanEdit(!isVerified);
                    }
                } catch (err) {
                    console.error("Session check failed, falling back to draft/login:", err);
                    // Fall back to local draft if session check fails but we have a token
                    if (typeof window !== "undefined") {
                        const savedDraft = localStorage.getItem("vendorOnboardingDraft");
                        if (savedDraft) {
                            try {
                                const parsed = JSON.parse(savedDraft);
                                if (parsed.step) {
                                    setStep(parsed.step);
                                    setCanEdit(true);
                                    setVerifyingSession(false);
                                    return;
                                }
                            } catch (e) {}
                        }
                    }
                    setStep(2);
                    setCanEdit(true);
                } finally {
                    setLoading(false);
                    setVerifyingSession(false);
                }
            };

            checkStatus();
        } else {
            setShowLoginModal(true);
            setVerifyingSession(false);
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
            setCountdown(30);
            toast.success("OTP sent to +91 " + contact);
        } catch (e: any) { 
            toast.error(e.response?.data?.message || "Failed to send OTP."); 
        } finally { 
            setLoading(false); 
        }
    };

    const verifyOtp = async () => {
        if (otp.length < 4) { toast.error("Enter the OTP."); return; }
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/verifyVendorOTP`, { contact, otp });
            const receivedToken = res.data.token;
            if (typeof window !== "undefined" && receivedToken) {
                localStorage.setItem("vendorToken", receivedToken);
            }

            if (res.data.needRegistration || res.data.isNew) {
                setToken(receivedToken);
                setOtpVerified(true);
                setShowLoginModal(false);
                setStep(2);
                setCanEdit(true);
                toast.success("Phone verified!");
            } else {
                setShowLoginModal(false);
                setSubmitted(true);
                const isVerified = res.data.vendor?.isVerified;
                setCanEdit(!isVerified);
                if (res.data.vendor) {
                    const v = res.data.vendor;
                    setForm(p => ({
                        ...p,
                        businessName: v.businessName || "",
                        contactPerson: v.contactPerson || "",
                        email: v.email || "",
                        address: v.address || p.address,
                        bankDetails: v.bankDetails || p.bankDetails,
                        supportedCategories: v.supportedCategories || [],
                        businessType: v.businessType || "",
                        legalEntityType: v.legalEntityType || "",
                        legalBusinessName: v.legalBusinessName || "",
                        businessCategory: v.businessCategory || "",
                        gstin: v.gstin || "",
                        panNumber: v.panNumber || "",
                        fssaiNumber: v.fssaiNumber || "",
                    }));
                }
            }
        } catch (e: any) { 
            toast.error(e.response?.data?.message || "Invalid OTP."); 
        } finally { 
            setLoading(false); 
        }
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
            
            // Add custom fields so they go to backend (ignored or saved)
            if (form.gstin) formData.append("gstin", form.gstin);
            if (form.panNumber) formData.append("panNumber", form.panNumber);
            formData.append("businessType", form.businessType);
            formData.append("legalEntityType", form.legalEntityType);
            formData.append("legalBusinessName", form.legalBusinessName);
            formData.append("businessCategory", form.businessCategory);
            if (form.fssaiNumber) formData.append("fssaiNumber", form.fssaiNumber);
            
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
            // If there's a docFile, we can append it as well
            if (docFile) {
                formData.append("document", docFile);
            }

            const res = await axios.post(`${BACKEND_URL}/onboardVendor`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (typeof window !== "undefined") {
                localStorage.removeItem("vendorOnboardingDraft");
                if (res.data.token) {
                    localStorage.setItem("vendorToken", res.data.token);
                    setToken(res.data.token);
                }
            }
            setSubmitted(true);
            setCanEdit(true);
            setIsEditing(false);
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

    const getFormattedTimer = () => {
        const sec = countdown % 60;
        return `00:${sec < 10 ? "0" + sec : sec}`;
    };

    // Validation helpers
    const isStep1Valid = () => {
        return otpVerified;
    };

    const isStep2Valid = () => {
        return (
            (form.businessType || "").trim().length > 0 &&
            (form.legalEntityType || "").trim().length > 0 &&
            (form.legalBusinessName || "").trim().length > 0 &&
            (form.businessName || "").trim().length > 0 &&
            (form.businessCategory || "").trim().length > 0
        );
    };

    const isStep3Valid = () => {
        return (
            (form.contactPerson || "").trim().length > 0 &&
            (form.email || "").trim().includes("@") &&
            imageFile !== null
        );
    };

    const isStep4Valid = () => {
        return (form.address.formattedAddress || "").trim().length > 0;
    };

    const isStep5Valid = () => {
        if (form.gstin && (form.gstin || "").trim().length !== 15) return false;
        if (form.panNumber && (form.panNumber || "").trim().length !== 10) return false;
        return true;
    };

    const isStep6Valid = () => {
        return (
            form.supportedCategories.length > 0 &&
            (!form.supportedCategories.includes("other") || (form.customCategory && (form.customCategory || "").trim().length > 0))
        );
    };

    const isStep7Valid = () => {
        return (
            (form.bankDetails.bankName || "").trim().length > 0 &&
            (form.bankDetails.accountNumber || "").trim().length > 0 &&
            (form.bankDetails.accountName || "").trim().length > 0 &&
            (form.bankDetails.ifscCode || "").trim().length > 0
        );
    };

    const isStep8Valid = () => {
        return true;
    };

    if (verifyingSession) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center font-outfit">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <Image src="/LOGO-png 3.svg" alt="Govigi" width={28} height={28} className="absolute" />
                    </div>
                    <div className="text-center space-y-1 animate-pulse">
                        <p className="text-sm font-extrabold text-gray-800 tracking-tight">Verifying session...</p>
                        <p className="text-[10px] text-gray-400 font-semibold">Please wait while we secure your connection</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
            <Header />

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-4 flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Side: Zomato-Style Stepper Sidebar */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-5 sticky top-24">
                    
                    {/* Stepper Card */}
                    <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">Complete your registration</h3>
                        </div>
                        
                        <div className="p-6 relative">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[37px] top-10 bottom-10 w-[1.5px] bg-gray-100 z-0" />
                            
                            <ul className="space-y-6 relative z-10">
                                {STEPS.map((s, idx) => {
                                    const active = step === s.id;
                                    const done = step > s.id;
                                    const StepIcon = s.icon;
                                    
                                    return (
                                        <li key={s.id} className="relative flex items-start gap-4">
                                            {/* Green indicator line on the left edge for active step */}
                                            {active && (
                                                <div className="absolute -left-6 top-0 bottom-0 w-[3px] bg-green-600 rounded-r-md" />
                                            )}
                                            
                                            {/* Circle Badge */}
                                            <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 ${
                                                done ? "bg-green-500 border-green-500 text-white" :
                                                active ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-100" :
                                                "bg-white border-gray-200 text-gray-400"
                                            }`}>
                                                {done ? (
                                                    <CheckIcon className="w-3.5 h-3.5" strokeWidth={3.5} />
                                                ) : (
                                                    <StepIcon className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                            
                                            {/* Step label & subtext */}
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                                                    active ? "text-green-600 font-extrabold" : done ? "text-gray-800" : "text-gray-400"
                                                }`}>
                                                    {s.label}
                                                </h4>
                                                <p className={`text-[11px] font-medium leading-relaxed transition-colors duration-300 ${
                                                    active ? "text-gray-500" : "text-gray-400"
                                                }`}>
                                                    {s.subtext}
                                                </p>
                                                
                                                {/* Green Continue button under active step subtext */}
                                                {active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (step === 1 && isStep1Valid()) setStep(2);
                                                            else if (step === 2 && isStep2Valid()) setStep(3);
                                                            else if (step === 3 && isStep3Valid()) setStep(4);
                                                            else if (step === 4 && isStep4Valid()) setStep(5);
                                                            else if (step === 5 && isStep5Valid()) setStep(6);
                                                            else if (step === 6 && isStep6Valid()) setStep(7);
                                                            else if (step === 7 && isStep7Valid()) setStep(8);
                                                            else if (step === 8 && isStep8Valid()) submitForm();
                                                        }}
                                                        disabled={
                                                            (step === 1 && !isStep1Valid()) ||
                                                            (step === 2 && !isStep2Valid()) ||
                                                            (step === 3 && !isStep3Valid()) ||
                                                            (step === 4 && !isStep4Valid()) ||
                                                            (step === 5 && !isStep5Valid()) ||
                                                            (step === 6 && !isStep6Valid()) ||
                                                            (step === 7 && !isStep7Valid()) ||
                                                            (step === 8 && !isStep8Valid()) ||
                                                            loading
                                                        }
                                                        className="mt-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-98 shadow-md shadow-green-100 hover:shadow-lg disabled:shadow-none"
                                                    >
                                                        {loading && step === 8 ? "Submitting..." : step === 8 ? "Finish Setup" : "Continue"}
                                                        <ChevronRightIcon className="w-3.5 h-3.5" strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Sidebar Helper Cards */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:bg-gray-50/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                <IdentificationIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Documents required for registration</span>
                        </div>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    </div>


                </div>

                {/* Right Side: Main Content Card & Forms */}
                <div className="flex-1 w-full flex flex-col gap-6">
                    
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight pl-1">
                        {STEPS[step - 1]?.label}
                    </h1>

                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.015)]">

                        {/* ================= STEP 1: LOGIN & VERIFICATION ================= */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {!otpVerified ? (
                                    /* Clean Mobile OTP Verification / Login Card */
                                    <div className="border border-gray-100 rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
                                        <div className="text-center sm:text-left space-y-1">
                                            <h3 className="text-base font-extrabold text-gray-800">Verify your mobile number</h3>
                                            <p className="text-xs text-gray-400 font-medium">To start your registration, please verify your 10-digit mobile number</p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Phone number*</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-4 flex items-center gap-1.5 text-sm font-semibold text-gray-500 border-r border-gray-100 pr-3">
                                                    🇮🇳 +91
                                                </span>
                                                <input
                                                    type="tel"
                                                    maxLength={10}
                                                    placeholder="10-digit mobile number*"
                                                    value={contact}
                                                    disabled={otpSent}
                                                    onChange={e => setContact(e.target.value.replace(/\D/g, ""))}
                                                    className="w-full pl-24 pr-24 py-3 rounded-xl border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={contact.length < 10 || loading || otpSent}
                                                    onClick={sendOtp}
                                                    className="absolute right-3 text-xs font-bold text-green-600 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 hover:bg-green-50/50 rounded-lg transition-all"
                                                >
                                                    {loading ? "Sending..." : "Verify"}
                                                </button>
                                            </div>

                                            {otpSent && (
                                                <div className="mt-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 animate-in slide-in-from-top-1 duration-200">
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Enter OTP*</label>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => { setOtpSent(false); setOtp(""); }}
                                                                className="text-[10px] font-bold text-gray-400 hover:text-green-650 transition-colors uppercase tracking-wider"
                                                            >
                                                                Change Number
                                                            </button>
                                                        </div>
                                                        <OTPInput value={otp} onChange={setOtp} />
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                                                        <div className="text-xs font-semibold text-gray-500">
                                                            {countdown > 0 ? (
                                                                <span>Didn't receive the OTP? Resend in <strong className="text-gray-800">{getFormattedTimer()}</strong></span>
                                                            ) : (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={sendOtp} 
                                                                    className="text-green-655 hover:text-green-700 font-bold hover:underline"
                                                                >
                                                                    Resend OTP
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <button
                                                            type="button"
                                                            onClick={verifyOtp}
                                                            disabled={otp.length < 4 || loading}
                                                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                                        >
                                                            {loading ? "Verifying..." : "Verify OTP"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-xl mx-auto py-8 text-center animate-in fade-in duration-300">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto shadow-sm">
                                            <CheckIcon className="w-8 h-8" strokeWidth={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-base font-extrabold text-gray-800">Mobile number verified!</h3>
                                            <p className="text-xs text-green-650 font-bold">+91 {contact}</p>
                                            <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto">
                                                Your contact number is verified. Click "Continue" to proceed to Business Information.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ================= STEP 2: BUSINESS INFORMATION ================= */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-4 bg-green-50/45 border border-green-100/30 rounded-2xl p-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <BuildingStorefrontIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800">Business Information</h3>
                                        <p className="text-xs text-gray-450 font-medium">Tell us about your business. This information helps us personalize your experience.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Business Type *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <BuildingStorefrontIcon className="w-4 h-4 text-green-600" />
                                            </span>
                                            <select
                                                value={form.businessType}
                                                onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))}
                                                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold transition-all focus:border-green-600 focus:ring-2 focus:ring-green-500/10 focus:outline-none appearance-none"
                                            >
                                                <option value="">Select business type</option>
                                                <option value="Retailer">Retailer</option>
                                                <option value="Distributor">Distributor</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Service Provider">Service Provider</option>
                                                <option value="Restaurant / Food Service">Restaurant / Food Service</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Legal Entity Type *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <IdentificationIcon className="w-4 h-4 text-green-600" />
                                            </span>
                                            <select
                                                value={form.legalEntityType}
                                                onChange={e => setForm(p => ({ ...p, legalEntityType: e.target.value }))}
                                                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold transition-all focus:border-green-600 focus:ring-2 focus:ring-green-500/10 focus:outline-none appearance-none"
                                            >
                                                <option value="">Select legal entity type</option>
                                                <option value="Individual / Sole Proprietorship">Individual / Sole Proprietorship</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                                                <option value="Private Limited Company">Private Limited Company</option>
                                                <option value="One Person Company">One Person Company</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Legal Business Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter legal business name"
                                            value={form.legalBusinessName}
                                            onChange={e => setForm(p => ({ ...p, legalBusinessName: e.target.value }))}
                                            className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                        />
                                        <p className="text-[10px] text-gray-400 font-semibold pl-1">Enter the name as per PAN / official documents</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Brand / Store Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter brand or store name"
                                            value={form.businessName}
                                            onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                                            className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                        />
                                        <p className="text-[10px] text-gray-400 font-semibold pl-1">This is the name customers will see</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">Business Type / Category *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <QueueListIcon className="w-4 h-4 text-green-600" />
                                            </span>
                                            <select
                                                value={form.businessCategory}
                                                onChange={e => setForm(p => ({ ...p, businessCategory: e.target.value }))}
                                                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold transition-all focus:border-green-600 focus:ring-2 focus:ring-green-500/10 focus:outline-none appearance-none"
                                            >
                                                <option value="">Select business category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                                ))}
                                                <option value="other">OTHER</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-semibold pl-1">Choose the category that best describes your business</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            maxLength={15}
                                            placeholder="e.g. 29ABCDE1234F1Z5"
                                            value={form.gstin}
                                            onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                                            className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 uppercase placeholder-gray-400 focus:outline-none"
                                        />
                                        <p className="text-[10px] text-gray-400 font-semibold pl-1">Add your GST number if applicable</p>
                                    </div>
                                </div>

                                <div className="bg-green-50/30 border border-green-100/35 rounded-2xl p-4 flex items-center gap-3 mt-4">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600 shrink-0" />
                                    <div className="text-xs font-semibold text-gray-600">
                                        Your information is safe with us. We use bank-grade security to protect your data.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3: OWNER DETAILS ================= */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-5">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Owner details</h3>
                                        <p className="text-xs text-gray-400 font-medium">We will use these details for all business communications and updates</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Full name*</label>
                                            <input
                                                type="text"
                                                placeholder="Full name*"
                                                value={form.contactPerson}
                                                onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Email address*</label>
                                            <input
                                                type="email"
                                                placeholder="Email address*"
                                                value={form.email}
                                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">Store Owner Photo*</label>
                                        
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Owner Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-center text-gray-400">
                                                        <UserIcon className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-2">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-98 inline-flex items-center gap-1.5 shadow-md shadow-green-100">
                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
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
                                                            className="border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-semibold">JPEG, PNG or WEBP. Max size 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Whatsapp updates toggle */}
                                    <label className="flex items-start gap-3.5 cursor-pointer mt-2 p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={form.whatsappUpdates}
                                            onChange={e => setForm(p => ({ ...p, whatsappUpdates: e.target.checked }))}
                                            className="mt-0.5 w-4.5 h-4.5 rounded-md border-gray-200 text-green-600 focus:ring-green-600 cursor-pointer transition-all"
                                        />
                                        <span className="text-xs text-gray-600 font-semibold leading-normal">I want to receive important business updates and order alerts on WhatsApp.</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 4: BUSINESS LOCATION ================= */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Add your store's location for order pick-up</h3>
                                        <p className="text-xs text-gray-400 font-medium">Verify your exact store coordinates on Google Maps</p>
                                    </div>

                                    <div className="w-full">
                                        <MapPicker
                                            inline={true}
                                            onConfirm={handleMapConfirm}
                                            apiKey={GOOGLE_MAPS_API_KEY}
                                            initialLocation={
                                                form.address.location?.coordinates[1] && form.address.location?.coordinates[0]
                                                    ? { lat: form.address.location.coordinates[1], lng: form.address.location.coordinates[0] }
                                                    : undefined
                                            }
                                            initialAddress={form.address.formattedAddress || undefined}
                                        />
                                    </div>

                                    {form.address.formattedAddress && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
                                            {([
                                                ["houseNumber", "Building / House No.", "e.g. 4-1-88"],
                                                ["street", "Street / Road", "e.g. MG Road"],
                                                ["area", "Area / Locality", "e.g. Banjara Hills"],
                                                ["city", "City", "e.g. Hyderabad"],
                                                ["state", "State", "e.g. Telangana"],
                                                ["postalCode", "PIN Code", "e.g. 500034"],
                                            ] as const).map(([key, label, placeholder]) => (
                                                <div key={key} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">{label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={placeholder}
                                                        value={form.address.components[key as keyof AddressComponents]}
                                                        onChange={e => updateAddress(key as keyof AddressComponents, e.target.value)}
                                                        className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-2.5 px-4 text-xs font-semibold transition-all text-gray-900 placeholder-gray-300 focus:outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 5: BUSINESS VERIFICATION ================= */}
                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-5">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Compliance details</h3>
                                        <p className="text-xs text-gray-400 font-medium">Provide registration and tax info for verification</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">GSTIN (Optional)</label>
                                            <input
                                                type="text"
                                                maxLength={15}
                                                placeholder="e.g. 22AAAAA0000A1Z5"
                                                value={form.gstin}
                                                onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 uppercase placeholder-gray-400 focus:outline-none"
                                            />
                                            {form.gstin && form.gstin.length !== 15 && (
                                                <p className="text-[10px] text-amber-600 font-semibold pl-1">GSTIN must be exactly 15 characters</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">PAN Number (Optional)</label>
                                            <input
                                                type="text"
                                                maxLength={10}
                                                placeholder="e.g. ABCDE1234F"
                                                value={form.panNumber}
                                                onChange={e => setForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 uppercase placeholder-gray-400 focus:outline-none"
                                            />
                                            {form.panNumber && form.panNumber.length !== 10 && (
                                                <p className="text-[10px] text-amber-600 font-semibold pl-1">PAN must be exactly 10 characters</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload compliance doc */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">FSSAI / Business License (Optional)</label>
                                        
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                {docPreview ? (
                                                    <img src={docPreview} alt="Doc Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-center text-gray-400">
                                                        <IdentificationIcon className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-2">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-98 inline-flex items-center gap-1.5 shadow-md shadow-green-100">
                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                        Upload Document
                                                        <input
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setDocFile(file);
                                                                    if (file.type.startsWith("image/")) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => setDocPreview(reader.result as string);
                                                                        reader.readAsDataURL(file);
                                                                    } else {
                                                                        setDocPreview(null);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {docFile && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setDocFile(null); setDocPreview(null); }}
                                                            className="border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-semibold">{docFile ? docFile.name : "JPEG, PNG, WEBP or PDF. Max size 5MB."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 6: STORE SETUP ================= */}
                        {step === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Supported categories</h3>
                                        <p className="text-xs text-gray-400 font-medium">Select categories of products you plan to sell on Govigi</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {backendCategories.map((cat) => {
                                            const isSelected = form.supportedCategories.includes(cat.categoryName);
                                            return (
                                                <div
                                                    key={cat._id}
                                                    onClick={() => {
                                                        const current = form.supportedCategories;
                                                        const updated = current.includes(cat.categoryName)
                                                            ? current.filter(c => c !== cat.categoryName)
                                                            : [...current, cat.categoryName];
                                                        setForm(p => ({ ...p, supportedCategories: updated }));
                                                    }}
                                                    className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white relative overflow-hidden h-36 ${
                                                        isSelected 
                                                            ? "border-green-600 bg-green-50/10" 
                                                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/30"
                                                    }`}
                                                >
                                                    {/* Select Circle Badge */}
                                                    <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                        isSelected 
                                                            ? "bg-green-600 border-green-600 text-white shadow-sm" 
                                                            : "border-gray-200 bg-white"
                                                    }`}>
                                                        {isSelected && <CheckIcon className="w-3.5 h-3.5" strokeWidth={3} />}
                                                    </div>

                                                    <div className="w-16 h-16 mb-2 relative flex items-center justify-center">
                                                        {cat.categoryImage?.url ? (
                                                            <img
                                                                src={cat.categoryImage.url}
                                                                alt={cat.categoryName}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        ) : (
                                                            <BuildingStorefrontIcon className="w-8 h-8 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-tight line-clamp-2">
                                                        {cat.categoryName}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {/* Other Option Card */}
                                        <div
                                            onClick={() => {
                                                const current = form.supportedCategories;
                                                const updated = current.includes("other")
                                                    ? current.filter(c => c !== "other")
                                                    : [...current, "other"];
                                                setForm(p => ({ ...p, supportedCategories: updated }));
                                            }}
                                            className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white relative overflow-hidden h-36 ${
                                                form.supportedCategories.includes("other")
                                                    ? "border-green-600 bg-green-50/10"
                                                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/30"
                                            }`}
                                        >
                                            <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                form.supportedCategories.includes("other")
                                                    ? "bg-green-600 border-green-600 text-white shadow-sm"
                                                    : "border-gray-200 bg-white"
                                            }`}>
                                                {form.supportedCategories.includes("other") && <CheckIcon className="w-3.5 h-3.5" strokeWidth={3} />}
                                            </div>

                                            <div className="w-16 h-16 mb-2 flex items-center justify-center bg-gray-50 rounded-xl">
                                                <QueueListIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-tight">
                                                Other (Specify)
                                            </span>
                                        </div>
                                    </div>

                                    {form.supportedCategories.includes("other") && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Custom Category Name</label>
                                            <input
                                                type="text"
                                                placeholder="Specify custom product category..."
                                                value={form.customCategory || ""}
                                                onChange={e => setForm(p => ({ ...p, customCategory: e.target.value }))}
                                                className="w-full mt-1 border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-xs font-bold transition-all text-gray-900 uppercase placeholder-gray-450 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4 mt-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Operational Hours</h3>
                                        <p className="text-xs text-gray-400 font-medium">Standard store business operational time settings</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Open Time</span>
                                            <input type="time" defaultValue="09:00" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-green-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Close Time</span>
                                            <input type="time" defaultValue="21:00" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-green-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 7: BANK DETAILS ================= */}
                        {step === 7 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-5">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Bank information</h3>
                                        <p className="text-xs text-gray-400 font-medium">Enter bank details to safely receive weekly payouts</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {([
                                            ["bankName", "Bank Name", "e.g. HDFC Bank"],
                                            ["accountNumber", "Account Number", "Your account number"],
                                            ["accountName", "Account Holder Name", "As per bank records"],
                                            ["ifscCode", "IFSC Code", "e.g. HDFC0001234"],
                                        ] as const).map(([key, label, placeholder]) => (
                                            <div key={key} className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">{label}*</label>
                                                <input
                                                    type="text"
                                                    placeholder={placeholder}
                                                    value={form.bankDetails[key as keyof Form["bankDetails"]]}
                                                    onChange={e => updateBank(key as keyof Form["bankDetails"], e.target.value)}
                                                    className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 8: REVIEW & AGREEMENT ================= */}
                        {step === 8 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="border border-gray-150 rounded-2xl p-6 bg-gray-50/30 space-y-4">
                                    <div className="flex items-center gap-2 text-gray-800">
                                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                        <h4 className="text-sm font-bold">Review Registration Details</h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">Business Name:</span>
                                            <span className="text-gray-800 font-bold">{form.businessName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">Owner Contact:</span>
                                            <span className="text-gray-800 font-bold">{form.contactPerson}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">Email:</span>
                                            <span className="text-gray-800 font-bold">{form.email}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">Phone:</span>
                                            <span className="text-gray-800 font-bold">+91 {contact}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">Categories:</span>
                                            <span className="text-gray-800 font-bold uppercase truncate max-w-[160px]">
                                                {form.supportedCategories.join(", ")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 py-1.5">
                                            <span className="text-gray-400 font-semibold">City:</span>
                                            <span className="text-gray-800 font-bold">{form.address.components.city || "Selected on Map"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Actions Footer */}
                        {!(step === 1 && !otpVerified) && (
                            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-50 gap-4">
                                {step > 1 ? (
                                    <button 
                                        onClick={() => setStep(step - 1)} 
                                        type="button"
                                        className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200/75 px-5 py-3 rounded-xl transition-all active:scale-98"
                                    >
                                        Back
                                    </button>
                                ) : <div />}
                                
                                <button
                                    onClick={() => {
                                        if (step === 1 && isStep1Valid()) setStep(2);
                                        else if (step === 2 && isStep2Valid()) setStep(3);
                                        else if (step === 3 && isStep3Valid()) setStep(4);
                                        else if (step === 4 && isStep4Valid()) setStep(5);
                                        else if (step === 5 && isStep5Valid()) setStep(6);
                                        else if (step === 6 && isStep6Valid()) setStep(7);
                                        else if (step === 7 && isStep7Valid()) setStep(8);
                                        else if (step === 8 && isStep8Valid()) submitForm();
                                    }}
                                    type="button"
                                    disabled={
                                        (step === 1 && !isStep1Valid()) ||
                                        (step === 2 && !isStep2Valid()) ||
                                        (step === 3 && !isStep3Valid()) ||
                                        (step === 4 && !isStep4Valid()) ||
                                        (step === 5 && !isStep5Valid()) ||
                                        (step === 6 && !isStep6Valid()) ||
                                        (step === 7 && !isStep7Valid()) ||
                                        (step === 8 && !isStep8Valid()) ||
                                        loading
                                    }
                                    className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                >
                                    {loading && step === 8 ? (isEditing ? "Saving..." : "Submitting...") : step === 8 ? (isEditing ? "Save Changes" : "Submit Registration") : "Continue"}
                                    <ChevronRightIcon className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>



            {/* Success Modal */}
            {submitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-100 shadow-2xl p-8 sm:p-10 text-center max-w-md w-full rounded-[32px] animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                            <CheckIcon className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>
                        <h2 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Registration Complete!</h2>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed font-semibold">
                            <strong className="text-gray-800 font-extrabold">{form.businessName}</strong> has been submitted successfully.
                        </p>
                        <p className="text-xs text-gray-400 mb-8 leading-relaxed font-medium">
                            We will contact you on <strong className="text-gray-700 font-bold">+91 {contact}</strong> to verify your account shortly.
                        </p>

                        {/* On mobile, show close tab button / instruction */}
                        <div className="sm:hidden space-y-3">
                            {closeFailed ? (
                                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 font-semibold">
                                    You can now <strong className="text-gray-800 font-extrabold">close this tab</strong> manually.
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.close();
                                        setTimeout(() => setCloseFailed(true), 400);
                                    }}
                                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                >
                                    Close Tab
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setStep(2);
                                        setIsEditing(true);
                                    }}
                                    className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl transition-all active:scale-98 shadow-sm"
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>

                        {/* On web/desktop, show Go to Home button */}
                        <div className="hidden sm:block space-y-3">
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                            >
                                Go to Home
                            </button>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setStep(2);
                                        setIsEditing(true);
                                    }}
                                    className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl transition-all active:scale-98 shadow-sm"
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Login / OTP Verification Modal Overlay */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-100 shadow-2xl p-6 sm:p-10 text-center max-w-md w-full rounded-[32px] animate-in zoom-in-95 duration-300 space-y-6">
                        <div className="flex flex-col items-center">
                            <Image src="/LOGO-png 3.svg" alt="Govigi" width={90} height={36} priority className="mb-4" />
                            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Verify your mobile number</h3>
                            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed mt-1">To get started with your vendor registration, please enter your mobile number.</p>
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">Phone number*</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 flex items-center gap-1.5 text-sm font-semibold text-gray-500 border-r border-gray-100 pr-3">
                                    🇮🇳 +91
                                </span>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="10-digit mobile number*"
                                    value={contact}
                                    disabled={otpSent}
                                    onChange={e => setContact(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-24 pr-24 py-3.5 rounded-xl border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white text-sm font-semibold transition-all text-gray-900 placeholder-gray-450 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                />
                                <button
                                    type="button"
                                    disabled={contact.length < 10 || loading || otpSent}
                                    onClick={sendOtp}
                                    className="absolute right-3 text-xs font-bold text-green-600 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 hover:bg-green-50/50 rounded-lg transition-all"
                                >
                                    {loading ? "Sending..." : "Verify"}
                                </button>
                            </div>

                            {otpSent && (
                                <div className="mt-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 animate-in slide-in-from-top-1 duration-200">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Enter OTP*</label>
                                            <button 
                                                type="button" 
                                                onClick={() => { setOtpSent(false); setOtp(""); }}
                                                className="text-[10px] font-bold text-gray-450 hover:text-green-650 transition-colors uppercase tracking-wider"
                                            >
                                                Change Number
                                            </button>
                                        </div>
                                        <OTPInput value={otp} onChange={setOtp} />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                                        <div className="text-[11px] font-semibold text-gray-500">
                                            {countdown > 0 ? (
                                                <span>Didn't receive the OTP? Resend in <strong className="text-gray-800">{getFormattedTimer()}</strong></span>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={sendOtp} 
                                                    className="text-green-650 hover:text-green-700 font-bold hover:underline"
                                                >
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={verifyOtp}
                                            disabled={otp.length < 4 || loading}
                                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                        >
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Link href="/" className="text-xs font-bold text-gray-450 hover:text-gray-600 transition-colors">
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Header() {
    return (
        <header className="bg-white border-b border-gray-100 px-6 sm:px-12 h-18 flex items-center justify-between sticky top-0 z-40 shadow-[0_2px_15px_rgba(0,0,0,0.015)]">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/LOGO-png 3.svg" alt="Govigi" width={80} height={32} priority />
                <span className="text-xs text-gray-400 border-l border-gray-200 pl-2 font-medium">Partner</span>
            </Link>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                <QuestionMarkCircleIcon className="w-4.5 h-4.5" />
                <span>Help & Support</span>
            </div>
        </header>
    );
}
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
    CameraIcon,
    CreditCardIcon,
    BriefcaseIcon,
    UsersIcon,
    ArrowLeftIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import MapPicker from "./MapPicker";
import LivenessCaptureModal from "./LivenessCaptureModal";
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
    role?: string;
    alternatePhone?: string;
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
    role: "",
    alternatePhone: "",
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
    const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string | null>(null);
    const [storePreviews, setStorePreviews] = useState<{ url: string; file?: File }[]>([]);
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const [agree1, setAgree1] = useState(false);
    const [agree2, setAgree2] = useState(false);
    const [isBankVerified, setIsBankVerified] = useState(false);
    const [isBankVerifying, setIsBankVerifying] = useState(false);
    const [bankVerificationError, setBankVerificationError] = useState("");
    const [verifiedBankName, setVerifiedBankName] = useState("");

    const handleStoreImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileList = Array.from(files);
        if (storePreviews.length + fileList.length > 5) {
            toast.error("You can upload a maximum of 5 store images.");
            return;
        }

        fileList.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setStorePreviews((prev) => [...prev, { url: dataUrl, file }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = "";
    };

    const handleRemoveStoreImage = (index: number) => {
        setStorePreviews((prev) => prev.filter((_, i) => i !== index));
    };
    
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
                                role: vendor.role || "",
                                alternatePhone: vendor.alternatePhone || "",
                            }));
                            if (vendor.image) {
                                setImagePreview(typeof vendor.image === "object" && vendor.image.url ? vendor.image.url : vendor.image);
                            }
                            if (vendor.document) {
                                setDocPreview(typeof vendor.document === "object" && vendor.document.url ? vendor.document.url : vendor.document);
                            }
                            if (vendor.storeImages && Array.isArray(vendor.storeImages)) {
                                setStorePreviews(vendor.storeImages.map((img: any) => ({ url: img.url })));
                            }
                            const hasBank = vendor.bankDetails &&
                                            (vendor.bankDetails.bankName || "").trim().length > 0 &&
                                            (vendor.bankDetails.accountNumber || "").trim().length > 0 &&
                                            (vendor.bankDetails.accountName || "").trim().length > 0 &&
                                            (vendor.bankDetails.ifscCode || "").trim().length > 0;
                            if (hasBank) {
                                setIsBankVerified(true);
                                setVerifiedBankName(vendor.bankDetails.accountName);
                            }
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

    const updateBank = (key: keyof Form["bankDetails"], val: string) => {
        setForm(p => ({ ...p, bankDetails: { ...p.bankDetails, [key]: val } }));
        setIsBankVerified(false);
        setBankVerificationError("");
        setVerifiedBankName("");
    };

    const handleVerifyBankDetails = async () => {
        const { bankName, accountNumber, accountName, ifscCode } = form.bankDetails;
        if (!bankName || !accountNumber || !accountName || !ifscCode) {
            toast.error("Please fill in all bank details before verifying.");
            return;
        }

        setIsBankVerifying(true);
        setBankVerificationError("");
        setVerifiedBankName("");

        try {
            const res = await axios.post(`${BACKEND_URL}/verifyBankDetails`, {
                accountNumber,
                ifscCode,
                accountName
            });

            if (res.data && res.data.success) {
                setIsBankVerified(true);
                setVerifiedBankName(res.data.verifiedName);
                toast.success("Bank account verified successfully!");
            } else {
                setBankVerificationError(res.data.message || "Verification failed");
                toast.error(res.data.message || "Bank account verification failed.");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to verify bank details.";
            setBankVerificationError(msg);
            toast.error(msg);
        } finally {
            setIsBankVerifying(false);
        }
    };

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
                        role: v.role || "",
                        alternatePhone: v.alternatePhone || "",
                    }));
                    if (v.image) {
                        setImagePreview(typeof v.image === "object" && v.image.url ? v.image.url : v.image);
                    }
                    if (v.document) {
                        setDocPreview(typeof v.document === "object" && v.document.url ? v.document.url : v.document);
                    }
                    if (v.storeImages && Array.isArray(v.storeImages)) {
                        setStorePreviews(v.storeImages.map((img: any) => ({ url: img.url })));
                    }
                    const hasBank = v.bankDetails &&
                                    (v.bankDetails.bankName || "").trim().length > 0 &&
                                    (v.bankDetails.accountNumber || "").trim().length > 0 &&
                                    (v.bankDetails.accountName || "").trim().length > 0 &&
                                    (v.bankDetails.ifscCode || "").trim().length > 0;
                    if (hasBank) {
                        setIsBankVerified(true);
                        setVerifiedBankName(v.bankDetails.accountName);
                    }
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
            if (form.role) formData.append("role", form.role);
            if (form.alternatePhone) formData.append("alternatePhone", form.alternatePhone);
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

            // Append store images
            storePreviews.forEach((item) => {
                if (item.file) {
                    formData.append("storeImages", item.file);
                }
            });
            const existingStoreUrls = storePreviews
                .filter((item) => !item.file && item.url.startsWith("http"))
                .map((item) => item.url);
            formData.append("existingStoreImages", JSON.stringify(existingStoreUrls));

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
            (form.role || "").trim().length > 0 &&
            (form.email || "").trim().includes("@") &&
            (form.panNumber || "").trim().length === 10 &&
            (imageFile !== null || (imagePreview !== null && imagePreview !== "/profile_placeholder.png"))
        );
    };

    const isStep4Valid = () => {
        return (form.address.formattedAddress || "").trim().length > 0;
    };

    const isStep5Valid = () => {
        if (form.gstin && (form.gstin || "").trim().length !== 15) return false;
        return true;
    };

    const isStep6Valid = () => {
        return (
            form.supportedCategories.length > 0 &&
            (!form.supportedCategories.includes("other") || (form.customCategory && (form.customCategory || "").trim().length > 0)) &&
            storePreviews.length >= 1 &&
            storePreviews.length <= 5
        );
    };

    const isStep7Valid = () => {
        return (
            (form.bankDetails.bankName || "").trim().length > 0 &&
            (form.bankDetails.accountNumber || "").trim().length > 0 &&
            (form.bankDetails.accountName || "").trim().length > 0 &&
            (form.bankDetails.ifscCode || "").trim().length > 0 &&
            isBankVerified
        );
    };

    const isStep8Valid = () => {
        return agree1 && agree2;
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
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-5 lg:sticky lg:top-24">
                    
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
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                setForm(p => ({ ...p, legalBusinessName: value }))
                                            }}
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
                                            onChange={(e) => {
                                                    const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                    setForm(p => ({ ...p, businessName: value }))
                                            }}
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                        <UsersIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">Owner Details</h3>
                                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Provide details of the person who will be responsible for the Govigi partner account.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative flex items-center">
                                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-4" />
                                            <input
                                                type="text"
                                                placeholder="Enter full name"
                                                value={form.contactPerson}
                                                onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 pl-12 pr-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">Enter name as per PAN or official documents</p>
                                    </div>

                                    {/* Role / Designation */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700">Role / Designation <span className="text-red-500">*</span></label>
                                        <div className="relative flex items-center">
                                            <BriefcaseIcon className="w-5 h-5 text-gray-400 absolute left-4" />
                                            <select
                                                value={form.role || ""}
                                                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 pl-12 pr-10 text-sm font-semibold transition-all text-gray-900 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select role / designation</option>
                                                <option value="Owner">Owner</option>
                                                <option value="Partner">Partner</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Authorized Representative">Authorized Representative</option>
                                            </select>
                                            <div className="pointer-events-none absolute right-4 flex items-center">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">Select your role in the business</p>
                                    </div>

                                    {/* Email Address */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                        <div className="relative flex items-center">
                                            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-4" />
                                            <input
                                                type="email"
                                                placeholder="Enter email address"
                                                value={form.email}
                                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 pl-12 pr-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">We will use this email for important updates</p>
                                    </div>

                                    {/* Alternate Phone Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-500">Alternate Phone Number (Optional)</label>
                                        <div className="relative flex items-center">
                                            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 absolute left-4" />
                                            <span className="text-sm font-semibold text-gray-700 absolute left-11">+91</span>
                                            <div className="w-px h-6 bg-gray-200 absolute left-20" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={10}
                                                placeholder="Enter 10-digit mobile number"
                                                value={form.alternatePhone || ""}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    setForm(p => ({ ...p, alternatePhone: val }));
                                                }}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 pl-24 pr-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">Used if we cannot reach your primary number</p>
                                    </div>

                                    {/* PAN Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700">PAN Number <span className="text-red-500">*</span></label>
                                        <div className="relative flex items-center">
                                            <CreditCardIcon className="w-5 h-5 text-gray-400 absolute left-4" />
                                            <input
                                                type="text"
                                                maxLength={10}
                                                placeholder="Enter PAN number (e.g. ABCDE1234F)"
                                                value={form.panNumber || ""}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                                                    setForm(p => ({ ...p, panNumber: val }));
                                                }}
                                                className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 pl-12 pr-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">Required for verification and payouts</p>
                                    </div>

                                    {/* Profile Photo */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-700">Profile Photo <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                                            {/* Webcam Capture Option */}
                                            <button
                                                type="button"
                                                onClick={() => setIsLivenessModalOpen(true)}
                                                className="relative flex-1 min-w-[200px] max-w-[280px] h-[88px] border border-dashed border-gray-300 hover:border-green-500 rounded-xl bg-[#F8FAFC]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8FAFC] transition-all"
                                            >
                                                <CameraIcon className="w-5 h-5 text-gray-400 mb-1" />
                                                <span className="text-[11px] font-bold text-gray-700">Verify & Capture</span>
                                                <span className="text-[9px] text-gray-400">Live Face Verification</span>
                                            </button>

                                            {/* Preview */}
                                            <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden bg-[#F1F5F9] border border-gray-100 flex items-center justify-center shrink-0 relative group">
                                                {imagePreview ? (
                                                    <>
                                                        <img src={imagePreview} alt="Owner Profile" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-2xl"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <img src="/profile_placeholder.png" alt="Profile Placeholder" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400 pl-1">Clear photo helps build trust with customers</p>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div className="flex items-start gap-3.5 p-4 bg-[#E8F5E9]/30 border border-green-50 rounded-2xl mt-4">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800">Your information is safe with us.</h4>
                                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">We never share your personal information with anyone.</p>
                                    </div>
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

                                    <div className="grid grid-cols-1 gap-4">
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

                                <div className="border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4 mt-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-800 mb-1">Store Images <span className="text-red-500">*</span></h3>
                                        <p className="text-xs text-gray-400 font-medium">Upload up to 5 images of your store (at least 1 is required)</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {storePreviews.length < 5 && (
                                            <label className="border-2 border-dashed border-gray-200 hover:border-green-600 bg-gray-50/50 hover:bg-white rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                                                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-xs font-bold text-gray-700">Click to upload store images</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">Upload JPEG, PNG, or WEBP (Max 5 images)</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleStoreImagesChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}

                                        {storePreviews.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                                {storePreviews.map((item, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group shadow-sm">
                                                        <img
                                                            src={item.url}
                                                            alt={`Store Preview ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveStoreImage(idx)}
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                            ["bankName", "Bank Name", "e.g. HDFC Bank", "text", "[^a-zA-Z ]", "none"],
                                            ["accountNumber", "Account Number", "Your account number", "text", "[^0-9]", "numeric"],
                                            ["accountName", "Account Holder Name", "As per bank records", "text", "[^a-zA-Z ]", "none"],
                                            ["ifscCode", "IFSC Code", "e.g. HDFC0001234", "text", "[^a-zA-Z0-9]", "none"],
                                        ] as const).map(([key, label, placeholder, type, pattern, inputMode]) => (
                                            <div key={key} className="space-y-1">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">{label}*</label>
                                                <input
                                                    type={type}
                                                    inputMode={inputMode === "none" ? undefined : inputMode}
                                                    placeholder={placeholder}
                                                    value={form.bankDetails[key as keyof Form["bankDetails"]]}
                                                    onChange={e => {
                                                        debugger;
                                                        const regex = new RegExp(pattern, "g");
                                                        const cleanValue = e.target.value.replace(regex, "");
                                                        updateBank(key as keyof Form["bankDetails"], cleanValue);
                                                    }}
                                                    className="w-full border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/10 bg-white rounded-xl py-3 px-4 text-sm font-semibold transition-all text-gray-900 placeholder-gray-400 focus:outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bank Verification Section */}
                                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                        {isBankVerified ? (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                    <CheckIcon className="w-5 h-5" strokeWidth={3} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-green-800">Bank Account Verified Successfully</h4>
                                                    <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                        Verified Holder Name: <span className="font-extrabold text-green-700">{verifiedBankName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        isBankVerifying ||
                                                        !form.bankDetails.bankName ||
                                                        !form.bankDetails.accountNumber ||
                                                        !form.bankDetails.accountName ||
                                                        !form.bankDetails.ifscCode
                                                    }
                                                    onClick={handleVerifyBankDetails}
                                                    className="w-full sm:w-auto self-start px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-green-100"
                                                >
                                                    {isBankVerifying ? (
                                                        <>
                                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                            Verifying details...
                                                        </>
                                                    ) : (
                                                        "Verify Bank Account"
                                                    )}
                                                </button>
                                                {bankVerificationError && (
                                                    <p className="text-[11px] text-red-500 font-semibold pl-1 animate-in fade-in duration-200">
                                                        ⚠ {bankVerificationError}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 8: REVIEW & AGREEMENT ================= */}
                        {step === 8 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Circular green checkmark with document text icon */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Review & Agreement</h2>
                                        <p className="text-xs text-gray-400 font-medium">Please review all details carefully before submitting.</p>
                                    </div>
                                </div>

                                {/* Callout box */}
                                <div className="border border-amber-200/60 bg-amber-50/30 rounded-2xl p-4 flex items-start gap-3">
                                    <QuestionMarkCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                                        Almost there! Please review your information and agree to the terms to complete your setup.
                                    </p>
                                </div>

                                {/* Accordion Title */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm font-bold text-gray-800">Review Your Details</h3>

                                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white ">
                                        {[
                                            {
                                                id: 2,
                                                label: "Business Information",
                                                icon: BuildingStorefrontIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-800">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Business Name</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.businessName || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Business Category</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.businessCategory || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Business Type</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.businessType || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Legal Entity Type</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.legalEntityType || "—"}</span>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Legal Business Name</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.legalBusinessName || "—"}</span>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 3,
                                                label: "Owner Details",
                                                icon: UserIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-800">
                                                        <div className="sm:col-span-2 flex items-center gap-4 mb-2">
                                                            {imagePreview ? (
                                                                <img src={imagePreview} className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" alt="Profile" />
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold border">No Image</div>
                                                            )}
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block">Profile Photo</span>
                                                                <span className="text-xs text-gray-500 font-medium">Liveness verified</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Owner Name</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.contactPerson || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Contact Role</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.role || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Email Address</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.email || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Primary Phone</span>
                                                            <span className="text-gray-800 font-bold text-sm">+91 {contact}</span>
                                                        </div>
                                                        {form.alternatePhone && (
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">Alternate Phone</span>
                                                                <span className="text-gray-800 font-bold text-sm">+91 {form.alternatePhone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 4,
                                                label: "Business Location",
                                                icon: MapPinIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 gap-4 p-5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-800">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Shop Address</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.address.formattedAddress || "—"}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">Area</span>
                                                                <span className="text-gray-800 font-bold text-sm">{form.address.components.area || "—"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">Landmark</span>
                                                                <span className="text-gray-800 font-bold text-sm">{form.address.components.street || "—"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 5,
                                                label: "Business Verification",
                                                icon: ShieldCheckIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-800">
                                                        {form.gstin && (
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">GSTIN</span>
                                                                <span className="text-gray-800 font-bold text-sm uppercase">{form.gstin}</span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">PAN Card Number</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.panNumber || "—"}</span>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <span className="text-gray-400 font-semibold block mb-1">Verification Document</span>
                                                            {docPreview ? (
                                                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 bg-white max-w-sm">
                                                                    <DocumentCheckIcon className="w-5 h-5 text-green-600 shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-gray-700 truncate font-outfit">PAN_Document</p>
                                                                        <p className="text-[10px] text-gray-400 font-medium">Uploaded successfully</p>
                                                                    </div>
                                                                    <a href={docPreview} target="_blank" rel="noreferrer" className="text-xs font-bold text-green-600 hover:text-green-700">View</a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 italic">No document uploaded</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 6,
                                                label: "Store Setup",
                                                icon: QueueListIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 gap-4 p-5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-800">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-1">Supported Categories</span>
                                                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                                                                {form.supportedCategories.map((c, idx) => (
                                                                    <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-755 font-bold rounded-lg uppercase tracking-wide">{c}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">Operational Open Time</span>
                                                                <span className="text-gray-800 font-bold text-sm">09:00 AM</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400 font-semibold block mb-0.5">Operational Close Time</span>
                                                                <span className="text-gray-800 font-bold text-sm">09:00 PM</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-2">Store Images</span>
                                                            {storePreviews.length > 0 ? (
                                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                                    {storePreviews.map((item, idx) => (
                                                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                                                                            <img src={item.url} alt={`Store Preview ${idx}`} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500 italic">No images uploaded</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 7,
                                                label: "Bank Details",
                                                icon: CreditCardIcon,
                                                render: () => (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-800">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Bank Name</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.bankDetails.bankName || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Account Number</span>
                                                            <span className="text-gray-800 font-bold text-sm">{form.bankDetails.accountNumber || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">Account Holder Name</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.bankDetails.accountName || "—"}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block mb-0.5">IFSC Code</span>
                                                            <span className="text-gray-800 font-bold text-sm uppercase">{form.bankDetails.ifscCode || "—"}</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        ].map((section, idx, arr) => {
                                            const isOpen = expandedSection === section.id;
                                            const SectionIcon = section.icon;
                                            const isLast = idx === arr.length - 1;

                                            return (
                                                <div key={section.id} className={`${!isLast ? "border-b border-gray-200" : ""} transition-all duration-200`}>
                                                    <div
                                                        onClick={() => setExpandedSection(isOpen ? null : section.id)}
                                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                                                                <SectionIcon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-850">{section.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStep(section.id);
                                                                }}
                                                                className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50/50 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                                </svg>
                                                                Edit
                                                            </button>
                                                            {isOpen ? (
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isOpen && (
                                                        <div className="animate-in fade-in slide-in-from-top-3 duration-300 ease-out origin-top">
                                                            {section.render()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Agreements & Declarations Section */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-bold text-gray-800">Agreements & Declarations</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={agree1}
                                                onChange={(e) => setAgree1(e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-0.5 accent-green-600 shrink-0"
                                            />
                                            <span className="text-xs font-semibold text-gray-650 leading-relaxed group-hover:text-gray-900 transition-colors select-none">
                                                I confirm that all the information provided is accurate and complete to the best of my knowledge.
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={agree2}
                                                onChange={(e) => setAgree2(e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-0.5 accent-green-600 shrink-0"
                                            />
                                            <span className="text-xs font-semibold text-gray-655 leading-relaxed group-hover:text-gray-900 transition-colors select-none">
                                                I agree to the Govigi Partner{" "}
                                                <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 underline font-bold">Terms & Conditions</a>
                                                {" "}and{" "}
                                                <a href="/vendor-privacy-policy" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 underline font-bold">Privacy Policy</a>.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Safety Callout */}
                                <div className="border border-green-100 bg-green-50/30 rounded-2xl p-4 flex items-start gap-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-800">Your data is safe with us.</h5>
                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                            We use industry-standard encryption and security practices to protect your information.
                                        </p>
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
                                        className="text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-xl transition-all active:scale-98 flex items-center gap-2"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back
                                    </button>
                                ) : <div />}
                                
                                {step === 8 ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                toast.success("Draft saved successfully!");
                                                setTimeout(() => {
                                                    window.location.href = "/";
                                                }, 1000);
                                            }}
                                            className="text-sm font-bold text-gray-700 bg-white border border-gray-250 hover:bg-gray-50 px-6 py-3 rounded-xl transition-all active:scale-98"
                                        >
                                            Save & Exit
                                        </button>
                                        <button
                                            onClick={submitForm}
                                            type="button"
                                            disabled={!isStep8Valid() || loading}
                                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                        >
                                            {loading ? (isEditing ? "Saving..." : "Submitting...") : "Agree & Submit"}
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (step === 1 && isStep1Valid()) setStep(2);
                                            else if (step === 2 && isStep2Valid()) setStep(3);
                                            else if (step === 3 && isStep3Valid()) setStep(4);
                                            else if (step === 4 && isStep4Valid()) setStep(5);
                                            else if (step === 5 && isStep5Valid()) setStep(6);
                                            else if (step === 6 && isStep6Valid()) setStep(7);
                                            else if (step === 7 && isStep7Valid()) setStep(8);
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
                                            loading
                                        }
                                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all active:scale-98 shadow-md shadow-green-100"
                                    >
                                        {step === 1 ? "Continue" : "Save & Continue"}
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                )}
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
            <LivenessCaptureModal
                isOpen={isLivenessModalOpen}
                onClose={() => setIsLivenessModalOpen(false)}
                onCapture={(file, previewUrl) => {
                    setImageFile(file);
                    setImagePreview(previewUrl);
                    setIsLivenessModalOpen(false);
                }}
            />
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

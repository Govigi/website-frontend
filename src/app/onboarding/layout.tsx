"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingData } from "@/lib/validations/onboarding-schema";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, QuestionMarkCircleIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon, PhoneIcon, EnvelopeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Modal } from "@/components/UI/Modal";

import Sidebar from "@/components/vendor-onboarding/Sidebar";
import Step1Phone from "@/components/vendor-onboarding/Steps/Step1Phone";
import { config } from "@/lib/utils/config";
import { cn } from "@/lib/utils/utils";
import { onboardingDefaults } from "@/lib/constants/vendor/onboarding.defaults";

const BACKEND_URL = config.backend_url;

const STEP_MAP: Record<string, number> = {
  step1: 1, // Business, Owner & Address
  step2: 2, // Category & Timings
  step3: 3, // Bank details & Verification
  step4: 4, // Upload documents
  step5: 5, // Review & Submit
};

const STEP_KEYS = ["step1", "step2", "step3", "step4", "step5"];

const SUB_STEP_COUNTS: Record<number, number> = {
  1: 3, // Business Info, Owner Details, Address/Map
  2: 3, // Categories, Timings, Store Photos
  3: 1, // Bank details
  4: 2, // Brand Logo, FSSAI/License Doc
  5: 2, // Review Summary, Agreement Accept
};

const SUB_STEP_LABELS: Record<number, Record<number, string>> = {
  1: {
    1: "Business Information",
    2: "Owner Details",
    3: "Store Address"
  },
  2: {
    1: "Store Categories",
    2: "Operating Timings",
    3: "Store Gallery Photos"
  },
  3: {
    1: "Bank Account Details"
  },
  4: {
    1: "Business Verification"
  },
  5: {
    1: "Review Application",
    2: "Declaration & Accept"
  }
};

const SUB_STEP_FIELDS: Record<number, Record<number, string[]>> = {
  1: {
    1: ["businessType", "legalEntityType", "legalBusinessName", "businessName"],
    2: ["contactPerson", "role", "email", "panNumber", "profileImage"],
    3: ["address"]
  },
  2: {
    1: ["businessCategory", "supportedCategories", "customCategory"],
    2: ["openTime", "closeTime"],
    3: ["storeFiles"]
  },
  3: {
    1: ["bankDetails"]
  },
  4: {
    1: ["gstin", "cin", "llpin", "udyamNumber", "tradeLicenseNumber", "regCertNumber", "fssaiNumber", "drugLicenseNumber"]
  },
  5: {
    1: [],
    2: ["agree1", "agree2"]
  }
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const stepSlug = (params.step as string) || "step1";
  const currentStepNum = STEP_MAP[stepSlug] || 1;
  const resId = searchParams.get("resId") || "";
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;

  const [showFormOnMobile, setShowFormOnMobile] = useState(!!subParam);
  const [helpOpen, setHelpOpen] = useState(false);

  // Sync mobile form view with search param
  useEffect(() => {
    setShowFormOnMobile(!!subParam);
  }, [subParam]);

  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isAwaitingApproval, setIsAwaitingApproval] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [validBanks, setValidBanks] = useState<string[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/getAllBanks`);
        const names = Array.from(new Set(Object.values(response.data) as string[]));
        setValidBanks(names);
      } catch (error) {
        console.error("Error loading banks in layout:", error);
      }
    };
    fetchBanks();
  }, []);

  // Initialize unified Form Context
  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: onboardingDefaults
  });

  const { handleSubmit, trigger, reset, watch } = methods;

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("vendorOnboardingDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {
        console.error("Failed to parse saved onboarding draft:", e);
      }
    }
    setDraftLoaded(true);
  }, [reset]);

  // Save draft on form values change
  useEffect(() => {
    const subscription = watch((value) => {
      const serializable = { ...value };
      delete (serializable as any).storeFiles;
      delete (serializable as any).logoFile;
      delete (serializable as any).documentFile;
      delete (serializable as any).profileImage;
      localStorage.setItem("vendorOnboardingDraft", JSON.stringify(serializable));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Reset mobile form view on step changes
  useEffect(() => {
    setShowFormOnMobile(false);
  }, [currentStepNum]);

  // Session verification and vendor data pre-filling on mount
  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        toast.error("Session expired or invalid. Please verify your mobile number.");
        router.push("/partner-with-us");
        setCheckingSession(false);
        return;
      }

      // Decode JWT payload to verify expiry
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          toast.error("Session expired. Please verify your mobile number again.");
          localStorage.removeItem("vendorToken");
          router.push("/partner-with-us");
          setCheckingSession(false);
          return;
        }
        setSessionValid(true);

        // Fetch vendor profile if it already exists
        const res = await axios.get(`${BACKEND_URL}/vendors/refresh`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data && res.data.vendor) {
          const v = res.data.vendor;
          
          if (!v.isVerified) {
            setIsAwaitingApproval(true);
            setSubmittedSuccess(true);
          }

          // Map backend data to onboarding form structure
          reset({
            businessName: v.businessName || "",
            contactPerson: v.contactPerson || "",
            email: v.email || "",
            alternatePhone: v.alternatePhone || "",
            businessType: v.businessType || "",
            legalEntityType: v.legalEntityType || "",
            legalBusinessName: v.legalBusinessName || "",
            businessCategory: v.businessCategory || "",
            supportedCategories: v.supportedCategories || [],
            openTime: v.openTime || "",
            closeTime: v.closeTime || "",
            address: v.address || {
              formattedAddress: "",
              components: { houseNumber: "", street: "", area: "", city: "", state: "", postalCode: "", country: "India" },
              location: { type: "Point", coordinates: [0, 0] },
            },
            bankDetails: v.bankDetails ? {
              accountName: v.bankDetails.accountName || "",
              accountNumber: v.bankDetails.accountNumber || "",
              bankName: v.bankDetails.bankName || "",
              ifscCode: v.bankDetails.ifscCode || "",
              isVerified: !!v.bankDetails.isVerified
            } : { accountName: "", accountNumber: "", bankName: "", ifscCode: "", isVerified: false },
            gstin: v.gstin || "",
            panNumber: v.panNumber || "",
            fssaiNumber: v.fssaiNumber || "",
            profileImage: v.profileImage?.url || null,
            logoFile: null,
            documentFile: null,
            storeFiles: [],
            existingStoreImages: v.storeImages?.map((img: any) => img.url) || [],
            agree1: true,
            agree2: true,
          } as any);

          // Check if vendor is already verified/activated by admin
          if (v.isVerified) {
            toast.success("Your partner account is activated. Redirecting to dashboard...");
            router.push("/vendor-dashboard");
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log("No existing vendor profile found (new registration).");
        } else {
          console.error("Session verification/refresh failed:", err);
          toast.error("Onboarding session invalid or expired.");
          localStorage.removeItem("vendorToken");
          router.push("/partner-with-us");
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkSessionAndLoadData();
  }, [router, reset]);

  const checkStepValidity = (stepNum: number): boolean => {
    const values = methods.getValues();
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (stepNum === 1) {
      if (!values.businessType || values.businessType.trim() === "") return false;
      if (!values.legalEntityType || values.legalEntityType.trim() === "") return false;
      if (!values.legalBusinessName || values.legalBusinessName.trim().length < 3) return false;
      if (!values.businessName || values.businessName.trim().length < 2) return false;
      if (!values.contactPerson || values.contactPerson.trim().length < 2) return false;
      if (!values.role || values.role.trim() === "") return false;
      if (!values.email || !EMAIL_REGEX.test(values.email)) return false;
      if (!values.panNumber || !PAN_REGEX.test(values.panNumber)) return false;
      if (!values.profileImage) return false;
      if (!values.address?.formattedAddress || values.address.formattedAddress.trim().length < 5) return false;
      if (!values.address?.location?.coordinates || values.address.location.coordinates.length !== 2) return false;
      return true;
    }

    if (stepNum === 2) {
      if (!values.businessCategory || values.businessCategory.trim() === "") return false;
      if (!values.supportedCategories || values.supportedCategories.length < 1) return false;
      if (values.supportedCategories.includes("Other") && (!values.customCategory || values.customCategory.trim() === "")) return false;
      if (!values.openTime || values.openTime.trim() === "") return false;
      if (!values.closeTime || values.closeTime.trim() === "") return false;
      return true;
    }

    if (stepNum === 3) {
      const bank = values.bankDetails;
      if (!bank) return false;
      // ponytail: skip verification check for now, but keep field
      // if (!bank.isVerified) return false;
      if (!bank.bankName || bank.bankName.trim() === "") return false;
      if (validBanks.length > 0 && !validBanks.includes(bank.bankName)) return false;
      if (!bank.accountNumber || bank.accountNumber.trim().length < 9) return false;
      if (!bank.accountName || bank.accountName.trim() === "") return false;
      if (!bank.ifscCode || !IFSC_REGEX.test(bank.ifscCode)) return false;
      return true;
    }

    return true;
  };

  // Redirect guard to prevent accessing future steps out of order
  useEffect(() => {
    if (!draftLoaded || !sessionValid) return;

    // Check all steps prior to currentStepNum
    for (let i = 1; i < currentStepNum; i++) {
      if (!checkStepValidity(i)) {
        toast.error(`Please complete Step ${i} first.`);
        router.push(`/onboarding/${STEP_KEYS[i - 1]}${resId ? `?resId=${resId}` : ""}`);
        break;
      }
    }
  }, [currentStepNum, draftLoaded, sessionValid, router, resId]);

  const handleNextRoute = async () => {
    let fieldsToValidate: (keyof OnboardingData)[] = [];
    
    if (showFormOnMobile) {
      fieldsToValidate = (SUB_STEP_FIELDS[currentStepNum]?.[activeSubStep] || []) as (keyof OnboardingData)[];
    } else {
      const stepFields: Record<number, (keyof OnboardingData)[]> = {
        1: [
          "businessType",
          "legalEntityType",
          "legalBusinessName",
          "businessName",
          "contactPerson",
          "role",
          "email",
          "panNumber",
          "address"
        ],
        2: ["businessCategory", "supportedCategories", "customCategory", "openTime", "closeTime"],
        3: ["bankDetails"],
        4: [
          "gstin",
          "cin",
          "llpin",
          "udyamNumber",
          "tradeLicenseNumber",
          "regCertNumber",
          "fssaiNumber",
          "drugLicenseNumber"
        ],
        5: ["agree1", "agree2"],
      };
      fieldsToValidate = stepFields[currentStepNum] || [];
    }

    const maxSubSteps = SUB_STEP_COUNTS[currentStepNum] || 1;
    const isLastSubStep = !showFormOnMobile || activeSubStep === maxSubSteps;

    if (isLastSubStep) {
      if (currentStepNum === 3) {
        // ponytail: skip verification requirement
        /*
        const bank = methods.getValues("bankDetails");
        if (!bank || !bank.isVerified) {
          toast.error("Please verify your bank details before proceeding.");
          return;
        }
        */
      }
      if (!checkStepValidity(currentStepNum)) {
        toast.error("Please fill all required fields correctly.");
        return;
      }
    }

    if (showFormOnMobile) {
      if (activeSubStep < maxSubSteps) {
        router.push(`/onboarding/${STEP_KEYS[currentStepNum - 1]}?sub=${activeSubStep + 1}${resId ? `&resId=${resId}` : ""}`);
        return;
      }
    }

    const nextStepSlug = STEP_KEYS[currentStepNum];
    if (nextStepSlug) {
      router.push(`/onboarding/${nextStepSlug}${resId ? `?resId=${resId}` : ""}`);
    }
  };

  const handleBackRoute = () => {
    const prevStepSlug = STEP_KEYS[currentStepNum - 2];
    if (prevStepSlug) {
      router.push(`/onboarding/${prevStepSlug}${resId ? `?resId=${resId}` : ""}`);
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("vendorToken") || "";

      // Gather additional files stored in RHF state
      const logoFile = methods.getValues("logoFile" as any);
      const documentFile = methods.getValues("documentFile" as any);
      const storeFiles = methods.getValues("storeFiles" as any) || [];
      const existingStoreImages = methods.getValues("existingStoreImages" as any) || [];

      // Construct FormData for multipart upload
      const formData = new FormData();
      formData.append("token", token);
      formData.append("businessName", data.businessName);
      formData.append("contactPerson", data.contactPerson);
      formData.append("email", data.email);
      formData.append("address", JSON.stringify(data.address));
      formData.append("bankDetails", JSON.stringify(data.bankDetails));
      formData.append("supportedCategories", JSON.stringify(data.supportedCategories));
      formData.append("businessType", data.businessType);
      formData.append("legalEntityType", data.legalEntityType);
      formData.append("legalBusinessName", data.legalBusinessName);
      formData.append("businessCategory", data.businessCategory);
      if (data.gstin) formData.append("gstin", data.gstin);
      if (data.panNumber) formData.append("panNumber", data.panNumber);
      if (data.fssaiNumber) formData.append("fssaiNumber", data.fssaiNumber);
      if (data.role) formData.append("role", data.role);
      if (data.alternatePhone) formData.append("alternatePhone", data.alternatePhone);
      formData.append("agree1", String(data.agree1));
      formData.append("agree2", String(data.agree2));
      formData.append("existingStoreImages", JSON.stringify(existingStoreImages));

      if (logoFile) {
        formData.append("image", logoFile);
      }
      const profileImageFile = data.profileImage || methods.getValues("profileImage" as any);
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      if (documentFile) {
        formData.append("document", documentFile);
      }
      storeFiles.forEach((file: File) => {
        formData.append("storeImages", file);
      });

      const res = await axios.post(`${BACKEND_URL}/onboardVendor`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.token) {
        localStorage.setItem("vendorToken", res.data.token);
      }

      toast.success("Onboarding application submitted successfully!");
      localStorage.removeItem("vendorOnboardingDraft");
      setSubmittedSuccess(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit onboarding application.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">
        Verifying onboarding session...
      </div>
    );
  }



  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <header className="bg-white border-b border-zinc-100 px-6 sm:px-12 h-18 flex items-center justify-between sticky top-0 z-45 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/LOGO-png 3.svg" alt="Govigi" width={80} height={32} priority />
            <span className="text-xs text-zinc-400 border-l border-zinc-200 pl-2 font-semibold">Partner</span>
          </Link>
        </header>

        <main className="flex-1 max-w-2xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-3xl flex items-center justify-center shadow-sm">
            <CheckIcon className="w-10 h-10 text-green-600 stroke-[3]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-zinc-900">Application Submitted!</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Thank you for registering. Our compliance operations team is reviewing your documentation. We will notify you via email and SMS once your store setup is fully authorized.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-all active:scale-95 text-sm"
            >
              Go to Homepage
            </Link>
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm"
            >
              Edit Application
            </button>
          </div>
        </main>

        <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
          &copy; {currentYear} Govigi. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

        {/* Global Onboarding Header (Desktop Only) */}
        <header className="hidden lg:flex bg-white border-b border-zinc-100 px-6 sm:px-12 h-18 items-center sticky top-0 z-45 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/LOGO-png 3.svg" alt="Govigi" width={80} height={32} priority />
              <span className="text-xs text-zinc-400 border-l border-zinc-200 pl-2 font-semibold">Partner</span>
            </Link>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors bg-transparent border-none cursor-pointer focus:outline-none"
            >
              <QuestionMarkCircleIcon className="w-4.5 h-4.5 text-zinc-400" />
              <span>Help & Support</span>
            </button>
          </div>
        </header>

        {isAwaitingApproval && (
          <div className="bg-amber-50 border-b border-amber-200 py-3 px-6 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-2 z-50 animate-in fade-in duration-300">
            <ExclamationTriangleIcon className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>Your application is currently awaiting admin approval. You can edit your details and resubmit if needed.</span>
          </div>
        )}

        {/* Premium Mobile Header Card */}
        <div className="lg:hidden w-full">
          {!showFormOnMobile ? (
            <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white rounded-b-[32px] px-6 pt-7 pb-10 shadow-md relative overflow-hidden">
              {/* Decorative background ambient blobs */}
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/15 blur-lg pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => {
                    if (currentStepNum > 1) {
                      handleBackRoute();
                    } else {
                      router.push("/");
                    }
                  }}
                  className="p-1 -ml-1 text-white hover:text-green-100 transition-colors flex items-center justify-center rounded-full hover:bg-white/10 w-8 h-8"
                >
                  <ChevronLeftIcon className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-medium tracking-tight text-white">Get started, it takes only 10 minutes</h2>
                <p className="text-xs text-green-100/90 font-medium">Become a Govigi partner in 3 easy steps</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border-b border-zinc-200 px-6 py-4.5 flex items-center justify-between sticky top-0 z-45 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (activeSubStep > 1) {
                      router.push(`/onboarding/${STEP_KEYS[currentStepNum - 1]}?sub=${activeSubStep - 1}${resId ? `&resId=${resId}` : ""}`);
                    } else {
                      setShowFormOnMobile(false);
                      router.push(`/onboarding/${STEP_KEYS[currentStepNum - 1]}${resId ? `?resId=${resId}` : ""}`);
                    }
                  }}
                  className="p-1 -ml-1 text-zinc-800 hover:text-zinc-650 transition-colors flex items-center justify-center rounded-full hover:bg-zinc-50 w-8 h-8"
                >
                  <ChevronLeftIcon className="w-6 h-6 stroke-[2]" />
                </button>
                <h2 className="text-sm font-medium text-zinc-800">
                  {SUB_STEP_LABELS[currentStepNum]?.[activeSubStep] || "Partner Information"}
                </h2>
              </div>
              
              {/* Oval Stadium Progress Border starting from top middle */}
              <div className="relative flex items-center justify-center w-[80px] h-[34px] shrink-0">
                <svg className="absolute inset-0 w-full h-full">
                  {/* Background track filled with light gray */}
                  <path
                    d="M 40 1.5 L 63 1.5 A 15.5 15.5 0 0 1 63 32.5 L 17 32.5 A 15.5 15.5 0 0 1 17 1.5 L 40 1.5"
                    className="text-zinc-200 fill-zinc-50"
                    strokeWidth="1"
                    stroke="currentColor"
                  />
                  {/* Active progress track (thicker) */}
                  <path
                    d="M 40 1.5 L 63 1.5 A 15.5 15.5 0 0 1 63 32.5 L 17 32.5 A 15.5 15.5 0 0 1 17 1.5 L 40 1.5"
                    className="text-green-600 transition-all duration-500"
                    strokeWidth="2.5"
                    strokeDasharray={190}
                    strokeDashoffset={190 - (190 * activeSubStep) / (SUB_STEP_COUNTS[currentStepNum] || 1)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="relative z-10 text-[11px] font-black text-green-700">
                  {activeSubStep} of {SUB_STEP_COUNTS[currentStepNum] || 1}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Work Area */}
        <div className="w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start pb-28 flex-1">
          <div className={cn(
            "w-full lg:w-auto shrink-0 lg:sticky lg:top-24",
            showFormOnMobile ? "hidden lg:block" : "block"
          )}>
            <Sidebar
              currentStep={currentStepNum}
              showFormOnMobile={showFormOnMobile}
              onContinue={() => {
                setShowFormOnMobile(true);
                router.push(`/onboarding/${STEP_KEYS[currentStepNum - 1]}?sub=1${resId ? `&resId=${resId}` : ""}`);
              }}
            />
            {/* Documents required card on mobile */}
            {!showFormOnMobile && (
              <div 
                onClick={() => {
                  toast((t) => (
                    <div className="text-xs space-y-2 p-1">
                      <p className="font-extrabold text-zinc-800 text-[13px] border-b border-zinc-100 pb-1.5 mb-1.5 flex items-center gap-1.5">
                        <DocumentTextIcon className="w-4 h-4 text-green-600" />
                        Required Documents
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-zinc-600 font-medium">
                        <li>Business Registration Details (GSTIN / Trade License / FSSAI)</li>
                        <li>Owner Identity Proof (PAN Card & Aadhar Card details)</li>
                        <li>Active Business Bank Account (passbook/cancelled cheque copy)</li>
                        <li>Store Profile Images & Brand Logo</li>
                      </ul>
                    </div>
                  ), { duration: 5000, position: "bottom-center" });
                }}
                className="mt-6 p-4 bg-green-50/50 hover:bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-[0_4px_12px_rgba(34,197,94,0.02)] active:scale-[0.99] lg:hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <DocumentTextIcon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-zinc-700">Documents required for registration</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-green-600 stroke-[3]" />
              </div>
            )}
          </div>

          <div className={cn(
            "flex-1 w-full",
            showFormOnMobile ? "block" : "hidden lg:block"
          )}>
            {children}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <footer className={cn(
          "fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-4 px-6 sm:px-12 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]",
          showFormOnMobile ? "block" : "hidden lg:block"
        )}>
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left legal copyright (Desktop only) */}
            <div className="hidden lg:flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
              <span>&copy; {currentYear} Govigi. All rights reserved.</span>
              <div className="flex gap-4">
                <Link href="/terms-and-conditions" className="hover:text-zinc-900 transition-colors">
                  Terms
                </Link>
                <Link href="/vendor-privacy-policy" className="hover:text-zinc-900 transition-colors">
                  Privacy
                </Link>
              </div>
            </div>

            {/* Buttons container (Full-width on mobile) */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              {/* Back button (Desktop only, mobile uses header back chevron) */}
              {(currentStepNum > 1 || showFormOnMobile) && (
                <button
                  type="button"
                  onClick={() => {
                    if (showFormOnMobile) {
                      setShowFormOnMobile(false);
                    } else {
                      handleBackRoute();
                    }
                  }}
                  className="hidden lg:flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
                  Back
                </button>
              )}

              {(currentStepNum === 5 && (!showFormOnMobile || activeSubStep === 2)) ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="w-full lg:w-auto flex items-center justify-center gap-1.5 bg-green-800 hover:bg-green-900 text-white px-6 py-3.5 lg:py-2.5 rounded-xl lg:rounded-lg font-bold text-sm lg:text-xs transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? "Submitting Application..." : "Agree & Submit"}
                  <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextRoute}
                  className="w-full lg:w-auto flex items-center justify-center gap-1.5 bg-green-800 hover:bg-green-900 text-white px-6 py-3.5 lg:py-2.5 rounded-xl lg:rounded-lg font-bold text-sm lg:text-xs transition-all shadow-sm active:scale-[0.98]"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* Floating Help Button on Mobile */}
        {!showFormOnMobile && (
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 bg-[#1E293B] hover:bg-[#0F172A] text-white font-bold rounded-full py-3 px-5 shadow-lg flex items-center gap-1.5 active:scale-95 transition-all z-30 text-xs border border-slate-700"
          >
            <PhoneIcon className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Help</span>
          </button>
        )}

        {/* --- Help & Support Modal --- */}
        <Modal open={helpOpen} onOpenChange={setHelpOpen}>
          <Modal.Content className="max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 bg-white">
            <Modal.Header onClose={() => setHelpOpen(false)} className="border-b border-zinc-100 pb-4">
              <Modal.Title className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-600" />
                Help & Support
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="pt-5 pb-6 space-y-6">
              <div>
                <p className="text-sm text-zinc-500">
                  Need assistance with your partner onboarding? Explore our resources or get in touch with our dedicated team.
                </p>
              </div>

              {/* Direct Contact Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact Us</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href="mailto:support@govigi.com" className="flex flex-col items-start p-4 rounded-xl border border-zinc-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 mb-3">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-800">Email Support</span>
                    <span className="text-xs text-zinc-400 mt-0.5">support@govigi.com</span>
                  </a>

                  <a href="tel:+919876543210" className="flex flex-col items-start p-4 rounded-xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all group">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 mb-3">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-800">Phone Support</span>
                    <span className="text-xs text-zinc-400 mt-0.5">+91 9346928139</span>
                  </a>
                </div>
              </div>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      </div>
    </FormProvider>
  );
}

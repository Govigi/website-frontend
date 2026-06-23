"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingData } from "@/lib/validations/onboarding-schema";
import Link from "next/link";

import Step1Phone from "./Steps/Step1Phone";
import Step2BusinessInfo from "./Steps/Step2BusinessInfo";
import Step3OwnerDetails from "./Steps/Step3OwnerDetails";
import Sidebar from "../vendor-onboarding/Sidebar";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import Step4BusinessLocation from "./Steps/Step4BusinessLocation";

export default function VendorOnboardingStepper() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      businessType: "",
      legalEntityType: "",
      legalBusinessName: "",
      businessName: "",
      businessCategory: "",
      gstin: "",
      contactPerson: "",
      role: "",
      email: "",
      alternatePhone: "",
      panNumber: "",
      fssaiNumber: "",
      customCategory: "",
      supportedCategories: [],
      openTime: "09:00",
      closeTime: "21:00",
      address: {
        formattedAddress: "",
        components: {
          houseNumber: "",
          street: "",
          area: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        },
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      },
      bankDetails: {
        bankName: "",
        accountNumber: "",
        accountName: "",
        ifscCode: "",
      },
      agree1: false,
      agree2: false,
    },
  });

  const { handleSubmit, trigger } = methods;

  // Step Validation Logic
  const nextStep = async () => {
    const stepFields: Record<number, (keyof OnboardingData)[]> = {
      2: ["businessType", "legalEntityType", "legalBusinessName", "businessName"],
      3: ["contactPerson", "role", "email", "panNumber"],
      4: ["address"],
      7: ["bankDetails"],
      8: ["agree1", "agree2"]
    };

    const fieldsToValidate = stepFields[step];
    if (fieldsToValidate) {
      const isStepValid = await trigger(fieldsToValidate);
      if (!isStepValid) return; 
    }

    setStep((prev) => prev + 1);
  };

  const onSubmit = async (data: OnboardingData) => {
    setLoading(true);
    try {
      console.log("Submitting to Backend:", data);
      // await axios.post('/api/onboard', data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  // Inside VendorOnboardingStepper.tsx

return (
  <FormProvider {...methods}>
    <div className="w-full flex flex-col">
      
      {/* 
        1. MAIN CONTENT GRID 
        Added 'pb-28' (padding-bottom) so content isn't covered by the fixed bar 
      */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start pb-28">
        <Sidebar currentStep={step} />

        <div className="flex-1 w-full">
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 md:p-10 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && <Step1Phone onVerified={() => setStep(2)} />}
              {step === 2 && <Step2BusinessInfo />}
              {step === 3 && <Step3OwnerDetails />}
              {step === 4 && <Step4BusinessLocation />}
              {/* Steps 4-8 will render here */}
            </form>
          </div>
        </div>
      </div>

      {/* 
        2. INDUSTRY-STANDARD FIXED FOOTER BAR
        Using 'fixed bottom-0 left-0 right-0' with a light top-shadow 
      */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-4 px-6 sm:px-12 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex flex-col align-end items-end">
        <div className="max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Right Column: Navigation Actions */}
          {step > 1 && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors shadow-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
                Back
              </button>

              {step === 8 ? (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Submitting...
                  <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Save & Continue
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          )}
          
        </div>
      </footer>

    </div>
  </FormProvider>
);
}
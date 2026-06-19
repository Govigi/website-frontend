"use client";
import React from "react";
import { useParams, notFound } from "next/navigation";

// Import step components
import Step1BusinessProfile from "@/components/vendor-onboarding/Steps/Step1BusinessProfile";
import Step2StoreSetup from "@/components/vendor-onboarding/Steps/Step2StoreSetup";
import Step3BankDetails from "@/components/vendor-onboarding/Steps/Step3BankDetails";
import Step4Documents from "@/components/vendor-onboarding/Steps/Step4Documents";
import Step5Review from "@/components/vendor-onboarding/Steps/Step5Review";

export default function OnboardingStepRouter() {
  const params = useParams();
  const step = params.step as string;

  switch (step) {
    case "step1":
      return <Step1BusinessProfile />;
    case "step2":
      return <Step2StoreSetup />;
    case "step3":
      return <Step3BankDetails />;
    case "step4":
      return <Step4Documents />;
    case "step5":
      return <Step5Review />;
    default:
      notFound();
  }
}

import React, { Suspense } from "react";
import VendorOnboardingStepper from "../../components/vendor-onboarding/VendorOnboardingStepper";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "Partner with Us | Govigi",
    description: "Join the Govigi partner network and reach thousands of customers.",
};

export default function VendorOnboardingPage() {
    return (
        <>
            <Toaster position="top-center" toastOptions={{ style: { fontSize: "14px", fontWeight: 600 } }} />
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Loading...</div>}>
                <VendorOnboardingStepper />
            </Suspense>
        </>
    );
}

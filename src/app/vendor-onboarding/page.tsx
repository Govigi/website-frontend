import React from "react";
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
            <VendorOnboardingStepper />
        </>
    );
}

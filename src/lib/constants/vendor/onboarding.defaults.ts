// lib/constants/vendor/onboarding.defaults.ts

import { OnboardingData } from "@/lib/validations/onboarding-schema";

export const onboardingDefaults: OnboardingData = {
    businessType: "",
    legalEntityType: "",

    legalBusinessName: "",
    businessName: "",
    businessCategory: "",

    gstin: "",
    cin: "",
    llpin: "",
    udyamNumber: "",
    tradeLicenseNumber: "",
    regCertNumber: "",
    drugLicenseNumber: "",

    contactPerson: "",
    role: "",
    email: "",
    alternatePhone: "",
    panNumber: "",

    address: {
        formattedAddress: "",
        components: {
            houseNumber: "",
            street: "",
            area: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
        location: {
            type: "Point",
            coordinates: [0, 0],
        },
    },

    fssaiNumber: "",
    supportedCategories: [],
    customCategory: "",

    openTime: "09:00",
    closeTime: "21:00",

    bankDetails: {
        bankName: "",
        accountNumber: "",
        accountName: "",
        ifscCode: "",
    },

    agree1: false,
    agree2: false,
};
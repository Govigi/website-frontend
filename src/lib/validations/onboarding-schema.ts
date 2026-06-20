import { z } from "zod";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export const onboardingSchema = z.object({
    businessType: z.string().min(1, "Required"),
    legalEntityType: z.string().min(1, "Required"),
    legalBusinessName: z.string().min(3, "Required"),
    businessName: z.string().min(2, "Required"),
    businessCategory: z.string().min(1, "Required"),
    gstin: z.string().optional(),
    cin: z.string().optional(),
    llpin: z.string().optional(),
    udyamNumber: z.string().optional(),
    tradeLicenseNumber: z.string().optional(),
    regCertNumber: z.string().optional(),
    drugLicenseNumber: z.string().optional(),
    contactPerson: z.string().min(2, "Required"),
    role: z.string().min(1, "Required"),
    email: z.email("Invalid email"),
    alternatePhone: z.string().optional(),
    panNumber: z.string().regex(PAN_REGEX, "Invalid PAN"),

    address: z.object({
        formattedAddress: z.string().min(5, "Address required"),
        components: z.object({
            houseNumber: z.string(),
            street: z.string(),
            area: z.string(),
            city: z.string().min(1, "Required"),
            state: z.string().min(1, "Required"),
            postalCode: z.string().length(6, "Must be 6 digits"),
            country: z.string().min(1, "Required"),
        }),
        location: z.object({
            type: z.literal("Point"),
            coordinates: z.array(z.number()).length(2),
        }),
    }),

    fssaiNumber: z.string().optional(),
    supportedCategories: z.array(z.string()).min(1, "Select at least one"),
    customCategory: z.string().optional(),
    openTime: z.string().min(1, "Required"),
    closeTime: z.string().min(1, "Required"),

    bankDetails: z.object({
        bankName: z.string().min(1, "Required"),
        accountNumber: z.string().min(9, "Required"),
        accountName: z.string().min(1, "Required"),
        ifscCode: z.string().regex(IFSC_REGEX, "Invalid IFSC"),
    }),

    // Using boolean with refinement is safer for RHF types than literals
    agree1: z.boolean().refine((val) => val === true, "Must confirm"),
    agree2: z.boolean().refine((val) => val === true, "Must agree"),
});

// This is the type RHF will use
export type OnboardingData = z.infer<typeof onboardingSchema>;
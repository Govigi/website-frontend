import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 1. THE STYLING HELPER (Crucial for Tailwind)
 * Combines classes and merges Tailwind conflicts. 
 * Perfect for: className={cn("base-styles", error && "border-red-500")}
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * 2. CURRENCY FORMATTER
 * Formats numbers to Indian Rupee (INR)
 * Used in: Review step or payouts
 */
export const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * 3. PHONE NUMBER FORMATTER
 * Formats "9876543210" to "+91 98765-43210"
 */
export const formatPhoneNumber = (phone: string) => {
    const cleaned = ("" + phone).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{5})$/);
    if (match) {
        return `+${match[1]} ${match[2]}-${match[3]}`;
    }
    return phone;
};

/**
 * 4. ACCOUNT NUMBER MASKING
 * Formats "123456789012" to "********9012"
 * Used in: Review step for security
 */
export const maskAccountNumber = (accNo: string) => {
    if (!accNo) return "";
    const lastFour = accNo.slice(-4);
    return lastFour.padStart(accNo.length, "*");
};

/**
 * 5. FILE SIZE CHECKER
 * Ensures uploaded images/docs aren't too heavy
 */
export const validateFileSize = (file: File, maxMB: number = 5) => {
    const maxSize = maxMB * 1024 * 1024;
    return file.size <= maxSize;
};

/**
 * 6. DELAY (Sleep) helper
 * Useful for simulating loading states or waiting for animations
 */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
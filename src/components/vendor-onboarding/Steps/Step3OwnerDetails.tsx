"use client";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { 
  CameraIcon, 
  TrashIcon, 
  ArrowUpTrayIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import FloatingInput from "@/components/UI/FloatingInput";
import LivenessCaptureModal from "../LivenessCaptureModal"; // Adjust path if needed
import FloatingSelect from "@/components/UI/FloationSelect";

export default function Step3OwnerDetails() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);

  const role = watch("role");

  // Watch RHF values to display live previews
  const profileImage = watch("profileImage"); // Can be a File object or a URL string
  const alternatePhone = watch("alternatePhone");

  // Local state for image preview URL (used if the image is a File object)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof profileImage === "string" ? profileImage : null
  );

  // Safely intercept and uppercase PAN input without breaking RHF tracking
  const { onChange: onPanChange, ...panRegister } = register("panNumber");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profileImage", file, { shouldValidate: true });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeProfileImage = () => {
    setValue("profileImage", null, { shouldValidate: true });
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <h2 className="text-base font-semibold text-zinc-900">Owner / Representative Details</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Please provide information about the primary account administrator.</p>
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7 pt-2">
        
        {/* Full Name */}
        <FloatingInput
          label="Full Name *"
          error={errors.contactPerson?.message as string}
          {...register("contactPerson")}
        />

        {/* Role Designation Select */}
        <FloatingSelect
            label="Role / Designation *"
            error={errors.role?.message as string}
            value={role}
            {...register("role")}
            >
            <option value="">Select your role</option>
            <option value="Owner">Owner</option>
            <option value="Partner">Partner</option>
            <option value="Manager">Manager</option>
            <option value="Authorized Representative">
                Authorized Representative
            </option>
        </FloatingSelect>

        {/* Email Address */}
        <FloatingInput
          type="email"
          label="Email Address *"
          error={errors.email?.message as string}
          {...register("email")}
        />

        {/* Alternate Phone */}
        <FloatingInput
          type="tel"
          maxLength={10}
          label="Alternate Phone Number (Optional)"
          error={errors.alternatePhone?.message as string}
          {...register("alternatePhone")}
          onChange={(e) => setValue("alternatePhone", e.target.value.replace(/\D/g, ""))}
        />

        {/* PAN Number */}
        <Controller
            name="panNumber"
            render={({ field }) => (
                <FloatingInput
                label="PAN Number *"
                maxLength={10}
                error={errors.panNumber?.message as string}
                value={field.value}
                onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                }
                />
            )}
        />

        {/* 3. Reusable Avatar/Profile Upload Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Profile Photo *</label>
          <div className="flex items-center gap-4 border border-zinc-200 p-3 rounded-md shadow-sm bg-white">
            
            {/* Live Preview Box */}
            <div className="h-14 w-14 rounded-md bg-zinc-50 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-zinc-400">No Image</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsLivenessModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded-md text-xs font-semibold hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <CameraIcon className="w-4 h-4 text-zinc-500" />
                Verify & Capture
              </button>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded-md text-xs font-semibold hover:bg-zinc-50 transition-colors">
                <ArrowUpTrayIcon className="w-4 h-4 text-zinc-500" />
                Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 rounded-md text-xs font-semibold transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {errors.profileImage && (
            <p className="text-xs text-red-650 mt-1.5 font-normal ml-1">
              {errors.profileImage.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Modern minimal callout */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-medium text-zinc-900">Regulatory Compliance</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
            Identity verification is mandatory under government guidelines for partner merchant onboarding.
          </p>
        </div>
      </div>

      {/* webcam Modal (reused from your project) */}
      <LivenessCaptureModal
        isOpen={isLivenessModalOpen}
        onClose={() => setIsLivenessModalOpen(false)}
        onCapture={(file, previewUrl) => {
          setValue("profileImage", file, { shouldValidate: true });
          setPreviewUrl(previewUrl);
          setIsLivenessModalOpen(false);
        }}
      />
    </div>
  );
}

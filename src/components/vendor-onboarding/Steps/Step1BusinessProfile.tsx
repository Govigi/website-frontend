"use client";
import React, { useState } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { 
  BuildingStorefrontIcon, 
  UserIcon, 
  MapPinIcon, 
  CameraIcon, 
  TrashIcon, 
  ArrowUpTrayIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import FloatingInput from "@/components/UI/FloatingInput";
import FloatingSelect from "@/components/UI/FloationSelect";
import MapPicker from "../MapPicker";
import LivenessCaptureModal from "../LivenessCaptureModal";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function Step1BusinessProfile() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const searchParams = useSearchParams();
  const subParam = searchParams.get("sub");
  const activeSubStep = subParam ? parseInt(subParam, 10) : 1;
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);

  // Watch fields for rendering logic
  const role = watch("role");
  const profileImage = watch("profileImage");
  const formattedAddress = watch("address.formattedAddress");
  const coordinates = watch("address.location.coordinates");

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof profileImage === "string" ? profileImage : null
  );

  const initialLocation = 
    coordinates && coordinates[1] && coordinates[0]
      ? { lat: coordinates[1], lng: coordinates[0] }
      : undefined;

  const handleMapConfirm = (data: any) => {
    setValue("address.formattedAddress", data.formattedAddress, { shouldValidate: true });
    setValue("address.location", data.location, { shouldValidate: true });

    if (data.components) {
      Object.entries(data.components).forEach(([key, value]) => {
        setValue(`address.components.${key}` as any, value || "", { shouldValidate: true });
      });
    }
  };

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

  // Safe-extract nested errors using RHF get helper
  const addressError = get(errors, "address.formattedAddress");
  const houseNumberError = get(errors, "address.components.houseNumber");
  const streetError = get(errors, "address.components.street");
  const areaError = get(errors, "address.components.area");
  const cityError = get(errors, "address.components.city");
  const stateError = get(errors, "address.components.state");
  const postalCodeError = get(errors, "address.components.postalCode");

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* SECTION 1: BUSINESS PROFILE */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 1 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-5 h-5 text-green-600" />
            1. Business Information
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Provide your official commercial details and legal entity structure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FloatingSelect
            label="Business Type *"
            error={errors.businessType?.message as string}
            value={watch("businessType")}
            {...register("businessType")}
          >
            <option value="Retailer">Retailer</option>
            <option value="Distributor">Distributor</option>
            <option value="Manufacturer">Manufacturer</option>
          </FloatingSelect>

          <FloatingSelect
            label="Legal Entity Type *"
            error={errors.legalEntityType?.message as string}
            value={watch("legalEntityType")}
            {...register("legalEntityType")}
          >
            <option value="Individual">Individual</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership Firm">Partnership Firm</option>
            <option value="LLP">LLP</option>
            <option value="Private Limited Company">Private Limited Company</option>
            <option value="One Person Company (OPC)">One Person Company (OPC)</option>
            <option value="Public Limited Company">Public Limited Company</option>
            <option value="Trust / NGO">Trust / NGO</option>
          </FloatingSelect>

          <FloatingInput
            label="Legal Business Name *"
            error={errors.legalBusinessName?.message as string}
            {...register("legalBusinessName")}
          />

          <FloatingInput
            label="Brand / Store Name *"
            error={errors.businessName?.message as string}
            {...register("businessName")}
          />
        </div>
      </div>

      {/* SECTION 2: REPRESENTATIVE DETAILS */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 2 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-green-600" />
            2. Owner / Representative Details
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Provide information about the primary account administrator.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FloatingInput
            label="Full Name *"
            error={errors.contactPerson?.message as string}
            {...register("contactPerson")}
          />

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
            <option value="Authorized Representative">Authorized Representative</option>
          </FloatingSelect>

          <FloatingInput
            type="email"
            label="Email Address *"
            error={errors.email?.message as string}
            {...register("email")}
          />

          <FloatingInput
            type="tel"
            maxLength={10}
            label="Alternate Phone Number (Optional)"
            error={errors.alternatePhone?.message as string}
            {...register("alternatePhone")}
            onChange={(e) => setValue("alternatePhone", e.target.value.replace(/\D/g, ""))}
          />

          <Controller
            name="panNumber"
            render={({ field }) => (
              <FloatingInput
                label="PAN Number *"
                maxLength={10}
                error={errors.panNumber?.message as string}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            )}
          />

          {/* Profile Photo Capture */}
          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-xs font-semibold text-zinc-600">Profile Photo *</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-zinc-200 p-4 rounded-xl shadow-sm bg-zinc-50/30">
              <div className="h-16 w-16 rounded-xl bg-white border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-400 uppercase text-center px-1">No Image</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLivenessModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-zinc-300 rounded-lg text-xs font-bold bg-white text-zinc-700 hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                >
                  <CameraIcon className="w-4 h-4 text-green-600" />
                  Verify & Capture
                </button>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 border border-zinc-300 rounded-lg text-xs font-bold bg-white text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
                  <ArrowUpTrayIcon className="w-4 h-4 text-zinc-500" />
                  Upload Photo
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {errors.profileImage && (
              <p className="text-xs text-red-600 mt-1 font-semibold ml-1">{errors.profileImage.message as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: STORE PICKUP LOCATION */}
      <div className={cn(
        "bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6",
        "lg:block",
        activeSubStep === 3 ? "block" : "hidden"
      )}>
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-green-600" />
            3. Store Pickup Location
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Verify your exact store coordinates to streamline logistics.</p>
        </div>

        <div className="space-y-4">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 relative shadow-sm z-10">
            <MapPicker
              inline={true}
              onConfirm={handleMapConfirm}
              apiKey={GOOGLE_MAPS_API_KEY}
              initialLocation={initialLocation}
              initialAddress={formattedAddress || undefined}
            />
          </div>
          {addressError && (
            <p className="text-xs text-red-650 font-semibold ml-1">
              {addressError.message as string}
            </p>
          )}
        </div>

        {formattedAddress ? (
          <div className="space-y-6 pt-2 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <FloatingInput
                label="Building / House No. *"
                error={houseNumberError?.message as string}
                {...register("address.components.houseNumber")}
              />

              <FloatingInput
                label="Street / Road / Landmark *"
                error={streetError?.message as string}
                {...register("address.components.street")}
              />

              <FloatingInput
                label="Area / Locality *"
                error={areaError?.message as string}
                {...register("address.components.area")}
              />

              <FloatingInput
                label="City *"
                error={cityError?.message as string}
                {...register("address.components.city")}
              />

              <FloatingInput
                label="State *"
                error={stateError?.message as string}
                {...register("address.components.state")}
              />

              <FloatingInput
                label="PIN Code *"
                maxLength={6}
                error={postalCodeError?.message as string}
                {...register("address.components.postalCode")}
                onChange={(e) => setValue("address.components.postalCode", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-xs font-semibold text-zinc-400">Place a pin on the map to confirm your delivery address details.</p>
          </div>
        )}
      </div>

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

function ErrorText({ message }: { message: string }) {
  return <p className="text-xs text-red-600 mt-1 font-semibold ml-1">{message}</p>;
}

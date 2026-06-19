"use client";
import React from "react";
import { useFormContext, get } from "react-hook-form"; // 1. Import 'get' from react-hook-form [2]
import { MapPinIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import FloatingInput from "@/components/UI/FloatingInput";
import MapPicker from "../MapPicker"; // Adjust relative import path as needed
import { cn } from "@/lib/utils/utils";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function Step4BusinessLocation() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const formattedAddress = watch("address.formattedAddress");
  const coordinates = watch("address.location.coordinates");

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

  // 2. Safe-extract deeply nested errors using 'get' [2]
  const addressError = get(errors, "address.formattedAddress");
  const houseNumberError = get(errors, "address.components.houseNumber");
  const streetError = get(errors, "address.components.street");
  const areaError = get(errors, "address.components.area");
  const cityError = get(errors, "address.components.city");
  const stateError = get(errors, "address.components.state");
  const postalCodeError = get(errors, "address.components.postalCode");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <h2 className="text-base font-semibold text-zinc-900">Store Pickup Location</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Pinpoint your shop coordinates so delivery executives can locate your store.</p>
      </div>

      {/* Map Picker Box */}
      <div className="space-y-4">
        <div className="w-full h-[320px] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 relative shadow-sm">
          <MapPicker
            inline={true}
            onConfirm={handleMapConfirm}
            apiKey={GOOGLE_MAPS_API_KEY}
            initialLocation={initialLocation}
            initialAddress={formattedAddress || undefined}
          />
        </div>
        {addressError && (
          <p className="text-xs text-red-650 font-medium ml-1">
            {addressError.message as string}
          </p>
        )}
      </div>

      {/* Detailed Address Form Fields */}
      {formattedAddress ? (
        <div className="space-y-6 pt-2 animate-in slide-in-from-top-4 duration-300">
          
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <MapPinIcon className="w-4 h-4 text-green-600" />
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Confirm Address Fields</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
            {/* Building / House No. */}
            <FloatingInput
              label="Building / House No. *"
              error={houseNumberError?.message as string}
              {...register("address.components.houseNumber")}
            />

            {/* Street / Road */}
            <FloatingInput
              label="Street / Road / Landmark *"
              error={streetError?.message as string}
              {...register("address.components.street")}
            />

            {/* Area / Locality */}
            <FloatingInput
              label="Area / Locality *"
              error={areaError?.message as string}
              {...register("address.components.area")}
            />

            {/* City */}
            <FloatingInput
              label="City *"
              error={cityError?.message as string}
              {...register("address.components.city")}
            />

            {/* State */}
            <FloatingInput
              label="State *"
              error={stateError?.message as string}
              {...register("address.components.state")}
            />

            {/* PIN Code */}
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
        <div className="text-center py-6 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
          <p className="text-xs font-medium text-zinc-400">Place a pin on the map to confirm your delivery address details.</p>
        </div>
      )}

      {/* Standard security Callout */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-medium text-zinc-900">Geofence and Coordinates</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
            This geofenced pickup location is matched against delivery logistics APIs to calculate precise order routing.
          </p>
        </div>
      </div>
    </div>
  );
}

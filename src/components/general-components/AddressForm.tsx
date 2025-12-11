"use client";

import { useState, useEffect } from "react";

export interface AddressData {
  name?: string;
  contact?: string;
  email?: string;
  city?: string;
  landmark?: string;
  state?: string;
  pincode?: string;
}

interface AddressFormProps {
  mode: "add" | "edit";
  initialData?: AddressData;
  onSubmit: (data: AddressData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddressForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressData>(
    initialData || {
      name: "",
      contact: "",
      email: "",
      city: "",
      landmark: "",
      state: "",
      pincode: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    field: keyof AddressData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const fields = [
    { field: "name" as const, label: "Full Name", required: true },
    { field: "contact" as const, label: "Phone Number", required: true },
    { field: "email" as const, label: "Email Address", required: false },
    { field: "city" as const, label: "City", required: true },
    { field: "state" as const, label: "State", required: true },
    { field: "pincode" as const, label: "Pincode", required: true },
  ];

  return (
    <div className="p-4 space-y-4">
      {fields.map(({ field, label, required }) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            placeholder={label}
            value={formData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      ))}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
          Landmark/Additional Details <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Enter landmark, building name, house number, or any additional details..."
          value={formData.landmark || ""}
          onChange={(e) => handleInputChange("landmark", e.target.value)}
          disabled={isLoading}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          className="flex-1 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-md transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>
            {mode === "add" ? "Save Address" : "Save Changes"}
          </span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../libs/context/AuthContext";
import { PencilIcon, TrashIcon, MapPinIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../libs/context/ToastContext";
import { config } from "@/libs/utils/config";
import { useRouter } from "next/navigation";

export default function SavedAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    name: "",
    contact: "",
    email: "",
    city: "",
    landmark: "",
    state: "",
    pincode: "",
  });

  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [editAddress, setEditAddress] = useState<{
    name?: string;
    contact?: string;
    email?: string;
    city?: string;
    landmark?: string;
    state?: string;
    pincode?: string;
  }>({});
  const backendApi = config.backend_url;
  const router = useRouter();
  const {
    updateAddress,
    isAuthenticated,
    EditAddress_context,
    logout,
    deleteAddress_context,
  } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const parsedToken = JSON.parse(token);
        const res = await axios.post(`${backendApi}/getAddress`, { token: parsedToken });
        setAddresses(res.data?.addresses || []);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      setLoading(false);
      if (err.response?.status === 500) logout();
    }
  };

  const handleAddNewAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.contact ||
      !newAddress.landmark ||
      !newAddress.pincode
    ) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    try {
      const saved = await updateAddress(newAddress);
      if (!saved._id) {
        await fetchAddresses();
      } else {
        setAddresses((prev) => [...prev, saved]);
        setSelectedAddressId(saved._id);
      }

      if (addresses.length >= 3) setShowNewAddressForm(false);

      setNewAddress({
        name: "",
        contact: "",
        email: "",
        city: "",
        landmark: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      console.error("Failed to save address", err);
    }
  };

  const handleEditAddress = async (index, updatedAddress) => {
    const data = await EditAddress_context(index, updatedAddress);
    if (data?.addresses) {
      setAddresses(data.addresses);
      setEditAddressIndex(null);
      setEditAddress({});
    }
  };

  const handleDeleteAddress = async (index) => {
    const updated = await deleteAddress_context(index);
    if (updated) {
      setAddresses(updated);
    }
  };

  return (
    <section className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Loading your addresses...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && addresses.length === 0 && !showNewAddressForm && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-md p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Yet</h2>
            <p className="text-gray-600 mb-8">Add your first delivery address to get started with orders</p>
            <button
              onClick={() => setShowNewAddressForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        )}

        {/* Addresses Grid */}
        {!loading && addresses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses
              .slice()
              .reverse()
              .map((addr, i) => {
                const originalIndex = addresses.length - 1 - i;
                const isEditing = editAddressIndex === originalIndex;
                const isSelected = selectedAddressId === addr._id;

                return (
                  <div
                    key={addr._id}
                    className={`border rounded-md overflow-hidden transition-all ${
                      isSelected
                        ? "border-green-400 bg-green-50 shadow-lg"
                        : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Header with Name and Selection Indicator */}
                    <div className={`px-5 py-4 border-b ${
                      isSelected ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPinIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            isSelected ? "text-green-600" : "text-gray-500"
                          }`} />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{addr.name}</h3>
                            <p className="text-xs text-gray-600 mt-0.5">{addr.city}, {addr.state}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-200 rounded-full text-green-700 text-xs font-semibold flex-shrink-0">
                            <CheckCircleIcon className="w-4 h-4" />
                            Selected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          {[
                            { field: "name", label: "Full Name" },
                            { field: "contact", label: "Phone Number" },
                            { field: "email", label: "Email" },
                            { field: "city", label: "City" },
                            { field: "state", label: "State" },
                            { field: "pincode", label: "Pincode" },
                          ].map(({ field, label }) => (
                            <div key={field}>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                {label}
                              </label>
                              <input
                                type="text"
                                value={editAddress[field] || ""}
                                onChange={(e) =>
                                  setEditAddress({
                                    ...editAddress,
                                    [field]: e.target.value,
                                  })
                                }
                                placeholder={label}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              />
                            </div>
                          ))}

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                              Landmark/Details
                            </label>
                            <textarea
                              value={editAddress.landmark || ""}
                              onChange={(e) =>
                                setEditAddress({
                                  ...editAddress,
                                  landmark: e.target.value,
                                })
                              }
                              placeholder="Building name, house number, nearby landmark..."
                              rows={2}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium text-xs rounded-md hover:bg-gray-200 transition-colors active:scale-95"
                              onClick={() => {
                                setEditAddressIndex(null);
                                setEditAddress({});
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium text-xs rounded-md transition-colors active:scale-95"
                              onClick={() =>
                                handleEditAddress(originalIndex, editAddress)
                              }
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            setSelectedAddressId((prevId) =>
                              prevId === addr._id ? null : addr._id
                            )
                          }
                          className="space-y-3 cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-0.5 uppercase tracking-wide">Contact</p>
                            <p className="text-sm text-gray-900 font-medium">{addr.contact}</p>
                          </div>

                          {addr.email && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-0.5 uppercase tracking-wide">Email</p>
                              <p className="text-sm text-gray-900">{addr.email}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-0.5 uppercase tracking-wide">Location</p>
                            <p className="text-sm text-gray-900">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                          </div>

                          {addr.landmark && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-0.5 uppercase tracking-wide">Landmark</p>
                              <p className="text-sm text-gray-700">{addr.landmark}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer with Action Buttons */}
                    {!isEditing && (
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-medium transition-colors active:scale-95"
                          onClick={() => {
                            setEditAddressIndex(originalIndex);
                            setEditAddress({ ...addr });
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-colors active:scale-95"
                          onClick={() => handleDeleteAddress(originalIndex)}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Add New Address Card - Only Show if Less Than 5 */}
            {!showNewAddressForm && addresses.length < 5 && (
              <div
                onClick={() => setShowNewAddressForm(true)}
                className="border-2 border-dashed border-green-300 rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <PlusIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">Add New Address</p>
                <p className="text-xs text-gray-600 mt-1.5">{5 - addresses.length} slot{5 - addresses.length === 1 ? "" : "s"} available</p>
              </div>
            )}
          </div>
        )}

        {/* New Address Form Modal - Below Addresses */}
        {showNewAddressForm && (
          <div className="border border-green-200 rounded-md p-6 bg-white shadow-md mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Address</h2>
                <p className="text-xs text-gray-600">{addresses.length} of 5 addresses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { field: "name", label: "Full Name", required: true },
                { field: "contact", label: "Phone Number", required: true },
                { field: "email", label: "Email Address", required: false },
                { field: "city", label: "City", required: true },
                { field: "state", label: "State", required: true },
                { field: "pincode", label: "Pincode", required: true },
              ].map(({ field, label, required }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder={label}
                    value={newAddress[field]}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, [field]: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Landmark/Additional Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter landmark, building name, house number, or any additional details..."
                  value={newAddress.landmark}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, landmark: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-50 transition-colors active:scale-95"
                onClick={() => {
                  setShowNewAddressForm(false);
                  setNewAddress({
                    name: "",
                    contact: "",
                    email: "",
                    city: "",
                    landmark: "",
                    state: "",
                    pincode: "",
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-md transition-colors active:scale-95"
                onClick={handleAddNewAddress}
              >
                Save Address
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

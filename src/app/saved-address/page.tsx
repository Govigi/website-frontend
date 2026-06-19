"use client";

import { useState, useEffect, JSX } from "react";
import axios from "axios";
import { useAuth } from "../../lib/context/AuthContext";
import { PencilIcon, TrashIcon, MapPinIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../lib/context/ToastContext";
import { config } from "@/lib/utils/config";
import { useRouter } from "next/navigation";
import { useGlobalBottomPanel } from "@/components/core/BottomPanel";
import { AddressForm, AddressData } from "@/components/general-components/AddressForm";

export default function SavedAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const { openPanel: globalOpenPanel, closePanel: globalClosePanel } = useGlobalBottomPanel();
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

  const closePanel = () => {
    globalClosePanel();
    setTimeout(() => {
      setEditAddressIndex(null);
      setNewAddress({
        name: "",
        contact: "",
        email: "",
        city: "",
        landmark: "",
        state: "",
        pincode: "",
      });
      setEditAddress({});
    }, 300);
  };

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

  const handleAddNewAddress = async (data: AddressData) => {

    if (!data.name || !data.contact || !data.landmark || !data.pincode) {
      showToast("Please fill in all required fields.", "warn");
      return;
    }

    try {
      const saved = await updateAddress(data);

      if (!saved._id) {
        await fetchAddresses();
      } else {
        setAddresses((prev) => [...prev, saved]);
        setSelectedAddressId(saved._id);
      }

      closePanel();
    } catch (err) {
    }
  };


  const handleEditAddress = async (index, updatedAddress) => {
    const data = await EditAddress_context(index, updatedAddress);
    if (data?.addresses) {
      setAddresses(data.addresses);
      setEditAddressIndex(null);
      setEditAddress({});
      closePanel();
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
        {!loading && (
          <div className="mb-6 pb-6 border-b border-gray-200 text-left">
            <button
              onClick={() => {
                setEditAddressIndex(null);
                setNewAddress({
                  name: "",
                  contact: "",
                  email: "",
                  city: "",
                  landmark: "",
                  state: "",
                  pincode: "",
                });
                setEditAddress({});
                globalOpenPanel(
                  "Add New Address",
                  <AddressForm
                    mode="add"
                    initialData={newAddress}
                    onSubmit={handleAddNewAddress}
                    onCancel={closePanel}
                  />
                );
              }}
              className="text-green-600 hover:text-green-700 text-sm font-semibold"
            >
              + Add New Address
            </button>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Loading your addresses...</p>
            </div>
          </div>
        )}

        {!loading && addresses.length === 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-md p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Yet</h2>
            <p className="text-gray-600 mb-8">Add your first delivery address to get started with orders</p>
            <button
              onClick={() => {
                setEditAddressIndex(null);
                setNewAddress({
                  name: "",
                  contact: "",
                  email: "",
                  city: "",
                  landmark: "",
                  state: "",
                  pincode: "",
                });
                setEditAddress({});
                globalOpenPanel(
                  "Add New Address",
                  <AddressForm
                    mode="add"
                    initialData={newAddress}
                    onSubmit={handleAddNewAddress}
                    onCancel={closePanel}
                  />
                );
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition-colors active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        )}

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
                    className={`border rounded-md overflow-hidden transition-all ${isSelected
                      ? "border-green-400 bg-green-50 shadow-lg"
                      : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                      }`}
                  >
                    <div className={`px-5 py-4 border-b ${isSelected ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPinIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? "text-green-600" : "text-gray-500"
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

                    <div className="px-5 py-4">
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
                    </div>

                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-medium transition-colors active:scale-95"
                        onClick={() => {
                          setEditAddressIndex(originalIndex);
                          setEditAddress({ ...addr });
                          globalOpenPanel(
                            "Edit Address",
                            <AddressForm
                              mode="edit"
                              initialData={addr}
                              onSubmit={(data) => handleEditAddress(originalIndex, data)}
                              onCancel={closePanel}
                            />,
                            { maxHeight: "90vh" }
                          );
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
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

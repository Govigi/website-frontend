"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../libs/context/AuthContext";
import { Pencil } from "lucide-react";
import { useToast } from "../../libs/context/ToastContext";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/core/Cart/CartContext";
import { config } from "@/lib/utils/config";
import { getAuthHeaders, normalizeAddresses } from "@/lib/utils/address";

import CartPage from "../cart/page";

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // Initialize as null for no selection
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    landmark: "",
    state: "",
    pincode: "",
  });
  // Use cartItems from the useCart hook directly, no need to load from localStorage here again
  const { cartItems, clearCart } = useCart(); // Get cartItems from the CartContext
  const router = useRouter();

  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [showOrderPlaced, setShowOrderPlaced] = useState(false);
  const [editAddress, setEditAddress] = useState({});
  const backendApi = config.backend_url;
  const { updateAddress, isAuthenticated, EditAddress_context, logout } =
    useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, [isAuthenticated]); // Depend on isAuthenticated to refetch if auth state changes

  const fetchAddresses = async () => {
    try {
      if (isAuthenticated) {
        const res = await axios.get(`${backendApi}/getAddress`, {
          headers: getAuthHeaders(),
        });
        const fetchedAddresses = normalizeAddresses(res.data?.addresses || res.data?.data || []);
        setAddresses(fetchedAddresses);
        // Automatically select the first address if available and none is selected
        if (fetchedAddresses.length > 0 && !selectedAddressId) {
          setSelectedAddressId(fetchedAddresses[0]);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 500) {
        logout(); // Log out if token is invalid or server error
      }
      console.error("Failed to fetch addresses", err);
      showToast("Failed to load addresses.", "error");
    }
  };

  const handleAddNewAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.city || // Added city and state as required
      !newAddress.state ||
      !newAddress.pincode
    ) {
      showToast(
        "Please fill in all required fields (Name, Phone, City, State, Pincode).",
        "warning",
      );
      return;
    }

    try {
      // Assuming updateAddress handles adding new address if _id is not present
      const saved = await updateAddress(newAddress);
      if (saved && saved._id) {
        setAddresses((prev) => [...prev, saved]);
        setSelectedAddressId(saved); // Select the newly added address
        showToast("Address added successfully!", "success");
      } else {
        // If updateAddress doesn't return the new address with _id, refetch
        await fetchAddresses();
        showToast("Address added successfully!", "success");
      }

      // Reset form and hide it
      setShowNewAddressForm(false);
      setNewAddress({
        name: "",
        phone: "",
        email: "",
        city: "",
        landmark: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      console.error("Failed to save address", err);
      showToast("Failed to add address.", "error");
    }
  };

  const handleEditAddress = async (originalAddr, updatedAddress) => {
    try {
      // Assuming EditAddress_context takes the original address object and the updated fields
      // and returns the new list of addresses or an indicator of success
      const data = await EditAddress_context(originalAddr._id, updatedAddress); // Pass ID and updated data
      if (data && data.addresses) {
        setAddresses(data.addresses);
      } else if (data && data.data) {
        setAddresses((prev) =>
          prev.map((addr) => (addr._id === originalAddr._id ? data.data : addr)),
        );
      }

      if (data && (data.addresses || data.data)) {
        // If the edited address was selected, keep it selected (update its details)
        if (selectedAddressId && selectedAddressId._id === originalAddr._id) {
          setSelectedAddressId(data.data || updatedAddress); // Update selected address state
        }
        showToast("Address updated successfully!", "success");
      } else {
        showToast("Failed to update address.", "error");
      }
      setEditAddressIndex(null);
      setEditAddress({});
    } catch (error) {
      console.error("Failed to edit address", error);
      showToast("Failed to update address.", "error");
    }
  };

  const handleProceedToPayment = async () => {
    const selectedAddress = addresses.find(
      (a) => a._id === selectedAddressId?._id,
    );

    if (!selectedAddress) {
      showToast("Please select a valid delivery address.", "warning");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty. Please add items to proceed.", "warning");
      return;
    }
    console.log("Cart items :", cartItems);

    const orderPayload = {
      phone: selectedAddress?.contact ?? "",
      addressId: selectedAddress?._id,
      name: selectedAddress?.name ?? "",
      email: selectedAddress?.email ?? "",
      businessType: selectedAddress?.businessType ?? "",
      address: {
        // Ensure fullAddress structure is correctly mapped
        city: selectedAddress?.city,
        landmark: selectedAddress?.landmark,
        state: selectedAddress?.state,
        pincode: selectedAddress?.pincode,
        fullAddress: `${selectedAddress?.landmark}, ${selectedAddress?.city}, ${selectedAddress?.state} - ${selectedAddress?.pincode}`, // Example of combining
      },
      items: cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        quantityKg: item.quantity,
        image: item.image?.url ?? "",
        price: item?.price ?? "0",
      })),
      totalAmount: cartItems.reduce(
        (total, item) =>
          total + item.quantity * (parseFloat(item.pricePerKg) || 0),
        0,
      ),
    };

    try {
      const res = await fetch(`${config.backend_url}/placeCustomerOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("cart"); // Clear cart after successful order
        // setCartItems([]); // No need to update local state here if useCart handles it
        setShowOrderPlaced(true);
        setTimeout(() => {
          setShowOrderPlaced(false);
          router.push("/ordershistory");
        }, 2500);
        // showToast("Order placed successfully!", "success");
        clearCart();
      } else {
        showToast(data.message || "Order creation failed", "error");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      showToast("Something went wrong while placing the order.", "error");
    }
  };

  return (
    <section className="max-w-7xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address Selection & New Address Form */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Select Delivery Address
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {addresses
              .slice()
              .reverse() // Display most recent addresses first
              .map((addr, i) => {
                const originalIndex = addresses.length - 1 - i; // Get original index for editing
                const isEditing = editAddressIndex === originalIndex;

                return (
                  <div
                    key={addr._id}
                    className={`border rounded-xl p-5 shadow-sm bg-white relative overflow-hidden group transition-all duration-300 ${selectedAddressId?._id === addr._id
                      ? "ring-2 ring-green-500 border-green-500"
                      : "hover:shadow-md border-gray-200"
                      } ${isEditing ? "h-auto" : "max-h-[200px] overflow-hidden" // Adjust max-height for non-editing state
                      } transition-all duration-300 ease-in-out`}
                  >
                    {/* Edit Button */}
                    <button
                      className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 text-sm text-blue-600 hover:text-blue-800 transition-opacity"
                      onClick={() => {
                        setEditAddressIndex(originalIndex);
                        setEditAddress({ ...addr }); // Populate edit form with current address data
                      }}
                    >
                      <Pencil className="w-4 h-4 cursor-pointer text-green-700" />
                    </button>

                    {/* Selected Indicator */}
                    {selectedAddressId?._id === addr._id && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Selected
                      </span>
                    )}

                    {/* Address Display or Edit Form */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editAddress.name || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              name: e.target.value,
                            })
                          }
                          placeholder="Name"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="text"
                          value={editAddress.contact || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              contact: e.target.value,
                            })
                          }
                          placeholder="Phone"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="email"
                          value={editAddress.email || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              email: e.target.value,
                            })
                          }
                          placeholder="Email"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="text"
                          value={editAddress.city || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              city: e.target.value,
                            })
                          }
                          placeholder="City"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="text"
                          value={editAddress.landmark || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              landmark: e.target.value,
                            })
                          }
                          placeholder="Landmark (Optional)"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="text"
                          value={editAddress.state || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              state: e.target.value,
                            })
                          }
                          placeholder="State"
                          className="w-full border rounded border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <input
                          type="text"
                          value={editAddress.pincode || ""}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              pincode: e.target.value,
                            })
                          }
                          placeholder="Pincode"
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            className="px-3 py-1 bg-gray-200 cursor-pointer hover:bg-gray-300 rounded text-sm transition-colors"
                            onClick={() => {
                              setEditAddressIndex(null);
                              setEditAddress({});
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                            onClick={() => {
                              handleEditAddress(addr, editAddress); // Pass original addr and edited data
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setSelectedAddressId(addr)} // Select the entire address object
                        className="space-y-1 cursor-pointer"
                      >
                        <h3 className="font-semibold text-lg text-gray-800">
                          {addr.name}
                        </h3>
                        <p className="text-sm text-gray-500">{addr.email}</p>
                        <p className="text-sm text-gray-700">{addr.contact}</p>
                        <p className="text-sm text-gray-700">
                          {addr.landmark ? `${addr.landmark}, ` : ""}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Add New Address Button */}
            {!showNewAddressForm &&
              addresses.length < 3 && ( // Limit to 3 addresses if needed, or remove condition
                <div
                  onClick={() => setShowNewAddressForm(true)}
                  className="cursor-pointer border-2 border-dashed rounded-xl p-5 flex items-center justify-center text-center text-green-600 hover:bg-green-50 hover:border-green-400 max-h-[160px] overflow-hidden transition-all duration-300"
                >
                  <div>
                    <div className="text-4xl mb-1">＋</div>
                    <p className="font-semibold">Add New Address</p>
                  </div>
                </div>
              )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="border border-green-200 rounded-xl p-6 bg-white shadow-lg animate-fade-in-up col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-green-700">
                  New Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "name",
                    "phone",
                    "email",
                    "city",
                    "landmark",
                    "state",
                    "pincode",
                  ].map((field) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={
                        field.charAt(0).toUpperCase() +
                        field.slice(1) +
                        (field === "landmark" ? " (Optional)" : "")
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={newAddress[field]}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          [field]: e.target.value,
                        })
                      }
                    />
                  ))}
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
                    onClick={() => {
                      setShowNewAddressForm(false);
                      setNewAddress({
                        name: "",
                        phone: "",
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
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm transition-colors"
                    onClick={handleAddNewAddress} // Call the add function
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Place Order Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleProceedToPayment}
              disabled={!selectedAddressId || cartItems.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg ${selectedAddressId && cartItems.length > 0
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Order Placed Modal */}
      {showOrderPlaced && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/40 backdrop-blur-sm">
          <div className="animate-slide-down bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-3 text-green-600">
              ✅ Order Placed Successfully
            </h2>
            <p className="text-gray-700 text-sm">
              Redirecting to your orders...
            </p>
          </div>

          <style jsx>{`
            .animate-slide-down {
              animation: slideDownFade 0.3s ease-out forwards;
            }

            @keyframes slideDownFade {
              0% {
                opacity: 0;
                transform: translateY(-20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}

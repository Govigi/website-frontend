export const getStoredToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
};

export const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const normalizeAddress = (address) => ({
  ...address,
  name: address.name || address.label || "Address",
  contact: address.contact || address.phone || "",
  email: address.email || "",
  city: address.city || address.components?.city || "",
  landmark: address.landmark || address.components?.area || address.rawAddress || address.formattedAddress || "",
  state: address.state || address.components?.state || "",
  pincode: address.pincode || address.components?.postalCode || "",
});

export const normalizeAddresses = (addresses = []) => addresses.map(normalizeAddress);

export const toAddressPayload = (address) => {
  const formattedAddress =
    address.formattedAddress ||
    [address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(", ");

  return {
    ...address,
    placeId: address.placeId || `manual-${Date.now()}`,
    formattedAddress: formattedAddress || "Manual address",
    rawAddress: address.rawAddress || formattedAddress || "",
    components: {
      houseNumber: address.components?.houseNumber || "",
      street: address.components?.street || "",
      area: address.components?.area || address.landmark || "",
      city: address.components?.city || address.city || "",
      state: address.components?.state || address.state || "",
      postalCode: address.components?.postalCode || address.pincode || "",
      country: address.components?.country || "India",
    },
    location: address.location || {
      type: "Point",
      coordinates: [0, 0],
    },
    label: address.label || address.name || "Other",
  };
};

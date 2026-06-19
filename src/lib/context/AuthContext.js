"use client";
import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

import { config } from "../utils/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const backendApi = config.backend_url;
  const { showToast } = useToast();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", JSON.stringify(token));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const extractAddress = (data) => {
    const address = data.address || {};
    return {
      full: data.display_name,
      city:
        address.city || address.town || address.village || address.hamlet || "",
      state: address.state || "",
      pincode: address.postcode || "",
      landmark:
        (address.neighbourhood || "") +
          (address.suburb || "") +
          (address.road || "") +
          (address.building || "") || "",
    };
  };

  //Address
  const updateAddress = async (address) => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const res = await axios.post(`${backendApi}/addAddress`, {
        token,
        address,
      });

      if (res.status === 200) {
        showToast("Address saved successfully!", "success");
        return res.data.user.addresses[res.data.user.addresses.length - 1];
      } else {
        showToast(res.data.message || "Failed to save address", "error");
      }
    } catch (err) {
      if (err.status === 400) showToast("Address already exists.", "warning");
      console.error(err);
    }
  };

  const EditAddress_context = async (index, updatedAddress) => {
    const token = JSON.parse(localStorage.getItem("token"));
    try {
      const res = await axios.patch(`${backendApi}/editAddress`, {
        token,
        index,
        updatedAddress,
      });
      showToast("Address Updated", "success");
      return res.data;
    } catch (err) {
      showToast("failed to update address", "red");
      console.log("edit address", err.message, err);
    }
  };

  const deleteAddress_context = async (index) => {
    const token = JSON.parse(localStorage.getItem("token"));
    try {
      const res = await axios.post(`${backendApi}/deleteAddress`, {
        token,
        index,
      });

      if (res.status === 200) {
        showToast("Address deleted successfully", "success");
        return res.data.addresses;
      } else {
        showToast("Failed to delete address", "error");
      }
    } catch (err) {
      if (err.status === 500) logout();
      showToast("Failed to delete address", "error");
      console.error("Delete address error:", err.message);
    }
  };

  // wishList
  const Get_Wishlist = async () => {
    try {
      let token = localStorage.getItem("token");
      if (token) token = JSON.parse(token);
      const res = await axios.post(`${backendApi}/getWishlist`, { token });
      setWishlist(res.data.wishlist.length);
      return res.data.wishlist;
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      return [];
    }
  };

  const Toggle_wishlist = async (product_id) => {
    try {
      let token = localStorage.getItem("token");
      if (token) token = JSON.parse(token);
      const res = await axios.post(`${backendApi}/togglewish`, {
        token,
        productId: product_id,
      });

      const { status } = res.data;

      if (status === "added") {
        setIsWishlisted(true);
        showToast("Added to wishlist", "success");
      } else if (status === "removed") {
        setIsWishlisted(false);
        showToast("Removed from wishlist", "info");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        wishlist,
        isWishlisted,
        setIsWishlisted,
        login,
        logout,
        updateAddress,
        extractAddress,
        EditAddress_context,
        deleteAddress_context,
        Get_Wishlist,
        Toggle_wishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

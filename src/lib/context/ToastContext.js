"use client";

import { createContext, useContext, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  // We don't need local state anymore — react-hot-toast handles it

  const showToast = useCallback((message, type = "success") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.loading(message);
        break;
      case "info":
        toast(message, { icon: "ℹ️" });
        break;
      default:
        toast(message);
        break;
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "15px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80", // green
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171", // red
              secondary: "#fff",
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};

// Custom hook
export const useToast = () => useContext(ToastContext);
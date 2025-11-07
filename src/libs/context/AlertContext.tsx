"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Alert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title?: string;
  message: string;
  /** Optional key to prevent duplicate alerts of same logical type */
  dedupeKey?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoClose?: number; // milliseconds (0 or undefined = no auto close / permanent)
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (alert: Omit<Alert, "id">) => string; // Returns alert ID
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const showAlert = useCallback(
    (alertData: Omit<Alert, "id">) => {
      let createdId = "";
      setAlerts((prev) => {
        // If dedupeKey provided and existing alert with same key -> skip
        if (alertData.dedupeKey && prev.some(a => a.dedupeKey === alertData.dedupeKey)) {
          return prev; // No new alert
        }
        const id = `alert-${Date.now()}-${Math.random()}`;
        createdId = id;
        const newAlert: Alert = {
          ...alertData,
          id,
          dismissible: alertData.dismissible !== false,
        };
        return [...prev, newAlert];
      });

      // Schedule auto close if needed (after state enqueue)
      if (alertData.autoClose && alertData.autoClose > 0 && createdId) {
        setTimeout(() => {
          removeAlert(createdId);
        }, alertData.autoClose);
      }

      return createdId || "";
    },
    [removeAlert]
  );

  const value: AlertContextType = {
    alerts,
    showAlert,
    removeAlert,
    clearAllAlerts,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

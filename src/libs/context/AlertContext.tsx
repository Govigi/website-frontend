"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Alert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title?: string;
  message: string;
  dedupeKey?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoClose?: number;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (alert: Omit<Alert, "id">) => string; 
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
      const id = `alert-${Date.now()}-${Math.random()}`;
      
      setAlerts((prev) => {
        let updated = prev;
        if (alertData.dedupeKey) {
          updated = prev.filter(a => a.dedupeKey !== alertData.dedupeKey);
        }

        const newAlert: Alert = {
          ...alertData,
          id,
          dismissible: alertData.dismissible !== false,
        };
        return [...updated, newAlert];
      });

      if (alertData.autoClose && alertData.autoClose > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, alertData.autoClose);
      }

      return id;
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

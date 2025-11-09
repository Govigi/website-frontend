"use client";

import React from "react";
import { useAlert } from "@/libs/context/AlertContext";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AlertCircle, XCircle, Info, CheckCircle } from "lucide-react";
import { WarningCircle, Info as PhosphorInfo } from "@phosphor-icons/react";

export const AlertBanner: React.FC = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  const alert = alerts[0];

  const typeStyles = {
    info: "bg-blue-50 border-b border-blue-300 text-blue-800",
    warning: "bg-yellow-50 border border-yellow-300 text-yellow-800",
    error: "bg-red-50 border border-red-300 text-red-800",
    success: "bg-green-50 border border-green-300 text-green-800",
  };

  const iconStyles = {
    info: "text-blue-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    success: "text-green-600",
  };

  const actionButtonStyles = {
    info: "text-blue-900 underline cursor-pointer",
    warning: "text-yellow-900 underline cursor-pointer",
    error: "text-red-900 underline cursor-pointer",
    success: "text-green-900 underline cursor-pointer",
  };

  const getIcon = () => {
    switch (alert.type) {
      case "info":
        return (
            <PhosphorInfo className={`w-5 h-5 ${iconStyles.info}`} weight="fill" />
        )
      case "warning":
        return (
            <WarningCircle className={`w-5 h-5 ${iconStyles.warning}`} weight="fill" />
        );
      case "error":
        return (
            <XCircleIcon className={`w-5 h-5 ${iconStyles.error}`} />
        );
      case "success":
        return (
            <CheckCircle className={`w-5 h-5 ${iconStyles.success}`} />
        );
    }
  };

  return (
    <div
      className={`w-full ${typeStyles[alert.type]} transition-all duration-300 px-2 py-1 animate-slide-down-in`}
    >
      <div className={`flex items-center gap-3 ${!alert.dismissible ? "flex-row-reverse" : ""}`}>

        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          {alert.title && (
            <p className="font-semibold text-xs">
              {alert.title}
            </p>
          )}
          <p className={`text-xs ${alert.title ? "opacity-90" : "pt-2"}`}>
            {alert.message}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {alert.action && (
            <button
              onClick={() => {
                alert.action?.onClick();
                removeAlert(alert.id);
              }}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${actionButtonStyles[alert.type]}`}
            >
              {alert.action.text}
            </button>
          )}

          {alert.dismissible && (
            <button
              onClick={() => removeAlert(alert.id)}
              className="p-1 rounded-md hover:opacity-70 transition-opacity flex-shrink-0"
              title="Close alert"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {alerts.length > 1 && (
        <div className="text-xs opacity-75 mt-2 ml-8">
          +{alerts.length - 1} more alert{alerts.length - 1 > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

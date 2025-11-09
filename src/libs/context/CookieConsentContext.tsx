"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  essential: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsent: boolean;
  acceptCookies: (prefs: CookiePreferences) => void;
  rejectCookies: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem("cookieConsent");
    if (savedConsent) {
      try {
        const prefs = JSON.parse(savedConsent);
        setPreferences(prefs);
        setHasConsent(true);
      } catch (error) {
        console.error("Failed to parse cookie consent:", error);
      }
    }
    setIsMounted(true);
  }, []);

  const acceptCookies = (prefs: CookiePreferences) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setPreferences(prefs);
    setHasConsent(true);

    // Trigger any necessary scripts
    if (prefs.analytics) {
      // Load analytics
      window.dispatchEvent(new CustomEvent("cookieConsent", { detail: { analytics: true } }));
    }
    if (prefs.marketing) {
      // Load marketing scripts
      window.dispatchEvent(new CustomEvent("cookieConsent", { detail: { marketing: true } }));
    }
  };

  const rejectCookies = () => {
    const minimalPrefs = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(minimalPrefs));
    setPreferences(minimalPrefs);
    setHasConsent(true);
  };

  const resetConsent = () => {
    localStorage.removeItem("cookieConsent");
    setPreferences(null);
    setHasConsent(false);
  };

  if (!isMounted) {
    return children;
  }

  return (
    <CookieConsentContext.Provider value={{ preferences, hasConsent, acceptCookies, rejectCookies, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

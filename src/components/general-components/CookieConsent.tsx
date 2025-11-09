"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Cookie } from "@phosphor-icons/react";
import { ChevronLeft } from "lucide-react";

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  essential: boolean; 
}

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookieConsent");
    if (!savedConsent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    setShowConsent(false);
    loadAnalytics(allAccepted);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(minimalConsent));
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowConsent(false);
    loadAnalytics(preferences);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return; 
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const loadAnalytics = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      // Example: Google Analytics
      // console.log("Loading analytics...");
    }
    if (prefs.marketing) {
      // Example: Marketing pixels
      // console.log("Loading marketing pixels...");
    }
  };

  if (!showConsent) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300" />

      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className={`${showDetails ? "hidden" : "block"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Cookie size={32} color="#00c951" weight="duotone" />
                  <p className="text-sm sm:text-base text-gray-600">
                    We use cookies to improve your experience, analyze site traffic, and enable personalized features. 
                    You can choose what cookies to accept.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 text-sm sm:text-base"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2.5 border border-green-300 text-green-700 bg-green-50 rounded-lg font-medium transition-all duration-200 hover:bg-green-100 active:scale-95 text-sm sm:text-base"
                  >
                    Manage
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 text-sm sm:text-base shadow-md"
                  >
                    Accept All
                  </button>
                </div>
                <button
                  onClick={handleRejectAll}
                  className="hidden sm:flex sm:absolute sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="border-t border-gray-200 bg-gray-50 animate-slide-down-in">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Customize Your Cookie Preferences
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <label className="flex items-center gap-3 cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="w-4 h-4 text-green-600 rounded cursor-not-allowed accent-green-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            Essential Cookies
                            <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              Always On
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Required for the website to function properly. These cannot be disabled.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handleTogglePreference("analytics")}
                        className="w-4 h-4 text-green-600 rounded mt-0.5 cursor-pointer accent-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Analytics Cookies</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Help us understand how you use our website so we can improve it. Data is anonymous.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => handleTogglePreference("marketing")}
                        className="w-4 h-4 text-green-600 rounded mt-0.5 cursor-pointer accent-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Marketing Cookies</div>
                        <p className="text-xs text-gray-500 mt-1">
                          Used to show you personalized ads based on your interests and behavior.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mb-6 pb-4 border-b border-gray-200">
                  <a
                    href="/privacy-policy"
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Read our full Privacy Policy & Cookie Policy →
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95 text-sm"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2.5 border border-green-300 text-green-700 bg-green-50 rounded-lg font-medium transition-all duration-200 hover:bg-green-100 active:scale-95 text-sm"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 text-sm shadow-md"
                  >
                    Accept All
                  </button>
                </div>

                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  <ChevronLeft className="inline-block mr-1" /> Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

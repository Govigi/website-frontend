"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";
import { useToast } from "../../lib/context/ToastContext";
import { config } from "@/lib/utils/config";
import { Modal } from "@/components/UI/Modal";

export default function LoginCard({ isOpen, onClose, onLoginSuccess }) {
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const backendApi = config.backend_url;

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!otpSent || countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, otpSent]);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) return setMessage("Enter a valid mobile number");
    try {
      setLoading(true);
      await axios.post(`${backendApi}/sendOTP`, { contact: mobile });
      setOtpSent(true);
      showToast("OTP sent to your number.", "success");
      setCountdown(300);
    } catch {
      showToast("Failed to send OTP", "red");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) return;
    try {
      setLoading(true);
      const res = await axios.post(`${backendApi}/verifyOTP`, {
        contact: mobile,
        otp: otpValue,
      });
      showToast("Login successful", "green");

      if (res.data.isNew) {
        setIsNewUser(true);
        setToken(res.data?.token);
      } else {
        login(res.data.token);
        onLoginSuccess?.();
        onClose();
      }
    } catch {
      showToast("Invalid or expired OTP", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    const { firstName, lastName, email } = profile;
    if (!firstName || !lastName || !email) {
      return setMessage("Please fill all fields");
    }
    try {
      setLoading(true);
      await axios.post(`${backendApi}/completeProfile`, {
        token,
        firstName,
        lastName,
        email,
      });
      setMessage("Profile completed");
      login(token);
      onLoginSuccess?.();
      onClose();
    } catch {
      setMessage("Failed to submit profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3)
      document.getElementById(`otp-${index + 1}`)?.focus();
    if (!value && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  return (
    <Modal open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <Modal.Content size="md" closeOnOverlay={true} className="rounded-md overflow-hidden font-outfit">
        <Modal.Header
          closable={true}
          onClose={onClose}
          className="border-b border-zinc-100 p-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            {(isNewUser || otpSent) && (
              <button
                type="button"
                onClick={() => {
                  if (isNewUser) {
                    setIsNewUser(false);
                    setMessage("");
                  } else if (otpSent) {
                    setOtpSent(false);
                    setOtp(["", "", "", ""]);
                    setMessage("");
                    setCountdown(0);
                  }
                }}
                className="text-gray-500 hover:text-black mr-1 focus:outline-none"
              >
                <ArrowLeft className="w-5 h-5 cursor-pointer" />
              </button>
            )}
            <Modal.Title className="text-lg font-bold text-zinc-900">
              {!otpSent
                ? "Log in or Sign up"
                : isNewUser
                ? "Complete Profile"
                : "Enter OTP"}
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body className="p-6 space-y-4">
          {/* STEP 1: Enter Mobile */}
          {!otpSent ? (
            <div className="animate-fade-in">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mb-4">
                <span className="px-3 text-gray-700 font-medium flex items-center gap-1.5 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="flex-1 px-3 py-2 outline-none text-gray-800"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-green-600 text-white cursor-pointer font-semibold py-2 rounded-lg hover:bg-green-700 transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Sending...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          ) : // STEP 2: Complete Profile
          isNewUser ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />

              <button
                onClick={handleSubmitProfile}
                className="w-full bg-green-600 text-white font-semibold cursor-pointer py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          ) : (
            // STEP 3: OTP Verification
            <div className="animate-fade-in">
              <p className="text-sm text-gray-600 mb-2 text-center">
                OTP sent to <strong>+91-{mobile}</strong>
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.join("").length !== 4 || loading}
                className={`w-full ${
                  otp.join("").length === 4
                    ? "bg-green-600 cursor-pointer hover:bg-green-700"
                    : "bg-gray-300 cursor-not-allowed"
                } text-white font-semibold py-2 rounded-lg text-sm transition`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Didn’t receive OTP?{" "}
                {countdown > 0 ? (
                  <span className="text-red-500">
                    Resend in{" "}
                    {`${String(Math.floor(countdown / 60)).padStart(
                      2,
                      "0"
                    )}:${String(countdown % 60).padStart(2, "0")}`}
                  </span>
                ) : (
                  <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={handleSendOtp}
                  >
                    Resend
                  </span>
                )}
              </p>
            </div>
          )}

          {message && (
            <p className="text-xs text-center mt-4 text-red-500">{message}</p>
          )}

          <p className="text-xs text-center text-gray-500 mt-4">
            By continuing, you agree to our{" "}
            <a href="#" className="underline">
              Terms of service
            </a>{" "}
            &{" "}
            <a href="#" className="underline">
              Privacy policy
            </a>
          </p>
        </Modal.Body>
      </Modal.Content>

      <style jsx>{`
        .animate-fade-in {
          animation: fade-in 0.3s ease-out both;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Modal>
  );
}

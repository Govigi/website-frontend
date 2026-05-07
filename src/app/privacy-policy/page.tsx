"use client";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] font-sans">
      <header className="fixed top-0 left-0 right-0 h-[80px] bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[800px] mx-auto w-full h-full flex items-center px-[20px]">
          <a href="/" className="flex items-center">
            <img src="/AppLogo.png" alt="Govigi Logo" className="h-[48px] w-auto object-contain mr-[16px]" />
            <span className="text-[#686b78] font-[700] tracking-[0.5px] uppercase text-[14px]">
              PRIVACY POLICY
            </span>
          </a>
        </div>
      </header>

      <main className="pt-[120px] pb-[60px] px-[20px] max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-[800] text-[#282c3f] mb-[32px]">
          Privacy Policy
        </h1>

        <div className="text-[14px] leading-[1.6] text-[#3d4152]">
          <p className="mb-[16px]">
            Welcome to Govigi, owned and operated by govigi.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
          </p>
          <p className="mb-[16px]">
            By accessing or using the Govigi app, you agree to the practices described in this policy.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">1. Information We Collect</h2>
          <p className="mb-[16px] font-[700]">1.1 Personal Information</p>
          <p className="mb-[16px]">We collect the following details during registration or order placement:</p>
          <ul className="list-disc pl-[20px] mb-[16px]">
            <li className="mb-[8px]">Full Name</li>
            <li className="mb-[8px]">Phone Number</li>
            <li className="mb-[8px]">Delivery Address</li>
            <li className="mb-[8px]">Business Details (Hotel, PG, Restaurant, MSME, etc.)</li>
            <li className="mb-[8px]">Location Information (approximate or precise)</li>
          </ul>

          <p className="mb-[16px] font-[700]">1.2 Payment Information</p>
          <p className="mb-[16px]">
            We may collect UPI ID, transaction IDs, and billing-related information. We do NOT store card details. All payments are handled securely through trusted third‑party payment gateways.
          </p>

          <p className="mb-[16px] font-[700]">1.3 Automatically Collected Data</p>
          <p className="mb-[16px]">
            We collect non-personal data such as device info, IP address, analytics, and crash logs to improve performance.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">2. How We Use Your Information</h2>
          <p className="mb-[16px]">We use your data to:</p>
          <ul className="list-disc pl-[20px] mb-[16px]">
            <li className="mb-[8px]">Manage your Govigi business account</li>
            <li className="mb-[8px]">Process and deliver orders</li>
            <li className="mb-[8px]">Verify business and delivery details</li>
            <li className="mb-[8px]">Enhance app experience and performance</li>
            <li className="mb-[8px]">Process payments securely</li>
            <li className="mb-[8px]">Provide customer support</li>
            <li className="mb-[8px]">Send notifications, updates, and invoices</li>
          </ul>
          <p className="mb-[16px] font-[700]">We never sell or rent your personal information.</p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">3. Sharing Your Information</h2>
          <p className="mb-[16px]">
            We share limited data with delivery partners, payment processors, and operational service providers — strictly for service purposes. We do not share your information with advertisers.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">4. Location Information</h2>
          <p className="mb-[16px]">
            Location access helps improve delivery accuracy and assign nearby personnel. You may disable location permissions anytime, but some features may be affected.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">5. Data Security</h2>
          <p className="mb-[16px]">
            We use encryption, secure servers, and restricted internal access to protect your data. Although we follow industry‑standard measures, no method is 100% secure.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">6. Data Retention</h2>
          <p className="mb-[16px]">
            We retain your data while your account remains active or as required for legal and business purposes. You may request account deletion.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">7. Children’s Privacy</h2>
          <p className="mb-[16px]">
            Govigi is intended for adults (18+). We do not knowingly collect information from minors.
          </p>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">8. Your Rights</h2>
          <ul className="list-disc pl-[20px] mb-[16px]">
            <li className="mb-[8px]">Update or correct your profile</li>
            <li className="mb-[8px]">Request account deletion</li>
            <li className="mb-[8px]">Adjust app permissions</li>
            <li className="mb-[8px]">Contact us regarding your data</li>
          </ul>

          <h2 className="text-[16px] font-[700] text-[#282c3f] mt-[24px] mb-[12px]">9. Contact Us</h2>
          <p className="mb-[16px]">If you have questions, reach out to:</p>
          <ul className="list-none mb-[16px]">
            <li className="mb-[8px]">
              <span className="font-[700]">Email:</span> support@govigi.com
            </li>
            <li className="mb-[8px]">
              <span className="font-[700]">Website:</span> govigi.com
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

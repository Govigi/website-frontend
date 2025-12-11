"use client";
import React from "react";

const LAST_UPDATED = "December 11, 2025";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text drop-shadow-sm">
            GIVIGI — Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Last updated: <span className="font-semibold">{LAST_UPDATED}</span>
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white shadow-xl rounded-3xl p-10 md:p-14 border border-gray-100">
          <article className="prose prose-neutral max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-green-700">1. Introduction</h2>
              <p>
                Welcome to <strong>Givigi</strong>, owned and operated by
                <a href="https://govigi.com" className="text-green-600 font-medium hover:underline ml-1">govigi.com</a>.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                mobile application and website.
              </p>
              <p>By accessing or using the Givigi app, you agree to the practices described in this policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-emerald-700">2.1 Personal Information</h3>
              <p>We collect the following details during registration or order placement:</p>
              <ul className="list-disc pl-6">
                <li>Full Name</li>
                <li>Phone Number</li>
                <li>Delivery Address</li>
                <li>Business Details (Hotel, PG, Restaurant, MSME, etc.)</li>
                <li>Location Information (approximate or precise)</li>
              </ul>

              <h3 className="text-xl font-semibold text-emerald-700">2.2 Payment Information</h3>
              <p>
                We may collect UPI ID, transaction IDs, and billing-related information. We do
                <strong> NOT</strong> store card details. All payments are handled securely through trusted third‑party payment
                gateways.
              </p>

              <h3 className="text-xl font-semibold text-emerald-700">2.3 Automatically Collected Data</h3>
              <p>We collect non-personal data such as device info, IP address, analytics, and crash logs to improve performance.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">3. How We Use Your Information</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-6">
                <li>Manage your Givigi business account</li>
                <li>Process and deliver orders</li>
                <li>Verify business and delivery details</li>
                <li>Enhance app experience and performance</li>
                <li>Process payments securely</li>
                <li>Provide customer support</li>
                <li>Send notifications, updates, and invoices</li>
              </ul>
              <p className="font-semibold text-green-700">We never sell or rent your personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">4. Sharing Your Information</h2>
              <p>
                We share limited data with delivery partners, payment processors, and operational service providers — strictly for
                service purposes. We do not share your information with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">5. Location Information</h2>
              <p>
                Location access helps improve delivery accuracy and assign nearby personnel. You may disable location permissions
                anytime, but some features may be affected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">6. Data Security</h2>
              <p>
                We use encryption, secure servers, and restricted internal access to protect your data. Although we follow
                industry‑standard measures, no method is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">7. Data Retention</h2>
              <p>
                We retain your data while your account remains active or as required for legal and business purposes. You may
                request account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">8. Children’s Privacy</h2>
              <p>Givigi is intended for adults (18+). We do not knowingly collect information from minors.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">9. Your Rights</h2>
              <ul className="list-disc pl-6">
                <li>Update or correct your profile</li>
                <li>Request account deletion</li>
                <li>Adjust app permissions</li>
                <li>Contact us regarding your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">10. Third‑Party Services</h2>
              <p>We use third‑party tools such as payment gateways, analytics, and crash reporting systems.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">11. Policy Updates</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will reflect a new "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-green-700">12. Contact Us</h2>
              <p>If you have questions, reach out to:</p>
              <ul className="list-none pl-0">
                <li>
                    <strong>Email:</strong>
                    <a href="mailto:support@govigi.com" className="text-green-600 underline ml-1">
                    support@govigi.com
                    </a>
                </li>
                <li>
                    <strong>Website:</strong>
                    <a href="https://govigi.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline ml-1">
                    govigi.com
                    </a>
                </li>
              </ul>
            </section>
          </article>

          <footer className="mt-10 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Givigi — All rights reserved.
          </footer>
        </div>
      </div>
    </main>
  );
}

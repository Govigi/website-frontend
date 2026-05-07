"use client";
import React from "react";

const LAST_UPDATED = "May 07, 2026";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] font-sans">
      <header className="fixed top-0 left-0 right-0 h-[80px] bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[800px] mx-auto w-full h-full flex items-center px-[20px]">
          <a href="/" className="flex items-center">
            <img src="/AppLogo.png" alt="Govigi Logo" className="h-[48px] w-auto object-contain mr-[16px]" />
            <span className="text-[#686b78] font-[700] tracking-[0.5px] uppercase text-[14px]">
              SHIPPING POLICY
            </span>
          </a>
        </div>
      </header>

      <main className="pt-[120px] pb-[60px] px-[20px] max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-[800] text-[#282c3f] mb-[32px]">
          Shipping Policy
        </h1>

        <div className="text-[14px] leading-[1.6] text-[#3d4152]">
          <p className="mb-[16px]">
            The orders for the user are shipped through registered domestic courier companies and/or speed post only.
          </p>
          <p className="mb-[16px]">
            Orders are shipped within 1 days from the date of the order and/or payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, subject to courier company / post office norms.
          </p>
          <p className="mb-[16px]">
            Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority. Delivery of all orders will be made to the address provided by the buyer at the time of purchase. Delivery of our services will be confirmed on your email ID as specified at the time of registration.
          </p>
          <p className="mb-[16px]">
            If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is not refundable.
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";
import React from "react";

export default function RefundAndCancellationPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] font-sans">
      <header className="fixed top-0 left-0 right-0 h-[80px] bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[800px] mx-auto w-full h-full flex items-center px-[20px]">
          <a href="/" className="flex items-center">
            <img src="/AppLogo.png" alt="Govigi Logo" className="h-[48px] w-auto object-contain mr-[16px]" />
            <span className="text-[#686b78] font-[700] tracking-[0.5px] uppercase text-[14px]">
              REFUND & CANCELLATION
            </span>
          </a>
        </div>
      </header>

      <main className="pt-[120px] pb-[60px] px-[20px] max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-[800] text-[#282c3f] mb-[32px]">
          Cancellation and Refund Policy
        </h1>
        
        <div className="text-[14px] leading-[1.6] text-[#3d4152]">
          <p className="mb-[16px]">
            This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform. Under this policy:
          </p>
          
          <ul className="list-disc pl-[20px] mb-[16px]">
            <li className="mb-[8px]">
              Cancellations will only be considered if the request is made 1 days of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.
            </li>
            <li className="mb-[8px]">
              Govigi does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that the quality of the product delivered is not good.
            </li>
            <li className="mb-[8px]">
              In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/ merchant listed on the Platform, has checked and determined the same at its own end. This should be reported within 1 days of receipt of products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1 days of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.
            </li>
            <li className="mb-[8px]">
              In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them.
            </li>
            <li className="mb-[8px]">
              In case of any refunds approved by Govigi, it will take 10 days for the refund to be processed to you.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

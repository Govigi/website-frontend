"use client";
import React from "react";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] font-sans">
      <header className="fixed top-0 left-0 right-0 h-[80px] bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-[800px] mx-auto w-full h-full flex items-center px-[20px]">
          <a href="/" className="flex items-center">
            <img src="/AppLogo.png" alt="Govigi Logo" className="h-[48px] w-auto object-contain mr-[16px]" />
            <span className="text-[#686b78] font-[700] tracking-[0.5px] uppercase text-[14px]">
              RETURN POLICY
            </span>
          </a>
        </div>
      </header>

      <main className="pt-[120px] pb-[60px] px-[20px] max-w-[800px] mx-auto">
        <h1 className="text-[24px] font-[800] text-[#282c3f] mb-[32px]">
          Return Policy
        </h1>
        
        <div className="text-[14px] leading-[1.6] text-[#3d4152]">
          <p className="mb-[16px]">
            We offer refund / exchange within first 1 days from the date of your purchase. If 1 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind. 
          </p>
          <p className="mb-[16px]">
            In order to become eligible for a return or an exchange, (i) the purchased item should be unused and in the same condition as you received it, (ii) the item must have original packaging, (iii) if the item that you purchased on a sale, then the item may not be eligible for a return / exchange. Further, only such items are replaced by us (based on an exchange request), if such items are found defective or damaged.
          </p>
          <p className="mb-[16px]">
            You agree that there may be a certain category of products / items that are exempted from returns or refunds. Such categories of the products would be identified to you at the item of purchase.
          </p>
          <p className="mb-[16px]">
            For exchange / return accepted request(s) (as applicable), once your returned product / item is received and inspected by us, we will send you an email to notify you about receipt of the returned / exchanged product. Further. If the same has been approved after the quality check at our end, your request (i.e. return / exchange) will be processed in accordance with our policies.
          </p>
        </div>
      </main>
    </div>
  );
}

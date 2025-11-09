"use client";

import { Wallet } from "@phosphor-icons/react";
import React from "react";

const WalletSection = () => {
  return (
    <div className="max-w-lg mx-auto bg-white ">
      <div className="flex justify-center items-center mb-4 p-10"></div>

      <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
        <Wallet className="w-12 h-12 mb-4 text-gray-400" />
        <p className="text-base font-medium">No wallet transactions</p>
        <p className="text-sm">You haven&apos;t made any transactions yet.</p>
      </div>
    </div>
  );
};

export default WalletSection;

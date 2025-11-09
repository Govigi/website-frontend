"use client";

import { useRouter } from "next/navigation";

interface ViewMoreButtonProps {
  orderId: string;
  itemsCount: number;
}

export default function ViewMoreButton({ orderId, itemsCount }: ViewMoreButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/ordershistory/${orderId}`)}
      className="flex flex-col p-3 bg-gradient-to-br from-green-50 to-white rounded-md border-2 border-dashed border-green-300 hover:border-green-400 hover:shadow-sm transition-all cursor-pointer items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-green-600 mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <p className="text-sm font-semibold text-green-700 text-center">View More</p>
      <p className="text-xs text-green-600 text-center">
        {itemsCount > 2 ? `+${itemsCount - 2} items` : "All items"}
      </p>
    </button>
  );
}

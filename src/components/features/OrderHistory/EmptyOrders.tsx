"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function EmptyOrders() {
  return (
    <div className="text-center py-12 border border-gray-200 rounded-md">
      <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-medium text-sm">No orders found</p>
      <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filter</p>
    </div>
  );
}

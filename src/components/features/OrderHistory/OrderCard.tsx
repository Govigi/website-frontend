"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import ExpandedProducts from "./ExpandedProducts";

interface OrderCardProps {
  order: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  statusConfig: any;
  StatusIcon: any;
  totalQuantity: number;
}

export default function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  statusConfig,
  StatusIcon,
  totalQuantity,
}: OrderCardProps) {
  const router = useRouter();

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden hover:border-gray-300 transition-all duration-200">
      {/* Order Summary Card */}
      <div className="p-3.5 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div
            onClick={() => router.push(`/ordershistory/${order._id}`)}
            className="cursor-pointer flex-1"
          >
            <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Order #{order._id.slice(-8)}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
          >
            <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
            <span className={statusConfig.color}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Stats Grid - Clean UI */}
        <div className="grid grid-cols-2 gap-3">
          {/* Items */}
          <div className="rounded-md p-3 text-center bg-white border border-gray-200">
            <div className="text-xl font-bold text-blue-600">{order.items.length}</div>
            <div className="text-xs text-gray-600 font-medium mt-1">Total Items</div>
          </div>

          {/* Quantity */}
          <div className="rounded-md p-3 text-center bg-white border border-gray-200">
            <div className="text-xl font-bold text-green-600">{totalQuantity}</div>
            <div className="text-xs text-gray-600 font-medium mt-1">Total kg</div>
          </div>
        </div>

        {/* View Products & Reorder Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded text-sm font-medium bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Reorder</span>
          </button>
          <button
            onClick={onToggleExpand}
            className="flex-1 flex items-center justify-between gap-2 px-2.5 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{isExpanded ? "Hide Products" : "View Products"}</span>
            <ChevronRightIcon
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Products Section */}
      <ExpandedProducts order={order} isExpanded={isExpanded} />
    </div>
  );
}
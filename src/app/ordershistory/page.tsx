"use client";
import React, { useEffect, useState } from "react";
import Invoice from "../../components/general-components/Invoice";
import { block } from "useref/lib/buildBlockManager";
import { config } from "@/libs/utils/config";
import { RefreshCwIcon, X } from "lucide-react";
import { BadgeCheck, BadgeX, ClockFading } from "lucide-react";
import { CheckBadgeIcon,ClockIcon,XCircleIcon } from "@heroicons/react/24/solid";

const HistorySection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const backendApi = config.backend_url;

  const fetchUserOrders = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      console.warn("Token not found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${backendApi}/userOrders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error("Fetch failed:", data.message);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const statusBadge = (status) => {
    const statusStyles = {
      Pending: "text-yellow-600",
      Shipped: "text-blue-600",
      delivered: "text-green-600",
      Cancelled: "text-red-600",
    };

    const statusIconStyles = {
      Pending: "bg-yellow-100",
      Shipped: "bg-blue-100",
      Delivered: "bg-green-100",
      Cancelled: "bg-red-100",
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
        <span className={`px-1 py-1 rounded-full text-xs font-medium`}>
           {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {status.toLowerCase() === "delivered" && <CheckBadgeIcon className="w-4.5 h-4.5 text-green-500" />}
        {status.toLowerCase() === "cancelled" && <XCircleIcon className="w-4.5 h-4.5 text-red-500" />}
        {status.toLowerCase() === "pending" && <ClockIcon className="w-4.5 h-4.5 text-yellow-500" />}
      </span>
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-4">Loading orders...</p>;
  }

  return (
    <div className="h-full w-full bg-white rounded-tl-lg rounded-bl-lg py-10 pb-20 px-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">Order History</h2>

        {orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-base font-medium">No orders yet</p>
            <p className="text-sm">Your past orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-2 hover:shadow-sm transition-shadow duration-200"
              >
                {/* Header with Order ID and Status */}
                <div className="flex items-center justify-between mb-3 rounded-tl-md p-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-black">Order ID:</span>
                      <span className="text-xs text-gray-500">
                        #{order._id.slice(-12)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-black">Order Date:</span>
                      <span className="text-xs text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "—"}
                      </span>
                    </div>

                  </div>
                  <div className="flex items-center space-x-2">
                    <div>{statusBadge(order.status)}</div>
                  </div>
                </div>

                <hr className="my-2 border-gray-200" />

                {/* Order Details */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-semibold">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="text-sm font-semibold">
                      {order.items.reduce((total, item) => total + item.quantityKg, 0)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm font-semibold text-green-600">₹{order.totalAmount}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md flex items-center space-x-2 transition-colors">
                    <RefreshCwIcon className="w-4 h-4" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;

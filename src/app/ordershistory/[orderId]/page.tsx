"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { config } from "@/libs/utils/config";
import {
  ShoppingBagIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const getItemPrice = (item) => item?.price ?? 0;
const getItemName = (item) => item?.name || "Product";
const getItemImage = (item) => item?.image || "/placeholder-product.png";
const getItemQuantity = (item) => item?.quantityKg ?? 1;

const StatusBadge = ({ status }) => {
  const statusStyles = {
    delivered: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      icon: <CheckBadgeIcon className="w-4 h-4" />,
    },
    pending: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      icon: <ClockIcon className="w-4 h-4" />,
    },
    shipped: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      icon: <TruckIcon className="w-4 h-4" />,
    },
    cancelled: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      icon: <XCircleIcon className="w-4 h-4" />,
    },
  };

  const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${style.bgColor} ${style.borderColor} ${style.textColor}`}
    >
      {style.icon}
      <span>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>
    </div>
  );
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendApi = config.backend_url;

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${backendApi}/getOrder/${orderId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, backendApi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleReorder = () => {
    console.log("Reordering items...");
    // TODO: Add items back to cart
  };

  const handleGetInvoice = () => {
    console.log("Getting invoice...");
    // TODO: Generate invoice
  };

  const productListMaxHeight = "max-h-[50vh] sm:max-h-none";
  const totalItems = order?.items?.length || 0;
  const totalQuantity = order?.items?.reduce((sum, item) => sum + (getItemQuantity(item) || 0), 0) || 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      <main className="p-4 sm:p-6 sm:max-w-7xl sm:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">

          {/* Left Column: Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
                <div className="flex flex-row items-center gap-2">
                  <div className="w-1.5 h-10 bg-green-600 rounded-full"></div>
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-lg font-bold text-gray-900">Order #{order?._id?.slice(-8)}</h1>
                    <p className="text-sm text-gray-500">
                      Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <StatusBadge status={order?.status} />
                </div>
              </div>
              <div className={`divide-y divide-gray-200 overflow-y-auto no-scrollbar ${productListMaxHeight}`}>
                {order?.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 py-4">
                    <img 
                      src={getItemImage(item)} 
                      alt={getItemName(item)} 
                      className="w-16 h-16 rounded-md object-contain bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/64/64";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{getItemName(item)}</p>
                      <p className="text-sm text-gray-500">Qty: {getItemQuantity(item)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{(getItemPrice(item) * getItemQuantity(item)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Details */}
          <div className="lg:col-span-1 space-y-4 mt-4 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 flex-row justify-start">
                <div className="w-1.5 h-5 bg-green-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
              </div>
              <div className="space-y-2 mt-3 text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">₹{order?.totalAmount?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 mt-2">
                  <p className="text-gray-900">Total</p>
                  <p className="text-green-600">₹{order?.totalAmount?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
              </div>
              <div className="mt-3 text-sm space-y-1 text-gray-600">
                <p className="font-semibold text-gray-800">{order?.name || "N/A"}</p>
                <p>{order?.contact || "N/A"}</p>
                {order?.address && order?.address[0] && (
                  <>
                    <p>{order.address[0].landmark || ""}</p>
                    <p>{`${order.address[0].city || ""}, ${order.address[0].state || ""} - ${order.address[0].pincode || ""}`}</p>
                    <p>{order.address[0].email || ""}</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4">
              <div className="mb-3 text-sm">
                <p className="text-gray-600">Items: <span className="font-semibold text-gray-900">{totalItems}</span></p>
                <p className="text-gray-600">Total Quantity: <span className="font-semibold text-gray-900">{totalQuantity} kg</span></p>
                {order?.paymentMethod && (
                  <p className="text-gray-600 mt-2">Payment: <span className="font-semibold text-gray-900">{order.paymentMethod}</span></p>
                )}
                {order?.scheduledDate && (
                  <p className="text-gray-600 mt-1">Scheduled: <span className="font-semibold text-gray-900">{new Date(order.scheduledDate).toLocaleDateString()}</span></p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReorder}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 px-4 py-2.5 rounded-md transition-colors text-sm font-semibold active:scale-95"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Reorder
              </button>
              <button
                onClick={handleGetInvoice}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-md transition-colors text-sm font-semibold active:scale-95"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Get Invoice
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
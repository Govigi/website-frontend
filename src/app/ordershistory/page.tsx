"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { config } from "@/lib/utils/config";
import {
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { CaretRightIcon } from "@phosphor-icons/react";
import Image from "next/image";

const HistorySection = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const backendApi = config.backend_url;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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

  // Filter and search
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.some(
          (status) => order.status.toLowerCase() === status.toLowerCase()
        );

      return matchesSearch && matchesStatus;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchTerm, selectedStatuses]);

  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckBadgeIcon,
      },
      cancelled: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircleIcon,
      },
      pending: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: ClockIcon,
      },
      shipped: {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: TruckIcon,
      },
    };
    return configs[status.toLowerCase()] || configs.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
          <p className="text-gray-600 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  const statusFilters = [
    { value: "all", label: "All Orders" },
    {
      value: "pending",
      label: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  return isMobile ? (
    <div className="bg-white">
      {/* Search and Filter Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 p-4 shadow-sm mt-16">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filter Pills - Below search on mobile */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {/* Selected Filter Tags - Front */}
          {selectedStatuses.map((status) => {
            const filter = statusFilters.find((f) => f.value === status);
            return (
              <div
                key={`tag-${status}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  filter?.bgColor || "bg-gray-100"
                } ${filter?.color || "text-gray-700"} border ${
                  filter?.borderColor || "border-gray-300"
                }`}
              >
                <span>{filter?.label}</span>
                <button
                  onClick={() =>
                    setSelectedStatuses(
                      selectedStatuses.filter((s) => s !== status)
                    )
                  }
                  className="hover:opacity-70 transition-opacity flex-shrink-0"
                  title="Remove filter"
                >
                  <XCircleIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Available Filters - End */}
          {statusFilters.map((filter) => {
            const isSelected = selectedStatuses.includes(filter.value);
            if (isSelected) return null; // Skip selected ones
            return (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedStatuses([...selectedStatuses, filter.value]);
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Orders Container - Takes remaining space */}
      <div className="px-4 pt-32 pb-24">
        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-md">
            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm">No orders found</p>
            <p className="text-gray-500 text-xs mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const totalQuantity = order.items.reduce(
                (total, item) => total + item.quantityKg,
                0
              );
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md overflow-hidden hover:border-gray-300 transition-all duration-200"
                >
                  {/* Order Summary Card */}
                  <div className="p-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        onClick={() =>
                          router.push(`/ordershistory/${order._id}`)
                        }
                        className="cursor-pointer flex-1"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
                      >
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${statusConfig.color}`}
                        />
                        <span className={statusConfig.color}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid - Clean UI */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Items */}
                      <div className="rounded-md p-3 text-center bg-white border border-gray-200">
                        <div className="text-xl font-bold text-blue-600">
                          {order.items.length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                          Total Items
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="rounded-md p-3 text-center bg-white border border-gray-200">
                        <div className="text-xl font-bold text-green-600">
                          {totalQuantity}
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-1">
                          Total kg
                        </div>
                      </div>
                    </div>

                    {/* View Products & Reorder Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded text-sm font-medium bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
                        <ShoppingBagIcon className="w-4 h-4" />
                        <span>Reorder</span>
                      </button>
                      <button
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order._id)
                        }
                        className="flex-1 flex items-center justify-between gap-2 px-2.5 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <span>
                          {isExpanded ? "Hide Products" : "View Products"}
                        </span>
                        <ChevronRightIcon
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Products View - Grid Layout */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4">
                        Products in Order
                      </h4>

                      <div className="grid grid-cols-3 gap-3">
                        {order.items.slice(0, 2).map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex flex-col p-3 bg-gradient-to-br from-gray-50 to-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                          >
                            <div className="w-full h-20 bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-200 mb-2">
                              <Image
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/api/placeholder/64/64";
                                }}
                              />
                            </div>

                            {/* Product Info - Combined Card */}
                            <div className="flex-1 flex flex-col justify-between">
                              <h5 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                                {item.name}
                              </h5>
                              <div className="inline-flex items-center justify-center px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
                                {item.quantityKg} kg
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() =>
                            router.push(`/ordershistory/${order._id}`)
                          }
                          className="flex flex-col p-3 bg-gradient-to-br from-green-50 to-white rounded-md border-2 border-dashed border-green-300 hover:border-green-400 hover:shadow-sm transition-all cursor-pointer items-center justify-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-green-600 mb-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p className="text-sm font-semibold text-green-700 text-center">
                            View More
                          </p>
                          <p className="text-xs text-green-600 text-center">
                            {order.items.length > 2
                              ? `+${order.items.length - 2} items`
                              : "All items"}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-start pt-10 pb-20 min-h-[80vh]">
      <div className="w-full max-w-5xl h-[80vh] rounded-xl border border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Orders History
          </h2>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-full md:w-72 shrink-0 border-r border-gray-200 bg-gray-25 p-5 space-y-5 overflow-y-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Filters</p>
              <div className="space-y-2">
                {statusFilters.map((f) => {
                  const active = selectedStatuses.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      onClick={() =>
                        setSelectedStatuses(
                          active
                            ? selectedStatuses.filter((s) => s !== f.value)
                            : [...selectedStatuses, f.value]
                        )
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition ${
                        active
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className={f.color || "text-gray-700"}>
                        {f.label}
                      </span>
                      {active && (
                        <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 p-6 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div>
                <div className="text-center py-12 border border-gray-200 rounded-md">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium text-sm">
                    No orders found
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Try adjusting your search or filter
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="w-full rounded-md p-5 border border-gray-200 mb-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      ))}

                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <p className="font-semibold text-gray-900">
                            Order{" "}
                            {order.status === "cancelled"
                              ? "cancelled"
                              : order.status}
                          </p>
                          {order.status === "cancelled" && (
                            <div className="w-4 h-4 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">
                          Placed at{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          ,{" "}
                          {new Date(order.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div
                        onClick={() =>
                          router.push(`/ordershistory/${order._id}`)
                        }
                        className="cursor-pointer flex items-center gap-1 text-[15px] font-semibold text-gray-900"
                      >
                        ₹{order.totalAmount.toFixed(2)}
                        <CaretRightIcon
                          size={16}
                          className="mt-0.5 text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4"></div>

                    <button
                      className="w-full text-center text-green-600 font-semibold py-1.5 text-sm"
                      onClick={() => console.log("Order Again")}
                    >
                      Order Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;

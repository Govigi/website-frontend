// src/app/AllOrders/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import {
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  ShoppingBagIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { config } from "@/lib/utils/config";

export default function AllOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  // stable API url
  const API_URL = useMemo(() => `${config.backend_url}/getAllOrders`, []);

  // Helper: safe fetch with abort
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const res = await fetch(API_URL, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        console.error("Failed to fetch orders:", err);
        setError(true);
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_URL]);

  const toggleOrderExpansion = useCallback((orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  }, []);

  // safe fallback image URL (relative/public)
  const FALLBACK_IMAGE = "/api/placeholder/120/96";

  // Convert image URL to base64 for jsPDF
  const toBase64 = useCallback((url: string) => {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string | null>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          })
      )
      .catch(() => null);
  }, []);

  // Generate PDF for an order (memoized)
  const generateOrderPDF = useCallback(
    async (order: any) => {
      if (!order) return;
      setGeneratingPDF(order._id ?? String(Date.now()));

      try {
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 20;

        doc.setFontSize(18);
        doc.text(`Order #${String(order._id ?? "").slice(-8)}`, margin, y);
        y += 10;
        doc.setFontSize(12);
        doc.text(`User ID: ${order.userId ?? "N/A"}`, margin, y);
        y += 7;
        doc.text(
          `Scheduled: ${order.scheduledDate?.slice(0, 10) ?? "-"}`,
          margin,
          y
        );
        y += 7;
        doc.text(
          `Created: ${new Date(order.createdAt).toLocaleDateString()}`,
          margin,
          y
        );
        y += 10;

        doc.setFontSize(14);
        doc.text("Order Items", margin, y);
        y += 8;

        const items = Array.isArray(order.items) ? order.items : [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item) continue;

          if (y > 240) {
            doc.addPage();
            y = margin;
          }

          let imageData: string | null = null;
          try {
            const src = item.image || FALLBACK_IMAGE;
            imageData = (await toBase64(src)) ?? null;
          } catch {
            imageData = null;
          }

          // card background
          doc.setFillColor(245, 245, 245);
          // roundedRect may not exist in older jsPDF - fallback to rect if missing
          if ((doc as any).roundedRect) {
            (doc as any).roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, "F");
          } else {
            doc.rect(margin, y, pageWidth - margin * 2, 40, "F");
          }

          if (imageData) {
            // prefer PNG if dataurl indicates png
            const isPNG = imageData.startsWith("data:image/png");
            doc.addImage(imageData, isPNG ? "PNG" : "JPEG", margin + 3, y + 3, 30, 30);
          } else {
            doc.setDrawColor(200);
            doc.rect(margin + 3, y + 3, 30, 30);
          }

          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(item.name ?? "Unknown Product", margin + 38, y + 12);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Quantity: ${item.quantityKg ?? 0} kg`, margin + 38, y + 20);

          y += 45;
        }

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 290);

        doc.save(`order-${String(order._id ?? "").slice(-8)}.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        // friendly feedback
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setGeneratingPDF(null);
      }
    },
    [FALLBACK_IMAGE, toBase64]
  );

  // UX states
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-green-600 border-r-green-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-block p-3 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-lg">Failed to load orders</p>
            <p className="text-gray-600 mt-1">Please try refreshing the page or contact support</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-block p-4 bg-gray-200 rounded-full">
            <ShoppingBagIcon className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-lg">No orders yet</p>
            <p className="text-gray-600 mt-1">Start shopping to create your first order</p>
          </div>
          <button
            onClick={() => (window.location.href = "/webapp")}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-2">
                {orders.length} {orders.length === 1 ? "order" : "orders"} found
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <ShoppingBagIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">{orders.length} Total</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order: any, orderIndex: number) => (
            <div
              key={order._id ?? order.id ?? orderIndex}
              className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${orderIndex * 50}ms` }}
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-green-300 transition-all duration-300 overflow-hidden">
                {/* Order Header */}
                <div
                  onClick={() => toggleOrderExpansion(order._id ?? order.id)}
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {/* Order ID */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                        <h3 className="font-bold text-gray-900">#{String(order._id ?? order.id ?? "").slice(-8)}</h3>
                      </div>
                    </div>

                    {/* User ID */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                        <p className="font-medium text-gray-900 truncate">{order.userId ?? "N/A"}</p>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Items Count & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">{order.items?.length ?? 0} items</span>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order._id ?? order.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        aria-expanded={expandedOrder === (order._id ?? order.id)}
                        aria-controls={`order-items-${order._id ?? order.id}`}
                      >
                        <ChevronDownIcon
                          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                            expandedOrder === (order._id ?? order.id) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Date if available */}
                  {order.scheduledDate && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Scheduled for:{" "}
                        <span className="font-medium text-gray-900">{String(order.scheduledDate).slice(0, 10)}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Items - Expandable */}
                {expandedOrder === (order._id ?? order.id) && (
                  <div
                    id={`order-items-${order._id ?? order.id}`}
                    className="border-t border-gray-100 bg-gray-50/50 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                          Order Items
                        </h4>
                        <button
                          onClick={() => generateOrderPDF(order)}
                          disabled={generatingPDF === (order._id ?? order.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {generatingPDF === (order._id ?? order.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      </div>

                      {order.items && order.items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {order.items.map((item: any, index: number) => (
                            <div
                              key={item._id ?? item.id ?? index}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group/item cursor-pointer"
                            >
                              {/* Product Image */}
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3 group-hover/item:bg-gray-50 transition-colors">
                                <Image
                                  src={item.image ?? FALLBACK_IMAGE}
                                  alt={item.name ?? "Product"}
                                  width={240}
                                  height={192}
                                  className="w-full h-full object-contain group-hover/item:scale-110 transition-transform duration-200"
                                  onError={(e) => {
                                    // @ts-ignore - Next/Image forwards HTMLImageElement error events in runtime
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                  }}
                                  unoptimized={false}
                                  priority={false}
                                />
                              </div>

                              {/* Product Info */}
                              <div>
                                <h5 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover/item:text-green-600 transition-colors">
                                  {item.name ?? "Unknown Item"}
                                </h5>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Quantity</span>
                                  <span className="text-sm font-bold text-gray-900">{item.quantityKg ?? 0} kg</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No items in this order</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

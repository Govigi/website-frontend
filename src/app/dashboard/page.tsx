"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/libs/context/AuthContext";
import { useRouter } from "next/navigation";
import { config } from "@/libs/utils/config";
import {
    ShoppingBagIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";

interface Order {
    _id: string;
    status: string;
    totalPrice?: number;
    totalAmount?: number;
    items: any[];
    createdAt: string;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const backendApi = config.backend_url;

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            let cleanToken = token;
            if (token.startsWith('"') && token.endsWith('"')) {
                cleanToken = JSON.parse(token);
            }

            const res = await fetch(`${backendApi}/userOrders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: cleanToken }),
            });

            const data = await res.json();
            console.log("API Response data:", data);
            console.log("Data type:", Array.isArray(data) ? "Array" : typeof data);
            
            // Handle different response formats
            let ordersArray: Order[] = [];
            if (Array.isArray(data)) {
                ordersArray = data;
            } else if (data?.orders && Array.isArray(data.orders)) {
                ordersArray = data.orders;
            } else if (data?.data && Array.isArray(data.data)) {
                ordersArray = data.data;
            } else {
                console.warn("Unexpected API response format:", data);
                ordersArray = [];
            }
            
            console.log("Final orders array:", ordersArray);
            setOrders(ordersArray);
            
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Calculate analytics
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;
    const pendingOrders = orders.filter(
        (o) => o.status?.toLowerCase() === "pending" || o.status?.toLowerCase() === "processing"
    ).length;

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
    const totalQuantity = orders.reduce(
        (sum, order) =>
            sum +
            (order.items?.reduce((itemSum: number, item: any) => itemSum + (item.quantityKg || 0), 0) || 0),
        0
    );

    const successRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return (
        <div className="px-4 py-6 sm:p-6">
            <div className="sm:max-w-6xl sm:mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">Your shopping insights and order</p>
                </div>

                {/* Main Stats Grid - 1 column mobile, 3 columns desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                    {/* Total Orders Card */}
                    <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 font-medium mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                                <p className="text-xs text-gray-500 mt-2">{completedOrders} completed</p>
                            </div>
                            <div className="ml-3">
                                <ShoppingBagIcon className="h-6 w-6 text-gray-400 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Total Spent Card */}
                    <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 font-medium mb-1">Total Spent</p>
                                <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-gray-500 mt-2">Avg: ₹{Math.round(averageOrderValue).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="ml-3">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Success Rate Card */}
                    <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 font-medium mb-1">Success Rate</p>
                                <p className="text-3xl font-bold text-gray-900">{Math.round(successRate)}%</p>
                                <p className="text-xs text-gray-500 mt-2">{completedOrders} of {totalOrders}</p>
                            </div>
                            <div className="ml-3">
                                <CheckCircleIcon className="h-6 w-6 text-gray-400 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats - Detailed Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Order Status Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-md p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Delivered Status */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Delivered</span>
                                    <span className="text-sm font-bold text-green-600">{completedOrders}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(completedOrders / (totalOrders || 1)) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* In Progress Status */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                                    <span className="text-sm font-bold text-orange-600">{pendingOrders}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(pendingOrders / (totalOrders || 1)) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Overview */}
                    <div className="bg-white border border-gray-200 rounded-md p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">Items Overview</h3>
                            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                Details
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Total Items */}
                            <div className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Items</span>
                                    <span className="text-lg font-bold text-gray-900">{totalItems}</span>
                                </div>
                            </div>

                            {/* Total Quantity */}
                            <div className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Quantity</span>
                                    <span className="text-lg font-bold text-gray-900">{totalQuantity.toFixed(1)} kg</span>
                                </div>
                            </div>

                            {/* Average Items */}
                            <div className="p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Avg per Order</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border border-gray-200 rounded-md p-5 lg:row-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                View All
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {orders.length > 0 ? (
                                orders.slice(0, 8).map((order) => (
                                    <div key={order._id} className="p-3 rounded-md border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">Order #{order._id?.slice(-6).toUpperCase() || "N/A"}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A"}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                                    order.status?.toLowerCase() === "delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                            <span className="text-xs text-gray-600">{order.items?.length || 0} items</span>
                                            <span className="text-sm font-bold text-gray-900">₹{(order.totalAmount || order.totalPrice || 0).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">No orders yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-green-50 border border-green-200 rounded-md p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ready to Order?</h3>
                            <p className="text-sm text-gray-600 mt-1">Continue shopping and explore fresh products</p>
                        </div>
                        <button
                            onClick={() => router.push("/")}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold transition-colors"
                        >
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

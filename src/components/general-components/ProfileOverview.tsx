"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/libs/context/AuthContext";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import {
    ShoppingCartSimple,
    Heart,
    Wallet,
    UserCircle,
    Receipt,
    MapPinLine,
    UserCircleDashedIcon,
} from "@phosphor-icons/react";
import { ChevronRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { UserCircle2Icon } from "lucide-react";

export default function ProfileOverview() {
    const [userData] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        profileCompletion: 65,
        memberSince: "Jan 2024",
    });

    const { isAuthenticated } = useAuth();
    const { open: openLogin } = useLoginModal();

    const profileStats = [
        {
            label: "Orders Placed",
            value: "12",
            icon: ShoppingCartSimple,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border border-blue-200",
            statColor: "text-blue-800",
        },
        // { label: "Wishlist", value: "8", icon: Heart, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border border-red-200", statColor: "text-red-800" },
        { label: "Wallet Balance", value: "₹2,500", icon: Wallet, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border border-green-200", statColor: "text-green-800" },
    ];

    const profileModules = {
        orders: {
            heading: "Orders & Payments",
            content: [
                { label: "My Orders", icon: Receipt, href: "/ordershistory" },
                { label: "Wallet", icon: Wallet, href: "/wallet" },
            ]
        },
        account: {
            heading: "Account",
            content: [
                { label: "Edit Profile", icon: UserCircle, href: "/profile" },
                { label: "Saved Address", icon: MapPinLine, href: "/saved-address" },
            ]
        },
    };

    if (!isAuthenticated) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Welcome, Guest</h3>
                <p className="text-sm text-gray-500 mt-2">Please sign in to access your profile</p>
                <button
                    onClick={() => openLogin()}
                    className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-md border border-gray-200">
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full w-14 h-14 flex items-center justify-center ring-4 ring-green-50">
                    <UserCircle2Icon size={28} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{userData.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Member since {userData.memberSince}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                {profileStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="text-center">
                            <div className={`${stat.bgColor} ${stat.borderColor} rounded-md p-2 mb-2`}>
                                <IconComponent size={20} className={stat.color + " mx-auto"} />
                                <div className={`text-sm font-bold ${stat.statColor}`}>{stat.value}</div>
                                <div className="text-xs text-gray-600">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-3">
                {Object.entries(profileModules).map(([key, module]) => (
                    <div key={key} className="border border-gray-200 rounded-md p-3">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex flex-row gap-2 border-b pb-2 border-gray-200">
                            <div className="w-1.5 h-5 bg-green-600 rounded-full flex items-center justify-center" />
                            {module.heading}
                        </h4>
                        <div className="space-y-2">
                            {module.content.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <Link key={index} href={item.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-all duration-200">
                                        <IconComponent size={20} className="text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-auto" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

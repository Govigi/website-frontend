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
} from "@phosphor-icons/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

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
      label: "Orders",
      value: "12",
      icon: ShoppingCartSimple,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    { label: "Wishlist", value: "8", icon: Heart, color: "text-red-600", bgColor: "bg-red-50" },
    { label: "Wallet", value: "₹2,500", icon: Wallet, color: "text-green-600", bgColor: "bg-green-50" },
  ];

  const quickActions = [
    { label: "Edit Profile", icon: UserCircle, href: "/profile" },
    { label: "My Orders", icon: Receipt, href: "/ordershistory" },
    { label: "Saved Address", icon: MapPinLine, href: "/saved-address" },
    { label: "Wallet", icon: Wallet, href: "/wallet" },
  ];

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
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img src="/user-avatar.png" alt="User Avatar" className="w-16 h-16 rounded-full" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{userData.name}</h3>
          <p className="text-gray-500 text-xs">Member since {userData.memberSince}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {profileStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className={`${stat.bgColor} rounded-lg p-2 mb-2`}>
                <IconComponent size={20} className={`${stat.color} mx-auto`} />
              </div>
              <div className="text-sm font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="space-y-2 border border-gray-200 rounded-2xl p-3">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex flex-row gap-2 border-b pb-2 border-gray-200">
            <div className="w-1.5 h-5 bg-green-600 rounded-full flex items-center justify-center" />
            Orders & Payments
          </h4>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} href={action.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-all duration-200">
                <IconComponent size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

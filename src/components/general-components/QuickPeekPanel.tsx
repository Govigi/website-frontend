"use client";

import {
  Bell,
  Heart,
  MapPinLine,
  Minus,
  Plus,
  Receipt,
  ShoppingCartSimple,
  Trash,
  UserCircle,
  Wallet,
} from "@phosphor-icons/react";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../core/Cart/CartContext";
import { useAuth } from "@/libs/context/AuthContext";
import ProfileOverview from "@/components/general-components/ProfileOverview";
import CartComponent from "@/components/general-components/CartComponent";

import { config } from "@/libs/utils/config";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function QuickPeekPanel({ type, data, onClose }) {
  // type: 'cart' | 'notifications' | 'profile' | 'wishlist' | 'orders' | 'wallet' | 'addresses'
  const titleMap = {
    cart: "Cart",
    notifications: "Notifications",
    profile: "My Account",
    wishlist: "Wishlist",
    orders: "My Orders",
    wallet: "Wallet",
    addresses: "Saved Addresses",
  };

  const iconMap = {
    cart: <ShoppingCartSimple size={18} />,
    notifications: <Bell size={18} />,
    profile: <UserCircle size={18} />,
    wishlist: <Heart size={18} />,
    orders: <Receipt size={18} />,
    wallet: <Wallet size={18} />,
    addresses: <MapPinLine size={18} />,
  };

  const linkMap = {
    cart: "/cart",
    notifications: "/notifications",
    profile: "/profile",
    wishlist: "/wishlist",
    orders: "/ordershistory",
    wallet: "/wallet",
    addresses: "/saved-address",
  };

  const {
    cartItems,
    addToCart,
    incrementQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
  } = useCart();

  let token = localStorage.getItem("token");
  if (token) token = JSON.parse(token);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  const backendApi = config.backend_url;

  useEffect(() => {
    if (type === "addresses") {
      axios
        .post(`${backendApi}/getAddress`, { token })
        .then((response) => {
          setAddresses(response.data);
        })
        .catch((error) => {
          setError("Failed to fetch Addresses");
        });
    }
  }, [type]);

  return (
    <div className="space-y-3">
      {/* Content preview */}
      {type === "cart" && <CartComponent variant="preview" />}

      {type === "notifications" && (
        <EmptyOrList
          list={data?.list}
          emptyText="No new notifications."
          renderItem={undefined}
        />
      )}

      {type === "wishlist" && (
        <EmptyOrList
          list={data?.list}
          emptyText="No items in wishlist."
          renderItem={undefined}
        />
      )}

      {type === "orders" && (
        <EmptyOrList
          list={data?.list}
          emptyText="No recent orders."
          renderItem={undefined}
        />
      )}

      {type === "wallet" && (
        <div className="rounded border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Balance</span>
            <span className="font-semibold">
              ₹{(data.balance ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {type === "addresses" && (
        <EmptyOrList
          list={addresses}
          emptyText="No saved addresses."
          renderItem={(addr) => (
            <div className="text-sm">
              <div className="font-medium">{addr.name || "Address"}</div>
              <div className="text-gray-600">{addr.line1}</div>
              <div className="text-gray-600">
                {addr.city}, {addr.state}
              </div>
            </div>
          )}
        />
      )}

      {type === "profile" && (
        <div>
          <ProfileOverview />
        </div>
      )}

      {/* Footer CTA */}
      {/* <Link
        href={linkMap[type]}
        onClick={onClose}
        className="inline-flex justify-center items-center w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm"
      >
        Show more
      </Link> */}
    </div>
  );
}


function EmptyOrList({ list, emptyText, renderItem }) {
  if (!list?.length)
    return <p className="text-sm text-gray-600">{emptyText}</p>;
  return (
    <ul className="space-y-2">
      {list.slice(0, 3).map((it, i) => (
        <li key={i} className="rounded border p-2 text-sm">
          {renderItem ? (
            renderItem(it)
          ) : (
            <span className="text-gray-800">{String(it)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
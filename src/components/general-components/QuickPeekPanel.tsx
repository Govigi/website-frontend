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
      {type === "cart" && <CartPreview />}

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

function CartPreview() {
  const {
    cartItems,
    incrementQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!cartItems?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <ShoppingCartSimple className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">Your cart is empty</p>
        <p className="text-sm text-gray-500 mt-1">
          Add some items to get started
        </p>
      </div>
    );
  }

  const getItemPrice = (item) => item?.price ?? item?.product?.price ?? 0;
  const getItemName = (item) => item?.name || item?.product?.name || "Product";
  const getItemQuantity = (item) => item?.quantity ?? 1;
  const getItemImage = (item) =>
    item?.image?.url || item?.product?.image?.url || "/placeholder-product.png";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0
  );
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-24">
        <div className="space-y-2">
          {cartItems.map((item, i) => {
            const qty = getItemQuantity(item);
            const price = getItemPrice(item);
            const lineTotal = price * qty;

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors group border border-gray-100"
              >
                {/* Image */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={getItemImage(item)}
                    alt={getItemName(item)}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-product.png";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {getItemName(item)}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹{price.toFixed(2)} / kg
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() =>
                        qty <= 1 ? removeFromCart(item) : decreaseQuantity(item)
                      }
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                      title={qty <= 1 ? "Remove" : "Decrease"}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => {
                        const newQty = Number(e.target.value);
                        if (Number.isNaN(newQty) || newQty < 0) return;
                        if (newQty === 0) {
                          removeFromCart(item);
                        } else {
                          updateQuantity(item, newQty);
                        }
                      }}
                      className="mx-2 w-12 h-7 text-center border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:border-green-400"
                    />

                    <button
                      onClick={() => incrementQuantity(item)}
                      disabled={item.stock && qty >= item.stock}
                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <span className="text-xs text-gray-500 ml-2">kg</span>
                  </div>
                </div>

                {/* Line total + remove */}
                <div className="text-right flex flex-col items-end">
                  <p className="text-sm font-semibold text-green-600">
                    ₹{lineTotal.toFixed(2)}
                  </p>
                  {item.originalPrice && item.originalPrice > price && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{(item.originalPrice * qty).toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => removeFromCart(item)}
                    className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center"
                  >
                    <Trash className="w-3 h-3 mr-1" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200 mt-3">
          <div className="mb-2">
            <h5 className="text-base font-bold text-black flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Bill Details
            </h5>
            <hr className="border-t border-gray-200 my-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-sm font-semibold text-gray-800">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-600">
                Delivery
              </span>
              {subtotal > 500 && (
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  Free shipping!
                </span>
              )}
            </div>
            <span
              className={`text-sm font-semibold ${delivery === 0 ? "text-green-600" : "text-gray-800"
                }`}
            >
              {delivery === 0 ? "FREE" : "₹50.00"}
            </span>
          </div>

          {cartItems.length > 5 && (
            <div className="text-center text-xs text-gray-500 pt-1">
              +{cartItems.length - 5} more items in your cart
            </div>
          )}

          {subtotal < 500 && (
            <div className="text-xs text-center text-green-700 bg-green-50 px-2 py-1.5 rounded-lg mt-2">
              Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
            </div>
          )}
        </div>
      </div>

      {/* Fixed total */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">
            Total Amount
          </span>
          <span className="text-lg font-bold text-green-600">
            ₹{total.toFixed(2)}
          </span>
        </div>
        <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 mt-3">
          Proceed to Checkout
        </button>
      </div>
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
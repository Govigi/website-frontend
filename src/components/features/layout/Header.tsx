"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginModal } from "@/libs/context/LoginModalContext";
import { UserIcon } from "@phosphor-icons/react";
import { Label } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {

  const router = useRouter();
  const { open: openLogin } = useLoginModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Browse catalogue", href: "/webapp" },
    { label: "About us", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Contact us", href: "/#contact" },
  ];

  return (
    <>
      <nav className="h-20 bg-white/20 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full border-b border-gray-200 transition duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left Side - Logo + Desktop Menu */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/LOGO-png 3.svg"
                alt="Go-Vigi Logo"
                width={200}
                height={200}
                className="h-25 w-25 object-contain"
              />
            </Link>

            {menuItems.map((item) => (
              <div key={item.label} className="hidden md:flex space-x-6 text-md font-semibold text-gray-800">
                <Link href={item.href} className="cursor-pointer">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={() => openLogin()}
            className="md:flex md:py-2 items-center space-x-2 bg-green-600 text-white font-semibold md:px-16 px-4 py-2 rounded-lg cursor-pointer flex flex-row"
          >
            <span className="font-bold">Login/Signup</span>
          </button>

        </div>
      </nav>


      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div
            className={`fixed top-0 left-0 h-full w-3/4 sm:w-1/2 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex flex-col p-4 space-y-3 text-sm font-semibold text-black">
              <div className="flex justify-end mb-0">
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-auto -mr-2 p-2 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-800" aria-hidden="true" />
                </button>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

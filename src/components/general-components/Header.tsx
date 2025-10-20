"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "./LoginCard";
import { UserIcon } from "@phosphor-icons/react";

export default function Header() {

  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="h-20 bg-white/20 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full border-b border-gray-200 transition duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left Side - Logo + Desktop Menu */}
          <div className="flex items-center gap-8">
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
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
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

            <div className="hidden md:flex space-x-6 text-md font-semibold text-gray-800">
              <button
                onClick={() => router.push("/webapp")}
                className="cursor-pointer"
              >
                Browse catalogue
              </button>
            </div>
            <div className="hidden md:flex space-x-6 text-md font-semibold text-gray-800">
              <Link href="/#about" className="cursor-pointer">
                About us
              </Link>
            </div>
            <div className="hidden md:flex space-x-6 text-md font-semibold text-gray-800">
              <Link href="/#services" className="cursor-pointer">
                Services
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => setShowLogin(true)}
            className="md:flex md:py-2 items-center space-x-2 bg-green-600 text-white font-semibold md:px-16 px-4 py-2 rounded-lg cursor-pointer flex flex-row"
          >
            <span className="font-bold">Login/Signup</span>
          </button>

        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-black">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>
              About us
            </Link>
            <Link href="/#services" onClick={() => setMobileMenuOpen(false)}>
              Services
            </Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact us
            </Link>
            <button
              onClick={() => {
                router.push("/webapp");
                setMobileMenuOpen(false);
              }}
              className="text-left"
            >
              Browse catalogue
            </button>
            <button
              onClick={() => {
                setShowLogin(true);
                setMobileMenuOpen(false);
              }}
              className="text-green-600 text-left"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginCard
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={undefined}
      />
    </>
  );
}

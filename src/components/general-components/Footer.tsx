"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-white text-sm text-gray-700 overflow-x-hidden"
      id="contact"
    >

      {/* Footer Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/logo.svg"
              alt="Go-Vigi Logo"
              width={480}
              height={480}
              className="h-10 w-18 object-contain"
            />
          </div>
          <p className="text-gray-500 mb-2">
            Trusted by retailers. Built for scale.
          </p>
          <p className="text-gray-500 mb-4">Delivered with care.</p>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="#">Home</Link>
            </li>
            <li>
              <Link href="#">About us</Link>
            </li>
            <li>
              <Link href="#">Services</Link>
            </li>
            <li>
              <Link href="#">Benefits</Link>
            </li>
            <li>
              <Link href="#">Categories</Link>
            </li>
            <li>
              <Link href="#">Testimonials</Link>
            </li>
            <li>
              <Link href="#">Contact us</Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-semibold mb-3">Follow us</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </li>
            <li className="flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="w-4 h-4" /> FaceBook
            </li>
            <li className="flex items-center gap-2">
              <Youtube className="w-4 h-4" /> Youtube
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Contact us</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> contact@govigi.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +91 9346928139
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1" />
              <span>
                Hyderabad
                <br />
                Telangana, TS 94102
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t pt-4 pb-6 px-6 sm:px-16 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-500">
        <p>Copyright © 2025 Go-vigi</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
            Terms and Conditions
          </Link>
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>

      <div className="p-4 text-center text-sm text-gray-500">
        Govigi is a brand owned and managed by <strong>Triizi Energy Pvt. Ltd.</strong>, a company committed to building innovative technology solutions that simplify everyday life.
      </div>
    </footer>
  );
}

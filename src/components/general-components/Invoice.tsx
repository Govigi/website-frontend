"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Phone, Mail, Globe, MessageCircle, Loader2 } from "lucide-react";

export default function Invoice({
  orderId,
  orderDate,
  invoiceDate,
  customerName,
  mobile,
  address,
  products,
  shippingCharges,
  autoDownload = false,
}) {
  const invoiceRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalTax = products.reduce(
    (sum, p) => sum + (p.price * p.quantity * p.taxRate) / 100,
    0
  );
  const grandTotal = subtotal + shippingCharges + totalTax;

  const downloadPDF = async () => {
    const node = invoiceRef.current;
    if (!node) return;

    setLoading(true); // Start spinner
    try {
      const isMobile = window.innerWidth < 768;
      const originalStyles = {
        width: node.style.width,
        maxWidth: node.style.maxWidth,
        transform: node.style.transform,
      };

      // 👇 Force A4 (desktop) width for mobile devices
      if (isMobile) {
        node.style.width = "794px"; 
        node.style.maxWidth = "794px";
        node.style.transform = "scale(1)";
        node.style.transformOrigin = "top left";
      }

      await new Promise((r) => setTimeout(r, 300)); // allow layout to stabilize

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: { transform: "none", transformOrigin: "top left" },
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 👇 Split into pages automatically if longer than A4
      if (imgHeight > pdfHeight) {
        let remainingHeight = imgHeight;
        let yOffset = 0;
        const topMargin = 10;

        while (remainingHeight > 0) {
          pdf.addImage(dataUrl, "PNG", 0,  -yOffset, imgWidth, imgHeight);
          remainingHeight -= pdfHeight;
          yOffset += pdfHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      } else {
        pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      }

      // 👇 Restore original styles
      if (isMobile) {
        node.style.width = originalStyles.width;
        node.style.maxWidth = originalStyles.maxWidth;
        node.style.transform = originalStyles.transform;
      }

      pdf.save(`invoice-${orderId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  useEffect(() => {
    if (autoDownload) downloadPDF();
  }, []);

  return (
    <div className="bg-white w-full max-w-4xl mx-auto min-h-screen p-4 sm:p-6">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={downloadPDF}
          disabled={loading}
          className={`flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 cursor-pointer"
          } transition text-white font-medium py-2 px-4 rounded shadow-md`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            "Download PDF"
          )}
        </button>

        <Link href="/ordershistory" className="text-blue-600 font-medium">
          Back
        </Link>
      </div>

      {/* Invoice Content */}
      <div
        ref={invoiceRef}
        className="bg-white rounded-xl p-6 shadow-md mx-auto w-full sm:w-[794px]"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6">
          <div className="text-3xl font-extrabold text-green-700 tracking-wide">
            GoVigi
          </div>
          <div className="text-right space-y-1 mt-4 md:mt-0">
            <p className="text-lg text-gray-500 font-medium">TAX INVOICE</p>
          </div>
        </div>

        {/* Order + Contact Info */}
        <div className="grid sm:grid-cols-2 gap-6 text-gray-700 mb-6">
          <div className="flex flex-col justify-start ml-2 sm:ml-5">
            <p>
              <strong>Order ID:</strong> {orderId}
            </p>
            <p>
              <strong>Order Date:</strong> {orderDate}
            </p>
            <p>
              <strong>Invoice Date:</strong> {invoiceDate}
            </p>
          </div>

          <div className="flex flex-col justify-end mr-2 sm:mr-5">
            <p className="flex items-center justify-end gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              +91 9876543210
            </p>
            <p className="flex items-center justify-end gap-2">
              <Mail className="w-4 h-4 text-green-600" />
              support@govigi.com
            </p>
            <p className="flex items-center justify-end gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              www.govigi.com
            </p>
          </div>

          {/* Billing Address */}
          <div className="ml-2 sm:ml-5">
            <h3 className="font-semibold text-gray-800 mb-1">
              Billing Address
            </h3>
            <p>Lordven Vegetables Supply</p>
            <p>
              9-6-72/7, Anjaiah nagar, old Bowenpally, Secunderabad - 500009
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" />
              +91 98765 43210
            </p>
          </div>

          {/* Shipping Address */}
          <div className="ml-2 sm:ml-5">
            <h3 className="font-semibold text-gray-800 mb-1">
              Shipping Address
            </h3>
            <p>{customerName}</p>
            <p>{address}</p>
            {mobile && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                +91 {mobile}
              </p>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto mb-6 border-b border-gray-300">
          <table className="min-w-full border border-gray-300 rounded overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Qty</th>
                <th className="text-left px-4 py-2">Price</th>
                <th className="text-left px-4 py-2">Tax (%)</th>
                <th className="text-left px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {products.map((item, idx) => {
                const total = item.price * item.quantity;
                const taxAmount = (total * item.taxRate) / 100;
                return (
                  <tr key={idx}>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">₹{item.price}</td>
                    <td className="p-3">{item.taxRate}%</td>
                    <td className="p-3 font-medium">
                      ₹{(total + taxAmount).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="text-right space-y-1 border-b border-gray-300">
          <p className="font-medium flex justify-end m-5 gap-10">
            <b>Subtotal</b>
            <span className="text-gray-500">₹{subtotal.toFixed(2)}</span>
          </p>
          <p className="font-medium flex justify-end m-5 gap-10">
            <b>Shipping Charges</b>
            <span className="text-gray-500">₹{shippingCharges.toFixed(2)}</span>
          </p>
          <p className="font-medium flex justify-end m-5 gap-10">
            <b>Total Tax</b>
            <span className="text-gray-500">₹{totalTax.toFixed(2)}</span>
          </p>
        </div>

        {/* Grand Total */}
        <div className="text-right border-b border-gray-300">
          <p className="text-lg font-medium flex justify-end m-5 gap-10">
            <b>Grand Total</b>
            <span className="text-gray-500">₹{grandTotal.toFixed(2)}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 break-before-page">
          <p className="text-center text-sm md:text-base">
            This is a system-generated invoice.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center mt-3">
            <p className="text-2xl font-bold text-center md:text-left">
              Thank you for choosing GoVigi
            </p>
            <QRCodeSVG value="https://govigi.com/" size={80} />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'
import React, { Suspense, useState, useEffect } from "react";
import Step1Phone from "../../components/vendor-onboarding/Steps/Step1Phone";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
    QuestionMarkCircleIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    DocumentTextIcon,
    ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { Modal } from "@/components/UI/Modal";

export default function VendorOnboardingPage() {
    const [open, setOpen] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("vendorToken");
        if (token) {
            router.push("/onboarding/step1");
        } else {
            setCheckingToken(false);
        }
    }, [router]);

    if (checkingToken) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">
                Checking session...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Toaster 
                position="top-center" 
                toastOptions={{ style: { fontSize: "14px", fontWeight: 600 } }} 
            />

            {/* --- Neat Help & Support Modal --- */}
            <Modal open={open} onOpenChange={setOpen}>
                <Modal.Content className="max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-zinc-100">
                    <Modal.Header onClose={() => setOpen(false)} className="border-b border-zinc-100 pb-4">
                        <Modal.Title className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-600" />
                            Help & Support
                        </Modal.Title>
                    </Modal.Header>
                    
                    <Modal.Body className="pt-5 pb-6 space-y-6">
                        {/* Intro Text */}
                        <div>
                            <p className="text-sm text-zinc-500">
                                Need assistance with your partner onboarding? Explore our resources or get in touch with our dedicated team.
                            </p>
                        </div>

                        {/* Quick Resources Section */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quick Resources</h4>
                            <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl bg-white overflow-hidden">
                                <a href="#faq" className="flex items-center justify-between p-3.5 hover:bg-zinc-50/70 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                        <span className="text-sm font-medium text-zinc-700">Onboarding Guide & FAQs</span>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                                </a>
                                <a href="#terms" className="flex items-center justify-between p-3.5 hover:bg-zinc-50/70 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                        <span className="text-sm font-medium text-zinc-700">Partner Terms & Policies</span>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                                </a>
                            </div>
                        </div>

                        {/* Direct Contact Section */}
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact Us</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a href="mailto:support@govigi.com" className="flex flex-col items-start p-4 rounded-xl border border-zinc-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 mb-3">
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-zinc-800">Email Support</span>
                                    <span className="text-xs text-zinc-400 mt-0.5">support@govigi.com</span>
                                </a>

                                <a href="tel:+1234567890" className="flex flex-col items-start p-4 rounded-xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all group">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 mb-3">
                                        <PhoneIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-zinc-800">Phone Support</span>
                                    <span className="text-xs text-zinc-400 mt-0.5">Mon-Fri, 9am - 6pm</span>
                                </a>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Content>
            </Modal>
            
            <Header onOpenHelp={() => setOpen(true)} />
            
            <main className="flex-1 w-full flex flex-col justify-start">
                <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Loading...</div>}>
                    <Step1Phone onVerified={() => router.push("/onboarding/step1")} />
                </Suspense>
            </main>
        </div>
    );
}

function Header({ onOpenHelp }: { onOpenHelp: () => void }) {
    return (
        <header className="bg-white border-b border-zinc-100 px-6 sm:px-12 h-18 flex items-center justify-between sticky top-0 z-45 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/LOGO-png 3.svg" alt="Govigi" width={80} height={32} priority />
                <span className="text-xs text-zinc-400 border-l border-zinc-200 pl-2 font-medium">Partner</span>
            </Link>
            
            <div
                onClick={onOpenHelp}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-500 cursor-pointer hover:text-zinc-850 transition-colors">
                <QuestionMarkCircleIcon className="w-4.5 h-4.5 text-zinc-400" />
                <span>Help & Support</span>
            </div>
        </header>
    );
}
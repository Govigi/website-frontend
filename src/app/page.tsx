"use client";
import PriceList from "../components/general-components/PriceList";
import Bulk from "../components/general-components/Bulk";
import QualitySection from "../components/general-components/QualitySection";
import BulkBenefitsSection from "../components/general-components/BulkBenefitsSection";
import FaqSection from "../components/general-components/FaqSection";
import Footer from "../components/general-components/Footer";
import Stat from "../components/general-components/Stat";
import JoinSection from "../components/general-components/JoinSection";
import SustainabilitySection from "../components/general-components/SustainabilitySection";
import TestimonialCarousel from "../components/general-components/TestimonialCarousel";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/context/AuthContext";
import React, { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/webapp");
    }
  }, [isAuthenticated]);

  return (
    <main className="font-sans bg-white text-black overflow-x-hidden">
      {/* <Sample/> */}
      <Bulk />
      <Stat />
      <JoinSection />
      <BulkBenefitsSection />
      <QualitySection />
      <PriceList />
      <SustainabilitySection />
      <TestimonialCarousel />
      <FaqSection />
      <Footer />
    </main>
  );
}

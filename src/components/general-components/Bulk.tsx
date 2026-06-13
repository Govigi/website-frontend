"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HomePage = () => {
  const [posterIndex, setPosterIndex] = useState(0);

  const images = ["/Carousel.jpeg", "Carousel_3.png", "/Carousel_4.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPosterIndex((prev) => (prev + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevPoster = () => setPosterIndex((prev) => (prev - 1 + images.length) % images.length);
  const handleNextPoster = () => setPosterIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden bg-white">
      {/* Slide Container */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${posterIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="flex-shrink-0 w-full h-full">
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevPoster}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1.5 md:p-2.5 shadow-md z-20 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      <button
        onClick={handleNextPoster}
        className="absolute right-4 md:left-auto md:right-8 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1.5 md:p-2.5 shadow-md z-20 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-2.5 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setPosterIndex(i)}
            className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
              posterIndex === i ? "bg-white scale-125 shadow" : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;

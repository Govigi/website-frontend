"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Poster0 from "../../app/posters/Poster0";
import Poster1 from "../../app/posters/Poster1";
import Poster2 from "../../app/posters/Poster2";

const HomePage = () => {
  const containerRef = useRef(null);
  const [posterIndex, setPosterIndex] = useState(0);

  // Mobile slider state
  const images = ["/3.png", "/2.png", "/4.png"];
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileSliderRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosterIndex((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevPoster = () => setPosterIndex((prev) => (prev - 1 + 3) % 3);
  const handleNextPoster = () => setPosterIndex((prev) => (prev + 1) % 3);

  return (
    <div className="relative">
      {/* Desktop Poster Section */}
      <div className="hidden md:flex h-[650px] items-center justify-center overflow-hidden relative">
        {posterIndex === 0 && <Poster0 containerRef={containerRef} />}
        {posterIndex === 1 && <Poster1 />}
        {posterIndex === 2 && <Poster2 />}
        <button
          onClick={handlePrevPoster}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white z-20"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={handleNextPoster}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white z-20"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Mobile Slider */}
      <div className="md:hidden h-[500px] overflow-x-hidden">
        <div
          ref={mobileSliderRef}
          className="flex transition-all duration-500 ease-in-out"
          style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-[450px]">
              <img
                src={src}
                alt={`Image ${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-5 space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setMobileIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                mobileIndex === i ? "bg-black" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
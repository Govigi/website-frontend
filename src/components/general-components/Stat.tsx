"use client";

import React from "react";

const stats = [
  { value: "50+", label: "Partners rely on us" },
  { value: "50+", label: "Orders processed" },
  { value: "100+", label: "Successful deliveries" },
  { value: "10+", label: "Trusted seller brands" },
];

const Stat = () => {
  return (
    <div className="bg-white py-6 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-xl max-w-5xl mx-auto overflow-x-auto">
        {/* Grid on small devices (2x2), switches to horizontal flex on sm+ */}
        <div className="grid grid-cols-2 gap-4 justify-center sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-8">
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center text-center text-xs sm:text-sm">
                <h3 className="text-green-600 font-bold text-base sm:text-4xl">
                  {stat.value}
                </h3>
                <p className="text-black font-bold mt-1 leading-tight text-xs sm:text-lg whitespace-normal sm:whitespace-nowrap">
                  {stat.label}
                </p>
              </div>

              {/* Divider only visible on sm+ (horizontal layout) */}
              {index < stats.length - 1 && (
                <div className="hidden sm:block h-20 w-[2px] bg-gradient-to-b from-white/0 via-gray-300 to-white/0"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stat;

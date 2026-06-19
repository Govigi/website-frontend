import React from "react";
import { CheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/utils";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

const STEPS = [
  { id: 1, label: "Business & Owner Details" },
  { id: 2, label: "Store Setup" },
  { id: 3, label: "Bank Details" },
  { id: 4, label: "Business Verification" },
  { id: 5, label: "Review & Agreement" },
];

interface SidebarProps {
  currentStep: number;
  showFormOnMobile?: boolean;
  onContinue?: () => void;
}

export default function Sidebar({ currentStep, showFormOnMobile = false, onContinue }: SidebarProps) {
  return (
    <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
          <h3 className="text-base font-extrabold text-zinc-800">Registration Progress</h3>
        </div>
        
        <div className="p-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[37px] top-10 bottom-10 w-[1.5px] bg-zinc-100 z-0" />
          
          <ul className="space-y-6 relative z-10">
            {STEPS.map((s) => {
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;
              
              return (
                <li key={s.id} className="relative flex items-start gap-4">
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute -left-6 top-0 bottom-0 w-[3px] bg-green-600 rounded-r-md" />
                  )}
                  
                  {/* Badge */}
                  <div className={cn(
                    "w-[26px] h-[26px] rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 text-[10px] font-bold",
                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                    isActive ? "bg-green-600 border-green-600 text-white shadow-lg" :
                    "bg-white border-zinc-200 text-zinc-400"
                  )}>
                    {isCompleted ? <CheckIcon className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-green-600 font-semibold" : isCompleted ? "text-zinc-800" : "text-zinc-450"
                    )}>
                      {s.label}
                    </h4>
                    
                    {/* Render continue button directly under active step on mobile */}
                    {isActive && !showFormOnMobile && (
                      <div className="mt-3 lg:hidden">
                        <button
                          type="button"
                          onClick={onContinue}
                          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-md shadow-sm text-xs active:scale-[0.98] transition-all"
                        >
                          Continue
                          <CaretRightIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";

interface FilterTagProps {
  status: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onRemove: () => void;
}

export default function FilterTag({
  status,
  label,
  color,
  bgColor,
  borderColor,
  onRemove,
}: FilterTagProps) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${bgColor} ${color} border ${borderColor}`}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity flex-shrink-0"
        title="Remove filter"
      >
        <XCircleIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

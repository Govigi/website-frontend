"use client";

interface FilterButtonProps {
  label: string;
  value: string;
  onClick: () => void;
}

export default function FilterButton({
  label,
  value,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
    >
      {label}
    </button>
  );
}

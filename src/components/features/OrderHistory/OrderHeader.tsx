"use client";

import SearchBar from "./SearchBar";
import FilterTag from "./FilterTag";
import FilterButton from "./FilterButton";

interface OrderHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: string[];
  onStatusSelect: (status: string) => void;
  onStatusRemove: (status: string) => void;
  statusFilters: any[];
}

export default function OrderHeader({
  searchTerm,
  onSearchChange,
  selectedStatuses,
  onStatusSelect,
  onStatusRemove,
  statusFilters,
}: OrderHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
      <div className="flex gap-2 items-center">
        <SearchBar value={searchTerm} onChange={onSearchChange} />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {selectedStatuses.map((status) => {
          const filter = statusFilters.find((f) => f.value === status);
          return (
            <FilterTag
              key={`tag-${status}`}
              status={status}
              label={filter?.label || ""}
              color={filter?.color || "text-gray-700"}
              bgColor={filter?.bgColor || "bg-gray-100"}
              borderColor={filter?.borderColor || "border-gray-300"}
              onRemove={() => onStatusRemove(status)}
            />
          );
        })}

        {statusFilters.map((filter) => {
          const isSelected = selectedStatuses.includes(filter.value);
          if (isSelected) return null;
          return (
            <FilterButton
              key={filter.value}
              value={filter.value}
              label={filter.label}
              onClick={() => onStatusSelect(filter.value)}
            />
          );
        })}
      </div>
    </div>
  );
}

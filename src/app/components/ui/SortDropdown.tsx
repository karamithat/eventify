// components/ui/SortDropdown.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SortOption = "Relevance" | "Date";

type SortDropdownProps = {
  defaultValue?: SortOption;
  onSelect: (value: SortOption) => void;
};

const SortDropdown = ({
  defaultValue = "Relevance",
  onSelect,
}: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SortOption>(defaultValue);

  const options: SortOption[] = ["Relevance", "Date"];

  const handleSelect = (value: SortOption) => {
    setSelected(value);
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700">Sort by:</span>
      <div className="relative w-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex justify-between items-center border border-gray-300 px-4 py-2 rounded-md bg-white text-sm font-medium"
        >
          {selected}
          {isOpen ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md text-sm">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                  selected === option ? "font-semibold text-primary" : ""
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown;

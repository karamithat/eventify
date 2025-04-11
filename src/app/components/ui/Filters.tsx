// src/components/ui/Filters.tsx
"use client";

import { useState } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterCategory {
  title: string;
  options: FilterOption[];
}

const filters: FilterCategory[] = [
  {
    title: "Price",
    options: [
      { label: "Free", value: "free" },
      { label: "Paid", value: "paid" },
    ],
  },
  {
    title: "Date",
    options: [
      { label: "Today", value: "today" },
      { label: "Tomorrow", value: "tomorrow" },
      { label: "This Week", value: "this_week" },
      { label: "This Weekend", value: "this_weekend" },
      { label: "Pick a Date", value: "pick_date" },
    ],
  },
  {
    title: "Category",
    options: [
      { label: "Adventure Travel", value: "adventure_travel" },
      { label: "Art Exhibitions", value: "art_exhibitions" },
      { label: "Auctions & Fundraisers", value: "auctions_fundraisers" },
      { label: "Beer Festivals", value: "beer_festivals" },
      { label: "Benefit Concerts", value: "benefit_concerts" },
    ],
  },
  {
    title: "Format",
    options: [
      { label: "Community Engagement", value: "community_engagement" },
      { label: "Concerts & Performances", value: "concerts_performances" },
      { label: "Conferences", value: "conferences" },
      { label: "Experiential Events", value: "experiential_events" },
      { label: "Festivals & Fairs", value: "festivals_fairs" },
    ],
  },
];

const Filters: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (value: string) => {
    setSelectedFilters((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };

  return (
    <div className="space-y-8 text-primary border-r-1 border-gray-300 pr-6">
      {filters.map((category) => (
        <div key={category.title}>
          <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
          <div className="space-y-3">
            {category.options.map((option) => (
              <label key={option.value} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  className="mr-2 accent-primary"
                  checked={selectedFilters.includes(option.value)}
                  onChange={() => toggleFilter(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          {/* More link */}
          <button className="mt-3 text-primary hover:underline text-sm">
            More
          </button>
          <hr className="mt-6 border-gray-500" />
        </div>
      ))}
    </div>
  );
};

export default Filters;

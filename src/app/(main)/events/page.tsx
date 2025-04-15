// app/page.tsx
"use client";

import React from "react";
import List from "../../components/ui/List";
import Hero from "../../components/home/Hero";
import Container from "../../components/ui/Container";
import Filters from "../../components/ui/Filters";
import SortDropdown from "../../components/ui/SortDropdown";

const Page = () => {
  const handleSort = (value: string) => {
    console.log("Sorted by:", value);
  };

  return (
    <div>
      <Hero
        subtitle="Explore a world of events. Find what excites you!"
        backgroundColor="bg-primary-900"
        location="İstanbul"
      />
      <Container>
        {/* Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 mt-5 mb-5">
          <aside className="w-64 hidden lg:block mt-5 mb-5">
            <Filters />
          </aside>

          {/* Main Content */}
          <main>
            <div className="flex justify-end mb-12">
              <SortDropdown onSelect={handleSort} />
            </div>
            <List />
          </main>
        </div>
      </Container>
    </div>
  );
};

export default Page;

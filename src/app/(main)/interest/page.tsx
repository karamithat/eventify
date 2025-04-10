"use client";

import React from "react";
import Container from "../../components/ui/Container";
// 👈 Container componentini import ediyoruz

const interests = [
  {
    category: "Music",
    tags: ["Concerts", "Music Festivals", "Music Workshops", "DJ Nights"],
  },
  {
    category: "Arts & Culture",
    tags: [
      "Art Exhibitions",
      "Cultural Festivals",
      "Theater Plays",
      "Dance Performances",
    ],
  },
  {
    category: "Food & Drink",
    tags: [
      "Food Festivals",
      "Wine Tasting",
      "Cooking Classes",
      "Beer Festivals",
    ],
  },
  {
    category: "Sports & Fitness",
    tags: [
      "Marathons",
      "Yoga Sessions",
      "Fitness Workshops",
      "Sporting Events",
    ],
  },
  {
    category: "Business & Networking",
    tags: ["Conferences", "Seminars", "Workshops", "Networking Events"],
  },
  {
    category: "Family & Kids",
    tags: [
      "Family-Friendly Events",
      "Children Workshops",
      "Kids-Friendly Shows",
      "Educational Activities",
    ],
  },
  {
    category: "Technology",
    tags: ["Tech Conferences", "Hackathons", "Startup Events", "Gadget Expos"],
  },
  {
    category: "Comedy & Entertainment",
    tags: [
      "Stand-up Comedy",
      "Improv Nights",
      "Comedy Festivals",
      "Magic Shows",
    ],
  },
  {
    category: "Charity & Causes",
    tags: [
      "Fundraising Events",
      "Charity Galas",
      "Benefit Concerts",
      "Auctions & Fundraisers",
    ],
  },
  {
    category: "Education & Learning",
    tags: [
      "Lectures & Talks",
      "Workshops",
      "Educational Seminars",
      "Skill Building Sessions",
    ],
  },
  {
    category: "Travel & Adventures",
    tags: [
      "City Tours",
      "Adventure Travel",
      "Cultural Experiences",
      "Cruise Vacations",
    ],
  },
];

const InterestPage = () => {
  return (
    <section className="min-h-screen bg-white text-primary py-12">
      <Container>
        {/* Top Text */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Share your interests with us
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            Choose your interests below to get personalized event suggestions.
          </p>

          {/* Interests List */}
          <div className="space-y-8">
            {interests.map((interest, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-3">
                  {interest.category}
                </h3>
                <div className="flex flex-wrap gap-2 border-b-1 pb-6 border-gray-200">
                  {interest.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-secondary text-primary text-xs sm:text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-yellow-400 transition"
                    >
                      {tag}
                      <span className="ml-1">✕</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex justify-end">
          <button className="bg-primary text-white text-sm sm:text-base font-medium px-6 py-2 rounded-md hover:bg-primary-dark transition">
            Save my Interests
          </button>
        </div>
      </Container>
    </section>
  );
};

export default InterestPage;

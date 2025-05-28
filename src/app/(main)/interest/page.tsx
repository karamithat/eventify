"use client";
import React, { useState } from "react";
import Container from "../../components/ui/Container";

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
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Etiket seçme/seçimi kaldırma fonksiyonu
  const toggleInterest = (tag) => {
    const newSelectedInterests = new Set(selectedInterests);
    if (newSelectedInterests.has(tag)) {
      newSelectedInterests.delete(tag);
    } else {
      newSelectedInterests.add(tag);
    }
    setSelectedInterests(newSelectedInterests);
  };

  // Database'e kaydetme fonksiyonu
  const saveInterests = async () => {
    if (selectedInterests.size === 0) {
      alert("Lütfen en az bir ilgi alanı seçiniz!");
      return;
    }

    setIsLoading(true);

    try {
      // API endpoint'inizi buraya yazın
      const response = await fetch("/api/user/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interests: Array.from(selectedInterests),
        }),
      });

      if (response.ok) {
        alert("İlgi alanlarınız başarıyla kaydedildi!");
        // İsteğe bağlı: Başka bir sayfaya yönlendirme
        // router.push('/dashboard');
      } else {
        throw new Error("Kaydetme işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Error saving interests:", error);
      alert("Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {/* Top Text */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Share your interests with us
        </h1>
        <p className="text-gray-600">
          Choose your interests below to get personalized event suggestions.
        </p>
      </div>

      {/* Selected Count */}
      <div className="text-center mb-6">
        <span className="text-sm text-gray-500">
          {selectedInterests.size} ilgi alanı seçildi
        </span>
      </div>

      {/* Interests List */}
      <div className="space-y-6 mb-8">
        {interests.map((interest, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {interest.category}
            </h3>
            <div className="flex flex-wrap gap-3">
              {interest.tags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleInterest(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    selectedInterests.has(tag)
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-md"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                  {selectedInterests.has(tag) && (
                    <span className="ml-2 text-black">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={saveInterests}
          disabled={isLoading || selectedInterests.size === 0}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
            isLoading || selectedInterests.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl"
          }`}
        >
          {isLoading ? "Kaydediliyor..." : "Save my Interests"}
        </button>
      </div>
    </Container>
  );
};

export default InterestPage;

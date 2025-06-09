"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import Container from "../../components/ui/Container";

// TypeScript interfaces
interface Interest {
  category: string;
  tags: string[];
}

interface ApiResponse {
  success: boolean;
  interests: string[];
  message?: string;
}

const interests: Interest[] = [
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

// API fonksiyonları
const fetchUserInterests = async (): Promise<string[]> => {
  const response = await fetch("/api/user/interests");
  if (!response.ok) {
    throw new Error("Failed to fetch interests");
  }
  const data: ApiResponse = await response.json();
  return data.interests || [];
};

const saveUserInterests = async (interests: string[]): Promise<ApiResponse> => {
  const response = await fetch("/api/user/interests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interests,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save interests");
  }

  return response.json();
};

const InterestPage: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set()
  );
  const queryClient = useQueryClient();

  // React Query ile ilgi alanlarını yükle
  const {
    data: userInterests,
    isLoading: isLoadingInterests,
    error,
    isSuccess,
  } = useQuery<string[], Error>({
    queryKey: ["userInterests"],
    queryFn: fetchUserInterests,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 dakika
    refetchOnWindowFocus: false,
  });

  // Data yüklendiğinde selectedInterests'i güncelle
  useEffect(() => {
    if (isSuccess && userInterests) {
      setSelectedInterests(new Set(userInterests));
      if (userInterests.length > 0) {
        toast.success(`${userInterests.length} ilgi alanınız yüklendi`, {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
        });
      }
    }
  }, [isSuccess, userInterests]);

  // Error durumunda toast göster
  useEffect(() => {
    if (error) {
      toast.error("İlgi alanları yüklenirken hata oluştu", {
        duration: 3000,
        position: "top-center",
      });
    }
  }, [error]);

  // React Query Mutation ile kaydetme
  const saveInterestsMutation = useMutation<ApiResponse, Error, string[]>({
    mutationFn: saveUserInterests,
    onSuccess: () => {
      toast.success("İlgi alanlarınız başarıyla kaydedildi! 🎉", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });
      // Cache'i güncelle
      queryClient.setQueryData<string[]>(
        ["userInterests"],
        Array.from(selectedInterests)
      );
    },
    onError: (error) => {
      console.error("Save interests error:", error);
      toast.error(
        "Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        }
      );
    },
  });

  // Etiket seçme/seçimi kaldırma fonksiyonu
  const toggleInterest = (tag: string): void => {
    const newSelectedInterests = new Set(selectedInterests);
    if (newSelectedInterests.has(tag)) {
      newSelectedInterests.delete(tag);
    } else {
      newSelectedInterests.add(tag);
    }
    setSelectedInterests(newSelectedInterests);
  };

  // Kaydetme fonksiyonu
  const saveInterests = async (): Promise<void> => {
    if (selectedInterests.size === 0) {
      toast.error("Lütfen en az bir ilgi alanı seçiniz!", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    // Loading toast göster
    const loadingToast = toast.loading("İlgi alanlarınız kaydediliyor...", {
      position: "top-center",
    });

    try {
      // Biraz bekleme ekleyelim (gerçekçi loading experience için)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await saveInterestsMutation.mutateAsync(Array.from(selectedInterests));
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error in saveInterests:", error);
    }
  };

  return (
    <>
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

            {/* Loading State */}
            {isLoadingInterests && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500">İlgi alanlarınız yükleniyor...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-700">
                  Bir hata oluştu. Lütfen sayfayı yenileyin.
                </p>
                <button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["userInterests"],
                    })
                  }
                  className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                >
                  Tekrar dene
                </button>
              </div>
            )}

            {/* Interests List */}
            {!isLoadingInterests && !error && (
              <>
                {/* Selected Count */}
                {selectedInterests.size > 0 && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      ✨ {selectedInterests.size} ilgi alanı seçili
                    </p>
                  </div>
                )}

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
                            onClick={() => toggleInterest(tag)}
                            className={`inline-flex items-center text-xs sm:text-sm font-medium px-3 py-1 rounded-full cursor-pointer transition ${
                              selectedInterests.has(tag)
                                ? "bg-yellow-400 text-primary"
                                : "bg-white text-primary hover:bg-yellow-400"
                            }`}
                          >
                            {tag}
                            {selectedInterests.has(tag) && (
                              <span className="ml-1">✕</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          {!isLoadingInterests && !error && (
            <div className="mt-12 flex justify-end">
              <button
                onClick={saveInterests}
                disabled={
                  saveInterestsMutation.isPending ||
                  selectedInterests.size === 0
                }
                className={`text-sm sm:text-base font-medium px-6 py-2 rounded-md transition flex items-center gap-2 cursor-pointer ${
                  saveInterestsMutation.isPending ||
                  selectedInterests.size === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {saveInterestsMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saveInterestsMutation.isPending
                  ? "Kaydediliyor..."
                  : "Save my Interests"}
              </button>
            </div>
          )}
        </Container>
        <Toaster />
      </section>
    </>
  );
};

export default InterestPage;

"use client";

import Container from "@/app/components/ui/Container";
import EventCard from "@/app/components/ui/EventCard";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Heart, Filter, Search, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  eventType: string;
  ticketName?: string;
  ticketPrice?: number;
  imageUrl?: string;
  isPublished: boolean;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}

interface User {
  id: string;
  name?: string;
  email: string;
  interests: string[];
}

const InterestedPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "my-interests">("my-interests");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Available categories
  const categories = [
    "Music",
    "Sport",
    "Conference",
    "Workshop",
    "Networking",
    "Art & Culture",
    "Food & Drink",
    "Travel & Adventure",
    "Educational & Business",
    "Sports & Fitness",
    "Cultural & Arts",
    "Other",
  ];

  // Session kontrolü
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/interested");
    }
  }, [session, status, router]);

  // Kullanıcı ilgi alanlarını getir
  const fetchUserInterests = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user.interests) {
          setUserInterests(data.user.interests);
        }
      }
    } catch (error) {
      console.error("Error fetching user interests:", error);
    }
  };

  // Eventleri getir
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Sadece yayınlanmış eventleri göster
          const publishedEvents = data.events.filter(
            (event: Event) => event.isPublished
          );
          setEvents(publishedEvents);
        }
      } else {
        toast.error("Etkinlikler yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Etkinlikler yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserInterests();
      fetchEvents();
    }
  }, [session]);

  // Eventleri filtrele
  const filteredEvents = events.filter((event) => {
    // İlgi alanlarına göre filtrele
    if (filter === "my-interests") {
      if (userInterests.length === 0) return false;
      if (!userInterests.includes(event.category)) return false;
    }

    // Kategori filtresi
    if (selectedCategory !== "all" && event.category !== selectedCategory) {
      return false;
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      })
      .toUpperCase();
  };

  const formatLocation = (event: Event) => {
    if (event.location === "Venue" && event.venueName) {
      return `${event.venueName}, ${event.venueCity}`;
    }
    return event.location;
  };

  const formatPrice = (event: Event) => {
    if (event.eventType === "free") {
      return "FREE";
    }
    return `${event.ticketPrice} ₺`;
  };

  // Loading durumu
  if (status === "loading" || isLoading) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Eventler yükleniyor...</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Giriş yapılmamışsa
  if (!session) {
    return null;
  }

  return (
    <>
      <section className="py-16 bg-gray-50 min-h-screen">
        <Container>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Interested Events
            </h1>
          </div>

          {/* User Interests Display */}
          {userInterests.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Your Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {userInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              {userInterests.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No interests selected.
                  <button
                    onClick={() => router.push("/profile")}
                    className="text-primary hover:underline ml-1"
                  >
                    Update your profile
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Interest Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "my-interests")
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="my-interests">My Interests Only</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">
                  {filteredEvents.length}
                </span>{" "}
                events found
              </div>
              <div>
                <span className="font-medium text-primary">
                  {userInterests.length}
                </span>{" "}
                interests selected
              </div>
              {filter === "my-interests" && (
                <div>
                  <span className="font-medium text-green-600">
                    {
                      events.filter((e) => userInterests.includes(e.category))
                        .length
                    }
                  </span>{" "}
                  matching your interests
                </div>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  category={event.category}
                  date={formatDate(event.startDate)}
                  title={event.title}
                  location={formatLocation(event)}
                  time={`${event.startTime}${
                    event.endTime ? ` - ${event.endTime}` : ""
                  }`}
                  price={formatPrice(event)}
                  interested={
                    event._count?.registrations
                      ? `${event._count.registrations} interested`
                      : ""
                  }
                  image={event.imageUrl || "/images/events/default.png"}
                  eventId={event.id}
                />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "my-interests"
                  ? "No events match your interests"
                  : "No events found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === "my-interests"
                  ? userInterests.length === 0
                    ? "Add some interests to your profile to see relevant events"
                    : "Try adjusting your search or check back later for new events"
                  : "Try adjusting your search criteria"}
              </p>

              {filter === "my-interests" && userInterests.length === 0 && (
                <button
                  onClick={() => router.push("/profile")}
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition inline-flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Update Your Interests
                </button>
              )}

              {filter === "my-interests" && userInterests.length > 0 && (
                <button
                  onClick={() => setFilter("all")}
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition"
                >
                  View All Events
                </button>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Toast Container */}
      <Toaster />
    </>
  );
};

export default InterestedPage;

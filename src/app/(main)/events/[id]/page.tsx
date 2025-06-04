"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Container from "../../../components/ui/Container";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Heart,
  ArrowLeft,
  User,
  Tag,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
} from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  tags?: string[];
}

interface RelatedEvent {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  location: string;
  venueName?: string;
  venueCity?: string;
  imageUrl?: string;
  eventType: string;
  ticketPrice?: number;
  category: string;
}

const EventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Event verilerini getir
  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Event not found!");
          router.push("/events");
          return;
        }
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      setEvent(data.event);

      // Benzer etkinlikleri getir
      fetchRelatedEvents(data.event.category, eventId);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event");
      router.push("/events");
    } finally {
      setIsLoading(false);
    }
  };

  // Benzer etkinlikleri getir
  const fetchRelatedEvents = async (category: string, excludeId: string) => {
    try {
      const response = await fetch(`/api/events?category=${category}&limit=6`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.events.filter(
          (e: RelatedEvent) => e.id !== excludeId
        );
        setRelatedEvents(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related events:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Paylaşım fonksiyonları
  const shareEvent = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this event: ${event?.title}`;

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Event link copied to clipboard!");
        setShowShareModal(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShowShareModal(false);
    }
  };

  // Favorilere ekleme
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Removed from favorites" : "Added to favorites"
    );
  };

  // Takvime ekleme
  const addToCalendar = () => {
    if (!event) return;

    const startDate = new Date(`${event.startDate}T${event.startTime}`);
    const endDate = event.endTime
      ? new Date(`${event.startDate}T${event.endTime}`)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours default

    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(
      endDate
    )}&details=${encodeURIComponent(
      event.description || ""
    )}&location=${encodeURIComponent(
      event.location === "Venue"
        ? `${event.venueName}, ${event.venueAddress}, ${event.venueCity}`
        : event.location
    )}`;

    window.open(calendarUrl, "_blank");
  };

  if (isLoading) {
    return (
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading event...</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The event youre looking for doesnt exist.
            </p>
            <Link
              href="/events"
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition"
            >
              Browse Events
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white">
        {/* Hero Image */}
        <div className="relative h-80 lg:h-96 bg-gradient-to-r from-primary/20 to-secondary/20">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Actions */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full shadow-md transition ${
                isFavorited
                  ? "bg-red-500 text-white"
                  : "bg-white/90 hover:bg-white text-gray-700"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {event.title}
                </p>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <Container>
          <div className="py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                    {event.tags &&
                      event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>
                </div>

                {/* Date and Time */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Date and Time
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </span>
                    </div>
                    <button
                      onClick={addToCalendar}
                      className="mt-3 text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />+ Add to Calendar
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location
                  </h2>
                  <div className="space-y-2">
                    {event.location === "Venue" ? (
                      <>
                        <p className="font-medium text-gray-900">
                          {event.venueName}
                        </p>
                        <p className="text-gray-600">{event.venueAddress}</p>
                        <p className="text-gray-600">{event.venueCity}</p>
                      </>
                    ) : (
                      <p className="font-medium text-gray-900">
                        {event.location}
                      </p>
                    )}
                  </div>

                  {/* Map placeholder */}
                  {event.location === "Venue" && (
                    <div className="mt-4 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">
                        Map integration would go here
                      </p>
                    </div>
                  )}
                </div>

                {/* Hosted by */}
                {event.organizer && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Hosted by
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        {event.organizer.image ? (
                          <Image
                            src={event.organizer.image}
                            alt={event.organizer.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="font-bold text-primary text-lg">
                            {event.organizer.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {event.organizer.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {event.organizer.email}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm">
                          Contact
                        </button>
                        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition text-sm ml-2">
                          + Follow
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Description */}
                {event.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Event Description
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ticket Information */}
                <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Ticket Information
                  </h3>

                  {event.eventType === "free" ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        FREE
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        This event is free to attend
                      </p>
                      <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium">
                        Register Now
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                          {event.ticketName}
                        </p>
                        <div className="text-2xl font-bold text-gray-900">
                          ₺{event.ticketPrice}{" "}
                          <span className="text-sm text-gray-600 font-normal">
                            each
                          </span>
                        </div>
                      </div>
                      <button className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition font-medium text-lg">
                        🎫 Buy Tickets
                      </button>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      By purchasing a ticket, you agree to our terms and
                      conditions
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={toggleFavorite}
                      className={`w-full p-3 rounded-md border transition flex items-center justify-center gap-2 ${
                        isFavorited
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorited ? "fill-current" : ""
                        }`}
                      />
                      {isFavorited
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                    </button>

                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 p-3 rounded-md hover:bg-gray-100 transition flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <section className="py-12 bg-gray-50">
            <Container>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Other events you may like
                </h2>
                <Link
                  href={`/events?category=${event.category}`}
                  className="text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                >
                  View all {event.category} events
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedEvents.map((relatedEvent) => (
                  <Link
                    key={relatedEvent.id}
                    href={`/events/${relatedEvent.id}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {relatedEvent.imageUrl ? (
                        <Image
                          src={relatedEvent.imageUrl}
                          alt={relatedEvent.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Calendar className="w-8 h-8 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        {relatedEvent.category}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedEvent.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              relatedEvent.startDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{relatedEvent.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {relatedEvent.location === "Venue"
                              ? `${relatedEvent.venueName}, ${relatedEvent.venueCity}`
                              : relatedEvent.location}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {relatedEvent.eventType === "free" ? (
                          <span className="text-green-600 font-medium text-sm">
                            FREE
                          </span>
                        ) : (
                          <span className="text-gray-900 font-medium text-sm">
                            ₺{relatedEvent.ticketPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Event</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareEvent("facebook")}
                  className="w-full flex items-center gap-3 p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Facebook className="w-5 h-5" />
                  Share on Facebook
                </button>

                <button
                  onClick={() => shareEvent("twitter")}
                  className="w-full flex items-center gap-3 p-3 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition"
                >
                  <Twitter className="w-5 h-5" />
                  Share on Twitter
                </button>

                <button
                  onClick={() => shareEvent("copy")}
                  className="w-full flex items-center gap-3 p-3 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  <Copy className="w-5 h-5" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </>
  );
};

export default EventDetailPage;

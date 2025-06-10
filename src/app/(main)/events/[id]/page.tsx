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
  Navigation,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";

// Global types for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

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
  author: {
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
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [attendeeDetails, setAttendeeDetails] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
    },
  ]);
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is the event owner
  const isOwner = session?.user?.email === event?.author?.email;

  // Google Maps yükleme fonksiyonu - Singleton pattern
  const loadGoogleMaps = () => {
    return new Promise<void>((resolve) => {
      // Eğer Google Maps zaten yüklüyse
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps
      ) {
        setMapLoaded(true);
        resolve();
        return;
      }

      // Eğer script zaten eklenmişse (loading durumunda)
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        // Script zaten var, yüklenmeyi bekle
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            setMapLoaded(true);
            resolve();
          }
        }, 100);
        return;
      }

      // Script henüz yok, yükle
      if (typeof window !== "undefined") {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setMapLoaded(true);
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load Google Maps API");
          resolve();
        };
        document.head.appendChild(script);
      }
    });
  };

  // Harita oluşturma fonksiyonu
  const initializeMap = async (address: string) => {
    if (!mapLoaded || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    const mapElement = document.getElementById("event-map");

    if (!mapElement) return;

    try {
      const result = await new Promise<google.maps.GeocoderResult[]>(
        (resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results) {
              resolve(results);
            } else {
              reject(new Error("Geocoding failed"));
            }
          });
        }
      );

      if (result && result[0]) {
        const location = result[0].geometry.location;

        const map = new window.google.maps.Map(mapElement, {
          center: location,
          zoom: 15,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Marker ekle
        new window.google.maps.Marker({
          position: location,
          map: map,
          title: event?.venueName || "Event Location",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="4"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
        });

        // Info window ekle
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold; color: #1f2937;">${
                event?.venueName || "Event Location"
              }</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${address}</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                address
              )}" 
                 target="_blank" 
                 style="color: #3b82f6; text-decoration: none; font-size: 14px; display: inline-block; margin-top: 5px;">
                Get Directions →
              </a>
            </div>
          `,
        });

        // Marker'a tıklandığında info window'u aç
        const marker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: event?.venueName || "Event Location",
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      // Fallback: Basit harita placeholder'ı göster
      const mapElement = document.getElementById("event-map");
      if (mapElement) {
        mapElement.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg">
            <div class="w-8 h-8 text-gray-400 mb-2">📍</div>
            <p class="text-gray-500 text-sm text-center px-4">${address}</p>
            <a href="https://www.google.com/maps/search/${encodeURIComponent(
              address
            )}" 
               target="_blank" 
               class="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
              <span class="w-3 h-3">🧭</span>
              Open in Google Maps
            </a>
          </div>
        `;
      }
    }
  };

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

  // Event yüklendikten sonra haritayı başlat
  useEffect(() => {
    const initMaps = async () => {
      if (event && event.location === "Venue" && isMounted) {
        await loadGoogleMaps();
      }
    };

    initMaps();
  }, [event, isMounted]);

  useEffect(() => {
    if (mapLoaded && event && event.location === "Venue") {
      const address = `${event.venueAddress}, ${event.venueCity}`;
      initializeMap(address);
    }
  }, [mapLoaded, event]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Ticket quantity handlers
  const increaseQuantity = () => {
    setTicketQuantity((prev) => Math.min(prev + 1, 10)); // Max 10 tickets
  };

  const decreaseQuantity = () => {
    setTicketQuantity((prev) => Math.max(prev - 1, 1)); // Min 1 ticket
  };

  // Calculate total price
  const totalPrice =
    event?.eventType === "ticketed"
      ? (event.ticketPrice || 0) * ticketQuantity
      : 0;

  // Handle ticket purchase
  const handleTicketPurchase = () => {
    if (!session) {
      toast.error("Please login to purchase tickets");
      router.push("/auth/login");
      return;
    }

    if (isOwner) {
      toast.error("You cannot purchase tickets for your own event");
      return;
    }

    setShowTicketModal(true);
  };

  // Proceed to checkout - FREE EVENTS için direkt kayıt
  const proceedToCheckout = async () => {
    if (event?.eventType === "free") {
      try {
        // Loading state göster
        const loadingToast = toast.loading("Registering for the event...");

        const requestData = {
          eventId: event.id,
          quantity: 1, // Free event'ler için genelde 1 bilet
          attendees: [
            {
              fullName: session?.user?.name || "",
              email: session?.user?.email || "",
              phone: "",
            },
          ],
          paymentId: null, // Free event için payment yok
        };

        let response;
        try {
          response = await fetch("/api/tickets/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });
        } catch (fetchError) {
          console.warn(
            "API endpoint not available, using mock response:",
            fetchError
          );

          // Mock successful response
          response = {
            ok: true,
            status: 200,
            json: async () => ({
              message: "Mock registration successful",
              ticketId: `mock-${Date.now()}`,
              ticketNumber: `REG-MOCK-${Date.now()}`,
            }),
          };
        }

        // Loading toast'ı kapat
        toast.dismiss(loadingToast);

        if (response.ok) {
          const result = await response.json();
          toast.success("Successfully registered for the event!");

          // Modal'ı kapat ve state'i temizle
          setShowTicketModal(false);
          setTicketQuantity(1);

          // Geçici olarak events sayfasına dön
          setTimeout(() => {
            router.push("/events");
          }, 2000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "Failed to register for event";
          console.error("Registration failed:", response.status, errorData);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof TypeError && error.message.includes("fetch")) {
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else {
          toast.error("Registration failed. Please try again.");
        }
      }
      return;
    }

    // Paid event için attendee modal'ına geç
    setShowTicketModal(false);
    setShowAttendeeModal(true);
  };

  // Attendee details handler
  const handleAttendeeChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newAttendees = [...attendeeDetails];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendeeDetails(newAttendees);
  };

  // Proceed to order summary
  const proceedToOrderSummary = () => {
    // Validate attendee details
    const isValid = attendeeDetails.every(
      (attendee) => attendee.fullName && attendee.email
    );

    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowAttendeeModal(false);
    setShowOrderSummaryModal(true);
  };

  // Complete purchase
  const completePurchase = async () => {
    try {
      // Loading state göster
      const loadingToast = toast.loading("Processing your ticket purchase...");

      // Debug: Request data'yı logla
      const requestData = {
        eventId: event?.id,
        quantity: ticketQuantity,
        attendees: attendeeDetails,
        paymentId: event?.eventType === "free" ? null : `payment_${Date.now()}`, // Mock payment ID
      };

      console.log("🚀 Sending request:", requestData);

      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Loading toast'ı kapat
      toast.dismiss(loadingToast);

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Success result:", result);

        toast.success(
          event?.eventType === "free"
            ? `Successfully registered for the event!`
            : `Successfully purchased ${ticketQuantity} ticket(s)!`
        );

        // Modal'ları kapat ve state'i temizle
        setShowOrderSummaryModal(false);
        setShowAttendeeModal(false);
        setShowTicketModal(false);
        setTicketQuantity(1);
        setAttendeeDetails([{ fullName: "", email: "", phone: "" }]);

        // Ticket sayfasına yönlendir
        setTimeout(() => {
          router.push("/tickets");
        }, 1500);
      } else {
        // API'den gelen hata mesajını al
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          `Failed to ${
            event?.eventType === "free"
              ? "register for"
              : "purchase tickets for"
          } event`;

        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });

        // Specific error messages
        if (response.status === 401) {
          toast.error("Please log in to purchase tickets");
          router.push("/auth/login");
        } else if (response.status === 404) {
          toast.error("Event not found");
        } else if (response.status === 400) {
          toast.error(errorMessage);
        } else {
          toast.error(`Server error (${response.status}): ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("❌ Purchase error:", error);

      // Network hatası mı kontrol et
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (error.name === "SyntaxError") {
        toast.error("Invalid response from server. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Initialize attendee fields based on quantity
  useEffect(() => {
    const newAttendees = Array.from(
      { length: ticketQuantity },
      (_, index) =>
        attendeeDetails[index] || { fullName: "", email: "", phone: "" }
    );
    setAttendeeDetails(newAttendees);
  }, [ticketQuantity]);

  // Tarih formatlama (hydration-safe)
  const formatDate = (dateString: string) => {
    if (!isMounted) return "";

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
    if (!isMounted || typeof window === "undefined") return;

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
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          toast.success("Event link copied to clipboard!");
        }
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
    if (!event || !isMounted || typeof window === "undefined") return;

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

  if (isLoading || !isMounted) {
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

                  {/* Interactive Map */}
                  {event.location === "Venue" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Location on Map
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(
                            `${event.venueAddress}, ${event.venueCity}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark text-sm flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />
                          Open in Maps
                        </a>
                      </div>
                      <div
                        id="event-map"
                        className="h-48 bg-gray-200 rounded-lg border border-gray-300"
                        style={{ minHeight: "192px" }}
                      >
                        {!mapLoaded && (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                            <p className="text-gray-500 text-sm">
                              Loading map...
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Click the marker for directions
                      </div>
                    </div>
                  )}
                </div>

                {/* Hosted by */}
                {event.author && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Hosted by
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        {event.author.image ? (
                          <Image
                            src={event.author.image}
                            alt={event.author.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="font-bold text-primary text-lg">
                            {event.author.name?.charAt(0) ||
                              event.author.email.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {event.author.name || "Event Organizer"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {event.author.email}
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

                  {isOwner ? (
                    /* Show edit options for event owner */
                    <div className="text-center">
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                          This is your event
                        </p>
                      </div>
                      <Link
                        href={`/edit-event/${event.id}`}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium inline-block text-center"
                      >
                        Edit Event
                      </Link>
                    </div>
                  ) : event.eventType === "free" ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        FREE
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        This event is free to attend
                      </p>
                      <button
                        onClick={handleTicketPurchase}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium"
                      >
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
                      <button
                        onClick={handleTicketPurchase}
                        className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition font-medium text-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Buy Tickets
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
                            {isMounted
                              ? new Date(
                                  relatedEvent.startDate
                                ).toLocaleDateString()
                              : ""}
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

      {/* Ticket Purchase Modal */}
      {showTicketModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowTicketModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select Tickets
                  </h2>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {event.eventType === "free" ? (
                  /* Free Event Registration */
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Free Event Registration
                      </h3>
                      <p className="text-gray-600">
                        Register for this free event to secure your spot
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {event.title}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{formatDate(event.startDate)}</div>
                        <div>{event.startTime}</div>
                        <div>
                          {event.location === "Venue"
                            ? `${event.venueName}, ${event.venueCity}`
                            : event.location}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={proceedToCheckout}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium text-lg"
                    >
                      Complete Registration
                    </button>
                  </div>
                ) : (
                  /* Paid Event Ticket Selection */
                  <div>
                    {/* Ticket Types Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ticket Types
                      </h3>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quantity
                      </h3>
                    </div>

                    {/* Ticket Option */}
                    <div className="border-l-4 border-green-500 bg-gray-50 p-4 rounded-r-lg mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.ticketName || "Standard Ticket"}
                          </h4>
                          <p className="text-xl font-bold text-gray-900">
                            ₺{event.ticketPrice}.00
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={decreaseQuantity}
                            disabled={ticketQuantity <= 1}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="text-2xl font-bold text-gray-900 min-w-[2rem] text-center">
                            {ticketQuantity}
                          </span>

                          <button
                            onClick={increaseQuantity}
                            disabled={ticketQuantity >= 10}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold">
                          Qty:{" "}
                          <span className="text-green-600">
                            {ticketQuantity}
                          </span>
                        </span>
                        <span className="font-bold">
                          Total:{" "}
                          <span className="text-green-600">₺{totalPrice}</span>
                        </span>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      onClick={proceedToCheckout}
                      className="w-full bg-gray-800 text-white py-4 px-6 rounded-md hover:bg-gray-900 transition font-medium text-lg flex items-center justify-center gap-2"
                    >
                      Proceed
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attendee Details Modal */}
      {showAttendeeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAttendeeModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Attendee Information
                  </h2>
                  <button
                    onClick={() => setShowAttendeeModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Please provide details for each attendee
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {attendeeDetails.map((attendee, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Attendee {index + 1}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={attendee.fullName}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "fullName",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={attendee.email}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter email address"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={attendee.phone}
                            onChange={(e) =>
                              handleAttendeeChange(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowAttendeeModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={proceedToOrderSummary}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition font-medium"
                  >
                    Continue to Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Summary Modal */}
      {showOrderSummaryModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowOrderSummaryModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <button
                    onClick={() => setShowOrderSummaryModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Please review your order before completing the purchase
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Event Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Event Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Event:</strong> {event.title}
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(event.startDate)}
                    </div>
                    <div>
                      <strong>Time:</strong> {event.startTime}
                    </div>
                    <div>
                      <strong>Location:</strong>{" "}
                      {event.location === "Venue"
                        ? `${event.venueName}, ${event.venueCity}`
                        : event.location}
                    </div>
                  </div>
                </div>

                {/* Ticket Summary */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ticket Summary
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span>{event.ticketName || "Standard Ticket"}</span>
                    <span>
                      ₺{event.ticketPrice} × {ticketQuantity}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">₺{totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Attendee Summary */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Attendees
                  </h3>
                  <div className="space-y-3">
                    {attendeeDetails.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="font-medium">{attendee.fullName}</div>
                          <div className="text-sm text-gray-600">
                            {attendee.email}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Ticket {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowOrderSummaryModal(false);
                      setShowAttendeeModal(true);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={completePurchase}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Complete Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <>
          {/* Overlay - her yere tıklanınca modal'ı kapatır */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowShareModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
        </>
      )}

      <Toaster />
    </>
  );
};

export default EventDetailPage;

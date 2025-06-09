// app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import List from "../../components/ui/List";
import Hero from "../../components/home/Hero";
import Container from "../../components/ui/Container";
import Filters from "../../components/ui/Filters";
import SortDropdown from "../../components/ui/SortDropdown";
import {
  Map,
  List as ListIcon,
  MapPin,
  Navigation,
  X,
  Calendar,
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
  lat?: number;
  lng?: number;
}

const Page = () => {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Google Maps yükleme - Singleton pattern ile
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

  // Events verilerini getir
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events?published=true");
      if (response.ok) {
        const data = await response.json();
        const eventsWithCoords = await geocodeEvents(data.events || []);
        setEvents(eventsWithCoords);
        setFilteredEvents(eventsWithCoords);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Events'leri geocode et (adres → koordinat)
  const geocodeEvents = async (events: Event[]) => {
    if (!mapLoaded || !window.google || !window.google.maps) {
      return events;
    }

    const geocoder = new window.google.maps.Geocoder();
    const geocodedEvents = await Promise.all(
      events.map(async (event) => {
        if (
          event.location === "Venue" &&
          event.venueAddress &&
          event.venueCity
        ) {
          const address = `${event.venueAddress}, ${event.venueCity}`;

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
              return {
                ...event,
                lat: location.lat(),
                lng: location.lng(),
              };
            }
          } catch (error) {
            console.error(`Geocoding failed for event ${event.id}:`, error);
          }
        }
        return event;
      })
    );

    return geocodedEvents;
  };

  // Kullanıcının konumunu al
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Varsayılan olarak İstanbul koordinatları
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        }
      );
    } else {
      // Varsayılan olarak İstanbul koordinatları
      setUserLocation({ lat: 41.0082, lng: 28.9784 });
    }
  };

  // Haritayı başlat
  const initializeMap = () => {
    if (!mapRef.current || !mapLoaded || !userLocation || !window.google)
      return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 11,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Info window oluştur
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Kullanıcı konumu marker'ı
    new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: "Your Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10B981" stroke="white" stroke-width="3"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12),
      },
    });

    // Event marker'larını ekle
    addEventMarkers(map);
  };

  // Event marker'larını haritaya ekle
  const addEventMarkers = (map: google.maps.Map) => {
    // Eski marker'ları temizle
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const venueEvents = filteredEvents.filter(
      (event) => event.location === "Venue" && event.lat && event.lng
    );

    venueEvents.forEach((event) => {
      if (!event.lat || !event.lng) return;

      const marker = new window.google.maps.Marker({
        position: { lat: event.lat, lng: event.lng },
        map: map,
        title: event.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      });

      // Marker click event
      marker.addListener("click", () => {
        setSelectedEvent(event);

        if (infoWindowRef.current) {
          const content = createInfoWindowContent(event);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, marker);
        }

        // Haritayı event'e center'la
        map.setCenter({ lat: event.lat!, lng: event.lng! });
        map.setZoom(15);
      });

      markersRef.current.push(marker);
    });
  };

  // Info window içeriği oluştur
  const createInfoWindowContent = (event: Event) => {
    const eventDate = new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return `
      <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3; flex: 1; padding-right: 8px;">
            ${event.title}
          </h3>
          <span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; white-space: nowrap;">
            ${event.category}
          </span>
        </div>
        
        <div style="margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #6b7280;">📅 ${eventDate} at ${
      event.startTime
    }</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 14px; color: #6b7280;">📍 ${
              event.venueName
            }</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="font-size: 14px; color: #6b7280;">
              ${
                event.eventType === "free"
                  ? "🆓 Free"
                  : `💰 ₺${event.ticketPrice}`
              }
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <a href="/events/${event.id}" 
             style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500; display: inline-block;">
            View Details
          </a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${event.venueAddress}, ${event.venueCity}`
          )}" 
             target="_blank"
             style="background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500; display: inline-block;">
            Directions
          </a>
        </div>
      </div>
    `;
  };

  // Sorting handler
  const handleSort = (value: string) => {
    console.log("Sorted by:", value);
    let sortedEvents = [...filteredEvents];

    switch (value) {
      case "date":
        sortedEvents.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        break;
      case "price":
        sortedEvents.sort(
          (a, b) => (a.ticketPrice || 0) - (b.ticketPrice || 0)
        );
        break;
      case "popularity":
        // Implement popularity sorting logic
        break;
      default:
        break;
    }

    setFilteredEvents(sortedEvents);
  };

  // Effects
  useEffect(() => {
    const initMaps = async () => {
      await loadGoogleMaps();
    };

    initMaps();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      fetchEvents();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapLoaded && userLocation && events.length > 0) {
      initializeMap();
    }
  }, [mapLoaded, userLocation, events]);

  useEffect(() => {
    if (mapInstanceRef.current && filteredEvents.length > 0) {
      addEventMarkers(mapInstanceRef.current);
    }
  }, [filteredEvents]);

  return (
    <div>
      <Hero
        subtitle="Explore a world of events. Find what excites you!"
        backgroundColor="bg-primary-900"
        location="İstanbul"
      />
      <Container>
        {/* View Mode Toggle */}
        <div className="flex justify-center mt-6 mb-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-primary font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ListIcon className="w-4 h-4" />
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === "map"
                  ? "bg-white shadow-sm text-primary font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Map className="w-4 h-4" />
              Map View
            </button>
          </div>
        </div>

        {/* Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 mt-5 mb-5">
          <aside className="w-64 hidden lg:block mt-5 mb-5">
            <Filters />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex justify-end mb-12">
              <SortDropdown onSelect={handleSort} />
            </div>

            {/* Content based on view mode */}
            {viewMode === "list" ? (
              <List />
            ) : (
              <div className="space-y-4">
                {/* Map Container */}
                <div className="relative">
                  <div
                    ref={mapRef}
                    className="w-full h-[600px] rounded-lg border border-gray-300 bg-gray-100"
                  >
                    {!mapLoaded && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-500">Loading map...</p>
                      </div>
                    )}
                  </div>

                  {/* Map Controls */}
                  {mapLoaded && (
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                      <button
                        onClick={() => {
                          if (mapInstanceRef.current && userLocation) {
                            mapInstanceRef.current.setCenter(userLocation);
                            mapInstanceRef.current.setZoom(11);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                        title="Center on your location"
                      >
                        <Navigation className="w-4 h-4" />
                        My Location
                      </button>
                    </div>
                  )}

                  {/* Event Count */}
                  {mapLoaded && (
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {
                            filteredEvents.filter(
                              (e) => e.location === "Venue" && e.lat && e.lng
                            ).length
                          }{" "}
                          events on map
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Event Details */}
                {selectedEvent && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Selected Event
                      </h3>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">
                          {selectedEvent.title}
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                selectedEvent.startDate
                              ).toLocaleDateString()}{" "}
                              at {selectedEvent.startTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {selectedEvent.venueName},{" "}
                              {selectedEvent.venueCity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <span className="text-lg font-semibold text-primary">
                          {selectedEvent.eventType === "free"
                            ? "FREE"
                            : `₺${selectedEvent.ticketPrice}`}
                        </span>
                        <a
                          href={`/events/${selectedEvent.id}`}
                          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Legend */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Map Legend</h4>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      <span className="text-gray-600">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      <span className="text-gray-600">Event Venues</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      Click on markers to see event details
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default Page;

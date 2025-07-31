"use client";

import ImageUpload from "../../components/ui/ImageUpload";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Stepper from "../../components/ui/Stepper";
import Container from "../../components/ui/Container";
import {
  Calendar,
  CircleDollarSign,
  Clock,
  Ticket,
  Search,
  X,
} from "lucide-react";

interface EventData {
  title: string;
  category: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  description: string;
  eventType: "ticketed" | "free";
  ticketName: string;
  ticketPrice: number;
  imageUrl?: string; // Fotoğraf URL'si eklendi
}

interface City {
  name: string;
  country: string;
  population?: number;
}

const CreateEventPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const steps = ["Edit", "Banner", "Ticketing", "Review"];
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // City search states
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySearchResults, setCitySearchResults] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  // State'i tanımla
  const [eventData, setEventData] = useState<EventData>({
    title: "",
    category: "Music",
    startDate: "2025-06-12",
    startTime: "19:00",
    endTime: "22:00",
    location: "",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    description: "",
    eventType: "ticketed",
    ticketName: "",
    ticketPrice: 0,
    imageUrl: "", // Fotoğraf URL'si eklendi
  });

  // Event kaydetme fonksiyonu
  const saveEvent = async (isPublished = false) => {
    // Validation
    if (
      !eventData.title ||
      !eventData.category ||
      !eventData.startDate ||
      !eventData.startTime ||
      !eventData.location
    ) {
      toast.error("Lütfen tüm gerekli alanları doldurun!", {
        duration: 3000,
        position: "top-center",
      });
      return false;
    }

    // Venue validation
    if (
      eventData.location === "Venue" &&
      (!eventData.venueName || !eventData.venueAddress || !eventData.venueCity)
    ) {
      toast.error("Venue seçtiyseniz venue bilgilerini doldurun!", {
        duration: 3000,
        position: "top-center",
      });
      return false;
    }

    // Ticket validation
    if (
      eventData.eventType === "ticketed" &&
      (!eventData.ticketName || eventData.ticketPrice <= 0)
    ) {
      toast.error("Ücretli etkinlik için bilet bilgilerini doldurun!", {
        duration: 3000,
        position: "top-center",
      });
      return false;
    }

    setIsLoading(true);

    // Loading toast
    const loadingToast = toast.loading(
      isPublished ? "Etkinlik yayınlanıyor..." : "Etkinlik kaydediliyor...",
      {
        position: "top-center",
      }
    );

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventData,
          isPublished,
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();

        if (isPublished) {
          toast.success("Etkinlik başarıyla yayınlandı! 🎉", {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#10B981",
              color: "#fff",
            },
          });

          // Yayınlandıysa events sayfasına yönlendir
          setTimeout(() => {
            router.push("/events");
          }, 1500);
        } else {
          toast.success("Etkinlik taslak olarak kaydedildi ✅", {
            duration: 3000,
            position: "top-center",
            style: {
              background: "#3B82F6",
              color: "#fff",
            },
          });
        }

        console.log("Created event:", data.event);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kaydetme işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.dismiss(loadingToast);

      toast.error(
        error instanceof Error
          ? error.message
          : "Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        }
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // City search function with API
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCitySearchResults([]);
      return;
    }

    setIsSearchingCities(true);
    try {
      // GeoDB Cities API ile şehir arama
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
          query
        )}&limit=10&sort=population&types=CITY`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key":
              "d36cce2ad0msh0963de7f4861e0ep12672ajsn232b525a016b",
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const cities: City[] =
          data.data?.map(
            (city: { name: string; country: string; population?: number }) => ({
              name: city.name,
              country: city.country,
              population: city.population,
            })
          ) || [];
        setCitySearchResults(cities);
      } else {
        console.log("API Error:", response.status);
        // Fallback: Türkiye şehirleri
        const fallbackCities = [
          { name: "Istanbul", country: "Turkey", population: 15462000 },
          { name: "Ankara", country: "Turkey", population: 5503000 },
          { name: "Izmir", country: "Turkey", population: 4367000 },
          { name: "Bursa", country: "Turkey", population: 3101000 },
          { name: "Antalya", country: "Turkey", population: 2511000 },
          { name: "Adana", country: "Turkey", population: 2274000 },
          { name: "London", country: "United Kingdom", population: 9000000 },
          { name: "New York", country: "United States", population: 8400000 },
          { name: "Paris", country: "France", population: 2165000 },
          { name: "Berlin", country: "Germany", population: 3669000 },
        ].filter((city) =>
          city.name.toLowerCase().includes(query.toLowerCase())
        );
        setCitySearchResults(fallbackCities);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      // Fallback şehir listesi
      const fallbackCities = [
        { name: "Istanbul", country: "Turkey", population: 15462000 },
        { name: "Ankara", country: "Turkey", population: 5503000 },
        { name: "Izmir", country: "Turkey", population: 4367000 },
        { name: "London", country: "United Kingdom", population: 9000000 },
        { name: "New York", country: "United States", population: 8400000 },
        { name: "Paris", country: "France", population: 2165000 },
      ].filter((city) => city.name.toLowerCase().includes(query.toLowerCase()));
      setCitySearchResults(fallbackCities);
    } finally {
      setIsSearchingCities(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (citySearchQuery && citySearchQuery.length >= 2) {
        searchCities(citySearchQuery);
      } else {
        setCitySearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [citySearchQuery]);

  // Session kontrolü ve yönlendirme
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(pathname));
    }
  }, [session, status, router, pathname]);

  // City selection handler
  const handleCitySelect = (city: City) => {
    const cityText = `${city.name}, ${city.country}`;
    setEventData({ ...eventData, venueCity: cityText });
    setCitySearchQuery(cityText);
    setShowCityDropdown(false);
    setCitySearchResults([]);
  };

  // City input change handler
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearchQuery(value);
    setEventData({ ...eventData, venueCity: value });
    setShowCityDropdown(true);

    if (value.length === 0) {
      setCitySearchResults([]);
      setShowCityDropdown(false);
    }
  };

  // Initialize city search query
  useEffect(() => {
    if (eventData.venueCity && !citySearchQuery) {
      setCitySearchQuery(eventData.venueCity);
    }
  }, [eventData.venueCity, citySearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".city-search-container")) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading durumu
  if (status === "loading") {
    return (
      <section className="py-10 bg-white">
        <Container>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Giriş yapılmamışsa
  if (!session) {
    return (
      <section className="py-10 bg-white">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to create an event.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition"
            >
              Go to Login
            </button>
          </div>
        </Container>
      </section>
    );
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <section className="py-10 bg-white">
        <Container>
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              Create a New Event
            </h1>
            {/* Kullanıcı bilgisi göster */}
            <div className="text-sm text-gray-600">
              Creating as:{" "}
              <span className="font-medium">
                {session.user?.name || session.user?.email}
              </span>
            </div>
          </div>

          <Stepper
            steps={steps}
            activeStep={activeStep}
            onChange={setActiveStep}
          />

          {activeStep === 0 && (
            <form className="mt-10 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleChange}
                      placeholder="Enter the name of your event"
                      className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Event Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={eventData.category}
                      onChange={handleChange}
                      className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Please select one</option>
                      <option value="Music">Music</option>
                      <option value="Sport">Sport</option>
                      <option value="Conference">Conference</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Networking">Networking</option>
                      <option value="Art & Culture">Art & Culture</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Date & Time</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Calendar
                      className="absolute top-9 right-3 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={eventData.startTime}
                      onChange={handleChange}
                      className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Clock
                      className="absolute top-9 right-3 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={eventData.endTime}
                      onChange={handleChange}
                      className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Clock
                      className="absolute top-9 right-3 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <select
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Please select one</option>
                  <option value="Online">Online</option>
                  <option value="Venue">Venue</option>
                </select>

                {/* Venue seçildiğinde venue bilgileri */}
                {eventData.location === "Venue" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Venue Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venueName"
                        value={eventData.venueName}
                        onChange={handleChange}
                        placeholder="Enter venue name"
                        className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Venue Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="venueAddress"
                        value={eventData.venueAddress}
                        onChange={handleChange}
                        placeholder="Enter venue address"
                        className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="relative city-search-container">
                      <label className="block text-sm font-medium mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="venueCity"
                          value={citySearchQuery}
                          onChange={handleCityInputChange}
                          onFocus={() => {
                            if (citySearchQuery.length >= 2) {
                              setShowCityDropdown(true);
                            }
                          }}
                          placeholder="Start typing city name..."
                          className="w-full border rounded-md py-2 px-3 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <div className="absolute right-3 top-2.5">
                          {isSearchingCities ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          ) : citySearchQuery ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCitySearchQuery("");
                                setEventData({ ...eventData, venueCity: "" });
                                setCitySearchResults([]);
                                setShowCityDropdown(false);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <Search size={16} className="text-gray-400" />
                          )}
                        </div>

                        {/* Dropdown Results */}
                        {showCityDropdown && citySearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {citySearchResults.map((city, index) => (
                              <button
                                key={`${city.name}-${city.country}-${index}`}
                                type="button"
                                onClick={() => handleCitySelect(city)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {city.name}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {city.country}
                                  </span>
                                </div>
                                {city.population && (
                                  <span className="text-xs text-gray-400">
                                    {city.population.toLocaleString()} pop.
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* No results message */}
                        {showCityDropdown &&
                          citySearchQuery.length >= 2 &&
                          citySearchResults.length === 0 &&
                          !isSearchingCities && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-4 text-center text-gray-500">
                              <Search
                                size={20}
                                className="mx-auto mb-2 text-gray-300"
                              />
                              <p>No cities found for {citySearchQuery}</p>
                              <p className="text-xs mt-1">
                                Try a different search term
                              </p>
                            </div>
                          )}

                        {/* Minimum character message */}
                        {showCityDropdown && citySearchQuery.length === 1 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-4 text-center text-gray-500">
                            <p className="text-sm">
                              Type at least 2 characters to search
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Additional Information
                </h2>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  className="w-full border rounded-md py-2 px-3 h-32 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your event"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-primary text-white rounded-md px-6 py-2 hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Save & Continue
                </button>
              </div>
            </form>
          )}

          {activeStep === 1 && (
            <div className="mt-10 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{eventData.title}</h2>
                <p className="text-sm text-gray-600">
                  {eventData.location === "Venue"
                    ? `${eventData.venueName}, ${eventData.venueCity}`
                    : eventData.location}
                </p>
                <p className="text-sm text-gray-600">
                  {eventData.startDate} at {eventData.startTime}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Event Image</h3>
                <ImageUpload
                  onImageUpload={(imageUrl) =>
                    setEventData({ ...eventData, imageUrl })
                  }
                  currentImageUrl={eventData.imageUrl}
                  onImageRemove={() =>
                    setEventData({ ...eventData, imageUrl: "" })
                  }
                />
              </div>

              <div className="flex justify-end gap-4 items-center">
                <button
                  onClick={() => setActiveStep(0)}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Go back to Edit Event
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-primary text-white rounded-md px-6 py-2 hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="text-2xl font-bold">{eventData.title}</h2>
                <p className="text-sm text-gray-600">
                  {eventData.location === "Venue"
                    ? `${eventData.venueName}, ${eventData.venueCity}`
                    : eventData.location}
                </p>
                <p className="text-sm text-gray-600">
                  {eventData.startDate} at {eventData.startTime}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  What type of event are you running?
                </h3>
                <div className="flex gap-6">
                  <div
                    onClick={() =>
                      setEventData({ ...eventData, eventType: "ticketed" })
                    }
                    className={`border rounded-lg p-6 w-full cursor-pointer flex flex-col items-center justify-center transition ${
                      eventData.eventType === "ticketed"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Ticket className="mb-2" size={32} />
                    <span className="font-semibold">Ticketed Event</span>
                    <span className="text-sm text-center">
                      My event requires tickets for entry
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      setEventData({ ...eventData, eventType: "free" })
                    }
                    className={`border rounded-lg p-6 w-full cursor-pointer flex flex-col items-center justify-center transition ${
                      eventData.eventType === "free"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <CircleDollarSign className="mb-2" size={32} />
                    <span className="font-semibold">Free Event</span>
                    <span className="text-sm text-center">
                      Im running a free event
                    </span>
                  </div>
                </div>
              </div>

              {eventData.eventType === "ticketed" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    What tickets are you selling?
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ticket Name
                      </label>
                      <input
                        type="text"
                        name="ticketName"
                        placeholder="Ticket Name e.g. General Admission"
                        value={eventData.ticketName}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium mb-1">
                        Ticket Price
                      </label>
                      <input
                        type="number"
                        name="ticketPrice"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={eventData.ticketPrice}
                        onChange={handleChange}
                        className="w-full border rounded-md py-2 px-3 pl-8 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="absolute left-3 top-8 text-gray-600">
                        ₺
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end items-center gap-5">
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Go back to Banner
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-primary text-white rounded-md px-6 py-2 hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="mt-10 space-y-6">
              <p className="text-lg font-semibold mb-4">
                Nearly there! Check everythings correct.
              </p>

              {/* Event Details Section */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-3xl font-semibold">{eventData.title}</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold">Date and Time</p>
                    <p>📅 {eventData.startDate}</p>
                    <p>
                      🕒 {eventData.startTime} - {eventData.endTime}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Ticket Information</p>
                    {eventData.eventType === "free" ? (
                      <p>🆓 Free Event</p>
                    ) : (
                      <p>
                        🎫 {eventData.ticketName}: ₺{eventData.ticketPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold">Location</p>
                  {eventData.location === "Venue" ? (
                    <div>
                      <p>📍 {eventData.venueName}</p>
                      <p className="text-sm text-gray-600">
                        {eventData.venueAddress}, {eventData.venueCity}
                      </p>
                    </div>
                  ) : (
                    <p>📍 {eventData.location}</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold">Category</p>
                  <p>🏷️ {eventData.category}</p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Event Description</p>
                  <p className="text-gray-700 bg-white p-4 rounded border">
                    {eventData.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Hosted by</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {session.user?.name?.charAt(0) ||
                          session.user?.email?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {session.user?.name || "Event Organizer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Go back to Ticketing
                </button>
                <button
                  onClick={() => saveEvent(false)}
                  disabled={isLoading}
                  className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-md hover:bg-yellow-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  )}
                  Save for Later
                </button>
                <button
                  onClick={() => saveEvent(true)}
                  disabled={isLoading}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Publish Event
                </button>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Toast Container */}
      <Toaster />
    </>
  );
};

export default CreateEventPage;

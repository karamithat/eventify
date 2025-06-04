"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import Container from "../../components/ui/Container";
import {
  Calendar,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Copy,
  ExternalLink,
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
}

const MyEventsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({ isOpen: false, event: null });

  // Session kontrolü
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/my-events");
    }
  }, [session, status, router]);

  // Events yükleme
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
          setFilteredEvents(data.events);
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
      loadEvents();
    }
  }, [session]);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = events;

    // Status filtresi
    if (filter === "published") {
      filtered = filtered.filter((event) => event.isPublished);
    } else if (filter === "draft") {
      filtered = filtered.filter((event) => !event.isPublished);
    }

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchQuery]);

  // Event silme
  const deleteEvent = async (eventId: string) => {
    const loadingToast = toast.loading("Etkinlik siliniyor...");

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success("Etkinlik başarıyla silindi!");
        setEvents(events.filter((event) => event.id !== eventId));
        setDeleteModal({ isOpen: false, event: null });
      } else {
        toast.error("Etkinlik silinirken hata oluştu");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting event:", error);
      toast.error("Etkinlik silinirken hata oluştu");
    }
  };

  // Delete modal açma
  const openDeleteModal = (event: Event) => {
    setDeleteModal({ isOpen: true, event });
    setShowDropdown(null);
  };

  // Event kopyalama
  const duplicateEvent = async (event: Event) => {
    const loadingToast = toast.loading("Etkinlik kopyalanıyor...");

    try {
      const duplicatedEvent = {
        ...event,
        title: `${event.title} (Kopya)`,
        isPublished: false,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicatedEvent),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success("Etkinlik başarıyla kopyalandı!");
        loadEvents(); // Listeyi yenile
      } else {
        toast.error("Etkinlik kopyalanırken hata oluştu");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error duplicating event:", error);
      toast.error("Etkinlik kopyalanırken hata oluştu");
    }
  };

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading durumu
  if (status === "loading" || isLoading) {
    return (
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Etkinlikler yükleniyor...</p>
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
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Events
              </h1>
              <p className="text-gray-600">
                Manage your events, track performance, and edit details
              </p>
            </div>
            <Link
              href="/create-event"
              className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition flex items-center gap-2 w-fit"
            >
              <Plus className="w-5 h-5" />
              Create New Event
            </Link>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
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

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "published" | "draft")
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {events.length}
                </span>{" "}
                Total Events
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-green-600">
                  {events.filter((e) => e.isPublished).length}
                </span>{" "}
                Published
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-yellow-600">
                  {events.filter((e) => !e.isPublished).length}
                </span>{" "}
                Draft
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col h-full"
                >
                  {/* Image area */}
                  <div className="relative bg-gray-200 w-full h-48 flex items-center justify-center">
                    {/* Status Badge */}
                    <div
                      className={`absolute top-2 left-2 text-white text-xs font-medium px-2 py-1 rounded ${
                        event.isPublished ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </div>

                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        width={400}
                        height={160}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm flex flex-col items-center">
                        <Calendar className="w-8 h-8 mb-2" />
                        No Image
                      </div>
                    )}

                    {/* Actions Dropdown */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() =>
                          setShowDropdown(
                            showDropdown === event.id ? null : event.id
                          )
                        }
                        className="bg-white rounded-full p-2 shadow-sm hover:shadow-md transition"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-700" />
                      </button>

                      {showDropdown === event.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border py-1 w-48 z-10">
                          <Link
                            href={`/events/${event.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowDropdown(null)}
                          >
                            <Eye className="w-4 h-4" />
                            View Event
                          </Link>
                          <Link
                            href={`/edit-event/${event.id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowDropdown(null)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              duplicateEvent(event);
                              setShowDropdown(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-0 left-0 bg-secondary text-xs font-medium px-2 py-2 rounded-tr-md">
                      {event.category}
                    </div>
                  </div>

                  {/* Details area */}
                  <div className="py-4 px-4 flex gap-3 flex-grow">
                    {/* Date */}
                    <div className="text-center text-sm font-semibold text-primary min-w-16">
                      <div>{formatDate(event.startDate).split(" ")[0]}</div>
                      <div>{formatDate(event.startDate).split(" ")[1]}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        {event.location === "Venue"
                          ? `${event.venueName}, ${event.venueCity}`
                          : event.location}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-700">
                        {event.eventType === "free" ? (
                          <span className="text-green-600 font-medium">
                            Free
                          </span>
                        ) : (
                          <span>₺{event.ticketPrice}</span>
                        )}
                        <span>•</span>
                        <span className="text-gray-500">
                          {formatFullDate(event.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <Link
                      href={`/edit-event/${event.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition text-center"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="flex-1 bg-primary text-white py-2 px-3 rounded text-sm font-medium hover:bg-primary-dark transition text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== "all"
                  ? "No events found"
                  : "No events yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first event to get started"}
              </p>
              {!searchQuery && filter === "all" && (
                <Link
                  href="/create-event"
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Event
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.event && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200 opacity-100 relative z-10">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Event
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteModal.event.title}"
                </span>
                ? This will permanently remove the event and all associated
                data.
              </p>

              {/* Event Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  {deleteModal.event.imageUrl ? (
                    <Image
                      src={deleteModal.event.imageUrl}
                      alt={deleteModal.event.title}
                      width={60}
                      height={60}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {deleteModal.event.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFullDate(deleteModal.event.startDate)} •{" "}
                      {deleteModal.event.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          deleteModal.event.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {deleteModal.event.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, event: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEvent(deleteModal.event!.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <Toaster />
    </>
  );
};

export default MyEventsPage;

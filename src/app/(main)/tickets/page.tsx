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
  Clock,
  MapPin,
  Download,
  Share2,
  QrCode,
  Ticket,
  Search,
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Copy,
  DollarSign,
  Users,
} from "lucide-react";

// Prisma types'a uygun interface'ler
interface TicketAttendee {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  checkedIn: boolean;
  checkInAt?: string;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  endDate?: string;
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
  author: {
    name?: string;
    email: string;
  };
}

interface TicketData {
  id: string;
  ticketNumber: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
  quantity: number;
  totalAmount: number;
  qrCode: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  purchaseDate: string;
  attendees: TicketAttendee[];
  event: EventData;
}

const TicketsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch user tickets
  const fetchTickets = async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/tickets");

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchTickets();
    }
  }, [session]);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group tickets by status and time
  const now = new Date();
  const upcomingTickets = filteredTickets.filter(
    (t) => t.status === "ACTIVE" && new Date(t.event.startDate) > now
  );
  const pastTickets = filteredTickets.filter(
    (t) => t.status === "USED" || new Date(t.event.startDate) < now
  );

  // Date formatting
  const formatDate = (dateString: string) => {
    if (!isMounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatPurchaseDate = (dateString: string) => {
    if (!isMounted) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "USED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "USED":
        return <Eye className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "EXPIRED":
        return <AlertCircle className="w-4 h-4" />;
      case "REFUNDED":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "USED":
        return "Used";
      case "CANCELLED":
        return "Cancelled";
      case "EXPIRED":
        return "Expired";
      case "REFUNDED":
        return "Refunded";
      default:
        return status;
    }
  };

  // Download ticket
  const downloadTicket = async (ticket: TicketData) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `ticket-${ticket.ticketNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Ticket downloaded successfully");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast.error("Failed to download ticket");
    }
  };

  // Share ticket
  const shareTicket = (ticket: TicketData) => {
    if (!isMounted || typeof window === "undefined") return;

    const shareText = `I'm attending "${ticket.event.title}" on ${formatDate(
      ticket.event.startDate
    )}!`;

    if (navigator.share) {
      navigator.share({
        title: ticket.event.title,
        text: shareText,
        url: `${window.location.origin}/events/${ticket.event.id}`,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success("Event details copied to clipboard!");
    }
  };

  // Show QR Code
  const showQRCode = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  // View ticket details
  const viewTicketDetails = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  // Cancel ticket
  const cancelTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Ticket cancelled successfully");
        fetchTickets(); // Refresh tickets
      } else {
        throw new Error("Cancel failed");
      }
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      toast.error("Failed to cancel ticket");
    }
  };

  if (status === "loading" || !isMounted) {
    return (
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <>
      <section className="py-10 bg-gray-50 min-h-screen">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Tickets
            </h1>
            <p className="text-gray-600">
              Manage and view all your event tickets in one place
            </p>
          </div>

          {/* Stats */}
          {tickets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.length}
                    </p>
                  </div>
                  <Ticket className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tickets.filter((t) => t.status === "ACTIVE").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {upcomingTickets.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₺
                      {tickets
                        .reduce((sum, t) => sum + t.totalAmount, 0)
                        .toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets or events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Tickets</option>
                  <option value="ACTIVE">Active</option>
                  <option value="USED">Used</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Refresh */}
              <button
                onClick={fetchTickets}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your tickets...</p>
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No tickets found"
                  : "No tickets yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start exploring events and get your first ticket!"}
              </p>
              <Link
                href="/events"
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition font-medium"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Tickets */}
              {upcomingTickets.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Upcoming Events ({upcomingTickets.length})
                  </h2>
                  <div className="grid gap-6">
                    {upcomingTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onViewDetails={viewTicketDetails}
                        onShowQR={showQRCode}
                        onDownload={downloadTicket}
                        onShare={shareTicket}
                        onCancel={cancelTicket}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatPurchaseDate={formatPurchaseDate}
                        getStatusStyle={getStatusStyle}
                        getStatusIcon={getStatusIcon}
                        getStatusText={getStatusText}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Tickets */}
              {pastTickets.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    Past Events ({pastTickets.length})
                  </h2>
                  <div className="grid gap-6">
                    {pastTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onViewDetails={viewTicketDetails}
                        onShowQR={showQRCode}
                        onDownload={downloadTicket}
                        onShare={shareTicket}
                        onCancel={cancelTicket}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatPurchaseDate={formatPurchaseDate}
                        getStatusStyle={getStatusStyle}
                        getStatusIcon={getStatusIcon}
                        getStatusText={getStatusText}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setShowTicketModal(false)}
          formatDate={formatDate}
          formatTime={formatTime}
          formatPurchaseDate={formatPurchaseDate}
          getStatusStyle={getStatusStyle}
          getStatusIcon={getStatusIcon}
          getStatusText={getStatusText}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <QRCodeModal
          ticket={selectedTicket}
          onClose={() => setShowQRModal(false)}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}

      <Toaster />
    </>
  );
};

// Ticket Card Component
const TicketCard = ({
  ticket,
  onViewDetails,
  onShowQR,
  onDownload,
  onShare,
  onCancel,
  formatDate,
  formatTime,
  formatPurchaseDate,
  getStatusStyle,
  getStatusIcon,
  getStatusText,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        {/* Event Image */}
        <div className="md:w-48 h-48 md:h-auto relative bg-gray-200">
          {ticket.event.imageUrl ? (
            <Image
              src={ticket.event.imageUrl}
              alt={ticket.event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <Calendar className="w-12 h-12 text-primary/50" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 bg-white/90 ${getStatusStyle(
                ticket.status
              )}`}
            >
              {getStatusIcon(ticket.status)}
              {getStatusText(ticket.status)}
            </span>
          </div>
          {ticket.paymentStatus !== "COMPLETED" &&
            ticket.status === "ACTIVE" && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  Payment Pending
                </span>
              </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                  {ticket.event.category}
                </span>
                <span className="text-xs text-gray-500">
                  {ticket.ticketNumber}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {ticket.event.title}
              </h3>
            </div>
            <div className="text-right ml-4">
              {ticket.event.eventType === "free" ? (
                <span className="text-lg font-bold text-green-600">FREE</span>
              ) : (
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    ₺{ticket.totalAmount}
                  </span>
                  <p className="text-xs text-gray-500">
                    {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(ticket.event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(ticket.event.startTime)}
                  {ticket.event.endTime &&
                    ` - ${formatTime(ticket.event.endTime)}`}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {ticket.event.location === "Venue"
                    ? `${ticket.event.venueName}, ${ticket.event.venueCity}`
                    : ticket.event.location}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {ticket.attendees.length} attendee
                  {ticket.attendees.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="text-xs text-gray-500 mb-4">
            Purchased on {formatPurchaseDate(ticket.purchaseDate)}
            {ticket.attendees.some((a) => a.checkedIn) && (
              <span className="ml-2 text-green-600">• Checked In</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onViewDetails(ticket)}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition text-sm"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            {ticket.status === "ACTIVE" && (
              <button
                onClick={() => onShowQR(ticket)}
                className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition text-sm"
              >
                <QrCode className="w-4 h-4" />
                Show QR
              </button>
            )}

            <button
              onClick={() => onDownload(ticket)}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={() => onShare(ticket)}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <Link
              href={`/events/${ticket.event.id}`}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Event Page
            </Link>

            {ticket.status === "ACTIVE" &&
              new Date(ticket.event.startDate) > new Date() && (
                <button
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to cancel this ticket?")
                    ) {
                      onCancel(ticket.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100 transition text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ticket Details Modal Component
const TicketDetailsModal = ({
  ticket,
  onClose,
  formatDate,
  formatTime,
  formatPurchaseDate,
  getStatusStyle,
  getStatusIcon,
  getStatusText,
}) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Ticket Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Ticket Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Ticket Information</h3>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusStyle(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}
                    {getStatusText(ticket.status)}
                  </span>
                  {ticket.paymentStatus !== "COMPLETED" && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      Payment {ticket.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ticket Number:</span>
                  <div className="font-medium">{ticket.ticketNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Purchase Date:</span>
                  <div className="font-medium">
                    {formatPurchaseDate(ticket.purchaseDate)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <div className="font-medium">
                    {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <div className="font-medium">
                    {ticket.event.eventType === "free"
                      ? "FREE"
                      : `₺${ticket.totalAmount}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Event:</span>
                  <div className="font-medium">{ticket.event.title}</div>
                </div>
                {ticket.event.description && (
                  <div>
                    <span className="text-gray-600 text-sm">Description:</span>
                    <div className="text-sm text-gray-700 mt-1">
                      {ticket.event.description}
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">
                      {formatDate(ticket.event.startDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <div className="font-medium">
                      {formatTime(ticket.event.startTime)}
                      {ticket.event.endTime &&
                        ` - ${formatTime(ticket.event.endTime)}`}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Location:</span>
                  <div className="font-medium">
                    {ticket.event.location === "Venue"
                      ? `${ticket.event.venueName}, ${ticket.event.venueAddress}, ${ticket.event.venueCity}`
                      : ticket.event.location}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Organized by:</span>
                  <div className="font-medium">
                    {ticket.event.author.name || ticket.event.author.email}
                  </div>
                </div>
                {ticket.event.ticketName && (
                  <div>
                    <span className="text-gray-600 text-sm">Ticket Type:</span>
                    <div className="font-medium">{ticket.event.ticketName}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendees */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">
                Attendee Information
              </h3>
              <div className="space-y-3">
                {ticket.attendees.map((attendee, index) => (
                  <div
                    key={attendee.id}
                    className="border border-gray-200 rounded-md p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {attendee.fullName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Ticket #{index + 1}
                        </span>
                        {attendee.checkedIn && (
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Checked In
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{attendee.email}</span>
                      </div>
                      {attendee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{attendee.phone}</span>
                        </div>
                      )}
                      {attendee.checkedIn && attendee.checkInAt && (
                        <div className="md:col-span-2 text-xs text-gray-500">
                          Checked in on{" "}
                          {new Date(attendee.checkInAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Preview */}
            {ticket.status === "ACTIVE" && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold mb-3">Entry QR Code</h3>
                <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Show this QR code at the event entrance
                </p>
                <div className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border mb-3">
                  {ticket.qrCode}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    // This would open the QR modal
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition text-sm"
                >
                  View Full Size QR Code
                </button>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Close
              </button>
              <Link
                href={`/events/${ticket.event.id}`}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
              >
                View Event Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// QR Code Modal Component
const QRCodeModal = ({ ticket, onClose, formatDate, formatTime }) => {
  const copyQRCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticket.qrCode);
      toast.success("QR code copied to clipboard!");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Entry QR Code</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 text-center">
            {/* QR Code Display */}
            <div className="w-64 h-64 bg-white border-4 border-gray-300 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-inner">
              {/* In a real app, this would be an actual QR code image */}
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-600 mx-auto mb-2" />
                <div className="text-xs text-gray-500 font-mono break-all px-4">
                  {ticket.qrCode}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Show this QR code at the event entrance</li>
                <li>• Make sure your screen brightness is at maximum</li>
                <li>• Have a backup screenshot ready</li>
                <li>• Arrive 15-30 minutes before the event starts</li>
              </ul>
            </div>

            {/* Event Info */}
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                {ticket.event.title}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(ticket.event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(ticket.event.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {ticket.event.location === "Venue"
                      ? `${ticket.event.venueName}, ${ticket.event.venueCity}`
                      : ticket.event.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  <span>{ticket.ticketNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {ticket.attendees.length} attendee
                    {ticket.attendees.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={copyQRCode}
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-900 transition font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy QR Code
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // In a real app, this would save QR as image
                    toast.success("QR code saved to photos");
                  }}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition text-sm"
                >
                  Save Image
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would share QR code
                    if (navigator.share) {
                      navigator.share({
                        title: `QR Code for ${ticket.event.title}`,
                        text: `My entry QR code for ${ticket.event.title}`,
                      });
                    } else {
                      toast.success("QR code ready to share");
                    }
                  }}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition text-sm"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Keep this QR code private. Do not share screenshots publicly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketsPage;

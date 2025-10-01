"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  User,
  Building2,
  Image as ImageIcon,
  ExternalLink,
  QrCode,
  Link,
  Users,
  Smartphone,
  UserCheck,
  UserX,
  ScanFace,
  TrendingUp,
} from "lucide-react";
import EventModal from "@/components/modal/eventHostModal";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const EventHostDetailsPage = ({ eventId }) => {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch event details from API
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`get-event-host-list`);

      if (response.status == 1) {
        // Find the specific event by ID
        const foundEvent = response.data.events?.find(e => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          setError(null);
        } else {
          throw new Error("Event not found");
        }
      } else {
        throw new Error(response.message || "Failed to fetch event details");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching event details:", err);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch event statistics
  const fetchEventStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await getRequest(`get-event-statistics/${eventId}`);

      if (response.status === 1) {
        setStatistics(response.data);
      } else {
        console.error("Failed to fetch statistics:", response.message);
      }
    } catch (err) {
      console.error("Error fetching event statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchEventStatistics();
    }
  }, [eventId]);

  // Calculate event status based on current time and end time
  const getEventStatus = (event) => {
    const now = new Date();
    const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}:00`);
    return now < eventEndDateTime ? "Incoming" : "Completed";
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return timeString; // Assuming time is already in HH:MM format
  };

  // Handle opening edit modal
  const handleEditEvent = () => {
    const editData = {
      event_id: event._id,
      eventName: event.eventName,
      eventShortName: event.eventShortName,
      eventTimeZone: event.eventTimeZone,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate,
      endTime: event.endTime,
      eventType: event.eventType,
      eventCategory: event.eventCategory || [],
      location: event.location,
      // Additional fields from integrated form
      company_name: event.company_name,
      event_title: event.event_title,
      event_slug: event.event_slug,
      event_description: event.event_description,
      google_map_url: event.google_map_url,
      address: event.address,
      organizer_name: event.organizer_name,
      organizer_email: event.organizer_email,
      organizer_phone: event.organizer_phone,
      with_face_scanner: event.with_face_scanner,
      selected_form_id: event.selected_form_id,
    };
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleEventSuccess = () => {
    setModalOpen(false);
    fetchEventDetails(); // Refresh event details
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Event</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The requested event could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event);
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);
  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);
  const sameDay = event.startDate === event.endDate;

  // Chart data for attendance
  const attendanceData = statistics ? [
    { name: 'Present', value: statistics.presentCount, color: '#10b981' },
    { name: 'Absent', value: statistics.absentCount, color: '#ef4444' }
  ] : [];

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.eventName}</h1>
            <p className="text-gray-600">{event.eventShortName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              status === "Incoming"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-200 text-green-700"
            )}
          >
            {status}
          </Badge>
          <Button onClick={handleEditEvent} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="flex flex-wrap gap-3.5 2xl:gap-6">
        {/* Total Attendees Card */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-orange-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-orange-400">
            {statsLoading ? '...' : statistics?.totalAttendees || '0'}
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Total Attendees
          </h2>
        </div>

        {/* Total Present Card */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-green-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-green-400">
            {statsLoading ? '...' : statistics?.presentCount || '0'}
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Total Present
          </h2>
        </div>

        {/* Total Absent Card */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-red-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-red-400">
            {statsLoading ? '...' : statistics?.absentCount || '0'}
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Total Absent
          </h2>
        </div>

        {/* Face Scans Card */}
        <div className="flex flex-wrap items-center gap-2.5 2xl:gap-4 w-[45%] xl:w-1/5 p-3.5 2xl:p-6 flex-grow bg-white border-l-4 border-solid border-purple-400 rounded-2xl 2xl:rounded-3xl shadow-[0_0_6px_0_rgba(0,0,0,0.12)]">
          <div className="w-12 h-12 2xl:w-16 2xl:h-16 p-2 bg-black rounded-full flex items-center justify-center font-semibold text-base 2xl:text-xl text-purple-400">
            {statsLoading ? '...' : statistics?.faceScansCount || '0'}
          </div>
          <h2 className="text-base md:text-lg 2xl:text-xl leading-snug font-medium text-primaryBlue w-2/4 flex-grow">
            Face Scans
          </h2>
        </div>
      </div>
    </div>
  );
};

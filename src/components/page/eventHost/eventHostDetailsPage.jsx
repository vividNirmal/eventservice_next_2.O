"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Edit,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Link,
  Smartphone,
  QrCode,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
// Lazy load the modal with better loading state and error boundary
const EventModal = dynamic(() => import("@/components/modal/eventHostModal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2">Loading modal...</span>
    </div>
  ),
});
import { getRequest, postRequest } from "@/service/viewService";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EventHostDetailsPage = ({ eventId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  const eventDateInfo = useMemo(() => {
    if (!event) return null;

    if (
      event.dateRanges &&
      Array.isArray(event.dateRanges) &&
      event.dateRanges.length > 0
    ) {
      const sortedRanges = [...event.dateRanges].sort((a, b) => {
        const dateA = new Date(`${a.startDate}T${a.startTime}:00`);
        const dateB = new Date(`${b.startDate}T${b.startTime}:00`);
        return dateA - dateB;
      });

      const sortedByEnd = [...event.dateRanges].sort((a, b) => {
        const dateA = new Date(`${a.endDate}T${a.endTime}:00`);
        const dateB = new Date(`${b.endDate}T${b.endTime}:00`);
        return dateB - dateA;
      });

      const earliestStart = sortedRanges[0].startDate;
      const latestEnd = sortedByEnd[0].endDate;

      const startDate = new Date(earliestStart).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const endDate = new Date(latestEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const sameDay =
        new Date(earliestStart).toDateString() ===
        new Date(latestEnd).toDateString();

      return {
        startDate,
        endDate,
        sameDay,
        isMultiRange: true,
        totalRanges: event.dateRanges.length,
        dateRanges: event.dateRanges,
      };
    } else if (event.startDate && event.endDate) {
      // Legacy single date
      const startDate = new Date(event.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const endDate = new Date(event.endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const sameDay =
        new Date(event.startDate).toDateString() ===
        new Date(event.endDate).toDateString();

      return {
        startDate,
        endDate,
        sameDay,
        isMultiRange: false,
        totalRanges: 1,
        dateRanges: [
          {
            startDate: event.startDate,
            startTime: event.startTime,
            endDate: event.endDate,
            endTime: event.endTime,
          },
        ],
      };
    }
    return null;
  }, [event]);

  // Calculate status based on date ranges - moved to top to follow Rules of Hooks
  const status = useMemo(() => {
    if (!event || !eventDateInfo) return "Unknown";

    const currentDate = new Date();

    if (eventDateInfo.isMultiRange) {
      // Check if current time falls within ANY range
      const isOngoing = eventDateInfo.dateRanges.some((range) => {
        const rangeStart = new Date(`${range.startDate}T${range.startTime}:00`);
        const rangeEnd = new Date(`${range.endDate}T${range.endTime}:00`);
        return currentDate >= rangeStart && currentDate <= rangeEnd;
      });

      if (isOngoing) return "Ongoing";

      // Check if all ranges are in the future
      const allFuture = eventDateInfo.dateRanges.every((range) => {
        const rangeStart = new Date(`${range.startDate}T${range.startTime}:00`);
        return currentDate < rangeStart;
      });

      return allFuture ? "Incoming" : "Completed";
    } else {
      // Legacy single date logic
      const eventStartDate = new Date(
        `${event.startDate}T${event.startTime}:00`
      );
      const eventEndDate = new Date(`${event.endDate}T${event.endTime}:00`);

      if (currentDate >= eventStartDate && currentDate <= eventEndDate) {
        return "Ongoing";
      } else {
        return currentDate < eventStartDate ? "Incoming" : "Completed";
      }
    }
  }, [event, eventDateInfo]);

  // Prepare chart data - moved to top to follow Rules of Hooks
  const attendanceData = useMemo(() => {
    if (!statistics) return [];

    return [
      {
        name: "Checked In",
        value: statistics.totalCheckedIn,
        color: "#22c55e",
      },
      {
        name: "Registered",
        value: statistics.totalRegistered - statistics.totalCheckedIn,
        color: "#f59e0b",
      },
      {
        name: "Not Registered",
        value: statistics.totalCapacity - statistics.totalRegistered,
        color: "#e5e7eb",
      },
    ].filter((item) => item.value > 0);
  }, [statistics]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setEventLoading(true);
        const response = await getRequest(`get-event-host-details/${eventId}`);
        if (response.status === "success" || response.status == 1) {
          setEvent(response.data?.user || response.data);
        } else {
          console.error("Failed to fetch event details:", response.message);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Fetch event statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const response = await getRequest(`get-event-statistics/${event._id}`);
        if (response.status == 1) {
          setStatistics(response.data);
        } else {
          console.error("Failed to fetch statistics:", response.message);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (event?._id) {
      fetchStatistics();
    }
  }, [event?._id]);

  const handleEditEvent = () => {
    // Map the event data to the format expected by the modal
    const editData = {
      ...event,
      event_id: event._id, // Ensure event_id is set for edit mode
    };
    setEditData(editData);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleEventSuccess = () => {
    // Refresh the page or update the event data
    window.location.reload();
  };

  if (showSplash) {
    return <div
      onClick={() => setShowSplash(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700"
    >
      <h1 className="text-4xl font-bold text-blue-600 mb-2">Welcome To</h1>
      <div className="w-64 h-[2px] bg-gray-300 relative mb-2">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Eventservice 2025</h2>
      <p className="mt-6 text-gray-400 text-sm animate-pulse">
        (Click anywhere to continue)
      </p>
    </div>;
  }

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading event details...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the event information.
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Event not found
          </h2>
          <p className="text-gray-600">
            The event you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {event.eventName}
            </h1>
            <p className="text-gray-600 mt-1">Event Dashboard</p>
          </div>
          <Button onClick={handleEditEvent} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Capacity and Online Users */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Event Capacity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      Event Capacity
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {event.participant_capacity || "Unlimited"}
                  </span>
                </div>

                {/* Online Users */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      Online Users
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "0" // You can replace this with actual online users data when available
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration and Attendance */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Total Registered */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      Total Registered
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      statistics?.totalRegistered || 0
                    )}
                  </span>
                </div>

                {/* Attendance Stats */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {/* Attended */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        Attended
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {statsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        statistics?.totalCheckedIn || 0
                      )}
                    </span>
                  </div>

                  {/* Not Attended */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-red-100">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        Not Attended
                      </span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {statsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : statistics ? (
                        statistics.totalRegistered - statistics.totalCheckedIn
                      ) : (
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : statistics && attendanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No attendance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-ins Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Check-ins (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : statistics && statistics.dailyCheckIns ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statistics.dailyCheckIns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No check-in data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      {event.eventName}
                    </TableCell>
                    <TableCell>{event.company_name}</TableCell>
                    <TableCell className="capitalize">
                      {event.eventType}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{eventDateInfo.startDate}</div>
                        {eventDateInfo.isMultiRange && (
                          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block">
                            {eventDateInfo.totalRanges} date ranges
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {eventDateInfo.sameDay
                          ? "Same day"
                          : eventDateInfo.endDate}
                      </div>
                    </TableCell>
                    <TableCell>{event.location || event.address}</TableCell>
                    <TableCell>{event.organizer_name}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          status === "Incoming"
                            ? "bg-blue-100 text-blue-700"
                            : status === "Ongoing"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Date Ranges Details - Show only for multiple ranges */}
        {eventDateInfo.isMultiRange && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Date & Time Ranges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventDateInfo.dateRanges.map((range, index) => {
                  const rangeStartDate = new Date(
                    range.startDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  const rangeEndDate = new Date(
                    range.endDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  const isSameDay =
                    new Date(range.startDate).toDateString() ===
                    new Date(range.endDate).toDateString();

                  // Check if this specific range is ongoing
                  const now = new Date();
                  const rangeStart = new Date(
                    `${range.startDate}T${range.startTime}:00`
                  );
                  const rangeEnd = new Date(
                    `${range.endDate}T${range.endTime}:00`
                  );
                  const rangeStatus =
                    now >= rangeStart && now <= rangeEnd
                      ? "Ongoing"
                      : now < rangeStart
                      ? "Upcoming"
                      : "Completed";

                  return (
                    <Card
                      key={index}
                      className={cn(
                        "border-2",
                        rangeStatus === "Ongoing"
                          ? "border-green-300 bg-green-50"
                          : rangeStatus === "Upcoming"
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            Range {index + 1}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              rangeStatus === "Ongoing"
                                ? "border-green-600 text-green-700"
                                : rangeStatus === "Upcoming"
                                ? "border-blue-600 text-blue-700"
                                : "border-gray-600 text-gray-700"
                            )}
                          >
                            {rangeStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              {isSameDay
                                ? rangeStartDate
                                : `${rangeStartDate} to ${rangeEndDate}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              {range.startTime} - {range.endTime}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Event URLs & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventDateInfo.dateRanges.map((range, index) => {
                const rangeStartDate = new Date(range.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const rangeEndDate = new Date(range.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const isSameDay = new Date(range.startDate).toDateString() === new Date(range.endDate).toDateString();
                
                // Check if this specific range is ongoing
                const now = new Date();
                const rangeStart = new Date(`${range.startDate}T${range.startTime}:00`);
                const rangeEnd = new Date(`${range.endDate}T${range.endTime}:00`);
                const rangeStatus = now >= rangeStart && now <= rangeEnd 
                  ? "Ongoing" 
                  : now < rangeStart 
                    ? "Upcoming" 
                    : "Completed";
                
                return (
                  <Card key={index} className={cn(
                    "border-2",
                    rangeStatus === "Ongoing" 
                      ? "border-green-300 bg-green-50" 
                      : rangeStatus === "Upcoming"
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-300 bg-gray-50"
                  )}>
                    <CardHeader className="pb-2 px-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Range {index + 1}
                        </CardTitle>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          rangeStatus === "Ongoing" 
                            ? "border-green-600 text-green-700" 
                            : rangeStatus === "Upcoming"
                              ? "border-blue-600 text-blue-700"
                              : "border-gray-600 text-gray-700"
                        )}>
                          {rangeStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{isSameDay ? rangeStartDate : `${rangeStartDate} to ${rangeEndDate}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{range.startTime} - {range.endTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {modalOpen && (
          <EventModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            onSuccess={handleEventSuccess}
            editMode={true}
            initialData={editData}
          />
        )}
      </div>    
    </>
  );
};

export default EventHostDetailsPage;

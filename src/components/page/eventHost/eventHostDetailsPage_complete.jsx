"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, User, Edit, Users, CheckCircle, Clock, UserCheck, TrendingUp, Link, Smartphone, QrCode, Loader2 } from "lucide-react";
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
import { toast } from "react-toastify";
import EventModal from "@/components/modal/eventModal";
import { getRequest, postRequest } from "@/service/api";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventHostDetailsPage = ({ event }) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch event statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const response = await getRequest(`get-event-statistics/${event._id}`);
        if (response.status === "success") {
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
  }, [event._id]);

  // Prepare chart data
  const attendanceData = useMemo(() => {
    if (!statistics) return [];
    
    return [
      { name: 'Checked In', value: statistics.totalCheckedIn, color: '#22c55e' },
      { name: 'Registered', value: statistics.totalRegistered - statistics.totalCheckedIn, color: '#f59e0b' },
      { name: 'Not Registered', value: statistics.totalCapacity - statistics.totalRegistered, color: '#e5e7eb' }
    ].filter(item => item.value > 0);
  }, [statistics]);

  const handleEditEvent = () => {
    setEditData(event);
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

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDate = new Date(event.end_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sameDay = new Date(event.start_date).toDateString() === new Date(event.end_date).toDateString();

  const currentDate = new Date();
  const eventStartDate = new Date(event.start_date);
  const status = currentDate < eventStartDate ? "Upcoming" : "Ongoing";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.eventName}</h1>
          <p className="text-gray-600 mt-1">Event Dashboard</p>
        </div>
        <Button onClick={handleEditEvent} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Event
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registered */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    statistics?.totalRegistered || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Checked In */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    statistics?.totalCheckedIn || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Check-ins */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    statistics ? (statistics.totalRegistered - statistics.totalCheckedIn) : 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Capacity */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Event Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.participant_capacity || "Unlimited"}
                </p>
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
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
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
                  <TableCell className="font-medium">{event.eventName}</TableCell>
                  <TableCell>{event.company_name}</TableCell>
                  <TableCell className="capitalize">{event.eventType}</TableCell>
                  <TableCell>{startDate}</TableCell>
                  <TableCell>{sameDay ? "Same day" : endDate}</TableCell>
                  <TableCell>{event.location || event.address}</TableCell>
                  <TableCell>{event.organizer_name}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        status === "Upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-200 text-green-700"
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

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Event URLs & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Generate Form URL */}
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                if (!event.selected_form_id) {
                  toast.error("No form selected for this event");
                  return;
                }

                // Generate unique encrypted URL using the same approach as eventsList
                const config = await getRequest(`generate-unique-url/${event.event_slug}`);
                
                if (config.status === "success") {
                  const encryptedText = config.encryptedText.encryptedText;
                  const uniqueUrl = `${window.location.protocol}//${window.location.host}/event/${encryptedText}?form_id=${event.selected_form_id}`;
                  await navigator.clipboard.writeText(uniqueUrl);
                  toast.success("Form URL copied to clipboard!");
                } else {
                  console.error("Error:", config.message);
                  toast.error("Failed to generate URL");
                }
              } catch (err) {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy URL");
              }
            }}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Copy Form URL
          </Button>

          {/* Device URL */}
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const formData = new FormData();
                formData.append("id", event._id);
                formData.append("type", "0"); // Check-in type
                const config = await postRequest(`get-device-url`, formData);
                if (config.status == 1) {
                  const encryptedText = config.data.encoded;
                  const fullUrl = `${window.location.protocol}//${window.location.host}/attendee?key=${encryptedText}&event_slug=${event.event_slug}`;
                  await navigator.clipboard.writeText(fullUrl);
                  toast.success("CheckIn URL copied to clipboard!");
                } else {
                  toast.error("Failed to generate CheckIn URL");
                }
              } catch (err) {
                console.error("Failed to copy:", err);
                toast.error("Failed to generate CheckIn URL");
              }
            }}
            className="flex items-center gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Copy Device URL
          </Button>

          {/* Form URL QR Code */}
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                if (!event.selected_form_id) {
                  toast.error("No form selected for this event");
                  return;
                }
                const formUrl = `${window.location.protocol}//${window.location.host}/form/${event.selected_form_id}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;
                window.open(qrUrl, '_blank');
                toast.success("QR Code opened in new tab!");
              } catch (err) {
                console.error("Failed to generate QR:", err);
                toast.error("Failed to generate QR Code");
              }
            }}
            className="flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            Generate QR Code
          </Button>

          {/* Participant List */}
          <Button 
            variant="outline" 
            onClick={() => {
              router.push(`/dashboard/participant-list/${event._id}`);
            }}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            View Participants
          </Button>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSuccess={handleEventSuccess}
          editData={editData}
        />
      )}
    </div>
  );
};

export default EventHostDetailsPage;

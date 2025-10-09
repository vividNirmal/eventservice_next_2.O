"use client";

import { useState, useEffect, useMemo, useCallback, memo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Edit,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";
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
import { getEventsList, clearEventsCache, getEventStatus, getEventsListByCompany, copyEventHost } from "@/service/eventService";
import { useDebounce } from "use-debounce";
import { EventListSkeleton } from "@/components/common/EventListSkeleton";

// Memoized EventCard component for better performance
const EventCard = memo(({ event, onEdit, onCopy, onClick, isCopying }) => {
  // Memoize expensive calculations
  const eventData = useMemo(() => {
    const now = new Date();
    
    // Handle multiple date ranges or legacy single date
    let earliestStart, latestEnd, earliestStartTime, latestEndTime;
    
    if (event.dateRanges && Array.isArray(event.dateRanges) && event.dateRanges.length > 0) {
      // For multiple date ranges, find the earliest start and latest end
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
      
      earliestStart = sortedRanges[0].startDate;
      earliestStartTime = sortedRanges[0].startTime;
      latestEnd = sortedByEnd[0].endDate;
      latestEndTime = sortedByEnd[0].endTime;
    } else {
      // Fallback to legacy single date fields
      earliestStart = event.startDate;
      earliestStartTime = event.startTime;
      latestEnd = event.endDate;
      latestEndTime = event.endTime;
    }
    
    const eventStartDateTime = new Date(`${earliestStart}T${earliestStartTime}:00`);
    const eventEndDateTime = new Date(`${latestEnd}T${latestEndTime}:00`);
    
    // Determine status based on current date and event date range
    let status = "";
    
    if (event.dateRanges && Array.isArray(event.dateRanges) && event.dateRanges.length > 0) {
      // For multiple date ranges, check if current time falls within ANY range
      const isOngoing = event.dateRanges.some(range => {
        const rangeStart = new Date(`${range.startDate}T${range.startTime}:00`);
        const rangeEnd = new Date(`${range.endDate}T${range.endTime}:00`);
        return now >= rangeStart && now <= rangeEnd;
      });
      
      if (isOngoing) {
        status = "Ongoing";
      } else {
        // Check if all ranges are in the future (Incoming) or all in the past (Completed)
        const allFuture = event.dateRanges.every(range => {
          const rangeStart = new Date(`${range.startDate}T${range.startTime}:00`);
          return now < rangeStart;
        });
        
        status = allFuture ? "Incoming" : "Completed";
      }
    } else {
      // Legacy single date range logic
      if (now >= eventStartDateTime && now <= eventEndDateTime) {
        status = "Ongoing";
      } else {
        status = now < eventStartDateTime ? "Incoming" : "Completed";
      }
    }

    const startDate = new Date(earliestStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const endDate = new Date(latestEnd).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const sameDay = startDate === endDate;
    
    // Check if it's a multi-day event with multiple ranges
    const isMultiRange = event.dateRanges && event.dateRanges.length > 1;

    return {
      status,
      startDate,
      endDate,
      startTime: earliestStartTime,
      endTime: latestEndTime,
      sameDay,
      isMultiRange,
      totalRanges: event.dateRanges?.length || 1
    };
  }, [event.startDate, event.endDate, event.startTime, event.endTime, event.dateRanges]);

  const handleEditClick = useCallback((e) => {
    e.stopPropagation();
    onEdit(event);
  }, [event, onEdit]);

  const handleCopyClick = useCallback((e) => {
    e.stopPropagation();
    onCopy(event);
  }, [event, onCopy]);

  const handleCardClick = useCallback(() => {
    onClick(event._id);
  }, [event._id, onClick]);

  return (
    <Card
      className="shadow-sm border hover:shadow-md transition-shadow !gap-0 !p-0 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="py-5 px-0 min-h-40 flex flex-col items-center justify-center bg-linear-to-r from-gray-800 via-blue-700 to-gray-900 relative">
        <CardTitle className="text-2xl text-white uppercase">
          {event?.eventShortName}
        </CardTitle>
        <div className="absolute top-1 right-1 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyClick}
            disabled={isCopying}
            className="size-8 p-0 text-white hover:bg-gray-100 disabled:opacity-50"
            title="Copy Event"
          >
            {isCopying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="size-8 p-0 text-white hover:bg-gray-100"
            title="Edit Event"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {eventData.sameDay ? eventData.startDate : `${eventData.startDate} to ${eventData.endDate}`}
              {eventData.isMultiRange && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {eventData.totalRanges} ranges
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {eventData.isMultiRange ? (
                <span>
                  From {eventData.startTime} to {eventData.endTime} ({event.eventTimeZone})
                  <span className="block text-xs text-gray-500 mt-1">
                    Multiple time slots available
                  </span>
                </span>
              ) : (
                `${eventData.startTime} - ${eventData.endTime} (${event.eventTimeZone})`
              )}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Type:</span>
            <span className="capitalize">{event.eventType}</span>
          </div>

          {event.eventCategory && event.eventCategory.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.eventCategory.map((category, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-row justify-end">
            <span
              className={cn(
                "inline-block px-2 py-1 rounded text-xs font-medium",
                eventData.status === "Incoming"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-200 text-green-700"
              )}
            >
              {eventData.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const EventHostPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [userRole, setUserRole] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [copyingEventId, setCopyingEventId] = useState(null);

  // Memoized function to get event status - now using optimized service
  const getEventStatusMemo = useCallback((event) => {
    return getEventStatus(event);
  }, []);

  // Memoized filtered events to prevent unnecessary recalculations
  const filteredEvents = useMemo(() => {
    if (filter === "All") return events;
    return events.filter((event) => {
      const status = getEventStatusMemo(event);
      return status === filter;
    });
  }, [events, filter, getEventStatusMemo]);

  // Memoized event counts for filter buttons
  const eventCounts = useMemo(() => {
    return {
      Incoming: events.filter(e => getEventStatusMemo(e) === "Incoming").length,
      Completed: events.filter(e => getEventStatusMemo(e) === "Completed").length,
      Ongoing: events.filter(e => getEventStatusMemo(e) === "Ongoing").length,
    };
  }, [events, getEventStatusMemo]);

  // Fetch events from API with caching
  const fetchEvents = useCallback(async (pageNum = 1, search = "") => {
    try {
      setLoading(true);
      let response;
      
      // Check if user is admin and has companyId, then use company-specific API
      if (userRole === "admin" && companyId) {
        response = await getEventsListByCompany(companyId, pageNum, 10, search);
      } else {
        // For superadmin or users without companyId, use the general API
        response = await getEventsList(pageNum, 10, search);
      }

      if (response.status == 1) {
        setEvents(response.data.events || []);
        setTotalPages(response.data.totalPages || 1);
        setError(null);
      } else {
        throw new Error(response.message || "Failed to fetch events");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [userRole, companyId]);

  // Get user role and company ID from localStorage
  useEffect(() => {
    const loginUser = localStorage.getItem("loginuser");
    const storedCompanyId = localStorage.getItem("companyId");
    
    if (loginUser) {
      const userData = JSON.parse(loginUser);
      setUserRole(userData.role || "");
    }
    
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  // Initial load - wait for user data to be loaded
  useEffect(() => {
    if (userRole) { // Only fetch when we have user role determined
      fetchEvents(page, debouncedSearch);
    }
  }, [page, debouncedSearch, fetchEvents, userRole]);

  // Handle opening add modal
  const handleAddEvent = useCallback(() => {
    setModalMode("add");
    setEditingEvent(null);
    setModalOpen(true);
  }, []);

  // Handle opening edit modal - memoized
  const handleEditEvent = useCallback((event) => {
    console.log("=== DEBUG: Editing event ===");
    console.log("Original event data:", event);
    console.log("Event dateRanges:", event.dateRanges);
    
    const editData = {
      _id: event._id,
      event_id: event._id,
      eventName: event.eventName,
      eventShortName: event.eventShortName,
      eventTimeZone: event.eventTimeZone,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate,
      endTime: event.endTime,
      dateRanges: event.dateRanges && Array.isArray(event.dateRanges) && event.dateRanges.length > 0 
        ? event.dateRanges 
        : (event.startDate && event.startTime && event.endDate && event.endTime 
          ? [{
              startDate: event.startDate,
              startTime: event.startTime,
              endDate: event.endDate,
              endTime: event.endTime
            }]
          : []),
      eventType: event.eventType,
      event_type: event.event_type || event.eventType,
      eventCategory: event.eventCategory || [],
      location: event.location || "",
      description: event.description || "",
      company_name: event.company_name || "",
      event_description: event.event_description || "",
      event_slug: event.event_slug || "",
      google_map_url: event.google_map_url || "",
      event_logo: event.event_logo || null,
      event_image: event.event_image || null,
      event_sponsor: event.event_sponsor || null,
      show_location_image: event.show_location_image || null,
      organizer_name: event.organizer_name || "",
      organizer_email: event.organizer_email || "",
      organizer_phone: event.organizer_phone || "",
      with_face_scanner: event.with_face_scanner || null,
    };

    console.log("Edit data being passed to modal:", editData);
    console.log("Edit data dateRanges:", editData.dateRanges);
    
    setEditingEvent(editData);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  // Handle copying an event - creates new event via API call
  const handleCopyEvent = useCallback(async (event) => {
    try {
      setCopyingEventId(event._id);
      
      const response = await copyEventHost(event._id);
      
      if (response.status === 1) {
        // Success - refresh events list
        await fetchEvents(page, searchQuery);
        
        // You can add a toast notification here if you have one
        console.log("Event copied successfully:", response.message);
      } else {
        // Handle error response
        console.error("Failed to copy event:", response.message);
        setError(response.message || "Failed to copy event");
      }
    } catch (err) {
      console.error("Error copying event:", err);
      setError("An error occurred while copying the event");
    } finally {
      setCopyingEventId(null);
    }
  }, [fetchEvents, page, searchQuery]);

  // Handle closing modal
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  // Handle clicking on event card to view details
  const handleEventCardClick = useCallback((eventId) => {
    router.push(`/dashboard/event-host/${eventId}`);
  }, [router]);

  // Handle successful event save/update
  const handleEventSuccess = useCallback(() => {
    // Clear cache and refresh events list
    clearEventsCache();
    fetchEvents(page, searchQuery);
    handleCloseModal();
  }, [fetchEvents, page, searchQuery, handleCloseModal]);

  // Handle search - debounced
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  }, []);

  if (loading && events.length === 0) {
    return (
      <div className="flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="w-2/4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <EventListSkeleton />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Error loading events</span>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left Side - Event Cards */}
      <div className="flex-1">
        {/* Search Bar */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <input type="text" placeholder="Search events..." value={searchQuery} onChange={handleSearch} className="w-2/4 grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2" />
          <Button className="w-fit h-10" onClick={handleAddEvent} size="lg">Add New Event</Button>
        </div>
        {/* Filter Buttons */}
        <div className="w-full space-y-4">
          <Card className="p-2">
            <div className="flex flex-row items-center justify-between">
              <h3 className="font-semibold">Filter Events</h3>
              <div className="flex gap-2">
                {["Ongoing", "Incoming", "Completed", "All"].map((option) => (
                  <Button
                    key={option}
                    variant={filter === option ? "default" : "outline"}
                    onClick={() => setFilter(option)}
                    className="justify-start"
                  >
                    {option}
                    {option !== "All" && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {eventCounts[option] || 0}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {loading && events.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Refreshing...</span>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap gap-5 mt-5">
          <div className="w-2/4 grow">
            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onCopy={handleCopyEvent}
                  onClick={handleEventCardClick}
                  isCopying={copyingEventId === event._id}
                />
              ))}
            </div>
            {/* Empty state */}
            {filteredEvents.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm">
                  Try adjusting your filter or create a new event
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Modal Instance */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          editMode={modalMode === "edit"}
          initialData={editingEvent}
          onSuccess={handleEventSuccess}
        />
      )}
    </div>
  );
};

// Add display name for the memoized component
EventCard.displayName = 'EventCard';

export default EventHostPage;

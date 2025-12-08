"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  Suspense,
} from "react";
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
  Trash,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load the modal with better loading state and error boundary
const EventModal = dynamic(() => import("@/components/modal/eventHostModal"), {
  ssr: false,
  loading: () => null,
  //   (
  //   <div className="flex items-center justify-center p-8">
  //     <Loader2 className="h-6 w-6 animate-spin" />
  //     <span className="ml-2">Loading modal...</span>
  //   </div>
  // ),
});
import {
  getEventsList,
  clearEventsCache,
  getEventStatus,
  getEventsListByCompany,
  copyEventHost,
} from "@/service/eventService";
import { useDebounce } from "use-debounce";
import { EventListSkeleton } from "@/components/common/EventListSkeleton";
import { EventCategoryModal } from "@/components/modal/eventCategoryList";
import { getRequest } from "@/service/viewService";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { toast } from "sonner";

const EventCard = memo(
  ({ event, onEdit, onCopy, onClick, isCopying, onDelete, userRole }) => {
    const eventData = useMemo(() => {
      const now = new Date();

      // Handle multiple date ranges or legacy single date
      let earliestStart, latestEnd, earliestStartTime, latestEndTime;

      if (
        event.dateRanges &&
        Array.isArray(event.dateRanges) &&
        event.dateRanges.length > 0
      ) {
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

      const eventStartDateTime = new Date(
        `${earliestStart}T${earliestStartTime}:00`
      );
      const eventEndDateTime = new Date(`${latestEnd}T${latestEndTime}:00`);

      // Determine status based on current date and event date range
      let status = "";

      if (
        event.dateRanges &&
        Array.isArray(event.dateRanges) &&
        event.dateRanges.length > 0
      ) {
        // For multiple date ranges, check if current time falls within ANY range
        const isOngoing = event.dateRanges.some((range) => {
          const rangeStart = new Date(
            `${range.startDate}T${range.startTime}:00`
          );
          const rangeEnd = new Date(`${range.endDate}T${range.endTime}:00`);
          return now >= rangeStart && now <= rangeEnd;
        });

        if (isOngoing) {
          status = "Ongoing";
        } else {
          // Check if all ranges are in the future (Upcoming) or all in the past (Completed)
          const allFuture = event.dateRanges.every((range) => {
            const rangeStart = new Date(
              `${range.startDate}T${range.startTime}:00`
            );
            return now < rangeStart;
          });

          status = allFuture ? "Upcoming" : "Completed";
        }
      } else {
        // Legacy single date range logic
        if (now >= eventStartDateTime && now <= eventEndDateTime) {
          status = "Ongoing";
        } else {
          status = now < eventStartDateTime ? "Upcoming" : "Completed";
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
        totalRanges: event.dateRanges?.length || 1,
      };
    }, [
      event.startDate,
      event.endDate,
      event.startTime,
      event.endTime,
      event.dateRanges,
    ]);

    const handleEditClick = useCallback(
      (e) => {
        e.stopPropagation();
        onEdit(event);
      },
      [event, onEdit]
    );

    const handleCopyClick = useCallback(
      (e) => {
        e.stopPropagation();
        onCopy(event);
      },
      [event, onCopy]
    );

    const handleDelete = useCallback(
      (e) => {
        e.stopPropagation();
        onDelete(event._id);
      },
      [event._id, onDelete]
    );

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
            {/* Delete button */}
            {(userRole == "admin" || userRole == "superadmin") && (
              <Button
                id="detele"
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="size-8 p-0 text-white hover:bg-red-500"
                title="Detele Event"
              >
                <Trash className="h-4 w-4 hover:text-white" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {eventData.sameDay
                  ? eventData.startDate
                  : `${eventData.startDate} to ${eventData.endDate}`}
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
                    From {eventData.startTime} to {eventData.endTime} (
                    {event.eventTimeZone})
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

            <div className="pt-2 flex flex-row justify-between">
              {userRole == "superadmin" && event.company_name && (
                <span
                  className={cn(
                    "inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                  )}
                >
                  {event.company_name}
                </span>
              )}
              <span
                className={cn(
                  "ml-auto inline-block px-2 py-1 rounded text-xs font-medium",
                  eventData.status === "Upcoming"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-200 text-green-600"
                )}
              >
                {eventData.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [userRole, setUserRole] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [copyingEventId, setCopyingEventId] = useState(null);
  const [categorymodalOpen, setCategoryModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    eventId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getEventStatusMemo = useCallback((event) => {
    return getEventStatus(event);
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === "All") return events;
    return events.filter((event) => {
      const status = getEventStatusMemo(event);
      return status === filter;
    });
  }, [events, filter, getEventStatusMemo]);

  const eventCounts = useMemo(() => {
    return {
      Upcoming: events.filter((e) => getEventStatusMemo(e) === "Upcoming")
        .length,
      Completed: events.filter((e) => getEventStatusMemo(e) === "Completed")
        .length,
      Ongoing: events.filter((e) => getEventStatusMemo(e) === "Ongoing").length,
    };
  }, [events, getEventStatusMemo]);

  const fetchEvents = useCallback(
    async (pageNum = 1, search = "") => {
      try {
        setLoading(true);
        let response;

        if (userRole === "admin" && companyId) {
          response = await getEventsListByCompany(
            companyId,
            pageNum,
            0,
            search
          );
        } else {
          response = await getEventsList(pageNum, 0, search);
        }

        if (response.status == 1) {
          setEvents(response.data.events || []);
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
    },
    [userRole, companyId]
  );

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

  useEffect(() => {
    if (userRole) {
      fetchEvents(page, debouncedSearch);
    }
  }, [page, debouncedSearch, fetchEvents, userRole]);

  const handleAddEvent = useCallback(() => {
    setModalMode("add");
    setEditingEvent(null);
    setModalOpen(true);
  }, []);

  const handleEditEvent = useCallback(
    (event) => {
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
        dateRanges:
          event.dateRanges &&
          Array.isArray(event.dateRanges) &&
          event.dateRanges.length > 0
            ? event.dateRanges
            : event.startDate &&
              event.startTime &&
              event.endDate &&
              event.endTime
            ? [
                {
                  startDate: event.startDate,
                  startTime: event.startTime,
                  endDate: event.endDate,
                  endTime: event.endTime,
                },
              ]
            : [],
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
        event_category: event?.event_category || null,
        event_entry_exit_device: event?.event_entry_exit_device || [],
        instant_register: event?.instant_register || [],
        company_id: event.company_id || companyId || "",
      };

      setEditingEvent(editData);
      setModalMode("edit");
      setModalOpen(true);
    },
    [companyId]
  );

  const handleCopyEvent = useCallback(
    async (event) => {
      try {
        setCopyingEventId(event._id);

        const response = await copyEventHost(event._id);

        if (response.status === 1) {
          await fetchEvents(page, searchQuery);
        } else {
          console.error("Failed to copy event:", response.message);
          setError(response.message || "Failed to copy event");
        }
      } catch (err) {
        console.error("Error copying event:", err);
        setError("An error occurred while copying the event");
      } finally {
        setCopyingEventId(null);
      }
    },
    [fetchEvents, page, searchQuery]
  );

  const handleEventDelete = (event) => {
    setDeleteDialog({ open: true, eventId: event });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.eventId) return;

    const eventIdToDelete = deleteDialog.eventId;

    try {
      setDeleteLoading(true);
      const response = await getRequest(
        `get-event-host-delete/${eventIdToDelete}`
      );

      if (response.status === 1) {
        toast.success(response.message);
        setDeleteDialog({ open: false, eventId: null });

        // Clear any cache before fetching
        if (typeof clearEventsCache === "function") {
          clearEventsCache();
        }

        // Force refetch with slight delay to ensure backend is updated
        setTimeout(async () => {
          await fetchEvents(page, searchQuery);
        }, 100);
      } else {
        console.error("Failed to Delete event:", response.message);
        setError(response.message || "Failed to Delete event");
      }
    } catch (err) {
      console.error("Error Delete event:", err);
      setError("An error occurred while deleting the event");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  const handleEventCardClick = useCallback(
    (eventId) => {
      router.push(`/dashboard/event-host/${eventId}`);
    },
    [router]
  );

  const handleEventSuccess = useCallback(() => {
    clearEventsCache();
    fetchEvents(page, searchQuery);
    handleCloseModal();
  }, [fetchEvents, page, searchQuery, handleCloseModal]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
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
      <div className="flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-2/4 grow px-4 py-2 border border-gray-300 rounded-lg outline-none"
          />
          <Button className="w-fit h-10" onClick={handleAddEvent} size="lg">
            Add New Event
          </Button>
          <Button
            className="w-fit h-10"
            onClick={() => setCategoryModalOpen(true)}
            size="lg"
          >
            Add Event Shows{" "}
          </Button>
        </div>
        <div className="w-full space-y-4">
          <Card className="p-4 2xl:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h3 className="font-semibold">Filter Events</h3>
              <div className="flex flex-wrap gap-2">
                {["Ongoing", "Upcoming", "Completed", "All"].map((option) => (
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onCopy={handleCopyEvent}
                  onClick={handleEventCardClick}
                  isCopying={copyingEventId === event._id}
                  onDelete={handleEventDelete}
                  userRole={userRole}
                />
              ))}
            </div>
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

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          editMode={modalMode === "edit"}
          initialData={editingEvent}
          onSuccess={handleEventSuccess}
          userRole={userRole}
          userCompanyId={companyId}
        />
      )}

      {categorymodalOpen && (
        <EventCategoryModal
          open={categorymodalOpen}
          onOpenChange={setCategoryModalOpen}
          userRole={userRole}
          userCompanyId={companyId}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, eventId: null })}
        onConfirm={confirmDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

// Add display name for the memoized component
EventCard.displayName = "EventCard";

export default EventHostPage;

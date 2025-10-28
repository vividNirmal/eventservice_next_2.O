"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Edit2, EllipsisVertical, Key, Mail, Phone, Search, Tickets } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Shield, ShieldOff } from "lucide-react";
import moment from "moment";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, postRequest, updateRequest } from "@/service/viewService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RegistrationEditSheet from "../formPeople/commponent/RegistrationEditSheet";

const ParticipantUserListPage = ({ id, eventId }) => {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [blockingLoading, setBlockingLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "blocked"
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventId || id || ""); // Use eventId first, then fallback to id prop
  const [dynamicHeaders, setDynamicHeaders] = useState([]);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const dataLimits = [10, 20, 30, 50];

  // Filter participants based on status filter
  const filteredParticipants = participants.filter(participant => {
    const isBlocked = participant.dynamic_fields?.isBlocked || false;
    
    if (statusFilter === "blocked") return isBlocked;
    if (statusFilter === "active") return !isBlocked;
    return true; // "all"
  });

  // Function to generate dynamic headers from participant data
  const generateDynamicHeaders = (participants) => {
    if (!participants || participants.length === 0) return [];

    const headers = new Set();
    const firstParticipant = participants[0];

    // Get all top-level keys except dynamic_fields
    Object.keys(firstParticipant).forEach((key) => {
      if (key !== 'dynamic_fields' && key !== '__v'&& key !== '_id' && key !== 'event_id') {
        headers.add(key);
      }
    });

    // Get all keys from dynamic_fields, excluding dynamic_form_data
    if (firstParticipant.dynamic_fields) {
      Object.keys(firstParticipant.dynamic_fields).forEach((key) => {
        if (key !== 'dynamic_form_data') {
          headers.add(key);
        }
      });
    }

    return Array.from(headers);
  };

  // Fetch event list
  const fetchEvents = async () => {
    try {
      const res = await getRequest(
        "get-event-list?page=1&pageSize=null&searchQuery="
      );
      if (res.status === 1) {
        setEventList(res.data.event || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const fetchFormStructure = async (formId) => {
    try {
      const response = await getRequest(`forms/${formId?._id}`);
      if (response.status === 1 && response.data?.form?.pages) {
        const fields = response.data.form.pages.flatMap(
          (page) => page.elements || []
        );
        setFormFields(fields);
      }
    } catch (error) {
      console.error("Error fetching form structure:", error);
    }
  };
  
  const handleEdit = async (registration) => {
    setSelectedRegistration(registration);
    if (registration.ticketId?.registrationFormId) {
      await fetchFormStructure(registration.ticketId.registrationFormId);
    }
    setEditSheetOpen(true);
  };
  const getDateRangeParams = () => {
    const now = new Date();
    let startDate = null;
    let endDate = new Date();

    switch (dateRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      case "thisWeek":
        const firstDayOfWeek = new Date(now);
        const day = firstDayOfWeek.getDay();
        const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      default:
        return {};
    }

    return startDate && endDate
      ? {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      : {};
  };
  // Fetch participants with event filtering
  const fetchRegistrations = async () => {
    const dateParams = getDateRangeParams();
    setLoading(true);
    try {
      const url = `get-all-paticipant-user-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
        searchTerm
      )}&event_id=${selectedEvent}&startDate=${dateParams.startDate || ""}&endDate=${dateParams?.endDate || ""}`;

      const res = await getRequest(url);
      if (res.status === 1) {
        const participantsData = res?.data?.participants || [];
        setParticipants(participantsData);
        setTotalParticipants(res.data.pagination?.totalData || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setRegistrations(res.data.registrations || []);

        // Generate dynamic headers from the participants data
        const headers = generateDynamicHeaders(participantsData);
        setDynamicHeaders(headers);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      const response = await updateRequest(
        `form-registration-status-change/${registrationId}`,
        { approved: newStatus } // ✅ send boolean
      );
      if (response.status === 1) {
        toast.success(
          `Registration ${newStatus ? "approved" : "disapproved"} successfully`
        );
        fetchRegistrations();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleEditSuccess = () => {
    fetchRegistrations();
    setEditSheetOpen(false);
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // If id prop is provided, set it as selected event
    if (id) {
      setSelectedEvent(id);
    }
  }, [id]);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage, selectedLimit, searchTerm, selectedEvent, dateRange]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handleEventChange = (value) => {
    setSelectedEvent(value);
    setCurrentPage(1); // Reset to first page when event changes
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleEditParticipant = (participant) => {
    router.push(`/dashboard/participant-edit/${participant._id}`);
  };

  const handleToggleBlockStatus = async (participant) => {
    const participantId = participant._id;
    const currentBlockStatus = participant.dynamic_fields?.isBlocked || false;
    const newBlockStatus = !currentBlockStatus;

    // Set loading state for this specific participant
    setBlockingLoading(prev => ({ ...prev, [participantId]: true }));

    try {

      // Create FormData for the request
      const formData = new FormData();
      formData.append('participant_id', participantId);
      formData.append('isBlocked', newBlockStatus);

      const response = await postRequest("toggle-participant-block-status", formData);

      if (response.status === 1) {
        // Update the participant in the local state (optimistic update)
        setParticipants(prevParticipants => 
          prevParticipants.map(p => 
            p._id === participantId 
              ? {
                  ...p,
                  dynamic_fields: {
                    ...p.dynamic_fields,
                    isBlocked: newBlockStatus
                  }
                }
              : p
          )
        );

        toast.success(
          newBlockStatus 
            ? "Participant blocked successfully" 
            : "Participant unblocked successfully"
        );
      } else {
        throw new Error(response.message || "Failed to update participant status");
      }
    } catch (error) {
      console.error("❌ Error updating participant block status:", error);
      toast.error("Failed to update participant status. Please try again.");
    } finally {
      // Remove loading state for this participant
      setBlockingLoading(prev => {
        const newState = { ...prev };
        delete newState[participantId];
        return newState;
      });
    }
  };

  return (
    <section>
      <Card className={"gap-0 py-3"}>
        <CardHeader className={"flex flex-wrap items-center px-0 gap-3"}>
          <div className="flex flex-col gap-1">
            <CardTitle>Attendees List</CardTitle>
            {participants.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {totalParticipants}</span>
                <span className="text-green-600">Active: {participants.filter(p => !p.dynamic_fields?.isBlocked).length}</span>
                <span className="text-red-600">Blocked: {participants.filter(p => p.dynamic_fields?.isBlocked).length}</span>
                {statusFilter !== "all" && (
                  <span className="text-blue-600">Showing: {filteredParticipants.length}</span>
                )}
              </div>
            )}
          </div>

          {/* Search + Filters + Limit */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Event Dropdown */}
            {/* <Select value={selectedEvent} onValueChange={handleEventChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {eventList.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.event_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                <Calendar className="size-5 text-gray-500" />
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search attendees"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="!pl-10"
              />
            </div>
            <Select
              value={selectedLimit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataLimits.map((limit) => (
                  <SelectItem key={limit} value={limit.toString()}>
                    {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border mt-4 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Badge No</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Change Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
               <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No Attendees found
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((reg) => (
                    <TableRow key={reg._id}>
                      <TableCell
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => handlePreview(reg)}
                      >
                        {reg.formData?.firstName || reg.formData?.lastName
                          ? `${reg.formData?.firstName ?? ""} ${reg.formData?.lastName ?? ""}`.trim()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{reg.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{reg.contact || "N/A"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{reg.badgeNo || "N/A"}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {reg.ticketId?.ticketName || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {reg?.userType || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-gray-700`}
                        >
                          {reg.approved === true ? "Approved" : "Not Approved"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(reg.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="">
                        <div>
                          {reg.approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusUpdate(reg._id, false)}
                            >
                              Disapprove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusUpdate(reg._id, true)}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Burger Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <EllipsisVertical className="h-5 w-5 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(reg)}>
                                <Edit2 className="mr-2 h-4 w-4 text-gray-600" />
                                Edit
                              </DropdownMenuItem>
                              {/* Future options go here */}
                              {/* <DropdownMenuItem>View Logs</DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {totalParticipants > 0 && (
          <div className="mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={selectedLimit}
              totalEntries={totalParticipants}
            />
          </div>
        )}
      </CardContent>
      <RegistrationEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        registration={selectedRegistration}
        formFields={formFields}
        onSuccess={handleEditSuccess}
      />
    </section>
  );
};

export default ParticipantUserListPage;

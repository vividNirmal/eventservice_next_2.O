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
import { Search } from "lucide-react";
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
import { getRequest, postRequest } from "@/service/viewService";
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

const ParticipantUserListPage = ({ id, eventId }) => {
  const router = useRouter();
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

  // Function to get cell value for a given header and participant
  const getCellValue = (participant, header) => {
    // Check if the value exists in dynamic_fields first
    if (participant.dynamic_fields && participant.dynamic_fields[header] !== undefined) {
      const value = participant.dynamic_fields[header];
      
      // Handle special cases for complex objects
      if (header === 'face_image' && typeof value === 'object') {
        return value.faceData ? 'Face data available' : 'No face data';
      }
      
      return value;
    }
    
    // Otherwise, get the value from the top-level object
    if (participant[header] !== undefined) {
      const value = participant[header];
      
      // Format dates
      if ((header === 'createdAt' || header === 'updatedAt' || header.includes('time')) && value) {
        return moment(value).format("DD/MM/YYYY | hh:mm A");
      }
      
      // Handle null values
      if (value === null) {
        return '-';
      }
      
      return value;
    }
    
    return '-';
  };

  // Function to format header name for display
  const formatHeaderName = (header) => {
    return header
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
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

  // Fetch participants with event filtering
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const url = `get-all-paticipant-user-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
        searchTerm
      )}&event_id=${selectedEvent}`;

      const res = await getRequest(url);
      if (res.status === 1) {
        const participantsData = res?.data?.participants || [];
        setParticipants(participantsData);
        setTotalParticipants(res?.data?.totalUsers);
        setTotalPages(res?.data?.totalPages);
        
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
    fetchParticipants();
  }, [currentPage, selectedLimit, searchTerm, selectedEvent]);

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
            <CardTitle>Participant User List</CardTitle>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="blocked">Blocked Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search participants"
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
                  <TableHead>Sr.No.</TableHead>
                  {dynamicHeaders.map((header) => (
                    <TableHead key={header}>
                      {formatHeaderName(header)}
                    </TableHead>
                  ))}
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((data, idx) => {
                    const isBlocked = data.dynamic_fields?.isBlocked || false;
                    const isBlockingInProgress = blockingLoading[data._id] || false;
                    
                    return (
                      <TableRow 
                        key={data._id || idx}
                        className={isBlocked ? "bg-red-50" : ""}
                      >
                        <TableCell className={isBlocked ? "text-red-600 font-medium" : ""}>
                          {(currentPage - 1) * selectedLimit + idx + 1}
                        </TableCell>
                        {dynamicHeaders.map((header) => (
                          <TableCell 
                            key={header}
                            className={isBlocked ? "text-red-600 font-medium" : ""}
                          >
                            {getCellValue(data, header)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isBlocked ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <ShieldOff className="h-3 w-3 mr-1" />
                                Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditParticipant(data)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              
                              {/* Block/Unblock with Confirmation */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    disabled={isBlockingInProgress}
                                    className={isBlocked ? "text-green-600 focus:text-green-600" : "text-red-600 focus:text-red-600"}
                                  >
                                    {isBlockingInProgress ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : isBlocked ? (
                                      <ShieldOff className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Shield className="mr-2 h-4 w-4" />
                                    )}
                                    {isBlockingInProgress 
                                      ? "Processing..." 
                                      : isBlocked 
                                        ? "Unblock Participant" 
                                        : "Block Participant"
                                    }
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {isBlocked ? "Unblock Participant" : "Block Participant"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {isBlocked 
                                        ? "Are you sure you want to unblock this participant? They will be able to access the event again."
                                        : "Are you sure you want to block this participant? They will not be able to access the event until unblocked."
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleToggleBlockStatus(data)}
                                      className={isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                                    >
                                      {isBlocked ? "Unblock" : "Block"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={dynamicHeaders.length + 3}
                      className="text-center text-gray-400"
                    >
                      No participants found.
                    </TableCell>
                  </TableRow>
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
    </section>
  );
};

export default ParticipantUserListPage;

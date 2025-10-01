"use client";
import React, { useEffect, useState, useCallback } from "react";
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
import { Edit, MoreHorizontal } from "lucide-react";
import moment from "moment";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest } from "@/service/viewService";

const PeoplePage = ({eventId }) => {
  const router = useRouter();
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(eventId || "");
  const dataLimits = [10, 20, 30, 50];

  // Since the API now returns optimized data, we can directly use the values
  const getParticipantName = (participant) => {
    return participant?.name || "N/A";
  };

  const getContactInfo = (participant) => {
    return participant?.contact_info || "N/A";
  };

  const getRegistrationId = (participant) => {
    return participant?.registration_number || "N/A";
  };

  const getTicketInfo = (participant) => {
    return participant?.ticket_name || "General";
  };

  const getRegistrationDate = (participant) => {
    const dateStr = participant?.registration_date;
    if (dateStr) {
      return moment(dateStr).format("DD/MM/YYYY");
    }
    return "N/A";
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch participants with event filtering - using new API endpoint
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const url = `get-people-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
        debouncedSearchTerm
      )}&event_id=${selectedEvent}`;

      const res = await getRequest(url);
      if (res.status === 1) {
        const participantsData = res?.data?.participants || [];
        setParticipants(participantsData);
        setTotalParticipants(res?.data?.totalUsers);
        setTotalPages(res?.data?.totalPages);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If eventId prop is provided, set it as selected event
    if (eventId) {
      setSelectedEvent(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [currentPage, selectedLimit, debouncedSearchTerm, selectedEvent]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Reset to first page when search term changes
    if (value !== searchTerm) {
      setCurrentPage(1);
    }
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditParticipant = (participant) => {
    router.push(`/dashboard/participant-edit/${participant._id}`);
  };

  return (
    <section>
      <Card className={"gap-0 py-3"}>
        <CardHeader className={"flex flex-wrap items-center px-3 gap-3"}>
          <div className="flex flex-col gap-1">
            <CardTitle>People</CardTitle>
            {/* {participants.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {totalParticipants}</span>
              </div>
            )} */}
          </div>

          {/* Search + Limit */}
          <div className="flex items-center space-x-3 ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search people"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
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
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Reg ID</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length > 0 ? (
                  participants.map((data, idx) => {
                    return (
                      <TableRow key={data._id || idx}>
                        <TableCell>
                          {(currentPage - 1) * selectedLimit + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getParticipantName(data)}
                        </TableCell>
                        <TableCell>
                          {getContactInfo(data)}
                        </TableCell>
                        <TableCell>
                          {getRegistrationId(data)}
                        </TableCell>
                        <TableCell>
                          {getTicketInfo(data)}
                        </TableCell>
                        <TableCell>
                          {getRegistrationDate(data)}
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-400"
                    >
                      No people found.
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

export default PeoplePage;
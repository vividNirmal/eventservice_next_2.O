"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit2, Calendar, Mail, Phone, EllipsisVertical, Tickets, Key, CircleQuestionMark, FileBadge, Printer } from "lucide-react";
import { toast } from "sonner";
import { getRequest, pdfgenrateRequest, updateRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import RegistrationPreviewSheet from "./commponent/RegistrationPreviewSheet";
import RegistrationEditSheet from "./commponent/RegistrationEditSheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const RegistrationList = ({ eventId, userTypeId }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fieldMap , setFieldMap] = useState(null)

  // New filter states
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [dateRange, setDateRange] = useState("all");

  // Sheet states
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [printLoading, setPrintLoading] = useState(false);

  const limits = [10, 20, 30, 50];

  // Fetch tickets when userTypeId changes
  useEffect(() => {
    if (userTypeId && eventId) {
      fetchTickets();
    }
  }, [userTypeId, eventId]);

  // Fetch registrations when filters change
  useEffect(() => {
    if (userTypeId) fetchRegistrations();
  }, [
    eventId,
    userTypeId,
    search,
    currentPage,
    limit,
    selectedTicket,
    dateRange,
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        eventId: eventId,
        userType: userTypeId,
        status: "active", // Only fetch active tickets
      });

      const response = await getRequest(`tickets?${params}`);
      if (response.status === 1) {
        setTickets(response.data?.tickets || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets");
    }
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

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const dateParams = getDateRangeParams();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(eventId && { eventId }),
        ...(userTypeId && { userTypeId }),
        ...(search && { search }),
        ...(selectedTicket && { ticketId: selectedTicket }),
        ...dateParams,
      });

      const response = await getRequest(`form-registration-list?${params}`);
      if (response.status === 1) {
        setRegistrations(response.data.registrations || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
        setFieldMap(response.data.map_array)
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormStructure = async (formId) => {
    try {
      const response = await getRequest(`forms/${formId}`);
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

  const handlePreview = async (registration) => {
    setSelectedRegistration(registration);
    if (registration.ticketId?.registrationFormId) {
      await fetchFormStructure(registration.ticketId.registrationFormId);
    }
    setPreviewSheetOpen(true);
  };

  const handleEdit = async (registration) => {
    setSelectedRegistration(registration);
    if (registration.ticketId?.registrationFormId) {
      await fetchFormStructure(registration.ticketId.registrationFormId);
    }
    setEditSheetOpen(true);
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== limit) {
      setLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTicketChange = (ticketId) => {
    setSelectedTicket(ticketId);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTicket("");
    setDateRange("");
    setCurrentPage(1);
  };

  const handleEditSuccess = () => {
    fetchRegistrations();
    setEditSheetOpen(false);
  };

  const handlePrint = async (formData) => {
    if (!formData?._id) return;
    try {
      setPrintLoading(true);
      const Adddata = new FormData();
      Adddata.append("formRegistrationId", formData?._id);
      const blob = await pdfgenrateRequest("generate-paper-pdf-scanner", Adddata);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setPrintLoading(false);
      };
    } catch (e) {
      console.error(e);
      setPrintLoading(false);
    }
  };

  const hasActiveFilters = search || selectedTicket || dateRange;

  return (
    <>
      <Card>
        <CardContent>
          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            {/* First Row: Date Range, Ticket Filter, Search */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search Bar */}
              <div className="relative grow w-20">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder="Search by email or badge..."
                  value={search}
                  onChange={handleSearch}
                  className="!pl-10"
                />
              </div>
              {/* Date Range Filter */}
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

              {/* Ticket Filter */}
              {/* <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={selectedTicket} onValueChange={handleTicketChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Tickets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickets</SelectItem>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket._id} value={ticket._id}>
                        {ticket.ticketName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Clear Filters Button */}
              {/* {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600"
                >
                  Clear Filters
                </Button>
              )} */}

              {/* Show Limit */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {limits.map((l) => (
                      <SelectItem key={l} value={l.toString()}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Badge No</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Change Status</TableHead>
                  <TableHead>View Badge</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((reg) => (
                    <TableRow key={reg._id}>
                      <TableCell
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => handlePreview(reg)}
                      >
                        {reg.formData?.[fieldMap['first_name']] || reg.formData?.[fieldMap['last_name']]
                          ? `${reg.formData?.[fieldMap['first_name']] ?? ""} ${reg.formData?.[fieldMap['last_name']] ?? ""}`.trim()
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
                            <span>{reg.formData?.[fieldMap['contact_no']] || "N/A"}</span>
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-gray-700`}
                        >
                          {reg.approved === true ? "Approved" : "Not Approved"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(reg.createdAt)}
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

                      <TableCell className="">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(reg)}
                            title="Print Preview"
                            disabled={printLoading}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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
                               <DropdownMenuItem>
                                <Tickets className="mr-2 h-4 w-4 text-gray-600" />
                                Replace Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4 text-gray-600" />
                                Change Password
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

          {totalCount > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={limit}
              totalEntries={totalCount}
            />
          )}
        </CardContent>
      </Card>

      {/* Preview Sheet */}
      <RegistrationPreviewSheet
        open={previewSheetOpen}
        onOpenChange={setPreviewSheetOpen}
        registration={selectedRegistration}
        formFields={formFields}
        onStatusChange={fetchRegistrations}
      />

      {/* Edit Sheet */}
      <RegistrationEditSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        registration={selectedRegistration}
        formFields={formFields}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default RegistrationList;

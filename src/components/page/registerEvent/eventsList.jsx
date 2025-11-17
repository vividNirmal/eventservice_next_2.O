"use client";

import React, { use, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { Trash2, MoreHorizontal, Plus, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";
import CustomModal from "@/components/modal/customModal";
import QRCode from "qrcode";
import AddExtra from "@/components/page/registerEvent/AddExtra";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";

const RegisteredEvent = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [eventListData, setEventListData] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [imageModal, setImageModal] = useState({ open: false, url: "" });
  const [addExtraOpen, setAddExtraOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, events: [] });
  const [copied, setCopied] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const dataLimits = [10, 20, 30, 50];

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

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBulkDelete = () => {
    if (selectedEvents.size > 0) {
      setDeleteDialog({ open: true, events: Array.from(selectedEvents) });
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      deleteDialog.events.forEach((id) => formData.append("events_ids[]", id));
      const response = await postRequest("delete-event", formData);
      toast.success("Events deleted successfully");
      setSelectedEvents(new Set());
      fetchEvents();
      setDeleteDialog({ open: false, events: [] });
    } catch (error) {
      console.error("Error deleting events:", error);
      toast.error("Failed to delete events");
      setDeleteDialog({ open: false, events: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-event-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (res.status === 1) {
        setEventListData(res.data?.event || []);
        setTotalEvents(res.data.totalUsers);
        setTotalPages(res.data.totalPages);
        // setCurrentPage(res.data.currentPage);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedLimit, searchTerm]);
  useEffect(() => {
    const companyId = localStorage.getItem("companyId") || "";
    if (companyId && companyId !== "undefined") {
      fetchCopamy(companyId);
    }
  }, []);

  async function fetchCopamy(companyId) {
    const res = await getRequest(`get-company-details/${companyId}`);
    if (res.status === 1) {
      setCompanyData(res.data.company);
    }
  }

  const handleEdit = (row) => {
    router.push(`/dashboard/events-list/add/${row._id}`);
  };

  const handleDelete = (row) => {
    setDeleteDialog({ open: true, events: [row._id] });
  };

  const handleSelectEvent = (eventId) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEvents(new Set(eventListData.map((event) => event._id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const copyUrl = async (text) => {
    try {
      const config = await getRequest(`generate-unique-url/${text}`);

      if (config.status === "success") {
        const encryptedText = config.encryptedText.encryptedText;
        const uniqueUrl =
          `${window.location.protocol}//` +
          window.location.host +
          "/event/" +
          encryptedText;
        await navigator.clipboard.writeText(uniqueUrl);
        setCopied(true);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopied(false), 1000);
      } else {
        console.error("Error:", config.message);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  async function handleOpenDeviceUrl(data, type) {
    try {
      const formData = new FormData();
      formData.append("id", data._id);
      formData.append("type", type);
      const config = await postRequest(`get-device-url`, formData);

      if (config.status == 1) {
        const encryptedText = config.data.encoded;
        // Full functional URL with all parameters (this is what gets copied for functionality)
        const fullUrl =
          `${window.location.protocol}//` +
          window.location.host +
          "/attendee?key=" +
          encryptedText + "&event_slug=" + data.event_slug;
        
        await navigator.clipboard.writeText(fullUrl);
        // Show user-friendly message mentioning just the endpoint
        toast.success("Attendee check-in URL copied to clipboard!");
        setTimeout(() => setCopied(false), 1000);

      } else {
        toast.error("Failed to get device URL");
        console.log("Error:", config.message);
      }
    } catch (err) {
      console.log("Failed to copy:", err);
      toast.error("Failed to copy URL");
    }
  }

  const handleDownloadQr = async (text) => {
    try {
      const uniqueUrl = `${
        process.env.NEXT_PUBLIC_API_BASE_URL || ""
      }/get-registration-url/${text}`;
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, uniqueUrl);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "QRCode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewParticipants = (eventId) => {
    router.push(`/dashboard/participant-list/${eventId}`);
  };

  const handleAddExtra = async (event) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", event._id);
    let eventWithExtra = { ...event };
    try {
      const res = await postRequest("get-extra-event-details", formData);
      if (res.status === 1 && res.data) {
        eventWithExtra = {
          ...eventWithExtra,
          ...res.data,
        };
      }
    } catch (err) {
      // Optionally handle error
    }
    setSelectedEvent(eventWithExtra);
    setAddExtraOpen(true);
    setLoading(false);
  };

  const handleAddExtraSubmit = (formValues) => {
    setAddExtraOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <Card className={"gap-0 py-3"}>
        <CardHeader className={"flex flex-wrap items-center px-3 gap-3"}>
          <CardTitle>Event List</CardTitle>
          <div className="flex items-center space-x-3 ml-auto">
            {selectedEvents.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedEvents.size})
              </Button>
            )}
            <Button onClick={() => router.push("/dashboard/events-list/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events by company, title, or slug..."
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
      <CardContent className={"grow flex flex-col"}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="rounded-lg border overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            selectedEvents.size === eventListData.length &&
                            eventListData.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Generate Form Url</TableHead>
                      <TableHead>CheckIn Device Url</TableHead>
                      <TableHead>CheckOut Device Url</TableHead>
                      <TableHead>Form Url QR</TableHead>
                      <TableHead>Participant List </TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Event Slug</TableHead>
                      <TableHead>Start Date & Time</TableHead>
                      <TableHead>End Date & Time</TableHead>
                      <TableHead>Event Location</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Event Image</TableHead>
                      <TableHead>Organizer Name</TableHead>
                      <TableHead>Organizer Email</TableHead>
                      <TableHead>Organizer Phone</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventListData.length > 0 ? (
                      eventListData.map((event, idx) => (
                        <TableRow key={event._id || idx}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEvents.has(event._id)}
                              onCheckedChange={() =>
                                handleSelectEvent(event._id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {(currentPage - 1) * selectedLimit + idx + 1}
                          </TableCell>
                          {/* Generate Form Url */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className=" bg-black text-white border border-transparent hover:border-black flex items-center gap-1"
                              onClick={() => copyUrl(event.event_slug)}
                            >
                              {/* <ClipboardCopy className="h-4 w-4" /> */}
                              Copy Url
                            </Button>
                          </TableCell>
                          {/* Device Url */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer bg-black text-white border border-transparent flex items-center gap-1"
                              onClick={() =>
                                handleOpenDeviceUrl(event, "0")
                              }
                            >
                              {/* <ExternalLink className="h-4 w-4" /> */}
                              Check In Url
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer bg-black text-white border border-transparent flex items-center gap-1"
                              onClick={() =>
                                handleOpenDeviceUrl(event, "1")
                              }
                            >
                              {/* <ExternalLink className="h-4 w-4" /> */}
                              Check Out Url
                            </Button>
                          </TableCell>
                          {/* Form Url QR */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer bg-black text-white border border-transparent flex items-center gap-1"
                              onClick={() => handleDownloadQr(event.event_slug)}
                            >
                              {/* <Download className="h-4 w-4" /> */}
                              Download
                            </Button>
                          </TableCell>
                          {/* Participant List */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-black text-white cursor-pointer border border-transparent flex items-center gap-1"
                              onClick={() => handleViewParticipants(event._id)}
                            >
                              {/* <Users className="h-4 w-4" /> */}
                              View
                            </Button>
                          </TableCell>
                          <TableCell>{event.company_name}</TableCell>
                          <TableCell>{event.eventName || event.event_title}</TableCell>
                          <TableCell>{event.event_slug}</TableCell>
                          <TableCell>
                            {Array.isArray(event.start_date)
                              ? event.start_date.map((v, i) => (
                                  <div key={i}>
                                    {v
                                      ? moment(v).format("DD/MM/YYYY | hh:mm A")
                                      : "-"}
                                  </div>
                                ))
                              : event.start_date
                              ? moment(event.start_date).format(
                                  "DD/MM/YYYY | hh:mm A"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {Array.isArray(event.end_date)
                              ? event.end_date.map((v, i) => (
                                  <div key={i}>
                                    {v
                                      ? moment(v).format("DD/MM/YYYY | hh:mm A")
                                      : "-"}
                                  </div>
                                ))
                              : event.end_date
                              ? moment(event.end_date).format(
                                  "DD/MM/YYYY | hh:mm A"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>{event.location || event.address}</TableCell>
                          <TableCell>{event.event_type}</TableCell>
                          <TableCell>
                            {event.event_image && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-black text-white cursor-pointer border border-transparent"
                                  onClick={() =>
                                    setImageModal({
                                      open: true,
                                      url: event.event_image,
                                    })
                                  }
                                >
                                  View Image
                                </Button>
                              </>
                            )}
                          </TableCell>

                          <TableCell>{event.organizer_name}</TableCell>
                          <TableCell>{event.organizer_email}</TableCell>
                          <TableCell>{event.organizer_phone}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(event)}
                                  className="cursor-pointer"
                                >
                                  {/* <Edit className="mr-2 h-4 w-4" /> */}
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(event)}
                                  className="cursor-pointer"
                                >
                                  {/* <Trash2 className="mr-2 h-4 w-4" /> */}
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAddExtra(event)}
                                  className="cursor-pointer"
                                >
                                  {/* <Trash2 className="mr-2 h-4 w-4" /> */}
                                  Add Extra
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No events found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {totalEvents > 0 && (
              <div className="mt-4">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={selectedLimit}
                  totalEntries={totalEvents}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      {imageModal.open && (
        <CustomModal
          open={imageModal.open}
          onClose={() => setImageModal({ open: false, url: "" })}
          title="Event Image"
          width="max-w-md"
        >
          <img
            src={imageModal.url}
            alt="Event Large"
            className="w-full h-auto rounded border object-contain"
            style={{ maxHeight: 400 }}
          />
        </CustomModal>
      )}
      <AddExtra
        isOpen={addExtraOpen}
        onClose={() => setAddExtraOpen(false)}
        onSubmit={handleAddExtraSubmit}
        eventData={selectedEvent}
        fetchEvents={fetchEvents}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, events: [] })}
        onConfirm={confirmDelete}
        title={
          deleteDialog.events.length > 1 ? "Delete Events" : "Delete Event"
        }
        description={
          deleteDialog.events.length > 1
            ? `Are you sure you want to delete ${deleteDialog.events.length} events? This action cannot be undone.`
            : "Are you sure you want to delete this event? This action cannot be undone."
        }
        loading={loading}
      />
    </>
  );
};

export default RegisteredEvent;

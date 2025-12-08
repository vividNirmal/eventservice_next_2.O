"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { EventZoneFormSheet } from "./EventZoneFormSheet";
import { useDebounce } from "@/utils/debounce";

export const EventZoneList = ({ eventId }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    fetchZones();
  }, [currentPage, selectedLimit, debouncedSearch]);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId,
        ...(companyId && { companyId }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await getRequest(`event-zones?${params}`);
      if (res.status === 1) {
        setZones(res.data.zones || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      } else toast.error(res.message || "Failed to fetch event zones");
    } catch (error) {
      console.error("Error fetching event zones:", error);
      toast.error("Failed to fetch event zones");
    } finally {
      setLoading(false);
    }
  };

  const openCreateSheet = () => {
    setEditingZone(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (zone) => {
    setEditingZone(zone);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (zone) => {
    setZoneToDelete(zone);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async (values) => {
    setIsCreating(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const payload = { ...values, eventId, companyId };
      const res = await postRequest("event-zones", payload);
      if (res.status === 1) {
        toast.success("Event zone created successfully");
        fetchZones();
        setIsSheetOpen(false);
      } else toast.error(res.message || "Failed to create zone");
    } catch (error) {
      toast.error("Failed to create event zone");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (values) => {
    if (!editingZone) return;
    setIsUpdating(true);
    try {
      const payload = { ...values};
      const res = await updateRequest(`event-zones/${editingZone._id}`, payload);
      if (res.status === 1) {
        toast.success("Event zone updated successfully");
        fetchZones();
        setEditingZone(null);
        setIsSheetOpen(false);
      } else toast.error(res.message || "Failed to update zone");
    } catch (error) {
      toast.error("Failed to update event zone");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!zoneToDelete) return;
    try {
      const res = await deleteRequest(`event-zones/${zoneToDelete._id}`);
      if (res.status === 1) {
        toast.success("Zone deleted successfully");
        fetchZones();
      } else toast.error(res.message || "Failed to delete zone");
    } catch (error) {
      toast.error("Failed to delete zone");
    } finally {
      setZoneToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle>Event Zones</CardTitle>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={selectedLimit.toString()}
                  onValueChange={(v) => {
                    setSelectedLimit(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search zone by name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              <Button onClick={openCreateSheet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : zones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      No zones found
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <TableRow key={zone._id}>
                      <TableCell>{zone.name}</TableCell>
                      <TableCell>{formatDate(zone.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditSheet(zone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(zone)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              onPageChange={setCurrentPage}
              pageSize={selectedLimit}
              totalEntries={totalCount}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Sheet */}
      <EventZoneFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingZone(null);
        }}
        onSubmit={editingZone ? handleUpdate : handleCreate}
        isSubmitting={editingZone ? isUpdating : isCreating}
        initialData={editingZone}
        title={editingZone ? "Edit Event Zone" : "Add Event Zone"}
        submitButtonText={editingZone ? "Update" : "Create"}
      />

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setZoneToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${zoneToDelete?.name}"`}
        description="Are you sure you want to delete this event zone? This action cannot be undone."
      />
    </>
  );
};

export default EventZoneList;

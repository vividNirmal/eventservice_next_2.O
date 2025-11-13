"use client";
import React, { useState, useEffect } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Loader2, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, postRequest, updateRequest, deleteRequest } from "@/service/viewService";
import ExhibitorFormParticularSheet from "./ExhibitorFormParticularSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ActionConfirmationDialog } from "@/components/common/ActionConfirmationDialog";

export default function ExhibitorFormParticularList({eventId, exhibitorFormId}){

  const [particulars, setParticulars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingParticular, setEditingParticular] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [particularToDelete, setParticularToDelete] = useState(null);
  const [eventZones, setEventZones] = useState([]);

  // Status change states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [particularToUpdate, setParticularToUpdate] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Pagination & search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    if (exhibitorFormId) {
      fetchParticulars();
      fetchEventZones();
    }
  }, [currentPage, selectedLimit, searchTerm, exhibitorFormId]);

  const fetchParticulars = async () => {
    if (!exhibitorFormId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        exhibitorFormId: exhibitorFormId,
        ...(searchTerm && { search: searchTerm }),
        ...(eventId && { eventId: eventId }),
        ...(companyId && { companyId: companyId }),
      });

      const res = await getRequest(`exhibitor-form-particulars?${params}`);
      if (res.status === 1) {
        setParticulars(res.data.particulars || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      } else {
        toast.error(res.message || "Failed to fetch particulars");
      }
    } catch (err) {
      toast.error("Failed to fetch particulars");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventZones = async () => {
    try {
      const res = await getRequest(`event-zones?eventId=${eventId}&limit=0`);
      if (res.status === 1) {
        setEventZones(res.data.zones || []);
      }
    } catch (error) {
      console.error("Error fetching event zones:", error);
    }
  };

  // Handle status change
  const handleStatusChange = (particular) => {
    setParticularToUpdate(particular);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!particularToUpdate) return;
    
    setStatusLoading(true);
    try {
      const newStatus = particularToUpdate.status === 'active' ? 'inactive' : 'active';
      
      const res = await updateRequest(
        `exhibitor-form-particulars-status/${particularToUpdate._id}`,
        { status: newStatus }
      );
      
      if (res.status === 1) {
        toast.success("Status updated successfully");
        // Update local state
        setParticulars(prev => 
          prev.map(p => 
            p._id === particularToUpdate._id ? { ...p, status: newStatus } : p
          )
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
      setStatusDialogOpen(false);
      setParticularToUpdate(null);
    }
  };

  const handleCreate = async (formData) => {
    setIsCreating(true);
    try {
      formData.append("exhibitorFormId", exhibitorFormId);
      formData.append("eventId", eventId);
      formData.append("companyId", companyId);
      
      const res = await postRequest("exhibitor-form-particulars", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.status === 1) {
        toast.success("Particular created successfully");
        setIsSheetOpen(false);
        fetchParticulars();
      } else {
        toast.error(res.message || "Failed to create particular");
      }
    } catch (error) {
      toast.error("Failed to create particular");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingParticular) return;
    setIsUpdating(true);
    try {
      
      const res = await updateRequest(
        `exhibitor-form-particulars/${editingParticular._id}`,
        formData
      );
      
      if (res.status === 1) {
        toast.success("Particular updated successfully");
        setIsSheetOpen(false);
        setEditingParticular(null);
        fetchParticulars();
      } else {
        toast.error(res.message || "Failed to update particular");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update particular");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!particularToDelete) return;
    try {
      const res = await deleteRequest(
        `exhibitor-form-particulars/${particularToDelete._id}`
      );
      if (res.status === 1) {
        toast.success("Particular deleted successfully");
        fetchParticulars();
      } else {
        toast.error(res.message || "Failed to delete particular");
      }
    } catch (error) {
      toast.error("Failed to delete particular");
    } finally {
      setIsDeleteDialogOpen(false);
      setParticularToDelete(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });


  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle>Exhibitor Form Particulars</CardTitle>

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
                  placeholder="Search by item name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>
              <Button
                onClick={() => { 
                  setEditingParticular(null); 
                  setIsSheetOpen(true); 
                }}
                disabled={!exhibitorFormId}
              >
                <Plus className="h-4 w-4 mr-2" />
                 Add Particular
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!exhibitorFormId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                No Exhibitor Form selected. Please select a form to manage particulars.
              </p>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Particular Name</TableHead>
                  <TableHead>Material Number</TableHead>
                  <TableHead className="text-center">Total Allocated Assets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : particulars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {exhibitorFormId ? "No particulars found" : "Select an exhibitor form to view particulars"}
                    </TableCell>
                  </TableRow>
                ) : (
                  particulars.map((particular) => (
                    <TableRow key={particular._id}>
                      <TableCell className="font-medium">{particular.item_name || "N/A"}</TableCell>
                      <TableCell>{particular?.material_number || "N/A"}</TableCell>
                      <TableCell className="text-center">
                        <span className={
                          particular.totalAllocatedQuantity > 0 
                            ? "text-green-600 font-medium" 
                            : "text-gray-400"
                        }>
                          {particular.totalAllocatedQuantity || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={particular.status === "active"}
                            onCheckedChange={() => handleStatusChange(particular)}
                            disabled={statusLoading}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(particular.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { 
                              setEditingParticular(particular); 
                              setIsSheetOpen(true); 
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { 
                              setParticularToDelete(particular); 
                              setIsDeleteDialogOpen(true); 
                            }}
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
          
          {totalCount > 0 && (
            <div className="mt-4">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={selectedLimit}
                totalEntries={totalCount}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Sheet */}
      <ExhibitorFormParticularSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={editingParticular ? handleUpdate : handleCreate}
        isSubmitting={editingParticular ? isUpdating : isCreating}
        initialData={editingParticular || undefined}
        title={editingParticular ? "Edit Particular" : "Add New Particular"}
        description={
          editingParticular
            ? "Update the particular details."
            : "Create a new exhibitor form particular."
        }
        submitButtonText={editingParticular ? "Update" : "Create"}
        eventId={eventId}
        eventZones={eventZones}
        exhibitorFormId={exhibitorFormId}
      />

      {/* Status Confirmation Dialog using ActionConfirmationDialog */}
      <ActionConfirmationDialog
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={confirmStatusChange}
        title="Change Status"
        description={`Are you sure you want to change the status of "${particularToUpdate?.item_name}" from ${particularToUpdate?.status} to ${particularToUpdate?.status === 'active' ? 'inactive' : 'active'}?`}
        confirmButtonText={particularToUpdate?.status === 'active' ? 'Deactivate' : 'Activate'}
        loading={statusLoading}
        icon={ToggleLeft}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${particularToDelete?.item_name}"`}
        description="This action cannot be undone. All associated data will be removed."
      />
    </>
  );
}
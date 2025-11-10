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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, postRequest, updateRequest, deleteRequest } from "@/service/viewService";
import ExhibitorFormParticularSheet from "./ExhibitorFormParticularSheet";

export default function ExhibitorFormParticularList ({eventId, exhibitorFormId}){

  const [particulars, setParticulars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingParticular, setEditingParticular] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [particularToDelete, setParticularToDelete] = useState(null);

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
    }
  }, [currentPage, selectedLimit, searchTerm, exhibitorFormId]);

  const fetchParticulars = async () => {
    if (!exhibitorFormId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        exhibitorForm: exhibitorFormId,
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

  const handleCreate = async (formData) => {
    setIsCreating(true);
    try {
      formData.append("ExhibitorForm", exhibitorFormId);
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Exhibitor Form Particulars</CardTitle>
          <div className="flex items-center gap-4">
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
              <Plus className="h-4 w-4 mr-2" /> Add Particular
            </Button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : particulars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6">
                      {exhibitorFormId ? "No particulars found" : "Select an exhibitor form to view particulars"}
                    </TableCell>
                  </TableRow>
                ) : (
                  particulars.map((particular) => (
                    <TableRow key={particular._id}>
                      <TableCell className="font-medium">{particular.item_name || "N/A"}</TableCell>
                      <TableCell>{particular?.material_number || "N/A"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={particular.status === "active" ? "default" : "secondary"}
                          className={particular.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {particular.status}
                        </Badge>
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
};
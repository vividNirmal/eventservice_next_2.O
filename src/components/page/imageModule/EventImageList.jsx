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
import { Plus, Search, Edit, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { EventImageFormSheet } from "./EventImageFormSheet";

export const EventImageList = ({ eventId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingImage, setEditingImage] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""; // make sure this is set

  useEffect(() => {
    fetchImages();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId,
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await getRequest(`get-event-images?${params}`);
      if (response.status === 1) {
        setImages(response.data.eventImages || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else toast.error(response.message || "Failed to fetch event images");
    } catch (err) {
      console.error("Error fetching event images:", err);
      toast.error("Failed to fetch event images");
    } finally {
      setLoading(false);
    }
  };

  const openCreateSheet = () => {
    setEditingImage(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (img) => {
    setEditingImage(img);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (img) => {
    setImageToDelete(img);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async (formData) => {
    setIsCreating(true);
    try {
      formData.append("eventId", eventId);
      formData.append("companyId", localStorage.getItem("companyId"));
      const response = await postRequest("create-event-image", formData);
      if (response.status === 1) {
        toast.success("Image added successfully");
        setIsSheetOpen(false);
        fetchImages();
      } else toast.error(response.message || "Failed to add image");
    } catch (err) {
      toast.error("Failed to add image");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingImage) return;
    setIsUpdating(true);
    try {
      const response = await updateRequest(
        `update-event-image/${editingImage._id}`,
        formData
      );
      if (response.status === 1) {
        toast.success("Image updated successfully");
        setIsSheetOpen(false);
        setEditingImage(null);
        fetchImages();
      } else toast.error(response.message || "Failed to update image");
    } catch (err) {
      toast.error("Failed to update image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      const response = await deleteRequest(`delete-event-image/${imageToDelete._id}`);
      if (response.status === 1) {
        toast.success("Image deleted successfully");
        fetchImages();
      } else toast.error(response.message || "Failed to delete image");
    } catch (err) {
      toast.error("Failed to delete image");
    } finally {
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCopyUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.includes("undefined")) {
      toast.error("Invalid image URL");
      return;
    }
    navigator.clipboard.writeText(imageUrl);
    toast.success("Image URL copied to clipboard");
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
            <CardTitle>Event Images</CardTitle>

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
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              <Button onClick={openCreateSheet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
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
                  <TableHead>Image</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : images.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No images found
                    </TableCell>
                  </TableRow>
                ) : (
                  images.map((img) => (
                    <TableRow key={img._id}>
                      <TableCell>{img.name}</TableCell>
                      <TableCell>
                        <img
                          src={`${img.imageUrl}`}
                          alt={img.name}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      </TableCell>
                      <TableCell>{formatDate(img.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyUrl(img.imageUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditSheet(img)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(img)}
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

      <EventImageFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingImage(null);
        }}
        onSubmit={editingImage ? handleUpdate : handleCreate}
        isSubmitting={editingImage ? isUpdating : isCreating}
        initialData={editingImage}
        title={editingImage ? "Update Image" : "Add Image"}
        description={
          editingImage
            ? "Update the existing event image"
            : "Upload a new event image"
        }
        submitButtonText={editingImage ? "Update" : "Create"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${imageToDelete?.name}"`}
        description="Are you sure you want to delete this event image? This action cannot be undone."
      />
    </>
  );
};

export default EventImageList;

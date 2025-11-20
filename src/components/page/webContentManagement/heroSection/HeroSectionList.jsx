"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { HeroSectionFormSheet } from "./HeroSectionFormSheet";

export const HeroSectionList = () => {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHeroSection, setEditingHeroSection] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [heroSectionToDelete, setHeroSectionToDelete] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchHeroSections();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchHeroSections = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        companyId,
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await getRequest(`get-hero-sections?${params}`);
      if (response.status === 1) {
        setHeroSections(response.data.heroSections || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else {
        toast.error(response.message || "Failed to fetch hero sections");
      }
    } catch (err) {
      console.error("Error fetching hero sections:", err);
      toast.error("Failed to fetch hero sections");
    } finally {
      setLoading(false);
    }
  };

  const openCreateSheet = () => {
    setEditingHeroSection(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (heroSection) => {
    setEditingHeroSection(heroSection);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (heroSection) => {
    setHeroSectionToDelete(heroSection);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async (formData) => {
    setIsCreating(true);
    try {
      formData.append("companyId", localStorage.getItem("companyId"));
      const response = await postRequest("create-hero-section", formData);
      if (response.status === 1) {
        toast.success("Hero section created successfully");
        setIsSheetOpen(false);
        fetchHeroSections();
      } else {
        toast.error(response.message || "Failed to create hero section");
      }
    } catch (err) {
      toast.error("Failed to create hero section");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingHeroSection) return;
    setIsUpdating(true);
    try {
      const response = await updateRequest(
        `update-hero-section/${editingHeroSection._id}`,
        formData
      );
      if (response.status === 1) {
        toast.success("Hero section updated successfully");
        setIsSheetOpen(false);
        setEditingHeroSection(null);
        fetchHeroSections();
      } else {
        toast.error(response.message || "Failed to update hero section");
      }
    } catch (err) {
      toast.error("Failed to update hero section");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!heroSectionToDelete) return;
    try {
      const response = await deleteRequest(
        `delete-hero-section/${heroSectionToDelete._id}`
      );
      if (response.status === 1) {
        toast.success("Hero section deleted successfully");
        fetchHeroSections();
      } else {
        toast.error(response.message || "Failed to delete hero section");
      }
    } catch (err) {
      toast.error("Failed to delete hero section");
    } finally {
      setIsDeleteDialogOpen(false);
      setHeroSectionToDelete(null);
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
            <CardTitle>Hero Section</CardTitle>

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
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              <Button onClick={openCreateSheet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Hero Section
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : heroSections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No hero sections found
                    </TableCell>
                  </TableRow>
                ) : (
                  heroSections.map((heroSection) => (
                    <TableRow key={heroSection._id}>
                      <TableCell className="font-medium">
                        {heroSection.title}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {heroSection.description}
                      </TableCell>
                      <TableCell>
                        <img
                          src={heroSection.imageUrl}
                          alt={heroSection.title}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      </TableCell>
                      <TableCell>{formatDate(heroSection.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditSheet(heroSection)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(heroSection)}
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

      <HeroSectionFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingHeroSection(null);
        }}
        onSubmit={editingHeroSection ? handleUpdate : handleCreate}
        isSubmitting={editingHeroSection ? isUpdating : isCreating}
        initialData={editingHeroSection}
        title={
          editingHeroSection ? "Update Hero Section" : "Create Hero Section"
        }
        description={
          editingHeroSection
            ? "Update the existing hero section"
            : "Create a new hero section for your company"
        }
        submitButtonText={editingHeroSection ? "Update" : "Create"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setHeroSectionToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${heroSectionToDelete?.title}"`}
        description="Are you sure you want to delete this hero section? This action cannot be undone."
      />
    </>
  );
};

export default HeroSectionList;

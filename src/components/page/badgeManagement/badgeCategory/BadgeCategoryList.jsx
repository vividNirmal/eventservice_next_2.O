"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { BadgeCategoryFormSheet } from "./BadgeCategoryFormSheet";

export const BadgeCategoryList = ({ eventId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchCategories();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId,
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await getRequest(`get-badge-categories?${params}`);
      if (response.status === 1) {
        setCategories(response.data.categories || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else {
        toast.error(response.message || "Failed to fetch badge categories");
      }
    } catch (err) {
      console.error("Error fetching badge categories:", err);
      toast.error("Failed to fetch badge categories");
    } finally {
      setLoading(false);
    }
  };

  const openCreateSheet = () => {
    setEditingCategory(null); // Clear old data
    setIsSheetOpen(true);
  };

  const openEditSheet = (cat) => {
    setEditingCategory(cat);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (cat) => {
    setCategoryToDelete(cat);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async (data) => {
    setIsCreating(true);
    try {
      const payload = {
        ...data,
        eventId,
        companyId: localStorage.getItem("companyId"),
      };
      const response = await postRequest("create-badge-category", payload);
      if (response.status === 1) {
        toast.success("Badge category created successfully");
        setIsSheetOpen(false);
        fetchCategories();
      } else toast.error(response.message || "Failed to create badge category");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create badge category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingCategory) return;
    setIsUpdating(true);
    try {
      const response = await updateRequest(
        `update-badge-category/${editingCategory._id}`,
        data
      );
      if (response.status === 1) {
        toast.success("Badge category updated successfully");
        setIsSheetOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else toast.error(response.message || "Failed to update badge category");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update badge category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await deleteRequest(
        `delete-badge-category/${categoryToDelete._id}`
      );
      if (response.status === 1) {
        toast.success("Badge category deleted successfully");
        fetchCategories();
      } else toast.error(response.message || "Failed to delete badge category");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete badge category");
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
            <div>
              <CardTitle>Badge Categories</CardTitle>
              <CardDescription className="hidden"></CardDescription>
            </div>
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
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Priority</TableHead>
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
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.code || "—"}</TableCell>
                      <TableCell>{cat.priority}</TableCell>
                      <TableCell>{formatDate(cat.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSheet(cat)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(cat)}
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

      <BadgeCategoryFormSheet
        // key={editingCategory ? `edit-${editingCategory._id}` : 'create'}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        isSubmitting={editingCategory ? isUpdating : isCreating}
        initialData={editingCategory}
        title={editingCategory ? "Update Category" : "Create Category"}
        description={
          editingCategory
            ? "Update existing badge category"
            : "Add a new badge category"
        }
        submitButtonText={editingCategory ? "Update" : "Create"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${categoryToDelete?.name}"`}
        description="Are you sure you want to delete this badge category? This action cannot be undone."
      />
    </>
  );
};

export default BadgeCategoryList;

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";
import { TemplateTypeSheet } from "../components/TemplateTypeSheet";
import { Plus, Search, Edit, Trash2, Copy, Mail } from "lucide-react";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";

const EmailTypeList = () => {
  const router = useRouter();
  const [templateTypes, setTemplateTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchTemplateTypes();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchTemplateTypes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        type: "email", // Only fetch email template types
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`template-types?${params}`);

      if (response.status === 1) {
        setTemplateTypes(response.data.templateTypes || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching template types:", error);
      toast.error("Failed to fetch template types");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplateType = async (typeName) => {
    setIsCreating(true);
    try {
      const payload = {
        type: "email",
        typeName,
      };

      const response = await postRequest("template-types", payload);

      if (response.status === 1) {
        toast.success("Email type created successfully");
        setIsAddModalOpen(false);
        fetchTemplateTypes();
      }
    } catch (error) {
      console.error("Error creating template type:", error);
      toast.error("Failed to create email type");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTemplateType = async (typeName) => {
    if (!templateToEdit) return;

    setIsUpdating(true);
    try {
      const payload = {
        typeName,
      };

      const response = await updateRequest(
        `template-types/${templateToEdit._id}`,
        payload
      );

      if (response.status === 1) {
        toast.success("Email type updated successfully");
        setIsEditModalOpen(false);
        setTemplateToEdit(null);
        fetchTemplateTypes();
      }
    } catch (error) {
      console.error("Error updating template type:", error);
      toast.error("Failed to update email type");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTemplateType = async () => {
    if (!templateToDelete) return;

    try {
      const response = await deleteRequest(
        `template-types/${templateToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("Email type deleted successfully");
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
        fetchTemplateTypes();
      }
    } catch (error) {
      console.error("Error deleting template type:", error);
      toast.error("Failed to delete email type");
    }
  };

  const handleCopyDetails = async (template) => {
    try {
      const textToCopy = `Type Name: ${template.typeName}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Template type details copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy details");
    }
  };

  const openEditModal = (template) => {
    setTemplateToEdit(template);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Email Template Types
              </CardTitle>
              <CardDescription>
                Manage your email template types - Total {totalCount} types
                found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {/* Limit Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show:
                </span>
                <Select
                  value={selectedLimit.toString()}
                  onValueChange={handleLimitChange}
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search types..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-64"
                />
              </div>

              {/* Add Button */}
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Email Type
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Type Name</TableHead>
                  <TableHead className="w-1/3">Created At</TableHead>
                  <TableHead className="text-right w-1/3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading template types...
                    </TableCell>
                  </TableRow>
                ) : templateTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      {searchTerm
                        ? "No template types found matching your search"
                        : "No template types found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  templateTypes.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium w-1/3">
                        {template.typeName}
                      </TableCell>
                      <TableCell className="w-1/3">{formatDate(template.createdAt)}</TableCell>
                      <TableCell className="text-right w-1/3">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyDetails(template)}
                            title="Copy template type details"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(template)}
                            title="Edit template type"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(template)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete template type"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={selectedLimit}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <TemplateTypeSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTemplateType}
        isSubmitting={isCreating}
        title="Add New Email Type"
        description="Create a new type for your email templates."
        submitButtonText="Create Type"
      />

      {/* Edit Modal */}
      <TemplateTypeSheet
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTemplateToEdit(null);
        }}
        onSubmit={handleEditTemplateType}
        isSubmitting={isUpdating}
        initialData={
          templateToEdit ? { typeName: templateToEdit.typeName } : undefined
        }
        title="Edit Email Type"
        description="Update the email template type name."
        submitButtonText="Update Type"
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteTemplateType}
        title={`Delete "${templateToDelete?.typeName}"`}
        description={`Are you sure you want to delete this email type? This action cannot be undone.`}
      />
    </>
  );
};

export default EmailTypeList;

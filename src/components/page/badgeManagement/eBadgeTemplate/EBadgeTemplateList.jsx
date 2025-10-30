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
import { Plus, Search, Edit, Trash2, Copy, Eye, Loader2 } from "lucide-react";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { EBadgeTemplateFormSheet } from "./EBadgeTemplateFormSheet";

const EBadgeTemplateList = ({ eventId }) => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, selectedLimit, searchTerm]);


  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId: eventId,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`get-e-badge-templates?${params}`);

      if (response.status === 1) {
        setTemplates(response.data.templates || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else {
        toast.error(response?.message || "Failed to fetch e-badge templates");
      }
    } catch (error) {
      console.error("Error fetching e-badge templates:", error);
      toast.error("Failed to fetch e-badge templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (data) => {
    setIsCreating(true);
    try {
      const payload = {
        name: data.name,
        htmlContent: data.htmlContent,
        eventId: eventId,
        companyId: localStorage.getItem("companyId"),
      };

      const response = await postRequest(
        `create-e-badge-template`,
        payload
      );

      if (response.status === 1) {
        toast.success("E-Badge template created successfully");
        setIsSheetOpen(false);
        fetchTemplates();
      } else {
        toast.error(response?.message || "Failed to create e-badge template");
      }
    } catch (error) {
      console.error("Error creating e-badge template:", error);
      toast.error("Failed to create e-badge template");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTemplate = async (data) => {
    if (!editingTemplate) return;

    setIsUpdating(true);
    try {
      const payload = {
        name: data.name,
        htmlContent: data.htmlContent,
      };

      const response = await updateRequest(
        `update-e-badge-template/${editingTemplate._id}`,
        payload
      );

      if (response.status === 1) {
        toast.success("E-Badge template updated successfully");
        setIsSheetOpen(false);
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error(response?.message || "Failed to update e-badge template");
      }
    } catch (error) {
      console.error("Error updating e-badge template:", error);
      toast.error("Failed to update e-badge template");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const response = await deleteRequest(
        `delete-e-badge-template/${templateToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("E-Badge template deleted successfully");
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
        fetchTemplates();
      } else {
        toast.error(response?.message || "Failed to delete e-badge template");
      }
    } catch (error) {
      console.error("Error deleting e-badge template:", error);
      toast.error("Failed to delete e-badge template");
    }
  };

  const openCreateSheet = () => {
    setEditingTemplate(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (template) => {
    setEditingTemplate(template);
    setIsSheetOpen(true);
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
        <CardHeader className={"px-0"}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle>Badge Templates</CardTitle>
              <CardDescription className={"hidden"}></CardDescription>
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              <Button
                onClick={openCreateSheet}
                className={"2xl:text-sm 2xl:h-10"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Badge Template
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
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
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No e-badge templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell>{template.name || "N/A"}</TableCell>
                      <TableCell>{formatDate(template.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSheet(template)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(template)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete template"
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
          {totalCount > 1 && (
            <div>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={selectedLimit}
                totalEntries={totalCount}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Badge Template Form Sheet */}
      <EBadgeTemplateFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isSubmitting={editingTemplate ? isUpdating : isCreating}
        initialData={editingTemplate}
        title={
          editingTemplate
            ? "Update E-Badge Template"
            : "Create E-Badge Template"
        }
        description={
          editingTemplate
            ? "Update your e-badge template"
            : "Create a new e-badge template"
        }
        submitButtonText={
          editingTemplate ? "Update Template" : "Create Template"
        }
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteTemplate}
        title={`Delete "${templateToDelete?.name}"`}
        description={`Are you sure you want to delete this e-badge template? This action cannot be undone.`}
      />
    </>
  );
};

export default EBadgeTemplateList;

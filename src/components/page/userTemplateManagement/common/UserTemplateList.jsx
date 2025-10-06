"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/common/pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Paperclip,
  Eye,
} from "lucide-react";
import { getRequest, deleteRequest } from "@/service/viewService";
import { toast } from "sonner";

const UserTemplateList = ({ eventId, templateType }) => {
  const router = useRouter();
  // const templateType = "email";
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

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
        type: templateType,
        eventId: eventId,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`user-templates?${params}`);

      if (response.status === 1) {
        setTemplates(response.data.templates || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteRequest(
        `user-templates/${templateToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("Template deleted successfully");
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push(
      `/dashboard/event-host/${eventId}/${templateType}-management/create`
    );
  };

  const handleEditTemplate = (templateId) => {
    router.push(
      `/dashboard/event-host/${eventId}/${templateType}-management/create/${templateId}`
    );
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
    });
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Templates</CardTitle>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
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

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      {templateType === "email" && (
                        <TableHead>Subject</TableHead>
                      )}
                      <TableHead>Attachments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <TableRow key={template._id}>
                          <TableCell className="font-medium">
                            {template.name}
                          </TableCell>
                          <TableCell>
                            {template.typeId?.typeName || "N/A"}
                          </TableCell>
                          {templateType === "email" && (
                            <TableCell>{template.subject || "N/A"}</TableCell>
                          )}
                          <TableCell>
                            {template.attachments?.length > 0 ? (
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 mr-1" />
                                <span>{template.attachments.length}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                template.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {template.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(template.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTemplate(template._id)}
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
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No templates found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalCount > 1 && (
                <div className="mt-4">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={selectedLimit}
                    totalEntries={totalCount}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteTemplate}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />
    </>
  );
};

export default UserTemplateList;

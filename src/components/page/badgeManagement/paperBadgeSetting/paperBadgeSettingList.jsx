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
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/common/pagination";
import { Plus, Search, Edit, Trash2, Copy, Eye, Loader2, Settings } from "lucide-react";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { PaperBadgeSettingFormSheet } from "./paperBadgeSettingFormSheet";

const PaperBadgeSettingList = ({ eventId }) => {
  const router = useRouter();
  const [settings, setSettings] = useState([]);
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
  const [settingToDelete, setSettingToDelete] = useState(null);
  const [editingSetting, setEditingSetting] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewSetting, setPreviewSetting] = useState(null)
  const [templates, setTemplates] = useState([])
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchSettings();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId: eventId,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`get-paper-badge-settings?${params}`);

      if (response.status === 1) {
        setSettings(response.data.settings || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else {
        toast.error(response?.message || "Failed to fetch paper badge settings");
      }
    } catch (error) {
      console.error("Error fetching paper badge settings:", error);
      toast.error("Failed to fetch paper badge settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetting = async (data) => {
    setIsCreating(true);
    try {
      const payload = {
        name: data.name,
        ticketIds: data.ticketIds,
        eventId: eventId,
        companyId: localStorage.getItem("companyId"),
      };

      const response = await postRequest(`create-paper-badge-setting`, payload);

      if (response.status === 1) {
        toast.success("Paper Badge setting created successfully");
        setIsSheetOpen(false);
        fetchSettings();
      } else {
        toast.error(response?.message || "Failed to create paper badge setting");
      }
    } catch (error) {
      console.error("Error creating paper badge setting:", error);
      toast.error("Failed to create paper badge setting");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSetting = async (data) => {
    if (!editingSetting) return;

    setIsUpdating(true);
    try {
      const payload = {
        name: data.name,
        ticketIds: data.ticketIds,
      };

      const response = await updateRequest(
        `update-paper-badge-setting/${editingSetting._id}`,
        payload
      );

      if (response.status === 1) {
        toast.success("Paper Badge setting updated successfully");
        setIsSheetOpen(false);
        setEditingSetting(null);
        fetchSettings();
      } else {
        toast.error(response?.message || "Failed to update paper badge setting");
      }
    } catch (error) {
      console.error("Error updating paper badge setting:", error);
      toast.error("Failed to update paper badge setting");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSetting = async () => {
    if (!settingToDelete) return;

    try {
      const response = await deleteRequest(
        `delete-paper-badge-setting/${settingToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("Paper Badge setting deleted successfully");
        setIsDeleteDialogOpen(false);
        setSettingToDelete(null);
        fetchSettings();
      } else {
        toast.error(response?.message || "Failed to delete paper badge setting");
      }
    } catch (error) {
      console.error("Error deleting paper badge setting:", error);
      toast.error("Failed to delete paper badge setting");
    }
  };

  const openCreateSheet = () => {
    setEditingSetting(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (setting) => {
    setEditingSetting(setting);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (setting) => {
    setSettingToDelete(setting);
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

  const openEditor = (setting) => {
    setSelectedSetting(setting);
    setIsEditorOpen(true);
  };

  const handleBadgeEditor = (setting) => {
    
    router.push(`/dashboard/paperBadgeSetting/${setting?._id}/builder`);
  };


  return (
    <>
      <Card>
        <CardHeader className={"px-0"}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle>Paper Badge Settings</CardTitle>
              <CardDescription className={"hidden"}>
                Manage paper badge settings for your event
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
                Add Setting
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
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading settings...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : settings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No paper badge settings found
                    </TableCell>
                  </TableRow>
                ) : (
                  settings.map((setting) => (
                    <TableRow key={setting._id}>
                      <TableCell className="font-medium">{setting.name}</TableCell>
                      <TableCell>{formatDate(setting.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBadgeEditor(setting)}
                            title="Open Editor"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditSheet(setting)}
                            title="Edit setting"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(setting)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete setting"
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
          {totalCount > 0 && (
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
        </CardContent>
      </Card>

      {/* Paper Badge Setting Form Sheet */}
      <PaperBadgeSettingFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingSetting(null);
        }}
        onSubmit={editingSetting ? handleUpdateSetting : handleCreateSetting}
        isSubmitting={editingSetting ? isUpdating : isCreating}
        initialData={editingSetting}
        eventId={eventId}
        title={
          editingSetting
            ? "Update Paper Badge Setting"
            : "Create Paper Badge Setting"
        }
        description={
          editingSetting
            ? "Update your paper badge setting"
            : "Create a new paper badge setting"
        }
        submitButtonText={
          editingSetting ? "Update Setting" : "Create Setting"
        }
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSettingToDelete(null);
        }}
        onConfirm={handleDeleteSetting}
        title={`Delete "${settingToDelete?.name}"`}
        description={`Are you sure you want to delete this paper badge setting? This action cannot be undone.`}
      />
    </>
  );
};

export default PaperBadgeSettingList;


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
import { Plus, Search, Edit, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, postRequest, updateRequest, deleteRequest } from "@/service/viewService";
import ExhibitorFormConfigSheet from "./ExhibitorFormConfigSheet";

const ExhibitorFormConfigList = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  // Pagination & search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchConfigs();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await getRequest(`exhibitor-form-configurations?${params}`);
      if (res.status === 1) {
        setConfigs(res.data.configs || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      } else toast.error(res.message || "Failed to fetch configurations");
    } catch (err) {
      toast.error("Failed to fetch configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setIsCreating(true);
    try {
      const res = await postRequest("exhibitor-form-configurations", data);
      if (res.status === 1) {
        toast.success("Configuration created successfully");
        setIsSheetOpen(false);
        fetchConfigs();
      } else toast.error(res.message || "Failed to create configuration");
    } catch {
      toast.error("Failed to create configuration");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingConfig) return;
    setIsUpdating(true);
    try {
      const res = await updateRequest(
        `exhibitor-form-configurations/${editingConfig._id}`,
        data
      );
      if (res.status === 1) {
        toast.success("Configuration updated successfully");
        setIsSheetOpen(false);
        setEditingConfig(null);
        fetchConfigs();
      } else toast.error(res.message || "Failed to update configuration");
    } catch {
      toast.error("Failed to update configuration");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!configToDelete) return;
    try {
      const res = await deleteRequest(
        `exhibitor-form-configurations/${configToDelete._id}`
      );
      if (res.status === 1) {
        toast.success("Configuration deleted");
        fetchConfigs();
      } else toast.error(res.message || "Failed to delete configuration");
    } catch {
      toast.error("Failed to delete configuration");
    } finally {
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center p-0">
          <CardTitle>Exhibitor Form Configurations</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by name" value={searchTerm} onChange={handleSearch} className="!pl-10 w-64" />
            </div>
            <Button onClick={() => { setEditingConfig(null); setIsSheetOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Configuration
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form No</TableHead>
                  <TableHead>Config Name</TableHead>
                  <TableHead>Config Slug</TableHead>
                  <TableHead>Has Particulars</TableHead>
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
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No configurations found
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((cfg) => (
                    <TableRow key={cfg._id}>
                      <TableCell>{cfg.formNo}</TableCell>
                      <TableCell>{cfg.configName}</TableCell>
                      <TableCell>{cfg.configSlug}</TableCell>
                      <TableCell>{cfg.hasParticulars ? "Yes" : "No"}</TableCell>
                      <TableCell>{formatDate(cfg.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(cfg.configSlug)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingConfig(cfg); setIsSheetOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { setConfigToDelete(cfg); setIsDeleteDialogOpen(true); }}
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
      <ExhibitorFormConfigSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={editingConfig ? handleUpdate : handleCreate}
        isSubmitting={editingConfig ? isUpdating : isCreating}
        initialData={editingConfig || undefined}
        title={editingConfig ? "Edit Form Configuration" : "Add New Form Configuration"}
        description={
          editingConfig
            ? "Update the form configuration details."
            : "Create a new exhibitor form configuration."
        }
        submitButtonText={editingConfig ? "Update" : "Create"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${configToDelete?.configName}"`}
        description="This action cannot be undone."
      />
    </>
  );
};

export default ExhibitorFormConfigList;
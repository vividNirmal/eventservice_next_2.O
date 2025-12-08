// components/campaign/UserCampaignList.js
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Play,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, deleteRequest, postRequest } from "@/service/viewService";
import { UserCampaignSheet } from "./UserCampaignSheet";
import { useDebounce } from "@/utils/debounce";

export const UserCampaignList = ({ eventId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, selectedLimit, debouncedSearchTerm]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        eventId,
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await getRequest(`user-campaigns?${params}`);
      if (response.status === 1) {
        setCampaigns(response.data.campaigns || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      } else toast.error(response.message || "Failed to fetch campaigns");
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const openCreateSheet = () => {
    setEditingCampaign(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (campaign) => {
    setEditingCampaign(campaign);
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    try {
      const response = await deleteRequest(`user-campaigns/${campaignToDelete._id}`);
      if (response.status === 1) {
        toast.success("Campaign deleted successfully");
        fetchCampaigns();
      } else toast.error(response.message || "Failed to delete campaign");
    } catch (err) {
      toast.error("Failed to delete campaign");
    } finally {
      setIsDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleSendNow = async (campaignId) => {
    try {
      const response = await postRequest(`user-campaigns/${campaignId}/send-now`);
      if (response.status === 1) {
        toast.success("Campaign sent successfully");
        fetchCampaigns();
      } else toast.error(response.message || "Failed to send campaign");
    } catch (err) {
      toast.error("Failed to send campaign");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      completed: { variant: "success", label: "Completed" },
      failed: { variant: "destructive", label: "Failed" },
      processing: { variant: "secondary", label: "Processing" },
      paused: { variant: "secondary", label: "Paused" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle>Email Campaigns</CardTitle>

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
                Create Campaign
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
                  <TableHead>Template</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign._id}>
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell>
                        {campaign.templateId?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {campaign.scheduled ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{formatDate(campaign.scheduledAt)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-green-600" />
                            <span>Send Immediately</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{campaign.totalContacts || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {campaign.status === "pending" && !campaign.scheduled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendNow(campaign._id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditSheet(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(campaign)}
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

      <UserCampaignSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingCampaign(null);
        }}
        onSuccess={fetchCampaigns}
        initialData={editingCampaign}
        eventId={eventId}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleDelete}
        title={`Delete "${campaignToDelete?.name}"`}
        description="Are you sure you want to delete this campaign? This action cannot be undone."
      />
    </>
  );
};

export default UserCampaignList;
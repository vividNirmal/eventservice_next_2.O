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
import { Search, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest, updateRequest } from "@/service/viewService";
import ExhibitorApplicationPreviewSheet from "./ExhibitorApplicationPreviewSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ExhibitorApplicationList({ eventId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Pagination & search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    if (eventId) {
      fetchApplications();
    }
  }, [currentPage, selectedLimit, searchTerm, eventId]);

  const fetchApplications = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(eventId && { eventId: eventId }),
        ...(companyId && { companyId: companyId }),
      });

      const res = await getRequest(`exhibitor-applications?${params}`);
      if (res.status === 1) {
        setApplications(res.data.applications || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      } else {
        toast.error(res.message || "Failed to fetch applications");
      }
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (application) => {
    setSelectedApplication(application);
    setIsSheetOpen(true);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setStatusLoading(true);
    try {
      const res = await updateRequest(
        `exhibitor-applications-change-satus/${applicationId}`,
        { approved: newStatus }
      );
      
      if (res.status === 1) {
        toast.success(`Application ${newStatus ? 'approved' : 'disapproved'} successfully`);
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, approved: newStatus } : app
          )
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadge = (approved) => {
    return approved ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Approved
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600">
        Pending
      </Badge>
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric", 
      month: "short", 
      day: "numeric",
    });

  // Helper function to extract display values from formData
  const getDisplayValue = (application, fieldKeys) => {
    const formData = application.formData || {};
    for (const key of fieldKeys) {
      if (formData[key]) {
        return formData[key];
      }
    }
    return "N/A";
  };

  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle>Exhibitor Applications</CardTitle>

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
                  placeholder="Search by user email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!eventId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                No event selected. Please select an event to view applications.
              </p>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
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
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      {eventId ? "No applications found" : "Select an event to view applications"}
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        {application.eventUser.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.approved)}
                      </TableCell>
                      <TableCell>{formatDate(application.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePreview(application)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {application.approved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusChange(application._id, false)}
                              disabled={statusLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Disapprove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusChange(application._id, true)}
                              disabled={statusLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
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

      {/* Preview Sheet */}
      <ExhibitorApplicationPreviewSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        application={selectedApplication}
      />
    </>
  );
}
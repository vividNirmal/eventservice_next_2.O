// components/exhibitor/AppliedExhibitorApplications.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Building } from "lucide-react";
import { toast } from "sonner";
import { getRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";


export const AppliedExhibitorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
      });

      const response = await getRequest(`get-exhibitor-applications?${params}`);
      
      if (response.status === 1 && response.data) {
        setApplications(response.data.applications || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      } else {
        toast.error(response.message || "Failed to fetch applications");
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching exhibitor applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentPage, selectedLimit]);

  // Format date to readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge variant
  const getStatusVariant = (approved) => {
    return approved ? "default" : "secondary";
  };

  // Get status text
  const getStatusText = (approved) => {
    return approved ? "Approved" : "Pending";
  };

  // Truncate long text
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "N/A";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading && applications.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-blue-600" />
          Your Exhibitor Applications
        </CardTitle>
      </CardHeader>

      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-600">
              You haven't submitted any exhibitor applications yet.
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Exhibitor Form</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                          <div className="text-sm text-gray-900">
                            {application.exhibitorFormId?.basicInfo?.full_name || "N/A"}
                          </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>
                            {application.exhibitorFormId?.companyId?.company_name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="text-sm text-gray-900">
                            {application.exhibitorFormId?.eventId?.eventName || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(application.approved)}
                          className={
                            application.approved 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {getStatusText(application.approved)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(application.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalCount > selectedLimit && (
              <div className="mt-6">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={selectedLimit}
                  totalEntries={totalCount}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppliedExhibitorApplications;
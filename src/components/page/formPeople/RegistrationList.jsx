"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getRequest, updateRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";

const RegistrationList = ({ eventId, userTypeId }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const limits = [10, 20, 30, 50];

  useEffect(() => {
    if (userTypeId) fetchRegistrations();
  }, [eventId, userTypeId, search, currentPage, limit]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(eventId && { eventId }),
        ...(userTypeId && { userTypeId }),
        ...(search && { search }),
      });

      const response = await getRequest(`form-registration-list?${params}`);
      if (response.status === 1) {
        setRegistrations(response.data.registrations || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      const response = await updateRequest(
        `form-registration-status-change/${registrationId}`,
        { approved: newStatus } // ✅ send boolean
      );
      if (response.status === 1) {
        toast.success(
          `Registration ${newStatus ? "approved" : "disapproved"} successfully`
        );
        fetchRegistrations();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== limit) {
      setLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2 ml-auto mr-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limits.map((l) => (
                  <SelectItem key={l} value={l.toString()}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search user..."
              value={search}
              onChange={handleSearch}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Badge No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg._id}>
                    <TableCell>{reg.email || "N/A"}</TableCell>
                    <TableCell>{reg.badgeNo || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}
                      >
                        {reg.approved === true ? "Approved" : "Not Approved"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(reg.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {reg.approved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusUpdate(reg._id, false)}
                        >
                          Disapprove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusUpdate(reg._id, true)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalCount > 1 && (
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={limit}
            totalEntries={totalCount}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationList;

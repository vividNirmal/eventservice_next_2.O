"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getRequest, deleteRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import moment from "moment";
import { useDebounce } from "@/utils/debounce";

export default function PaymentHistory() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const limits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(search);

  // Get exhibitor ID from localStorage
  const getExhibitorId = () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("loginuser");
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed._id;
      }
    }
    return null;
  };

  // Function to calculate date range based on filter
  const getDateRange = (filter) => {
    const now = moment();
    let startDate, endDate;

    switch (filter) {
      case "all":
        // No date filtering
        return { startDate: null, endDate: null };
      
      case "yesterday":
        startDate = moment().subtract(1, "days").startOf("day").toISOString();
        endDate = moment().subtract(1, "days").endOf("day").toISOString();
        break;
      
      case "week":
        startDate = moment().startOf("week").toISOString();
        endDate = moment().endOf("week").toISOString();
        break;
      
      case "month":
        startDate = moment().startOf("month").toISOString();
        endDate = moment().endOf("month").toISOString();
        break;
      
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [debouncedSearch, currentPage, limit, ownershipFilter]);

  const fetchTeamMembers = async () => {
    const exhibitorId = getExhibitorId();
    if (!exhibitorId) {
      toast.error("Exhibitor ID not found");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add search parameter if exists
      if (search && search.trim() !== "") {
        params.append("search", search.trim());
      }

      // Add date range parameters based on filter
      const { startDate, endDate } = getDateRange(ownershipFilter);
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }

      const response = await getRequest(`get-payment-history?${params}`);

      if (response.status === 1) {
        setTeamMembers(response.data.paymentHistory || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
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

  const handleOwnershipFilterChange = (value) => {
    setOwnershipFilter(value);
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const response = await deleteRequest(
        `event-company-teams/${memberToDelete._id}`
      );
      if (response.status === 1) {
        toast.success("Team member deleted successfully");
        fetchTeamMembers();
      } else {
        toast.error(response.message || "Failed to delete team member");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  return (
    <>
      <Card className={"mx-auto max-w-7xl w-full relative z-20 h-32 grow"}>
        <CardHeader className={"px-0"}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Payment History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className={"grow flex flex-col"}>
          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search Bar */}
              <div className="relative grow min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder="Search by transaction number, payment method..."
                  value={search}
                  onChange={handleSearch}
                  className="!pl-10"
                />
              </div>

              {/* Date Filter */}
              <Select
                value={ownershipFilter}
                onValueChange={handleOwnershipFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Day" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Day</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Show Limit */}
              <div className="flex items-center space-x-2 ml-auto">
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
                  <SelectContent align="end">
                    {limits.map((l) => (
                      <SelectItem key={l} value={l.toString()}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-auto h-32 grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Number</TableHead>
                  <TableHead>Total Pay</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No payment history found
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>{member?.transaction_number || "-"}</TableCell>
                      <TableCell>{member?.total_payable || "-"}</TableCell>
                      <TableCell>{member?.pay_method || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            member?.pay_status === "success"
                              ? "bg-green-100 text-green-800"
                              : member?.pay_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {member?.pay_status || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{member?.pay_mode || "-"}</TableCell>
                      <TableCell>
                        {moment(member?.createdAt).format("DD/MM/YYYY HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalCount > limit && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.first_name}{" "}
              {memberToDelete?.last_name} from your team. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
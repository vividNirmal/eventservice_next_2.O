"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
} from "lucide-react";
import { CustomPagination } from "@/components/common/pagination";
import { getRequest } from "@/service/viewService";
import { toast } from "sonner";
import moment from "moment";

function AdminCompanyTeamsPage({ id }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [companyTeamList, setCompanyTeamList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const dataLimits = [10, 20, 30, 50];

  const fetchCompanyMembers = async () => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-company-team-list?company_id=${id}&page=${currentPage}&pageSize=${selectedLimit}&search=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (res.status === 1) {
        setCompanyTeamList(res.data?.companies || []);
        setTotalUsers(res.data?.totalUsers || 0);
        setTotalPages(res.data?.totalPages || 1);
      } else {
        setCompanyTeamList([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching company members:", error);
      setCompanyTeamList([]);
      setTotalUsers(0);
      setTotalPages(1);
      toast.error("Failed to fetch company members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanyMembers();
    }
  }, [currentPage, selectedLimit, searchTerm, id]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
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

  const getSrNumber = (index) => {
    return (currentPage - 1) * selectedLimit + index + 1;
  };

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-50 mt-4">
      <div className="space-y-4">
        <Card className="gap-0 py-3 shadow-none">
          <CardHeader className="flex flex-wrap items-center px-3 gap-3">
            <CardTitle>Company Members List</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  onChange={(e) => handleSearchChange(e.target.value)}
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
          </CardHeader>
          <CardContent></CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Email/Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyTeamList.length > 0 ? (
                    companyTeamList.map((member, index) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10">
                              {member.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={member.profile_picture}
                                  alt={`${member.first_name} ${member.last_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {member.first_name?.charAt(0)}
                                    {member.last_name?.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.ownership}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.contact_no}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">
                                E:
                              </strong>
                              <span className="ml-1">{member.email}</span>
                            </div>
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">
                                M:
                              </strong>
                              <span className="ml-1">{member.contact_no}</span>
                            </div>
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">
                                P:
                              </strong>
                              <span className="ml-1">{member.passport_no}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href="#" className="underline text-blue-600">
                            {member.admin_company_id?.company_name || "N/A"}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="border-b border-dotted border-gray-300 pb-1 block">
                              {member.address_one}
                            </span>
                            <span className="pt-1 block">
                              {member.address_two}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {moment(member.createdAt).format("D/MM/YYYY")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {moment(member.updatedAt).format("D/MM/YYYY")}
                          </div>
                        </TableCell>    
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Record Not Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalUsers > 0 && (
              <div className="mt-4">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={selectedLimit}
                  totalEntries={totalUsers}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default AdminCompanyTeamsPage;
